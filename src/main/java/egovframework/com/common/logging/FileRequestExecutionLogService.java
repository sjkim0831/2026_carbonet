package egovframework.com.common.logging;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.Collectors;

@Service("requestExecutionLogService")
@RequiredArgsConstructor
@Slf4j
public class FileRequestExecutionLogService implements RequestExecutionLogService {

    private final ObjectMapper objectMapper;

    @Value("${security.request-log.enabled:true}")
    private boolean enabled;

    @Value("${security.request-log.file:/tmp/carbonet-request-execution-history.jsonl}")
    private String requestLogFile;

    private final ReentrantLock lock = new ReentrantLock();

    @Override
    public void append(RequestExecutionLogVO item) {
        if (!enabled || item == null) {
            return;
        }

        Path file = Paths.get(requestLogFile == null || requestLogFile.trim().isEmpty()
                ? "/tmp/carbonet-request-execution-history.jsonl"
                : requestLogFile.trim());
        lock.lock();
        try {
            Path parent = file.getParent();
            if (parent != null) {
                Files.createDirectories(parent);
            }
            try (BufferedWriter writer = Files.newBufferedWriter(file, StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE, StandardOpenOption.APPEND, StandardOpenOption.WRITE)) {
                writer.write(objectMapper.writeValueAsString(item));
                writer.newLine();
            }
        } catch (IOException e) {
            log.error("Failed to write request execution log.", e);
        } finally {
            lock.unlock();
        }
    }

    @Override
    public List<RequestExecutionLogVO> readRecent(int limit) {
        if (!enabled || limit <= 0) {
            return Collections.emptyList();
        }
        Path file = Paths.get(requestLogFile == null || requestLogFile.trim().isEmpty()
                ? "/tmp/carbonet-request-execution-history.jsonl"
                : requestLogFile.trim());
        if (!Files.exists(file)) {
            return Collections.emptyList();
        }
        lock.lock();
        try {
            return Files.readAllLines(file, StandardCharsets.UTF_8).stream()
                    .filter(line -> line != null && !line.trim().isEmpty())
                    .map(this::parseLine)
                    .filter(item -> item != null)
                    .sorted(Comparator.comparing(RequestExecutionLogVO::getExecutedAt,
                            Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                    .limit(limit)
                    .collect(Collectors.toList());
        } catch (IOException e) {
            log.error("Failed to read request execution log.", e);
            return Collections.emptyList();
        } finally {
            lock.unlock();
        }
    }

    private RequestExecutionLogVO parseLine(String line) {
        try {
            return objectMapper.readValue(line, RequestExecutionLogVO.class);
        } catch (IOException e) {
            log.debug("Failed to parse request execution log line.", e);
            return null;
        }
    }
}
