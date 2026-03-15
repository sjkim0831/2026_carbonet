package egovframework.com.feature.admin.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.feature.admin.model.vo.SrTicketRecordVO;
import egovframework.com.feature.admin.model.vo.SrTicketRunnerExecutionVO;
import egovframework.com.feature.admin.service.SrTicketCodexRunnerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

@Service("srTicketCodexRunnerService")
@Slf4j
public class SrTicketCodexRunnerServiceImpl implements SrTicketCodexRunnerService {

    private static final DateTimeFormatter TS_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final String DEFAULT_HISTORY_FILE = "/tmp/carbonet-sr-codex-runner-history.jsonl";
    private static final String DEFAULT_WORKSPACE_ROOT = "/tmp/carbonet-sr-codex-runner";

    private final ObjectMapper objectMapper;

    @Value("${security.codex.runner.enabled:false}")
    private boolean runnerEnabled;

    @Value("${security.codex.runner.repo-root:}")
    private String repositoryRoot;

    @Value("${security.codex.runner.workspace-root:/tmp/carbonet-sr-codex-runner}")
    private String workspaceRoot;

    @Value("${security.codex.runner.history-file:/tmp/carbonet-sr-codex-runner-history.jsonl}")
    private String historyFilePath;

    @Value("${security.codex.runner.allowed-path-prefixes:src/main/java,src/main/resources,frontend/src,docs/ai,ops/scripts}")
    private String allowedPathPrefixes;

    @Value("${security.codex.runner.codex-command:}")
    private String codexCommand;

    @Value("${security.codex.runner.backend-verify-command:mvn -q -DskipTests package}")
    private String backendVerifyCommand;

    @Value("${security.codex.runner.frontend-verify-command:npm run build}")
    private String frontendVerifyCommand;

    @Value("${security.codex.runner.frontend-verify-workdir:frontend}")
    private String frontendVerifyWorkdir;

    @Value("${security.codex.runner.deploy-command:}")
    private String deployCommand;

    @Value("${security.codex.runner.command-timeout-seconds:1800}")
    private long commandTimeoutSeconds;

    @Value("${security.codex.runner.verify-timeout-seconds:1800}")
    private long verifyTimeoutSeconds;

    private final ReentrantLock historyLock = new ReentrantLock();

