#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CONFIG_DIR="$ROOT_DIR/ops/config"
LOG_DIR="$ROOT_DIR/var/logs"
BACKUP_DIR_DEFAULT="/opt/util/cubrid/11.2/backup/sql"
BACKUP_DIR_FALLBACK="$ROOT_DIR/var/backups/db-sync"
BACKUP_DIR="${BACKUP_DIR:-$BACKUP_DIR_DEFAULT}"
TMP_DIR="$ROOT_DIR/var/tmp"
LOG_FILE="$LOG_DIR/windows-db-sync-push-and-fresh-deploy-221.log"
JDBC_JAR_DEFAULT="$HOME/.m2/repository/cubrid/cubrid-jdbc/11.2.0.0035/cubrid-jdbc-11.2.0.0035.jar"

mkdir -p "$LOG_DIR" "$TMP_DIR"
if ! mkdir -p "$BACKUP_DIR" 2>/dev/null; then
  BACKUP_DIR="$BACKUP_DIR_FALLBACK"
  mkdir -p "$BACKUP_DIR"
fi
exec > >(tee -a "$LOG_FILE") 2>&1

load_optional_env() {
  local env_file="$1"
  if [[ -f "$env_file" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$env_file"
    set +a
  fi
}

load_optional_env "$CONFIG_DIR/carbonet-18000.env"
load_optional_env "$CONFIG_DIR/deploy-automation.env"

JDBC_JAR="${JDBC_JAR:-$JDBC_JAR_DEFAULT}"
LOCAL_DB_HOST="${LOCAL_DB_HOST:-${CUBRID_HOST:-127.0.0.1}}"
LOCAL_DB_PORT="${LOCAL_DB_PORT:-${CUBRID_PORT:-33000}}"
LOCAL_DB_NAME="${LOCAL_DB_NAME:-${CUBRID_DB:-carbonet}}"
LOCAL_DB_USER="${LOCAL_DB_USER:-${CUBRID_USER:-dba}}"
LOCAL_DB_PASSWORD="${LOCAL_DB_PASSWORD:-${CUBRID_PASSWORD:-}}"
LOCAL_DB_URL="${LOCAL_DB_URL:-jdbc:cubrid:${LOCAL_DB_HOST}:${LOCAL_DB_PORT}:${LOCAL_DB_NAME}:::?charset=UTF-8}"

REMOTE_DB_SSH_USER="${REMOTE_DB_SSH_USER:-${REMOTE_CUBRID_SSH_USER:-}}"
REMOTE_DB_SSH_HOST="${REMOTE_DB_SSH_HOST:-${REMOTE_CUBRID_SSH_HOST:-}}"
REMOTE_DB_SSH_PORT="${REMOTE_DB_SSH_PORT:-${REMOTE_CUBRID_SSH_PORT:-22}}"
REMOTE_DB_SSH_PASSWORD="${REMOTE_DB_SSH_PASSWORD:-${REMOTE_CUBRID_SSH_PASSWORD:-}}"
REMOTE_DB_HOST="${REMOTE_DB_HOST:-127.0.0.1}"
REMOTE_DB_PORT="${REMOTE_DB_PORT:-${CUBRID_PORT:-33000}}"
REMOTE_DB_NAME="${REMOTE_DB_NAME:-${LOCAL_DB_NAME}}"
REMOTE_DB_USER="${REMOTE_DB_USER:-${LOCAL_DB_USER}}"
REMOTE_DB_PASSWORD="${REMOTE_DB_PASSWORD:-${LOCAL_DB_PASSWORD}}"
REMOTE_DB_URL="${REMOTE_DB_URL:-jdbc:cubrid:127.0.0.1:${REMOTE_DB_PORT}000:${REMOTE_DB_NAME}:::?charset=UTF-8}"
REMOTE_DB_TUNNEL_PORT="${REMOTE_DB_TUNNEL_PORT:-13300}"
APPLY_MODE="${APPLY_MODE:-sql-files}"
SQL_FILE_LIST_DEFAULT="$ROOT_DIR/docs/sql/20260409_admin_project_version_management_menu.sql:$ROOT_DIR/docs/sql/project_version_governance_schema.sql:$ROOT_DIR/docs/sql/platform_control_plane_schema.sql"
SQL_FILE_LIST="${SQL_FILE_LIST:-$SQL_FILE_LIST_DEFAULT}"

GITHUB_TOKEN="${GITHUB_TOKEN:-${BACKUP_GIT_AUTH_TOKEN:-}}"
GIT_REMOTE_NAME="${GIT_REMOTE_NAME:-origin}"
GIT_BRANCH="${GIT_BRANCH:-$(git -C "$ROOT_DIR" branch --show-current)}"
COMMIT_MESSAGE="${COMMIT_MESSAGE:-chore: automated db sync and deploy $(date '+%Y-%m-%d %H:%M:%S')}"

MAIN_REMOTE_USER="${MAIN_REMOTE_USER:-carbonet2026}"
MAIN_REMOTE_HOST="${MAIN_REMOTE_HOST:-136.117.100.221}"
MAIN_REMOTE_PORT="${MAIN_REMOTE_PORT:-22}"
MAIN_REMOTE_PASSWORD="${MAIN_REMOTE_PASSWORD:-}"
MAIN_REMOTE_ROOT="${MAIN_REMOTE_ROOT:-/opt/projects/carbonet}"
MAIN_TARGET="${MAIN_REMOTE_USER}@${MAIN_REMOTE_HOST}"
REPO_URL="${REPO_URL:-$(git -C "$ROOT_DIR" remote get-url "$GIT_REMOTE_NAME")}"

DB_SNAPSHOT_FILE="$BACKUP_DIR/local-db-snapshot-$(date '+%Y%m%d-%H%M%S').sql"
SNAPSHOT_FILE="${SNAPSHOT_FILE:-$DB_SNAPSHOT_FILE}"
SKIP_LOCAL_DB_SNAPSHOT="${SKIP_LOCAL_DB_SNAPSHOT:-false}"
SKIP_GIT_PUSH="${SKIP_GIT_PUSH:-false}"
SKIP_REMOTE_DEPLOY="${SKIP_REMOTE_DEPLOY:-false}"
JAVA_TOOL_SRC="$TMP_DIR/CarbonetJdbcSnapshotTool.java"
JAVA_TOOL_CLASS="$TMP_DIR/CarbonetJdbcSnapshotTool.class"
REMOTE_DB_SSH_PID=""

log() {
  printf '[windows-db-sync-push-and-fresh-deploy-221] %s\n' "$*"
}

fail() {
  printf '[windows-db-sync-push-and-fresh-deploy-221] ERROR: %s\n' "$*" >&2
  exit 1
}

require_command() {
  local cmd="$1"
  command -v "$cmd" >/dev/null 2>&1 || fail "missing required command: $cmd"
}

require_env() {
  local env_name="$1"
  [[ -n "${!env_name:-}" ]] || fail "missing required env: $env_name"
}

cleanup() {
  if [[ -n "${REMOTE_DB_SSH_PID:-}" ]] && kill -0 "$REMOTE_DB_SSH_PID" 2>/dev/null; then
    kill "$REMOTE_DB_SSH_PID" 2>/dev/null || true
    wait "$REMOTE_DB_SSH_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT

build_git_extraheader() {
  if [[ -z "${GITHUB_TOKEN:-}" ]]; then
    return 0
  fi
  printf 'AUTHORIZATION: basic %s' "$(printf 'x-access-token:%s' "$GITHUB_TOKEN" | base64 -w0)"
}

build_authenticated_repo_url() {
  local repo_url="$1"
  if [[ -z "${GITHUB_TOKEN:-}" ]]; then
    printf '%s' "$repo_url"
    return 0
  fi

  if [[ "$repo_url" =~ ^https://github\.com/(.+)$ ]]; then
    printf 'https://x-access-token:%s@github.com/%s' "$GITHUB_TOKEN" "${BASH_REMATCH[1]}"
    return 0
  fi

  printf '%s' "$repo_url"
}

ensure_java_tool() {
  [[ -f "$JDBC_JAR" ]] || fail "CUBRID JDBC jar not found: $JDBC_JAR"

  cat >"$JAVA_TOOL_SRC" <<'EOF'
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
EOF

  javac -cp "$JDBC_JAR" -d "$TMP_DIR" "$JAVA_TOOL_SRC"
}

run_java_tool() {
  local mode="$1"
  local db_url="$2"
  local db_user="$3"
  local db_password="$4"
  local file_path="$5"
  local extra_arg="${6:-}"

  CARBONET_DB_URL="$db_url" \
  CARBONET_DB_USER="$db_user" \
  CARBONET_DB_PASSWORD="$db_password" \
    java -cp "$TMP_DIR:$JDBC_JAR" CarbonetJdbcSnapshotTool "$mode" "$file_path" ${extra_arg:+"$extra_arg"}
}

remote_db_ssh_cmd() {
  require_env "REMOTE_DB_SSH_USER"
  require_env "REMOTE_DB_SSH_HOST"
  require_env "REMOTE_DB_SSH_PASSWORD"
  sshpass -p "$REMOTE_DB_SSH_PASSWORD" ssh \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    -p "$REMOTE_DB_SSH_PORT" \
    "${REMOTE_DB_SSH_USER}@${REMOTE_DB_SSH_HOST}" \
    "$@"
}

remote_db_scp_cmd() {
  require_env "REMOTE_DB_SSH_USER"
  require_env "REMOTE_DB_SSH_HOST"
  require_env "REMOTE_DB_SSH_PASSWORD"
  sshpass -p "$REMOTE_DB_SSH_PASSWORD" scp \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    -P "$REMOTE_DB_SSH_PORT" \
    "$@"
}

remote_table_exists_via_csql() {
  local table_name="$1"
  local remote_sql="/tmp/check-table-$$.sql"
  local output=""
  output="$(
    remote_db_ssh_cmd "cat <<'SQL' > '$remote_sql'
SELECT class_name
FROM db_class
WHERE class_name = '${table_name,,}';
SQL
/opt/util/cubrid/11.2/scripts/csql_local.sh -u \"$REMOTE_DB_USER\" \"$REMOTE_DB_NAME\" < '$remote_sql' 2>/dev/null; rm -f '$remote_sql'" || true
  )"
  [[ "$output" == *"'${table_name,,}'"* ]]
}

should_skip_remote_sql_file() {
  local sql_file="$1"
  local base_name=""
  base_name="$(basename "$sql_file")"

  case "$base_name" in
    platform_control_plane_schema.sql)
      if remote_table_exists_via_csql "PROJECT_REGISTRY"; then
        log "remote SQL skipped because PROJECT_REGISTRY already exists: $sql_file"
        return 0
      fi
      ;;
    project_version_governance_schema.sql)
      if remote_table_exists_via_csql "ADAPTER_CHANGE_LOG" && remote_table_exists_via_csql "RELEASE_UNIT_REGISTRY" && remote_table_exists_via_csql "SERVER_DEPLOYMENT_STATE"; then
        log "remote SQL skipped because governance tables already exist: $sql_file"
        return 0
      fi
      ;;
  esac

  return 1
}

backup_local_db() {
  if [[ "$SKIP_LOCAL_DB_SNAPSHOT" == "true" ]]; then
    [[ -f "$SNAPSHOT_FILE" ]] || fail "snapshot file not found for reuse: $SNAPSHOT_FILE"
    log "local DB snapshot skipped; reusing: $SNAPSHOT_FILE"
    publish_snapshot_aliases
    return 0
  fi

  log "local DB snapshot started"
  run_java_tool dump "$LOCAL_DB_URL" "$LOCAL_DB_USER" "$LOCAL_DB_PASSWORD" "$SNAPSHOT_FILE"
  log "local DB snapshot completed: $SNAPSHOT_FILE"
  publish_snapshot_aliases
}

publish_snapshot_aliases() {
  local latest_link="$BACKUP_DIR/latest-local-db-snapshot.sql"
  [[ -f "$SNAPSHOT_FILE" ]] || return 0

  ln -sfn "$SNAPSHOT_FILE" "$latest_link"
  log "latest snapshot alias updated: $latest_link -> $SNAPSHOT_FILE"
}

open_remote_db_tunnel() {
  require_env "REMOTE_DB_SSH_USER"
  require_env "REMOTE_DB_SSH_HOST"
  require_env "REMOTE_DB_SSH_PASSWORD"

  log "remote DB tunnel started: 127.0.0.1:${REMOTE_DB_TUNNEL_PORT} -> ${REMOTE_DB_HOST}:${REMOTE_DB_PORT}"
  sshpass -p "$REMOTE_DB_SSH_PASSWORD" ssh \
    -N \
    -L "${REMOTE_DB_TUNNEL_PORT}:${REMOTE_DB_HOST}:${REMOTE_DB_PORT}" \
    -o ExitOnForwardFailure=yes \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    -p "$REMOTE_DB_SSH_PORT" \
    "${REMOTE_DB_SSH_USER}@${REMOTE_DB_SSH_HOST}" &
  REMOTE_DB_SSH_PID=$!
  sleep 3
  kill -0 "$REMOTE_DB_SSH_PID" 2>/dev/null || fail "remote DB tunnel failed"
}

apply_snapshot_to_remote_db() {
  local remote_url="jdbc:cubrid:127.0.0.1:${REMOTE_DB_TUNNEL_PORT}:${REMOTE_DB_NAME}:::?charset=UTF-8"
  log "remote DB apply started"
  run_java_tool run "$remote_url" "$REMOTE_DB_USER" "$REMOTE_DB_PASSWORD" "$SNAPSHOT_FILE"
  log "remote DB apply completed"
}

remote_table_exists() {
  local table_name="$1"
  local remote_url="jdbc:cubrid:127.0.0.1:${REMOTE_DB_TUNNEL_PORT}:${REMOTE_DB_NAME}:::?charset=UTF-8"
  if run_java_tool table-exists "$remote_url" "$REMOTE_DB_USER" "$REMOTE_DB_PASSWORD" /dev/null "$table_name" >/dev/null 2>&1; then
    return 0
  fi
  return 1
}

bootstrap_remote_schema_if_needed() {
  local remote_url="jdbc:cubrid:127.0.0.1:${REMOTE_DB_TUNNEL_PORT}:${REMOTE_DB_NAME}:::?charset=UTF-8"
  local schema_file="$ROOT_DIR/docs/sql/20260328_ip_whitelist_persistence.sql"

  if remote_table_exists "COMTNIPWHITELISTRULE"; then
    log "remote schema already has COMTNIPWHITELISTRULE"
    return 0
  fi

  [[ -f "$schema_file" ]] || fail "missing schema bootstrap file: $schema_file"
  log "remote schema missing COMTNIPWHITELISTRULE; applying bootstrap schema"
  run_java_tool run "$remote_url" "$REMOTE_DB_USER" "$REMOTE_DB_PASSWORD" "$schema_file"
  log "remote schema bootstrap completed"
}

parse_sql_file_list() {
  IFS=':' read -r -a SQL_FILES <<< "$SQL_FILE_LIST"
  if [[ "${#SQL_FILES[@]}" -eq 0 ]]; then
    fail "no SQL files configured"
  fi
}

apply_configured_sql_files_to_remote_db() {
  local sql_file=""
  local remote_tmp=""
  local remote_target=""
  local remote_log=""

  parse_sql_file_list
  for sql_file in "${SQL_FILES[@]}"; do
    [[ -f "$sql_file" ]] || fail "SQL file not found: $sql_file"
    if should_skip_remote_sql_file "$sql_file"; then
      continue
    fi
    log "remote DB apply SQL started: $sql_file"
    remote_tmp="/tmp/$(basename "$sql_file")"
    remote_log="/tmp/$(basename "$sql_file").log"
    remote_target="${REMOTE_DB_SSH_USER}@${REMOTE_DB_SSH_HOST}:${remote_tmp}"
    remote_db_scp_cmd "$sql_file" "$remote_target"
    remote_db_ssh_cmd "bash -lc 'set -o pipefail; /opt/util/cubrid/11.2/scripts/csql_local.sh -u \"$REMOTE_DB_USER\" \"$REMOTE_DB_NAME\" < \"$remote_tmp\" 2>&1 | tee \"$remote_log\"; status=\${PIPESTATUS[0]}; if grep -Eq \"SYNTAX ERROR|^ERROR:|Semantic:\" \"$remote_log\"; then exit 1; fi; rm -f \"$remote_tmp\" \"$remote_log\"; exit \$status'"
    log "remote DB apply SQL completed: $sql_file"
  done
}

commit_and_push_all() {
  if [[ "$SKIP_GIT_PUSH" == "true" ]]; then
    log "git add/commit/push skipped by SKIP_GIT_PUSH=true"
    return 0
  fi

  local push_url=""

  log "git add started"
  git -C "$ROOT_DIR" add -A -- . \
    ':(exclude).codex/config.toml' \
    ':(exclude)apps/carbonet-app/target'

  if git -C "$ROOT_DIR" diff --cached --quiet; then
    log "no staged changes; commit skipped"
  else
    log "git commit started"
    git -C "$ROOT_DIR" commit -m "$COMMIT_MESSAGE"
  fi

  push_url="$(build_authenticated_repo_url "$REPO_URL")"
  if [[ "$push_url" != "$REPO_URL" ]]; then
    log "git push started with token url auth"
    git -C "$ROOT_DIR" push "$push_url" "$GIT_BRANCH"
    return 0
  fi

  log "git push started without token override"
  git -C "$ROOT_DIR" push "$GIT_REMOTE_NAME" "$GIT_BRANCH"
}

run_remote_clone_and_restart() {
  if [[ "$SKIP_REMOTE_DEPLOY" == "true" ]]; then
    log "221 fresh clone/build/restart skipped by SKIP_REMOTE_DEPLOY=true"
    return 0
  fi

  local clone_url=""
  local remote_script=""
  local mosh_ssh=""
  local mosh_server_cmd=""

  require_env "MAIN_REMOTE_PASSWORD"

  clone_url="$(build_authenticated_repo_url "$REPO_URL")"
  mosh_ssh="sshpass -p '$MAIN_REMOTE_PASSWORD' ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p $MAIN_REMOTE_PORT"

  remote_script=$(cat <<EOF
set -euo pipefail
REMOTE_ROOT='$MAIN_REMOTE_ROOT'
BACKUP_ROOT="/tmp/carbonet-preclone-backup-\$(date '+%Y%m%d-%H%M%S')"
mkdir -p "\$BACKUP_ROOT/ops-config"
if [ -d "\$REMOTE_ROOT/ops/config" ]; then
  find "\$REMOTE_ROOT/ops/config" -maxdepth 1 -type f -name '*.env' -exec cp {} "\$BACKUP_ROOT/ops-config/" \;
  if [ -d "\$REMOTE_ROOT/ops/config/certs" ]; then
    cp -a "\$REMOTE_ROOT/ops/config/certs" "\$BACKUP_ROOT/ops-config/"
  fi
fi
rm -rf "\$REMOTE_ROOT"
mkdir -p "\$(dirname "\$REMOTE_ROOT")"
EOF
)

  remote_script+=$'\n'
  remote_script+="git clone --branch '$GIT_BRANCH' --single-branch '$clone_url' \"\$REMOTE_ROOT\""

  remote_script+=$'\n'
  remote_script+=$(cat <<EOF
mkdir -p "\$REMOTE_ROOT/ops/config"
if [ -d "\$BACKUP_ROOT/ops-config" ]; then
  cp -a "\$BACKUP_ROOT/ops-config/." "\$REMOTE_ROOT/ops/config/"
fi
cd "\$REMOTE_ROOT"
if command -v npm >/dev/null 2>&1; then
  bash ops/scripts/build-restart-18000.sh
else
  echo "[windows-db-sync-push-and-fresh-deploy-221] npm not found on remote; running backend package + runtime restart"
  mvn -q -pl apps/carbonet-app -am -DskipTests package
  bash ops/scripts/restart-18000-runtime.sh
fi
VERIFY_WAIT_SECONDS=20 bash ops/scripts/codex-verify-18000-freshness.sh
EOF
)

  log "221 fresh clone/build/restart started"
  mosh_server_cmd="bash -lc $(printf '%q' "$remote_script")"
  if MOSH_SSH="$mosh_ssh" mosh --no-init "$MAIN_TARGET" --server="$mosh_server_cmd"; then
    log "221 deploy completed over mosh"
    return 0
  fi

  log "mosh batch execution failed; falling back to ssh"
  sshpass -p "$MAIN_REMOTE_PASSWORD" ssh \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    -p "$MAIN_REMOTE_PORT" \
    "$MAIN_TARGET" \
    "bash -lc $(printf '%q' "$remote_script")"
  log "221 deploy completed over ssh fallback"
}

main() {
  log "started at $(date '+%Y-%m-%d %H:%M:%S')"
  require_command git
  require_command javac
  require_command java
  require_command sshpass
  require_command ssh
  require_command mosh

  [[ -n "$GIT_BRANCH" ]] || fail "could not resolve current git branch"

  ensure_java_tool
  if [[ "$APPLY_MODE" == "snapshot" ]]; then
    backup_local_db
    open_remote_db_tunnel
    bootstrap_remote_schema_if_needed
    apply_snapshot_to_remote_db
  else
    apply_configured_sql_files_to_remote_db
  fi
  commit_and_push_all
  run_remote_clone_and_restart

  log "completed at $(date '+%Y-%m-%d %H:%M:%S')"
  log "db snapshot file: $SNAPSHOT_FILE"
  log "full log file: $LOG_FILE"
}

main "$@"
