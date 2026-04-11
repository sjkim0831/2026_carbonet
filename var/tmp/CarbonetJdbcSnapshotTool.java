import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

public class CarbonetJdbcSnapshotTool {
  public static void main(String[] args) throws Exception {
    if (args.length < 2) {
      throw new IllegalArgumentException("Usage: CarbonetJdbcSnapshotTool <dump|run> <file>");
    }

    String mode = args[0];
    Path file = Path.of(args[1]);
    String url = env("CARBONET_DB_URL", "jdbc:cubrid:127.0.0.1:33000:carbonet:::?charset=UTF-8");
    String user = env("CARBONET_DB_USER", "dba");
    String password = env("CARBONET_DB_PASSWORD", "");

    Class.forName("cubrid.jdbc.driver.CUBRIDDriver");
    try (Connection connection = DriverManager.getConnection(url, user, password)) {
      if ("dump".equals(mode)) {
        dumpDatabase(connection, file);
        return;
      }
      if ("table-exists".equals(mode)) {
        String tableName = args.length >= 3 ? args[2] : "";
        if (tableName.isBlank()) {
          throw new IllegalArgumentException("table-exists requires <tableName>");
        }
        boolean exists = tableExists(connection, tableName);
        System.out.println(exists ? "EXISTS" : "MISSING");
        if (!exists) {
          System.exit(3);
        }
        return;
      }
      if ("run".equals(mode)) {
        runSqlFile(connection, file);
        return;
      }
      throw new IllegalArgumentException("Unsupported mode: " + mode);
    }
  }

  private static String env(String key, String fallback) {
    String value = System.getenv(key);
    return value == null || value.isBlank() ? fallback : value;
  }

  private static void dumpDatabase(Connection connection, Path file) throws Exception {
    List<String> tables = loadUserTables(connection);
    Map<String, Set<String>> dependencies = loadDependencies(connection, tables);
    List<String> insertOrder = topoSort(tables, dependencies);
    List<String> deleteOrder = new ArrayList<>(insertOrder);
    java.util.Collections.reverse(deleteOrder);

    System.out.println("[CarbonetJdbcSnapshotTool] dump start file=" + file);
    System.out.println("[CarbonetJdbcSnapshotTool] user table count=" + tables.size());

    try (BufferedWriter writer = Files.newBufferedWriter(file)) {
      writer.write("-- Carbonet JDBC snapshot\n");
      writer.write("-- generatedAt=" + LocalDateTime.now() + "\n");
      writer.write("-- tableCount=" + tables.size() + "\n\n");

      for (String table : deleteOrder) {
        writer.write("DELETE FROM " + quoteIdentifier(table) + ";\n");
      }
      writer.write("\n");

      for (int index = 0; index < insertOrder.size(); index++) {
        String table = insertOrder.get(index);
        System.out.println("[CarbonetJdbcSnapshotTool] dump table " + (index + 1) + "/" + insertOrder.size() + ": " + table);
        int rowCount = dumpTable(connection, table, writer);
        System.out.println("[CarbonetJdbcSnapshotTool] dump table complete " + table + " rows=" + rowCount);
      }

      System.out.println("[CarbonetJdbcSnapshotTool] dump complete file=" + file);
    }
  }

  private static List<String> loadUserTables(Connection connection) throws SQLException {
    DatabaseMetaData meta = connection.getMetaData();
    Set<String> tables = new LinkedHashSet<>();
    try (ResultSet rs = meta.getTables(null, null, "%", new String[] {"TABLE"})) {
      while (rs.next()) {
        String name = rs.getString("TABLE_NAME");
        if (name == null || name.isBlank()) {
          continue;
        }
        String lower = name.toLowerCase(Locale.ROOT);
        if (lower.startsWith("db_")) {
          continue;
        }
        tables.add(name);
      }
    }
    List<String> ordered = new ArrayList<>(tables);
    ordered.sort(Comparator.naturalOrder());
    return ordered;
  }

  private static boolean tableExists(Connection connection, String tableName) throws SQLException {
    DatabaseMetaData meta = connection.getMetaData();
    List<String> candidates = new ArrayList<>();
    candidates.add(tableName);
    if (tableName.contains(".")) {
      candidates.add(tableName.substring(tableName.indexOf('.') + 1));
    }

    for (String candidate : candidates) {
      try (ResultSet rs = meta.getTables(null, null, candidate, new String[] {"TABLE"})) {
        if (rs.next()) {
          return true;
        }
      }
      try (ResultSet rs = meta.getTables(null, null, candidate.toUpperCase(Locale.ROOT), new String[] {"TABLE"})) {
        if (rs.next()) {
          return true;
        }
      }
    }
    return false;
  }