    public SrTicketCodexRunnerServiceImpl(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public SrTicketRunnerExecutionVO execute(SrTicketRecordVO ticket, String actorId) throws Exception {
        validateRunnerConfiguration(ticket);

        SrTicketRunnerExecutionVO execution = new SrTicketRunnerExecutionVO();
        execution.setRunId(buildRunId());
        execution.setTicketId(safe(ticket.getTicketId()));
        execution.setActorId(defaultActor(actorId));
        execution.setStartedAt(now());
        execution.setStatus("RUNNING");
        execution.setRepositoryRoot(resolveRepositoryRoot().toString());

        Path runRoot = resolveWorkspaceRoot().resolve(safe(ticket.getTicketId())).resolve(execution.getRunId());
        Path artifactsRoot = runRoot.resolve("artifacts");
        Path worktreePath = runRoot.resolve("worktree");
        Path promptFile = artifactsRoot.resolve("codex-prompt.txt");
        Path stdoutFile = artifactsRoot.resolve("codex.stdout.log");
        Path stderrFile = artifactsRoot.resolve("codex.stderr.log");
        Path diffFile = artifactsRoot.resolve("git.diff");
        Path changedFilesFile = artifactsRoot.resolve("changed-files.txt");

        Files.createDirectories(artifactsRoot);
        execution.setWorkspacePath(runRoot.toString());
        execution.setWorktreePath(worktreePath.toString());
        execution.setPromptFilePath(promptFile.toString());
        execution.setStdoutLogPath(stdoutFile.toString());
        execution.setStderrLogPath(stderrFile.toString());
        execution.setDiffFilePath(diffFile.toString());

        writePromptFile(promptFile, ticket);
        appendHistory(execution);

        try {
            prepareWorktree(worktreePath);

            if (!safe(codexCommand).isEmpty()) {
                execution.setCodexCommand(safe(codexCommand));
                CommandResult codexResult = runConfiguredCommand(codexCommand, worktreePath, commandTimeoutSeconds, stdoutFile, stderrFile, execution);
                execution.setCodexExitCode(codexResult.getExitCode());
                if (codexResult.getExitCode() != 0) {
                    execution.setStatus("CODEX_FAILED");
                    execution.setErrorMessage("Codex command exited with code " + codexResult.getExitCode());
                    return finalizeExecution(execution, worktreePath, diffFile, changedFilesFile);
                }
            } else {
                execution.setStatus("RUNNER_BLOCKED");
                execution.setErrorMessage("security.codex.runner.codex-command is not configured.");
                return finalizeExecution(execution, worktreePath, diffFile, changedFilesFile);
            }

            collectGitArtifacts(worktreePath, diffFile, changedFilesFile, execution);
            if (!execution.isChangedFilesAllowed()) {
                execution.setStatus("CHANGED_FILE_BLOCKED");
                execution.setErrorMessage("Changed files exceeded the configured allowlist.");
                return finalizeExecution(execution, worktreePath, diffFile, changedFilesFile);
            }

            if (!safe(backendVerifyCommand).isEmpty()) {
                execution.setBackendVerifyCommand(safe(backendVerifyCommand));
                CommandResult backendResult = runConfiguredCommand(backendVerifyCommand, worktreePath, verifyTimeoutSeconds,
                        artifactsRoot.resolve("backend-verify.stdout.log"), artifactsRoot.resolve("backend-verify.stderr.log"), execution);
                execution.setBackendVerifyExitCode(backendResult.getExitCode());
                if (backendResult.getExitCode() != 0) {
                    execution.setStatus("BACKEND_VERIFY_FAILED");
                    execution.setErrorMessage("Backend verification failed with exit code " + backendResult.getExitCode());
                    return finalizeExecution(execution, worktreePath, diffFile, changedFilesFile);
                }
            }

            if (!safe(frontendVerifyCommand).isEmpty()) {
                Path frontendDir = worktreePath.resolve(safe(frontendVerifyWorkdir).isEmpty() ? "frontend" : safe(frontendVerifyWorkdir)).normalize();
                if (!frontendDir.startsWith(worktreePath)) {
                    throw new IllegalArgumentException("Frontend verify workdir escaped the worktree.");
                }
                execution.setFrontendVerifyCommand(safe(frontendVerifyCommand));
                CommandResult frontendResult = runConfiguredCommand(frontendVerifyCommand, frontendDir, verifyTimeoutSeconds,
                        artifactsRoot.resolve("frontend-verify.stdout.log"), artifactsRoot.resolve("frontend-verify.stderr.log"), execution);
                execution.setFrontendVerifyExitCode(frontendResult.getExitCode());
                if (frontendResult.getExitCode() != 0) {
                    execution.setStatus("FRONTEND_VERIFY_FAILED");
                    execution.setErrorMessage("Frontend verification failed with exit code " + frontendResult.getExitCode());
                    return finalizeExecution(execution, worktreePath, diffFile, changedFilesFile);
                }
            }

            if (!safe(deployCommand).isEmpty()) {
                execution.setDeployCommand(safe(deployCommand));
                CommandResult deployResult = runConfiguredCommand(deployCommand, worktreePath, verifyTimeoutSeconds,
                        artifactsRoot.resolve("deploy.stdout.log"), artifactsRoot.resolve("deploy.stderr.log"), execution);
                execution.setDeployExitCode(deployResult.getExitCode());
                if (deployResult.getExitCode() != 0) {
                    execution.setStatus("DEPLOY_HOOK_FAILED");
                    execution.setErrorMessage("Deploy hook failed with exit code " + deployResult.getExitCode());
                    return finalizeExecution(execution, worktreePath, diffFile, changedFilesFile);
                }
            }

            execution.setStatus("COMPLETED");
            return finalizeExecution(execution, worktreePath, diffFile, changedFilesFile);
        } catch (Exception e) {
            execution.setStatus("RUNNER_ERROR");
            execution.setErrorMessage(safe(e.getMessage()).isEmpty() ? e.getClass().getSimpleName() : safe(e.getMessage()));
            return finalizeExecution(execution, worktreePath, diffFile, changedFilesFile);
        }
    }

    private void validateRunnerConfiguration(SrTicketRecordVO ticket) {
        if (!runnerEnabled) {
            throw new IllegalArgumentException("Codex runner is disabled.");
        }
        if (ticket == null || safe(ticket.getTicketId()).isEmpty()) {
            throw new IllegalArgumentException("SR ticket is required.");
        }
        if (!"READY_FOR_CODEX".equalsIgnoreCase(safe(ticket.getExecutionStatus()))) {
            throw new IllegalArgumentException("READY_FOR_CODEX 상태의 티켓만 실행할 수 있습니다.");
        }
        if (!"APPROVED".equalsIgnoreCase(safe(ticket.getStatus()))) {
            throw new IllegalArgumentException("승인된 티켓만 실행할 수 있습니다.");
        }
        resolveRepositoryRoot();
        resolveWorkspaceRoot();
    }

    private SrTicketRunnerExecutionVO finalizeExecution(SrTicketRunnerExecutionVO execution, Path worktreePath, Path diffFile,
                                                        Path changedFilesFile) throws Exception {
        try {
            if (Files.exists(worktreePath)) {
                collectGitArtifacts(worktreePath, diffFile, changedFilesFile, execution);
            }
        } catch (Exception e) {
            log.warn("Failed to refresh git artifacts for SR runner execution {}", execution.getRunId(), e);
        }
        execution.setCompletedAt(now());
        appendHistory(execution);
        return execution;
    }

    private void prepareWorktree(Path worktreePath) throws Exception {
        deleteDirectory(worktreePath);
        Files.createDirectories(worktreePath.getParent());
        List<String> command = new ArrayList<String>();
        command.add("git");
        command.add("worktree");
        command.add("add");
        command.add("--detach");
        command.add(worktreePath.toString());
        runCommand(command, resolveRepositoryRoot(), commandTimeoutSeconds, null, null);
    }

    private void collectGitArtifacts(Path worktreePath, Path diffFile, Path changedFilesFile, SrTicketRunnerExecutionVO execution) throws Exception {
        if (!Files.exists(worktreePath)) {
            execution.setChangedFiles(Collections.<String>emptyList());
            execution.setChangedFilesAllowed(true);
            execution.setChangedFilesSummary("");
            return;
        }
        writeCommandOutput(listCommand("git", "diff", "--binary"), worktreePath, diffFile);
        List<String> changedFiles = readCommandOutput(listCommand("git", "diff", "--name-only"), worktreePath);
        execution.setChangedFiles(changedFiles);
        execution.setChangedFilesSummary(joinLines(changedFiles));
        writeLines(changedFilesFile, changedFiles);
        execution.setChangedFilesAllowed(allChangedFilesAllowed(changedFiles));
    }

    private boolean allChangedFilesAllowed(List<String> changedFiles) {
        List<String> prefixes = parseAllowedPrefixes();
        for (String file : changedFiles == null ? Collections.<String>emptyList() : changedFiles) {
            String normalized = normalizeRelativePath(file);
            boolean allowed = false;
            for (String prefix : prefixes) {
                if (normalized.equals(prefix) || normalized.startsWith(prefix + "/")) {
                    allowed = true;
                    break;
                }
            }
            if (!allowed) {
                return false;
            }
        }
        return true;
    }

    private List<String> parseAllowedPrefixes() {
        List<String> results = new ArrayList<String>();
        for (String token : safe(allowedPathPrefixes).split(",")) {
            String trimmed = normalizeRelativePath(token);
            if (!trimmed.isEmpty()) {
                results.add(trimmed);
            }
        }
        return results;
    }

    private CommandResult runConfiguredCommand(String template, Path workingDirectory, long timeoutSeconds,
                                               Path stdoutPath, Path stderrPath, SrTicketRunnerExecutionVO execution) throws Exception {
        List<String> tokens = tokenize(template);
        if (tokens.isEmpty()) {
            throw new IllegalArgumentException("Runner command template is empty.");
        }
        List<String> resolved = new ArrayList<String>();
        for (String token : tokens) {
            resolved.add(applyPlaceholders(token, execution));
        }
        return runCommand(resolved, workingDirectory, timeoutSeconds, stdoutPath, stderrPath);
    }

    private CommandResult runCommand(List<String> command, Path workingDirectory, long timeoutSeconds,
                                     Path stdoutPath, Path stderrPath) throws Exception {
        ProcessBuilder builder = new ProcessBuilder(command);
        builder.directory(workingDirectory.toFile());
        builder.redirectErrorStream(false);
        Process process = builder.start();

        StreamCollector stdout = new StreamCollector(process.getInputStream(), stdoutPath);
        StreamCollector stderr = new StreamCollector(process.getErrorStream(), stderrPath);
        Thread stdoutThread = new Thread(stdout, "sr-runner-stdout");
        Thread stderrThread = new Thread(stderr, "sr-runner-stderr");
        stdoutThread.start();
        stderrThread.start();

        boolean finished = process.waitFor(Math.max(1L, timeoutSeconds), TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            stdoutThread.join(TimeUnit.SECONDS.toMillis(5));
            stderrThread.join(TimeUnit.SECONDS.toMillis(5));
            throw new IllegalStateException("Command timed out: " + joinLines(command));
        }
        stdoutThread.join(TimeUnit.SECONDS.toMillis(5));
        stderrThread.join(TimeUnit.SECONDS.toMillis(5));
        return new CommandResult(process.exitValue());
    }

    private List<String> readCommandOutput(List<String> command, Path workingDirectory) throws Exception {
        ProcessBuilder builder = new ProcessBuilder(command);
        builder.directory(workingDirectory.toFile());
        builder.redirectErrorStream(true);
        Process process = builder.start();
        List<String> lines = new ArrayList<String>();
        Reader reader = new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8);
        StringBuilder current = new StringBuilder();
        int value;
        while ((value = reader.read()) != -1) {
            if (value == '\n') {
                String line = safe(current.toString());
                if (!line.isEmpty()) {
                    lines.add(line);
                }
                current.setLength(0);
            } else if (value != '\r') {
                current.append((char) value);
            }
        }
        String last = safe(current.toString());
        if (!last.isEmpty()) {
            lines.add(last);
        }
        if (!process.waitFor(Math.max(1L, commandTimeoutSeconds), TimeUnit.SECONDS)) {
            process.destroyForcibly();
            throw new IllegalStateException("Command timed out: " + joinLines(command));
        }
        if (process.exitValue() != 0) {
            throw new IllegalStateException("Command failed with exit code " + process.exitValue() + ": " + joinLines(command));
        }
        return lines;
    }

