package egovframework.com.feature.admin.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.common.audit.AuditEventRecordVO;
import egovframework.com.common.audit.AuditEventSearchVO;
import egovframework.com.common.error.ErrorEventRecordVO;
import egovframework.com.common.error.ErrorEventSearchVO;
import egovframework.com.common.logging.AccessEventRecordVO;
import egovframework.com.common.logging.AccessEventSearchVO;
import egovframework.com.common.logging.RequestExecutionLogService;
import egovframework.com.common.logging.RequestExecutionLogPage;
import egovframework.com.common.logging.RequestExecutionLogVO;
import egovframework.com.feature.member.service.EnterpriseMemberService;
import egovframework.com.feature.member.service.EmployeeMemberService;
import egovframework.com.feature.member.model.vo.CompanyListItemVO;
import egovframework.com.feature.member.model.vo.EntrprsMberFileVO;
import egovframework.com.feature.member.model.vo.EntrprsManageVO;
import egovframework.com.feature.member.model.vo.InsttFileVO;
import egovframework.com.feature.member.model.vo.InsttInfoVO;
import egovframework.com.feature.member.model.vo.InstitutionStatusVO;
import egovframework.com.feature.member.model.vo.UserManageVO;
import egovframework.com.feature.admin.model.vo.AdminRoleAssignmentVO;
import egovframework.com.feature.admin.model.vo.AuthorRoleProfileVO;
import egovframework.com.feature.admin.model.vo.AuthorInfoVO;
import egovframework.com.feature.admin.model.vo.DepartmentRoleMappingVO;
import egovframework.com.feature.admin.model.vo.FeatureAssignmentStatVO;
import egovframework.com.feature.admin.model.vo.FeatureCatalogItemVO;
import egovframework.com.feature.admin.model.vo.FeatureCatalogSectionVO;
import egovframework.com.feature.admin.model.vo.FeatureCatalogSummarySnapshot;
import egovframework.com.feature.admin.model.vo.LoginHistorySearchVO;
import egovframework.com.feature.admin.model.vo.LoginHistoryVO;
import egovframework.com.feature.admin.model.vo.SecurityAuditSnapshot;
import egovframework.com.feature.admin.model.vo.UserAuthorityTargetVO;
import egovframework.com.feature.admin.model.vo.UserFeatureOverrideVO;
import egovframework.com.feature.admin.service.AdminLoginHistoryService;
import egovframework.com.feature.admin.service.AdminShellBootstrapPageService;
import egovframework.com.feature.admin.service.AuthorRoleProfileService;
import egovframework.com.feature.admin.service.AuthGroupManageService;
import egovframework.com.feature.admin.dto.request.AdminAuthGroupCreateRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminAuthorRoleProfileSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminAuthChangeSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminAuthGroupFeatureSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminDeptRoleMappingSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminDeptRoleMemberSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminMemberEditSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminMemberRegisterSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminPermissionSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminAdminAccountCreateRequestDTO;
import egovframework.com.feature.admin.dto.response.MenuInfoDTO;
import egovframework.com.feature.auth.domain.entity.EmplyrInfo;
import egovframework.com.feature.auth.domain.entity.EntrprsMber;
import egovframework.com.feature.auth.domain.entity.GnrlMber;
import egovframework.com.feature.auth.domain.entity.PasswordResetHistory;
import egovframework.com.feature.auth.domain.repository.EmployeeMemberRepository;
import egovframework.com.feature.auth.domain.repository.EnterpriseMemberRepository;
import egovframework.com.feature.auth.domain.repository.GeneralMemberRepository;
import egovframework.com.feature.member.dto.response.CompanySearchResponseDTO;
import egovframework.com.feature.auth.service.AuthService;
import egovframework.com.feature.auth.util.JwtTokenProvider;
import egovframework.com.feature.auth.util.ClientIpUtil;
import egovframework.com.common.audit.AuditTrailService;
import egovframework.com.common.util.FeatureCodeBitmap;
import egovframework.com.common.util.ReactPageUrlMapper;
import egovframework.com.framework.authority.service.FrameworkAuthorityPolicyService;
import egovframework.com.feature.home.web.ReactAppViewSupport;
import egovframework.com.platform.read.AdminSummaryReadPort;
import egovframework.com.platform.service.observability.PlatformObservabilityCompanyScopePort;
import io.jsonwebtoken.Claims;
import egovframework.com.common.service.CmmnDetailCode;
import egovframework.com.common.model.ComDefaultCodeVO;
import egovframework.com.common.service.CommonCodeService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.util.ObjectUtils;
import org.springframework.ui.Model;
import org.springframework.ui.ExtendedModelMap;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.Collection;
import java.util.BitSet;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;

@Controller
@RequestMapping({"/admin", "/en/admin"})
@RequiredArgsConstructor
public class AdminMainController {

    private static final String AUTH_GROUP_GENERAL_VIEW_FEATURE_CODE = "AUTH_GROUP_GENERAL_VIEW";
    private static final String ROLE_SYSTEM_MASTER = "ROLE_SYSTEM_MASTER";
    private static final String ROLE_SYSTEM_ADMIN = "ROLE_SYSTEM_ADMIN";
    private static final String ROLE_ADMIN = "ROLE_ADMIN";
    private static final String ROLE_OPERATION_ADMIN = "ROLE_OPERATION_ADMIN";

    private static final Logger log = LoggerFactory.getLogger(AdminMainController.class);

    private final JwtTokenProvider jwtProvider;
    private final EnterpriseMemberService entrprsManageService;
    private final EmployeeMemberService userManageService;
    private final EmployeeMemberRepository employMemberRepository;
    private final EnterpriseMemberRepository enterpriseMemberRepository;
    private final GeneralMemberRepository generalMemberRepository;
    private final CommonCodeService cmmUseService;
    private final AuthGroupManageService authGroupManageService;
    private final AdminLoginHistoryService adminLoginHistoryService;
    private final ObjectProvider<AdminShellBootstrapPageService> adminShellBootstrapPageServiceProvider;
    private final ObjectProvider<AdminHotPathPagePayloadService> adminHotPathPagePayloadServiceProvider;
    private final ObjectProvider<AdminApprovalPageModelAssembler> adminApprovalPageModelAssemblerProvider;
    private final ObjectProvider<AdminListPageModelAssembler> adminListPageModelAssemblerProvider;
    private final ObjectProvider<AdminSystemPageModelAssembler> adminSystemPageModelAssemblerProvider;
    private final ObjectProvider<AdminMemberPageModelAssembler> adminMemberPageModelAssemblerProvider;
    private final ObjectProvider<AdminEmissionResultPageModelAssembler> adminEmissionResultPageModelAssemblerProvider;
    private final AdminCompanyAccountService adminCompanyAccountService;
    private final AdminAdminPermissionService adminAdminPermissionService;
    private final AdminApprovalActionService adminApprovalActionService;
    private final AdminCertificateApprovalService adminCertificateApprovalService;
    private final AuthService authService;
    private final AdminSummaryReadPort adminSummaryReadPort;
    private final AuthorRoleProfileService authorRoleProfileService;
    private final AdminAuthorityPagePayloadSupport adminAuthorityPagePayloadSupport;
    private final AdminAuthorityCommandService adminAuthorityCommandService;
    private final PlatformObservabilityCompanyScopePort platformObservabilityCompanyScopePort;
    private final AdminMenuShellService adminMenuShellService;
    private final AdminMemberExportService adminMemberExportService;
    private final AuditTrailService auditTrailService;
    private final FrameworkAuthorityPolicyService frameworkAuthorityPolicyService;
    private final RequestExecutionLogService requestExecutionLogService;
    private final ObjectMapper objectMapper;
    private final AdminReactRouteSupport adminReactRouteSupport;
    private final ConcurrentMap<String, String> companyNameCache = new ConcurrentHashMap<>();

    private AdminHotPathPagePayloadService adminHotPathPagePayloadService() {
        return adminHotPathPagePayloadServiceProvider.getObject();
    }

    private AdminShellBootstrapPageService adminShellBootstrapPageService() {
        return adminShellBootstrapPageServiceProvider.getObject();
    }

    private AdminMemberPageModelAssembler adminMemberPageModelAssembler() {
        return adminMemberPageModelAssemblerProvider.getObject();
    }

    private AdminListPageModelAssembler adminListPageModelAssembler() {
        return adminListPageModelAssemblerProvider.getObject();
    }

    private AdminSystemPageModelAssembler adminSystemPageModelAssembler() {
        return adminSystemPageModelAssemblerProvider.getObject();
    }

    private AdminApprovalPageModelAssembler adminApprovalPageModelAssembler() {
        return adminApprovalPageModelAssemblerProvider.getObject();
    }

    private AdminEmissionResultPageModelAssembler adminEmissionResultPageModelAssembler() {
        return adminEmissionResultPageModelAssemblerProvider.getObject();
    }

    @RequestMapping(value = { "", "/" }, method = { RequestMethod.GET, RequestMethod.POST })
    public String adminMainEntry(HttpServletRequest request, Locale locale) {
        String requestUri = safeString(request == null ? null : request.getRequestURI());
        if ("/admin/".equals(requestUri)) {
            return "redirect:/admin";
        }
        if ("/en/admin/".equals(requestUri)) {
            return "redirect:/en/admin";
        }
        String accessToken = jwtProvider.getCookie(request, "accessToken");
        if (ObjectUtils.isEmpty(accessToken)) {
            return resolveAdminLoginRedirect(request);
        }
        return redirectReactMigration(request, locale, "admin-home");
    }

