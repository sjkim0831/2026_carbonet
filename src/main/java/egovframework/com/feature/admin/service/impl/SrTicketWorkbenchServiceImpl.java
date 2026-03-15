package egovframework.com.feature.admin.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.feature.admin.dto.request.SrTicketApprovalRequest;
import egovframework.com.feature.admin.dto.request.SrTicketCreateRequest;
import egovframework.com.feature.admin.model.vo.SrTicketRecordVO;
import egovframework.com.feature.admin.model.vo.SrTicketRunnerExecutionVO;
import egovframework.com.feature.admin.service.ScreenCommandCenterService;
import egovframework.com.feature.admin.service.SrTicketCodexRunnerService;
import egovframework.com.feature.admin.service.SrTicketWorkbenchService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.locks.ReentrantLock;

@Service("srTicketWorkbenchService")
@Slf4j
public class SrTicketWorkbenchServiceImpl implements SrTicketWorkbenchService {

    private static final DateTimeFormatter TS_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final ObjectMapper objectMapper;
    private final ScreenCommandCenterService screenCommandCenterService;
    private final SrTicketCodexRunnerService srTicketCodexRunnerService;

    @Value("${security.codex.enabled:false}")
    private boolean codexEnabled;

    @Value("${security.codex.history-file:/tmp/carbonet-codex-history.jsonl}")
    private String codexHistoryFilePath;

    @Value("${security.codex.sr-ticket-file:/tmp/carbonet-sr-tickets.jsonl}")
    private String srTicketFilePath;

    private final ReentrantLock fileLock = new ReentrantLock();

    public SrTicketWorkbenchServiceImpl(ObjectMapper objectMapper,
                                        ScreenCommandCenterService screenCommandCenterService,
                                        SrTicketCodexRunnerService srTicketCodexRunnerService) {
        this.objectMapper = objectMapper;
        this.screenCommandCenterService = screenCommandCenterService;
        this.srTicketCodexRunnerService = srTicketCodexRunnerService;
    }

    @Override
    public Map<String, Object> getPage(String selectedPageId) throws Exception {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("selectedPageId", safe(selectedPageId));
        response.put("codexEnabled", codexEnabled);
        response.put("codexHistoryFile", safe(codexHistoryFilePath));
        response.put("ticketCount", readTickets().size());
        response.put("tickets", readTicketRows());
        response.put("screenOptions", screenCommandCenterService.getScreenCommandPage(selectedPageId).get("pages"));
        return response;
    }

    @Override
    public Map<String, Object> createTicket(SrTicketCreateRequest request, String actorId) throws Exception {
        SrTicketRecordVO ticket = new SrTicketRecordVO();
        String now = now();
        ticket.setTicketId("SR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase(Locale.ROOT));
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);
        ticket.setCreatedBy(defaultActor(actorId));
        ticket.setLastActionBy(defaultActor(actorId));
        ticket.setExecutionStatus(codexEnabled ? "READY_FOR_APPROVAL" : "CODEX_DISABLED");
        ticket.setPageId(safe(request == null ? null : request.getPageId()));
        ticket.setPageLabel(safe(request == null ? null : request.getPageLabel()));
        ticket.setRoutePath(safe(request == null ? null : request.getRoutePath()));
        ticket.setMenuCode(safe(request == null ? null : request.getMenuCode()));
        ticket.setMenuLookupUrl(safe(request == null ? null : request.getMenuLookupUrl()));
        ticket.setSurfaceId(safe(request == null ? null : request.getSurfaceId()));
        ticket.setSurfaceLabel(safe(request == null ? null : request.getSurfaceLabel()));
        ticket.setEventId(safe(request == null ? null : request.getEventId()));
        ticket.setEventLabel(safe(request == null ? null : request.getEventLabel()));
        ticket.setTargetId(safe(request == null ? null : request.getTargetId()));
        ticket.setTargetLabel(safe(request == null ? null : request.getTargetLabel()));
        ticket.setSummary(safe(request == null ? null : request.getSummary()));
        ticket.setInstruction(safe(request == null ? null : request.getInstruction()));
        ticket.setGeneratedDirection(safe(request == null ? null : request.getGeneratedDirection()));
        ticket.setCommandPrompt(safe(request == null ? null : request.getCommandPrompt()));
        ticket.setExecutionComment(codexEnabled
                ? "승인 후 Codex CLI 또는 Codex admin execution과 연결할 준비가 되었습니다."
                : "Codex 기능이 비활성화되어 있어 승인 후에도 수동 실행이 필요합니다.");
        appendTicket(ticket);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("ticket", ticketRow(ticket));
        response.put("message", "SR 티켓을 발행했습니다.");
        return response;
    }