  private static Map<String, Set<String>> loadDependencies(Connection connection, List<String> tables) throws SQLException {
    DatabaseMetaData meta = connection.getMetaData();
    Set<String> tableSet = new HashSet<>(tables);
    Map<String, Set<String>> dependencies = new LinkedHashMap<>();
    for (String table : tables) {
      dependencies.put(table, new LinkedHashSet<>());
      try (ResultSet rs = meta.getImportedKeys(null, null, table)) {
        while (rs.next()) {
          String parent = rs.getString("PKTABLE_NAME");
          if (parent != null && tableSet.contains(parent) && !Objects.equals(parent, table)) {
            dependencies.get(table).add(parent);
          }
        }
      }
    }
    return dependencies;
  }

  private static List<String> topoSort(List<String> tables, Map<String, Set<String>> dependencies) {
    Map<String, Integer> indegree = new HashMap<>();
    Map<String, Set<String>> reverse = new HashMap<>();
    for (String table : tables) {
      indegree.put(table, 0);
      reverse.put(table, new LinkedHashSet<>());
    }
    for (Map.Entry<String, Set<String>> entry : dependencies.entrySet()) {
      String table = entry.getKey();
      for (String dependency : entry.getValue()) {
        indegree.put(table, indegree.get(table) + 1);
        reverse.get(dependency).add(table);
      }
    }

    ArrayDeque<String> queue = new ArrayDeque<>();
    tables.stream().filter(t -> indegree.get(t) == 0).sorted().forEach(queue::add);

    List<String> ordered = new ArrayList<>();
    while (!queue.isEmpty()) {
      String current = queue.removeFirst();
      ordered.add(current);
      List<String> children = new ArrayList<>(reverse.get(current));
      children.sort(Comparator.naturalOrder());
      for (String child : children) {
        int next = indegree.get(child) - 1;
        indegree.put(child, next);
        if (next == 0) {
          queue.addLast(child);
        }
      }
    }

    if (ordered.size() == tables.size()) {
      return ordered;
    }

    Set<String> unresolved = new LinkedHashSet<>(tables);
    unresolved.removeAll(ordered);
    List<String> remainder = new ArrayList<>(unresolved);
    remainder.sort(Comparator.naturalOrder());
    ordered.addAll(remainder);
    return ordered;
  }

  private static int dumpTable(Connection connection, String table, BufferedWriter writer) throws Exception {
    String sql = "SELECT * FROM " + quoteIdentifier(table);
    try (PreparedStatement ps = connection.prepareStatement(sql);
         ResultSet rs = ps.executeQuery()) {
      ResultSetMetaData md = rs.getMetaData();
      int columnCount = md.getColumnCount();
      List<String> columns = new ArrayList<>();
      for (int index = 1; index <= columnCount; index++) {
        columns.add(md.getColumnLabel(index));
      }

      writer.write("-- table=" + table + "\n");
      int rowCount = 0;
      while (rs.next()) {
        rowCount++;
        writer.write("INSERT INTO " + quoteIdentifier(table) + " (");
        for (int index = 0; index < columns.size(); index++) {
          if (index > 0) {
            writer.write(", ");
          }
          writer.write(quoteIdentifier(columns.get(index)));
        }
        writer.write(") VALUES (");
        for (int index = 1; index <= columnCount; index++) {
          if (index > 1) {
            writer.write(", ");
          }
          writer.write(renderValue(rs.getObject(index)));
        }
        writer.write(");\n");

        if (rowCount % 1000 == 0) {
          System.out.println("[CarbonetJdbcSnapshotTool] dump table progress " + table + " rows=" + rowCount);
        }
      }
      writer.write("-- rows=" + rowCount + "\n\n");
      return rowCount;
    }
  }

