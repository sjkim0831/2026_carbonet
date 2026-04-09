package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.service.AdminSchedulerBootstrapReadService;
import egovframework.com.feature.admin.service.AdminSecurityBootstrapReadService;
import egovframework.com.platform.read.AdminSummaryReadPort;
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
    private final AdminSummaryReadPort adminSummaryReadPort;
    private final AdminSecurityBootstrapReadService adminSecurityBootstrapReadService;
    private final AdminSchedulerBootstrapReadService adminSchedulerBootstrapReadService;
    private final ObjectProvider<egovframework.com.feature.admin.service.AdminShellBootstrapPageService> adminShellBootstrapPageServiceProvider;

    private AdminMainController adminMainController() {
        return adminMainControllerProvider.getObject();
    }

    private egovframework.com.feature.admin.service.AdminShellBootstrapPageService adminShellBootstrapPageService() {
        return adminShellBootstrapPageServiceProvider.getObject();
    }

    public void populateSecurityPolicyPage(Model model, boolean isEn) {
        model.addAllAttributes(adminSecurityBootstrapReadService.buildSecurityPolicyPageData(isEn));
    }

    public void populateSecurityMonitoringPage(Model model, boolean isEn) {
        model.addAllAttributes(adminSecurityBootstrapReadService.buildSecurityMonitoringPageData(isEn));
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
        model.addAttribute("blocklistSummary", adminSummaryReadPort.getBlocklistSummary(isEn));
        List<Map<String, String>> blocklistRows = new ArrayList<>(adminSummaryReadPort.getBlocklistRows(isEn));
        model.addAttribute("blocklistRows", blocklistRows.stream()
                .filter(row -> matchesBlocklistFilter(row, normalizedKeyword, normalizedBlockType, normalizedStatus, normalizedSource, controller))
                .toList());
        List<Map<String, String>> releaseQueue = new ArrayList<>(adminSummaryReadPort.getBlocklistReleaseQueue(isEn));
        model.addAttribute("blocklistReleaseQueue", releaseQueue.stream()
                .filter(row -> matchesQueueFilter(row, normalizedKeyword, normalizedSource, controller))
                .toList());
        List<Map<String, String>> releaseHistory = new ArrayList<>(adminSummaryReadPort.getBlocklistReleaseHistory(isEn));
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
        model.addAllAttributes(adminSecurityBootstrapReadService.buildSecurityAuditPageData(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                isEn));
    }

    public void populateSchedulerPage(
            String jobStatus,
            String executionType,
            Model model,
            boolean isEn) {
        model.addAllAttributes(adminSchedulerBootstrapReadService.buildSchedulerPageData(jobStatus, executionType, isEn));
    }

    public void populateBackupConfigPage(Model model, boolean isEn) {
        Map<String, Object> payload = adminShellBootstrapPageService().buildBackupConfigPageData(isEn);
        for (Map.Entry<String, Object> entry : payload.entrySet()) {
            model.addAttribute(entry.getKey(), entry.getValue());
        }
    }
}
