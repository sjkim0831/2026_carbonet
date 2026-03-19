package egovframework.com.feature.admin.web;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminHotPathPagePayloadService {

    private final AdminAuthorityPagePayloadService authorityPagePayloadService;
    private final AdminApprovalPagePayloadService approvalPagePayloadService;
    private final AdminMemberPagePayloadService memberPagePayloadService;

    public Map<String, Object> buildAuthGroupPagePayload(
            String authorCode,
            String roleCategory,
            String insttId,
            String menuCode,
            String featureCode,
            String userSearchKeyword,
            HttpServletRequest request,
            Locale locale) {
        return authorityPagePayloadService.buildAuthGroupPagePayload(
                authorCode,
                roleCategory,
                insttId,
                menuCode,
                featureCode,
                userSearchKeyword,
                request,
                locale);
    }

    public Map<String, Object> buildDeptRolePagePayload(
            String updated,
            String insttId,
            String memberSearchKeyword,
            Integer memberPageIndex,
            String error,
            HttpServletRequest request,
            Locale locale) {
        return authorityPagePayloadService.buildDeptRolePagePayload(
                updated,
                insttId,
                memberSearchKeyword,
                memberPageIndex,
                error,
                request,
                locale);
    }

    public Map<String, Object> buildMemberEditPagePayload(
            String memberId,
            String updated,
            HttpServletRequest request,
            Locale locale) {
        return memberPagePayloadService.buildMemberEditPagePayload(memberId, updated, request, locale);
    }

    public Map<String, Object> buildAuthChangePagePayload(
            String updated,
            String targetUserId,
            String error,
            HttpServletRequest request,
            Locale locale) {
        return authorityPagePayloadService.buildAuthChangePagePayload(updated, targetUserId, error, request, locale);
    }

    public Map<String, Object> buildMemberApprovePagePayload(
            String pageIndexParam,
            String searchKeyword,
            String membershipType,
            String sbscrbSttus,
            String result,
            HttpServletRequest request,
            Locale locale) {
        return approvalPagePayloadService.buildMemberApprovePagePayload(
                pageIndexParam,
                searchKeyword,
                membershipType,
                sbscrbSttus,
                result,
                request,
                locale);
    }

    public Map<String, Object> buildCompanyApprovePagePayload(
            String pageIndexParam,
            String searchKeyword,
            String sbscrbSttus,
            String result,
            HttpServletRequest request,
            Locale locale) {
        return approvalPagePayloadService.buildCompanyApprovePagePayload(
                pageIndexParam,
                searchKeyword,
                sbscrbSttus,
                result,
                request,
                locale);
    }

    public Map<String, Object> buildMemberListPagePayload(
            String pageIndexParam,
            String searchKeyword,
            String membershipType,
            String sbscrbSttus,
            HttpServletRequest request,
            Locale locale) {
        return memberPagePayloadService.buildMemberListPagePayload(
                pageIndexParam,
                searchKeyword,
                membershipType,
                sbscrbSttus,
                request,
                locale);
    }

    public Map<String, Object> buildCompanyListPagePayload(
            String pageIndexParam,
            String searchKeyword,
            String sbscrbSttus,
            HttpServletRequest request,
            Locale locale) {
        return memberPagePayloadService.buildCompanyListPagePayload(
                pageIndexParam,
                searchKeyword,
                sbscrbSttus,
                request,
                locale);
    }

    public Map<String, Object> buildCompanyDetailPagePayload(
            String insttId,
            HttpServletRequest request,
            Locale locale) {
        return memberPagePayloadService.buildCompanyDetailPagePayload(insttId, request, locale);
    }

    public Map<String, Object> buildCompanyAccountPagePayload(
            String insttId,
            String saved,
            HttpServletRequest request,
            Locale locale) {
        return memberPagePayloadService.buildCompanyAccountPagePayload(insttId, saved, request, locale);
    }

    public Map<String, Object> buildAdminListPagePayload(
            String pageIndexParam,
            String searchKeyword,
            String sbscrbSttus,
            HttpServletRequest request,
            Locale locale) {
        return memberPagePayloadService.buildAdminListPagePayload(
                pageIndexParam,
                searchKeyword,
                sbscrbSttus,
                request,
                locale);
    }

    public Map<String, Object> buildMemberDetailPagePayload(
            String memberId,
            HttpServletRequest request,
            Locale locale) {
        return memberPagePayloadService.buildMemberDetailPagePayload(memberId, request, locale);
    }

    public Map<String, Object> buildMemberStatsPagePayload(
            HttpServletRequest request,
            Locale locale) {
        return memberPagePayloadService.buildMemberStatsPagePayload(request, locale);
    }

    public Map<String, Object> buildMemberRegisterPagePayload(
            HttpServletRequest request,
            Locale locale) {
        return memberPagePayloadService.buildMemberRegisterPagePayload(request, locale);
    }

    public Map<String, Object> buildPasswordResetPagePayload(
            String pageIndexParam,
            String searchKeyword,
            String resetSource,
            String memberId,
            HttpServletRequest request,
            Locale locale) {
        return memberPagePayloadService.buildPasswordResetPagePayload(
                pageIndexParam,
                searchKeyword,
                resetSource,
                memberId,
                request,
                locale);
    }

    public Map<String, Object> buildAdminAccountCreatePagePayload(
            HttpServletRequest request,
            Locale locale) {
        return memberPagePayloadService.buildAdminAccountCreatePagePayload(request, locale);
    }
}