    String member_stats(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, "member-stats");
    }

    ResponseEntity<Map<String, Object>> memberStatsPageApi(HttpServletRequest request, Locale locale) {
        return ResponseEntity.ok(adminHotPathPagePayloadService().buildMemberStatsPagePayload(request, locale));
    }

    String member_register(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, "member-register");
    }

    @RequestMapping(value = "/external/connection_edit", method = { RequestMethod.GET, RequestMethod.POST })
    public String externalConnectionEditPage(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, "external-connection-edit");
    }

    @RequestMapping(value = "/emission/survey-admin", method = { RequestMethod.GET, RequestMethod.POST })
    public String emissionSurveyAdminPage(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, "emission-survey-admin");
    }

    @RequestMapping(value = "/emission/survey-admin-data", method = { RequestMethod.GET, RequestMethod.POST })
    public String emissionSurveyAdminDataPage(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, "emission-survey-admin-data");
    }

    ResponseEntity<Map<String, Object>> memberRegisterPageApi(HttpServletRequest request, Locale locale) {
        return ResponseEntity.ok(adminHotPathPagePayloadService().buildMemberRegisterPagePayload(request, locale));
    }

    ResponseEntity<Map<String, Object>> memberRegisterCheckIdApi(
            @RequestParam(value = "memberId", required = false) String memberId,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        if (!hasMemberManagementMasterAccess(currentUserId, currentUserAuthorCode)
                && !requiresMemberManagementCompanyScope(currentUserId, currentUserAuthorCode)) {
            return duplicateCheckError(HttpServletResponse.SC_FORBIDDEN, false,
                    isEn ? "You do not have permission to validate member IDs." : "회원 ID를 확인할 권한이 없습니다.");
        }

        String normalizedMemberId = safeString(memberId);
        if (!normalizedMemberId.matches("^[A-Za-z0-9]{6,12}$")) {
            return duplicateCheckError(HttpServletResponse.SC_BAD_REQUEST, false,
                    isEn ? "Use 6 to 12 letters or numbers for the member ID." : "회원 ID는 영문/숫자 6~12자로 입력해 주세요.");
        }

        boolean duplicated;
        try {
            duplicated = entrprsManageService.checkIdDplct(normalizedMemberId) > 0;
        } catch (Exception e) {
            log.error("Failed to check member id duplication. memberId={}", normalizedMemberId, e);
            return duplicateCheckError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, false,
                    isEn ? "An error occurred while checking the member ID." : "회원 ID 중복 확인 중 오류가 발생했습니다.");
        }

        return duplicateCheckSuccess(duplicated,
                duplicated
                        ? (isEn ? "This member ID is already in use." : "이미 사용 중인 회원 ID입니다.")
                        : (isEn ? "This member ID is available." : "사용 가능한 회원 ID입니다."));
    }

    ResponseEntity<Map<String, Object>> memberRegisterSubmitApi(
            @RequestBody AdminMemberRegisterSaveRequestDTO payload,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        boolean masterAccess = hasMemberManagementMasterAccess(currentUserId, currentUserAuthorCode);
        boolean companyScopedAccess = requiresMemberManagementCompanyScope(currentUserId, currentUserAuthorCode);
        if (!masterAccess && !companyScopedAccess) {
            return failureMessageResponse(HttpServletResponse.SC_FORBIDDEN, isEn
                    ? "You do not have permission to register members."
                    : "회원을 등록할 권한이 없습니다.");
        }

        String normalizedMemberId = trimToLen(safeString(payload == null ? null : payload.getMemberId()), 20);
        String normalizedApplicantName = trimToLen(safeString(payload == null ? null : payload.getApplcntNm()), 60);
        String password = safeString(payload == null ? null : payload.getPassword());
        String passwordConfirm = safeString(payload == null ? null : payload.getPasswordConfirm());
        String normalizedEmail = trimToLen(safeString(payload == null ? null : payload.getApplcntEmailAdres()), 100);
        String requestedInsttId = trimToLen(safeString(payload == null ? null : payload.getInsttId()), 20);
        String scopedInsttId = masterAccess ? requestedInsttId : resolveCurrentUserInsttId(currentUserId);
        String normalizedDeptNm = trimToLen(safeString(payload == null ? null : payload.getDeptNm()), 100);
        String normalizedAuthorCode = safeString(payload == null ? null : payload.getAuthorCode()).toUpperCase(Locale.ROOT);
        String normalizedZip = trimToLen(digitsOnly(safeString(payload == null ? null : payload.getZip())), 6);
        String normalizedAddress = trimToLen(safeString(payload == null ? null : payload.getAdres()), 100);
        String normalizedDetailAddress = trimToLen(safeString(payload == null ? null : payload.getDetailAdres()), 100);
        String[] phoneParts = splitPhoneNumber(payload == null ? null : payload.getPhoneNumber());

        List<String> errors = new ArrayList<>();
        if (!normalizedMemberId.matches("^[A-Za-z0-9]{6,12}$")) {
            errors.add(isEn ? "Use 6 to 12 letters or numbers for the member ID." : "회원 ID는 영문/숫자 6~12자로 입력해 주세요.");
        }
        if (normalizedApplicantName.isEmpty()) {
            errors.add(isEn ? "Please enter the member name." : "회원명을 입력해 주세요.");
        }
        if (!isStrongAdminPassword(password)) {
            errors.add(isEn ? "Use at least 8 characters with letters, numbers, and symbols." : "비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다.");
        }
        if (!password.equals(passwordConfirm)) {
            errors.add(isEn ? "The password confirmation does not match." : "비밀번호 확인이 일치하지 않습니다.");
        }
        if (!isValidEmail(normalizedEmail)) {
            errors.add(isEn ? "Please enter a valid email address." : "올바른 이메일 주소를 입력해 주세요.");
        }
        if (phoneParts == null) {
            errors.add(isEn ? "Please enter a valid phone number." : "연락처 형식이 올바르지 않습니다.");
        }
        if (scopedInsttId.isEmpty()) {
            errors.add(isEn ? "Please select an institution." : "소속 기관을 선택해 주세요.");
        }
        if (normalizedDeptNm.isEmpty()) {
            errors.add(isEn ? "Please select or enter a department." : "부서를 선택하거나 입력해 주세요.");
        }
        if (normalizedZip.isEmpty()) {
            errors.add(isEn ? "Please enter the postal code." : "우편번호를 입력해 주세요.");
        }
        if (normalizedAddress.isEmpty()) {
            errors.add(isEn ? "Please enter the address." : "주소를 입력해 주세요.");
        }

        InstitutionStatusVO institutionInfo = null;
        if (errors.isEmpty()) {
            institutionInfo = loadInstitutionInfoByInsttId(scopedInsttId);
            if (institutionInfo == null || institutionInfo.isEmpty()) {
                errors.add(isEn ? "The selected institution was not found." : "선택한 기관 정보를 찾을 수 없습니다.");
            }
        }

        String normalizedType = normalizeMembershipCode(safeString(payload == null ? null : payload.getEntrprsSeCode()).toUpperCase(Locale.ROOT));
        if (institutionInfo != null) {
            String institutionType = normalizeMembershipCode(safeString(institutionInfo.getEntrprsSeCode()).toUpperCase(Locale.ROOT));
            if (!institutionType.isEmpty()) {
                normalizedType = institutionType;
            }
        }
        String canonicalInsttId = institutionInfo == null ? "" : institutionInfo.getRawInsttId();
        if (canonicalInsttId == null || canonicalInsttId.trim().isEmpty()) {
            canonicalInsttId = scopedInsttId;
        }
        if (normalizedType.isEmpty()) {
            errors.add(isEn ? "The institution membership type could not be resolved." : "기관 회원 유형을 확인할 수 없습니다.");
        }

        try {
            if (!normalizedMemberId.isEmpty() && entrprsManageService.checkIdDplct(normalizedMemberId) > 0) {
                errors.add(isEn ? "This member ID is already in use." : "이미 사용 중인 회원 ID입니다.");
            }
        } catch (Exception e) {
            log.error("Failed to check duplication while registering member. memberId={}", normalizedMemberId, e);
            errors.add(isEn ? "Failed to verify the member ID." : "회원 ID 중복 확인에 실패했습니다.");
        }

        List<AuthorInfoVO> memberAssignableAuthorGroups = Collections.emptyList();
        List<String> baselineFeatureCodes = Collections.emptyList();
        if (errors.isEmpty()) {
            try {
                memberAssignableAuthorGroups = adminAuthorityPagePayloadSupport.filterMemberRegisterGeneralAuthorGroups(
                        loadGrantableMemberAuthorGroups(currentUserId, currentUserAuthorCode),
                        normalizedType);
                if (normalizedAuthorCode.isEmpty()) {
                    errors.add(isEn ? "Please select a role." : "권한 롤을 선택해 주세요.");
                } else if (!adminAuthorityPagePayloadSupport.isGrantableOrCurrentAuthorCode(
                        memberAssignableAuthorGroups,
                        normalizedAuthorCode,
                        "")) {
                    errors.add(isEn ? "Please select a valid role within your assignable scope." : "부여 가능한 범위 내의 유효한 권한 롤을 선택해 주세요.");
                } else {
                    baselineFeatureCodes = normalizeFeatureCodes(authGroupManageService.selectAuthorFeatureCodes(normalizedAuthorCode));
                }
            } catch (Exception e) {
                log.error("Failed to load member register role scope. memberId={}", normalizedMemberId, e);
                errors.add(isEn ? "Failed to load assignable role information." : "부여 가능한 권한 롤 정보를 불러오지 못했습니다.");
            }
        }

        if (!errors.isEmpty()) {
            return failureErrorsResponse(HttpServletResponse.SC_BAD_REQUEST, errors);
        }

        EntrprsManageVO member = new EntrprsManageVO();
        member.setUserTy("USR02");
        member.setEntrprsmberId(normalizedMemberId);
        member.setEntrprsMberPassword(password);
        member.setEntrprsMberPasswordHint("AUTO");
        member.setEntrprsMberPasswordCnsr("AUTO");
        member.setApplcntNm(normalizedApplicantName);
        member.setApplcntEmailAdres(normalizedEmail);
        member.setEntrprsSeCode(normalizedType);
        member.setEntrprsMberSttus("P");
        member.setInsttId(canonicalInsttId);
        member.setCmpnyNm(trimToLen(safeString(institutionInfo == null ? null : institutionInfo.getInsttNm()), 60));
        member.setBizrno(trimToLen(digitsOnly(safeString(institutionInfo == null ? null : institutionInfo.getBizrno())), 10));
        member.setCxfc(trimToLen(safeString(institutionInfo == null ? null : institutionInfo.getReprsntNm()), 60));
        String institutionZip = trimToLen(digitsOnly(safeString(institutionInfo == null ? null : institutionInfo.getZip())), 6);
        String institutionAddress = trimToLen(safeString(institutionInfo == null ? null : institutionInfo.getAdres()), 100);
        String institutionDetailAddress = trimToLen(safeString(institutionInfo == null ? null : institutionInfo.getDetailAdres()), 100);
        member.setZip(normalizedZip.isEmpty() ? (institutionZip.isEmpty() ? "000000" : institutionZip) : normalizedZip);
        member.setAdres(normalizedAddress.isEmpty() ? (institutionAddress.isEmpty() ? "주소미입력" : institutionAddress) : normalizedAddress);
        member.setDetailAdres(normalizedDetailAddress.isEmpty() ? institutionDetailAddress : normalizedDetailAddress);
        member.setDeptNm(normalizedDeptNm);
        member.setAreaNo(phoneParts[0]);
        member.setEntrprsMiddleTelno(phoneParts[1]);
        member.setEntrprsEndTelno(phoneParts[2]);
        member.setGroupId(null);
        member.setMarketingYn("N");
        member.setLockAt("N");

        try {
            entrprsManageService.insertEntrprsmber(member);
            entrprsManageService.ensureEnterpriseSecurityMapping(member.getUniqId());
            authGroupManageService.updateEnterpriseUserRoleAssignment(normalizedMemberId, normalizedAuthorCode);
            savePermissionOverrides(
                    safeString(member.getUniqId()),
                    "USR02",
                    baselineFeatureCodes,
                    baselineFeatureCodes,
                    currentUserId,
                    resolveGrantableFeatureCodeSet(currentUserId, isWebmaster(currentUserId)));
            recordAdminActionAudit(request,
                    currentUserId,
                    currentUserAuthorCode,
                    "AMENU_MEMBER_REGISTER",
                    "member-register",
                    "MEMBER_REGISTER_SAVE",
                    "MEMBER",
                    normalizedMemberId,
                    "{\"memberId\":\"" + safeJson(normalizedMemberId) + "\",\"insttId\":\"" + safeJson(canonicalInsttId) + "\",\"authorCode\":\"" + safeJson(normalizedAuthorCode) + "\"}",
                    "{\"status\":\"SUCCESS\"}");
            Map<String, Object> payloadBody = new LinkedHashMap<>();
            payloadBody.put("memberId", normalizedMemberId);
            payloadBody.put("authorCode", normalizedAuthorCode);
            payloadBody.put("insttId", canonicalInsttId);
            return successResponse(payloadBody);
        } catch (Exception e) {
            log.error("Failed to register member. memberId={}, insttId={}", normalizedMemberId, canonicalInsttId, e);
            return failureMessageResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    isEn ? "An error occurred while saving the member registration." : "회원 등록 저장 중 오류가 발생했습니다.");
        }
    }

    String member_approve(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "membershipType", required = false) String membershipType,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            @RequestParam(value = "result", required = false) String result,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "member-approve");
    }

    ResponseEntity<Map<String, Object>> memberApprovePageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "membershipType", required = false) String membershipType,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            @RequestParam(value = "result", required = false) String result,
            HttpServletRequest request,
            Locale locale) {
        Map<String, Object> response = adminHotPathPagePayloadService().buildMemberApprovePagePayload(
                pageIndexParam,
                searchKeyword,
                membershipType,
                sbscrbSttus,
                result,
                request,
                locale);
        boolean canManage = Boolean.TRUE.equals(response.get("canViewMemberApprove"));
        return canManage ? ResponseEntity.ok(response) : ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
    }

    String companyMemberApprove(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            @RequestParam(value = "result", required = false) String result,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "company-approve");
    }

    ResponseEntity<Map<String, Object>> companyApprovePageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            @RequestParam(value = "result", required = false) String result,
            HttpServletRequest request,
            Locale locale) {
        Map<String, Object> response = adminHotPathPagePayloadService().buildCompanyApprovePagePayload(
                pageIndexParam,
                searchKeyword,
                sbscrbSttus,
                result,
                request,
                locale);
        boolean canManage = Boolean.TRUE.equals(response.get("canViewCompanyApprove"));
        return canManage ? ResponseEntity.ok(response) : ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
    }

    String certificateApprove(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "requestType", required = false) String requestType,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "result", required = false) String result,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "certificate-approve");
    }

    ResponseEntity<Map<String, Object>> certificateApprovePageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "requestType", required = false) String requestType,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "result", required = false) String result,
            HttpServletRequest request,
            Locale locale) {
        Map<String, Object> response = adminHotPathPagePayloadService().buildCertificateApprovePagePayload(
                pageIndexParam,
                searchKeyword,
                requestType,
                status,
                result,
                request,
                locale);
        boolean canManage = Boolean.TRUE.equals(response.get("canViewCertificateApprove"));
        return canManage ? ResponseEntity.ok(response) : ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
    }

    String member_approveSubmit(
            @RequestParam(value = "action", required = false) String action,
            @RequestParam(value = "memberId", required = false) String memberId,
            @RequestParam(value = "selectedMemberIds", required = false) List<String> selectedMemberIds,
            @RequestParam(value = "rejectReason", required = false) String rejectReason,
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "membershipType", required = false) String membershipType,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        AdminApprovalActionService.ActionResult result = adminApprovalActionService.submitMemberApproval(
                action,
                memberId,
                selectedMemberIds,
                rejectReason,
                request,
                isEn,
                hasMemberManagementCompanyOperatorAccess(currentUserId, currentUserAuthorCode));
        if (!result.isSuccess()) {
            String viewName = resolveMemberApprovalViewName(request, isEn);
            primeCsrfToken(request);
            model.addAttribute("memberApprovalError", result.getMessage());
            populateMemberApprovalList(pageIndexParam, searchKeyword, membershipType, sbscrbSttus, null, model, isEn, request, locale);
            return viewName;
        }
        StringBuilder redirect = new StringBuilder();
        redirect.append("redirect:").append(resolveMemberApprovalBasePath(request, locale)).append("?result=").append(result.getResultCode());
        appendApprovalRedirectQuery(redirect, "pageIndex", pageIndexParam);
        appendApprovalRedirectQuery(redirect, "searchKeyword", searchKeyword);
        appendApprovalRedirectQuery(redirect, "membershipType", membershipType);
        appendApprovalRedirectQuery(redirect, "sbscrbSttus", sbscrbSttus);
        return redirect.toString();
    }

    String companyMemberApproveSubmit(
            @RequestParam(value = "action", required = false) String action,
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "selectedInsttIds", required = false) List<String> selectedInsttIds,
            @RequestParam(value = "rejectReason", required = false) String rejectReason,
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        String viewName = isEn ? "egovframework/com/admin/company_approve_en" : "egovframework/com/admin/company_approve";
        AdminApprovalActionService.ActionResult result = adminApprovalActionService.submitCompanyApproval(
                action,
                insttId,
                selectedInsttIds,
                rejectReason,
                isEn,
                hasMemberManagementMasterAccess(currentUserId, currentUserAuthorCode));
        if (!result.isSuccess()) {
            primeCsrfToken(request);
            model.addAttribute("memberApprovalError", result.getMessage());
            populateCompanyApprovalList(pageIndexParam, searchKeyword, sbscrbSttus, null, model, isEn, request, locale);
            return viewName;
        }
        StringBuilder redirect = new StringBuilder();
        redirect.append("redirect:").append(adminPrefix(request, locale)).append("/member/company-approve?result=").append(result.getResultCode());
        appendApprovalRedirectQuery(redirect, "pageIndex", pageIndexParam);
        appendApprovalRedirectQuery(redirect, "searchKeyword", searchKeyword);
        appendApprovalRedirectQuery(redirect, "sbscrbSttus", sbscrbSttus);
        return redirect.toString();
    }

    ResponseEntity<Map<String, Object>> memberApproveSubmitApi(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        AdminApprovalActionService.ActionResult result = adminApprovalActionService.submitMemberApproval(
                payload == null ? null : payload.get("action"),
                payload == null ? null : payload.get("memberId"),
                payload == null ? null : payload.get("selectedIds"),
                payload == null ? null : payload.get("rejectReason"),
                request,
                isEn,
                hasMemberManagementCompanyOperatorAccess(currentUserId, currentUserAuthorCode));
        if (!result.isSuccess()) {
            return result.toResponseEntity();
        }
        recordApprovalAuditSafely(request, currentUserId, currentUserAuthorCode, "AMENU_MEMBER_APPROVE", "member-approve",
                "MEMBER_APPROVAL_" + ("P".equals(result.getTargetStatus()) ? "APPROVE" : "REJECT"),
                "MEMBER", result.getSelectedIds().toString(), "SUCCESS",
                "{\"action\":\"" + safeJson(result.getAction()) + "\",\"selectedIds\":\"" + safeJson(result.getSelectedIds().toString()) + "\",\"rejectReason\":\"" + safeJson(result.getRejectReason()) + "\"}",
                "{\"targetStatus\":\"" + result.getTargetStatus() + "\"}");
        return result.toResponseEntity();
    }

    ResponseEntity<Map<String, Object>> companyApproveSubmitApi(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        AdminApprovalActionService.ActionResult result = adminApprovalActionService.submitCompanyApproval(
                payload == null ? null : payload.get("action"),
                payload == null ? null : payload.get("insttId"),
                payload == null ? null : payload.get("selectedIds"),
                payload == null ? null : payload.get("rejectReason"),
                isEn,
                hasMemberManagementMasterAccess(currentUserId, currentUserAuthorCode));
        if (!result.isSuccess()) {
            return result.toResponseEntity();
        }
        recordApprovalAuditSafely(request, currentUserId, currentUserAuthorCode, "AMENU_COMPANY_APPROVE", "company-approve",
                "COMPANY_APPROVAL_" + ("P".equals(result.getTargetStatus()) ? "APPROVE" : "REJECT"),
                "COMPANY", result.getSelectedIds().toString(), "SUCCESS",
                "{\"action\":\"" + safeJson(result.getAction()) + "\",\"selectedIds\":\"" + safeJson(result.getSelectedIds().toString()) + "\",\"rejectReason\":\"" + safeJson(result.getRejectReason()) + "\"}",
                "{\"targetStatus\":\"" + result.getTargetStatus() + "\"}");
        return result.toResponseEntity();
    }

    ResponseEntity<Map<String, Object>> certificateApproveSubmitApi(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        AdminApprovalActionService.ActionResult result = adminCertificateApprovalService.submitApproval(
                payload == null ? null : payload.get("action"),
                payload == null ? null : payload.get("certificateId"),
                payload == null ? null : payload.get("selectedIds"),
                payload == null ? null : payload.get("rejectReason"),
                isEn,
                hasMemberManagementMasterAccess(currentUserId, currentUserAuthorCode),
                this);
        if (!result.isSuccess()) {
            return result.toResponseEntity();
        }
        recordApprovalAuditSafely(request, currentUserId, currentUserAuthorCode, "AMENU_CERTIFICATE_APPROVE", "certificate-approve",
                "CERTIFICATE_APPROVAL_" + ("P".equals(result.getTargetStatus()) ? "APPROVE" : "REJECT"),
                "CERTIFICATE", result.getSelectedIds().toString(), "SUCCESS",
                "{\"action\":\"" + safeJson(result.getAction()) + "\",\"selectedIds\":\"" + safeJson(result.getSelectedIds().toString()) + "\",\"rejectReason\":\"" + safeJson(result.getRejectReason()) + "\"}",
                "{\"targetStatus\":\"" + result.getTargetStatus() + "\"}");
        return result.toResponseEntity();
    }

    String member_edit(
            @RequestParam(value = "memberId", required = false) String memberId,
            @RequestParam(value = "updated", required = false) String updated,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "member-edit");
    }

    ResponseEntity<Map<String, Object>> memberEditApi(
            @RequestParam(value = "memberId", required = false) String memberId,
            @RequestParam(value = "updated", required = false) String updated,
            HttpServletRequest request, Locale locale) {
        return ResponseEntity.ok(adminHotPathPagePayloadService().buildMemberEditPagePayload(
                memberId,
                updated,
                request,
                locale));
    }

    Map<String, Object> buildMemberEditPagePayload(
            String memberId,
            String updated,
            HttpServletRequest request,
            Locale locale) {
        return adminHotPathPagePayloadService().buildMemberEditPagePayload(memberId, updated, request, locale);
    }

    ResponseEntity<Map<String, Object>> memberEditSubmitApi(
            @RequestBody AdminMemberEditSaveRequestDTO payload,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedMemberId = safeString(payload == null ? null : payload.getMemberId());

        if (normalizedMemberId.isEmpty()) {
            return failureMessageResponse(HttpServletResponse.SC_BAD_REQUEST,
                    isEn ? "Member ID was not provided." : "회원 ID가 전달되지 않았습니다.");
        }

        EntrprsManageVO member;
        try {
            member = entrprsManageService.selectEntrprsmberByMberId(normalizedMemberId);
        } catch (Exception e) {
            log.error("Failed to load member for edit submit api. memberId={}", normalizedMemberId, e);
            return failureMessageResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    isEn ? "An error occurred while retrieving member information." : "회원 정보 조회 중 오류가 발생했습니다.");
        }

        if (member == null || safeString(member.getEntrprsmberId()).isEmpty()) {
            return failureMessageResponse(HttpServletResponse.SC_BAD_REQUEST,
                    isEn ? "Member information was not found." : "회원 정보를 찾을 수 없습니다.");
        }
        if (!canCurrentAdminAccessMember(request, member)) {
            return failureMessageResponse(HttpServletResponse.SC_FORBIDDEN, isEn
                    ? "You can only edit members in your own company."
                    : "본인 회사 소속 회원만 수정할 수 있습니다.");
        }

        List<String> errors = new ArrayList<>();
        String normalizedApplicantName = safeString(payload.getApplcntNm());
        String normalizedEmail = safeString(payload.getApplcntEmailAdres());
        String normalizedZip = digitsOnly(payload.getZip());
        String normalizedAddress = safeString(payload.getAdres());
        String normalizedDetailAddress = safeString(payload.getDetailAdres());
        String normalizedType = normalizeMembershipCode(safeString(payload.getEntrprsSeCode()).toUpperCase());
        String normalizedStatus = normalizeMemberStatusCode(payload.getEntrprsMberSttus());
        String normalizedAuthorCode = safeString(payload.getAuthorCode()).toUpperCase(Locale.ROOT);
        List<String> normalizedFeatureCodes = normalizeFeatureCodes(payload.getFeatureCodes());
        String normalizedMarketingYn = "Y".equalsIgnoreCase(safeString(payload.getMarketingYn())) ? "Y" : "N";
        String normalizedDeptNm = safeString(payload.getDeptNm());
        String[] phoneParts = splitPhoneNumber(payload.getPhoneNumber());
        List<AuthorInfoVO> permissionAuthorGroups = Collections.emptyList();
        List<Map<String, Object>> permissionAuthorGroupSections = Collections.emptyList();
        List<String> baselineFeatureCodes = Collections.emptyList();

        if (normalizedApplicantName.isEmpty()) {
            errors.add(isEn ? "Please enter the member name." : "회원명을 입력해 주세요.");
        }
        if (!isValidEmail(normalizedEmail)) {
            errors.add(isEn ? "Please enter a valid email address." : "올바른 이메일 주소를 입력해 주세요.");
        }
        if (phoneParts == null) {
            errors.add(isEn ? "Please enter a valid phone number." : "연락처 형식이 올바르지 않습니다.");
        }
        if (normalizedType.isEmpty()) {
            errors.add(isEn ? "Please select a valid member type." : "유효한 회원 유형을 선택해 주세요.");
        }
        if (normalizedStatus.isEmpty()) {
            errors.add(isEn ? "Please select a valid member status." : "유효한 회원 상태를 선택해 주세요.");
        }
        try {
            Set<String> grantableFeatureCodes = resolveGrantableFeatureCodeSet(extractCurrentUserId(request),
                    isWebmaster(extractCurrentUserId(request)));
            String currentAssignedAuthorCode = safeString(authGroupManageService.selectEnterpriseAuthorCodeByUserId(normalizedMemberId))
                    .toUpperCase(Locale.ROOT);
            permissionAuthorGroupSections = buildMemberEditAuthorGroupSections(member, isEn, extractCurrentUserId(request));
            permissionAuthorGroups = flattenPermissionAuthorGroupSections(permissionAuthorGroupSections);
            if (normalizedAuthorCode.isEmpty()) {
                errors.add(isEn ? "Please select a role." : "권한 롤을 선택해 주세요.");
            } else if (!adminAuthorityPagePayloadSupport.isGrantableOrCurrentAuthorCode(
                    permissionAuthorGroups,
                    normalizedAuthorCode,
                    currentAssignedAuthorCode)) {
                errors.add(isEn ? "Please select a valid role." : "유효한 권한 롤을 선택해 주세요.");
            } else {
                baselineFeatureCodes = normalizeFeatureCodes(authGroupManageService.selectAuthorFeatureCodes(normalizedAuthorCode));
                normalizedFeatureCodes = filterFeatureCodesByGrantable(normalizedFeatureCodes, grantableFeatureCodes);
            }
        } catch (Exception e) {
            log.error("Failed to load permission data for member edit api. memberId={}", normalizedMemberId, e);
            errors.add(isEn ? "Failed to load role and feature information." : "권한 롤 및 기능 정보를 불러오지 못했습니다.");
        }

        member.setApplcntNm(normalizedApplicantName);
        member.setApplcntEmailAdres(normalizedEmail);
        if (phoneParts != null) {
            member.setAreaNo(phoneParts[0]);
            member.setEntrprsMiddleTelno(phoneParts[1]);
            member.setEntrprsEndTelno(phoneParts[2]);
        }
        member.setEntrprsSeCode(normalizedType);
        member.setEntrprsMberSttus(normalizedStatus);
        member.setZip(normalizedZip);
        member.setAdres(normalizedAddress);
        member.setDetailAdres(normalizedDetailAddress);
        member.setMarketingYn(normalizedMarketingYn);
        member.setDeptNm(normalizedDeptNm);

        if (!errors.isEmpty()) {
            return failureErrorsResponse(HttpServletResponse.SC_BAD_REQUEST, errors);
        }

        try {
            entrprsManageService.updateEntrprsmber(member);
            authGroupManageService.updateEnterpriseUserRoleAssignment(normalizedMemberId, normalizedAuthorCode);
            savePermissionOverrides(
                    safeString(member.getUniqId()),
                    "USR02",
                    baselineFeatureCodes,
                    normalizedFeatureCodes,
                    extractCurrentUserId(request),
                    resolveGrantableFeatureCodeSet(extractCurrentUserId(request), isWebmaster(extractCurrentUserId(request))));
        } catch (Exception e) {
            log.error("Failed to save member edit api. memberId={}", normalizedMemberId, e);
            return failureMessageResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    isEn ? "An error occurred while saving member information." : "회원 정보 저장 중 오류가 발생했습니다.");
        }

        recordAdminActionAudit(request,
                extractCurrentUserId(request),
                resolveCurrentUserAuthorCode(extractCurrentUserId(request)),
                "AMENU_MEMBER_EDIT",
                "member-edit",
                "MEMBER_EDIT_SAVE",
                "MEMBER",
                normalizedMemberId,
                "{\"memberId\":\"" + safeJson(normalizedMemberId) + "\",\"authorCode\":\"" + safeJson(normalizedAuthorCode) + "\"}",
                "{\"status\":\"SUCCESS\"}");
        Map<String, Object> payloadBody = new LinkedHashMap<>();
        payloadBody.put("memberId", normalizedMemberId);
        return successResponse(payloadBody);
    }

    String member_editSubmit(
            @RequestParam(value = "memberId", required = false) String memberId,
            @RequestParam(value = "applcntNm", required = false) String applcntNm,
            @RequestParam(value = "applcntEmailAdres", required = false) String applcntEmailAdres,
            @RequestParam(value = "phoneNumber", required = false) String phoneNumber,
            @RequestParam(value = "entrprsSeCode", required = false) String entrprsSeCode,
            @RequestParam(value = "entrprsMberSttus", required = false) String entrprsMberSttus,
            @RequestParam(value = "authorCode", required = false) String authorCode,
            @RequestParam(value = "featureCodes", required = false) List<String> featureCodes,
            @RequestParam(value = "zip", required = false) String zip,
            @RequestParam(value = "adres", required = false) String adres,
            @RequestParam(value = "detailAdres", required = false) String detailAdres,
            @RequestParam(value = "marketingYn", required = false) String marketingYn,
            @RequestParam(value = "deptNm", required = false) String deptNm,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String viewName = isEn ? "egovframework/com/admin/member_edit_en" : "egovframework/com/admin/member_edit";
        String normalizedMemberId = safeString(memberId);
        model.addAttribute("memberId", normalizedMemberId);
        primeCsrfToken(request);
        ensureMemberEditDefaults(model, isEn);

        if (normalizedMemberId.isEmpty()) {
            model.addAttribute("member_editError", isEn ? "Member ID was not provided." : "회원 ID가 전달되지 않았습니다.");
            return viewName;
        }

        EntrprsManageVO member;
        try {
            member = entrprsManageService.selectEntrprsmberByMberId(normalizedMemberId);
        } catch (Exception e) {
            log.error("Failed to load member for edit submit. memberId={}", normalizedMemberId, e);
            model.addAttribute("member_editError", isEn ? "An error occurred while retrieving member information." : "회원 정보 조회 중 오류가 발생했습니다.");
            return viewName;
        }

        if (member == null || safeString(member.getEntrprsmberId()).isEmpty()) {
            model.addAttribute("member_editError", isEn ? "Member information was not found." : "회원 정보를 찾을 수 없습니다.");
            return viewName;
        }
        if (!canCurrentAdminAccessMember(request, member)) {
            model.addAttribute("member_editError", isEn
                    ? "You can only edit members in your own company."
                    : "본인 회사 소속 회원만 수정할 수 있습니다.");
            return viewName;
        }

        List<String> errors = new ArrayList<>();
        String normalizedApplicantName = safeString(applcntNm);
        String normalizedEmail = safeString(applcntEmailAdres);
        String normalizedZip = digitsOnly(zip);
        String normalizedAddress = safeString(adres);
        String normalizedDetailAddress = safeString(detailAdres);
        String normalizedType = normalizeMembershipCode(safeString(entrprsSeCode).toUpperCase());
        String normalizedStatus = normalizeMemberStatusCode(entrprsMberSttus);
        String normalizedAuthorCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        List<String> normalizedFeatureCodes = normalizeFeatureCodes(featureCodes);
        String normalizedMarketingYn = "Y".equalsIgnoreCase(safeString(marketingYn)) ? "Y" : "N";
        String normalizedDeptNm = safeString(deptNm);
        String[] phoneParts = splitPhoneNumber(phoneNumber);
        List<AuthorInfoVO> permissionAuthorGroups = Collections.emptyList();
        List<Map<String, Object>> permissionAuthorGroupSections = Collections.emptyList();
        List<String> baselineFeatureCodes = Collections.emptyList();

        if (normalizedApplicantName.isEmpty()) {
            errors.add(isEn ? "Please enter the member name." : "회원명을 입력해 주세요.");
        }
        if (!isValidEmail(normalizedEmail)) {
            errors.add(isEn ? "Please enter a valid email address." : "올바른 이메일 주소를 입력해 주세요.");
        }
        if (phoneParts == null) {
            errors.add(isEn ? "Please enter a valid phone number." : "연락처 형식이 올바르지 않습니다.");
        }
        if (normalizedType.isEmpty()) {
            errors.add(isEn ? "Please select a valid member type." : "유효한 회원 유형을 선택해 주세요.");
        }
        if (normalizedStatus.isEmpty()) {
            errors.add(isEn ? "Please select a valid member status." : "유효한 회원 상태를 선택해 주세요.");
        }
        try {
            Set<String> grantableFeatureCodes = resolveGrantableFeatureCodeSet(extractCurrentUserId(request),
                    isWebmaster(extractCurrentUserId(request)));
            String currentAssignedAuthorCode = safeString(authGroupManageService.selectEnterpriseAuthorCodeByUserId(normalizedMemberId))
                    .toUpperCase(Locale.ROOT);
            permissionAuthorGroupSections = buildMemberEditAuthorGroupSections(member, isEn, extractCurrentUserId(request));
            permissionAuthorGroups = flattenPermissionAuthorGroupSections(permissionAuthorGroupSections);
            if (normalizedAuthorCode.isEmpty()) {
                errors.add(isEn ? "Please select a role." : "권한 롤을 선택해 주세요.");
            } else if (!adminAuthorityPagePayloadSupport.isGrantableOrCurrentAuthorCode(
                    permissionAuthorGroups,
                    normalizedAuthorCode,
                    currentAssignedAuthorCode)) {
                errors.add(isEn ? "Please select a valid role." : "유효한 권한 롤을 선택해 주세요.");
            } else {
                baselineFeatureCodes = normalizeFeatureCodes(authGroupManageService.selectAuthorFeatureCodes(normalizedAuthorCode));
                normalizedFeatureCodes = filterFeatureCodesByGrantable(normalizedFeatureCodes, grantableFeatureCodes);
            }
        } catch (Exception e) {
            log.error("Failed to load permission data for member edit. memberId={}", normalizedMemberId, e);
            errors.add(isEn ? "Failed to load role and feature information." : "권한 롤 및 기능 정보를 불러오지 못했습니다.");
        }

        member.setApplcntNm(normalizedApplicantName);
        member.setApplcntEmailAdres(normalizedEmail);
        if (phoneParts != null) {
            member.setAreaNo(phoneParts[0]);
            member.setEntrprsMiddleTelno(phoneParts[1]);
            member.setEntrprsEndTelno(phoneParts[2]);
        }
        member.setEntrprsSeCode(normalizedType);
        member.setEntrprsMberSttus(normalizedStatus);
        member.setZip(normalizedZip);
        member.setAdres(normalizedAddress);
        member.setDetailAdres(normalizedDetailAddress);
        member.setMarketingYn(normalizedMarketingYn);
        member.setDeptNm(normalizedDeptNm);

        if (!errors.isEmpty()) {
            try {
                populateMemberEditModel(model, member, isEn, extractCurrentUserId(request));
                populatePermissionEditorModel(model, permissionAuthorGroups, normalizedAuthorCode, safeString(member.getUniqId()),
                        normalizedFeatureCodes, isEn, extractCurrentUserId(request));
                model.addAttribute("permissionAuthorGroupSections", permissionAuthorGroupSections);
            } catch (Exception e) {
                log.error("Failed to populate member edit model (validation errors). memberId={}", normalizedMemberId, e);
                ensureMemberEditDefaults(model, isEn);
            }
            model.addAttribute("member_editErrors", errors);
            return viewName;
        }

        try {
            entrprsManageService.updateEntrprsmber(member);
            authGroupManageService.updateEnterpriseUserRoleAssignment(normalizedMemberId, normalizedAuthorCode);
            savePermissionOverrides(
                    safeString(member.getUniqId()),
                    "USR02",
                    baselineFeatureCodes,
                    normalizedFeatureCodes,
                    extractCurrentUserId(request),
                    resolveGrantableFeatureCodeSet(extractCurrentUserId(request), isWebmaster(extractCurrentUserId(request))));
            return "redirect:" + adminPrefix(request, locale) + "/member/edit?memberId=" + urlEncode(normalizedMemberId) + "&updated=true";
        } catch (Exception e) {
            log.error("Failed to save member edit. memberId={}", normalizedMemberId, e);
            try {
                populateMemberEditModel(model, member, isEn, extractCurrentUserId(request));
                populatePermissionEditorModel(model, permissionAuthorGroups, normalizedAuthorCode, safeString(member.getUniqId()),
                        normalizedFeatureCodes, isEn, extractCurrentUserId(request));
                model.addAttribute("permissionAuthorGroupSections", permissionAuthorGroupSections);
            } catch (Exception inner) {
                log.error("Failed to populate member edit model (save error). memberId={}", normalizedMemberId, inner);
                ensureMemberEditDefaults(model, isEn);
            }
            model.addAttribute("member_editError", isEn ? "An error occurred while saving member information." : "회원 정보 저장 중 오류가 발생했습니다.");
            return viewName;
        }
    }

    void memberFile(
            @RequestParam(value = "fileId", required = false) String fileId,
            @RequestParam(value = "download", required = false) String download,
            HttpServletRequest request,
            HttpServletResponse response) throws Exception {
        String targetInsttId = resolveMemberFileInsttId(fileId);
        if (!canCurrentAdminAccessInsttId(request, targetInsttId)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }
        File file = resolveMemberFile(fileId);
        if (file == null) {
            response.sendError(404, "File not found or access denied.");
            return;
        }
        String canonicalPath = file.getCanonicalPath();
        if (!file.exists() || !isAllowedFilePath(canonicalPath)) {
            response.sendError(404, "File not found or access denied.");
            return;
        }

        boolean forceDownload = "true".equalsIgnoreCase(safeString(download));
        String fileName = file.getName();
        response.setContentType(resolveMediaType(fileName));
        response.setHeader("Content-Disposition",
                (forceDownload ? "attachment" : "inline") + "; filename=\"" + URLEncoder.encode(fileName, "UTF-8") + "\"");

        try (FileInputStream fis = new FileInputStream(file); OutputStream os = response.getOutputStream()) {
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                os.write(buffer, 0, bytesRead);
            }
            os.flush();
        }
    }

    String member_detail(
            @RequestParam(value = "memberId", required = false) String memberId,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "member-detail");
    }

    ResponseEntity<Map<String, Object>> memberDetailPageApi(
            @RequestParam(value = "memberId", required = false) String memberId,
            HttpServletRequest request,
            Locale locale) {
        Map<String, Object> response = adminHotPathPagePayloadService().buildMemberDetailPagePayload(
                memberId,
                request,
                locale);
        if (!Boolean.TRUE.equals(response.get("canViewMemberDetail"))) {
            return "FORBIDDEN".equals(response.get("memberDetailStatus"))
                    ? ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response)
                    : ResponseEntity.status(HttpServletResponse.SC_NOT_FOUND).body(response);
        }
        return ResponseEntity.ok(response);
    }

    String member_resetPassword(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "resetSource", required = false) String resetSource,
            @RequestParam(value = "memberId", required = false) String memberId,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "password-reset");
    }

    ResponseEntity<Map<String, Object>> memberResetPasswordPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "resetSource", required = false) String resetSource,
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "memberId", required = false) String memberId,
            HttpServletRequest request,
            Locale locale) {
        return ResponseEntity.ok(adminHotPathPagePayloadService().buildPasswordResetPagePayload(
                pageIndexParam,
                searchKeyword,
                resetSource,
                insttId,
                memberId,
                request,
                locale));
    }

    ResponseEntity<Map<String, Object>> resetMemberPassword(
            @RequestParam(value = "memberId", required = false) String memberId,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);

        String normalizedMemberId = safeString(memberId);
        if (normalizedMemberId.isEmpty()) {
            return statusFailureResponse(HttpServletResponse.SC_BAD_REQUEST,
                    isEn ? "Member ID was not provided." : "회원 ID가 전달되지 않았습니다.");
        }

        String temporaryPassword = buildTemporaryPassword();
        String currentAdminUserId = safeString(extractCurrentUserId(request));
        String clientIp = safeString(ClientIpUtil.getClientIp());

        try {
            EntrprsManageVO member = entrprsManageService.selectEntrprsmberByMberId(normalizedMemberId);
            if (member == null || safeString(member.getEntrprsmberId()).isEmpty()) {
                return statusFailureResponse(HttpServletResponse.SC_OK,
                        isEn ? "No matching user was found." : "일치하는 사용자를 찾을 수 없습니다.");
            }
            if (!canCurrentAdminAccessMember(request, member)) {
                return statusFailureResponse(HttpServletResponse.SC_FORBIDDEN, isEn
                        ? "You can only reset passwords for members in your own company."
                        : "본인 회사 소속 회원만 비밀번호를 초기화할 수 있습니다.");
            }
            boolean updated = authService.resetPassword(
                    normalizedMemberId,
                    temporaryPassword,
                    currentAdminUserId,
                    clientIp,
                    "ADMIN_MEMBER_RESET");
            if (!updated) {
                return statusFailureResponse(HttpServletResponse.SC_OK,
                        isEn ? "No matching user was found." : "일치하는 사용자를 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            log.error("Failed to reset member credentials. memberId={}, adminId={}", normalizedMemberId, currentAdminUserId, e);
            return statusFailureResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    isEn ? "Failed to reset the password." : "비밀번호 초기화에 실패했습니다.");
        }

        recordAdminActionAudit(request,
                currentAdminUserId,
                resolveCurrentUserAuthorCode(currentAdminUserId),
                "AMENU_PASSWORD_RESET",
                "password-reset",
                "MEMBER_PASSWORD_RESET",
                "MEMBER",
                normalizedMemberId,
                "{\"memberId\":\"" + safeJson(normalizedMemberId) + "\"}",
                "{\"status\":\"SUCCESS\"}");
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("temporaryPassword", temporaryPassword);
        payload.put("message", isEn ? "The password has been reset." : "비밀번호가 초기화되었습니다.");
        return statusSuccessResponse(payload);
    }

    String admin_account(
            @RequestParam(value = "emplyrId", required = false) String emplyrId,
            @RequestParam(value = "updated", required = false) String updated,
            @RequestParam(value = "mode", required = false) String mode,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, safeString(emplyrId).isEmpty() ? "admin-create" : "admin-permission");
    }

    ResponseEntity<Map<String, Object>> adminAccountCreatePageApi(
            HttpServletRequest request,
            Locale locale) {
        return ResponseEntity.ok(adminHotPathPagePayloadService().buildAdminAccountCreatePagePayload(
                request,
                locale));
    }

    ResponseEntity<Map<String, Object>> menuPermissionDiagnosticsApi(
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        if (!isWebmaster(currentUserId) && !hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode)) {
            return failureMessageResponse(HttpServletResponse.SC_FORBIDDEN, isEn
                    ? "Only global administrators can view menu permission diagnostics."
                    : "메뉴 권한 진단은 전체 관리자만 조회할 수 있습니다.");
        }
        return ResponseEntity.ok(adminSummaryReadPort.buildMenuPermissionDiagnosticSummary(isEn));
    }

    ResponseEntity<Map<String, Object>> adminAccountCheckIdApi(
            @RequestParam(value = "adminId", required = false) String adminId,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        if (!canCreateAdminAccounts(currentUserId, currentUserAuthorCode)) {
            return duplicateCheckError(HttpServletResponse.SC_FORBIDDEN, false,
                    isEn ? "You do not have permission to validate administrator IDs." : "관리자 ID를 확인할 권한이 없습니다.");
        }
        String normalizedAdminId = safeString(adminId);
        if (normalizedAdminId.isEmpty()) {
            return duplicateCheckError(HttpServletResponse.SC_BAD_REQUEST, false,
                    isEn ? "Administrator ID is required." : "관리자 ID를 입력해 주세요.");
        }
        if (!normalizedAdminId.matches("^[A-Za-z0-9]{6,16}$")) {
            return duplicateCheckError(HttpServletResponse.SC_BAD_REQUEST, false,
                    isEn ? "Use 6 to 16 letters or numbers for the administrator ID."
                            : "관리자 ID는 영문/숫자 6~16자로 입력해 주세요.");
        }
        boolean duplicated;
        try {
            duplicated = userManageService.checkIdDplct(normalizedAdminId) > 0;
        } catch (Exception e) {
            log.error("Failed to check admin id duplication. adminId={}", normalizedAdminId, e);
            return duplicateCheckError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, false,
                    isEn ? "An error occurred while checking the administrator ID." : "관리자 ID 중복 확인 중 오류가 발생했습니다.");
        }
        return duplicateCheckSuccess(duplicated,
                duplicated
                        ? (isEn ? "This administrator ID is already in use." : "이미 사용 중인 관리자 ID입니다.")
                        : (isEn ? "This administrator ID is available." : "사용 가능한 관리자 ID입니다."));
    }

    ResponseEntity<CompanySearchResponseDTO> adminCompanySearchApi(
            @RequestParam(value = "keyword", defaultValue = "") String keyword,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "5") int size,
            @RequestParam(value = "status", defaultValue = "") String status,
            @RequestParam(value = "membershipType", defaultValue = "") String membershipType,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        boolean masterAccess = hasMemberManagementMasterAccess(currentUserId, currentUserAuthorCode);
        boolean companyScopedAccess = requiresMemberManagementCompanyScope(currentUserId, currentUserAuthorCode);
        if (!masterAccess && !companyScopedAccess) {
            return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN)
                    .body(new CompanySearchResponseDTO(Collections.emptyList(), 0, 1, 1, 0));
        }
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(1, Math.min(size, 20));
        Map<String, Object> params = new LinkedHashMap<>();
        params.put("keyword", trimToLen(safeString(keyword), 100));
        params.put("offset", (safePage - 1) * safeSize);
        params.put("pageSize", safeSize);
        params.put("status", trimToLen(safeString(status), 10));
        params.put("membershipType", trimToLen(safeString(membershipType).toLowerCase(Locale.ROOT), 20));
        if (companyScopedAccess) {
            params.put("insttId", resolveCurrentUserInsttId(currentUserId));
        }
        try {
            List<CompanyListItemVO> list = entrprsManageService.searchCompanyListPaged(params);
            int totalCnt = entrprsManageService.searchCompanyListTotCnt(params);
            CompanySearchResponseDTO payload = new CompanySearchResponseDTO(
                    list,
                    totalCnt,
                    safePage,
                    safeSize,
                    (int) Math.ceil(totalCnt / (double) safeSize));
            return ResponseEntity.ok(payload);
        } catch (Exception e) {
            log.error("Failed to search companies for admin account migration. keyword={}", keyword, e);
            return ResponseEntity.status(HttpServletResponse.SC_INTERNAL_SERVER_ERROR)
                    .body(new CompanySearchResponseDTO(Collections.emptyList(), 0, safePage, safeSize, 0));
        }
    }

    ResponseEntity<Map<String, Object>> adminAccountCreateSubmitApi(
            @RequestBody AdminAdminAccountCreateRequestDTO payload,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        if (!canCreateAdminAccounts(currentUserId, currentUserAuthorCode)) {
            return failureMessageResponse(HttpServletResponse.SC_FORBIDDEN, isEn
                    ? "You do not have permission to create administrator accounts."
                    : "관리자 계정을 생성할 권한이 없습니다.");
        }

        String adminId = trimToLen(safeString(payload == null ? null : payload.getAdminId()), 20);
        String adminName = trimToLen(safeString(payload == null ? null : payload.getAdminName()), 60);
        String password = safeString(payload == null ? null : payload.getPassword());
        String passwordConfirm = safeString(payload == null ? null : payload.getPasswordConfirm());
        String adminEmail = trimToLen(safeString(payload == null ? null : payload.getAdminEmail()), 100);
        String deptNm = trimToLen(safeString(payload == null ? null : payload.getDeptNm()), 100);
        String insttId = trimToLen(safeString(payload == null ? null : payload.getInsttId()), 20);
        String phone1 = trimToLen(digitsOnly(payload == null ? null : payload.getPhone1()), 4);
        String phone2 = trimToLen(digitsOnly(payload == null ? null : payload.getPhone2()), 4);
        String phone3 = trimToLen(digitsOnly(payload == null ? null : payload.getPhone3()), 4);
        String rolePreset = safeString(payload == null ? null : payload.getRolePreset()).toUpperCase(Locale.ROOT);
        String normalizedZip = trimToLen(digitsOnly(safeString(payload == null ? null : payload.getZip())), 6);
        String normalizedAddress = trimToLen(safeString(payload == null ? null : payload.getAdres()), 100);
        String normalizedDetailAddress = trimToLen(safeString(payload == null ? null : payload.getDetailAdres()), 100);
        String authorCode = resolveAdminPresetAuthorCode(rolePreset);
        List<String> featureCodes = normalizeFeatureCodes(payload == null ? null : payload.getFeatureCodes());
        if (!canCreateAdminRolePreset(currentUserId, currentUserAuthorCode, rolePreset)) {
            return failureMessageResponse(HttpServletResponse.SC_FORBIDDEN, isEn
                    ? "You cannot create the selected administrator type."
                    : "선택한 관리자 유형을 생성할 수 없습니다.");
        }
        String scopedInsttId = hasMemberManagementMasterAccess(currentUserId, currentUserAuthorCode)
                ? insttId
                : resolveCurrentUserInsttId(currentUserId);

        List<String> errors = new ArrayList<>();
        if (!adminId.matches("^[A-Za-z0-9]{6,16}$")) {
            errors.add(isEn ? "Use 6 to 16 letters or numbers for the administrator ID." : "관리자 ID는 영문/숫자 6~16자로 입력해 주세요.");
        }
        if (adminName.isEmpty()) {
            errors.add(isEn ? "Please enter the administrator name." : "관리자 이름을 입력해 주세요.");
        }
        if (!isStrongAdminPassword(password)) {
            errors.add(isEn ? "Use at least 8 characters with letters, numbers, and symbols." : "비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다.");
        }
        if (!password.equals(passwordConfirm)) {
            errors.add(isEn ? "The password confirmation does not match." : "비밀번호 확인이 일치하지 않습니다.");
        }
        if (!isValidEmail(adminEmail)) {
            errors.add(isEn ? "Please enter a valid email address." : "올바른 이메일 주소를 입력해 주세요.");
        }
        if (phone1.isEmpty() || phone2.length() < 3 || phone3.length() != 4) {
            errors.add(isEn ? "Please enter a valid contact number." : "올바른 연락처를 입력해 주세요.");
        }
        if (authorCode.isEmpty()) {
            errors.add(isEn ? "Please select a valid administrator role preset." : "유효한 관리자 권한 프리셋을 선택해 주세요.");
        }
        if (normalizedZip.isEmpty()) {
            errors.add(isEn ? "Please enter the postal code." : "우편번호를 입력해 주세요.");
        }
        if (normalizedAddress.isEmpty()) {
            errors.add(isEn ? "Please enter the address." : "주소를 입력해 주세요.");
        }
        if (!"MASTER".equals(rolePreset) && scopedInsttId.isEmpty()) {
            errors.add(isEn ? "Please select an affiliated company or institution." : "소속 기관 또는 기업을 선택해 주세요.");
        }

        try {
            if (!adminId.isEmpty() && userManageService.checkIdDplct(adminId) > 0) {
                errors.add(isEn ? "This administrator ID is already in use." : "이미 사용 중인 관리자 ID입니다.");
            }
        } catch (Exception e) {
            log.error("Failed to check duplication while creating admin account. adminId={}", adminId, e);
            errors.add(isEn ? "Failed to verify the administrator ID." : "관리자 ID 중복 확인에 실패했습니다.");
        }

        InstitutionStatusVO institutionInfo = null;
        if (!scopedInsttId.isEmpty()) {
            institutionInfo = loadInstitutionInfoByInsttId(scopedInsttId);
            if (institutionInfo == null || institutionInfo.isEmpty()) {
                errors.add(isEn ? "The selected company or institution was not found." : "선택한 기관 또는 기업 정보를 찾을 수 없습니다.");
            }
        }

        List<String> baselineFeatureCodes = Collections.emptyList();
        if (errors.isEmpty()) {
            try {
                baselineFeatureCodes = normalizeFeatureCodes(authGroupManageService.selectAuthorFeatureCodes(authorCode));
            } catch (Exception e) {
                log.error("Failed to load baseline feature codes for admin account creation. authorCode={}", authorCode, e);
                errors.add(isEn ? "Failed to load role feature information." : "권한 롤 기능 정보를 불러오지 못했습니다.");
            }
        }

        if (!errors.isEmpty()) {
            return failureErrorsResponse(HttpServletResponse.SC_BAD_REQUEST, errors);
        }

        String fullPhone = buildPhoneNumber(phone1, phone2, phone3);
        try {
            String institutionZip = trimToLen(digitsOnly(safeString(institutionInfo == null ? null : institutionInfo.getZip())), 6);
            String institutionAddress = trimToLen(safeString(institutionInfo == null ? null : institutionInfo.getAdres()), 100);
            String institutionDetailAddress = trimToLen(safeString(institutionInfo == null ? null : institutionInfo.getDetailAdres()), 100);
            UserManageVO userManageVO = new UserManageVO();
            userManageVO.setEmplyrId(adminId);
            userManageVO.setEmplyrNm(adminName);
            userManageVO.setPassword(password);
            userManageVO.setEmailAdres(adminEmail);
            userManageVO.setAreaNo(phone1);
            userManageVO.setHomemiddleTelno(phone2);
            userManageVO.setHomeendTelno(phone3);
            userManageVO.setMoblphonNo(fullPhone);
            userManageVO.setOffmTelno(fullPhone);
            userManageVO.setEmplyrSttusCode("P");
            userManageVO.setOrgnztId(scopedInsttId);
            userManageVO.setOfcpsNm(deptNm);
            userManageVO.setGroupId(scopedInsttId);
            userManageVO.setLockAt("N");
            userManageVO.setPasswordHint("AUTO");
            userManageVO.setPasswordCnsr("AUTO");
            userManageVO.setIhidnum("");
            userManageVO.setSexdstnCode("");
            userManageVO.setZip(normalizedZip.isEmpty() ? (institutionZip.isEmpty() ? "000000" : institutionZip) : normalizedZip);
            userManageVO.setHomeadres(normalizedAddress.isEmpty() ? (institutionAddress.isEmpty() ? "주소미입력" : institutionAddress) : normalizedAddress);
            userManageVO.setDetailAdres(normalizedDetailAddress.isEmpty() ? institutionDetailAddress : normalizedDetailAddress);
            userManageVO.setFxnum("");
            userManageVO.setEmplNo("");
            userManageService.insertUser(userManageVO);

            Optional<EmplyrInfo> savedAdminOpt = employMemberRepository.findById(adminId);
            if (!savedAdminOpt.isPresent()) {
                throw new IllegalStateException("Administrator account insert verification failed.");
            }
            EmplyrInfo savedAdmin = savedAdminOpt.get();
            savedAdmin.setInsttId(scopedInsttId);
            savedAdmin.setOrgnztId(scopedInsttId);
            savedAdmin.setGroupId(scopedInsttId);
            savedAdmin.setUserNm(adminName);
            savedAdmin.setEmailAdres(adminEmail);
            savedAdmin.setAreaNo(phone1);
            savedAdmin.setHouseMiddleTelno(phone2);
            savedAdmin.setHouseEndTelno(phone3);
            savedAdmin.setMbtlNum(fullPhone);
            savedAdmin.setOffmTelno(fullPhone);
            savedAdmin.setOfcpsNm(deptNm);
            employMemberRepository.save(savedAdmin);

            authGroupManageService.updateAdminRoleAssignment(adminId, authorCode);
            savePermissionOverrides(
                    safeString(savedAdmin.getEsntlId()),
                    "USR03",
                    baselineFeatureCodes,
                    featureCodes.isEmpty() ? baselineFeatureCodes : featureCodes,
                    currentUserId,
                    resolveGrantableFeatureCodeSet(currentUserId, true));
            recordAdminActionAudit(request,
                    currentUserId,
                    resolveCurrentUserAuthorCode(currentUserId),
                    "AMENU_ADMIN_CREATE",
                    "admin-create",
                    "ADMIN_ACCOUNT_CREATE",
                    "ADMIN",
                    adminId,
                    "{\"adminId\":\"" + safeJson(adminId) + "\",\"authorCode\":\"" + safeJson(authorCode) + "\",\"insttId\":\"" + safeJson(scopedInsttId) + "\"}",
                    "{\"status\":\"SUCCESS\"}");
            Map<String, Object> payloadBody = new LinkedHashMap<>();
            payloadBody.put("emplyrId", adminId);
            payloadBody.put("authorCode", authorCode);
            payloadBody.put("insttId", scopedInsttId);
            payloadBody.put("companyName", institutionInfo == null ? "" : safeString(institutionInfo.getInsttNm()));
            return successResponse(payloadBody);
        } catch (Exception e) {
            log.error("Failed to create admin account. adminId={}, authorCode={}", adminId, authorCode, e);
            return failureMessageResponse(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, isEn
                    ? "An error occurred while creating the administrator account."
                    : "관리자 계정 생성 중 오류가 발생했습니다.");
        }
    }

    ResponseEntity<Map<String, Object>> adminAccountPermissionApi(
            @RequestParam(value = "emplyrId", required = false) String emplyrId,
            @RequestParam(value = "updated", required = false) String updated,
            @RequestParam(value = "mode", required = false) String mode,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        ExtendedModelMap model = new ExtendedModelMap();
        primeCsrfToken(request);
        ensureAdminAccountDefaults(model, isEn);
        model.addAttribute("adminPermissionUpdated", "true".equalsIgnoreCase(safeString(updated)));
        model.addAttribute("adminAccountMode", safeString(mode));
        String normalizedEmplyrId = safeString(emplyrId);
        boolean canView = false;
        boolean canSave = false;
        if (!normalizedEmplyrId.isEmpty()) {
            try {
                Optional<EmplyrInfo> adminMemberOpt = employMemberRepository.findById(normalizedEmplyrId);
                if (!adminMemberOpt.isPresent()) {
                    model.addAttribute("adminPermissionError", isEn
                            ? "Administrator information was not found."
                            : "관리자 정보를 찾을 수 없습니다.");
                } else if (!canCurrentAdminAccessAdmin(request, adminMemberOpt.get())) {
                    model.addAttribute("adminPermissionError", isEn
                            ? "You can only view administrators in your own company."
                            : "본인 회사에 속한 관리자만 조회할 수 있습니다.");
                } else {
                    populateAdminAccountEditModel(model, adminMemberOpt.get(), isEn, null, extractCurrentUserId(request));
                    canView = true;
                    String currentUserId = extractCurrentUserId(request);
                    String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
                    canSave = !Boolean.TRUE.equals(model.getAttribute("adminAccountReadOnly"))
                            && hasMemberManagementCompanyAdminAccess(currentUserId, currentUserAuthorCode);
                }
            } catch (Exception e) {
                log.error("Failed to load admin account edit page api. emplyrId={}", normalizedEmplyrId, e);
                model.addAttribute("adminPermissionError", isEn
                        ? "An error occurred while retrieving administrator information."
                        : "관리자 정보 조회 중 오류가 발생했습니다.");
            }
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        response.put("canViewAdminPermissionEdit", canView);
        response.put("canUseAdminPermissionSave", canSave);
        return ResponseEntity.ok(response);
    }

    ResponseEntity<Map<String, Object>> adminAccountPermissionsSubmitApi(
            @RequestBody AdminPermissionSaveRequestDTO payload,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        AdminAdminPermissionService.SaveResult result = adminAdminPermissionService.saveAdminPermission(
                payload == null ? null : payload.getEmplyrId(),
                payload == null ? null : payload.getAuthorCode(),
                payload == null ? null : payload.getFeatureCodes(),
                request,
                isEn,
                currentUserId,
                currentUserAuthorCode,
                hasMemberManagementCompanyAdminAccess(currentUserId, currentUserAuthorCode));
        if (result.isSuccess()) {
            recordAdminActionAudit(request,
                    currentUserId,
                    resolveCurrentUserAuthorCode(currentUserId),
                    "AMENU_ADMIN_PERMISSION",
                    "admin-permission",
                    "ADMIN_PERMISSION_SAVE",
                    "ADMIN",
                    result.getEmplyrId(),
                    "{\"emplyrId\":\"" + safeJson(result.getEmplyrId()) + "\",\"authorCode\":\"" + safeJson(result.getAuthorCode()) + "\"}",
                    "{\"status\":\"SUCCESS\"}");
        }
        return result.toResponseEntity();
    }

    String admin_accountPermissionsSubmit(
            @RequestParam(value = "emplyrId", required = false) String emplyrId,
            @RequestParam(value = "authorCode", required = false) String authorCode,
            @RequestParam(value = "featureCodes", required = false) List<String> featureCodes,
            @RequestParam(value = "language", required = false) String language,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale) || "en".equalsIgnoreCase(safeString(language));
        String viewName = isEn
                ? "egovframework/com/admin/admin_account_en"
                : "egovframework/com/admin/admin_account";
        primeCsrfToken(request);
        ensureAdminAccountDefaults(model, isEn);

        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        AdminAdminPermissionService.SaveResult result = adminAdminPermissionService.saveAdminPermission(
                emplyrId,
                authorCode,
                featureCodes,
                request,
                isEn,
                currentUserId,
                currentUserAuthorCode,
                hasMemberManagementCompanyAdminAccess(currentUserId, currentUserAuthorCode));
        if (result.isForbidden() || result.isInvalid() || result.isServerError()) {
            if (result.getAdminMember() != null) {
                try {
                    populateAdminAccountEditModel(model, result.getAdminMember(), isEn, result.getFeatureCodes(), currentUserId);
                } catch (Exception e) {
                    log.error("Failed to populate admin account edit model after permission submit. emplyrId={}", result.getEmplyrId(), e);
                    ensureAdminAccountDefaults(model, isEn);
                }
            }
            if (!result.getErrors().isEmpty()) {
                model.addAttribute("adminPermissionErrors", result.getErrors());
            }
            if (!safeString(result.getMessage()).isEmpty()) {
                model.addAttribute("adminPermissionError", result.getMessage());
            }
            return viewName;
        }
        recordAdminActionAudit(request,
                currentUserId,
                resolveCurrentUserAuthorCode(currentUserId),
                "AMENU_ADMIN_PERMISSION",
                "admin-permission",
                "ADMIN_PERMISSION_SAVE",
                "ADMIN",
                result.getEmplyrId(),
                "{\"emplyrId\":\"" + safeJson(result.getEmplyrId()) + "\",\"authorCode\":\"" + safeJson(result.getAuthorCode()) + "\"}",
                "{\"status\":\"SUCCESS\"}");
        return "redirect:" + adminPrefix(request, locale) + "/member/admin_account?emplyrId=" + urlEncode(result.getEmplyrId()) + "&updated=true";
    }

    String member_list(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "membershipType", required = false) String membershipType,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "member-list");
    }

    String withdrawn_member_list(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "membershipType", required = false) String membershipType,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "member-list");
    }

    String activate_member_list(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "membershipType", required = false) String membershipType,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "member-list");
    }

    ResponseEntity<Map<String, Object>> memberListPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "membershipType", required = false) String membershipType,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request,
            Locale locale) {
        return ResponseEntity.ok(adminHotPathPagePayloadService().buildMemberListPagePayload(
                pageIndexParam,
                searchKeyword,
                membershipType,
                sbscrbSttus,
                request,
                locale));
    }

    String admin_list(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "admin-list");
    }

    String company_list(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "company-list");
    }

    ResponseEntity<Map<String, Object>> adminListPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request,
            Locale locale) {
        return ResponseEntity.ok(adminHotPathPagePayloadService().buildAdminListPagePayload(
                pageIndexParam,
                searchKeyword,
                sbscrbSttus,
                request,
                locale));
    }

    ResponseEntity<Map<String, Object>> companyListPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request,
            Locale locale) {
        Map<String, Object> response = adminHotPathPagePayloadService().buildCompanyListPagePayload(
                pageIndexParam,
                searchKeyword,
                sbscrbSttus,
                request,
                locale);
        boolean canView = Boolean.TRUE.equals(response.get("canViewCompanyList"));
        return canView ? ResponseEntity.ok(response) : ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
    }

    String emission_result_list(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "resultStatus", required = false) String resultStatus,
            @RequestParam(value = "verificationStatus", required = false) String verificationStatus,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "emission-result-list");
    }

    ResponseEntity<Map<String, Object>> emissionResultListPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "resultStatus", required = false) String resultStatus,
            @RequestParam(value = "verificationStatus", required = false) String verificationStatus,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        primeCsrfToken(request);
        ExtendedModelMap model = new ExtendedModelMap();
        populateEmissionResultList(pageIndexParam, searchKeyword, resultStatus, verificationStatus, model, isEn);
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        response.put("isEn", isEn);
        return ResponseEntity.ok(response);
    }

    String emission_result_detail(
            @RequestParam(value = "resultId", required = false) String resultId,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "emission-result-detail");
    }

    ResponseEntity<Map<String, Object>> emissionResultDetailPageApi(
            @RequestParam(value = "resultId", required = false) String resultId,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        primeCsrfToken(request);
        Map<String, Object> response = adminShellBootstrapPageService().buildEmissionResultDetailPageData(resultId, isEn);
        return Boolean.TRUE.equals(response.get("found"))
                ? ResponseEntity.ok(response)
                : ResponseEntity.status(HttpServletResponse.SC_NOT_FOUND).body(response);
    }

    String company_detail(
            @RequestParam(value = "insttId", required = false) String insttId,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "company-detail");
    }

    ResponseEntity<Map<String, Object>> companyDetailPageApi(
            @RequestParam(value = "insttId", required = false) String insttId,
            HttpServletRequest request,
            Locale locale) {
        Map<String, Object> response = adminHotPathPagePayloadService().buildCompanyDetailPagePayload(
                insttId,
                request,
                locale);
        if (!Boolean.TRUE.equals(response.get("canViewCompanyDetail"))) {
            return "FORBIDDEN".equals(response.get("companyDetailStatus"))
                    ? ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response)
                    : ResponseEntity.status(HttpServletResponse.SC_NOT_FOUND).body(response);
        }
        return ResponseEntity.ok(response);
    }

    String company_account(
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "saved", required = false) String saved,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "company-account");
    }

    ResponseEntity<Map<String, Object>> companyAccountPageApi(
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "saved", required = false) String saved,
            HttpServletRequest request,
            Locale locale) {
        Map<String, Object> response = adminHotPathPagePayloadService().buildCompanyAccountPagePayload(
                insttId,
                saved,
                request,
                locale);
        if (!Boolean.TRUE.equals(response.get("canViewCompanyAccount"))) {
            return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
        }
        return ResponseEntity.ok(response);
    }

    ResponseEntity<Map<String, Object>> companyAccountSubmitApi(
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam("membershipType") String membershipType,
            @RequestParam(value = "agencyName", required = false) String agencyName,
            @RequestParam(value = "representativeName", required = false) String representativeName,
            @RequestParam(value = "bizRegistrationNumber", required = false) String bizRegistrationNumber,
            @RequestParam("zipCode") String zipCode,
            @RequestParam("companyAddress") String companyAddress,
            @RequestParam(value = "companyAddressDetail", required = false) String companyAddressDetail,
            @RequestParam("chargerName") String chargerName,
            @RequestParam("chargerEmail") String chargerEmail,
            @RequestParam("chargerTel") String chargerTel,
            @RequestParam(value = "fileUploads", required = false) List<MultipartFile> fileUploads,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        AdminCompanyAccountService.SaveResult result = adminCompanyAccountService.saveCompanyAccount(
                insttId,
                membershipType,
                agencyName,
                representativeName,
                bizRegistrationNumber,
                zipCode,
                companyAddress,
                companyAddressDetail,
                chargerName,
                chargerEmail,
                chargerTel,
                fileUploads,
                isEn,
                hasMemberManagementMasterAccess(currentUserId, currentUserAuthorCode),
                true);
        return result.toResponseEntity();
    }

    String company_accountSubmit(
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam("membershipType") String membershipType,
            @RequestParam(value = "agencyName", required = false) String agencyName,
            @RequestParam(value = "representativeName", required = false) String representativeName,
            @RequestParam(value = "bizRegistrationNumber", required = false) String bizRegistrationNumber,
            @RequestParam("zipCode") String zipCode,
            @RequestParam("companyAddress") String companyAddress,
            @RequestParam(value = "companyAddressDetail", required = false) String companyAddressDetail,
            @RequestParam("chargerName") String chargerName,
            @RequestParam("chargerEmail") String chargerEmail,
            @RequestParam("chargerTel") String chargerTel,
            @RequestParam(value = "fileUploads", required = false) List<MultipartFile> fileUploads,
            HttpServletRequest request,
            HttpSession session,
            Locale locale,
            Model model) {
        primeCsrfToken(request);
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        AdminCompanyAccountService.SaveResult result = adminCompanyAccountService.saveCompanyAccount(
                insttId,
                membershipType,
                agencyName,
                representativeName,
                bizRegistrationNumber,
                zipCode,
                companyAddress,
                companyAddressDetail,
                chargerName,
                chargerEmail,
                chargerTel,
                fileUploads,
                isEn,
                hasGlobalDeptRoleAccess(currentUserId, resolveCurrentUserAuthorCode(currentUserId)),
                false);
        if (result.isForbidden()) {
            model.addAttribute("companyAccountErrors", Collections.singletonList(result.getMessage()));
            return isEn ? "egovframework/com/admin/company_account_en" : "egovframework/com/admin/company_account";
        }
        if (!result.isSuccess()) {
            populateCompanyAccountModelFromValues(
                    result.getInsttId(),
                    result.getMembershipType(),
                    result.getAgencyName(),
                    result.getRepresentativeName(),
                    result.getBizRegistrationNumber(),
                    result.getZipCode(),
                    result.getCompanyAddress(),
                    result.getCompanyAddressDetail(),
                    result.getChargerName(),
                    result.getChargerEmail(),
                    result.getChargerTel(),
                    isEn,
                    model);
            model.addAttribute("companyAccountFiles", result.getExistingFiles());
            model.addAttribute("companyAccountErrors", result.getErrors());
            return isEn ? "egovframework/com/admin/company_account_en" : "egovframework/com/admin/company_account";
        }
        return "redirect:" + adminPrefix(request, locale) + "/member/company_account?insttId=" + urlEncode(result.getInsttId()) + "&saved=Y";
    }

    void companyFile(
            @RequestParam(value = "fileId", required = false) String fileId,
            @RequestParam(value = "download", required = false) String download,
            HttpServletRequest request,
            HttpServletResponse response) throws Exception {
        if (!hasGlobalDeptRoleAccess(extractCurrentUserId(request), resolveCurrentUserAuthorCode(extractCurrentUserId(request)))) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }
        File file = resolveInstitutionFile(fileId);
        if (file == null) {
            response.sendError(404, "File not found or access denied.");
            return;
        }
        String canonicalPath = file.getCanonicalPath();
        if (!file.exists() || !isAllowedFilePath(canonicalPath)) {
            response.sendError(404, "File not found or access denied.");
            return;
        }

        boolean forceDownload = "true".equalsIgnoreCase(safeString(download));
        String fileName = file.getName();
        response.setContentType(resolveMediaType(fileName));
        response.setHeader("Content-Disposition",
                (forceDownload ? "attachment" : "inline") + "; filename=\"" + URLEncoder.encode(fileName, "UTF-8") + "\"");

        try (FileInputStream fis = new FileInputStream(file); OutputStream os = response.getOutputStream()) {
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                os.write(buffer, 0, bytesRead);
            }
            os.flush();
        }
    }

    void populateMemberList(
            String pageIndexParam,
            String searchKeyword,
            String membershipType,
            String sbscrbSttus,
            Model model,
            HttpServletRequest request) {
        adminListPageModelAssembler().populateMemberList(
                pageIndexParam,
                searchKeyword,
                membershipType,
                sbscrbSttus,
                model,
                request);
    }

    void populateMemberApprovalList(
            String pageIndexParam,
            String searchKeyword,
            String membershipType,
            String sbscrbSttus,
            String result,
            Model model,
            boolean isEn,
            HttpServletRequest request,
            Locale locale) {
        adminApprovalPageModelAssembler().populateMemberApprovalList(
                pageIndexParam,
                searchKeyword,
                membershipType,
                sbscrbSttus,
                result,
                model,
                isEn,
                request,
                locale);
    }

    void populateCompanyApprovalList(
            String pageIndexParam,
            String searchKeyword,
            String sbscrbSttus,
            String result,
            Model model,
            boolean isEn,
            HttpServletRequest request,
            Locale locale) {
        adminApprovalPageModelAssembler().populateCompanyApprovalList(
                pageIndexParam,
                searchKeyword,
                sbscrbSttus,
                result,
                model,
                isEn,
                request,
                locale);
    }

    EntrprsManageVO loadMemberById(String memberId) throws Exception {
        return entrprsManageService.selectEntrprsmberByMberId(memberId);
    }

    void processMemberApprovalStatusChange(String memberId, String targetStatus, String rejectReason) throws Exception {
        String normalizedMemberId = safeString(memberId);
        String normalizedTargetStatus = normalizeMemberStatusCode(targetStatus);
        String normalizedRejectReason = trimToLen(safeString(rejectReason), 1000);
        if (normalizedMemberId.isEmpty() || normalizedTargetStatus.isEmpty()) {
            return;
        }
        EntrprsManageVO member = entrprsManageService.selectEntrprsmberByMberId(normalizedMemberId);
        if (member == null || safeString(member.getEntrprsmberId()).isEmpty()) {
            return;
        }
        member.setEntrprsMberSttus(normalizedTargetStatus);
        member.setRjctRsn(normalizedRejectReason.isEmpty() ? safeString(member.getRjctRsn()) : normalizedRejectReason);
        if ("R".equals(normalizedTargetStatus)) {
            member.setRjctPnttm(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        } else {
            member.setRjctPnttm("");
        }
        entrprsManageService.updateEntrprsmber(member);
        if ("P".equals(normalizedTargetStatus)) {
            entrprsManageService.ensureEnterpriseSecurityMapping(member.getUniqId());
        }
    }

    void processCompanyApprovalStatusChange(String insttId, String targetStatus, String rejectReason) throws Exception {
        String normalizedInsttId = safeString(insttId);
        String normalizedTargetStatus = normalizeMemberStatusCode(targetStatus);
        String normalizedRejectReason = trimToLen(safeString(rejectReason), 1000);
        if (normalizedInsttId.isEmpty() || normalizedTargetStatus.isEmpty()) {
            return;
        }
        InstitutionStatusVO current = loadInstitutionInfoByInsttId(normalizedInsttId);
        if (current == null || current.isEmpty()) {
            return;
        }
        InsttInfoVO vo = new InsttInfoVO();
        vo.setInsttId(normalizedInsttId);
        vo.setInsttNm(current.getInsttNm());
        vo.setReprsntNm(current.getReprsntNm());
        vo.setBizrno(current.getBizrno());
        vo.setZip(current.getZip());
        vo.setAdres(current.getAdres());
        vo.setDetailAdres(current.getDetailAdres());
        vo.setBizRegFilePath(current.getBizRegFilePath());
        vo.setInsttSttus(normalizedTargetStatus);
        vo.setEntrprsSeCode(current.getEntrprsSeCode());
        vo.setRjctRsn(normalizedRejectReason.isEmpty() ? safeString(current.getRjctRsn()) : normalizedRejectReason);
        if ("R".equals(normalizedTargetStatus)) {
            vo.setRjctPnttm(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        } else {
            vo.setRjctPnttm("");
        }
        vo.setChargerNm(current.getChargerNm());
        vo.setChargerEmail(current.getChargerEmail());
        vo.setChargerTel(current.getChargerTel());
        entrprsManageService.updateInsttInfo(vo);
    }

    private void appendApprovalRedirectQuery(StringBuilder redirect, String name, String value) {
        String normalized = safeString(value);
        if (normalized.isEmpty()) {
            return;
        }
        redirect.append('&').append(name).append('=').append(urlEncode(normalized));
    }

    private boolean appendRedirectQuery(StringBuilder redirect, boolean hasQuery, String name, String value) {
        String normalized = safeString(value);
        if (normalized.isEmpty()) {
            return hasQuery;
        }
        redirect.append(hasQuery ? '&' : '?')
                .append(name)
                .append('=')
                .append(urlEncode(normalized));
        return true;
    }

    private boolean appendRedirectErrorQuery(StringBuilder redirect, boolean hasQuery, String errorMessage) {
        return appendRedirectQuery(redirect, hasQuery, "errorMessage", errorMessage);
    }

    private ResponseEntity<Map<String, Object>> duplicateCheckError(int status, boolean duplicated, String message) {
        return ResponseEntity.status(status).body(buildDuplicateCheckResponse(false, duplicated, message));
    }

    private ResponseEntity<Map<String, Object>> duplicateCheckSuccess(boolean duplicated, String message) {
        return ResponseEntity.ok(buildDuplicateCheckResponse(!duplicated, duplicated, message));
    }

    private Map<String, Object> buildDuplicateCheckResponse(boolean valid, boolean duplicated, String message) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("valid", valid);
        response.put("duplicated", duplicated);
        response.put("message", message);
        return response;
    }

    private ResponseEntity<Map<String, Object>> successResponse(Map<String, Object> body) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        if (body != null && !body.isEmpty()) {
            response.putAll(body);
        }
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> failureMessageResponse(int status, String message) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", false);
        response.put("message", message);
        return ResponseEntity.status(status).body(response);
    }

    private ResponseEntity<Map<String, Object>> failureErrorsResponse(int status, Object errors) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", false);
        response.put("errors", errors);
        return ResponseEntity.status(status).body(response);
    }

    private ResponseEntity<Map<String, Object>> statusFailureResponse(int status, String errors) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "fail");
        response.put("errors", errors);
        return ResponseEntity.status(status).body(response);
    }

    private ResponseEntity<Map<String, Object>> statusSuccessResponse(Map<String, Object> body) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "success");
        if (body != null && !body.isEmpty()) {
            response.putAll(body);
        }
        return ResponseEntity.ok(response);
    }

    private String extractResponseErrorMessage(Map<String, Object> body) {
        if (body == null || body.isEmpty()) {
            return "";
        }
        Object message = body.get("message");
        String normalizedMessage = safeString(message == null ? null : message.toString());
        if (!normalizedMessage.isEmpty()) {
            return normalizedMessage;
        }
        Object errors = body.get("errors");
        if (errors instanceof Collection<?>) {
            for (Object error : (Collection<?>) errors) {
                String value = safeString(error == null ? null : error.toString());
                if (!value.isEmpty()) {
                    return value;
                }
            }
        }
        return "";
    }

    String resolveMemberApprovalBasePath(HttpServletRequest request, Locale locale) {
        String requestUri = request == null ? "" : safeString(request.getRequestURI());
        if (requestUri.endsWith("/member/company-approve")) {
            return adminPrefix(request, locale) + "/member/company-approve";
        }
        return adminPrefix(request, locale) + "/member/approve";
    }

    private String resolveMemberApprovalViewName(HttpServletRequest request, boolean isEn) {
        String requestUri = request == null ? "" : safeString(request.getRequestURI());
        if (requestUri.endsWith("/member/company-approve")) {
            return isEn ? "egovframework/com/admin/company_approve_en" : "egovframework/com/admin/company_approve";
        }
        return isEn ? "egovframework/com/admin/member_approve_en" : "egovframework/com/admin/member_approve";
    }

    String resolveApprovalResultMessage(String result, boolean isEn) {
        String normalized = safeString(result);
        if (normalized.isEmpty()) {
            return "";
        }
        if ("approved".equalsIgnoreCase(normalized)) {
            return isEn ? "The member approval has been completed." : "회원 가입 승인이 완료되었습니다.";
        }
        if ("batchApproved".equalsIgnoreCase(normalized)) {
            return isEn ? "Selected members have been approved." : "선택한 회원 승인이 완료되었습니다.";
        }
        if ("rejected".equalsIgnoreCase(normalized)) {
            return isEn ? "The member has been rejected." : "회원 가입 반려 처리가 완료되었습니다.";
        }
        if ("batchRejected".equalsIgnoreCase(normalized)) {
            return isEn ? "Selected members have been rejected." : "선택한 회원 반려 처리가 완료되었습니다.";
        }
        return "";
    }

    String resolveCompanyApprovalResultMessage(String result, boolean isEn) {
        String normalized = safeString(result);
        if (normalized.isEmpty()) {
            return "";
        }
        if ("approved".equalsIgnoreCase(normalized)) {
            return isEn ? "The company approval has been completed." : "회원사 가입 승인이 완료되었습니다.";
        }
        if ("batchApproved".equalsIgnoreCase(normalized)) {
            return isEn ? "Selected companies have been approved." : "선택한 회원사 승인이 완료되었습니다.";
        }
        if ("rejected".equalsIgnoreCase(normalized)) {
            return isEn ? "The company has been rejected." : "회원사 가입 반려 처리가 완료되었습니다.";
        }
        if ("batchRejected".equalsIgnoreCase(normalized)) {
            return isEn ? "Selected companies have been rejected." : "선택한 회원사 반려 처리가 완료되었습니다.";
        }
        return "";
    }

    List<Map<String, String>> buildApprovalStatusOptions(boolean isEn) {
        List<Map<String, String>> options = new ArrayList<>();
        options.add(buildOption("A", isEn ? "Pending Approval" : "승인 대기"));
        options.add(buildOption("P", isEn ? "Active" : "활성"));
        options.add(buildOption("R", isEn ? "Rejected" : "반려"));
        return options;
    }

    void populateAdminMemberList(
            String pageIndexParam,
            String searchKeyword,
            String sbscrbSttus,
            Model model,
            HttpServletRequest request) {
        adminListPageModelAssembler().populateAdminMemberList(
                pageIndexParam,
                searchKeyword,
                sbscrbSttus,
                model,
                request);
    }

    void populateCompanyList(
            String pageIndexParam,
            String searchKeyword,
            String sbscrbSttus,
            Model model,
            HttpServletRequest request) {
        adminListPageModelAssembler().populateCompanyList(
                pageIndexParam,
                searchKeyword,
                sbscrbSttus,
                model,
                request);
    }

    Map<String, Object> buildMemberStatsPageData(boolean isEn) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("title", isEn ? "Member Statistics Dashboard" : "회원 통계 현황");
        response.put("subtitle", isEn
                ? "Analyze the registered member base by member type, monthly signups, and regional distribution."
                : "시스템에 등록된 전체 회원 정보를 유형별, 지역별로 분석합니다.");
        response.put("totalMembers", 1422);
        response.put("memberTypeStats", List.of(
                buildStatsRow("enterprise", isEn ? "Enterprise Members" : "기업 회원", "78.7", "1120", "bg-blue-600"),
                buildStatsRow("individual", isEn ? "Individual Members" : "개인 회원", "21.3", "302", "bg-emerald-500")));
        response.put("monthlySignupStats", List.of(
                buildMonthlySignupRow(isEn ? "Apr" : "04월", "100", "56", false),
                buildMonthlySignupRow(isEn ? "May" : "05월", "85", "48", false),
                buildMonthlySignupRow(isEn ? "Jun" : "06월", "120", "63", false),
                buildMonthlySignupRow(isEn ? "Jul" : "07월", "145", "81", false),
                buildMonthlySignupRow(isEn ? "Aug" : "08월", "170", "96", true)));
        response.put("regionalDistribution", List.of(
                buildRegionalDistributionRow(isEn ? "Capital Area" : "수도권", "42.5", isEn ? "774 companies" : "774개 기업"),
                buildRegionalDistributionRow(isEn ? "Yeongnam Area" : "영남권", "28.2", isEn ? "513 companies" : "513개 기업"),
                buildRegionalDistributionRow(isEn ? "Chungcheong Area" : "충청권", "18.4", isEn ? "335 companies" : "335개 기업"),
                buildRegionalDistributionRow(isEn ? "Honam and Others" : "호남·기타", "10.9", isEn ? "198 companies" : "198개 기업")));
        return response;
    }

    Map<String, Object> buildMemberRegisterPageData(boolean isEn) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("memberTypeOptions", List.of(
                buildOptionRow("enterprise", isEn ? "Enterprise (Emitter)" : "기업 (배출사업자)"),
                buildOptionRow("center", isEn ? "Promotion Center" : "진흥센터"),
                buildOptionRow("authority", isEn ? "Competent Authority" : "주무관청")));
        response.put("permissionOptions", List.of(
                buildOptionRow("READ", isEn ? "Data Inquiry" : "데이터 조회 권한"),
                buildOptionRow("WRITE", isEn ? "Data Entry / Edit" : "데이터 입력/수정 권한"),
                buildOptionRow("AUDIT", isEn ? "Certification Audit" : "인증 심사 권한"),
                buildOptionRow("REPORT", isEn ? "Report Download" : "통계 리포트 다운로드")));
        response.put("defaultOrganizationName", "");
        return response;
    }

    private Map<String, String> buildStatsRow(String key, String label, String percentage, String count, String colorClass) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("key", key);
        row.put("label", label);
        row.put("percentage", percentage);
        row.put("count", count);
        row.put("colorClass", colorClass);
        return row;
    }

    private Map<String, String> buildMonthlySignupRow(String month, String currentHeight, String previousHeight, boolean active) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("month", month);
        row.put("currentHeight", currentHeight);
        row.put("previousHeight", previousHeight);
        row.put("active", active ? "Y" : "N");
        return row;
    }

    private Map<String, String> buildRegionalDistributionRow(String region, String percentage, String countLabel) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("region", region);
        row.put("percentage", percentage);
        row.put("countLabel", countLabel);
        return row;
    }

    private Map<String, String> buildOptionRow(String value, String label) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("value", value);
        row.put("label", label);
        return row;
    }

    private void populateEmissionResultList(
            String pageIndexParam,
            String searchKeyword,
            String resultStatus,
            String verificationStatus,
            Model model,
            boolean isEn) {
        adminEmissionResultPageModelAssembler().populateEmissionResultList(
                pageIndexParam,
                searchKeyword,
                resultStatus,
                verificationStatus,
                model,
                isEn);
    }

    private void populateLoginHistory(
            String pageIndexParam,
            String searchKeyword,
            String userSe,
            String loginResult,
            String requestedInsttId,
            Model model,
            HttpServletRequest request) {
        adminListPageModelAssembler().populateLoginHistory(
                pageIndexParam,
                searchKeyword,
                userSe,
                loginResult,
                requestedInsttId,
                model,
                request);
    }

    private void populateBlockedLoginHistory(
            String pageIndexParam,
            String searchKeyword,
            String userSe,
            String requestedInsttId,
            Model model,
            HttpServletRequest request) {
        adminListPageModelAssembler().populateBlockedLoginHistory(
                pageIndexParam,
                searchKeyword,
                userSe,
                requestedInsttId,
                model,
                request);
    }

    void populatePasswordResetHistory(
            String pageIndexParam,
            String searchKeyword,
            String resetSource,
            String insttId,
            HttpServletRequest request,
            Model model,
            boolean isEn) {
        adminMemberPageModelAssembler().populatePasswordResetHistory(
                pageIndexParam,
                searchKeyword,
                resetSource,
                insttId,
                request,
                model,
                isEn);
    }

    String auth_group(
            @RequestParam(value = "authorCode", required = false) String authorCode,
            @RequestParam(value = "roleCategory", required = false) String roleCategory,
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "userSearchKeyword", required = false) String userSearchKeyword,
            HttpServletRequest request, Locale locale, Model model) {
        return redirectReactMigration(request, locale, "auth-group");
    }

    ResponseEntity<Map<String, Object>> authGroupPageApi(
            @RequestParam(value = "authorCode", required = false) String authorCode,
            @RequestParam(value = "roleCategory", required = false) String roleCategory,
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "menuCode", required = false) String menuCode,
            @RequestParam(value = "featureCode", required = false) String featureCode,
            @RequestParam(value = "userSearchKeyword", required = false) String userSearchKeyword,
            HttpServletRequest request, Locale locale) {
        return ResponseEntity.ok(adminHotPathPagePayloadService().buildAuthGroupPagePayload(
                authorCode,
                roleCategory,
                insttId,
                menuCode,
                featureCode,
                userSearchKeyword,
                request,
                locale));
    }

    ResponseEntity<Map<String, Object>> saveAuthGroupProfileApi(
            @RequestBody AdminAuthorRoleProfileSaveRequestDTO payload,
            HttpServletRequest request, Locale locale) {
        AdminAuthorityCommandService.CommandResult result = adminAuthorityCommandService.saveAuthGroupProfile(payload, request, locale);
        if (!result.isSuccess()) {
            return ResponseEntity.status(result.getStatus()).body(result.getBody());
        }
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        String normalizedAuthorCode = safeString(payload == null ? null : payload.getAuthorCode()).toUpperCase(Locale.ROOT);
        AuthorRoleProfileVO saved = (AuthorRoleProfileVO) result.getBody().get("savedProfile");
        result.getBody().put("profile", toAuthorRoleProfileMap(saved));
        result.getBody().remove("savedProfile");
        recordAdminActionAudit(request,
                currentUserId,
                currentUserAuthorCode,
                "AMENU_AUTH_GROUP",
                "auth-group",
                "AUTH_GROUP_PROFILE_SAVE",
                "AUTHOR_ROLE_PROFILE",
                normalizedAuthorCode,
                "{\"authorCode\":\"" + safeJson(normalizedAuthorCode) + "\"}",
                "{\"displayTitle\":\"" + safeJson(saved == null ? null : saved.getDisplayTitle()) + "\"}");
        return ResponseEntity.ok(result.getBody());
    }

    ResponseEntity<Map<String, Object>> createAuthGroupApi(
            @RequestBody AdminAuthGroupCreateRequestDTO payload,
            HttpServletRequest request, Locale locale) {
        AdminAuthorityCommandService.CommandResult result = adminAuthorityCommandService.createAuthGroup(payload, request, locale);
        if (!result.isSuccess()) {
            return ResponseEntity.status(result.getStatus()).body(result.getBody());
        }
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        String normalizedCode = safeString(result.getBody().get("authorCode") == null ? null : result.getBody().get("authorCode").toString());
        String selectedRoleCategory = safeString(result.getBody().get("roleCategory") == null ? null : result.getBody().get("roleCategory").toString());
        String scopedInsttId = safeString(result.getBody().get("insttId") == null ? null : result.getBody().get("insttId").toString());
        recordAdminActionAudit(request,
                currentUserId,
                currentUserAuthorCode,
                "AMENU_AUTH_GROUP",
                "auth-group",
                "AUTH_GROUP_CREATE",
                "AUTHOR_GROUP",
                normalizedCode,
                "{\"authorCode\":\"" + safeJson(normalizedCode) + "\",\"roleCategory\":\"" + safeJson(selectedRoleCategory)
                        + "\",\"insttId\":\"" + safeJson(scopedInsttId) + "\"}",
                "{\"status\":\"SUCCESS\"}");
        return ResponseEntity.ok(result.getBody());
    }

    ResponseEntity<Map<String, Object>> saveAuthGroupFeaturesApi(
            @RequestBody AdminAuthGroupFeatureSaveRequestDTO payload,
            HttpServletRequest request, Locale locale) {
        AdminAuthorityCommandService.CommandResult result = adminAuthorityCommandService.saveAuthGroupFeatures(payload, request, locale);
        if (!result.isSuccess()) {
            return ResponseEntity.status(result.getStatus()).body(result.getBody());
        }
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        String normalizedAuthorCode = safeString(payload == null ? null : payload.getAuthorCode()).toUpperCase(Locale.ROOT);
        @SuppressWarnings("unchecked")
        List<String> savedFeatureCodes = (List<String>) result.getBody().getOrDefault("savedFeatureCodes", Collections.emptyList());
        result.getBody().remove("savedFeatureCodes");
        recordAdminActionAudit(request,
                currentUserId,
                currentUserAuthorCode,
                "AMENU_AUTH_GROUP",
                "auth-group",
                "AUTH_GROUP_FEATURE_SAVE",
                "AUTHOR_GROUP",
                normalizedAuthorCode,
                "{\"authorCode\":\"" + safeJson(normalizedAuthorCode) + "\",\"featureCodes\":\""
                        + safeJson(savedFeatureCodes.toString()) + "\"}",
                "{\"status\":\"SUCCESS\"}");
        return ResponseEntity.ok(result.getBody());
    }

    String auth_change(
            @RequestParam(value = "updated", required = false) String updated,
            @RequestParam(value = "targetUserId", required = false) String targetUserId,
            @RequestParam(value = "error", required = false) String error,
            HttpServletRequest request, Locale locale, Model model) {
        return redirectReactMigration(request, locale, "auth-change");
    }

    ResponseEntity<Map<String, Object>> authChangePageApi(
            @RequestParam(value = "updated", required = false) String updated,
            @RequestParam(value = "targetUserId", required = false) String targetUserId,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "pageIndex", required = false) Integer pageIndex,
            @RequestParam(value = "error", required = false) String error,
            HttpServletRequest request, Locale locale) {
        return ResponseEntity.ok(adminHotPathPagePayloadService().buildAuthChangePagePayload(
                updated,
                targetUserId,
                searchKeyword,
                pageIndex,
                error,
                request,
                locale));
    }

    ResponseEntity<Map<String, Object>> authChangeHistoryApi(
            HttpServletRequest request, Locale locale) {
        return ResponseEntity.ok(adminHotPathPagePayloadService().buildAuthChangeHistoryPayload(request, locale));
    }

    ResponseEntity<Map<String, Object>> saveAuthChangeApi(
            @RequestBody AdminAuthChangeSaveRequestDTO payload,
            HttpServletRequest request, Locale locale) {
        AdminAuthorityCommandService.CommandResult result = adminAuthorityCommandService.saveAuthChange(payload, request, locale);
        if (!result.isSuccess()) {
            return ResponseEntity.status(result.getStatus()).body(result.getBody());
        }
        String currentUserId = extractCurrentUserId(request);
        String normalizedEmplyrId = safeString(payload == null ? null : payload.getEmplyrId());
        String normalizedAuthorCode = safeString(payload == null ? null : payload.getAuthorCode()).toUpperCase(Locale.ROOT);
        @SuppressWarnings("unchecked")
        Map<String, String> beforeRole = (Map<String, String>) result.getBody().getOrDefault("beforeRole", Collections.emptyMap());
        recordAdminRoleAssignmentAudit(
                request,
                currentUserId,
                resolveCurrentUserAuthorCode(currentUserId),
                normalizedEmplyrId,
                beforeRole,
                buildAuthorSummary(normalizedAuthorCode)
        );
        return ResponseEntity.ok(result.getBody());
    }

    @RequestMapping(value = { "/member/auth-change/save", "/system/auth-change/save" }, method = RequestMethod.POST)
    public String saveAuthChange(
            @RequestParam(value = "emplyrId", required = false) String emplyrId,
            @RequestParam(value = "authorCode", required = false) String authorCode,
            HttpServletRequest request, Locale locale, Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        AdminAuthChangeSaveRequestDTO payload = new AdminAuthChangeSaveRequestDTO();
        payload.setEmplyrId(emplyrId);
        payload.setAuthorCode(authorCode);
        AdminAuthorityCommandService.CommandResult result = adminAuthorityCommandService.saveAuthChange(payload, request, locale);
        if (!result.isSuccess()) {
            model.addAttribute("authChangeError", result.getBody().get("message"));
            return auth_change(null, null, null, request, locale, model);
        }
        String currentUserId = extractCurrentUserId(request);
        String normalizedEmplyrId = safeString(emplyrId);
        String normalizedAuthorCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        @SuppressWarnings("unchecked")
        Map<String, String> beforeRole = (Map<String, String>) result.getBody().getOrDefault("beforeRole", Collections.emptyMap());
        recordAdminRoleAssignmentAudit(
                request,
                currentUserId,
                resolveCurrentUserAuthorCode(currentUserId),
                normalizedEmplyrId,
                beforeRole,
                buildAuthorSummary(normalizedAuthorCode)
        );
        return "redirect:" + buildAuthChangeRedirectUrl(request, locale, normalizedEmplyrId, null);
    }

    String dept_role_mapping(
            @RequestParam(value = "updated", required = false) String updated,
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "error", required = false) String error,
            HttpServletRequest request, Locale locale, Model model) {
        return redirectReactMigration(request, locale, "dept-role");
    }

    ResponseEntity<Map<String, Object>> deptRoleMappingPageApi(
            @RequestParam(value = "updated", required = false) String updated,
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "memberSearchKeyword", required = false) String memberSearchKeyword,
            @RequestParam(value = "memberPageIndex", required = false) Integer memberPageIndex,
            @RequestParam(value = "error", required = false) String error,
            HttpServletRequest request, Locale locale) {
        return ResponseEntity.ok(adminHotPathPagePayloadService().buildDeptRolePagePayload(
                updated,
                insttId,
                memberSearchKeyword,
                memberPageIndex,
                error,
                request,
                locale));
    }

    ResponseEntity<Map<String, Object>> saveDeptRoleMappingApi(
            @RequestBody AdminDeptRoleMappingSaveRequestDTO payload,
            HttpServletRequest request, Locale locale) {
        AdminAuthorityCommandService.CommandResult result = adminAuthorityCommandService.saveDeptRoleMapping(payload, request, locale);
        if (!result.isSuccess()) {
            return ResponseEntity.status(result.getStatus()).body(result.getBody());
        }
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        String normalizedInsttId = safeString(payload == null ? null : payload.getInsttId());
        String normalizedDeptNm = safeString(payload == null ? null : payload.getDeptNm());
        String normalizedAuthorCode = safeString(payload == null ? null : payload.getAuthorCode()).toUpperCase(Locale.ROOT);
        recordAdminActionAudit(request,
                currentUserId,
                currentUserAuthorCode,
                "AMENU_DEPT_ROLE",
                "dept-role",
                "DEPARTMENT_ROLE_MAPPING_SAVE",
                "DEPARTMENT_ROLE",
                normalizedInsttId + ":" + normalizedDeptNm,
                "{\"insttId\":\"" + safeJson(normalizedInsttId) + "\",\"deptNm\":\"" + safeJson(normalizedDeptNm) + "\",\"authorCode\":\"" + safeJson(normalizedAuthorCode) + "\"}",
                "{\"status\":\"SUCCESS\"}");
        return ResponseEntity.ok(result.getBody());
    }

    ResponseEntity<Map<String, Object>> saveDeptRoleMemberApi(
            @RequestBody AdminDeptRoleMemberSaveRequestDTO payload,
            HttpServletRequest request, Locale locale) {
        AdminAuthorityCommandService.CommandResult result = adminAuthorityCommandService.saveDeptRoleMember(payload, request, locale);
        if (!result.isSuccess()) {
            return ResponseEntity.status(result.getStatus()).body(result.getBody());
        }
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        String normalizedInsttId = safeString(payload == null ? null : payload.getInsttId());
        String normalizedEntrprsMberId = safeString(payload == null ? null : payload.getEntrprsMberId());
        String normalizedAuthorCode = safeString(payload == null ? null : payload.getAuthorCode()).toUpperCase(Locale.ROOT);
        recordAdminActionAudit(request,
                currentUserId,
                currentUserAuthorCode,
                "AMENU_DEPT_ROLE",
                "dept-role",
                "COMPANY_MEMBER_ROLE_SAVE",
                "MEMBER",
                normalizedEntrprsMberId,
                "{\"insttId\":\"" + safeJson(normalizedInsttId) + "\",\"memberId\":\"" + safeJson(normalizedEntrprsMberId) + "\",\"authorCode\":\"" + safeJson(normalizedAuthorCode) + "\"}",
                "{\"status\":\"SUCCESS\"}");
        return ResponseEntity.ok(result.getBody());
    }

    @RequestMapping(value = { "/member/dept-role-mapping/save", "/system/dept-role-mapping/save" }, method = RequestMethod.POST)
    public String saveDeptRoleMapping(
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "cmpnyNm", required = false) String cmpnyNm,
            @RequestParam(value = "deptNm", required = false) String deptNm,
            @RequestParam(value = "authorCode", required = false) String authorCode,
            HttpServletRequest request, Locale locale, Model model) {
        AdminDeptRoleMappingSaveRequestDTO payload = new AdminDeptRoleMappingSaveRequestDTO();
        payload.setInsttId(insttId);
        payload.setCmpnyNm(cmpnyNm);
        payload.setDeptNm(deptNm);
        payload.setAuthorCode(authorCode);
        AdminAuthorityCommandService.CommandResult result = adminAuthorityCommandService.saveDeptRoleMapping(payload, request, locale);
        if (!result.isSuccess()) {
            model.addAttribute("deptRoleError", result.getBody().get("message"));
            return dept_role_mapping(null, safeString(insttId), null, request, locale, model);
        }
        String normalizedInsttId = safeString(insttId);
        return "redirect:" + buildDeptRoleRedirectUrl(request, locale, normalizedInsttId, null);
    }

    @RequestMapping(value = { "/member/dept-role-mapping/member-save", "/system/dept-role-mapping/member-save" }, method = RequestMethod.POST)
    public String saveDeptRoleMember(
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "entrprsMberId", required = false) String entrprsMberId,
            @RequestParam(value = "authorCode", required = false) String authorCode,
            HttpServletRequest request, Locale locale, Model model) {
        AdminDeptRoleMemberSaveRequestDTO payload = new AdminDeptRoleMemberSaveRequestDTO();
        payload.setInsttId(insttId);
        payload.setEntrprsMberId(entrprsMberId);
        payload.setAuthorCode(authorCode);
        AdminAuthorityCommandService.CommandResult result = adminAuthorityCommandService.saveDeptRoleMember(payload, request, locale);
        if (!result.isSuccess()) {
            model.addAttribute("deptRoleError", result.getBody().get("message"));
            return dept_role_mapping(null, safeString(insttId), null, request, locale, model);
        }
        return "redirect:" + buildDeptRoleRedirectUrl(request, locale, safeString(insttId), null);
    }

    @RequestMapping(value = { "/member/auth-group/create", "/auth/group/create", "/system/role/create" }, method = RequestMethod.POST)
    public String createAuthGroup(
            @RequestParam(value = "authorCode", required = false) String authorCode,
            @RequestParam(value = "authorNm", required = false) String authorNm,
            @RequestParam(value = "authorDc", required = false) String authorDc,
            @RequestParam(value = "roleCategory", required = false) String roleCategory,
            @RequestParam(value = "insttId", required = false) String insttId,
            HttpServletRequest request, Locale locale, Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        boolean webmaster = isWebmaster(currentUserId);
        boolean ownCompanyAccess = requiresOwnCompanyAccess(currentUserId, currentUserAuthorCode);
        String selectedRoleCategory = resolveRoleCategory(roleCategory);
        if (!webmaster && !ownCompanyAccess) {
            model.addAttribute("authGroupError", isEn
                    ? "Only webmaster or company-scoped administrators can create authority groups."
                    : "webmaster 또는 회사 범위 관리자가 권한 그룹을 추가할 수 있습니다.");
            return auth_group(null, selectedRoleCategory, null, null, request, locale, model);
        }
        if (!webmaster && "GENERAL".equals(selectedRoleCategory)) {
            model.addAttribute("authGroupError", isEn
                    ? "Company-scoped administrators can only create department or user roles."
                    : "회사 범위 관리자는 부서/사용자 권한 그룹만 생성할 수 있습니다.");
            return auth_group(null, selectedRoleCategory, null, null, request, locale, model);
        }

        String requestedInsttId = safeString(insttId);
        String scopedInsttId = ownCompanyAccess ? resolveCurrentUserInsttId(currentUserId) : requestedInsttId;
        boolean forceScoped = ownCompanyAccess
                || (!requestedInsttId.isEmpty() && ("DEPARTMENT".equals(selectedRoleCategory) || "USER".equals(selectedRoleCategory)));
        String normalizedCode = normalizeScopedAuthorCode(authorCode, selectedRoleCategory, scopedInsttId, forceScoped);
        String normalizedName = safeString(authorNm);
        String normalizedDesc = safeString(authorDc);
        if (normalizedCode.isEmpty() || normalizedName.isEmpty()) {
            model.addAttribute("authGroupError", isEn
                    ? "Role code and role name are required."
                    : "Role 코드와 Role 명은 필수입니다.");
            return auth_group(null, selectedRoleCategory, scopedInsttId, null, request, locale, model);
        }

        try {
            if (authGroupManageService.countAuthorCode(normalizedCode) > 0) {
                model.addAttribute("authGroupError", isEn
                        ? "The role code already exists."
                        : "이미 존재하는 Role 코드입니다.");
                return auth_group(normalizedCode, selectedRoleCategory, scopedInsttId, null, request, locale, model);
            }
            authGroupManageService.insertAuthor(normalizedCode, normalizedName, normalizedDesc);
        } catch (Exception e) {
            log.error("Failed to create authority group. authorCode={}", normalizedCode, e);
            model.addAttribute("authGroupError", isEn
                    ? "Failed to create the role group."
                    : "권한 그룹 추가에 실패했습니다.");
            return auth_group(null, selectedRoleCategory, scopedInsttId, null, request, locale, model);
        }

        recordAdminActionAudit(request,
                currentUserId,
                currentUserAuthorCode,
                "AMENU_AUTH_GROUP",
                "auth-group",
                "AUTH_GROUP_CREATE",
                "AUTHOR_GROUP",
                normalizedCode,
                "{\"authorCode\":\"" + safeJson(normalizedCode) + "\",\"roleCategory\":\"" + safeJson(selectedRoleCategory)
                        + "\",\"insttId\":\"" + safeJson(scopedInsttId) + "\"}",
                "{\"status\":\"SUCCESS\"}");
        return "redirect:" + buildAuthGroupRedirectUrl(request, locale, normalizedCode, selectedRoleCategory, scopedInsttId);
    }

    @RequestMapping(value = { "/member/auth-group/save-features", "/auth/group/save-features", "/system/role/save-features" }, method = RequestMethod.POST)
    public String saveAuthGroupFeatures(
            @RequestParam(value = "authorCode", required = false) String authorCode,
            @RequestParam(value = "featureCodes", required = false) List<String> featureCodes,
            @RequestParam(value = "roleCategory", required = false) String roleCategory,
            HttpServletRequest request, Locale locale, Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        boolean webmaster = isWebmaster(currentUserId);
        boolean ownCompanyAccess = requiresOwnCompanyAccess(currentUserId, currentUserAuthorCode);
        String selectedRoleCategory = resolveRoleCategory(roleCategory);
        String scopedInsttId = ownCompanyAccess ? resolveCurrentUserInsttId(currentUserId) : "";
        if (!webmaster && !ownCompanyAccess) {
            model.addAttribute("authGroupError", isEn
                    ? "Only webmaster or company-scoped administrators can update role-feature mappings."
                    : "webmaster 또는 회사 범위 관리자만 Role-기능 매핑을 수정할 수 있습니다.");
            return auth_group(authorCode, selectedRoleCategory, scopedInsttId, null, request, locale, model);
        }

        String normalizedAuthorCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        if (normalizedAuthorCode.isEmpty()) {
            model.addAttribute("authGroupError", isEn
                    ? "Role code is required."
                    : "Role 코드를 확인해 주세요.");
            return auth_group(null, selectedRoleCategory, scopedInsttId, null, request, locale, model);
        }
        if (!webmaster) {
            if ("GENERAL".equals(selectedRoleCategory)) {
                model.addAttribute("authGroupError", isEn
                        ? "Company-scoped administrators can only update department or user roles."
                        : "회사 범위 관리자는 부서/사용자 권한 그룹만 수정할 수 있습니다.");
                return auth_group(normalizedAuthorCode, selectedRoleCategory, scopedInsttId, null, request, locale, model);
            }
            if (!isCompanyScopedAuthorCodeForInstt(normalizedAuthorCode, selectedRoleCategory, scopedInsttId)) {
                model.addAttribute("authGroupError", isEn
                        ? "You can only update role groups created for your own company."
                        : "본인 회사에 속한 권한 그룹만 수정할 수 있습니다.");
                return auth_group(normalizedAuthorCode, selectedRoleCategory, scopedInsttId, null, request, locale, model);
            }
        }

        Set<String> grantableFeatureCodes;
        try {
            grantableFeatureCodes = resolveGrantableFeatureCodeSet(currentUserId, webmaster);
            authGroupManageService.saveAuthorFeatureRelations(
                    normalizedAuthorCode,
                    mergeRoleFeatureSelection(
                            normalizedAuthorCode,
                            featureCodes == null ? Collections.emptyList() : featureCodes,
                            grantableFeatureCodes));
        } catch (Exception e) {
            log.error("Failed to save role-feature relations. authorCode={}", normalizedAuthorCode, e);
            model.addAttribute("authGroupError", isEn
                    ? "Failed to save role-feature mappings."
                    : "Role-기능 매핑 저장에 실패했습니다.");
            return auth_group(normalizedAuthorCode, selectedRoleCategory, scopedInsttId, null, request, locale, model);
        }

        List<String> savedFeatureCodes = filterFeatureCodesByGrantable(featureCodes, grantableFeatureCodes);
        recordAdminActionAudit(request,
                currentUserId,
                currentUserAuthorCode,
                "AMENU_AUTH_GROUP",
                "auth-group",
                "AUTH_GROUP_FEATURE_SAVE",
                "AUTHOR_GROUP",
                normalizedAuthorCode,
                "{\"authorCode\":\"" + safeJson(normalizedAuthorCode) + "\",\"featureCodes\":\""
                        + safeJson(savedFeatureCodes.toString()) + "\"}",
                "{\"status\":\"SUCCESS\"}");
        return "redirect:" + buildAuthGroupRedirectUrl(request, locale, normalizedAuthorCode, selectedRoleCategory);
    }

    ResponseEntity<byte[]> member_listExcel(
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "membershipType", required = false) String membershipType,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus) throws Exception {
        return adminMemberExportService.buildMemberListExcel(searchKeyword, membershipType, sbscrbSttus);
    }

    ResponseEntity<byte[]> adminListExcel(
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request) throws Exception {
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        boolean canManage = hasMemberManagementCompanyAdminAccess(currentUserId, currentUserAuthorCode);
        return adminMemberExportService.buildAdminListExcel(
                searchKeyword,
                sbscrbSttus,
                currentUserId,
                currentUserAuthorCode,
                canManage,
                resolveCurrentUserInsttId(currentUserId));
    }

    ResponseEntity<byte[]> company_listExcel(
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request,
            Locale locale) throws Exception {
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        return adminMemberExportService.buildCompanyListExcel(
                searchKeyword,
                sbscrbSttus,
                hasMemberManagementMasterAccess(currentUserId, currentUserAuthorCode),
                requiresOwnCompanyAccess(currentUserId, currentUserAuthorCode) ? resolveCurrentUserInsttId(currentUserId) : "");
    }

    ResponseEntity<Map<String, Object>> adminMenuPlaceholderApi(
            @RequestParam(value = "requestPath", required = false) String requestPath,
            HttpServletRequest request,
            Locale locale) {
        return ResponseEntity.ok(adminMenuShellService.buildMenuPlaceholderPayload(requestPath, request, locale));
    }

    String adminFallback(HttpServletRequest request, Locale locale, Model model) {
        return adminMenuShellService.renderAdminFallback(request, locale, model);
    }

    private String resolveAdminLoginRedirect(HttpServletRequest request) {
        return adminMenuShellService.resolveAdminLoginRedirect(request);
    }

    List<FeatureCatalogSectionVO> buildFeatureCatalogSections(List<FeatureCatalogItemVO> featureRows, boolean isEn) {
        return adminAuthorityPagePayloadSupport.buildFeatureCatalogSections(featureRows, isEn);
    }

    List<FeatureCatalogItemVO> applyFeatureAssignmentStats(
            List<FeatureCatalogItemVO> featureRows,
            Map<String, Integer> featureAssignmentCounts) {
        return adminAuthorityPagePayloadSupport.applyFeatureAssignmentStats(featureRows, featureAssignmentCounts);
    }

    Map<String, Integer> toFeatureAssignmentCountMap(List<FeatureAssignmentStatVO> stats) {
        return adminAuthorityPagePayloadSupport.toFeatureAssignmentCountMap(stats);
    }

    String resolveSelectedAuthorCode(String authorCode, List<AuthorInfoVO> authorGroups) {
        return adminAuthorityPagePayloadSupport.resolveSelectedAuthorCode(authorCode, authorGroups);
    }

    String resolveSelectedAuthorName(String authorCode, List<AuthorInfoVO> authorGroups) {
        return adminAuthorityPagePayloadSupport.resolveSelectedAuthorName(authorCode, authorGroups);
    }

    int countSelectedPageCount(List<FeatureCatalogSectionVO> featureSections, List<String> selectedFeatureCodes) {
        return adminAuthorityPagePayloadSupport.countSelectedPageCount(featureSections, selectedFeatureCodes);
    }

    int countSelectedPageCount(List<FeatureCatalogSectionVO> featureSections,
                                       FeatureCodeBitmap.Index featureBitmapIndex,
                                       BitSet selectedFeatureBitmap) {
        if (featureSections == null || featureSections.isEmpty() || featureBitmapIndex == null
                || selectedFeatureBitmap == null || selectedFeatureBitmap.isEmpty()) {
            return 0;
        }
        int selectedPageCount = 0;
        for (FeatureCatalogSectionVO section : featureSections) {
            BitSet sectionFeatureBitmap = featureBitmapIndex.encode(extractSectionFeatureCodes(section));
            if (featureBitmapIndex.intersects(sectionFeatureBitmap, selectedFeatureBitmap)) {
                selectedPageCount++;
            }
        }
        return selectedPageCount;
    }

    private List<String> extractSectionFeatureCodes(FeatureCatalogSectionVO section) {
        if (section == null || section.getFeatures() == null || section.getFeatures().isEmpty()) {
            return Collections.emptyList();
        }
        List<String> featureCodes = new ArrayList<>(section.getFeatures().size());
        for (FeatureCatalogItemVO feature : section.getFeatures()) {
            String featureCode = safeString(feature == null ? null : feature.getFeatureCode()).toUpperCase(Locale.ROOT);
            if (!featureCode.isEmpty()) {
                featureCodes.add(featureCode);
            }
        }
        return featureCodes;
    }

    private Set<String> buildAuthorCodeSet(List<AuthorInfoVO> authorGroups) {
        if (authorGroups == null || authorGroups.isEmpty()) {
            return Collections.emptySet();
        }
        Set<String> authorCodes = new LinkedHashSet<>();
        for (AuthorInfoVO authorGroup : authorGroups) {
            String authorCode = safeString(authorGroup == null ? null : authorGroup.getAuthorCode()).toUpperCase(Locale.ROOT);
            if (!authorCode.isEmpty()) {
                authorCodes.add(authorCode);
            }
        }
        return authorCodes;
    }

    @SafeVarargs
    private final FeatureCodeBitmap.Index buildFeatureBitmapIndex(List<FeatureCatalogSectionVO> featureSections,
                                                                  Collection<String>... extraFeatureCollections) {
        Set<String> indexedFeatureCodes = new LinkedHashSet<>();
        if (featureSections != null) {
            for (FeatureCatalogSectionVO section : featureSections) {
                indexedFeatureCodes.addAll(extractSectionFeatureCodes(section));
            }
        }
        if (extraFeatureCollections != null) {
            for (Collection<String> featureCollection : extraFeatureCollections) {
                if (featureCollection == null) {
                    continue;
                }
                for (String featureCode : featureCollection) {
                    String normalizedFeatureCode = safeString(featureCode).toUpperCase(Locale.ROOT);
                    if (!normalizedFeatureCode.isEmpty()) {
                        indexedFeatureCodes.add(normalizedFeatureCode);
                    }
                }
            }
        }
        return FeatureCodeBitmap.index(indexedFeatureCodes);
    }

    String extractCurrentUserId(HttpServletRequest request) {
        try {
            String accessToken = jwtProvider.getCookie(request, "accessToken");
            if (ObjectUtils.isEmpty(accessToken)) {
                return "";
            }
            Claims claims = jwtProvider.accessExtractClaims(accessToken);
            Object encryptedUserId = claims.get("userId");
            return encryptedUserId == null ? "" : jwtProvider.decrypt(encryptedUserId.toString());
        } catch (Exception e) {
            log.debug("Failed to extract current admin user id.", e);
            return "";
        }
    }

    private String buildTemporaryPassword() {
        String seed = Long.toString(System.currentTimeMillis(), 36).toUpperCase(Locale.ROOT);
        String suffix = Integer.toString((int) (Math.random() * 9000) + 1000);
        return "Cc!" + seed.substring(Math.max(0, seed.length() - 6)) + suffix;
    }

    String preferredResetHistoryKeyword(String memberId, String searchKeyword) {
        String normalizedKeyword = safeString(searchKeyword);
        if (!normalizedKeyword.isEmpty()) {
            return normalizedKeyword;
        }
        return safeString(memberId);
    }

    private String redirectReactMigration(HttpServletRequest request, Locale locale, String route) {
        return adminReactRouteSupport.forwardAdminRoute(request, locale, route);
    }

    List<Map<String, String>> buildPasswordResetHistoryListRows(List<PasswordResetHistory> histories, boolean isEn) {
        if (histories == null || histories.isEmpty()) {
            return Collections.emptyList();
        }

        List<Map<String, String>> rows = new ArrayList<>();
        for (PasswordResetHistory history : histories) {
            String scopedInsttId = resolveHistoryTargetInsttId(safeString(history.getTargetUserId()), safeString(history.getTargetUserSe()));
            Map<String, String> row = new LinkedHashMap<>();
            row.put("resetAt", formatDateTime(history.getResetPnttm()));
            row.put("targetUserId", safeString(history.getTargetUserId()));
            row.put("targetUserSe", safeString(history.getTargetUserSe()));
            row.put("targetUserSeLabel", resolveUserSeLabel(history.getTargetUserSe(), isEn));
            row.put("insttId", scopedInsttId);
            row.put("companyName", resolveCompanyNameByInsttId(scopedInsttId));
            row.put("resetBy", safeString(history.getResetByUserId()));
            row.put("resetIp", safeString(history.getResetIp()));
            row.put("resetSource", safeString(history.getResetSource()));
            row.put("detailUrl", (isEn ? "/en/admin" : "/admin") + "/member/detail?memberId="
                    + urlEncode(safeString(history.getTargetUserId())));
            rows.add(row);
        }
        return rows;
    }

    String resolveHistoryTargetInsttId(String userId, String userSe) {
        String normalizedUserId = safeString(userId);
        String normalizedUserSe = safeString(userSe).toUpperCase(Locale.ROOT);
        if (normalizedUserId.isEmpty()) {
            return "";
        }
        try {
            if ("USR".equals(normalizedUserSe)) {
                return employMemberRepository.findById(normalizedUserId)
                        .map(EmplyrInfo::getInsttId)
                        .map(this::safeString)
                        .orElse("");
            }
            if ("ENT".equals(normalizedUserSe)) {
                return enterpriseMemberRepository.findById(normalizedUserId)
                        .map(EntrprsMber::getInsttId)
                        .map(this::safeString)
                        .orElse("");
            }
            if ("GNR".equals(normalizedUserSe)) {
                return generalMemberRepository.findById(normalizedUserId)
                        .map(GnrlMber::getGroupId)
                        .map(this::safeString)
                        .orElse("");
            }
        } catch (Exception e) {
            log.warn("Failed to resolve history target company. userId={}, userSe={}", normalizedUserId, normalizedUserSe, e);
        }
        return "";
    }

    String resolveCompanyNameByInsttId(String insttId) {
        String normalizedInsttId = safeString(insttId);
        if (normalizedInsttId.isEmpty()) {
            return "";
        }
        return companyNameCache.computeIfAbsent(normalizedInsttId, this::lookupCompanyNameByInsttId);
    }

    List<Map<String, String>> loadAccessHistoryCompanyOptions() {
        return platformObservabilityCompanyScopePort.loadAccessHistoryCompanyOptions();
    }

    List<Map<String, String>> buildScopedAccessHistoryCompanyOptions(String insttId) {
        return platformObservabilityCompanyScopePort.buildScopedAccessHistoryCompanyOptions(insttId);
    }

    private String lookupCompanyNameByInsttId(String normalizedInsttId) {
        InstitutionStatusVO institution = loadInstitutionInfoByInsttId(normalizedInsttId);
        if (institution == null) {
            return normalizedInsttId;
        }
        String companyName = safeString(institution.getInsttNm());
        return companyName.isEmpty() ? normalizedInsttId : companyName;
    }

    List<Map<String, String>> buildPasswordResetHistoryRows(List<PasswordResetHistory> histories) {
        if (histories == null || histories.isEmpty()) {
            return Collections.emptyList();
        }

        List<Map<String, String>> rows = new ArrayList<>();
        for (PasswordResetHistory history : histories) {
            Map<String, String> row = new LinkedHashMap<>();
            row.put("resetAt", formatDateTime(history.getResetPnttm()));
            row.put("resetBy", safeString(history.getResetByUserId()));
            row.put("resetIp", safeString(history.getResetIp()));
            row.put("resetSource", safeString(history.getResetSource()));
            rows.add(row);
        }
        return rows;
    }

    private String formatDateTime(LocalDateTime value) {
        if (value == null) {
            return "-";
        }
        return value.format(DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm:ss"));
    }

    private String resolveUserSeLabel(String userSe, boolean isEn) {
        String normalized = safeString(userSe).toUpperCase(Locale.ROOT);
        switch (normalized) {
            case "USR":
                return isEn ? "Admin" : "관리자";
            case "ENT":
                return isEn ? "Enterprise" : "기업회원";
            case "GNR":
                return isEn ? "General" : "일반회원";
            default:
                return normalized.isEmpty() ? "-" : normalized;
        }
    }

    boolean isWebmaster(String userId) {
        return "webmaster".equalsIgnoreCase(safeString(userId));
    }

    String resolveCurrentUserAuthorCode(String currentUserId) {
        return adminAuthorityPagePayloadSupport.resolveCurrentUserAuthorCode(currentUserId);
    }

    private void recordApprovalAuditSafely(HttpServletRequest request,
                                           String actorId,
                                           String actorRole,
                                           String menuCode,
                                           String pageId,
                                           String actionCode,
                                           String entityType,
                                           String entityId,
                                           String resultStatus,
                                           String beforeSummaryJson,
                                           String afterSummaryJson) {
        try {
            auditTrailService.record(
                    actorId,
                    actorRole,
                    menuCode,
                    pageId,
                    actionCode,
                    entityType,
                    entityId,
                    resultStatus,
                    "",
                    beforeSummaryJson,
                    afterSummaryJson,
                    resolveRequestIp(request),
                    request == null ? "" : safeString(request.getHeader("User-Agent"))
            );
        } catch (Exception e) {
            log.warn("Failed to record approval audit. actorId={}, actionCode={}, entityId={}", actorId, actionCode, entityId, e);
        }
    }

    private void recordAdminActionAudit(HttpServletRequest request,
                                        String actorId,
                                        String actorRole,
                                        String menuCode,
                                        String pageId,
                                        String actionCode,
                                        String entityType,
                                        String entityId,
                                        String beforeSummaryJson,
                                        String afterSummaryJson) {
        try {
            auditTrailService.record(
                    actorId,
                    actorRole,
                    menuCode,
                    pageId,
                    actionCode,
                    entityType,
                    entityId,
                    "SUCCESS",
                    "",
                    beforeSummaryJson,
                    afterSummaryJson,
                    resolveRequestIp(request),
                    request == null ? "" : safeString(request.getHeader("User-Agent"))
            );
        } catch (Exception e) {
            log.warn("Failed to record admin action audit. actorId={}, actionCode={}, entityId={}", actorId, actionCode, entityId, e);
        }
    }

    private String safeJson(String value) {
        return safeString(value).replace("\"", "'");
    }

    private void recordAdminRoleAssignmentAudit(HttpServletRequest request,
                                                String actorId,
                                                String actorRole,
                                                String emplyrId,
                                                Map<String, String> beforeRole,
                                                Map<String, String> afterRole) {
        Map<String, Object> beforeSummary = new LinkedHashMap<>();
        beforeSummary.put("emplyrId", emplyrId);
        beforeSummary.put("beforeAuthorCode", safeString(beforeRole.get("authorCode")));
        beforeSummary.put("beforeAuthorName", safeString(beforeRole.get("authorNm")));
        Map<String, Object> afterSummary = new LinkedHashMap<>();
        afterSummary.put("emplyrId", emplyrId);
        afterSummary.put("afterAuthorCode", safeString(afterRole.get("authorCode")));
        afterSummary.put("afterAuthorName", safeString(afterRole.get("authorNm")));
        afterSummary.put("status", "SUCCESS");
        recordAdminActionAudit(request,
                actorId,
                actorRole,
                "AMENU_AUTH_CHANGE",
                "auth-change",
                "ADMIN_ROLE_ASSIGNMENT_SAVE",
                "ADMIN",
                emplyrId,
                toJsonSummary(beforeSummary),
                toJsonSummary(afterSummary));
    }

    private Map<String, String> resolveAdminRoleSummary(String emplyrId) {
        return adminAuthorityPagePayloadSupport.resolveAdminRoleSummary(emplyrId);
    }

    private Map<String, String> buildAuthorSummary(String authorCode) {
        return adminAuthorityPagePayloadSupport.buildAuthorSummary(authorCode);
    }

    Map<String, Object> toAuthorRoleProfileMap(AuthorRoleProfileVO profile) {
        if (profile == null || safeString(profile.getAuthorCode()).isEmpty()) {
            return Collections.emptyMap();
        }
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("authorCode", safeString(profile.getAuthorCode()).toUpperCase(Locale.ROOT));
        row.put("displayTitle", safeString(profile.getDisplayTitle()));
        row.put("priorityWorks", profile.getPriorityWorks() == null ? Collections.emptyList() : profile.getPriorityWorks());
        row.put("description", safeString(profile.getDescription()));
        row.put("memberEditVisibleYn", safeString(profile.getMemberEditVisibleYn()));
        row.put("roleType", safeString(profile.getRoleType()));
        row.put("baseRoleYn", safeString(profile.getBaseRoleYn()));
        row.put("parentAuthorCode", safeString(profile.getParentAuthorCode()).toUpperCase(Locale.ROOT));
        row.put("assignmentScope", safeString(profile.getAssignmentScope()));
        row.put("defaultMemberTypes", profile.getDefaultMemberTypes() == null ? Collections.emptyList() : profile.getDefaultMemberTypes());
        row.put("updatedAt", safeString(profile.getUpdatedAt()));
        return row;
    }

    Map<String, Map<String, Object>> toAuthorRoleProfileMapCollection(Map<String, AuthorRoleProfileVO> profiles) {
        if (profiles == null || profiles.isEmpty()) {
            return Collections.emptyMap();
        }
        Map<String, Map<String, Object>> rows = new LinkedHashMap<>();
        for (Map.Entry<String, AuthorRoleProfileVO> entry : profiles.entrySet()) {
            rows.put(safeString(entry.getKey()).toUpperCase(Locale.ROOT), toAuthorRoleProfileMap(entry.getValue()));
        }
        return rows;
    }

    Set<String> collectRoleProfileAuthorCodes(List<Map<String, String>> departmentRows,
                                                      List<AuthorInfoVO> departmentAuthorGroups,
                                                      List<AuthorInfoVO> memberAssignableAuthorGroups,
                                                      List<?> companyMembers) {
        LinkedHashSet<String> authorCodes = new LinkedHashSet<>();
        if (departmentRows != null) {
            for (Map<String, String> row : departmentRows) {
                authorCodes.add(safeString(row.get("authorCode")).toUpperCase(Locale.ROOT));
                authorCodes.add(safeString(row.get("recommendedRoleCode")).toUpperCase(Locale.ROOT));
            }
        }
        if (departmentAuthorGroups != null) {
            for (AuthorInfoVO group : departmentAuthorGroups) {
                authorCodes.add(safeString(group.getAuthorCode()).toUpperCase(Locale.ROOT));
            }
        }
        if (memberAssignableAuthorGroups != null) {
            for (AuthorInfoVO group : memberAssignableAuthorGroups) {
                authorCodes.add(safeString(group.getAuthorCode()).toUpperCase(Locale.ROOT));
            }
        }
        if (companyMembers != null) {
            for (Object row : companyMembers) {
                if (row instanceof UserAuthorityTargetVO) {
                    authorCodes.add(safeString(((UserAuthorityTargetVO) row).getAuthorCode()).toUpperCase(Locale.ROOT));
                } else if (row instanceof Map) {
                    Object authorCode = ((Map<?, ?>) row).get("authorCode");
                    authorCodes.add(safeString(authorCode == null ? null : String.valueOf(authorCode)).toUpperCase(Locale.ROOT));
                }
            }
        }
        authorCodes.remove("");
        return authorCodes;
    }

    List<Map<String, String>> buildRecentAdminRoleChangeHistory(boolean isEn) {
        return adminAuthorityPagePayloadSupport.buildRecentAdminRoleChangeHistory(isEn);
    }

    private Map<String, String> buildAdminRoleChangeHistoryRow(AuditEventRecordVO item, boolean isEn) {
        Map<String, Object> beforeMap = parseAuditJson(item.getBeforeSummaryJson());
        Map<String, Object> afterMap = parseAuditJson(item.getAfterSummaryJson());
        Map<String, String> row = new LinkedHashMap<>();
        row.put("changedAt", safeString(item.getCreatedAt()));
        row.put("changedBy", safeString(item.getActorId()));
        row.put("targetUserId", firstNonEmpty(
                safeString((String) afterMap.get("emplyrId")),
                safeString((String) beforeMap.get("emplyrId")),
                safeString(item.getEntityId())));
        row.put("beforeAuthorCode", safeString((String) beforeMap.get("beforeAuthorCode")));
        row.put("beforeAuthorName", safeString((String) beforeMap.get("beforeAuthorName")));
        row.put("afterAuthorCode", safeString((String) afterMap.get("afterAuthorCode")));
        row.put("afterAuthorName", safeString((String) afterMap.get("afterAuthorName")));
        row.put("resultStatus", safeString(item.getResultStatus()).isEmpty()
                ? (isEn ? "SUCCESS" : "성공")
                : safeString(item.getResultStatus()));
        return row;
    }

    private Map<String, Object> parseAuditJson(String json) {
        String normalized = safeString(json);
        if (normalized.isEmpty()) {
            return Collections.emptyMap();
        }
        try {
            return objectMapper.readValue(normalized, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse audit summary json.", e);
            return Collections.emptyMap();
        }
    }

    private String toJsonSummary(Map<String, Object> value) {
        try {
            return objectMapper.writeValueAsString(value == null ? Collections.emptyMap() : value);
        } catch (Exception e) {
            log.warn("Failed to serialize audit summary json.", e);
            return "{}";
        }
    }

    private String firstNonEmpty(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            String normalized = safeString(value);
            if (!normalized.isEmpty()) {
                return normalized;
            }
        }
        return "";
    }

    private String resolveRequestIp(HttpServletRequest request) {
        if (request == null) {
            return ClientIpUtil.getClientIp();
        }
        String forwarded = safeString(request.getHeader("X-Forwarded-For"));
        if (!forwarded.isEmpty()) {
            int index = forwarded.indexOf(',');
            return index >= 0 ? forwarded.substring(0, index).trim() : forwarded;
        }
        String realIp = safeString(request.getHeader("X-Real-IP"));
        if (!realIp.isEmpty()) {
            return realIp;
        }
        String remoteAddr = safeString(request.getRemoteAddr());
        return remoteAddr.isEmpty() ? ClientIpUtil.getClientIp() : remoteAddr;
    }

    boolean hasGlobalDeptRoleAccess(String currentUserId, String authorCode) {
        return adminAuthorityPagePayloadSupport.hasGlobalDeptRoleAccess(currentUserId, authorCode);
    }

    boolean hasOwnCompanyDeptRoleAccess(String currentUserId, String authorCode) {
        return adminAuthorityPagePayloadSupport.hasOwnCompanyDeptRoleAccess(currentUserId, authorCode);
    }

    List<Map<String, Object>> buildRecommendedRoleSections(List<AuthorInfoVO> authorGroups, boolean isEn) {
        return adminAuthorityPagePayloadSupport.buildRecommendedRoleSections(authorGroups, isEn);
    }

    private Map<String, String> recommendedRole(String code, String name, String description, java.util.Set<String> existingCodes) {
        Map<String, String> row = new java.util.LinkedHashMap<>();
        row.put("code", code);
        row.put("name", name);
        row.put("description", description);
        row.put("status", existingCodes.contains(code) ? "existing" : "missing");
        return row;
    }

    private Map<String, Object> recommendedRoleSection(String category, String title, String description, List<Map<String, String>> roles) {
        Map<String, Object> row = new java.util.LinkedHashMap<>();
        row.put("category", category);
        row.put("title", title);
        row.put("description", description);
        row.put("roles", roles);
        return row;
    }

    List<Map<String, Object>> filterRecommendedRoleSections(List<Map<String, Object>> sections, String selectedRoleCategory) {
        return adminAuthorityPagePayloadSupport.filterRecommendedRoleSections(sections, selectedRoleCategory);
    }

    List<AuthorInfoVO> filterAuthorGroups(List<AuthorInfoVO> authorGroups, String selectedRoleCategory) {
        return adminAuthorityPagePayloadSupport.filterAuthorGroups(authorGroups, selectedRoleCategory);
    }

    List<AuthorInfoVO> filterAuthorGroups(
            List<AuthorInfoVO> authorGroups,
            String selectedRoleCategory,
            String currentUserId,
            String currentUserAuthorCode) {
        return adminAuthorityPagePayloadSupport.filterAuthorGroups(
                authorGroups,
                selectedRoleCategory,
                currentUserId,
                currentUserAuthorCode);
    }

    List<AuthorInfoVO> filterAuthorGroupsByScope(List<AuthorInfoVO> authorGroups, String selectedRoleCategory,
                                                         String insttId, boolean globalAccess) {
        return adminAuthorityPagePayloadSupport.filterAuthorGroupsByScope(authorGroups, selectedRoleCategory, insttId, globalAccess);
    }

    List<AuthorInfoVO> filterAuthorGroupsByScope(
            List<AuthorInfoVO> authorGroups,
            String selectedRoleCategory,
            String insttId,
            boolean globalAccess,
            String currentUserId,
            String currentUserAuthorCode) {
        return adminAuthorityPagePayloadSupport.filterAuthorGroupsByScope(
                authorGroups,
                selectedRoleCategory,
                insttId,
                globalAccess,
                currentUserId,
                currentUserAuthorCode);
    }

    List<AuthorInfoVO> buildDeptMemberAssignableGroups(List<AuthorInfoVO> authorGroups, String insttId, boolean globalAccess) {
        return adminAuthorityPagePayloadSupport.buildDeptMemberAssignableGroups(authorGroups, insttId, globalAccess);
    }

    List<AuthorInfoVO> buildDeptMemberAssignableGroups(
            List<AuthorInfoVO> authorGroups,
            String insttId,
            boolean globalAccess,
            String currentUserId,
            String currentUserAuthorCode) {
        return adminAuthorityPagePayloadSupport.buildDeptMemberAssignableGroups(
                authorGroups,
                insttId,
                globalAccess,
                currentUserId,
                currentUserAuthorCode);
    }

    private boolean matchesRoleCategory(String authorCode, String selectedRoleCategory) {
        return frameworkAuthorityPolicyService.matchesRoleCategory(authorCode, selectedRoleCategory);
    }

    String resolveRoleCategory(String roleCategory) {
        return adminAuthorityPagePayloadSupport.resolveRoleCategory(roleCategory);
    }

    List<Map<String, String>> buildRoleCategoryOptions(boolean isEn, boolean canViewGeneralAuthorityGroups) {
        return adminAuthorityPagePayloadSupport.buildRoleCategoryOptions(isEn, canViewGeneralAuthorityGroups);
    }

    boolean hasGeneralAuthorityGroupAccess(String currentUserId, boolean webmaster) throws Exception {
        return adminAuthorityPagePayloadSupport.hasGeneralAuthorityGroupAccess(currentUserId, webmaster);
    }

    List<Map<String, String>> buildDepartmentRoleRows(List<DepartmentRoleMappingVO> mappings, boolean isEn) {
        return adminAuthorityPagePayloadSupport.buildDepartmentRoleRows(mappings, isEn);
    }

    List<Map<String, String>> buildDepartmentCompanyOptions(List<Map<String, String>> departmentRows) {
        return adminAuthorityPagePayloadSupport.buildDepartmentCompanyOptions(departmentRows);
    }

    private List<Map<String, String>> buildDepartmentRoleSummaries(List<Map<String, String>> departmentRows, boolean isEn) {
        Map<String, Map<String, String>> dedup = new LinkedHashMap<>();
        for (Map<String, String> row : departmentRows) {
            String roleCode = safeString(row.get("recommendedRoleCode"));
            if (roleCode.isEmpty() || dedup.containsKey(roleCode)) {
                continue;
            }
            FrameworkAuthorityPolicyService.DepartmentRoleDescriptor descriptor =
                    frameworkAuthorityPolicyService.describeDepartmentRole(roleCode, isEn);
            Map<String, String> summary = new LinkedHashMap<>();
            summary.put("code", descriptor.getCode());
            summary.put("name", safeString(row.get("recommendedRoleName")));
            summary.put("description", descriptor.getDescription());
            summary.put("status", descriptor.getStatus());
            dedup.put(roleCode, summary);
        }
        return new ArrayList<>(dedup.values());
    }

    List<AuthorInfoVO> filterScopedDepartmentAuthorGroups(List<AuthorInfoVO> authorGroups, List<Map<String, String>> departmentRows) {
        return adminAuthorityPagePayloadSupport.filterScopedDepartmentAuthorGroups(authorGroups, departmentRows);
    }

    private boolean canAssignDepartmentAuthorCode(String authorCode, String insttId, boolean globalAccess) {
        return matchesRoleCategory(authorCode, "DEPARTMENT")
                && (globalAccess || isVisibleScopedAuthorCode(authorCode, "DEPARTMENT", insttId));
    }

    private boolean canAssignMemberAuthorCode(String authorCode, String insttId, boolean globalAccess) {
        String normalizedCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        if ("ROLE_USER".equals(normalizedCode)) {
            return true;
        }
        if (matchesRoleCategory(authorCode, "DEPARTMENT")) {
            return globalAccess || isVisibleScopedAuthorCode(authorCode, "DEPARTMENT", insttId);
        }
        if (matchesRoleCategory(authorCode, "USER")) {
            return globalAccess || isVisibleScopedAuthorCode(authorCode, "USER", insttId);
        }
        return false;
    }

    private boolean isVisibleScopedAuthorCode(String authorCode, String roleCategory, String insttId) {
        String normalizedCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        if (normalizedCode.isEmpty()) {
            return false;
        }
        String scopedPrefix = buildScopedAuthorPrefix(roleCategory, insttId);
        if (scopedPrefix.isEmpty()) {
            return !isCompanyScopedAuthorCode(normalizedCode, roleCategory);
        }
        return !isCompanyScopedAuthorCode(normalizedCode, roleCategory) || normalizedCode.startsWith(scopedPrefix);
    }

    private boolean isCompanyScopedAuthorCodeForInstt(String authorCode, String roleCategory, String insttId) {
        String scopedPrefix = buildScopedAuthorPrefix(roleCategory, insttId);
        return !scopedPrefix.isEmpty() && safeString(authorCode).toUpperCase(Locale.ROOT).startsWith(scopedPrefix);
    }

    private boolean isCompanyScopedAuthorCode(String authorCode, String roleCategory) {
        String normalizedCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        if ("DEPARTMENT".equals(roleCategory)) {
            return normalizedCode.startsWith("ROLE_DEPT_I");
        }
        if ("USER".equals(roleCategory)) {
            return normalizedCode.startsWith("ROLE_USER_I");
        }
        return false;
    }

    private String normalizeScopedAuthorCode(String authorCode, String roleCategory, String insttId, boolean forceScoped) {
        String normalizedCode = safeString(authorCode).toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9_]", "_");
        if (!forceScoped || (!"DEPARTMENT".equals(roleCategory) && !"USER".equals(roleCategory))) {
            return normalizedCode;
        }
        String prefix = buildScopedAuthorPrefix(roleCategory, insttId);
        if (prefix.isEmpty()) {
            return normalizedCode;
        }
        String suffix = normalizedCode;
        if (suffix.startsWith(prefix)) {
            return suffix;
        }
        suffix = suffix.replaceFirst("^ROLE_[A-Z0-9]+_", "");
        suffix = suffix.replaceFirst("^COMPANY_[A-Z0-9]+_", "");
        suffix = suffix.replaceAll("^_+", "");
        if (suffix.isEmpty()) {
            suffix = "CUSTOM";
        }
        return prefix + suffix;
    }

    private String buildScopedAuthorPrefix(String roleCategory, String insttId) {
        String token = normalizeInsttScopeToken(insttId);
        if (token.isEmpty()) {
            return "";
        }
        if ("DEPARTMENT".equals(roleCategory)) {
            return "ROLE_DEPT_I" + shortenInsttScopeToken(token) + "_";
        }
        if ("USER".equals(roleCategory)) {
            return "ROLE_USER_I" + shortenInsttScopeToken(token) + "_";
        }
        return "";
    }

    private String normalizeInsttScopeToken(String insttId) {
        return safeString(insttId).toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9]", "");
    }

    private String shortenInsttScopeToken(String normalizedToken) {
        String token = safeString(normalizedToken);
        if (token.length() <= 8) {
            return token;
        }
        return token.substring(token.length() - 8);
    }

    String resolveSelectedInsttId(String insttId, List<Map<String, String>> companyOptions) {
        return adminAuthorityPagePayloadSupport.resolveSelectedInsttId(insttId, companyOptions);
    }

    String resolveSelectedInsttId(String insttId, List<Map<String, String>> companyOptions, boolean allowEmptySelection) {
        return adminAuthorityPagePayloadSupport.resolveSelectedInsttId(insttId, companyOptions, allowEmptySelection);
    }

    AuthGroupScopeContext buildAuthGroupScopeContext(String insttId, String userSearchKeyword, String selectedRoleCategory,
                                                             String currentUserId, boolean webmaster, List<AuthorInfoVO> authorGroups,
                                                             boolean isEn) {
        AdminAuthorityPagePayloadSupport.AuthGroupScopeContext supported =
                adminAuthorityPagePayloadSupport.buildAuthGroupScopeContext(
                        insttId,
                        userSearchKeyword,
                        selectedRoleCategory,
                        currentUserId,
                        resolveCurrentUserAuthorCode(currentUserId),
                        resolveCurrentUserInsttId(currentUserId),
                        webmaster,
                        webmaster || hasGlobalDeptRoleAccess(currentUserId, resolveCurrentUserAuthorCode(currentUserId)),
                        authorGroups,
                        isEn);
        AuthGroupScopeContext context = AuthGroupScopeContext.empty();
        context.setCompanyOptions(supported.getCompanyOptions());
        context.setSelectedInsttId(supported.getSelectedInsttId());
        context.setDepartmentRows(supported.getDepartmentRows());
        context.setDepartmentRoleSummaries(supported.getDepartmentRoleSummaries());
        context.setUserAuthorityTargets(supported.getUserAuthorityTargets());
        context.setReferenceAuthorGroups(supported.getReferenceAuthorGroups());
        context.setUserSearchKeyword(supported.getUserSearchKeyword());
        context.setErrorMessage(supported.getErrorMessage());
        return context;
    }

    private void applyAuthGroupScopeContext(AuthGroupScopeContext context, Model model) {
        model.addAttribute("authGroupCompanyOptions", context.getCompanyOptions());
        model.addAttribute("authGroupSelectedInsttId", context.getSelectedInsttId());
        model.addAttribute("authGroupDepartmentRows", context.getDepartmentRows());
        model.addAttribute("authGroupDepartmentRoleSummaries", context.getDepartmentRoleSummaries());
        model.addAttribute("userAuthorityTargets", context.getUserAuthorityTargets());
        model.addAttribute("userSearchKeyword", context.getUserSearchKeyword());
        if (!safeString(context.getErrorMessage()).isEmpty()) {
            model.addAttribute("authGroupError", context.getErrorMessage());
        }
    }

    String resolveCurrentUserInsttId(String currentUserId) {
        return adminAuthorityPagePayloadSupport.resolveCurrentUserInsttId(currentUserId);
    }

    boolean requiresOwnCompanyAccess(String currentUserId, String authorCode) {
        return adminAuthorityPagePayloadSupport.requiresOwnCompanyAccess(currentUserId, authorCode);
    }

    boolean hasMemberManagementMasterAccess(String currentUserId, String authorCode) {
        return adminAuthorityPagePayloadSupport.hasMemberManagementMasterAccess(currentUserId, authorCode);
    }

    boolean hasMemberManagementCompanyAdminAccess(String currentUserId, String authorCode) {
        return adminAuthorityPagePayloadSupport.hasMemberManagementCompanyAdminAccess(currentUserId, authorCode);
    }

    boolean hasMemberManagementCompanyOperatorAccess(String currentUserId, String authorCode) {
        return adminAuthorityPagePayloadSupport.hasMemberManagementCompanyOperatorAccess(currentUserId, authorCode);
    }

    boolean requiresMemberManagementCompanyScope(String currentUserId, String authorCode) {
        return adminAuthorityPagePayloadSupport.requiresMemberManagementCompanyScope(currentUserId, authorCode);
    }

    boolean canCreateAdminAccounts(String currentUserId, String currentUserAuthorCode) {
        return hasMemberManagementMasterAccess(currentUserId, currentUserAuthorCode)
                || canCreateOperationAdminAccounts(currentUserId, currentUserAuthorCode);
    }

    private boolean canCreateOperationAdminAccounts(String currentUserId, String currentUserAuthorCode) {
        if (hasMemberManagementMasterAccess(currentUserId, currentUserAuthorCode)) {
            return true;
        }
        String normalizedAuthorCode = safeString(currentUserAuthorCode).toUpperCase(Locale.ROOT);
        return ROLE_SYSTEM_ADMIN.equals(normalizedAuthorCode)
                || ROLE_ADMIN.equals(normalizedAuthorCode);
    }

    boolean canCreateAdminRolePreset(String currentUserId, String currentUserAuthorCode, String rolePreset) {
        String normalizedRolePreset = safeString(rolePreset).toUpperCase(Locale.ROOT);
        if (normalizedRolePreset.isEmpty()) {
            return false;
        }
        if ("MASTER".equals(normalizedRolePreset)) {
            return isWebmaster(currentUserId);
        }
        if ("SYSTEM".equals(normalizedRolePreset)) {
            return hasMemberManagementMasterAccess(currentUserId, currentUserAuthorCode);
        }
        if ("OPERATION".equals(normalizedRolePreset)) {
            return canCreateOperationAdminAccounts(currentUserId, currentUserAuthorCode);
        }
        return false;
    }

    boolean canCurrentAdminAccessAdmin(HttpServletRequest request, EmplyrInfo adminMember) {
        if (adminMember == null) {
            return false;
        }
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        if (hasMemberManagementMasterAccess(currentUserId, currentUserAuthorCode)) {
            return true;
        }
        if (!hasMemberManagementCompanyAdminAccess(currentUserId, currentUserAuthorCode)) {
            return false;
        }
        String targetAdminId = safeString(adminMember.getEmplyrId());
        if ("webmaster".equalsIgnoreCase(targetAdminId)) {
            return false;
        }
        String actorInsttId = resolveCurrentUserInsttId(currentUserId);
        String targetInsttId = safeString(adminMember.getInsttId());
        if (actorInsttId.isEmpty() || !actorInsttId.equals(targetInsttId)) {
            return false;
        }
        try {
            String targetAuthorCode = safeString(authGroupManageService.selectAuthorCodeByUserId(targetAdminId)).toUpperCase(Locale.ROOT);
            return !ROLE_SYSTEM_MASTER.equals(targetAuthorCode);
        } catch (Exception e) {
            log.warn("Failed to resolve target admin author code. emplyrId={}", targetAdminId, e);
            return false;
        }
    }

    List<EmplyrInfo> selectVisibleAdminMembers(
            String currentUserId,
            String currentUserAuthorCode,
            String keyword,
            String status) throws Exception {
        String actorInsttId = resolveCurrentUserInsttId(currentUserId);
        boolean masterAccess = hasMemberManagementMasterAccess(currentUserId, currentUserAuthorCode);
        List<EmplyrInfo> employees = employMemberRepository.searchAdminMembersForManagement(
                safeString(keyword),
                safeString(status).toUpperCase(Locale.ROOT),
                masterAccess ? "" : actorInsttId,
                Sort.by(Sort.Order.desc("sbscrbDe"), Sort.Order.asc("emplyrId")));
        Map<String, String> authorCodeByUserId = new LinkedHashMap<>();
        for (AdminRoleAssignmentVO assignment : authGroupManageService.selectAdminRoleAssignments()) {
            authorCodeByUserId.put(
                    safeString(assignment.getEmplyrId()),
                    safeString(assignment.getAuthorCode()).toUpperCase(Locale.ROOT));
        }
        List<EmplyrInfo> visible = employees.stream()
                .filter(item -> {
                    String userId = safeString(item.getEmplyrId());
                    String authorCode = authorCodeByUserId.getOrDefault(userId, "");
                    if (authorCode.isEmpty()) {
                        return false;
                    }
                    if (!masterAccess) {
                        String targetInsttId = safeString(item.getInsttId());
                        if (actorInsttId.isEmpty() || !actorInsttId.equals(targetInsttId)) {
                            return false;
                        }
                        if (ROLE_SYSTEM_MASTER.equals(authorCode)) {
                            return false;
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());
        return visible;
    }

    boolean canCurrentAdminAccessMember(HttpServletRequest request, EntrprsManageVO member) {
        return canCurrentAdminAccessInsttId(request, member == null ? "" : member.getInsttId());
    }

    private boolean canCurrentAdminAccessInsttId(HttpServletRequest request, String targetInsttId) {
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        if (hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode)) {
            return true;
        }
        if (!requiresOwnCompanyAccess(currentUserId, currentUserAuthorCode)) {
            return false;
        }
        String currentUserInsttId = resolveCurrentUserInsttId(currentUserId);
        String normalizedTargetInsttId = safeString(targetInsttId);
        return !currentUserInsttId.isEmpty() && currentUserInsttId.equals(normalizedTargetInsttId);
    }

    private String resolveMemberFileInsttId(String fileId) {
        String normalizedFileId = safeString(fileId);
        if (normalizedFileId.isEmpty()) {
            return "";
        }
        try {
            EntrprsMberFileVO memberFile = entrprsManageService.selectEntrprsMberFileByFileId(normalizedFileId);
            if (memberFile == null || safeString(memberFile.getEntrprsmberId()).isEmpty()) {
                return "";
            }
            EntrprsManageVO member = entrprsManageService.selectEntrprsmberByMberId(memberFile.getEntrprsmberId());
            return member == null ? "" : safeString(member.getInsttId());
        } catch (Exception e) {
            log.warn("Failed to resolve member file institution. fileId={}", normalizedFileId, e);
            return "";
        }
    }

    private boolean containsAny(String source, String... keywords) {
        if (source == null || source.isEmpty() || keywords == null) {
            return false;
        }
        for (String keyword : keywords) {
            String normalizedKeyword = safeString(keyword).toUpperCase(Locale.ROOT);
            if (!normalizedKeyword.isEmpty() && source.contains(normalizedKeyword)) {
                return true;
            }
        }
        return false;
    }

    static final class AuthGroupScopeContext {
        private List<Map<String, String>> companyOptions = Collections.emptyList();
        private String selectedInsttId = "";
        private List<Map<String, String>> departmentRows = Collections.emptyList();
        private List<Map<String, String>> departmentRoleSummaries = Collections.emptyList();
        private List<UserAuthorityTargetVO> userAuthorityTargets = Collections.emptyList();
        private List<AuthorInfoVO> referenceAuthorGroups = Collections.emptyList();
        private String userSearchKeyword = "";
        private String errorMessage = "";

        static AuthGroupScopeContext empty() {
            return new AuthGroupScopeContext();
        }

        List<Map<String, String>> getCompanyOptions() {
            return companyOptions;
        }

        void setCompanyOptions(List<Map<String, String>> companyOptions) {
            this.companyOptions = companyOptions == null ? Collections.emptyList() : companyOptions;
        }

        String getSelectedInsttId() {
            return selectedInsttId;
        }

        void setSelectedInsttId(String selectedInsttId) {
            this.selectedInsttId = selectedInsttId == null ? "" : selectedInsttId;
        }

        List<Map<String, String>> getDepartmentRows() {
            return departmentRows;
        }

        void setDepartmentRows(List<Map<String, String>> departmentRows) {
            this.departmentRows = departmentRows == null ? Collections.emptyList() : departmentRows;
        }

        List<Map<String, String>> getDepartmentRoleSummaries() {
            return departmentRoleSummaries;
        }

        void setDepartmentRoleSummaries(List<Map<String, String>> departmentRoleSummaries) {
            this.departmentRoleSummaries = departmentRoleSummaries == null ? Collections.emptyList() : departmentRoleSummaries;
        }

        List<UserAuthorityTargetVO> getUserAuthorityTargets() {
            return userAuthorityTargets;
        }

        void setUserAuthorityTargets(List<UserAuthorityTargetVO> userAuthorityTargets) {
            this.userAuthorityTargets = userAuthorityTargets == null ? Collections.emptyList() : userAuthorityTargets;
        }

        List<AuthorInfoVO> getReferenceAuthorGroups() {
            return referenceAuthorGroups;
        }

        void setReferenceAuthorGroups(List<AuthorInfoVO> referenceAuthorGroups) {
            this.referenceAuthorGroups = referenceAuthorGroups == null ? Collections.emptyList() : referenceAuthorGroups;
        }

        String getUserSearchKeyword() {
            return userSearchKeyword;
        }

        void setUserSearchKeyword(String userSearchKeyword) {
            this.userSearchKeyword = userSearchKeyword == null ? "" : userSearchKeyword;
        }

        String getErrorMessage() {
            return errorMessage;
        }

        void setErrorMessage(String errorMessage) {
            this.errorMessage = errorMessage == null ? "" : errorMessage;
        }
    }

    List<Map<String, String>> buildAssignmentAuthorities(boolean isEn) {
        return adminAuthorityPagePayloadSupport.buildAssignmentAuthorities(isEn);
    }

    List<Map<String, String>> buildRoleCategories(boolean isEn) {
        return adminAuthorityPagePayloadSupport.buildRoleCategories(isEn);
    }

    String adminPrefix(HttpServletRequest request, Locale locale) {
        return isEnglishRequest(request, locale) ? "/en/admin" : "/admin";
    }

    void populateCompanyAccountModel(String insttId, boolean isEn, Model model) {
        adminMemberPageModelAssembler().populateCompanyAccountModel(insttId, isEn, model);
    }

    private void populateCompanyAccountModelFromValues(
            String insttId,
            String membershipType,
            String agencyName,
            String representativeName,
            String bizRegistrationNumber,
            String zipCode,
            String companyAddress,
            String companyAddressDetail,
            String chargerName,
            String chargerEmail,
            String chargerTel,
            boolean isEn,
            Model model) {
        InstitutionStatusVO form = new InstitutionStatusVO();
        form.setInsttId(insttId);
        form.setEntrprsSeCode(membershipType);
        form.setInsttNm(agencyName);
        form.setReprsntNm(representativeName);
        form.setBizrno(bizRegistrationNumber);
        form.setZip(zipCode);
        form.setAdres(companyAddress);
        form.setDetailAdres(companyAddressDetail);
        form.setChargerNm(chargerName);
        form.setChargerEmail(chargerEmail);
        form.setChargerTel(chargerTel);
        model.addAttribute("companyAccountForm", form);
        model.addAttribute("companyAccountAction", isEn ? "/en/admin/member/company_account" : "/admin/member/company_account");
        model.addAttribute("companyAccountFileBaseUrl", isEn ? "/en/admin/member/company-file" : "/admin/member/company-file");
        model.addAttribute("companyAccountSaved", false);
    }

    InstitutionStatusVO loadInstitutionInfoByInsttId(String insttId) {
        if (safeString(insttId).isEmpty()) {
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

    List<InsttFileVO> loadInsttFilesByInsttId(String insttId) {
        if (safeString(insttId).isEmpty()) {
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

    void populateCompanyDetailModel(String insttId, boolean isEn, HttpServletRequest request, Locale locale, Model model) {
        adminMemberPageModelAssembler().populateCompanyDetailModel(insttId, isEn, request, locale, model);
    }

    boolean hasValidInsttEvidenceFiles(List<MultipartFile> fileUploads) {
        if (fileUploads == null || fileUploads.isEmpty()) {
            return false;
        }
        boolean hasRealFile = false;
        for (MultipartFile file : fileUploads) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            hasRealFile = true;
            String name = safeString(file.getOriginalFilename()).toLowerCase(Locale.ROOT);
            boolean extOk = name.endsWith(".pdf") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png");
            if (!extOk || file.getSize() > 10L * 1024L * 1024L) {
                return false;
            }
        }
        return hasRealFile;
    }

    List<InsttFileVO> saveAdminInsttEvidenceFiles(String insttId, List<MultipartFile> fileUploads, int startFileSn) throws Exception {
        if (fileUploads == null || fileUploads.isEmpty()) {
            return Collections.emptyList();
        }
        File dir = resolveInsttUploadDir();
        if (!dir.exists() && !dir.mkdirs()) {
            throw new Exception("Cannot create upload directory: " + dir.getAbsolutePath());
        }

        String safeInsttId = safeString(insttId).replaceAll("[^a-zA-Z0-9_-]", "");
        if (safeInsttId.isEmpty()) {
            safeInsttId = "INSTT";
        }

        List<InsttFileVO> savedFiles = new ArrayList<>();
        for (int i = 0; i < fileUploads.size(); i++) {
            MultipartFile file = fileUploads.get(i);
            if (file == null || file.isEmpty()) {
                continue;
            }

            String originalFileName = safeString(file.getOriginalFilename());
            String ext = "";
            int lastDotIndex = originalFileName.lastIndexOf('.');
            if (lastDotIndex > -1) {
                ext = originalFileName.substring(lastDotIndex).toLowerCase(Locale.ROOT);
            }

            long timestamp = System.currentTimeMillis();
            String newFileName = safeInsttId + "_" + timestamp + "_" + i + ext;
            File targetFile = new File(dir, newFileName);
            file.transferTo(targetFile);

            InsttFileVO fileVO = new InsttFileVO();
            fileVO.setFileId(safeInsttId + "_FILE_" + timestamp + "_" + i);
            fileVO.setInsttId(insttId);
            fileVO.setFileSn(startFileSn + savedFiles.size());
            fileVO.setStreFileNm(newFileName);
            fileVO.setOrignlFileNm(originalFileName.isEmpty() ? newFileName : originalFileName);
            fileVO.setFileStrePath(targetFile.getAbsolutePath());
            fileVO.setFileMg(file.getSize());
            fileVO.setFileExtsn(ext);
            fileVO.setFileCn(file.getContentType());
            savedFiles.add(fileVO);
        }
        return savedFiles;
    }

    String joinInsttEvidencePaths(List<InsttFileVO> fileList) {
        if (fileList == null || fileList.isEmpty()) {
            return "";
        }
        List<String> paths = new ArrayList<>();
        for (InsttFileVO fileVO : fileList) {
            if (fileVO != null && !safeString(fileVO.getFileStrePath()).isEmpty()) {
                paths.add(safeString(fileVO.getFileStrePath()));
            }
        }
        return String.join(",", paths);
    }

    private File resolveInsttUploadDir() {
        String path = safeString(System.getProperty("carbosys.file.instt.dir"));
        if (path.isEmpty()) {
            path = safeString(System.getenv("CARBONET_FILE_INSTT_DIR"));
        }
        if (path.isEmpty()) {
            path = "./var/file/instt";
        }
        return new File(path).getAbsoluteFile();
    }

    String createInstitutionId() {
        String generated = "INSTT_" + System.currentTimeMillis();
        return generated.length() > 20 ? generated.substring(0, 20) : generated;
    }

    private File resolveInstitutionFile(String fileId) {
        String normalizedFileId = safeString(fileId);
        if (normalizedFileId.isEmpty()) {
            return null;
        }
        try {
            InsttFileVO fileVO = entrprsManageService.selectInsttFileByFileId(normalizedFileId);
            if (fileVO == null || safeString(fileVO.getFileStrePath()).isEmpty()) {
                return null;
            }
            return new File(fileVO.getFileStrePath());
        } catch (Exception ignore) {
            return null;
        }
    }

    private String buildAuthChangeRedirectUrl(HttpServletRequest request, Locale locale, String emplyrId, String errorCode) {
        StringBuilder redirect = new StringBuilder(adminPrefix(request, locale)).append("/member/auth-change");
        redirect.append("?targetUserId=").append(urlEncode(emplyrId));
        if (safeString(errorCode).isEmpty()) {
            redirect.append("&updated=true");
        } else {
            redirect.append("&error=").append(urlEncode(errorCode));
        }
        return redirect.toString();
    }

    String resolveAuthChangeMessage(String error, boolean isEn) {
        String normalized = safeString(error).toLowerCase(Locale.ROOT);
        if (normalized.isEmpty()) {
            return "";
        }
        if ("save_failed".equals(normalized)) {
            return isEn ? "Failed to save the administrator role." : "관리자 권한 변경 저장에 실패했습니다.";
        }
        return isEn ? "Failed to process the role change." : "권한 변경 처리에 실패했습니다.";
    }

    private String buildDeptRoleRedirectUrl(HttpServletRequest request, Locale locale, String insttId, String errorCode) {
        StringBuilder redirect = new StringBuilder(adminPrefix(request, locale)).append("/member/dept-role-mapping");
        redirect.append("?insttId=").append(urlEncode(insttId));
        if (safeString(errorCode).isEmpty()) {
            redirect.append("&updated=true");
        } else {
            redirect.append("&error=").append(urlEncode(errorCode));
        }
        return redirect.toString();
    }

    String resolveDeptRoleMessage(String error, boolean isEn) {
        return adminAuthorityPagePayloadSupport.resolveDeptRoleMessage(error, isEn);
    }

    private String resolveInstitutionStatusLabel(String statusCode, boolean isEn) {
        String normalized = safeString(statusCode).toUpperCase(Locale.ROOT);
        if ("P".equals(normalized)) {
            return isEn ? "Active" : "활성";
        }
        if ("A".equals(normalized)) {
            return isEn ? "Pending" : "승인 대기";
        }
        if ("R".equals(normalized)) {
            return isEn ? "Rejected" : "반려";
        }
        if ("D".equals(normalized)) {
            return isEn ? "Deleted" : "삭제";
        }
        if ("X".equals(normalized)) {
            return isEn ? "Blocked" : "차단";
        }
        return normalized.isEmpty() ? "-" : normalized;
    }

    String resolveInstitutionStatusBadgeClass(String statusCode) {
        String normalized = safeString(statusCode).toUpperCase(Locale.ROOT);
        if ("P".equals(normalized)) {
            return "bg-emerald-100 text-emerald-700 border border-emerald-200";
        }
        if ("A".equals(normalized)) {
            return "bg-blue-100 text-blue-700 border border-blue-200";
        }
        if ("R".equals(normalized)) {
            return "bg-amber-100 text-amber-700 border border-amber-200";
        }
        if ("D".equals(normalized)) {
            return "bg-slate-200 text-slate-700 border border-slate-300";
        }
        if ("X".equals(normalized)) {
            return "bg-red-100 text-red-700 border border-red-200";
        }
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }

    private String resolveInstitutionTypeLabel(String typeCode, boolean isEn) {
        String normalized = safeString(typeCode).toUpperCase(Locale.ROOT);
        if ("E".equals(normalized)) {
            return isEn ? "CO2 Emitter" : "CO2 배출사업자";
        }
        if ("P".equals(normalized)) {
            return isEn ? "CCUS Project" : "CCUS 프로젝트";
        }
        if ("C".equals(normalized)) {
            return isEn ? "Promotion Center" : "진흥센터";
        }
        if ("G".equals(normalized)) {
            return isEn ? "Competent Authority" : "주무관청";
        }
        return normalized.isEmpty() ? "-" : normalized;
    }

    String resolveAuthGroupBasePath(HttpServletRequest request, Locale locale) {
        String prefix = adminPrefix(request, locale);
        String requestUri = safeString(request.getRequestURI());
        if (requestUri.startsWith(prefix + "/member/auth-group")) {
            return prefix + "/member/auth-group";
        }
        if (requestUri.startsWith(prefix + "/auth/group")) {
            return prefix + "/auth/group";
        }
        return prefix + "/system/role";
    }

    private String buildAuthGroupRedirectUrl(HttpServletRequest request, Locale locale, String authorCode, String roleCategory) {
        return buildAuthGroupRedirectUrl(request, locale, authorCode, roleCategory, null);
    }

    private String buildAuthGroupRedirectUrl(HttpServletRequest request, Locale locale, String authorCode, String roleCategory, String insttId) {
        StringBuilder redirect = new StringBuilder(resolveAuthGroupBasePath(request, locale));
        boolean hasQuery = false;
        if (!safeString(authorCode).isEmpty()) {
            redirect.append(hasQuery ? '&' : '?').append("authorCode=").append(urlEncode(authorCode));
            hasQuery = true;
        }
        String category = safeString(roleCategory);
        if (!category.isEmpty()) {
            redirect.append(hasQuery ? '&' : '?').append("roleCategory=").append(urlEncode(category));
            hasQuery = true;
        }
        String normalizedInsttId = safeString(insttId);
        if (!normalizedInsttId.isEmpty()) {
            redirect.append(hasQuery ? '&' : '?').append("insttId=").append(urlEncode(normalizedInsttId));
        }
        return redirect.toString();
    }

    boolean isEnglishRequest(HttpServletRequest request, Locale locale) {
        if (request != null) {
            String requestUri = safeString(request.getRequestURI());
            if (requestUri.startsWith("/en/admin")) {
                return true;
            }
            String language = safeString(request.getParameter("language"));
            if ("en".equalsIgnoreCase(language)) {
                return true;
            }
        }
        return false;
    }

    String normalizeMembershipCode(String membershipType) {
        if ("EMITTER".equals(membershipType)) return "E";
        if ("PERFORMER".equals(membershipType)) return "P";
        if ("CENTER".equals(membershipType)) return "C";
        if ("GOV".equals(membershipType)) return "G";
        if ("E".equals(membershipType) || "P".equals(membershipType) || "C".equals(membershipType) || "G".equals(membershipType)) {
            return membershipType;
        }
        return "";
    }

    private String normalizeMemberStatusCode(String statusCode) {
        String v = safeString(statusCode).toUpperCase();
        if ("P".equals(v) || "A".equals(v) || "R".equals(v) || "D".equals(v) || "X".equals(v)) {
            return v;
        }
        return "";
    }

    String resolveMembershipTypeLabel(String code) {
        String v = code == null ? "" : code.trim().toUpperCase();
        if ("E".equals(v) || "EMITTER".equals(v)) return "CO2 배출 및 포집 기업";
        if ("P".equals(v) || "PERFORMER".equals(v)) return "CCUS 사업 수행 기업";
        if ("C".equals(v) || "CENTER".equals(v)) return "CCUS 진흥센터";
        if ("G".equals(v) || "GOV".equals(v)) return "주무관청 / 행정기관";
        return v.isEmpty() ? "기타" : v;
    }

    String resolveMembershipTypeLabelEn(String code) {
        String v = code == null ? "" : code.trim().toUpperCase();
        if ("E".equals(v) || "EMITTER".equals(v)) return "CO2 Emitter/Capture Company";
        if ("P".equals(v) || "PERFORMER".equals(v)) return "CCUS Project Company";
        if ("C".equals(v) || "CENTER".equals(v)) return "CCUS Promotion Center";
        if ("G".equals(v) || "GOV".equals(v)) return "Government / Agency";
        return v.isEmpty() ? "Other" : v;
    }

    String resolveStatusLabel(String statusCode) {
        String v = statusCode == null ? "" : statusCode.trim().toUpperCase();
        if ("P".equals(v)) return "활성";
        if ("A".equals(v)) return "승인 대기";
        if ("R".equals(v)) return "반려";
        if ("D".equals(v)) return "삭제";
        if ("X".equals(v)) return "차단";
        return v.isEmpty() ? "기타" : v;
    }

    String resolveStatusLabelEn(String statusCode) {
        String v = statusCode == null ? "" : statusCode.trim().toUpperCase();
        if ("P".equals(v)) return "Active";
        if ("A".equals(v)) return "Pending Approval";
        if ("R".equals(v)) return "Rejected";
        if ("D".equals(v)) return "Deleted";
        if ("X".equals(v)) return "Blocked";
        return v.isEmpty() ? "Other" : v;
    }

    String resolveStatusBadgeClass(String statusCode) {
        String v = statusCode == null ? "" : statusCode.trim().toUpperCase();
        if ("P".equals(v)) return "bg-emerald-100 text-emerald-700";
        if ("A".equals(v)) return "bg-blue-100 text-blue-700";
        if ("R".equals(v)) return "bg-amber-100 text-amber-700";
        if ("D".equals(v)) return "bg-slate-200 text-slate-700";
        if ("X".equals(v)) return "bg-red-100 text-red-700";
        return "bg-gray-100 text-gray-700";
    }

    String resolveInstitutionStatusLabel(String statusCode) {
        String v = safeString(statusCode).toUpperCase();
        if ("A".equals(v)) return "검토 중";
        if ("P".equals(v)) return "가입 승인 완료";
        if ("R".equals(v)) return "반려";
        if ("X".equals(v)) return "차단";
        if ("D".equals(v)) return "삭제";
        return v.isEmpty() ? "-" : v;
    }

    String resolveInstitutionStatusLabelEn(String statusCode) {
        String v = safeString(statusCode).toUpperCase();
        if ("A".equals(v)) return "Under Review";
        if ("P".equals(v)) return "Approved";
        if ("R".equals(v)) return "Rejected";
        if ("X".equals(v)) return "Blocked";
        if ("D".equals(v)) return "Deleted";
        return v.isEmpty() ? "-" : v;
    }

    String resolveBusinessRoleLabel(String code) {
        String v = safeString(code).toUpperCase();
        if ("E".equals(v)) return "배출량 산정 및 감축 실적 제출 담당";
        if ("P".equals(v)) return "CCUS 사업 수행 및 거래 연계 담당";
        if ("C".equals(v)) return "진흥센터 인증 및 통합 관제 담당";
        if ("G".equals(v)) return "정책 검토 및 행정 승인 담당";
        return "플랫폼 일반 사용자";
    }

    String resolveBusinessRoleLabelEn(String code) {
        String v = safeString(code).toUpperCase();
        if ("E".equals(v)) return "Emission calculation and reduction submission owner";
        if ("P".equals(v)) return "CCUS execution and trading liaison";
        if ("C".equals(v)) return "Certification and integrated monitoring operator";
        if ("G".equals(v)) return "Policy review and administrative approver";
        return "General platform user";
    }

    List<String> resolveAccessScopes(String code) {
        String v = safeString(code).toUpperCase();
        List<String> scopes = new ArrayList<>();
        if ("E".equals(v)) {
            scopes.add("배출량 자가산정");
            scopes.add("탄소발자국 모니터링");
            scopes.add("감축 보고서 제출");
            scopes.add("탄소 크레딧 조회");
        } else if ("P".equals(v)) {
            scopes.add("포집·수송·저장 데이터 입력");
            scopes.add("거래 매칭 및 요청 관리");
            scopes.add("실적 보고서 제출");
            scopes.add("거래 현황 모니터링");
        } else if ("C".equals(v)) {
            scopes.add("인증 보고서 검토");
            scopes.add("인증서 승인·발급");
            scopes.add("통합 관제 및 센서 모니터링");
            scopes.add("통계 시각화 관리");
        } else if ("G".equals(v)) {
            scopes.add("행정기관 검토");
            scopes.add("승인 상태 관리");
            scopes.add("정책 통계 조회");
            scopes.add("대외 제출 결과 확인");
        } else {
            scopes.add("기본 조회");
        }
        return scopes;
    }

    List<String> resolveAccessScopesEn(String code) {
        String v = safeString(code).toUpperCase();
        List<String> scopes = new ArrayList<>();
        if ("E".equals(v)) {
            scopes.add("Self-service emissions calculation");
            scopes.add("Carbon footprint monitoring");
            scopes.add("Reduction report submission");
            scopes.add("Carbon credit lookup");
        } else if ("P".equals(v)) {
            scopes.add("Capture/transport/storage data entry");
            scopes.add("Trade matching and request management");
            scopes.add("Performance report submission");
            scopes.add("Trade status monitoring");
        } else if ("C".equals(v)) {
            scopes.add("Certification report review");
            scopes.add("Certificate approval and issuance");
            scopes.add("Integrated monitoring and sensor oversight");
            scopes.add("Statistics visualization management");
        } else if ("G".equals(v)) {
            scopes.add("Administrative review");
            scopes.add("Approval state control");
            scopes.add("Policy statistics lookup");
            scopes.add("External submission verification");
        } else {
            scopes.add("Basic access");
        }
        return scopes;
    }

    private void populateSecurityPolicyPage(Model model, boolean isEn) {
        adminSystemPageModelAssembler().populateSecurityPolicyPage(model, isEn);
    }

    private void populateSecurityMonitoringPage(Model model, boolean isEn) {
        adminSystemPageModelAssembler().populateSecurityMonitoringPage(model, isEn);
    }

    private void populateBlocklistPage(
            String searchKeyword,
            String blockType,
            String status,
            String source,
            Model model,
            boolean isEn) {
        adminSystemPageModelAssembler().populateBlocklistPage(searchKeyword, blockType, status, source, model, isEn);
    }

    private void populateSecurityAuditPage(Model model, boolean isEn) {
        adminSystemPageModelAssembler().populateSecurityAuditPage(model, isEn);
    }

    private void populateSchedulerPage(
            String jobStatus,
            String executionType,
            Model model,
            boolean isEn) {
        adminSystemPageModelAssembler().populateSchedulerPage(jobStatus, executionType, model, isEn);
    }

    private List<Map<String, String>> buildSecurityPolicySummary(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(summaryCard(isEn ? "Applied Policies" : "적용 정책", "7",
                isEn ? "Rate-limit and automated response rules currently enabled." : "현재 적용 중인 rate-limit 및 자동대응 룰"));
        rows.add(summaryCard(isEn ? "Protected Endpoints" : "보호 URL", "19",
                isEn ? "Endpoints protected by dedicated thresholds." : "개별 임계치가 설정된 엔드포인트 수"));
        rows.add(summaryCard(isEn ? "Captcha Triggers" : "CAPTCHA 발동", "3",
                isEn ? "Flows with bot challenge fallback enabled." : "봇 검증이 연결된 사용자 흐름"));
        rows.add(summaryCard(isEn ? "Escalation Paths" : "자동 조치", "4",
                isEn ? "Routes with temporary block escalation." : "임시 차단까지 자동 승격되는 정책"));
        return rows;
    }

    List<Map<String, String>> buildSecurityPolicyRows(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(mapOf(
                "policyId", "POL-001",
                "targetUrl", "/signin/actionLogin",
                "policyName", isEn ? "User login protection" : "사용자 로그인 보호",
                "threshold", isEn ? "30 req/min per IP" : "IP당 분당 30회",
                "burst", isEn ? "5 req / 10 sec" : "10초 5회 burst",
                "action", isEn ? "Captcha -> 10 min block" : "CAPTCHA -> 10분 차단",
                "status", "ACTIVE",
                "updatedAt", "2026-03-12 08:20"));
        rows.add(mapOf(
                "policyId", "POL-002",
                "targetUrl", "/admin/login/actionLogin",
                "policyName", isEn ? "Admin login hardening" : "관리자 로그인 강화",
                "threshold", isEn ? "10 req/min per IP" : "IP당 분당 10회",
                "burst", isEn ? "3 req / 10 sec" : "10초 3회 burst",
                "action", isEn ? "Immediate 30 min block" : "즉시 30분 차단",
                "status", "ACTIVE",
                "updatedAt", "2026-03-12 08:25"));
        rows.add(mapOf(
                "policyId", "POL-003",
                "targetUrl", "/api/search/**",
                "policyName", isEn ? "Search API throttle" : "검색 API 제어",
                "threshold", isEn ? "120 req/min per token" : "토큰당 분당 120회",
                "burst", isEn ? "20 req / 10 sec" : "10초 20회 burst",
                "action", isEn ? "429 + alert" : "429 + 알림",
                "status", "ACTIVE",
                "updatedAt", "2026-03-11 18:10"));
        return rows;
    }

    List<Map<String, String>> buildSecurityPolicyPlaybooks(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(mapOf("title", isEn ? "Login attack playbook" : "로그인 공격 플레이북",
                "body", isEn ? "Raise admin login threshold only after verifying WAF and captcha counters." : "WAF 및 CAPTCHA 지표 확인 후에만 관리자 로그인 임계치를 상향합니다."));
        rows.add(mapOf("title", isEn ? "Search API degradation" : "검색 API 완화 전략",
                "body", isEn ? "If 429 spikes persist for over 10 minutes, shift to token-based limits and cache prebuilt queries." : "429 급증이 10분 이상 지속되면 토큰 기준 제한과 캐시 응답으로 전환합니다."));
        rows.add(mapOf("title", isEn ? "Emergency block release" : "긴급 차단 해제",
                "body", isEn ? "Release only after verifying owner, CIDR, expiry time, and related gateway policy." : "소유 조직, CIDR, 만료 시각, 게이트웨이 정책 연동을 모두 확인한 뒤 해제합니다."));
        return rows;
    }

    private List<Map<String, String>> buildSecurityMonitoringCards(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(summaryCard(isEn ? "Current RPS" : "현재 RPS", "1,284",
                isEn ? "Combined HTTP requests per second across external ingress." : "외부 인입 전체 기준 초당 요청 수"));
        rows.add(summaryCard(isEn ? "Blocked Requests" : "차단 요청", "438",
                isEn ? "Requests blocked in the last 5 minutes." : "최근 5분간 차단된 요청 수"));
        rows.add(summaryCard(isEn ? "429 Responses" : "429 응답", "126",
                isEn ? "Rate-limit responses in the last 5 minutes." : "최근 5분간 rate-limit 응답 수"));
        rows.add(summaryCard(isEn ? "Active Incidents" : "활성 인시던트", "2",
                isEn ? "Incidents requiring operator review." : "운영자 확인이 필요한 현재 공격 이벤트"));
        return rows;
    }


    List<Map<String, String>> buildSecurityMonitoringTargets(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(mapOf("url", "/admin/login/actionLogin", "rps", "88", "status", isEn ? "Escalated" : "경계", "rule", isEn ? "Admin login hardening" : "관리자 로그인 강화"));
        rows.add(mapOf("url", "/signin/actionLogin", "rps", "240", "status", isEn ? "Protected" : "방어중", "rule", isEn ? "User login protection" : "사용자 로그인 보호"));
        rows.add(mapOf("url", "/api/search/carbon-footprint", "rps", "510", "status", isEn ? "Throttled" : "제한중", "rule", isEn ? "Search API throttle" : "검색 API 제어"));
        return rows;
    }

    List<Map<String, String>> buildSecurityMonitoringIps(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(mapOf("ip", "198.51.100.42", "country", "US", "requestCount", "4,120", "action", isEn ? "Temp blocked" : "임시차단"));
        rows.add(mapOf("ip", "203.0.113.78", "country", "KR", "requestCount", "2,844", "action", isEn ? "Captcha enforced" : "CAPTCHA 전환"));
        rows.add(mapOf("ip", "45.67.22.91", "country", "DE", "requestCount", "2,337", "action", isEn ? "429 only" : "429 응답"));
        return rows;
    }

    List<Map<String, String>> buildSecurityMonitoringEvents(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(mapOf("detectedAt", "2026-03-12 09:18", "title", isEn ? "Burst login attack detected" : "로그인 버스트 공격 감지", "detail", isEn ? "Admin login burst exceeded threshold from 3 IPs." : "3개 IP에서 관리자 로그인 burst 임계치 초과", "severity", "HIGH"));
        rows.add(mapOf("detectedAt", "2026-03-12 09:12", "title", isEn ? "Search API abuse pattern" : "검색 API 남용 패턴", "detail", isEn ? "Single token generated 429 for 6 consecutive minutes." : "단일 토큰에서 6분 연속 429 다발", "severity", "MEDIUM"));
        return rows;
    }

    private List<Map<String, String>> buildBlocklistSummary(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(summaryCard(isEn ? "Active Blocks" : "활성 차단", "27",
                isEn ? "Currently enforced IP, CIDR, account, and UA blocks." : "현재 적용 중인 IP/CIDR/계정/UA 차단"));
        rows.add(summaryCard(isEn ? "Auto Blocks" : "자동 차단", "21",
                isEn ? "Entries generated by security rules." : "보안 룰로 자동 생성된 차단"));
        rows.add(summaryCard(isEn ? "Manual Blocks" : "수동 차단", "6",
                isEn ? "Operator-issued blocks requiring audit review." : "운영자가 등록한 수동 차단"));
        rows.add(summaryCard(isEn ? "Releases Today" : "오늘 해제", "4",
                isEn ? "Scheduled or approved releases for today." : "오늘 예정된 차단 해제 건수"));
        return rows;
    }

    List<Map<String, String>> buildBlocklistRows(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(mapOf("blockId", "BL-240312-01", "target", "198.51.100.42", "blockType", "IP", "reason", isEn ? "Admin login burst" : "관리자 로그인 버스트", "status", "ACTIVE", "expiresAt", "2026-03-12 10:00", "owner", isEn ? "Auto Rule" : "자동 룰"));
        rows.add(mapOf("blockId", "BL-240312-02", "target", "203.0.113.0/24", "blockType", "CIDR", "reason", isEn ? "Credential stuffing pattern" : "Credential stuffing 패턴", "status", "ACTIVE", "expiresAt", "2026-03-12 18:00", "owner", isEn ? "Security Operator" : "보안운영자"));
        rows.add(mapOf("blockId", "BL-240311-04", "target", "bot-agent/7.2", "blockType", "UA", "reason", isEn ? "Search scraping" : "검색 스크래핑", "status", "REVIEW", "expiresAt", "-", "owner", isEn ? "Monitoring Queue" : "모니터링 큐"));
        return rows;
    }

    List<Map<String, String>> buildBlocklistReleaseQueue(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(mapOf("target", "198.51.100.42", "releaseAt", "2026-03-12 10:00", "condition", isEn ? "Auto release if no re-hit for 30 min" : "30분 재탐지 없으면 자동 해제"));
        rows.add(mapOf("target", "203.0.113.0/24", "releaseAt", "2026-03-12 18:00", "condition", isEn ? "Operator approval required" : "운영자 승인 후 해제"));
        return rows;
    }

    private List<Map<String, String>> buildSchedulerSummary(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(summaryCard(isEn ? "Registered Jobs" : "등록 잡", "14",
                isEn ? "Cron-based and on-demand jobs managed from the system menu." : "시스템 메뉴에서 관리 중인 cron 및 수동 실행 잡 수"));
        rows.add(summaryCard(isEn ? "Active Jobs" : "활성 잡", "11",
                isEn ? "Jobs enabled for production execution." : "운영 실행이 활성화된 스케줄러 잡 수"));
        rows.add(summaryCard(isEn ? "Failed Today" : "오늘 실패", "2",
                isEn ? "Jobs that require operator review today." : "오늘 운영 확인이 필요한 실패 잡 수"));
        rows.add(summaryCard(isEn ? "Next 1 Hour" : "1시간 내 예정", "6",
                isEn ? "Executions expected within the next hour." : "다음 1시간 이내 실행 예정 건수"));
        return rows;
    }

    List<Map<String, String>> buildSchedulerJobRows(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(mapOf(
                "jobId", "SCH-001",
                "jobName", isEn ? "Nightly emissions aggregation" : "야간 배출량 집계",
                "cronExpression", "0 0 2 * * ?",
                "executionTypeCode", "CRON",
                "executionType", isEn ? "CRON" : "정기",
                "jobStatus", "ACTIVE",
                "lastRunAt", "2026-03-13 02:00",
                "nextRunAt", "2026-03-14 02:00",
                "owner", isEn ? "Emissions Ops" : "배출 운영팀"));
        rows.add(mapOf(
                "jobId", "SCH-002",
                "jobName", isEn ? "Certificate expiry sync" : "인증서 만료 동기화",
                "cronExpression", "0 */30 * * * ?",
                "executionTypeCode", "CRON",
                "executionType", isEn ? "CRON" : "정기",
                "jobStatus", "ACTIVE",
                "lastRunAt", "2026-03-13 11:30",
                "nextRunAt", "2026-03-13 12:00",
                "owner", isEn ? "Certificate Admin" : "인증 운영자"));
        rows.add(mapOf(
                "jobId", "SCH-003",
                "jobName", isEn ? "External API token refresh" : "외부연계 토큰 갱신",
                "cronExpression", "0 0/10 * * * ?",
                "executionTypeCode", "CRON",
                "executionType", isEn ? "CRON" : "정기",
                "jobStatus", "PAUSED",
                "lastRunAt", "2026-03-13 10:40",
                "nextRunAt", "-",
                "owner", isEn ? "Integration Team" : "외부연계팀"));
        rows.add(mapOf(
                "jobId", "SCH-004",
                "jobName", isEn ? "Manual backfill for trade settlement" : "거래 정산 수동 보정",
                "cronExpression", "-",
                "executionTypeCode", "MANUAL",
                "executionType", isEn ? "MANUAL" : "수동",
                "jobStatus", "REVIEW",
                "lastRunAt", "2026-03-12 18:10",
                "nextRunAt", isEn ? "On request" : "요청 시 실행",
                "owner", isEn ? "Settlement Ops" : "정산 운영팀"));
        return rows;
    }

    List<Map<String, String>> buildSchedulerNodeRows(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(mapOf("nodeId", "batch-node-01", "role", isEn ? "Primary scheduler" : "주 스케줄러", "status", "HEALTHY", "runningJobs", "5", "heartbeatAt", "2026-03-13 11:46:11"));
        rows.add(mapOf("nodeId", "batch-node-02", "role", isEn ? "Failover worker" : "대기 워커", "status", "STANDBY", "runningJobs", "0", "heartbeatAt", "2026-03-13 11:46:04"));
        rows.add(mapOf("nodeId", "batch-node-03", "role", isEn ? "Settlement queue worker" : "정산 큐 워커", "status", "DEGRADED", "runningJobs", "2", "heartbeatAt", "2026-03-13 11:45:31"));
        return rows;
    }

    List<Map<String, String>> buildSchedulerExecutionRows(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(mapOf("executedAt", "2026-03-13 11:30", "jobId", "SCH-002", "result", "SUCCESS", "duration", "18s", "message", isEn ? "Certificate expiration cache synchronized." : "인증서 만료 캐시 동기화 완료"));
        rows.add(mapOf("executedAt", "2026-03-13 11:10", "jobId", "SCH-003", "result", "FAILED", "duration", "47s", "message", isEn ? "Token endpoint timeout. Retry queued." : "토큰 엔드포인트 타임아웃, 재시도 대기"));
        rows.add(mapOf("executedAt", "2026-03-13 10:00", "jobId", "SCH-001", "result", "SUCCESS", "duration", "3m 12s", "message", isEn ? "1,284 aggregation rows persisted." : "집계 1,284건 적재 완료"));
        rows.add(mapOf("executedAt", "2026-03-12 18:10", "jobId", "SCH-004", "result", "REVIEW", "duration", "9m 05s", "message", isEn ? "Manual backfill requires settlement approval." : "수동 보정 후 정산 승인 필요"));
        return rows;
    }

    List<Map<String, String>> buildSchedulerPlaybooks(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(mapOf("title", isEn ? "Cron expression review" : "Cron 표현식 점검",
                "body", isEn ? "Validate time zone, duplicate trigger windows, and collision with settlement cut-off times before enabling a new job."
                        : "신규 잡 활성화 전 시간대, 중복 실행 구간, 정산 마감 시간과의 충돌 여부를 점검합니다."));
        rows.add(mapOf("title", isEn ? "Failure response" : "실패 대응",
                "body", isEn ? "Failed jobs should record retry policy, root cause, and linked operator before rerun approval."
                        : "실패 잡은 재시도 정책, 원인, 담당 운영자를 기록한 뒤 재실행 승인 절차를 거칩니다."));
        rows.add(mapOf("title", isEn ? "Manual execution guardrail" : "수동 실행 가드레일",
                "body", isEn ? "High-impact jobs such as trade settlement or certificate re-issuance should require a dual review and an execution reason."
                        : "거래 정산, 인증서 재발급처럼 영향이 큰 잡은 이중 검토와 실행 사유 기록을 요구합니다."));
        return rows;
    }

    private Map<String, String> summaryCard(String title, String value, String description) {
        Map<String, String> card = new LinkedHashMap<>();
        card.put("title", title);
        card.put("value", value);
        card.put("description", description);
        return card;
    }

    private Map<String, String> mapOf(String... keyValues) {
        Map<String, String> row = new LinkedHashMap<>();
        for (int i = 0; i + 1 < keyValues.length; i += 2) {
            row.put(keyValues[i], keyValues[i + 1]);
        }
        return row;
    }

    String resolveDocumentStatusLabel(String filePath) {
        return safeString(filePath).isEmpty() ? "등록 문서 없음" : "사업자등록증 등록됨";
    }

    String resolveDocumentStatusLabelEn(String filePath) {
        return safeString(filePath).isEmpty() ? "No document registered" : "Business registration file attached";
    }

    void populateMemberEditModel(Model model, EntrprsManageVO member, boolean isEn,
                                 String currentUserId) throws Exception {
        adminMemberPageModelAssembler().populateMemberEditModel(model, member, isEn, currentUserId);
    }

    void populateMemberDetailModel(String memberId, HttpServletRequest request, Model model,
                                           boolean isEn) {
        adminMemberPageModelAssembler().populateMemberDetailModel(memberId, request, model, isEn);
    }

    void ensureMemberEditDefaults(Model model, boolean isEn) {
        model.addAttribute("member", null);
        model.addAttribute("memberEvidenceFiles", Collections.emptyList());
        model.addAttribute("phoneNumber", "-");
        model.addAttribute("membershipTypeLabel", isEn ? "Other" : "기타");
        model.addAttribute("businessRoleLabel", "-");
        model.addAttribute("accessScopes", Collections.emptyList());
        model.addAttribute("statusLabel", "-");
        model.addAttribute("memberStatusCode", "");
        model.addAttribute("memberTypeCode", "");
        model.addAttribute("memberTypeOptions", buildMemberTypeOptions(isEn));
        model.addAttribute("memberStatusOptions", buildMemberStatusOptions(isEn));
        model.addAttribute("memberDocumentStatusLabel", isEn ? "No document registered" : "등록 문서 없음");
        model.addAttribute("institutionInfo", Collections.emptyMap());
        model.addAttribute("institutionStatusLabel", "-");
        model.addAttribute("institutionInsttId", "");
        model.addAttribute("documentStatusLabel", isEn ? "No document registered" : "등록 문서 없음");
        ensurePermissionEditorDefaults(model, isEn);
    }

    void ensureMemberDetailDefaults(Model model, boolean isEn) {
        model.addAttribute("member", null);
        model.addAttribute("memberId", "");
        model.addAttribute("member_detailError", null);
        model.addAttribute("memberEvidenceFiles", Collections.emptyList());
        model.addAttribute("phoneNumber", "-");
        model.addAttribute("membershipTypeLabel", isEn ? "Other" : "기타");
        model.addAttribute("statusLabel", "-");
        model.addAttribute("statusBadgeClass", resolveStatusBadgeClass(""));
        model.addAttribute("passwordResetHistoryRows", Collections.emptyList());
        ensurePermissionEditorDefaults(model, isEn);
    }

    void ensureAdminAccountDefaults(Model model, boolean isEn) {
        model.addAttribute("adminPermissionTarget", null);
        model.addAttribute("adminPermissionUpdated", false);
        model.addAttribute("adminAccountMode", "");
        model.addAttribute("adminAccountReadOnly", false);
        model.addAttribute("adminPermissionStatusLabel", "-");
        model.addAttribute("adminPermissionJoinedAt", "-");
        ensurePermissionEditorDefaults(model, isEn);
    }

    void ensureAdminAccountCreateDefaults(Model model, boolean isEn) {
        model.addAttribute("adminAccountCreateError", "");
        model.addAttribute("adminAccountCreatePreset", "MASTER");
        model.addAttribute("adminAccountCreatePresetAuthorCodes", defaultAdminPresetAuthorCodes());
        model.addAttribute("adminAccountCreatePresetFeatureCodes", Collections.emptyMap());
        model.addAttribute("adminAccountCreateCompanyName", "");
        ensurePermissionEditorDefaults(model, isEn);
    }

    private void ensurePermissionEditorDefaults(Model model, boolean isEn) {
        model.addAttribute("permissionAuthorGroups", Collections.emptyList());
        model.addAttribute("permissionAuthorGroupSections", Collections.emptyList());
        model.addAttribute("permissionSelectedAuthorCode", "");
        model.addAttribute("permissionSelectedAuthorName", "");
        model.addAttribute("permissionFeatureSections", Collections.emptyList());
        model.addAttribute("permissionBaseFeatureCodes", Collections.emptySet());
        model.addAttribute("permissionEffectiveFeatureCodes", Collections.emptySet());
        model.addAttribute("permissionAddedFeatureCodes", Collections.emptySet());
        model.addAttribute("permissionRemovedFeatureCodes", Collections.emptySet());
        model.addAttribute("permissionFeatureCount", 0);
        model.addAttribute("permissionPageCount", 0);
        model.addAttribute("permissionEmptyRoleLabel", isEn ? "Select a role" : "권한 롤 선택");
    }

    List<Map<String, Object>> buildMemberEditAuthorGroupSections(
            EntrprsManageVO member,
            boolean isEn,
            String currentUserId) throws Exception {
        String insttId = safeString(member == null ? null : member.getInsttId());
        String membershipType = normalizeMembershipCode(safeString(member == null ? null : member.getEntrprsSeCode()).toUpperCase(Locale.ROOT));
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        boolean webmaster = isWebmaster(currentUserId);
        List<AuthorInfoVO> allAuthorGroups = authGroupManageService.selectAuthorList();

        List<AuthorInfoVO> memberTypeGroups = adminAuthorityPagePayloadSupport.filterMemberRegisterGeneralAuthorGroups(
                filterAuthorGroups(
                        allAuthorGroups,
                        "USER",
                        currentUserId,
                        currentUserAuthorCode),
                membershipType);
        List<AuthorInfoVO> generalGroups = filterMemberEditGeneralAuthorGroups(
                filterAuthorGroups(
                        allAuthorGroups,
                        "USER",
                        currentUserId,
                        currentUserAuthorCode));

        List<Map<String, String>> departmentRows = buildDepartmentRoleRows(
                authGroupManageService.selectDepartmentRoleMappings(),
                isEn).stream()
                .filter(row -> insttId.equals(safeString(row.get("insttId"))))
                .collect(Collectors.toList());
        List<AuthorInfoVO> companyDepartmentGroups = filterScopedDepartmentAuthorGroups(
                filterAuthorGroupsByScope(
                        allAuthorGroups,
                        "DEPARTMENT",
                        insttId,
                        webmaster,
                        currentUserId,
                        currentUserAuthorCode),
                departmentRows);

        List<Map<String, Object>> sections = new ArrayList<>();
        addPermissionAuthorGroupSection(
                sections,
                isEn ? "Type-based Member Roles" : "회원 유형 기준 권한 롤",
                memberTypeGroups);
        addPermissionAuthorGroupSection(
                sections,
                isEn ? "Company Department Roles" : "소속 회원사 부서 권한",
                companyDepartmentGroups);
        addPermissionAuthorGroupSection(
                sections,
                isEn ? "General Roles" : "일반 권한 롤",
                generalGroups);
        return deduplicatePermissionAuthorGroupSections(sections);
    }

    List<Map<String, Object>> buildAdminPermissionAuthorGroupSections(
            EmplyrInfo adminMember,
            boolean isEn,
            String currentUserId) throws Exception {
        String insttId = safeString(adminMember == null ? null : adminMember.getInsttId());
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        List<AuthorInfoVO> grantableAuthorGroups = filterAuthorGroups(
                authGroupManageService.selectAuthorList(),
                "GENERAL",
                currentUserId,
                currentUserAuthorCode);
        String currentAssignedAuthorCode = adminMember == null
                ? ""
                : safeString(authGroupManageService.selectAuthorCodeByUserId(adminMember.getEmplyrId())).toUpperCase(Locale.ROOT);

        if (ROLE_SYSTEM_MASTER.equals(currentAssignedAuthorCode)) {
            return adminAuthorityPagePayloadSupport.buildAdminRoleLayerSections(grantableAuthorGroups, isEn);
        }

        InstitutionStatusVO institutionInfo = loadInstitutionInfoByInsttId(insttId);
        String membershipType = normalizeMembershipCode(safeString(institutionInfo == null ? null : institutionInfo.getEntrprsSeCode()).toUpperCase(Locale.ROOT));
        if (membershipType.isEmpty()) {
            return adminAuthorityPagePayloadSupport.buildAdminRoleLayerSections(grantableAuthorGroups, isEn);
        }

        List<Map<String, Object>> sections = new ArrayList<>();
        addPermissionAuthorGroupSection(
                sections,
                isEn ? "Company Type Based Admin Roles" : "회원사 타입 기준 관리자 권한 롤",
                adminAuthorityPagePayloadSupport.filterAdminTypeScopedAuthorGroups(grantableAuthorGroups, membershipType));
        addPermissionAuthorGroupSection(
                sections,
                isEn ? "General Admin Roles" : "일반 관리자 권한 롤",
                adminAuthorityPagePayloadSupport.filterAdminGeneralAuthorGroups(grantableAuthorGroups));
        return deduplicatePermissionAuthorGroupSections(sections);
    }

    private List<AuthorInfoVO> filterMemberEditGeneralAuthorGroups(List<AuthorInfoVO> authorGroups) {
        if (authorGroups == null || authorGroups.isEmpty()) {
            return Collections.emptyList();
        }
        return authorGroups.stream()
                .filter(group -> !isMembershipSpecificMemberAuthorCode(group == null ? null : group.getAuthorCode()))
                .collect(Collectors.toList());
    }

    private boolean isMembershipSpecificMemberAuthorCode(String authorCode) {
        String normalizedCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        return normalizedCode.equals("ROLE_USER_EMITTER")
                || normalizedCode.equals("ROLE_USER_PERFORMER")
                || normalizedCode.equals("ROLE_USER_CENTER")
                || normalizedCode.equals("ROLE_USER_GOV")
                || normalizedCode.equals("ROLE_USER_ENTERPRISE")
                || normalizedCode.equals("ROLE_USER_AUTHORITY");
    }

    List<AuthorInfoVO> flattenPermissionAuthorGroupSections(List<Map<String, Object>> sections) {
        if (sections == null || sections.isEmpty()) {
            return Collections.emptyList();
        }
        LinkedHashMap<String, AuthorInfoVO> dedup = new LinkedHashMap<>();
        for (Map<String, Object> section : sections) {
            Object groups = section.get("groups");
            if (!(groups instanceof List<?>)) {
                continue;
            }
            for (Object item : (List<?>) groups) {
                if (!(item instanceof AuthorInfoVO)) {
                    continue;
                }
                AuthorInfoVO group = (AuthorInfoVO) item;
                String authorCode = safeString(group.getAuthorCode()).toUpperCase(Locale.ROOT);
                if (!authorCode.isEmpty() && !dedup.containsKey(authorCode)) {
                    dedup.put(authorCode, group);
                }
            }
        }
        return new ArrayList<>(dedup.values());
    }

    private void addPermissionAuthorGroupSection(
            List<Map<String, Object>> sections,
            String sectionLabel,
            List<AuthorInfoVO> groups) {
        if (groups == null || groups.isEmpty()) {
            return;
        }
        Map<String, Object> section = new LinkedHashMap<>();
        section.put("sectionLabel", sectionLabel);
        section.put("groups", groups);
        sections.add(section);
    }

    private List<Map<String, Object>> deduplicatePermissionAuthorGroupSections(List<Map<String, Object>> sections) {
        if (sections == null || sections.isEmpty()) {
            return Collections.emptyList();
        }
        Set<String> seenAuthorCodes = new LinkedHashSet<>();
        List<Map<String, Object>> sanitizedSections = new ArrayList<>();
        for (Map<String, Object> section : sections) {
            if (section == null) {
                continue;
            }
            Object groupsValue = section.get("groups");
            if (!(groupsValue instanceof List<?>)) {
                continue;
            }
            List<AuthorInfoVO> uniqueGroups = new ArrayList<>();
            for (Object candidate : (List<?>) groupsValue) {
                if (!(candidate instanceof AuthorInfoVO)) {
                    continue;
                }
                AuthorInfoVO group = (AuthorInfoVO) candidate;
                String authorCode = safeString(group.getAuthorCode()).toUpperCase(Locale.ROOT);
                if (authorCode.isEmpty() || seenAuthorCodes.contains(authorCode)) {
                    continue;
                }
                seenAuthorCodes.add(authorCode);
                uniqueGroups.add(group);
            }
            if (uniqueGroups.isEmpty()) {
                continue;
            }
            Map<String, Object> sanitizedSection = new LinkedHashMap<>(section);
            sanitizedSection.put("groups", uniqueGroups);
            sanitizedSections.add(sanitizedSection);
        }
        return sanitizedSections;
    }

    void populateAdminAccountEditModel(Model model, EmplyrInfo adminMember, boolean isEn,
                                               List<String> effectiveFeatureCodes, String currentUserId) throws Exception {
        adminMemberPageModelAssembler().populateAdminAccountEditModel(model, adminMember, isEn, effectiveFeatureCodes, currentUserId);
    }

    void populatePermissionEditorModel(Model model, List<AuthorInfoVO> authorGroups, String selectedAuthorCode,
                                               String scrtyTargetId, List<String> effectiveFeatureCodes,
                                               boolean isEn, String currentUserId) throws Exception {
        ensurePermissionEditorDefaults(model, isEn);
        List<AuthorInfoVO> safeAuthorGroups = authorGroups == null ? Collections.emptyList() : authorGroups;
        safeAuthorGroups = adminAuthorityPagePayloadSupport.appendCurrentAuthorGroup(safeAuthorGroups, selectedAuthorCode);
        Set<String> grantableFeatureCodes = resolveGrantableFeatureCodeSet(currentUserId, isWebmaster(currentUserId));
        List<FeatureCatalogSectionVO> featureSections = filterFeatureCatalogSectionsByGrantable(
                buildFeatureCatalogSections(authGroupManageService.selectFeatureCatalog(), isEn),
                grantableFeatureCodes);
        String normalizedAuthorCode = normalizeSelectedAuthorCode(selectedAuthorCode, safeAuthorGroups);
        Set<String> baselineFeatureCodes = new LinkedHashSet<>(normalizedAuthorCode.isEmpty()
                ? Collections.emptyList()
                : normalizeFeatureCodes(authGroupManageService.selectAuthorFeatureCodes(normalizedAuthorCode)));
        Map<String, List<String>> roleFeatureCodesByAuthorCode = new LinkedHashMap<>();
        for (AuthorInfoVO group : safeAuthorGroups) {
            String authorCode = safeString(group.getAuthorCode()).toUpperCase(Locale.ROOT);
            if (authorCode.isEmpty() || roleFeatureCodesByAuthorCode.containsKey(authorCode)) {
                continue;
            }
            roleFeatureCodesByAuthorCode.put(
                    authorCode,
                    normalizeFeatureCodes(authGroupManageService.selectAuthorFeatureCodes(authorCode)));
        }
        Set<String> effectiveCodeSet = new LinkedHashSet<>();
        if (effectiveFeatureCodes != null) {
            effectiveCodeSet.addAll(normalizeFeatureCodes(effectiveFeatureCodes));
        } else if (!safeString(scrtyTargetId).isEmpty()) {
            List<UserFeatureOverrideVO> overrides = authGroupManageService.selectUserFeatureOverrides(scrtyTargetId);
            effectiveCodeSet.addAll(baselineFeatureCodes);
            for (UserFeatureOverrideVO override : overrides) {
                String featureCode = safeString(override.getFeatureCode()).toUpperCase(Locale.ROOT);
                if (featureCode.isEmpty()) {
                    continue;
                }
                if ("D".equalsIgnoreCase(safeString(override.getOverrideType()))) {
                    effectiveCodeSet.remove(featureCode);
                } else {
                    effectiveCodeSet.add(featureCode);
                }
            }
        } else {
            effectiveCodeSet.addAll(baselineFeatureCodes);
        }

        baselineFeatureCodes = filterFeatureCodeSetByGrantable(baselineFeatureCodes, grantableFeatureCodes);
        effectiveCodeSet = filterFeatureCodeSetByGrantable(effectiveCodeSet, grantableFeatureCodes);

        FeatureCodeBitmap.Index featureBitmapIndex = buildFeatureBitmapIndex(
                featureSections,
                baselineFeatureCodes,
                effectiveCodeSet,
                grantableFeatureCodes);
        BitSet baselineBitmap = featureBitmapIndex.encode(baselineFeatureCodes);
        BitSet effectiveBitmap = featureBitmapIndex.encode(effectiveCodeSet);
        Set<String> addedFeatureCodes = featureBitmapIndex.decode(featureBitmapIndex.difference(effectiveBitmap, baselineBitmap));
        Set<String> removedFeatureCodes = featureBitmapIndex.decode(featureBitmapIndex.difference(baselineBitmap, effectiveBitmap));

        model.addAttribute("permissionAuthorGroups", safeAuthorGroups);
        model.addAttribute("permissionSelectedAuthorCode", normalizedAuthorCode);
        model.addAttribute("permissionSelectedAuthorName", resolveSelectedAuthorName(normalizedAuthorCode, safeAuthorGroups));
        model.addAttribute("permissionFeatureSections", featureSections);
        model.addAttribute("permissionBaseFeatureCodes", baselineFeatureCodes);
        model.addAttribute("permissionEffectiveFeatureCodes", effectiveCodeSet);
        model.addAttribute("permissionRoleFeatureCodesByAuthorCode", roleFeatureCodesByAuthorCode);
        model.addAttribute("permissionAddedFeatureCodes", addedFeatureCodes);
        model.addAttribute("permissionRemovedFeatureCodes", removedFeatureCodes);
        model.addAttribute("permissionEffectiveFeatureLabels", buildFeatureDisplayLabels(featureSections, effectiveCodeSet));
        model.addAttribute("permissionFeatureCount", effectiveCodeSet.size());
        model.addAttribute("permissionPageCount", countSelectedPageCount(featureSections, featureBitmapIndex, effectiveBitmap));
    }

    void populateAdminAccountCreatePageModel(Model model, boolean isEn) {
        adminMemberPageModelAssembler().populateAdminAccountCreatePageModel(model, isEn);
    }

    Map<String, String> defaultAdminPresetAuthorCodes() {
        Map<String, String> presetAuthorCodes = new LinkedHashMap<>();
        presetAuthorCodes.put("MASTER", ROLE_SYSTEM_MASTER);
        presetAuthorCodes.put("SYSTEM", ROLE_SYSTEM_ADMIN);
        presetAuthorCodes.put("OPERATION", ROLE_OPERATION_ADMIN);
        presetAuthorCodes.put("GENERAL", ROLE_ADMIN);
        return presetAuthorCodes;
    }

    private String resolveAdminPresetAuthorCode(String rolePreset) {
        return safeString(defaultAdminPresetAuthorCodes().get(safeString(rolePreset).toUpperCase(Locale.ROOT)));
    }

    private boolean containsAuthorCode(List<AuthorInfoVO> authorGroups, String authorCode) {
        String normalizedAuthorCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        return !normalizedAuthorCode.isEmpty() && buildAuthorCodeSet(authorGroups).contains(normalizedAuthorCode);
    }

    private String normalizeSelectedAuthorCode(String authorCode, List<AuthorInfoVO> authorGroups) {
        String normalizedAuthorCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        if (normalizedAuthorCode.isEmpty()) {
            return "";
        }
        return containsAuthorCode(authorGroups, normalizedAuthorCode) ? normalizedAuthorCode : "";
    }

    private List<String> buildFeatureDisplayLabels(List<FeatureCatalogSectionVO> featureSections, Set<String> effectiveFeatureCodes) {
        if (featureSections == null || featureSections.isEmpty() || effectiveFeatureCodes == null || effectiveFeatureCodes.isEmpty()) {
            return Collections.emptyList();
        }
        Map<String, String> featureNameByCode = new LinkedHashMap<>();
        for (FeatureCatalogSectionVO section : featureSections) {
            if (section == null || section.getFeatures() == null) {
                continue;
            }
            for (FeatureCatalogItemVO feature : section.getFeatures()) {
                if (feature == null) {
                    continue;
                }
                String featureCode = safeString(feature.getFeatureCode()).toUpperCase(Locale.ROOT);
                if (featureCode.isEmpty() || featureNameByCode.containsKey(featureCode)) {
                    continue;
                }
                String featureName = safeString(feature.getFeatureNm());
                featureNameByCode.put(featureCode, featureName.isEmpty() ? featureCode : featureName);
            }
        }
        List<String> labels = new ArrayList<>();
        for (String featureCode : effectiveFeatureCodes) {
            String normalizedFeatureCode = safeString(featureCode).toUpperCase(Locale.ROOT);
            if (normalizedFeatureCode.isEmpty()) {
                continue;
            }
            labels.add(featureNameByCode.getOrDefault(normalizedFeatureCode, normalizedFeatureCode));
        }
        return labels;
    }

    List<String> extractPayloadIds(Object selectedIds, String singleId) {
        Set<String> ids = new LinkedHashSet<>();
        String normalizedSingleId = safeString(singleId);
        if (!normalizedSingleId.isEmpty()) {
            ids.add(normalizedSingleId);
        }
        if (!(selectedIds instanceof List<?>)) {
            return new ArrayList<>(ids);
        }
        for (Object item : (List<?>) selectedIds) {
            String value = safeString(item == null ? null : item.toString());
            if (!value.isEmpty()) {
                ids.add(value);
            }
        }
        return new ArrayList<>(ids);
    }

    List<String> normalizeFeatureCodes(List<String> featureCodes) {
        if (featureCodes == null || featureCodes.isEmpty()) {
            return Collections.emptyList();
        }
        Set<String> normalized = new LinkedHashSet<>();
        for (String featureCode : featureCodes) {
            String value = safeString(featureCode).toUpperCase(Locale.ROOT);
            if (!value.isEmpty()) {
                normalized.add(value);
            }
        }
        return new ArrayList<>(normalized);
    }

    private boolean isStrongAdminPassword(String password) {
        String value = safeString(password);
        return value.matches("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$");
    }

    private String buildPhoneNumber(String phone1, String phone2, String phone3) {
        List<String> parts = new ArrayList<>();
        if (!safeString(phone1).isEmpty()) {
            parts.add(safeString(phone1));
        }
        if (!safeString(phone2).isEmpty()) {
            parts.add(safeString(phone2));
        }
        if (!safeString(phone3).isEmpty()) {
            parts.add(safeString(phone3));
        }
        return String.join("-", parts);
    }

    void savePermissionOverrides(String scrtyTargetId, String memberTypeCode,
                                         List<String> baselineFeatureCodes, List<String> effectiveFeatureCodes,
                                         String actorId, Set<String> grantableFeatureCodes) throws Exception {
        String normalizedTargetId = safeString(scrtyTargetId);
        if (normalizedTargetId.isEmpty()) {
            throw new IllegalArgumentException("Security target ID is required.");
        }
        Set<String> baseline = new LinkedHashSet<>(baselineFeatureCodes == null
                ? Collections.emptyList()
                : normalizeFeatureCodes(baselineFeatureCodes));
        Set<String> requestedEffective = new LinkedHashSet<>(effectiveFeatureCodes == null
                ? Collections.emptyList()
                : normalizeFeatureCodes(effectiveFeatureCodes));
        Set<String> effective = grantableFeatureCodes == null
                ? requestedEffective
                : mergeManagedFeatureSelection(
                        baseline,
                        resolveEffectiveFeatureCodeSet(normalizedTargetId, baseline),
                        requestedEffective,
                        grantableFeatureCodes);
        List<String> allowFeatureCodes = new ArrayList<>(effective);
        allowFeatureCodes.removeAll(baseline);
        List<String> denyFeatureCodes = new ArrayList<>(baseline);
        denyFeatureCodes.removeAll(effective);
        authGroupManageService.replaceUserFeatureOverrides(
                normalizedTargetId,
                memberTypeCode,
                allowFeatureCodes,
                denyFeatureCodes,
                actorId);
    }

    List<Map<String, String>> buildMemberTypeOptions(boolean isEn) {
        List<CmmnDetailCode> codes = loadCommonCodes("MBTYPE");
        if (codes.isEmpty()) {
            return defaultMemberTypeOptions(isEn);
        }
        List<Map<String, String>> options = new ArrayList<>();
        for (CmmnDetailCode code : codes) {
            String value = safeString(code.getCode()).toUpperCase(Locale.ROOT);
            if (value.isEmpty()) {
                continue;
            }
            String label = resolveCommonCodeLabel(code, isEn, isEn ? this::resolveMembershipTypeLabelEn : this::resolveMembershipTypeLabel);
            options.add(buildOption(value, label));
        }
        return options.isEmpty() ? defaultMemberTypeOptions(isEn) : options;
    }

    private List<Map<String, String>> buildMemberStatusOptions(boolean isEn) {
        List<CmmnDetailCode> codes = loadCommonCodes("MBSTAT");
        if (codes.isEmpty()) {
            return defaultMemberStatusOptions(isEn);
        }
        List<Map<String, String>> options = new ArrayList<>();
        for (CmmnDetailCode code : codes) {
            String value = safeString(code.getCode()).toUpperCase(Locale.ROOT);
            if (value.isEmpty()) {
                continue;
            }
            String label = resolveCommonCodeLabel(code, isEn, isEn ? this::resolveStatusLabelEn : this::resolveStatusLabel);
            options.add(buildOption(value, label));
        }
        return options.isEmpty() ? defaultMemberStatusOptions(isEn) : options;
    }

    private String resolveCommonCodeLabel(CmmnDetailCode code, boolean isEn, java.util.function.Function<String, String> fallback) {
        String label = isEn ? safeString(code.getCodeDc()) : safeString(code.getCodeNm());
        if (label.isEmpty()) {
            label = fallback.apply(safeString(code.getCode()).toUpperCase(Locale.ROOT));
        }
        return label;
    }

    Set<String> resolveGrantableFeatureCodeSet(String currentUserId, boolean webmaster) throws Exception {
        return adminAuthorityPagePayloadSupport.resolveGrantableFeatureCodeSet(currentUserId, webmaster);
    }

    String loadAssignedAuthorCode(String emplyrId) throws Exception {
        return safeString(authGroupManageService.selectAuthorCodeByUserId(emplyrId)).toUpperCase(Locale.ROOT);
    }

    List<AuthorInfoVO> loadGrantableAdminAuthorGroups(String currentUserId, String currentUserAuthorCode) throws Exception {
        return filterAuthorGroups(
                authGroupManageService.selectAuthorList(),
                "GENERAL",
                currentUserId,
                currentUserAuthorCode);
    }

    List<AuthorInfoVO> loadGrantableMemberAuthorGroups(String currentUserId, String currentUserAuthorCode) throws Exception {
        return filterAuthorGroups(
                authGroupManageService.selectAuthorList(),
                "USER",
                currentUserId,
                currentUserAuthorCode);
    }

    boolean isGrantableOrCurrentAdminAuthorCode(
            List<AuthorInfoVO> authorGroups,
            String selectedAuthorCode,
            String currentAssignedAuthorCode) {
        return adminAuthorityPagePayloadSupport.isGrantableOrCurrentAuthorCode(
                authorGroups,
                selectedAuthorCode,
                currentAssignedAuthorCode);
    }

    List<String> loadAuthorFeatureCodes(String authorCode) throws Exception {
        return normalizeFeatureCodes(authGroupManageService.selectAuthorFeatureCodes(authorCode));
    }

    void updateAdminRoleAssignment(String emplyrId, String authorCode) throws Exception {
        authGroupManageService.updateAdminRoleAssignment(emplyrId, authorCode);
    }

    private void applyUserFeatureOverrides(Set<String> featureCodes, List<UserFeatureOverrideVO> overrides) {
        if (featureCodes == null || overrides == null || overrides.isEmpty()) {
            return;
        }
        for (UserFeatureOverrideVO override : overrides) {
            String featureCode = safeString(override.getFeatureCode()).toUpperCase(Locale.ROOT);
            if (featureCode.isEmpty()) {
                continue;
            }
            if ("D".equalsIgnoreCase(safeString(override.getOverrideType()))) {
                featureCodes.remove(featureCode);
            } else {
                featureCodes.add(featureCode);
            }
        }
    }

    List<FeatureCatalogSectionVO> filterFeatureCatalogSectionsByGrantable(List<FeatureCatalogSectionVO> featureSections,
                                                                                  Set<String> grantableFeatureCodes) {
        return adminAuthorityPagePayloadSupport.filterFeatureCatalogSectionsByGrantable(featureSections, grantableFeatureCodes);
    }

    List<String> filterFeatureCodesByGrantable(List<String> featureCodes, Set<String> grantableFeatureCodes) {
        return adminAuthorityPagePayloadSupport.filterFeatureCodesByGrantable(featureCodes, grantableFeatureCodes);
    }

    private Set<String> filterFeatureCodeSetByGrantable(Set<String> featureCodes, Set<String> grantableFeatureCodes) {
        if (featureCodes == null || featureCodes.isEmpty()) {
            return new LinkedHashSet<>();
        }
        if (grantableFeatureCodes == null) {
            return new LinkedHashSet<>(featureCodes);
        }
        Set<String> filtered = new LinkedHashSet<>(featureCodes);
        filtered.retainAll(grantableFeatureCodes);
        return filtered;
    }

    private List<String> mergeRoleFeatureSelection(String authorCode, List<String> requestedFeatureCodes,
                                                   Set<String> grantableFeatureCodes) throws Exception {
        List<String> normalizedRequested = normalizeFeatureCodes(requestedFeatureCodes);
        if (grantableFeatureCodes == null) {
            return normalizedRequested;
        }
        Set<String> merged = new LinkedHashSet<>(normalizeFeatureCodes(authGroupManageService.selectAuthorFeatureCodes(authorCode)));
        merged.removeIf(grantableFeatureCodes::contains);
        merged.addAll(filterFeatureCodesByGrantable(normalizedRequested, grantableFeatureCodes));
        return new ArrayList<>(merged);
    }

    private Set<String> resolveEffectiveFeatureCodeSet(String scrtyTargetId, Set<String> baselineFeatureCodes) throws Exception {
        Set<String> effective = new LinkedHashSet<>(baselineFeatureCodes == null ? Collections.emptySet() : baselineFeatureCodes);
        if (!safeString(scrtyTargetId).isEmpty()) {
            applyUserFeatureOverrides(effective, authGroupManageService.selectUserFeatureOverrides(scrtyTargetId));
        }
        return effective;
    }

    private Set<String> mergeManagedFeatureSelection(Set<String> baselineFeatureCodes, Set<String> currentEffectiveFeatureCodes,
                                                     Set<String> requestedManagedFeatureCodes,
                                                     Set<String> grantableFeatureCodes) {
        if (grantableFeatureCodes == null) {
            return requestedManagedFeatureCodes == null ? new LinkedHashSet<>() : new LinkedHashSet<>(requestedManagedFeatureCodes);
        }
        FeatureCodeBitmap.Index featureBitmapIndex = buildFeatureBitmapIndex(
                null,
                baselineFeatureCodes,
                currentEffectiveFeatureCodes,
                requestedManagedFeatureCodes,
                grantableFeatureCodes);
        BitSet mergedBitmap = featureBitmapIndex.encode(baselineFeatureCodes);
        BitSet currentEffectiveBitmap = featureBitmapIndex.encode(currentEffectiveFeatureCodes);
        BitSet grantableBitmap = featureBitmapIndex.encode(grantableFeatureCodes);

        mergedBitmap.or(featureBitmapIndex.difference(currentEffectiveBitmap, grantableBitmap));

        BitSet baselineBitmap = featureBitmapIndex.encode(baselineFeatureCodes);
        BitSet unmanagedBaselineRemoved = featureBitmapIndex.difference(baselineBitmap, grantableBitmap);
        unmanagedBaselineRemoved.andNot(currentEffectiveBitmap);
        mergedBitmap.andNot(unmanagedBaselineRemoved);

        mergedBitmap.andNot(grantableBitmap);
        mergedBitmap.or(featureBitmapIndex.intersect(
                featureBitmapIndex.encode(requestedManagedFeatureCodes),
                grantableBitmap));
        return featureBitmapIndex.decode(mergedBitmap);
    }

    private List<Map<String, String>> defaultMemberTypeOptions(boolean isEn) {
        List<Map<String, String>> options = new ArrayList<>();
        options.add(buildOption("E", isEn ? resolveMembershipTypeLabelEn("E") : resolveMembershipTypeLabel("E")));
        options.add(buildOption("P", isEn ? resolveMembershipTypeLabelEn("P") : resolveMembershipTypeLabel("P")));
        options.add(buildOption("C", isEn ? resolveMembershipTypeLabelEn("C") : resolveMembershipTypeLabel("C")));
        options.add(buildOption("G", isEn ? resolveMembershipTypeLabelEn("G") : resolveMembershipTypeLabel("G")));
        return options;
    }

    private List<Map<String, String>> defaultMemberStatusOptions(boolean isEn) {
        List<Map<String, String>> options = new ArrayList<>();
        options.add(buildOption("P", isEn ? resolveStatusLabelEn("P") : resolveStatusLabel("P")));
        options.add(buildOption("A", isEn ? resolveStatusLabelEn("A") : resolveStatusLabel("A")));
        options.add(buildOption("R", isEn ? resolveStatusLabelEn("R") : resolveStatusLabel("R")));
        options.add(buildOption("D", isEn ? resolveStatusLabelEn("D") : resolveStatusLabel("D")));
        options.add(buildOption("X", isEn ? resolveStatusLabelEn("X") : resolveStatusLabel("X")));
        return options;
    }

    private Map<String, String> buildOption(String code, String label) {
        Map<String, String> option = new java.util.LinkedHashMap<>();
        option.put("code", code);
        option.put("label", label);
        return option;
    }

    private List<CmmnDetailCode> loadCommonCodes(String codeId) {
        if (cmmUseService == null || codeId == null || codeId.trim().isEmpty()) {
            return Collections.emptyList();
        }
        try {
            ComDefaultCodeVO vo = new ComDefaultCodeVO();
            vo.setCodeId(codeId.trim());
            return cmmUseService.selectCmmCodeDetail(vo);
        } catch (Exception e) {
            log.warn("Failed to load common codes. codeId={}", codeId, e);
            return Collections.emptyList();
        }
    }


    void primeCsrfToken(HttpServletRequest request) {
        if (request == null) {
            return;
        }
        Object token = request.getAttribute("_csrf");
        if (token instanceof CsrfToken) {
            ((CsrfToken) token).getToken();
        }
    }

    EntrprsManageVO mergeMemberWithInstitutionInfo(EntrprsManageVO member, InstitutionStatusVO institutionInfo) {
        if (institutionInfo == null || institutionInfo.isEmpty()) {
            return member;
        }
        if (isBlankMemberValue(member.getCmpnyNm())) {
            member.setCmpnyNm(stringValue(institutionInfo.getInsttNm()));
        }
        if (isBlankMemberValue(member.getCxfc())) {
            member.setCxfc(stringValue(institutionInfo.getReprsntNm()));
        }
        if (isBlankMemberValue(member.getBizrno())) {
            member.setBizrno(stringValue(institutionInfo.getBizrno()));
        }
        if (isBlankMemberValue(member.getApplcntEmailAdres())) {
            member.setApplcntEmailAdres(stringValue(institutionInfo.getChargerEmail()));
        }
        if (isBlankMemberValue(member.getApplcntNm())) {
            member.setApplcntNm(stringValue(institutionInfo.getChargerNm()));
        }
        return member;
    }

    private boolean isBlankMemberValue(String value) {
        String normalized = safeString(value);
        return normalized.isEmpty()
                || "-".equals(normalized)
                || "000000".equals(normalized)
                || "주소미입력".equals(normalized)
                || "address pending".equalsIgnoreCase(normalized);
    }

    List<EvidenceFileView> loadEvidenceFiles(EntrprsManageVO member) {
        try {
            List<EntrprsMberFileVO> fileList = entrprsManageService.selectEntrprsMberFiles(member.getEntrprsmberId());
            if (fileList != null && !fileList.isEmpty()) {
                List<EvidenceFileView> evidenceFiles = new ArrayList<>();
                for (EntrprsMberFileVO fileVO : fileList) {
                    String path = safeString(fileVO.getFileStrePath());
                    if (path.isEmpty()) {
                        continue;
                    }
                    String normalizedFileId = safeString(fileVO.getFileId());
                    String previewUrl = "";
                    String downloadUrl = "";
                    if (!normalizedFileId.isEmpty()) {
                        String encodedFileId = urlEncode(normalizedFileId);
                        previewUrl = "/admin/member/file?fileId=" + encodedFileId;
                        downloadUrl = previewUrl + "&download=true";
                    }
                    String originalName = safeString(fileVO.getOrignlFileNm());
                    String displayName = originalName.isEmpty() ? new File(path).getName() : originalName;
                    evidenceFiles.add(new EvidenceFileView(
                            displayName,
                            safeString(fileVO.getStreFileNm()),
                            safeString(fileVO.getFileId()),
                            safeString(fileVO.getRegDate()),
                            path,
                            previewUrl,
                            downloadUrl));
                }
                if (!evidenceFiles.isEmpty()) {
                    return evidenceFiles;
                }
            }
        } catch (Exception ignored) {
        }
        return buildEvidenceFilesFromPath(member.getBizRegFilePath());
    }

    private List<EvidenceFileView> buildEvidenceFilesFromPath(String filePathValue) {
        String value = safeString(filePathValue);
        if (value.isEmpty()) {
            return Collections.emptyList();
        }
        return java.util.Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(path -> !path.isEmpty())
                .map(path -> {
                    return new EvidenceFileView(
                            new File(path).getName(),
                            "",
                            "",
                            "",
                            path,
                            "",
                            "");
                })
                .collect(Collectors.toList());
    }

    private String resolveMediaType(String fileName) {
        String lower = safeString(fileName).toLowerCase(Locale.ROOT);
        if (lower.endsWith(".pdf")) {
            return MediaType.APPLICATION_PDF_VALUE;
        }
        if (lower.endsWith(".png")) {
            return MediaType.IMAGE_PNG_VALUE;
        }
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return MediaType.IMAGE_JPEG_VALUE;
        }
        if (lower.endsWith(".gif")) {
            return MediaType.IMAGE_GIF_VALUE;
        }
        return MediaType.APPLICATION_OCTET_STREAM_VALUE;
    }

    public static class EvidenceFileView {
        private final String fileName;
        private final String storedFileName;
        private final String fileId;
        private final String regDate;
        private final String filePath;
        private final String previewUrl;
        private final String downloadUrl;

        public EvidenceFileView(String fileName, String storedFileName, String fileId, String regDate, String filePath, String previewUrl, String downloadUrl) {
            this.fileName = fileName;
            this.storedFileName = storedFileName;
            this.fileId = fileId;
            this.regDate = regDate;
            this.filePath = filePath;
            this.previewUrl = previewUrl;
            this.downloadUrl = downloadUrl;
        }

        public String getFileName() {
            return fileName;
        }

        public String getStoredFileName() {
            return storedFileName;
        }

        public String getFileId() {
            return fileId;
        }

        public String getRegDate() {
            return regDate;
        }

        public String getFilePath() {
            return filePath;
        }

        public String getPreviewUrl() {
            return previewUrl;
        }

        public String getDownloadUrl() {
            return downloadUrl;
        }
    }

    InstitutionStatusVO loadInstitutionInfo(EntrprsManageVO member) {
        try {
            if (safeString(member.getInsttId()).isEmpty()
                    && (safeString(member.getBizrno()).isEmpty() || safeString(member.getCxfc()).isEmpty())) {
                return null;
            }
            InsttInfoVO insttInfoVO = new InsttInfoVO();
            if (!safeString(member.getInsttId()).isEmpty()) {
                insttInfoVO.setInsttId(member.getInsttId());
            } else {
                insttInfoVO.setBizrno(member.getBizrno());
                insttInfoVO.setReprsntNm(member.getCxfc());
            }
            return entrprsManageService.selectInsttInfoForStatus(insttInfoVO);
        } catch (Exception e) {
            return null;
        }
    }

    String formatPhoneNumber(String areaNo, String middleNo, String endNo) {
        String a = safeString(areaNo);
        String m = safeString(middleNo);
        String e = safeString(endNo);
        if (a.isEmpty() && m.isEmpty() && e.isEmpty()) {
            return "-";
        }
        if (!a.isEmpty() && !m.isEmpty() && !e.isEmpty()) {
            return a + "-" + m + "-" + e;
        }
        if (!m.isEmpty() && !e.isEmpty()) {
            return m + "-" + e;
        }
        return (a + m + e).trim();
    }

    private String[] splitPhoneNumber(String phoneNumber) {
        String digits = digitsOnly(phoneNumber);
        if (digits.length() == 9) {
            return new String[]{digits.substring(0, 2), digits.substring(2, 5), digits.substring(5)};
        }
        if (digits.length() == 10) {
            if (digits.startsWith("02")) {
                return new String[]{digits.substring(0, 2), digits.substring(2, 6), digits.substring(6)};
            }
            return new String[]{digits.substring(0, 3), digits.substring(3, 6), digits.substring(6)};
        }
        if (digits.length() == 11) {
            return new String[]{digits.substring(0, 3), digits.substring(3, 7), digits.substring(7)};
        }
        return null;
    }

    boolean isValidEmail(String email) {
        String value = safeString(email);
        return !value.isEmpty() && value.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    }

    String digitsOnly(String value) {
        return safeString(value).replaceAll("[^0-9]", "");
    }

    String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    String trimToLen(String value, int maxLen) {
        String normalized = safeString(value);
        if (normalized.length() <= maxLen) {
            return normalized;
        }
        return normalized.substring(0, maxLen);
    }

    String urlEncode(String value) {
        return URLEncoder.encode(safeString(value), StandardCharsets.UTF_8);
    }

    private Date parseJoinDate(String value) {
        String v = safeString(value);
        if (v.isEmpty()) {
            return null;
        }
        String[] patterns = {
                "yyyy-MM-dd HH:mm:ss",
                "yyyy.MM.dd HH:mm:ss",
                "yyyy/MM/dd HH:mm:ss",
                "yyyyMMddHHmmss",
                "yyyy-MM-dd",
                "yyyy.MM.dd",
                "yyyy/MM/dd",
                "yyyyMMdd"
        };
        for (String pattern : patterns) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat(pattern);
                sdf.setLenient(false);
                return sdf.parse(v);
            } catch (Exception ignore) {
                // try next
            }
        }
        return null;
    }

    String safeString(String value) {
        return value == null ? "" : value.trim();
    }

    private File resolveMemberFile(String fileId) {
        String normalizedFileId = safeString(fileId);
        if (normalizedFileId.isEmpty()) {
            return null;
        }
        try {
            EntrprsMberFileVO fileVO = entrprsManageService.selectEntrprsMberFileByFileId(normalizedFileId);
            if (fileVO == null || safeString(fileVO.getFileStrePath()).isEmpty()) {
                return null;
            }
            return new File(fileVO.getFileStrePath());
        } catch (Exception ignore) {
            return null;
        }
    }

    private boolean isAllowedFilePath(String canonicalPath) {
        List<String> roots = new ArrayList<>();
        String byProp = safeString(System.getProperty("carbosys.file.root"));
        String byEnv = safeString(System.getenv("CARBONET_FILE_ROOT"));
        if (!byProp.isEmpty()) {
            roots.add(byProp);
        } else if (!byEnv.isEmpty()) {
            roots.add(byEnv);
        } else {
            roots.add("./file");
        }
        roots.add("/srv/file/carbosys");

        for (String root : roots) {
            try {
                String prefix = new File(root).getCanonicalPath();
                if (!prefix.endsWith(File.separator)) {
                    prefix += File.separator;
                }
                if (canonicalPath.startsWith(prefix)) {
                    return true;
                }
            } catch (Exception ignore) {
                // Skip invalid root and continue.
            }
        }
        return false;
    }

}
