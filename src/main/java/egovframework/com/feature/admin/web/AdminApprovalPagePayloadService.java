package egovframework.com.feature.admin.web;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.ui.ExtendedModelMap;

import javax.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminApprovalPagePayloadService {

    private final ObjectProvider<AdminMainController> adminMainControllerProvider;
    private final AdminAuthorityPagePayloadSupport authorityPagePayloadSupport;

    private AdminMainController adminMainController() {
        return adminMainControllerProvider.getObject();
    }

    public Map<String, Object> buildMemberApprovePagePayload(
            String pageIndexParam,
            String searchKeyword,
            String membershipType,
            String sbscrbSttus,
            String result,
            HttpServletRequest request,
            Locale locale) {
        AdminMainController controller = adminMainController();
        boolean isEn = controller.isEnglishRequest(request, locale);
        controller.primeCsrfToken(request);
        ExtendedModelMap model = new ExtendedModelMap();
        controller.populateMemberApprovalList(
                pageIndexParam,
                searchKeyword,
                membershipType,
                sbscrbSttus,
                result,
                model,
                isEn,
                request,
                locale);
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        String currentUserId = controller.extractCurrentUserId(request);
        String currentUserAuthorCode = authorityPagePayloadSupport.resolveCurrentUserAuthorCode(currentUserId);
        boolean canView = authorityPagePayloadSupport.hasMemberManagementCompanyOperatorAccess(currentUserId, currentUserAuthorCode);
        response.put("canViewMemberApprove", canView);
        response.put("canUseMemberApproveAction", canView);
        return response;
    }

    public Map<String, Object> buildCompanyApprovePagePayload(
            String pageIndexParam,
            String searchKeyword,
            String sbscrbSttus,
            String result,
            HttpServletRequest request,
            Locale locale) {
        AdminMainController controller = adminMainController();
        boolean isEn = controller.isEnglishRequest(request, locale);
        controller.primeCsrfToken(request);
        ExtendedModelMap model = new ExtendedModelMap();
        controller.populateCompanyApprovalList(
                pageIndexParam,
                searchKeyword,
                sbscrbSttus,
                result,
                model,
                isEn,
                request,
                locale);
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        String currentUserId = controller.extractCurrentUserId(request);
        String currentUserAuthorCode = authorityPagePayloadSupport.resolveCurrentUserAuthorCode(currentUserId);
        boolean canManage = authorityPagePayloadSupport.hasMemberManagementMasterAccess(currentUserId, currentUserAuthorCode);
        response.put("canViewCompanyApprove", canManage);
        response.put("canUseCompanyApproveAction", canManage);
        return response;
    }
}
