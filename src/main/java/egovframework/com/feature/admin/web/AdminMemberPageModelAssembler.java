package egovframework.com.feature.admin.web;

import egovframework.com.feature.auth.domain.entity.PasswordResetHistory;
import egovframework.com.feature.auth.service.AuthService;
import egovframework.com.feature.admin.service.AuthGroupManageService;
import egovframework.com.feature.auth.domain.entity.EmplyrInfo;
import egovframework.com.feature.admin.model.vo.FeatureCatalogSectionVO;
import egovframework.com.feature.member.model.vo.EntrprsManageVO;
import egovframework.com.feature.member.model.vo.InsttFileVO;
import egovframework.com.feature.member.model.vo.InsttInfoVO;
import egovframework.com.feature.member.model.vo.InstitutionStatusVO;
import egovframework.com.feature.member.service.EnterpriseMemberService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminMemberPageModelAssembler {

    private static final Logger log = LoggerFactory.getLogger(AdminMemberPageModelAssembler.class);

    private final ObjectProvider<AdminMainController> adminMainControllerProvider;
    private final EnterpriseMemberService entrprsManageService;
    private final AuthService authService;
    private final AuthGroupManageService authGroupManageService;
    private final AdminAuthorityPagePayloadSupport authorityPagePayloadSupport;

    private AdminMainController adminMainController() {
        return adminMainControllerProvider.getObject();
    }

    public void populateCompanyAccountModel(String insttId, boolean isEn, Model model) {
        AdminMainController controller = adminMainController();
        InstitutionStatusVO form = loadInstitutionInfoByInsttId(controller, insttId);
        if (form == null || form.isEmpty()) {
            form = new InstitutionStatusVO();
            form.setEntrprsSeCode("E");
        }
        model.addAttribute("companyAccountForm", form);
        model.addAttribute("companyAccountFiles", loadInsttFilesByInsttId(controller, insttId));
        model.addAttribute("companyAccountAction", isEn ? "/en/admin/member/company_account" : "/admin/member/company_account");
        model.addAttribute("companyAccountFileBaseUrl", isEn ? "/en/admin/member/company-file" : "/admin/member/company-file");
        model.addAttribute("companyAccountSaved", false);
        model.addAttribute("companyAccountErrors", Collections.emptyList());
    }

    public void populateCompanyDetailModel(String insttId, boolean isEn, HttpServletRequest request, Locale locale, Model model) {
        AdminMainController controller = adminMainController();
        String normalizedInsttId = controller.safeString(insttId);
        model.addAttribute("companyFiles", Collections.emptyList());
        model.addAttribute("companyTypeLabel", "-");
        model.addAttribute("companyStatusLabel", "-");
        model.addAttribute("companyStatusBadgeClass", controller.resolveInstitutionStatusBadgeClass(""));
        if (normalizedInsttId.isEmpty()) {
            model.addAttribute("companyDetailError", isEn ? "Company ID is required." : "기관 ID가 필요합니다.");
            return;
        }
        InstitutionStatusVO company = loadInstitutionInfoByInsttId(controller, normalizedInsttId);
        if (company == null || controller.safeString(company.getInsttId()).isEmpty()) {
            model.addAttribute("companyDetailError", isEn ? "The company could not be found." : "대상 회원사를 찾을 수 없습니다.");
            return;
        }
        List<InsttFileVO> companyFiles = loadInsttFilesByInsttId(controller, normalizedInsttId);
        model.addAttribute("company", company);
        model.addAttribute("companyFiles", companyFiles);
        model.addAttribute("companyTypeLabel", isEn
                ? controller.resolveMembershipTypeLabelEn(company.getEntrprsSeCode())
                : controller.resolveMembershipTypeLabel(company.getEntrprsSeCode()));
        model.addAttribute("companyStatusLabel", isEn
                ? controller.resolveInstitutionStatusLabelEn(company.getInsttSttus())
                : controller.resolveInstitutionStatusLabel(company.getInsttSttus()));
        model.addAttribute("companyStatusBadgeClass", controller.resolveInstitutionStatusBadgeClass(company.getInsttSttus()));
        model.addAttribute("companyEditUrl",
                controller.adminPrefix(request, locale) + "/member/company_account?insttId=" + controller.urlEncode(normalizedInsttId));
        model.addAttribute("companyListUrl", controller.adminPrefix(request, locale) + "/member/company_list");
    }

    public void populatePasswordResetHistory(
            String pageIndexParam,
            String searchKeyword,
            String resetSource,
            String requestedInsttId,
            HttpServletRequest request,
            Model model,
            boolean isEn) {
        AdminMainController controller = adminMainController();
        int pageIndex = 1;
        if (pageIndexParam != null && !pageIndexParam.trim().isEmpty()) {
            try {
                pageIndex = Integer.parseInt(pageIndexParam.trim());
            } catch (NumberFormatException ignored) {
                pageIndex = 1;
            }
        }

        int currentPage = Math.max(pageIndex, 1);
        int pageSize = 10;
        String keyword = controller.safeString(searchKeyword);
        String normalizedSource = controller.safeString(resetSource).toUpperCase(Locale.ROOT);
        String currentUserId = controller.extractCurrentUserId(request);
        String currentUserAuthorCode = controller.resolveCurrentUserAuthorCode(currentUserId);
        boolean masterAccess = controller.hasMemberManagementMasterAccess(currentUserId, currentUserAuthorCode);
        String currentUserInsttId = controller.resolveCurrentUserInsttId(currentUserId);
        java.util.List<java.util.Map<String, String>> companyOptions = masterAccess
                ? controller.loadAccessHistoryCompanyOptions()
                : controller.buildScopedAccessHistoryCompanyOptions(currentUserInsttId);
        String selectedInsttId = masterAccess
                ? controller.resolveSelectedInsttId(requestedInsttId, companyOptions, true)
                : currentUserInsttId;
        model.addAttribute("companyOptions", companyOptions);
        model.addAttribute("selectedInsttId", selectedInsttId);
        model.addAttribute("canManageAllCompanies", masterAccess);

        Page<PasswordResetHistory> historyPage;
        try {
            historyPage = authService.searchPasswordResetHistories(
                    keyword,
                    normalizedSource,
                    selectedInsttId,
                    PageRequest.of(Math.max(currentPage - 1, 0), pageSize, Sort.by(Sort.Direction.DESC, "resetPnttm")));
        } catch (Exception e) {
            log.error("Failed to load password reset history.", e);
            historyPage = Page.empty(PageRequest.of(0, pageSize));
            model.addAttribute("member_resetPasswordError",
                    isEn ? "Failed to load password reset history." : "비밀번호 초기화 이력을 불러오지 못했습니다.");
        }

        int totalCount = Math.toIntExact(historyPage.getTotalElements());
        int totalPages = Math.max(historyPage.getTotalPages(), 1);
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        int startPage = Math.max(1, currentPage - 4);
        int endPage = Math.min(totalPages, startPage + 9);
        if (endPage - startPage < 9) {
            startPage = Math.max(1, endPage - 9);
        }
        int prevPage = Math.max(1, currentPage - 1);
        int nextPage = Math.min(totalPages, currentPage + 1);

        model.addAttribute("passwordResetHistoryList", controller.buildPasswordResetHistoryListRows(historyPage.getContent(), isEn));
        model.addAttribute("totalCount", totalCount);
        model.addAttribute("pageIndex", currentPage);
        model.addAttribute("pageSize", pageSize);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("startPage", startPage);
        model.addAttribute("endPage", endPage);
        model.addAttribute("prevPage", prevPage);
        model.addAttribute("nextPage", nextPage);
        model.addAttribute("searchKeyword", keyword);
        model.addAttribute("resetSource", normalizedSource);
    }

    public void populateMemberEditModel(Model model, EntrprsManageVO member, boolean isEn, String currentUserId) throws Exception {
        AdminMainController controller = adminMainController();
        controller.ensureMemberEditDefaults(model, isEn);
        InstitutionStatusVO institutionInfo = controller.loadInstitutionInfo(member);
        EntrprsManageVO displayMember = controller.mergeMemberWithInstitutionInfo(member, institutionInfo);
        model.addAttribute("member", displayMember);
        model.addAttribute("memberEvidenceFiles", controller.loadEvidenceFiles(displayMember));
        model.addAttribute("memberId", controller.safeString(displayMember.getEntrprsmberId()));
        model.addAttribute("phoneNumber",
                controller.formatPhoneNumber(displayMember.getAreaNo(), displayMember.getEntrprsMiddleTelno(), displayMember.getEntrprsEndTelno()));
        model.addAttribute("membershipTypeLabel", isEn
                ? controller.resolveMembershipTypeLabelEn(displayMember.getEntrprsSeCode())
                : controller.resolveMembershipTypeLabel(displayMember.getEntrprsSeCode()));
        model.addAttribute("businessRoleLabel", isEn
                ? controller.resolveBusinessRoleLabelEn(displayMember.getEntrprsSeCode())
                : controller.resolveBusinessRoleLabel(displayMember.getEntrprsSeCode()));
        model.addAttribute("accessScopes", isEn
                ? controller.resolveAccessScopesEn(displayMember.getEntrprsSeCode())
                : controller.resolveAccessScopes(displayMember.getEntrprsSeCode()));
        model.addAttribute("statusLabel", isEn
                ? controller.resolveStatusLabelEn(displayMember.getEntrprsMberSttus())
                : controller.resolveStatusLabel(displayMember.getEntrprsMberSttus()));
        model.addAttribute("memberStatusCode", controller.safeString(displayMember.getEntrprsMberSttus()).toUpperCase());
        model.addAttribute("memberTypeCode", controller.safeString(displayMember.getEntrprsSeCode()).toUpperCase());
        model.addAttribute("memberDocumentStatusLabel", isEn
                ? controller.resolveDocumentStatusLabelEn(displayMember.getBizRegFilePath())
                : controller.resolveDocumentStatusLabel(displayMember.getBizRegFilePath()));
        if (institutionInfo != null && !institutionInfo.isEmpty()) {
            model.addAttribute("institutionInfo", institutionInfo);
            model.addAttribute("institutionStatusLabel", isEn
                    ? controller.resolveInstitutionStatusLabelEn(stringValue(institutionInfo.getInsttSttus()))
                    : controller.resolveInstitutionStatusLabel(stringValue(institutionInfo.getInsttSttus())));
            model.addAttribute("institutionInsttId", stringValue(institutionInfo.getInsttId()));
            model.addAttribute("documentStatusLabel", isEn
                    ? controller.resolveDocumentStatusLabelEn(stringValue(institutionInfo.getBizRegFilePath()))
                    : controller.resolveDocumentStatusLabel(stringValue(institutionInfo.getBizRegFilePath())));
        } else {
            model.addAttribute("institutionStatusLabel", "-");
            model.addAttribute("institutionInsttId", "");
            model.addAttribute("documentStatusLabel", isEn ? "No document registered" : "등록 문서 없음");
        }
        List<Map<String, Object>> permissionAuthorGroupSections = controller.buildMemberEditAuthorGroupSections(
                displayMember,
                isEn,
                currentUserId);
        controller.populatePermissionEditorModel(
                model,
                controller.flattenPermissionAuthorGroupSections(permissionAuthorGroupSections),
                controller.safeString(authGroupManageService.selectEnterpriseAuthorCodeByUserId(displayMember.getEntrprsmberId())),
                controller.safeString(displayMember.getUniqId()),
                null,
                isEn,
                currentUserId);
        model.addAttribute("permissionAuthorGroupSections", permissionAuthorGroupSections);
    }

    public void populateMemberDetailModel(String memberId, HttpServletRequest request, Model model, boolean isEn) {
        AdminMainController controller = adminMainController();
        controller.ensureMemberDetailDefaults(model, isEn);
        String normalizedMemberId = controller.safeString(memberId);
        model.addAttribute("memberId", normalizedMemberId);

        if (normalizedMemberId.isEmpty()) {
            model.addAttribute("member_detailError", isEn ? "Member ID was not provided." : "회원 ID가 전달되지 않았습니다.");
            return;
        }

        try {
            EntrprsManageVO member = entrprsManageService.selectEntrprsmberByMberId(normalizedMemberId);
            if (member == null || controller.safeString(member.getEntrprsmberId()).isEmpty()) {
                model.addAttribute("member_detailError", isEn ? "Member information was not found." : "회원 정보를 찾을 수 없습니다.");
                return;
            }
            if (!controller.canCurrentAdminAccessMember(request, member)) {
                model.addAttribute("member_detailError", isEn
                        ? "You can only view members in your own company."
                        : "본인 회사 소속 회원만 조회할 수 있습니다.");
                return;
            }

            InstitutionStatusVO institutionInfo = controller.loadInstitutionInfo(member);
            EntrprsManageVO displayMember = controller.mergeMemberWithInstitutionInfo(member, institutionInfo);
            model.addAttribute("member", displayMember);
            model.addAttribute("memberEvidenceFiles", controller.loadEvidenceFiles(displayMember));
            model.addAttribute("phoneNumber",
                    controller.formatPhoneNumber(displayMember.getAreaNo(), displayMember.getEntrprsMiddleTelno(), displayMember.getEntrprsEndTelno()));
            model.addAttribute("membershipTypeLabel", isEn
                    ? controller.resolveMembershipTypeLabelEn(displayMember.getEntrprsSeCode())
                    : controller.resolveMembershipTypeLabel(displayMember.getEntrprsSeCode()));
            model.addAttribute("statusLabel", isEn
                    ? controller.resolveStatusLabelEn(displayMember.getEntrprsMberSttus())
                    : controller.resolveStatusLabel(displayMember.getEntrprsMberSttus()));
            model.addAttribute("statusBadgeClass", controller.resolveStatusBadgeClass(displayMember.getEntrprsMberSttus()));

            String selectedAuthorCode = controller.safeString(authGroupManageService.selectEnterpriseAuthorCodeByUserId(displayMember.getEntrprsmberId()));
            controller.populatePermissionEditorModel(
                    model,
                    Collections.emptyList(),
                    selectedAuthorCode,
                    controller.safeString(displayMember.getUniqId()),
                    null,
                    isEn,
                    controller.extractCurrentUserId(request));

            List<PasswordResetHistory> histories = authService.findRecentPasswordResetHistories(normalizedMemberId);
            model.addAttribute("passwordResetHistoryRows", controller.buildPasswordResetHistoryRows(histories));
        } catch (Exception e) {
            log.error("Failed to load member detail page api. memberId={}", normalizedMemberId, e);
            model.addAttribute("member_detailError",
                    isEn ? "An error occurred while retrieving member information." : "회원 정보 조회 중 오류가 발생했습니다.");
        }
    }

    public void populateAdminAccountEditModel(
            Model model,
            EmplyrInfo adminMember,
            boolean isEn,
            List<String> effectiveFeatureCodes,
            String currentUserId) throws Exception {
        AdminMainController controller = adminMainController();
        controller.ensureAdminAccountDefaults(model, isEn);
        model.addAttribute("adminPermissionTarget", adminMember);
        model.addAttribute("adminPermissionStatusLabel", isEn
                ? controller.resolveStatusLabelEn(adminMember.getEmplyrStusCode())
                : controller.resolveStatusLabel(adminMember.getEmplyrStusCode()));
        model.addAttribute("adminPermissionJoinedAt",
                adminMember.getSbscrbDe() == null ? "-"
                        : adminMember.getSbscrbDe().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        Object adminAccountMode = model.getAttribute("adminAccountMode");
        model.addAttribute("adminAccountReadOnly", "detail".equalsIgnoreCase(adminAccountMode == null ? "" : adminAccountMode.toString()));
        List<Map<String, Object>> permissionAuthorGroupSections = controller.buildAdminPermissionAuthorGroupSections(
                adminMember,
                isEn,
                currentUserId);
        controller.populatePermissionEditorModel(
                model,
                controller.flattenPermissionAuthorGroupSections(permissionAuthorGroupSections),
                controller.safeString(authGroupManageService.selectAuthorCodeByUserId(adminMember.getEmplyrId())),
                controller.safeString(adminMember.getEsntlId()),
                effectiveFeatureCodes,
                isEn,
                currentUserId);
        model.addAttribute("permissionAuthorGroupSections", permissionAuthorGroupSections);
    }

    public void populateAdminAccountCreatePageModel(Model model, boolean isEn) {
        try {
            List<FeatureCatalogSectionVO> featureSections =
                    authorityPagePayloadSupport.buildFeatureCatalogSections(authGroupManageService.selectFeatureCatalog(), isEn);
            AdminMainController controller = adminMainController();
            java.util.Map<String, String> presetAuthorCodes = controller.defaultAdminPresetAuthorCodes();
            java.util.Map<String, java.util.List<String>> presetFeatureCodes = new java.util.LinkedHashMap<>();
            for (java.util.Map.Entry<String, String> entry : presetAuthorCodes.entrySet()) {
                presetFeatureCodes.put(entry.getKey(), controller.normalizeFeatureCodes(authGroupManageService.selectAuthorFeatureCodes(entry.getValue())));
            }
            model.addAttribute("permissionFeatureSections", featureSections);
            model.addAttribute("adminAccountCreatePresetAuthorCodes", presetAuthorCodes);
            model.addAttribute("adminAccountCreatePresetFeatureCodes", presetFeatureCodes);
            model.addAttribute("permissionFeatureCount", presetFeatureCodes.get("MASTER") == null ? 0 : presetFeatureCodes.get("MASTER").size());
            model.addAttribute("permissionPageCount",
                    authorityPagePayloadSupport.countSelectedPageCount(featureSections, presetFeatureCodes.get("MASTER")));
        } catch (Exception e) {
            log.error("Failed to populate admin account create page model.", e);
            model.addAttribute("adminAccountCreateError", isEn
                    ? "Failed to load role feature information."
                    : "권한 롤 기능 정보를 불러오지 못했습니다.");
            model.addAttribute("permissionFeatureSections", Collections.emptyList());
            model.addAttribute("adminAccountCreatePresetFeatureCodes", Collections.emptyMap());
            model.addAttribute("permissionFeatureCount", 0);
            model.addAttribute("permissionPageCount", 0);
        }
    }

    private InstitutionStatusVO loadInstitutionInfoByInsttId(AdminMainController controller, String insttId) {
        if (controller.safeString(insttId).isEmpty()) {
            return null;
        }
        try {
            InsttInfoVO searchVO = new InsttInfoVO();
            searchVO.setInsttId(insttId);
            return entrprsManageService.selectInsttInfoForStatus(searchVO);
        } catch (Exception e) {
            log.warn("Failed to load institution info. insttId={}", insttId, e);
            return null;
        }
    }

    private List<InsttFileVO> loadInsttFilesByInsttId(AdminMainController controller, String insttId) {
        if (controller.safeString(insttId).isEmpty()) {
            return Collections.emptyList();
        }
        try {
            List<InsttFileVO> fileList = entrprsManageService.selectInsttFiles(insttId);
            return fileList == null ? Collections.emptyList() : fileList;
        } catch (Exception e) {
            log.warn("Failed to load institution file list. insttId={}", insttId, e);
            return Collections.emptyList();
        }
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
