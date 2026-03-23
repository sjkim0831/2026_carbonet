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
        model.addAttribute("securityMonitoringTargets", controller.buildSecurityMonitoringTargets(isEn));
        model.addAttribute("securityMonitoringIps", controller.buildSecurityMonitoringIps(isEn));
        model.addAttribute("securityMonitoringEvents", controller.buildSecurityMonitoringEvents(isEn));
    }

    public void populateBlocklistPage(
            String searchKeyword,
            String blockType,
            String status,
            Model model,
            boolean isEn) {
        AdminMainController controller = adminMainController();
        model.addAttribute("searchKeyword", controller.safeString(searchKeyword));
        model.addAttribute("blockType", controller.safeString(blockType).toUpperCase(Locale.ROOT));
        model.addAttribute("status", controller.safeString(status).toUpperCase(Locale.ROOT));
        model.addAttribute("blocklistSummary", adminSummaryService.getBlocklistSummary(isEn));
        model.addAttribute("blocklistRows", controller.buildBlocklistRows(isEn));
        model.addAttribute("blocklistReleaseQueue", controller.buildBlocklistReleaseQueue(isEn));
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
}