    private void writeCommandOutput(List<String> command, Path workingDirectory, Path outputFile) throws Exception {
        List<String> lines = readCommandOutput(command, workingDirectory);
        writeLines(outputFile, lines);
    }

    private void writePromptFile(Path promptFile, SrTicketRecordVO ticket) throws IOException {
        List<String> lines = new ArrayList<String>();
        lines.add("Carbonet SR Ticket Runner");
        lines.add("ticketId=" + safe(ticket.getTicketId()));
        lines.add("pageId=" + safe(ticket.getPageId()));
        lines.add("page=" + safe(ticket.getPageLabel()));
        lines.add("route=" + safe(ticket.getRoutePath()));
        lines.add("summary=" + safe(ticket.getSummary()));
        lines.add("instruction=");
        lines.add(safe(ticket.getInstruction()));
        lines.add("");
        lines.add("generatedDirection=");
        lines.add(safe(ticket.getGeneratedDirection()));
        lines.add("");
        lines.add("commandPrompt=");
        lines.add(safe(ticket.getCommandPrompt()));
        writeLines(promptFile, lines);
    }

    private void writeLines(Path file, List<String> lines) throws IOException {
        Files.createDirectories(file.getParent());
        try (BufferedWriter writer = Files.newBufferedWriter(file, StandardCharsets.UTF_8,
                StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.WRITE)) {
            for (String line : lines == null ? Collections.<String>emptyList() : lines) {
                writer.write(line == null ? "" : line);
                writer.newLine();
            }
        }
    }