    @Override
    public Map<String, Object> updateApproval(String ticketId, SrTicketApprovalRequest request, String actorId) throws Exception {
        String decision = safe(request == null ? null : request.getDecision()).toUpperCase(Locale.ROOT);
        if (!"APPROVE".equals(decision) && !"REJECT".equals(decision)) {
            throw new IllegalArgumentException("승인 처리 값은 APPROVE 또는 REJECT 여야 합니다.");
        }

        SrTicketRecordVO ticket = findTicket(ticketId);
        if (ticket == null) {
            throw new IllegalArgumentException("SR 티켓을 찾을 수 없습니다.");
        }

        String now = now();
        ticket.setStatus("APPROVE".equals(decision) ? "APPROVED" : "REJECTED");
        ticket.setUpdatedAt(now);
        ticket.setLastActionBy(defaultActor(actorId));
        ticket.setApprovedBy(defaultActor(actorId));
        ticket.setApprovedAt(now);
        ticket.setApprovalComment(safe(request == null ? null : request.getComment()));
        if ("APPROVE".equals(decision)) {
            ticket.setExecutionStatus(codexEnabled ? "APPROVED_READY" : "APPROVED_MANUAL_ONLY");
        } else {
            ticket.setExecutionStatus("REJECTED");
        }
        saveTickets(readTicketsReplacing(ticket));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("ticket", ticketRow(ticket));
        response.put("message", "APPROVE".equals(decision) ? "SR 티켓을 승인했습니다." : "SR 티켓을 반려했습니다.");
        return response;
    }

    @Override
    public Map<String, Object> prepareExecution(String ticketId, String actorId) throws Exception {
        SrTicketRecordVO ticket = findTicket(ticketId);
        if (ticket == null) {
            throw new IllegalArgumentException("SR 티켓을 찾을 수 없습니다.");
        }
        if (!"APPROVED".equalsIgnoreCase(safe(ticket.getStatus()))) {
            throw new IllegalArgumentException("승인된 티켓만 실행 준비 상태로 바꿀 수 있습니다.");
        }

        String now = now();
        ticket.setUpdatedAt(now);
        ticket.setLastActionBy(defaultActor(actorId));
        ticket.setExecutionPreparedAt(now);
        ticket.setExecutionPreparedBy(defaultActor(actorId));
        ticket.setExecutionStatus(codexEnabled ? "READY_FOR_CODEX" : "READY_FOR_MANUAL_EXECUTION");
        ticket.setExecutionComment(codexEnabled
                ? "Codex CLI 연결 시 즉시 실행 가능한 작업 지시와 command prompt가 준비되었습니다."
                : "Codex 비활성 상태입니다. command prompt를 수동 실행 프로세스에 전달하세요.");
        saveTickets(readTicketsReplacing(ticket));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("ticket", ticketRow(ticket));
        response.put("message", "실행 준비 상태로 전환했습니다.");
        return response;
    }

    private List<Map<String, Object>> readTicketRows() throws Exception {
        List<SrTicketRecordVO> tickets = readTickets();
        tickets.sort(Comparator.comparing(SrTicketRecordVO::getCreatedAt, Comparator.nullsLast(String::compareTo)).reversed());
        List<Map<String, Object>> rows = new ArrayList<>();
        for (SrTicketRecordVO ticket : tickets) {
            rows.add(ticketRow(ticket));
        }
        return rows;
    }

