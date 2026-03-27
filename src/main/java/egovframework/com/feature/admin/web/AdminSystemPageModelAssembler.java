package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.model.vo.SecurityAuditSnapshot;
import egovframework.com.feature.admin.service.AdminSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminSystemPageModelAssembler {

    private final ObjectProvider<AdminMainController> adminMainControllerProvider;
    private final AdminSummaryService adminSummaryService;
    private final egovframework.com.feature.admin.service.AdminShellBootstrapPageService adminShellBootstrapPageService;

    private AdminMainController adminMainController() {
        return adminMainControllerProvider.getObject();
    }

    public void populateSecurityPolicyPage(Model model, boolean isEn) {
        AdminMainController controller = adminMainController();
        model.addAttribute("securityPolicySummary", adminSummaryService.getSecurityPolicySummary(isEn));
        model.addAttribute("securityPolicyRows", controller.buildSecurityPolicyRows(isEn));
        model.addAttribute("securityPolicyPlaybooks", controller.buildSecurityPolicyPlaybooks(isEn));
        model.addAttribute("menuPermissionDiagnostics", adminSummaryService.buildMenuPermissionDiagnosticSummary(isEn));
        model.addAttribute("menuPermissionDiagnosticSqlDownloadUrl", "/downloads/menu-permission-diagnostics.sql");
        model.addAttribute("menuPermissionAuthGroupUrl", controller.adminPrefix(null, null) + "/auth/group");
        model.addAttribute("menuPermissionEnvironmentUrl", controller.adminPrefix(null, null) + "/system/environment-management");
    }

    public void populateSecurityMonitoringPage(Model model, boolean isEn) {
        AdminMainController controller = adminMainController();
        model.addAttribute("securityMonitoringCards", adminSummaryService.getSecurityMonitoringCards(isEn));
        model.addAttribute("securityMonitoringTargets", adminSummaryService.getSecurityMonitoringTargets(isEn));
        model.addAttribute("securityMonitoringIps", adminSummaryService.getSecurityMonitoringIps(isEn));
        model.addAttribute("securityMonitoringEvents", adminSummaryService.mergeSecurityMonitoringEventState(adminSummaryService.getSecurityMonitoringEvents(isEn), isEn));
        model.addAttribute("securityMonitoringActivityRows", adminSummaryService.getSecurityMonitoringActivityRows(isEn));
        model.addAttribute("securityMonitoringBlockCandidates", adminSummaryService.getSecurityMonitoringBlockCandidateRows(isEn));
    }

    public void populateBlocklistPage(
            String searchKeyword,
            String blockType,
            String status,
            String source,
            Model model,
            boolean isEn) {
        AdminMainController controller = adminMainController();
        String normalizedKeyword = controller.safeString(searchKeyword).toLowerCase(Locale.ROOT);
        String normalizedBlockType = controller.safeString(blockType).toUpperCase(Locale.ROOT);
        String normalizedStatus = controller.safeString(status).toUpperCase(Locale.ROOT);
        String normalizedSource = controller.safeString(source).toUpperCase(Locale.ROOT);
        model.addAttribute("searchKeyword", controller.safeString(searchKeyword));
        model.addAttribute("blockType", normalizedBlockType);
        model.addAttribute("status", normalizedStatus);
        model.addAttribute("source", controller.safeString(source));
        model.addAttribute("blocklistSummary", adminSummaryService.getBlocklistSummary(isEn));
        List<Map<String, String>> blocklistRows = new ArrayList<>(adminSummaryService.getBlocklistRows(isEn));
        model.addAttribute("blocklistRows", blocklistRows.stream()
                .filter(row -> matchesBlocklistFilter(row, normalizedKeyword, normalizedBlockType, normalizedStatus, normalizedSource, controller))
                .toList());
        List<Map<String, String>> releaseQueue = new ArrayList<>(adminSummaryService.getBlocklistReleaseQueue(isEn));
        model.addAttribute("blocklistReleaseQueue", releaseQueue.stream()
                .filter(row -> matchesQueueFilter(row, normalizedKeyword, normalizedSource, controller))
                .toList());
        List<Map<String, String>> releaseHistory = new ArrayList<>(adminSummaryService.getBlocklistReleaseHistory(isEn));
        model.addAttribute("blocklistReleaseHistory", releaseHistory.stream()
                .filter(row -> matchesHistoryFilter(row, normalizedKeyword, normalizedSource, controller))
                .toList());
    }

    private boolean matchesBlocklistFilter(
            Map<String, String> row,
            String normalizedKeyword,
            String normalizedBlockType,
            String normalizedStatus,
            String normalizedSource,
            AdminMainController controller) {
        String rowBlockType = controller.safeString(row.get("blockType")).toUpperCase(Locale.ROOT);
        String rowStatus = controller.safeString(row.get("status")).toUpperCase(Locale.ROOT);
        String rowSource = controller.safeString(row.get("source")).toUpperCase(Locale.ROOT);
        boolean matchesKeyword = normalizedKeyword.isEmpty() || String.join(" ",
                controller.safeString(row.get("blockId")),
                controller.safeString(row.get("target")),
                controller.safeString(row.get("reason")),
                controller.safeString(row.get("owner")))
                .toLowerCase(Locale.ROOT)
                .contains(normalizedKeyword);
        boolean matchesBlockType = normalizedBlockType.isEmpty() || normalizedBlockType.equals(rowBlockType);
        boolean matchesStatus = normalizedStatus.isEmpty() || normalizedStatus.equals(rowStatus);
        boolean matchesSource = normalizedSource.isEmpty() || normalizedSource.equals(rowSource);
        return matchesKeyword && matchesBlockType && matchesStatus && matchesSource;
    }

    private boolean matchesQueueFilter(
            Map<String, String> row,
            String normalizedKeyword,
            String normalizedSource,
            AdminMainController controller) {
        String rowSource = controller.safeString(row.get("source")).toUpperCase(Locale.ROOT);
        boolean matchesKeyword = normalizedKeyword.isEmpty() || String.join(" ",
                controller.safeString(row.get("target")),
                controller.safeString(row.get("condition")),
                controller.safeString(row.get("releaseAt")))
                .toLowerCase(Locale.ROOT)
                .contains(normalizedKeyword);
        boolean matchesSource = normalizedSource.isEmpty() || normalizedSource.equals(rowSource);
        return matchesKeyword && matchesSource;
    }

    private boolean matchesHistoryFilter(
            Map<String, String> row,
            String normalizedKeyword,
            String normalizedSource,
            AdminMainController controller) {
        String rowSource = controller.safeString(row.get("source")).toUpperCase(Locale.ROOT);
        boolean matchesKeyword = normalizedKeyword.isEmpty() || String.join(" ",
                controller.safeString(row.get("blockId")),
                controller.safeString(row.get("target")),
                controller.safeString(row.get("reason")),
                controller.safeString(row.get("releasedBy")))
                .toLowerCase(Locale.ROOT)
                .contains(normalizedKeyword);
        boolean matchesSource = normalizedSource.isEmpty() || normalizedSource.equals(rowSource);
        return matchesKeyword && matchesSource;
    }

    public void populateSecurityAuditPage(Model model, boolean isEn) {
        SecurityAuditSnapshot auditSnapshot = adminSummaryService.loadSecurityAuditSnapshot();
        model.addAttribute("securityAuditSummary", adminSummaryService.getSecurityAuditSummary(auditSnapshot, isEn));
        model.addAttribute("securityAuditRows", adminSummaryService.buildSecurityAuditRows(auditSnapshot.getAuditLogs(), isEn));
    }

    public void populateSchedulerPage(
            String jobStatus,
            String executionType,
            Model model,
            boolean isEn) {
        AdminMainController controller = adminMainController();
        String normalizedJobStatus = controller.safeString(jobStatus).toUpperCase(Locale.ROOT);
        String normalizedExecutionType = controller.safeString(executionType).toUpperCase(Locale.ROOT);
        List<Map<String, String>> jobRows = controller.buildSchedulerJobRows(isEn);
        List<Map<String, String>> filteredRows = new ArrayList<>();
        for (Map<String, String> row : jobRows) {
            String rowStatus = controller.safeString(row.get("jobStatus")).toUpperCase(Locale.ROOT);
            String rowType = controller.safeString(row.get("executionTypeCode")).toUpperCase(Locale.ROOT);
            boolean matchesStatus = normalizedJobStatus.isEmpty() || normalizedJobStatus.equals(rowStatus);
            boolean matchesType = normalizedExecutionType.isEmpty() || normalizedExecutionType.equals(rowType);
            if (matchesStatus && matchesType) {
                filteredRows.add(row);
            }
        }
        model.addAttribute("jobStatus", normalizedJobStatus);
        model.addAttribute("executionType", normalizedExecutionType);
        model.addAttribute("schedulerSummary", adminSummaryService.getSchedulerSummary(isEn));
        model.addAttribute("schedulerJobRows", filteredRows);
        model.addAttribute("schedulerNodeRows", controller.buildSchedulerNodeRows(isEn));
        model.addAttribute("schedulerExecutionRows", controller.buildSchedulerExecutionRows(isEn));
        model.addAttribute("schedulerPlaybooks", controller.buildSchedulerPlaybooks(isEn));
    }

    public void populateBackupConfigPage(Model model, boolean isEn) {
        Map<String, Object> payload = adminShellBootstrapPageService.buildBackupConfigPageData(isEn);
        for (Map.Entry<String, Object> entry : payload.entrySet()) {
            model.addAttribute(entry.getKey(), entry.getValue());
        }
    }
}
