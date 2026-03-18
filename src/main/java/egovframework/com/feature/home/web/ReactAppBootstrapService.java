package egovframework.com.feature.home.web;

import egovframework.com.feature.admin.service.AdminMenuTreeService;
import egovframework.com.feature.admin.service.AdminShellBootstrapPageService;
import egovframework.com.feature.auth.dto.response.FrontendSessionResponseDTO;
import egovframework.com.feature.auth.service.FrontendSessionService;
import egovframework.com.feature.home.service.HomeMenuService;
import egovframework.com.feature.home.service.HomeMypageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReactAppBootstrapService {

    private final FrontendSessionService frontendSessionService;
    private final HomeMenuService homeMenuService;
    private final HomeMypageService homeMypageService;
    private final AdminMenuTreeService adminMenuTreeService;
    private final AdminShellBootstrapPageService adminShellBootstrapPageService;

    public Map<String, Object> buildBootstrapPayload(String route, boolean en, boolean admin, HttpServletRequest request) {
        Map<String, Object> payload = new LinkedHashMap<>();
        FrontendSessionResponseDTO frontendSession = frontendSessionService.buildSession(request);
        payload.put("frontendSession", frontendSession);

        String normalizedRoute = route == null ? "" : route.trim().replace('-', '_').toLowerCase();
        if (!admin && "home".equals(normalizedRoute)) {
            Map<String, Object> homePayload = new LinkedHashMap<>();
            homePayload.put("isLoggedIn", frontendSession.isAuthenticated());
            homePayload.put("isEn", en);
            homePayload.put("homeMenu", homeMenuService.getHomeMenu(en));
            payload.put("homePayload", homePayload);
        }
        if (!admin && "mypage".equals(normalizedRoute)) {
            payload.put("mypagePayload", homeMypageService.buildMypagePayload(en, request));
            payload.put("mypageContext", homeMypageService.buildMypageContext(en, request));
        }
        if (admin) {
            payload.put("adminMenuTree", adminMenuTreeService.buildAdminMenuTree(en, request));
            if ("admin_home".equals(normalizedRoute)) {
                payload.put("adminHomePageData", adminShellBootstrapPageService.buildAdminHomePageData(en));
            } else if ("member_stats".equals(normalizedRoute)) {
                payload.put("memberStatsPageData", adminShellBootstrapPageService.buildMemberStatsPageData(en));
            } else if ("security_policy".equals(normalizedRoute)) {
                payload.put("securityPolicyPageData", adminShellBootstrapPageService.buildSecurityPolicyPageData(en));
            } else if ("security_monitoring".equals(normalizedRoute)) {
                payload.put("securityMonitoringPageData", adminShellBootstrapPageService.buildSecurityMonitoringPageData(en));
            } else if ("security_audit".equals(normalizedRoute)) {
                payload.put("securityAuditPageData", adminShellBootstrapPageService.buildSecurityAuditPageData(en));
            } else if ("scheduler_management".equals(normalizedRoute)) {
                payload.put("schedulerManagementPageData", adminShellBootstrapPageService.buildSchedulerPageData(
                        request == null ? "" : request.getParameter("jobStatus"),
                        request == null ? "" : request.getParameter("executionType"),
                        en));
            } else if ("emission_result_list".equals(normalizedRoute)) {
                payload.put("emissionResultListPageData", adminShellBootstrapPageService.buildEmissionResultListPageData(
                        request == null ? "" : request.getParameter("pageIndex"),
                        request == null ? "" : request.getParameter("searchKeyword"),
                        request == null ? "" : request.getParameter("resultStatus"),
                        request == null ? "" : request.getParameter("verificationStatus"),
                        en));
            }
        }
        return payload;
    }
}