  private static String renderValue(Object value) {
    if (value == null) {
      return "NULL";
    }
    if (value instanceof Number && !(value instanceof BigDecimal)) {
      return value.toString();
    }
    if (value instanceof BigDecimal) {
      return ((BigDecimal) value).toPlainString();
    }
    if (value instanceof Boolean) {
      return ((Boolean) value) ? "1" : "0";
    }
    if (value instanceof Timestamp) {
      return "'" + escapeSql(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS").format((Timestamp) value)) + "'";
    }
    if (value instanceof java.sql.Date) {
      return "'" + escapeSql(value.toString()) + "'";
    }
    if (value instanceof Date) {
      return "'" + escapeSql(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format((Date) value)) + "'";
    }
    if (value instanceof byte[]) {
      return "NULL";
    }
    return "'" + escapeSql(String.valueOf(value)) + "'";
  }

  private static String escapeSql(String value) {
    return value
      .replace("\\", "\\\\")
      .replace("'", "''");
  }

  private static String quoteIdentifier(String value) {
    return "\"" + value.replace("\"", "\"\"") + "\"";
  }

  private static void runSqlFile(Connection connection, Path file) throws Exception {
    connection.setAutoCommit(false);
    System.out.println("[CarbonetJdbcSnapshotTool] run start file=" + file);
    try (Statement statement = connection.createStatement()) {
      int index = 0;
      try (BufferedReader reader = Files.newBufferedReader(file)) {
        StringBuilder current = new StringBuilder();
        boolean inString = false;
        String line;
        while ((line = reader.readLine()) != null) {
          String trimmedLine = line.trim();
          if (!inString && (trimmedLine.isEmpty() || trimmedLine.startsWith("--"))) {
            continue;
          }

          current.append(line).append('\n');
          for (int i = 0; i < line.length(); i++) {
            char ch = line.charAt(i);
            char next = i + 1 < line.length() ? line.charAt(i + 1) : '\0';
            if (ch == '\'') {
              if (next == '\'') {
                i++;
                continue;
              }
              inString = !inString;
            }
          }

          if (!inString && endsWithStatementTerminator(current)) {
            String sql = trimTerminator(current.toString().trim());
            current.setLength(0);
            if (sql.isEmpty()) {
              continue;
            }
            index++;
            if (index <= 20 || index % 1000 == 0) {
              System.out.println("[CarbonetJdbcSnapshotTool] statement " + index);
            }
            boolean hasResult = statement.execute(sql);
            if (hasResult) {
              try (ResultSet rs = statement.getResultSet()) {
                int rowCount = 0;
                while (rs.next()) {
                  rowCount++;
                }
                if (index <= 20 || index % 1000 == 0) {
                  System.out.println("[CarbonetJdbcSnapshotTool] resultRows=" + rowCount);
                }
              }
            } else {
              int updated = statement.getUpdateCount();
              if (updated >= 0 && (index <= 20 || index % 1000 == 0)) {
                System.out.println("[CarbonetJdbcSnapshotTool] updated=" + updated);
              }
            }
          }
        }
        if (current.toString().trim().length() > 0) {
          String sql = trimTerminator(current.toString().trim());
          index++;
          System.out.println("[CarbonetJdbcSnapshotTool] statement " + index);
          boolean hasResult = statement.execute(sql);
          if (hasResult) {
            try (ResultSet rs = statement.getResultSet()) {
              int rowCount = 0;
              while (rs.next()) {
                rowCount++;
              }
              System.out.println("[CarbonetJdbcSnapshotTool] resultRows=" + rowCount);
            }
          } else {
            int updated = statement.getUpdateCount();
            if (updated >= 0) {
              System.out.println("[CarbonetJdbcSnapshotTool] updated=" + updated);
            }
          }
        }
      }
      connection.commit();
      System.out.println("[CarbonetJdbcSnapshotTool] statements total=" + index);
      System.out.println("[CarbonetJdbcSnapshotTool] COMMIT");
    } catch (Exception ex) {
      connection.rollback();
      System.out.println("[CarbonetJdbcSnapshotTool] ROLLBACK due to: " + ex);
      throw ex;
    }
  }

  private static boolean endsWithStatementTerminator(StringBuilder current) {
    int index = current.length() - 1;
    while (index >= 0 && Character.isWhitespace(current.charAt(index))) {
      index--;
    }
    return index >= 0 && current.charAt(index) == ';';
  }

  private static String trimTerminator(String sql) {
    int index = sql.length() - 1;
    while (index >= 0 && Character.isWhitespace(sql.charAt(index))) {
      index--;
    }
    if (index >= 0 && sql.charAt(index) == ';') {
      return sql.substring(0, index).trim();
    }
    return sql;
  }
}