    private Map<String, Object> ticketRow(SrTicketRecordVO ticket) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("ticketId", safe(ticket.getTicketId()));
        row.put("status", safe(ticket.getStatus()));
        row.put("createdAt", safe(ticket.getCreatedAt()));
        row.put("updatedAt", safe(ticket.getUpdatedAt()));
        row.put("createdBy", safe(ticket.getCreatedBy()));
        row.put("lastActionBy", safe(ticket.getLastActionBy()));
        row.put("approvedBy", safe(ticket.getApprovedBy()));
        row.put("approvedAt", safe(ticket.getApprovedAt()));
        row.put("approvalComment", safe(ticket.getApprovalComment()));
        row.put("executionPreparedAt", safe(ticket.getExecutionPreparedAt()));
        row.put("executionPreparedBy", safe(ticket.getExecutionPreparedBy()));
        row.put("executionStatus", safe(ticket.getExecutionStatus()));
        row.put("executionComment", safe(ticket.getExecutionComment()));
        row.put("pageId", safe(ticket.getPageId()));
        row.put("pageLabel", safe(ticket.getPageLabel()));
        row.put("routePath", safe(ticket.getRoutePath()));
        row.put("menuCode", safe(ticket.getMenuCode()));
        row.put("menuLookupUrl", safe(ticket.getMenuLookupUrl()));
        row.put("surfaceId", safe(ticket.getSurfaceId()));
        row.put("surfaceLabel", safe(ticket.getSurfaceLabel()));
        row.put("eventId", safe(ticket.getEventId()));
        row.put("eventLabel", safe(ticket.getEventLabel()));
        row.put("targetId", safe(ticket.getTargetId()));
        row.put("targetLabel", safe(ticket.getTargetLabel()));
        row.put("summary", safe(ticket.getSummary()));
        row.put("instruction", safe(ticket.getInstruction()));
        row.put("generatedDirection", safe(ticket.getGeneratedDirection()));
        row.put("commandPrompt", safe(ticket.getCommandPrompt()));
        row.put("executionRunId", safe(ticket.getExecutionRunId()));
        row.put("executionStartedAt", safe(ticket.getExecutionStartedAt()));
        row.put("executionStartedBy", safe(ticket.getExecutionStartedBy()));
        row.put("executionCompletedAt", safe(ticket.getExecutionCompletedAt()));
        row.put("executionCompletedBy", safe(ticket.getExecutionCompletedBy()));
        row.put("executionLogPath", safe(ticket.getExecutionLogPath()));
        row.put("executionDiffPath", safe(ticket.getExecutionDiffPath()));
        row.put("executionChangedFiles", safe(ticket.getExecutionChangedFiles()));
        row.put("executionWorktreePath", safe(ticket.getExecutionWorktreePath()));
        return row;
    }

    @Override
    public Map<String, Object> executeTicket(String ticketId, String actorId) throws Exception {
        SrTicketRecordVO ticket = findTicket(ticketId);
        if (ticket == null) {
            throw new IllegalArgumentException("SR 티켓을 찾을 수 없습니다.");
        }
        if (!"READY_FOR_CODEX".equalsIgnoreCase(safe(ticket.getExecutionStatus()))) {
            throw new IllegalArgumentException("READY_FOR_CODEX 상태의 티켓만 실행할 수 있습니다.");
        }

        String startedAt = now();
        ticket.setUpdatedAt(startedAt);
        ticket.setLastActionBy(defaultActor(actorId));
        ticket.setExecutionStartedAt(startedAt);
        ticket.setExecutionStartedBy(defaultActor(actorId));
        ticket.setExecutionStatus("RUNNING_CODEX");
        ticket.setExecutionComment("승인된 SR 티켓에 대한 Codex runner 실행을 시작했습니다.");
        saveTickets(readTicketsReplacing(ticket));

        SrTicketRunnerExecutionVO execution;
        try {
            execution = srTicketCodexRunnerService.execute(ticket, actorId);
        } catch (Exception e) {
            String failedAt = now();
            ticket.setUpdatedAt(failedAt);
            ticket.setLastActionBy(defaultActor(actorId));
            ticket.setExecutionCompletedAt(failedAt);
            ticket.setExecutionCompletedBy(defaultActor(actorId));
            ticket.setExecutionStatus("RUNNER_ERROR");
            ticket.setExecutionComment(safe(e.getMessage()).isEmpty() ? "Codex runner 실행 중 오류가 발생했습니다." : safe(e.getMessage()));
            saveTickets(readTicketsReplacing(ticket));
            throw e;
        }
        String completedAt = safe(execution.getCompletedAt()).isEmpty() ? now() : safe(execution.getCompletedAt());

        ticket.setUpdatedAt(completedAt);
        ticket.setLastActionBy(defaultActor(actorId));
        ticket.setExecutionRunId(safe(execution.getRunId()));
        ticket.setExecutionCompletedAt(completedAt);
        ticket.setExecutionCompletedBy(defaultActor(actorId));
        ticket.setExecutionLogPath(safe(execution.getStdoutLogPath()));
        ticket.setExecutionDiffPath(safe(execution.getDiffFilePath()));
        ticket.setExecutionChangedFiles(safe(execution.getChangedFilesSummary()));
        ticket.setExecutionWorktreePath(safe(execution.getWorktreePath()));
        ticket.setExecutionStatus(mapExecutionStatus(execution.getStatus()));
        ticket.setExecutionComment(buildExecutionComment(execution));
        saveTickets(readTicketsReplacing(ticket));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("ticket", ticketRow(ticket));
        response.put("message", "COMPLETED".equalsIgnoreCase(safe(execution.getStatus()))
                ? "SR Codex runner 실행을 완료했습니다."
                : "SR Codex runner 실행 결과를 기록했습니다.");
        return response;
    }

    private String mapExecutionStatus(String runnerStatus) {
        String status = safe(runnerStatus).toUpperCase(Locale.ROOT);
        if ("COMPLETED".equals(status)) {
            return "CODEX_COMPLETED";
        }
        if ("RUNNER_BLOCKED".equals(status)) {
            return "RUNNER_BLOCKED";
        }
        if ("CHANGED_FILE_BLOCKED".equals(status)) {
            return "CHANGED_FILE_BLOCKED";
        }
        if ("BACKEND_VERIFY_FAILED".equals(status) || "FRONTEND_VERIFY_FAILED".equals(status)) {
            return "VERIFY_FAILED";
        }
        if ("DEPLOY_HOOK_FAILED".equals(status)) {
            return "DEPLOY_FAILED";
        }
        if ("CODEX_FAILED".equals(status)) {
            return "CODEX_FAILED";
        }
        return "RUNNER_ERROR";
    }

    private String buildExecutionComment(SrTicketRunnerExecutionVO execution) {
        StringBuilder builder = new StringBuilder();
        builder.append("runnerStatus=").append(safe(execution.getStatus()).isEmpty() ? "-" : safe(execution.getStatus()));
        if (!safe(execution.getErrorMessage()).isEmpty()) {
            builder.append(" / ").append(safe(execution.getErrorMessage()));
        }
        if (!safe(execution.getChangedFilesSummary()).isEmpty()) {
            builder.append(" / changed=").append(safe(execution.getChangedFilesSummary()).replace('\n', ','));
        }
        return builder.toString();
    }

    private List<SrTicketRecordVO> readTicketsReplacing(SrTicketRecordVO replacement) throws Exception {
        List<SrTicketRecordVO> tickets = readTickets();
        boolean replaced = false;
        for (int i = 0; i < tickets.size(); i++) {
            SrTicketRecordVO current = tickets.get(i);
            if (safe(current.getTicketId()).equalsIgnoreCase(safe(replacement.getTicketId()))) {
                tickets.set(i, replacement);
                replaced = true;
                break;
            }
        }
        if (!replaced) {
            tickets.add(replacement);
        }
        return tickets;
    }

    private SrTicketRecordVO findTicket(String ticketId) throws Exception {
        for (SrTicketRecordVO ticket : readTickets()) {
            if (safe(ticket.getTicketId()).equalsIgnoreCase(safe(ticketId))) {
                return ticket;
            }
        }
        return null;
    }

    private void appendTicket(SrTicketRecordVO ticket) throws Exception {
        fileLock.lock();
        try {
            Path file = resolveTicketFile();
            Files.createDirectories(file.getParent());
            try (BufferedWriter writer = Files.newBufferedWriter(file, StandardCharsets.UTF_8,
                    java.nio.file.StandardOpenOption.CREATE, java.nio.file.StandardOpenOption.APPEND)) {
                writer.write(objectMapper.writeValueAsString(ticket));
                writer.newLine();
            }
        } finally {
            fileLock.unlock();
        }
    }

    private List<SrTicketRecordVO> readTickets() throws Exception {
        fileLock.lock();
        try {
            Path file = resolveTicketFile();
            if (!Files.exists(file)) {
                return new ArrayList<>();
            }
            List<SrTicketRecordVO> items = new ArrayList<>();
            try (BufferedReader reader = Files.newBufferedReader(file, StandardCharsets.UTF_8)) {
                String line;
                while ((line = reader.readLine()) != null) {
                    String trimmed = safe(line);
                    if (trimmed.isEmpty()) {
                        continue;
                    }
                    try {
                        items.add(objectMapper.readValue(trimmed, SrTicketRecordVO.class));
                    } catch (Exception e) {
                        log.warn("Failed to parse SR ticket row.", e);
                    }
                }
            }
            return items;
        } finally {
            fileLock.unlock();
        }
    }

    private void saveTickets(List<SrTicketRecordVO> tickets) throws Exception {
        fileLock.lock();
        try {
            Path file = resolveTicketFile();
            Files.createDirectories(file.getParent());
            try (BufferedWriter writer = Files.newBufferedWriter(file, StandardCharsets.UTF_8,
                    java.nio.file.StandardOpenOption.CREATE, java.nio.file.StandardOpenOption.TRUNCATE_EXISTING)) {
                for (SrTicketRecordVO ticket : tickets == null ? Collections.<SrTicketRecordVO>emptyList() : tickets) {
                    writer.write(objectMapper.writeValueAsString(ticket));
                    writer.newLine();
                }
            }
        } finally {
            fileLock.unlock();
        }
    }

    private Path resolveTicketFile() {
        String resolved = safe(srTicketFilePath);
        if (resolved.isEmpty()) {
            resolved = "/tmp/carbonet-sr-tickets.jsonl";
        }
        return Paths.get(resolved);
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
}
