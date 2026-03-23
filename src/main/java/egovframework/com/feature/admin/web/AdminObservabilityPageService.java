package egovframework.com.feature.admin.web;

import org.springframework.stereotype.Service;
import org.springframework.ui.ExtendedModelMap;

import javax.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AdminObservabilityPageService {

    private final AdminListPageModelAssembler adminListPageModelAssembler;
    private final AdminSystemPageModelAssembler adminSystemPageModelAssembler;

    public AdminObservabilityPageService(AdminListPageModelAssembler adminListPageModelAssembler,
                                         AdminSystemPageModelAssembler adminSystemPageModelAssembler) {
        this.adminListPageModelAssembler = adminListPageModelAssembler;
        this.adminSystemPageModelAssembler = adminSystemPageModelAssembler;
    }

    public Map<String, Object> buildSecurityHistoryPagePayload(
            String pageIndexParam,
            String searchKeyword,
            String userSe,
            String insttId,
            HttpServletRequest request,
            boolean isEn) {
        ExtendedModelMap model = new ExtendedModelMap();
        adminListPageModelAssembler.populateBlockedLoginHistory(
                pageIndexParam,
                searchKeyword,
                userSe,
                insttId,
                model,
                request);
        model.addAttribute("isEn", isEn);
        return new LinkedHashMap<>(model);
    }

    public Map<String, Object> buildLoginHistoryPagePayload(
            String pageIndexParam,
            String searchKeyword,
            String userSe,
            String loginResult,
            String insttId,
            HttpServletRequest request,
            boolean isEn) {
        ExtendedModelMap model = new ExtendedModelMap();
        adminListPageModelAssembler.populateLoginHistory(
                pageIndexParam,
                searchKeyword,
                userSe,
                loginResult,
                insttId,
                model,
                request);
        model.addAttribute("isEn", isEn);
        return new LinkedHashMap<>(model);
    }

    public Map<String, Object> buildSecurityPolicyPagePayload(boolean isEn) {
        ExtendedModelMap model = new ExtendedModelMap();
        adminSystemPageModelAssembler.populateSecurityPolicyPage(model, isEn);
        model.addAttribute("isEn", isEn);
        return new LinkedHashMap<>(model);
    }

    public Map<String, Object> buildSecurityMonitoringPagePayload(boolean isEn) {
        ExtendedModelMap model = new ExtendedModelMap();
        adminSystemPageModelAssembler.populateSecurityMonitoringPage(model, isEn);
        model.addAttribute("isEn", isEn);
        return new LinkedHashMap<>(model);
    }

    public Map<String, Object> buildBlocklistPagePayload(
            String searchKeyword,
            String blockType,
            String status,
            boolean isEn) {
        ExtendedModelMap model = new ExtendedModelMap();
        adminSystemPageModelAssembler.populateBlocklistPage(searchKeyword, blockType, status, model, isEn);
        model.addAttribute("isEn", isEn);
        return new LinkedHashMap<>(model);
    }

    public Map<String, Object> buildSecurityAuditPagePayload(boolean isEn) {
        ExtendedModelMap model = new ExtendedModelMap();
        adminSystemPageModelAssembler.populateSecurityAuditPage(model, isEn);
        model.addAttribute("isEn", isEn);
        return new LinkedHashMap<>(model);
    }

    public Map<String, Object> buildSchedulerPagePayload(
            String jobStatus,
            String executionType,
            boolean isEn) {
        ExtendedModelMap model = new ExtendedModelMap();
        adminSystemPageModelAssembler.populateSchedulerPage(jobStatus, executionType, model, isEn);
        model.addAttribute("isEn", isEn);
        return new LinkedHashMap<>(model);
    }
}