    private void appendHistory(SrTicketRunnerExecutionVO execution) {
        historyLock.lock();
        try {
            Path historyFile = resolveHistoryFile();
            Files.createDirectories(historyFile.getParent());
            try (Writer writer = Files.newBufferedWriter(historyFile, StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE, StandardOpenOption.APPEND, StandardOpenOption.WRITE)) {
                writer.write(objectMapper.writeValueAsString(execution));
                writer.write(System.lineSeparator());
            }
        } catch (Exception e) {
            log.warn("Failed to append SR runner history.", e);
        } finally {
            historyLock.unlock();
        }
    }

    private Path resolveRepositoryRoot() {
        String path = safe(repositoryRoot);
        if (path.isEmpty()) {
            throw new IllegalArgumentException("security.codex.runner.repo-root is not configured.");
        }
        Path root = Paths.get(path).normalize();
        if (!Files.isDirectory(root)) {
            throw new IllegalArgumentException("Configured repository root does not exist: " + root);
        }
        return root;
    }

    private Path resolveWorkspaceRoot() {
        String path = safe(workspaceRoot);
        if (path.isEmpty()) {
            path = DEFAULT_WORKSPACE_ROOT;
        }
        Path root = Paths.get(path).normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to create runner workspace root: " + root, e);
        }
        return root;
    }

    private Path resolveHistoryFile() {
        String path = safe(historyFilePath);
        if (path.isEmpty()) {
            path = DEFAULT_HISTORY_FILE;
        }
        return Paths.get(path).normalize();
    }

    private List<String> tokenize(String command) {
        List<String> tokens = new ArrayList<String>();
        StringBuilder current = new StringBuilder();
        boolean singleQuoted = false;
        boolean doubleQuoted = false;
        for (int i = 0; i < safe(command).length(); i++) {
            char ch = command.charAt(i);
            if (ch == '\'' && !doubleQuoted) {
                singleQuoted = !singleQuoted;
                continue;
            }
            if (ch == '"' && !singleQuoted) {
                doubleQuoted = !doubleQuoted;
                continue;
            }
            if (Character.isWhitespace(ch) && !singleQuoted && !doubleQuoted) {
                if (current.length() > 0) {
                    tokens.add(current.toString());
                    current.setLength(0);
                }
                continue;
            }
            current.append(ch);
        }
        if (current.length() > 0) {
            tokens.add(current.toString());
        }
        return tokens;
    }

    private String applyPlaceholders(String token, SrTicketRunnerExecutionVO execution) {
        return token
                .replace("{ticketId}", safe(execution.getTicketId()))
                .replace("{runId}", safe(execution.getRunId()))
                .replace("{repoRoot}", safe(execution.getRepositoryRoot()))
                .replace("{workspace}", safe(execution.getWorkspacePath()))
                .replace("{worktree}", safe(execution.getWorktreePath()))
                .replace("{promptFile}", safe(execution.getPromptFilePath()))
                .replace("{stdoutLog}", safe(execution.getStdoutLogPath()))
                .replace("{stderrLog}", safe(execution.getStderrLogPath()))
                .replace("{diffFile}", safe(execution.getDiffFilePath()));
    }

    private void deleteDirectory(Path path) throws IOException {
        if (path == null || !Files.exists(path)) {
            return;
        }
        if (Files.isDirectory(path)) {
            try (DirectoryStream<Path> stream = Files.newDirectoryStream(path)) {
                for (Path child : stream) {
                    deleteDirectory(child);
                }
            }
        }
        Files.deleteIfExists(path);
    }

    private String buildRunId() {
        return "RUN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase(Locale.ROOT);
    }

    private String joinLines(List<String> values) {
        StringBuilder builder = new StringBuilder();
        for (String value : values == null ? Collections.<String>emptyList() : values) {
            if (builder.length() > 0) {
                builder.append('\n');
            }
            builder.append(value == null ? "" : value);
        }
        return builder.toString();
    }

    private List<String> listCommand(String... values) {
        List<String> result = new ArrayList<String>();
        if (values != null) {
            Collections.addAll(result, values);
        }
        return result;
    }

    private String normalizeRelativePath(String value) {
        String normalized = safe(value).replace('\\', '/');
        while (normalized.startsWith("./")) {
            normalized = normalized.substring(2);
        }
        while (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        return normalized;
    }

    private String defaultActor(String actorId) {
        return safe(actorId).isEmpty() ? "SYSTEM" : safe(actorId);
    }

    private String now() {
        return LocalDateTime.now().format(TS_FORMAT);
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private static final class CommandResult {
        private final int exitCode;

        private CommandResult(int exitCode) {
            this.exitCode = exitCode;
        }

        private int getExitCode() {
            return exitCode;
        }
    }

    private static final class StreamCollector implements Runnable {
        private final InputStream inputStream;
        private final Path outputFile;

        private StreamCollector(InputStream inputStream, Path outputFile) {
            this.inputStream = inputStream;
            this.outputFile = outputFile;
        }

        @Override
        public void run() {
            try {
                if (outputFile != null) {
                    Files.createDirectories(outputFile.getParent());
                    try (BufferedWriter writer = Files.newBufferedWriter(outputFile, StandardCharsets.UTF_8,
                            StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.WRITE);
                         Reader reader = new InputStreamReader(inputStream, StandardCharsets.UTF_8)) {
                        char[] buffer = new char[2048];
                        int read;
                        while ((read = reader.read(buffer)) != -1) {
                            writer.write(buffer, 0, read);
                        }
                    }
                } else {
                    Reader reader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
                    char[] buffer = new char[2048];
                    while (reader.read(buffer) != -1) {
                        // drain stream
                    }
                }
            } catch (IOException ignored) {
                // best effort logging
            }
        }
    }
}
