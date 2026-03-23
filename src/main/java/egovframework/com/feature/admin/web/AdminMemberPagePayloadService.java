package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.service.AuthorRoleProfileService;
import egovframework.com.feature.member.model.vo.EntrprsManageVO;
import egovframework.com.feature.member.service.EnterpriseMemberService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.ui.ExtendedModelMap;
import org.springframework.util.ObjectUtils;

import javax.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminMemberPagePayloadService {

    private static final Logger log = LoggerFactory.getLogger(AdminMemberPagePayloadService.class);

    private final ObjectProvider<AdminMainController> adminMainControllerProvider;
    private final EnterpriseMemberService entrprsManageService;
    private final AuthorRoleProfileService authorRoleProfileService;
    private final AdminAuthorityPagePayloadSupport authorityPagePayloadSupport;

    private AdminMainController adminMainController() {
        return adminMainControllerProvider.getObject();
    }

    public Map<String, Object> buildMemberEditPagePayload(
            String memberId,
            String updated,
            HttpServletRequest request,
            Locale locale) {
        AdminMainController controller = adminMainController();
        Map<String, Object> response = new LinkedHashMap<>();
        boolean isEn = controller.isEnglishRequest(request, locale);
        String normalizedMemberId = controller.safeString(memberId);
        ExtendedModelMap model = new ExtendedModelMap();
        model.addAttribute("memberId", normalizedMemberId);
        model.addAttribute("member_editUpdated", "true".equalsIgnoreCase(controller.safeString(updated)));
        controller.primeCsrfToken(request);
        controller.ensureMemberEditDefaults(model, isEn);

        if (normalizedMemberId.isEmpty()) {
            model.addAttribute("member_editError", isEn ? "Member ID was not provided." : "회원 ID가 전달되지 않았습니다.");
        } else {
            try {
                EntrprsManageVO member = entrprsManageService.selectEntrprsmberByMberId(normalizedMemberId);
                if (member == null || controller.safeString(member.getEntrprsmberId()).isEmpty()) {
                    model.addAttribute("member_editError", isEn ? "Member information was not found." : "회원 정보를 찾을 수 없습니다.");
                } else if (!controller.canCurrentAdminAccessMember(request, member)) {
                    model.addAttribute("member_editError", isEn
                            ? "You can only edit members in your own company."
                            : "본인 회사 소속 회원만 수정할 수 있습니다.");
                } else {
                    controller.populateMemberEditModel(model, member, isEn, controller.extractCurrentUserId(request));
                }
            } catch (Exception e) {
                log.error("Failed to load member edit page api. memberId={}", normalizedMemberId, e);
                model.addAttribute("member_editError", isEn
                        ? "An error occurred while retrieving member information."
                        : "회원 정보 조회 중 오류가 발생했습니다.");
            }
        }

        response.putAll(model);
        response.put("assignedRoleProfile",
                controller.toAuthorRoleProfileMap(
                        authorRoleProfileService.getProfile(String.valueOf(model.get("permissionSelectedAuthorCode")))));
        response.put("canViewMemberEdit", model.get("member") != null && model.get("member_editError") == null);
        response.put("canUseMemberSave", ObjectUtils.isEmpty(model.get("member_editError")));
        return response;
    }

    public Map<String, Object> buildMemberListPagePayload(
            String pageIndexParam,
            String searchKeyword,
            String membershipType,
            String sbscrbSttus,
            HttpServletRequest request,
            Locale locale) {
        AdminMainController controller = adminMainController();
        boolean isEn = controller.isEnglishRequest(request, locale);
        ExtendedModelMap model = new ExtendedModelMap();
        controller.primeCsrfToken(request);
        controller.populateMemberList(
                pageIndexParam,
                searchKeyword,
                membershipType,
                sbscrbSttus,
                model,
                request);
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        response.put("canViewMemberList", true);
        response.put("canUseMemberListActions", true);
        return response;
    }

    public Map<String, Object> buildCompanyListPagePayload(
            String pageIndexParam,
            String searchKeyword,
            String sbscrbSttus,
            HttpServletRequest request,
            Locale locale) {
        AdminMainController controller = adminMainController();
        boolean isEn = controller.isEnglishRequest(request, locale);
        ExtendedModelMap model = new ExtendedModelMap();
        controller.primeCsrfToken(request);
        String currentUserId = controller.extractCurrentUserId(request);
        String currentUserAuthorCode = authorityPagePayloadSupport.resolveCurrentUserAuthorCode(currentUserId);
        boolean canView = authorityPagePayloadSupport.hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode);
        if (canView) {
            controller.populateCompanyList(
                    pageIndexParam,
                    searchKeyword,
                    sbscrbSttus,
                    model,
                    request);
        } else {
            model.addAttribute("company_listError", isEn ? "Only global administrators can view the company list." : "회원사 목록은 전체 관리자만 조회할 수 있습니다.");
            model.addAttribute("company_list", Collections.emptyList());
            model.addAttribute("totalCount", 0);
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        response.put("canViewCompanyList", canView);
        response.put("canUseCompanyListActions", canView);
        return response;
    }

    public Map<String, Object> buildCompanyDetailPagePayload(
            String insttId,
            HttpServletRequest request,
            Locale locale) {
        AdminMainController controller = adminMainController();
        boolean isEn = controller.isEnglishRequest(request, locale);
        String currentUserId = controller.extractCurrentUserId(request);
        String currentUserAuthorCode = authorityPagePayloadSupport.resolveCurrentUserAuthorCode(currentUserId);
        ExtendedModelMap model = new ExtendedModelMap();
        controller.primeCsrfToken(request);
        if (!authorityPagePayloadSupport.hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode)) {
            model.addAttribute("companyDetailError", isEn ? "Only global administrators can view company details." : "회원사 상세는 전체 관리자만 조회할 수 있습니다.");
            Map<String, Object> forbiddenResponse = new LinkedHashMap<>();
            forbiddenResponse.putAll(model);
            forbiddenResponse.put("canViewCompanyDetail", false);
            forbiddenResponse.put("canUseCompanyEditLink", false);
            forbiddenResponse.put("companyDetailStatus", "FORBIDDEN");
            return forbiddenResponse;
        }
        controller.populateCompanyDetailModel(controller.safeString(insttId), isEn, request, locale, model);
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        boolean canView = model.getAttribute("company") != null && model.getAttribute("companyDetailError") == null;
        response.put("canViewCompanyDetail", canView);
        response.put("canUseCompanyEditLink", canView);
        response.put("companyDetailStatus", canView ? "OK" : "NOT_FOUND");
        return response;
    }

    public Map<String, Object> buildCompanyAccountPagePayload(
            String insttId,
            String saved,
            HttpServletRequest request,
            Locale locale) {
        AdminMainController controller = adminMainController();
        boolean isEn = controller.isEnglishRequest(request, locale);
        String currentUserId = controller.extractCurrentUserId(request);
        String currentUserAuthorCode = authorityPagePayloadSupport.resolveCurrentUserAuthorCode(currentUserId);
        Map<String, Object> response = new LinkedHashMap<>();
        if (!authorityPagePayloadSupport.hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode)) {
            response.put("companyAccountErrors", Collections.singletonList(
                    isEn ? "Only global administrators can manage company accounts." : "회원사 관리는 전체 관리자만 처리할 수 있습니다."));
            response.put("canViewCompanyAccount", false);
            response.put("canUseCompanyAccountSave", false);
            return response;
        }
        ExtendedModelMap model = new ExtendedModelMap();
        controller.populateCompanyAccountModel(controller.safeString(insttId), isEn, model);
        model.addAttribute("companyAccountSaved", "Y".equalsIgnoreCase(controller.safeString(saved)));
        response.putAll(model);
        response.put("canViewCompanyAccount", true);
        response.put("canUseCompanyAccountSave", true);
        response.put("isEditMode", !controller.safeString(insttId).isEmpty());
        return response;
    }

    public Map<String, Object> buildAdminListPagePayload(
            String pageIndexParam,
            String searchKeyword,
            String sbscrbSttus,
            HttpServletRequest request,
            Locale locale) {
        AdminMainController controller = adminMainController();
        boolean isEn = controller.isEnglishRequest(request, locale);
        ExtendedModelMap model = new ExtendedModelMap();
        controller.primeCsrfToken(request);
        controller.populateAdminMemberList(
                pageIndexParam,
                searchKeyword,
                sbscrbSttus,
                model);
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        response.put("canViewAdminList", true);
        response.put("canUseAdminListActions", "webmaster".equalsIgnoreCase(controller.extractCurrentUserId(request)));
        return response;
    }

    public Map<String, Object> buildMemberDetailPagePayload(
            String memberId,
            HttpServletRequest request,
            Locale locale) {
        AdminMainController controller = adminMainController();
        boolean isEn = controller.isEnglishRequest(request, locale);
        ExtendedModelMap model = new ExtendedModelMap();
        controller.primeCsrfToken(request);
        controller.populateMemberDetailModel(memberId, request, model, isEn);
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        response.put("viewName", isEn ? "egovframework/com/admin/member_detail_en" : "egovframework/com/admin/member_detail");
        boolean canView = model.getAttribute("member") != null && model.getAttribute("member_detailError") == null;
        response.put("canViewMemberDetail", canView);
        response.put("canUseMemberEditLink", canView);
        response.put("memberDetailStatus", canView ? "OK" : (model.getAttribute("member") == null ? "NOT_FOUND" : "FORBIDDEN"));
        return response;
    }

    public Map<String, Object> buildMemberStatsPagePayload(
            HttpServletRequest request,
            Locale locale) {
        AdminMainController controller = adminMainController();
        boolean isEn = controller.isEnglishRequest(request, locale);
        controller.primeCsrfToken(request);
        return controller.buildMemberStatsPageData(isEn);
    }

    public Map<String, Object> buildMemberRegisterPagePayload(
            HttpServletRequest request,
            Locale locale) {
        AdminMainController controller = adminMainController();
        boolean isEn = controller.isEnglishRequest(request, locale);
        controller.primeCsrfToken(request);
        return controller.buildMemberRegisterPageData(isEn);
    }

    public Map<String, Object> buildPasswordResetPagePayload(
            String pageIndexParam,
            String searchKeyword,
            String resetSource,
            String memberId,
            HttpServletRequest request,
            Locale locale) {
        AdminMainController controller = adminMainController();
        boolean isEn = controller.isEnglishRequest(request, locale);
        ExtendedModelMap model = new ExtendedModelMap();
        controller.primeCsrfToken(request);
        String currentUserId = controller.extractCurrentUserId(request);
        String currentUserAuthorCode = authorityPagePayloadSupport.resolveCurrentUserAuthorCode(currentUserId);
        boolean requiresOwnCompanyAccess = authorityPagePayloadSupport.requiresOwnCompanyAccess(currentUserId, currentUserAuthorCode);
        if (requiresOwnCompanyAccess && controller.safeString(memberId).isEmpty()) {
            model.addAttribute("passwordResetError", isEn
                    ? "Member ID is required for company-scoped administrators."
                    : "회사 범위 관리자에게는 회원 ID가 필요합니다.");
        } else {
            controller.populatePasswordResetHistory(
                    pageIndexParam,
                    controller.preferredResetHistoryKeyword(memberId, searchKeyword),
                    resetSource,
                    model,
                    isEn);
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        response.put("canViewResetHistory", true);
        response.put("canUseResetPassword", !requiresOwnCompanyAccess || !controller.safeString(memberId).isEmpty());
        return response;
    }

    public Map<String, Object> buildAdminAccountCreatePagePayload(
            HttpServletRequest request,
            Locale locale) {
        AdminMainController controller = adminMainController();
        boolean isEn = controller.isEnglishRequest(request, locale);
        String currentUserId = controller.extractCurrentUserId(request);
        ExtendedModelMap model = new ExtendedModelMap();
        controller.primeCsrfToken(request);
        controller.ensureAdminAccountCreateDefaults(model, isEn);
        controller.populateAdminAccountCreatePageModel(model, isEn);
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        response.put("currentUserId", currentUserId);
        response.put("canViewAdminAccountCreate", true);
        response.put("canUseAdminAccountCreate", "webmaster".equalsIgnoreCase(currentUserId));
        return response;
    }
}
