package egovframework.com.feature.admin.web;

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
import egovframework.com.feature.admin.model.vo.AuthorInfoVO;
import egovframework.com.feature.admin.model.vo.DepartmentRoleMappingVO;
import egovframework.com.feature.admin.model.vo.FeatureAssignmentStatVO;
import egovframework.com.feature.admin.model.vo.FeatureCatalogItemVO;
import egovframework.com.feature.admin.model.vo.FeatureCatalogSectionVO;
import egovframework.com.feature.admin.model.vo.LoginHistorySearchVO;
import egovframework.com.feature.admin.model.vo.LoginHistoryVO;
import egovframework.com.feature.admin.model.vo.UserAuthorityTargetVO;
import egovframework.com.feature.admin.model.vo.UserFeatureOverrideVO;
import egovframework.com.feature.admin.service.AdminLoginHistoryService;
import egovframework.com.feature.admin.service.AuthGroupManageService;
import egovframework.com.feature.admin.service.MenuInfoService;
import egovframework.com.feature.admin.dto.request.AdminAuthGroupCreateRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminAuthChangeSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminAuthGroupFeatureSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminDeptRoleMappingSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminDeptRoleMemberSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminMemberEditSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminPermissionSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminAdminAccountCreateRequestDTO;
import egovframework.com.feature.admin.dto.response.MenuInfoDTO;
import egovframework.com.feature.auth.domain.entity.EmplyrInfo;
import egovframework.com.feature.auth.domain.entity.PasswordResetHistory;
import egovframework.com.feature.auth.domain.repository.EmployeeMemberRepository;
import egovframework.com.feature.member.dto.response.CompanySearchResponseDTO;
import egovframework.com.feature.auth.service.AuthService;
import egovframework.com.feature.auth.util.JwtTokenProvider;
import egovframework.com.feature.auth.util.ClientIpUtil;
import egovframework.com.common.audit.AuditTrailService;
import egovframework.com.common.util.ReactPageUrlMapper;
import egovframework.com.common.logging.RequestExecutionLogService;
import egovframework.com.common.logging.RequestExecutionLogVO;
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
    private final CommonCodeService cmmUseService;
    private final AuthGroupManageService authGroupManageService;
    private final AdminLoginHistoryService adminLoginHistoryService;
    private final AuthService authService;
    private final MenuInfoService menuInfoService;
    private final RequestExecutionLogService requestExecutionLogService;
    private final AuditTrailService auditTrailService;

    @RequestMapping(value = { "", "/" }, method = { RequestMethod.GET, RequestMethod.POST })
    public String adminMainEntry(HttpServletRequest request, Locale locale) {
        String accessToken = jwtProvider.getCookie(request, "accessToken");
        if (ObjectUtils.isEmpty(accessToken)) {
            return resolveAdminLoginRedirect(request);
        }
        return redirectReactMigration(request, locale, "admin-home");
    }

    @RequestMapping(value = "/member/stats", method = { RequestMethod.GET, RequestMethod.POST })
    public String member_stats(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, "member-stats");
    }

    @GetMapping("/member/stats/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> memberStatsPageApi(HttpServletRequest request, Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        primeCsrfToken(request);
        return ResponseEntity.ok(buildMemberStatsPageData(isEn));
    }

    @RequestMapping(value = "/member/register", method = { RequestMethod.GET, RequestMethod.POST })
    public String member_register(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, "member-register");
    }

    @GetMapping("/member/register/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> memberRegisterPageApi(HttpServletRequest request, Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        primeCsrfToken(request);
        return ResponseEntity.ok(buildMemberRegisterPageData(isEn));
    }

    @RequestMapping(value = "/member/approve", method = RequestMethod.GET)
    public String member_approve(
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

    @GetMapping("/api/admin/member/approve/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> memberApprovePageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "membershipType", required = false) String membershipType,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            @RequestParam(value = "result", required = false) String result,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        primeCsrfToken(request);
        ExtendedModelMap model = new ExtendedModelMap();
        populateMemberApprovalList(pageIndexParam, searchKeyword, membershipType, sbscrbSttus, result, model,
                isEn ? "egovframework/com/admin/member_approve_en" : "egovframework/com/admin/member_approve",
                isEn, request, locale);
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        boolean canManage = hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode);
        response.put("canViewMemberApprove", canManage);
        response.put("canUseMemberApproveAction", canManage);
        return canManage ? ResponseEntity.ok(response) : ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
    }

    @RequestMapping(value = "/member/company-approve", method = RequestMethod.GET)
    public String companyMemberApprove(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            @RequestParam(value = "result", required = false) String result,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "company-approve");
    }

    @GetMapping("/api/admin/member/company-approve/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> companyApprovePageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            @RequestParam(value = "result", required = false) String result,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        ExtendedModelMap model = new ExtendedModelMap();
        primeCsrfToken(request);
        populateCompanyApprovalList(pageIndexParam, searchKeyword, sbscrbSttus, result, model,
                isEn ? "egovframework/com/admin/company_approve_en" : "egovframework/com/admin/company_approve",
                isEn, request, locale);
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        boolean canManage = hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode);
        response.put("canViewCompanyApprove", canManage);
        response.put("canUseCompanyApproveAction", canManage);
        return canManage ? ResponseEntity.ok(response) : ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
    }

    @RequestMapping(value = "/member/approve", method = RequestMethod.POST)
    public String member_approveSubmit(
            @RequestParam(value = "action", required = false) String action,
            @RequestParam(value = "memberId", required = false) String memberId,
            @RequestParam(value = "selectedMemberIds", required = false) List<String> selectedMemberIds,
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
        if (!hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode)) {
            String viewName = resolveMemberApprovalViewName(request, isEn);
            primeCsrfToken(request);
            model.addAttribute("memberApprovalError",
                    isEn ? "Only global administrators can approve members." : "회원 승인 처리는 전체 관리자만 수행할 수 있습니다.");
            return populateMemberApprovalList(pageIndexParam, searchKeyword, membershipType, sbscrbSttus, null, model, viewName, isEn, request, locale);
        }
        String normalizedAction = safeString(action).toLowerCase(Locale.ROOT);
        List<String> targetMemberIds = new ArrayList<>();
        String normalizedMemberId = safeString(memberId);
        if (!normalizedMemberId.isEmpty()) {
            targetMemberIds.add(normalizedMemberId);
        } else if (selectedMemberIds != null) {
            for (String selectedMemberId : selectedMemberIds) {
                String value = safeString(selectedMemberId);
                if (!value.isEmpty() && !targetMemberIds.contains(value)) {
                    targetMemberIds.add(value);
                }
            }
        }

        if (targetMemberIds.isEmpty()) {
            String viewName = resolveMemberApprovalViewName(request, isEn);
            primeCsrfToken(request);
            model.addAttribute("memberApprovalError",
                    isEn ? "No approval target was selected." : "승인 처리할 회원을 선택해 주세요.");
            return populateMemberApprovalList(pageIndexParam, searchKeyword, membershipType, sbscrbSttus, null, model, viewName, isEn, request, locale);
        }

        String targetStatus = "approve".equals(normalizedAction) || "batch_approve".equals(normalizedAction) ? "P"
                : ("reject".equals(normalizedAction) || "batch_reject".equals(normalizedAction) ? "R" : "");
        if (targetStatus.isEmpty()) {
            String viewName = resolveMemberApprovalViewName(request, isEn);
            primeCsrfToken(request);
            model.addAttribute("memberApprovalError",
                    isEn ? "The requested action is not valid." : "요청한 처리 작업이 올바르지 않습니다.");
            return populateMemberApprovalList(pageIndexParam, searchKeyword, membershipType, sbscrbSttus, null, model, viewName, isEn, request, locale);
        }

        try {
            for (String targetMemberId : targetMemberIds) {
                processMemberApprovalStatusChange(targetMemberId, targetStatus);
            }
        } catch (Exception e) {
            log.error("Failed to process member approval action. action={}, memberIds={}", normalizedAction, targetMemberIds, e);
            String viewName = resolveMemberApprovalViewName(request, isEn);
            primeCsrfToken(request);
            model.addAttribute("memberApprovalError",
                    isEn ? "An error occurred while processing the approval request." : "회원 승인 처리 중 오류가 발생했습니다.");
            return populateMemberApprovalList(pageIndexParam, searchKeyword, membershipType, sbscrbSttus, null, model, viewName, isEn, request, locale);
        }

        StringBuilder redirect = new StringBuilder();
        redirect.append("redirect:").append(resolveMemberApprovalBasePath(request, locale)).append("?result=");
        if ("P".equals(targetStatus)) {
            redirect.append(targetMemberIds.size() > 1 ? "batchApproved" : "approved");
        } else {
            redirect.append(targetMemberIds.size() > 1 ? "batchRejected" : "rejected");
        }
        appendApprovalRedirectQuery(redirect, "pageIndex", pageIndexParam);
        appendApprovalRedirectQuery(redirect, "searchKeyword", searchKeyword);
        appendApprovalRedirectQuery(redirect, "membershipType", membershipType);
        appendApprovalRedirectQuery(redirect, "sbscrbSttus", sbscrbSttus);
        return redirect.toString();
    }

    @RequestMapping(value = "/member/company-approve", method = RequestMethod.POST)
    public String companyMemberApproveSubmit(
            @RequestParam(value = "action", required = false) String action,
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "selectedInsttIds", required = false) List<String> selectedInsttIds,
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        String normalizedAction = safeString(action).toLowerCase(Locale.ROOT);
        List<String> targetInsttIds = new ArrayList<>();
        String normalizedInsttId = safeString(insttId);
        if (!normalizedInsttId.isEmpty()) {
            targetInsttIds.add(normalizedInsttId);
        } else if (selectedInsttIds != null) {
            for (String selectedInsttId : selectedInsttIds) {
                String value = safeString(selectedInsttId);
                if (!value.isEmpty() && !targetInsttIds.contains(value)) {
                    targetInsttIds.add(value);
                }
            }
        }

        String viewName = isEn ? "egovframework/com/admin/company_approve_en" : "egovframework/com/admin/company_approve";
        if (!hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode)) {
            primeCsrfToken(request);
            model.addAttribute("memberApprovalError",
                    isEn ? "Only global administrators can approve companies." : "회원사 승인 처리는 전체 관리자만 수행할 수 있습니다.");
            return populateCompanyApprovalList(pageIndexParam, searchKeyword, sbscrbSttus, null, model, viewName, isEn, request, locale);
        }
        if (targetInsttIds.isEmpty()) {
            primeCsrfToken(request);
            model.addAttribute("memberApprovalError",
                    isEn ? "No company was selected for approval." : "승인 처리할 회원사를 선택해 주세요.");
            return populateCompanyApprovalList(pageIndexParam, searchKeyword, sbscrbSttus, null, model, viewName, isEn, request, locale);
        }

        String targetStatus = "approve".equals(normalizedAction) || "batch_approve".equals(normalizedAction) ? "P"
                : ("reject".equals(normalizedAction) || "batch_reject".equals(normalizedAction) ? "R" : "");
        if (targetStatus.isEmpty()) {
            primeCsrfToken(request);
            model.addAttribute("memberApprovalError",
                    isEn ? "The requested action is not valid." : "요청한 처리 작업이 올바르지 않습니다.");
            return populateCompanyApprovalList(pageIndexParam, searchKeyword, sbscrbSttus, null, model, viewName, isEn, request, locale);
        }

        try {
            for (String targetInsttId : targetInsttIds) {
                processCompanyApprovalStatusChange(targetInsttId, targetStatus);
            }
        } catch (Exception e) {
            log.error("Failed to process company approval action. action={}, insttIds={}", normalizedAction, targetInsttIds, e);
            primeCsrfToken(request);
            model.addAttribute("memberApprovalError",
                    isEn ? "An error occurred while processing the company approval request." : "회원사 승인 처리 중 오류가 발생했습니다.");
            return populateCompanyApprovalList(pageIndexParam, searchKeyword, sbscrbSttus, null, model, viewName, isEn, request, locale);
        }

        StringBuilder redirect = new StringBuilder();
        redirect.append("redirect:").append(adminPrefix(request, locale)).append("/member/company-approve?result=");
        if ("P".equals(targetStatus)) {
            redirect.append(targetInsttIds.size() > 1 ? "batchApproved" : "approved");
        } else {
            redirect.append(targetInsttIds.size() > 1 ? "batchRejected" : "rejected");
        }
        appendApprovalRedirectQuery(redirect, "pageIndex", pageIndexParam);
        appendApprovalRedirectQuery(redirect, "searchKeyword", searchKeyword);
        appendApprovalRedirectQuery(redirect, "sbscrbSttus", sbscrbSttus);
        return redirect.toString();
    }

    @PostMapping("/api/admin/member/approve/action")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> memberApproveSubmitApi(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        Map<String, Object> response = new LinkedHashMap<>();
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        if (!hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode)) {
            response.put("success", false);
            response.put("message", isEn ? "Only global administrators can approve members." : "회원 승인 처리는 전체 관리자만 수행할 수 있습니다.");
            return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
        }
        String normalizedAction = safeString(payload.get("action") == null ? null : payload.get("action").toString()).toLowerCase(Locale.ROOT);
        List<String> targetMemberIds = extractPayloadIds(payload.get("selectedIds"), payload.get("memberId") == null ? null : payload.get("memberId").toString());
        if (targetMemberIds.isEmpty()) {
            response.put("success", false);
            response.put("message", isEn ? "No approval target was selected." : "승인 처리할 회원을 선택해 주세요.");
            return ResponseEntity.badRequest().body(response);
        }
        String targetStatus = "approve".equals(normalizedAction) || "batch_approve".equals(normalizedAction) ? "P"
                : ("reject".equals(normalizedAction) || "batch_reject".equals(normalizedAction) ? "R" : "");
        if (targetStatus.isEmpty()) {
            response.put("success", false);
            response.put("message", isEn ? "The requested action is not valid." : "요청한 처리 작업이 올바르지 않습니다.");
            return ResponseEntity.badRequest().body(response);
        }
        try {
            for (String targetMemberId : targetMemberIds) {
                processMemberApprovalStatusChange(targetMemberId, targetStatus);
            }
        } catch (Exception e) {
            log.error("Failed to process member approval action api. action={}, memberIds={}", normalizedAction, targetMemberIds, e);
            response.put("success", false);
            response.put("message", isEn ? "An error occurred while processing the approval request." : "회원 승인 처리 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
        response.put("success", true);
        response.put("result", "P".equals(targetStatus)
                ? (targetMemberIds.size() > 1 ? "batchApproved" : "approved")
                : (targetMemberIds.size() > 1 ? "batchRejected" : "rejected"));
        response.put("selectedIds", targetMemberIds);
        recordApprovalAuditSafely(request, currentUserId, currentUserAuthorCode, "AMENU_MEMBER_APPROVE", "member-approve",
                "MEMBER_APPROVAL_" + ("P".equals(targetStatus) ? "APPROVE" : "REJECT"),
                "MEMBER", targetMemberIds.toString(), "SUCCESS",
                "{\"action\":\"" + normalizedAction + "\",\"selectedIds\":\"" + safeJson(targetMemberIds.toString()) + "\"}",
                "{\"targetStatus\":\"" + targetStatus + "\"}");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/admin/member/company-approve/action")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> companyApproveSubmitApi(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        Map<String, Object> response = new LinkedHashMap<>();
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        if (!hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode)) {
            response.put("success", false);
            response.put("message", isEn ? "Only global administrators can approve companies." : "회원사 승인 처리는 전체 관리자만 수행할 수 있습니다.");
            return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
        }
        String normalizedAction = safeString(payload.get("action") == null ? null : payload.get("action").toString()).toLowerCase(Locale.ROOT);
        List<String> targetInsttIds = extractPayloadIds(payload.get("selectedIds"), payload.get("insttId") == null ? null : payload.get("insttId").toString());
        if (targetInsttIds.isEmpty()) {
            response.put("success", false);
            response.put("message", isEn ? "No company was selected for approval." : "승인 처리할 회원사를 선택해 주세요.");
            return ResponseEntity.badRequest().body(response);
        }
        String targetStatus = "approve".equals(normalizedAction) || "batch_approve".equals(normalizedAction) ? "P"
                : ("reject".equals(normalizedAction) || "batch_reject".equals(normalizedAction) ? "R" : "");
        if (targetStatus.isEmpty()) {
            response.put("success", false);
            response.put("message", isEn ? "The requested action is not valid." : "요청한 처리 작업이 올바르지 않습니다.");
            return ResponseEntity.badRequest().body(response);
        }
        try {
            for (String targetInsttId : targetInsttIds) {
                processCompanyApprovalStatusChange(targetInsttId, targetStatus);
            }
        } catch (Exception e) {
            log.error("Failed to process company approval action api. action={}, insttIds={}", normalizedAction, targetInsttIds, e);
            response.put("success", false);
            response.put("message", isEn ? "An error occurred while processing the company approval request." : "회원사 승인 처리 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
        response.put("success", true);
        response.put("result", "P".equals(targetStatus)
                ? (targetInsttIds.size() > 1 ? "batchApproved" : "approved")
                : (targetInsttIds.size() > 1 ? "batchRejected" : "rejected"));
        response.put("selectedIds", targetInsttIds);
        recordApprovalAuditSafely(request, currentUserId, currentUserAuthorCode, "AMENU_COMPANY_APPROVE", "company-approve",
                "COMPANY_APPROVAL_" + ("P".equals(targetStatus) ? "APPROVE" : "REJECT"),
                "COMPANY", targetInsttIds.toString(), "SUCCESS",
                "{\"action\":\"" + normalizedAction + "\",\"selectedIds\":\"" + safeJson(targetInsttIds.toString()) + "\"}",
                "{\"targetStatus\":\"" + targetStatus + "\"}");
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/member/edit", method = RequestMethod.GET)
    public String member_edit(
            @RequestParam(value = "memberId", required = false) String memberId,
            @RequestParam(value = "updated", required = false) String updated,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "member-edit");
    }

    @GetMapping("/api/admin/member/edit")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> memberEditApi(
            @RequestParam(value = "memberId", required = false) String memberId,
            @RequestParam(value = "updated", required = false) String updated,
            HttpServletRequest request, Locale locale) {
        Map<String, Object> response = new LinkedHashMap<>();
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedMemberId = safeString(memberId);
        ExtendedModelMap model = new ExtendedModelMap();
        model.addAttribute("memberId", normalizedMemberId);
        model.addAttribute("member_editUpdated", "true".equalsIgnoreCase(safeString(updated)));
        primeCsrfToken(request);
        ensureMemberEditDefaults(model, isEn);

        if (normalizedMemberId.isEmpty()) {
            model.addAttribute("member_editError", isEn ? "Member ID was not provided." : "회원 ID가 전달되지 않았습니다.");
        } else {
            try {
                EntrprsManageVO member = entrprsManageService.selectEntrprsmberByMberId(normalizedMemberId);
                if (member == null || safeString(member.getEntrprsmberId()).isEmpty()) {
                    model.addAttribute("member_editError", isEn ? "Member information was not found." : "회원 정보를 찾을 수 없습니다.");
                } else if (!canCurrentAdminAccessMember(request, member)) {
                    model.addAttribute("member_editError", isEn
                            ? "You can only edit members in your own company."
                            : "본인 회사 소속 회원만 수정할 수 있습니다.");
                } else {
                    populateMemberEditModel(model, member, isEn, extractCurrentUserId(request));
                }
            } catch (Exception e) {
                log.error("Failed to load member edit page api. memberId={}", normalizedMemberId, e);
                model.addAttribute("member_editError", isEn ? "An error occurred while retrieving member information." : "회원 정보 조회 중 오류가 발생했습니다.");
            }
        }

        response.putAll(model);
        response.put("canViewMemberEdit", !safeString((String) model.get("member_editError")).contains("본인 회사"));
        response.put("canUseMemberSave", ObjectUtils.isEmpty(model.get("member_editError")));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/admin/member/edit")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> memberEditSubmitApi(
            @RequestBody AdminMemberEditSaveRequestDTO payload,
            HttpServletRequest request,
            Locale locale) {
        Map<String, Object> response = new LinkedHashMap<>();
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedMemberId = safeString(payload == null ? null : payload.getMemberId());

        if (normalizedMemberId.isEmpty()) {
            response.put("success", false);
            response.put("message", isEn ? "Member ID was not provided." : "회원 ID가 전달되지 않았습니다.");
            return ResponseEntity.badRequest().body(response);
        }

        EntrprsManageVO member;
        try {
            member = entrprsManageService.selectEntrprsmberByMberId(normalizedMemberId);
        } catch (Exception e) {
            log.error("Failed to load member for edit submit api. memberId={}", normalizedMemberId, e);
            response.put("success", false);
            response.put("message", isEn ? "An error occurred while retrieving member information." : "회원 정보 조회 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }

        if (member == null || safeString(member.getEntrprsmberId()).isEmpty()) {
            response.put("success", false);
            response.put("message", isEn ? "Member information was not found." : "회원 정보를 찾을 수 없습니다.");
            return ResponseEntity.badRequest().body(response);
        }
        if (!canCurrentAdminAccessMember(request, member)) {
            response.put("success", false);
            response.put("message", isEn
                    ? "You can only edit members in your own company."
                    : "본인 회사 소속 회원만 수정할 수 있습니다.");
            return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
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
            permissionAuthorGroups = authGroupManageService.selectAuthorList();
            if (normalizedAuthorCode.isEmpty()) {
                errors.add(isEn ? "Please select a role." : "권한 롤을 선택해 주세요.");
            } else if (!containsAuthorCode(permissionAuthorGroups, normalizedAuthorCode)) {
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
            response.put("success", false);
            response.put("errors", errors);
            return ResponseEntity.badRequest().body(response);
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
            response.put("success", false);
            response.put("message", isEn ? "An error occurred while saving member information." : "회원 정보 저장 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }

        response.put("success", true);
        response.put("memberId", normalizedMemberId);
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
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/member/edit", method = RequestMethod.POST)
    public String member_editSubmit(
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
            permissionAuthorGroups = authGroupManageService.selectAuthorList();
            if (normalizedAuthorCode.isEmpty()) {
                errors.add(isEn ? "Please select a role." : "권한 롤을 선택해 주세요.");
            } else if (!containsAuthorCode(permissionAuthorGroups, normalizedAuthorCode)) {
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
            } catch (Exception inner) {
                log.error("Failed to populate member edit model (save error). memberId={}", normalizedMemberId, inner);
                ensureMemberEditDefaults(model, isEn);
            }
            model.addAttribute("member_editError", isEn ? "An error occurred while saving member information." : "회원 정보 저장 중 오류가 발생했습니다.");
            return viewName;
        }
    }

    @RequestMapping(value = "/member/file", method = RequestMethod.GET)
    public void memberFile(
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

    @RequestMapping(value = "/member/detail", method = { RequestMethod.GET, RequestMethod.POST })
    public String member_detail(
            @RequestParam(value = "memberId", required = false) String memberId,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "member-detail");
    }

    @GetMapping("/api/admin/member/detail/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> memberDetailPageApi(
            @RequestParam(value = "memberId", required = false) String memberId,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        ExtendedModelMap model = new ExtendedModelMap();
        primeCsrfToken(request);
        String viewName = isEn ? "egovframework/com/admin/member_detail_en" : "egovframework/com/admin/member_detail";
        member_detail(memberId, request, locale, model);
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        response.put("viewName", viewName);
        response.put("canViewMemberDetail", model.getAttribute("member") != null && model.getAttribute("member_detailError") == null);
        response.put("canUseMemberEditLink", model.getAttribute("member") != null && model.getAttribute("member_detailError") == null);
        return model.getAttribute("member") != null && model.getAttribute("member_detailError") == null
                ? ResponseEntity.ok(response)
                : ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
    }

    @RequestMapping(value = "/member/reset_password", method = RequestMethod.GET)
    public String member_resetPassword(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "resetSource", required = false) String resetSource,
            @RequestParam(value = "memberId", required = false) String memberId,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "password-reset");
    }

    @GetMapping("/api/admin/member/reset-password")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> memberResetPasswordPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "resetSource", required = false) String resetSource,
            @RequestParam(value = "memberId", required = false) String memberId,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        ExtendedModelMap model = new ExtendedModelMap();
        primeCsrfToken(request);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        if (requiresOwnCompanyAccess(currentUserId, currentUserAuthorCode) && safeString(memberId).isEmpty()) {
            model.addAttribute("passwordResetError", isEn
                    ? "Member ID is required for company-scoped administrators."
                    : "회사 범위 관리자에게는 회원 ID가 필요합니다.");
        } else {
            populatePasswordResetHistory(pageIndexParam, preferredResetHistoryKeyword(memberId, searchKeyword),
                    resetSource, model, "", isEn);
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        response.put("canViewResetHistory", true);
        response.put("canUseResetPassword", !requiresOwnCompanyAccess(currentUserId, currentUserAuthorCode) || !safeString(memberId).isEmpty());
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/member/reset_password", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> resetMemberPassword(
            @RequestParam(value = "memberId", required = false) String memberId,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        Map<String, Object> response = new LinkedHashMap<>();

        String normalizedMemberId = safeString(memberId);
        if (normalizedMemberId.isEmpty()) {
            response.put("status", "fail");
            response.put("errors", isEn ? "Member ID was not provided." : "회원 ID가 전달되지 않았습니다.");
            return ResponseEntity.badRequest().body(response);
        }

        String temporaryPassword = buildTemporaryPassword();
        String currentAdminUserId = safeString(extractCurrentUserId(request));
        String clientIp = safeString(ClientIpUtil.getClientIp());

        try {
            EntrprsManageVO member = entrprsManageService.selectEntrprsmberByMberId(normalizedMemberId);
            if (member == null || safeString(member.getEntrprsmberId()).isEmpty()) {
                response.put("status", "fail");
                response.put("errors", isEn ? "No matching user was found." : "일치하는 사용자를 찾을 수 없습니다.");
                return ResponseEntity.ok(response);
            }
            if (!canCurrentAdminAccessMember(request, member)) {
                response.put("status", "fail");
                response.put("errors", isEn
                        ? "You can only reset passwords for members in your own company."
                        : "본인 회사 소속 회원만 비밀번호를 초기화할 수 있습니다.");
                return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
            }
            boolean updated = authService.resetPassword(
                    normalizedMemberId,
                    temporaryPassword,
                    currentAdminUserId,
                    clientIp,
                    "ADMIN_MEMBER_RESET");
            if (!updated) {
                response.put("status", "fail");
                response.put("errors", isEn ? "No matching user was found." : "일치하는 사용자를 찾을 수 없습니다.");
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            log.error("Failed to reset member password. memberId={}, adminId={}", normalizedMemberId, currentAdminUserId, e);
            response.put("status", "fail");
            response.put("errors", isEn ? "Failed to reset the password." : "비밀번호 초기화에 실패했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }

        response.put("status", "success");
        response.put("temporaryPassword", temporaryPassword);
        response.put("message", isEn ? "The password has been reset." : "비밀번호가 초기화되었습니다.");
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
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = { "/member/admin_account" }, method = RequestMethod.GET)
    public String admin_account(
            @RequestParam(value = "emplyrId", required = false) String emplyrId,
            @RequestParam(value = "updated", required = false) String updated,
            @RequestParam(value = "mode", required = false) String mode,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, safeString(emplyrId).isEmpty() ? "admin-create" : "admin-permission");
    }

    @GetMapping("/api/admin/member/admin-account/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> adminAccountCreatePageApi(
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        ExtendedModelMap model = new ExtendedModelMap();
        primeCsrfToken(request);
        ensureAdminAccountCreateDefaults(model, isEn);
        populateAdminAccountCreatePageModel(model, isEn);
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        response.put("currentUserId", currentUserId);
        response.put("canViewAdminAccountCreate", true);
        response.put("canUseAdminAccountCreate", isWebmaster(currentUserId));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/admin/member/admin-account/check-id")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> adminAccountCheckIdApi(
            @RequestParam(value = "adminId", required = false) String adminId,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        Map<String, Object> response = new LinkedHashMap<>();
        String normalizedAdminId = safeString(adminId);
        if (normalizedAdminId.isEmpty()) {
            response.put("valid", false);
            response.put("duplicated", false);
            response.put("message", isEn ? "Administrator ID is required." : "관리자 ID를 입력해 주세요.");
            return ResponseEntity.badRequest().body(response);
        }
        if (!normalizedAdminId.matches("^[A-Za-z0-9]{6,16}$")) {
            response.put("valid", false);
            response.put("duplicated", false);
            response.put("message", isEn
                    ? "Use 6 to 16 letters or numbers for the administrator ID."
                    : "관리자 ID는 영문/숫자 6~16자로 입력해 주세요.");
            return ResponseEntity.badRequest().body(response);
        }
        boolean duplicated;
        try {
            duplicated = userManageService.checkIdDplct(normalizedAdminId) > 0;
        } catch (Exception e) {
            log.error("Failed to check admin id duplication. adminId={}", normalizedAdminId, e);
            response.put("valid", false);
            response.put("duplicated", false);
            response.put("message", isEn
                    ? "An error occurred while checking the administrator ID."
                    : "관리자 ID 중복 확인 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
        response.put("valid", !duplicated);
        response.put("duplicated", duplicated);
        response.put("message", duplicated
                ? (isEn ? "This administrator ID is already in use." : "이미 사용 중인 관리자 ID입니다.")
                : (isEn ? "This administrator ID is available." : "사용 가능한 관리자 ID입니다."));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/admin/companies/search")
    @ResponseBody
    public ResponseEntity<CompanySearchResponseDTO> adminCompanySearchApi(
            @RequestParam(value = "keyword", defaultValue = "") String keyword,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "5") int size,
            @RequestParam(value = "status", defaultValue = "P") String status,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        if (!isWebmaster(currentUserId) && !hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode)) {
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

    @PostMapping("/api/admin/member/admin-account")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> adminAccountCreateSubmitApi(
            @RequestBody AdminAdminAccountCreateRequestDTO payload,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        Map<String, Object> response = new LinkedHashMap<>();
        String currentUserId = extractCurrentUserId(request);
        if (!isWebmaster(currentUserId)) {
            response.put("success", false);
            response.put("message", isEn
                    ? "Only webmaster can create administrator accounts."
                    : "webmaster만 관리자 계정을 생성할 수 있습니다.");
            return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
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
        String authorCode = resolveAdminPresetAuthorCode(rolePreset);
        List<String> featureCodes = normalizeFeatureCodes(payload == null ? null : payload.getFeatureCodes());

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
        if (!"MASTER".equals(rolePreset) && insttId.isEmpty()) {
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
        if (!insttId.isEmpty()) {
            institutionInfo = loadInstitutionInfoByInsttId(insttId);
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
            response.put("success", false);
            response.put("errors", errors);
            return ResponseEntity.badRequest().body(response);
        }

        String fullPhone = buildPhoneNumber(phone1, phone2, phone3);
        try {
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
            userManageVO.setOrgnztId(insttId);
            userManageVO.setOfcpsNm(deptNm);
            userManageVO.setGroupId(insttId);
            userManageVO.setLockAt("N");
            userManageVO.setPasswordHint("");
            userManageVO.setPasswordCnsr("");
            userManageService.insertUser(userManageVO);

            Optional<EmplyrInfo> savedAdminOpt = employMemberRepository.findById(adminId);
            if (!savedAdminOpt.isPresent()) {
                throw new IllegalStateException("Administrator account insert verification failed.");
            }
            EmplyrInfo savedAdmin = savedAdminOpt.get();
            savedAdmin.setInsttId(insttId);
            savedAdmin.setOrgnztId(insttId);
            savedAdmin.setGroupId(insttId);
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
            response.put("success", true);
            response.put("emplyrId", adminId);
            response.put("authorCode", authorCode);
            response.put("insttId", insttId);
            response.put("companyName", institutionInfo == null ? "" : safeString(institutionInfo.getInsttNm()));
            recordAdminActionAudit(request,
                    currentUserId,
                    resolveCurrentUserAuthorCode(currentUserId),
                    "AMENU_ADMIN_CREATE",
                    "admin-create",
                    "ADMIN_ACCOUNT_CREATE",
                    "ADMIN",
                    adminId,
                    "{\"adminId\":\"" + safeJson(adminId) + "\",\"authorCode\":\"" + safeJson(authorCode) + "\",\"insttId\":\"" + safeJson(insttId) + "\"}",
                    "{\"status\":\"SUCCESS\"}");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to create admin account. adminId={}, authorCode={}", adminId, authorCode, e);
            response.put("success", false);
            response.put("message", isEn
                    ? "An error occurred while creating the administrator account."
                    : "관리자 계정 생성 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/api/admin/member/admin-account/permissions")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> adminAccountPermissionApi(
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
        if (!normalizedEmplyrId.isEmpty()) {
            try {
                Optional<EmplyrInfo> adminMemberOpt = employMemberRepository.findById(normalizedEmplyrId);
                if (!adminMemberOpt.isPresent()) {
                    model.addAttribute("adminPermissionError", isEn
                            ? "Administrator information was not found."
                            : "관리자 정보를 찾을 수 없습니다.");
                } else {
                    populateAdminAccountEditModel(model, adminMemberOpt.get(), isEn, null, extractCurrentUserId(request));
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
        response.put("canViewAdminPermissionEdit", !normalizedEmplyrId.isEmpty());
        response.put("canUseAdminPermissionSave", isWebmaster(extractCurrentUserId(request)) && !Boolean.TRUE.equals(model.getAttribute("adminAccountReadOnly")));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/admin/member/admin-account/permissions")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> adminAccountPermissionsSubmitApi(
            @RequestBody AdminPermissionSaveRequestDTO payload,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        Map<String, Object> response = new LinkedHashMap<>();
        String currentUserId = extractCurrentUserId(request);
        if (!isWebmaster(currentUserId)) {
            response.put("success", false);
            response.put("message", isEn
                    ? "Only webmaster can change administrator permissions."
                    : "webmaster만 관리자 권한을 변경할 수 있습니다.");
            return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
        }

        String normalizedEmplyrId = safeString(payload == null ? null : payload.getEmplyrId());
        String normalizedAuthorCode = safeString(payload == null ? null : payload.getAuthorCode()).toUpperCase(Locale.ROOT);
        List<String> normalizedFeatureCodes = normalizeFeatureCodes(payload == null ? null : payload.getFeatureCodes());
        if (normalizedEmplyrId.isEmpty()) {
            response.put("success", false);
            response.put("message", isEn ? "Administrator ID was not provided." : "관리자 ID가 전달되지 않았습니다.");
            return ResponseEntity.badRequest().body(response);
        }

        Optional<EmplyrInfo> adminMemberOpt;
        try {
            adminMemberOpt = employMemberRepository.findById(normalizedEmplyrId);
        } catch (Exception e) {
            log.error("Failed to load admin for permission submit api. emplyrId={}", normalizedEmplyrId, e);
            response.put("success", false);
            response.put("message", isEn
                    ? "An error occurred while retrieving administrator information."
                    : "관리자 정보 조회 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
        if (!adminMemberOpt.isPresent()) {
            response.put("success", false);
            response.put("message", isEn ? "Administrator information was not found." : "관리자 정보를 찾을 수 없습니다.");
            return ResponseEntity.badRequest().body(response);
        }

        EmplyrInfo adminMember = adminMemberOpt.get();
        List<String> errors = new ArrayList<>();
        List<AuthorInfoVO> authorGroups = Collections.emptyList();
        List<String> baselineFeatureCodes = Collections.emptyList();
        try {
            authorGroups = filterAuthorGroups(authGroupManageService.selectAuthorList(), "GENERAL");
            if (normalizedAuthorCode.isEmpty()) {
                errors.add(isEn ? "Please select an administrator role." : "관리자 권한 롤을 선택해 주세요.");
            } else if (!containsAuthorCode(authorGroups, normalizedAuthorCode)) {
                errors.add(isEn ? "Please select a valid administrator role." : "유효한 관리자 권한 롤을 선택해 주세요.");
            } else {
                baselineFeatureCodes = normalizeFeatureCodes(authGroupManageService.selectAuthorFeatureCodes(normalizedAuthorCode));
            }
            if ("webmaster".equalsIgnoreCase(normalizedEmplyrId) && !ROLE_SYSTEM_MASTER.equalsIgnoreCase(normalizedAuthorCode)) {
                errors.add(isEn ? "webmaster must keep ROLE_SYSTEM_MASTER." : "webmaster 계정은 ROLE_SYSTEM_MASTER만 유지할 수 있습니다.");
            }
        } catch (Exception e) {
            log.error("Failed to load permission data for admin edit api. emplyrId={}", normalizedEmplyrId, e);
            errors.add(isEn ? "Failed to load role and feature information." : "권한 롤 및 기능 정보를 불러오지 못했습니다.");
        }
        if (!errors.isEmpty()) {
            response.put("success", false);
            response.put("errors", errors);
            return ResponseEntity.badRequest().body(response);
        }

        try {
            authGroupManageService.updateAdminRoleAssignment(normalizedEmplyrId, normalizedAuthorCode);
            savePermissionOverrides(
                    safeString(adminMember.getEsntlId()),
                    "USR03",
                    baselineFeatureCodes,
                    normalizedFeatureCodes,
                    currentUserId,
                    resolveGrantableFeatureCodeSet(currentUserId, true));
        } catch (Exception e) {
            log.error("Failed to save admin account permissions api. emplyrId={}, authorCode={}", normalizedEmplyrId, normalizedAuthorCode, e);
            response.put("success", false);
            response.put("message", isEn
                    ? "An error occurred while saving administrator permissions."
                    : "관리자 권한 저장 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }

        response.put("success", true);
        response.put("emplyrId", normalizedEmplyrId);
        response.put("authorCode", normalizedAuthorCode);
        recordAdminActionAudit(request,
                currentUserId,
                resolveCurrentUserAuthorCode(currentUserId),
                "AMENU_ADMIN_PERMISSION",
                "admin-permission",
                "ADMIN_PERMISSION_SAVE",
                "ADMIN",
                normalizedEmplyrId,
                "{\"emplyrId\":\"" + safeJson(normalizedEmplyrId) + "\",\"authorCode\":\"" + safeJson(normalizedAuthorCode) + "\"}",
                "{\"status\":\"SUCCESS\"}");
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = { "/member/admin_account/permissions" }, method = RequestMethod.POST)
    public String admin_accountPermissionsSubmit(
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
        if (!isWebmaster(currentUserId)) {
            model.addAttribute("adminPermissionError", isEn
                    ? "Only webmaster can change administrator permissions."
                    : "webmaster만 관리자 권한을 변경할 수 있습니다.");
            return viewName;
        }

        String normalizedEmplyrId = safeString(emplyrId);
        String normalizedAuthorCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        List<String> normalizedFeatureCodes = normalizeFeatureCodes(featureCodes);
        if (normalizedEmplyrId.isEmpty()) {
            model.addAttribute("adminPermissionError", isEn
                    ? "Administrator ID was not provided."
                    : "관리자 ID가 전달되지 않았습니다.");
            return viewName;
        }

        Optional<EmplyrInfo> adminMemberOpt;
        try {
            adminMemberOpt = employMemberRepository.findById(normalizedEmplyrId);
        } catch (Exception e) {
            log.error("Failed to load admin for permission submit. emplyrId={}", normalizedEmplyrId, e);
            model.addAttribute("adminPermissionError", isEn
                    ? "An error occurred while retrieving administrator information."
                    : "관리자 정보 조회 중 오류가 발생했습니다.");
            return viewName;
        }
        if (!adminMemberOpt.isPresent()) {
            model.addAttribute("adminPermissionError", isEn
                    ? "Administrator information was not found."
                    : "관리자 정보를 찾을 수 없습니다.");
            return viewName;
        }

        EmplyrInfo adminMember = adminMemberOpt.get();
        List<String> errors = new ArrayList<>();
        List<AuthorInfoVO> authorGroups = Collections.emptyList();
        List<String> baselineFeatureCodes = Collections.emptyList();
        try {
            authorGroups = filterAuthorGroups(authGroupManageService.selectAuthorList(), "GENERAL");
            if (normalizedAuthorCode.isEmpty()) {
                errors.add(isEn ? "Please select an administrator role." : "관리자 권한 롤을 선택해 주세요.");
            } else if (!containsAuthorCode(authorGroups, normalizedAuthorCode)) {
                errors.add(isEn ? "Please select a valid administrator role." : "유효한 관리자 권한 롤을 선택해 주세요.");
            } else {
                baselineFeatureCodes = normalizeFeatureCodes(authGroupManageService.selectAuthorFeatureCodes(normalizedAuthorCode));
            }
            if ("webmaster".equalsIgnoreCase(normalizedEmplyrId) && !ROLE_SYSTEM_MASTER.equalsIgnoreCase(normalizedAuthorCode)) {
                errors.add(isEn ? "webmaster must keep ROLE_SYSTEM_MASTER." : "webmaster 계정은 ROLE_SYSTEM_MASTER만 유지할 수 있습니다.");
            }
        } catch (Exception e) {
            log.error("Failed to load permission data for admin edit. emplyrId={}", normalizedEmplyrId, e);
            errors.add(isEn ? "Failed to load role and feature information." : "권한 롤 및 기능 정보를 불러오지 못했습니다.");
        }

        if (!errors.isEmpty()) {
            try {
                populateAdminAccountEditModel(model, adminMember, isEn, normalizedFeatureCodes, currentUserId);
            } catch (Exception e) {
                log.error("Failed to populate admin account edit model (validation errors). emplyrId={}", normalizedEmplyrId, e);
                ensureAdminAccountDefaults(model, isEn);
            }
            model.addAttribute("adminPermissionErrors", errors);
            return viewName;
        }

        try {
            authGroupManageService.updateAdminRoleAssignment(normalizedEmplyrId, normalizedAuthorCode);
            savePermissionOverrides(
                    safeString(adminMember.getEsntlId()),
                    "USR03",
                    baselineFeatureCodes,
                    normalizedFeatureCodes,
                    currentUserId,
                    resolveGrantableFeatureCodeSet(currentUserId, true));
            return "redirect:" + adminPrefix(request, locale) + "/member/admin_account?emplyrId=" + urlEncode(normalizedEmplyrId) + "&updated=true";
        } catch (Exception e) {
            log.error("Failed to save admin account permissions. emplyrId={}, authorCode={}", normalizedEmplyrId, normalizedAuthorCode, e);
            try {
                populateAdminAccountEditModel(model, adminMember, isEn, normalizedFeatureCodes, currentUserId);
            } catch (Exception inner) {
                log.error("Failed to populate admin account edit model (save error). emplyrId={}", normalizedEmplyrId, inner);
                ensureAdminAccountDefaults(model, isEn);
            }
            model.addAttribute("adminPermissionError", isEn
                    ? "An error occurred while saving administrator permissions."
                    : "관리자 권한 저장 중 오류가 발생했습니다.");
            return viewName;
        }
    }

    @RequestMapping(value = "/member/list", method = { RequestMethod.GET, RequestMethod.POST })
    public String member_list(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "membershipType", required = false) String membershipType,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "member-list");
    }

    @GetMapping("/api/admin/member/list/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> memberListPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "membershipType", required = false) String membershipType,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        ExtendedModelMap model = new ExtendedModelMap();
        primeCsrfToken(request);
        populateMemberList(pageIndexParam, searchKeyword, membershipType, sbscrbSttus, model,
                isEn ? "egovframework/com/admin/member_list_en" : "egovframework/com/admin/member_list",
                request);
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        response.put("canViewMemberList", true);
        response.put("canUseMemberListActions", true);
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = { "/member/admin_list", "/member/admin-list" }, method = { RequestMethod.GET, RequestMethod.POST })
    public String admin_list(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "admin-list");
    }

    @RequestMapping(value = "/member/company_list", method = { RequestMethod.GET, RequestMethod.POST })
    public String company_list(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "company-list");
    }

    @GetMapping("/api/admin/member/admin-list/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> adminListPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        ExtendedModelMap model = new ExtendedModelMap();
        primeCsrfToken(request);
        populateAdminMemberList(pageIndexParam, searchKeyword, sbscrbSttus, model,
                isEn ? "egovframework/com/admin/admin_list_en" : "egovframework/com/admin/admin_list");
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        response.put("canViewAdminList", true);
        response.put("canUseAdminListActions", isWebmaster(extractCurrentUserId(request)));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/admin/member/company-list/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> companyListPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        ExtendedModelMap model = new ExtendedModelMap();
        primeCsrfToken(request);
        String viewName = isEn ? "egovframework/com/admin/company_list_en" : "egovframework/com/admin/company_list";
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        boolean canView = hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode);
        if (canView) {
            populateCompanyList(pageIndexParam, searchKeyword, sbscrbSttus, model, viewName, request);
        } else {
            model.addAttribute("company_listError", isEn ? "Only global administrators can view the company list." : "회원사 목록은 전체 관리자만 조회할 수 있습니다.");
            model.addAttribute("company_list", Collections.emptyList());
            model.addAttribute("totalCount", 0);
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        response.put("canViewCompanyList", canView);
        response.put("canUseCompanyListActions", canView);
        return canView ? ResponseEntity.ok(response) : ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
    }

    @RequestMapping(value = "/emission/result_list", method = { RequestMethod.GET, RequestMethod.POST })
    public String emission_result_list(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "resultStatus", required = false) String resultStatus,
            @RequestParam(value = "verificationStatus", required = false) String verificationStatus,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "emission-result-list");
    }

    @GetMapping("/emission/result_list/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> emissionResultListPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "resultStatus", required = false) String resultStatus,
            @RequestParam(value = "verificationStatus", required = false) String verificationStatus,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        primeCsrfToken(request);
        ExtendedModelMap model = new ExtendedModelMap();
        populateEmissionResultList(pageIndexParam, searchKeyword, resultStatus, verificationStatus, model,
                isEn ? "egovframework/com/admin/emission_result_list_en"
                        : "egovframework/com/admin/emission_result_list",
                isEn);
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        response.put("isEn", isEn);
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/member/company_detail", method = RequestMethod.GET)
    public String company_detail(
            @RequestParam(value = "insttId", required = false) String insttId,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "company-detail");
    }

    @GetMapping("/api/admin/member/company-detail/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> companyDetailPageApi(
            @RequestParam(value = "insttId", required = false) String insttId,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        ExtendedModelMap model = new ExtendedModelMap();
        primeCsrfToken(request);
        company_detail(insttId, request, locale, model);
        Map<String, Object> response = new LinkedHashMap<>();
        response.putAll(model);
        boolean canView = model.getAttribute("company") != null && model.getAttribute("companyDetailError") == null;
        response.put("canViewCompanyDetail", canView);
        response.put("canUseCompanyEditLink", canView);
        return canView ? ResponseEntity.ok(response) : ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
    }

    @RequestMapping(value = "/member/company_account", method = RequestMethod.GET)
    public String company_account(
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "saved", required = false) String saved,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "company-account");
    }

    @GetMapping("/api/admin/member/company-account/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> companyAccountPageApi(
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "saved", required = false) String saved,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        Map<String, Object> response = new LinkedHashMap<>();
        if (!hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode)) {
            response.put("companyAccountErrors", Collections.singletonList(
                    isEn ? "Only global administrators can manage company accounts." : "회원사 관리는 전체 관리자만 처리할 수 있습니다."));
            response.put("canViewCompanyAccount", false);
            response.put("canUseCompanyAccountSave", false);
            return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
        }
        ExtendedModelMap model = new ExtendedModelMap();
        populateCompanyAccountModel(safeString(insttId), isEn, model);
        model.addAttribute("companyAccountSaved", "Y".equalsIgnoreCase(safeString(saved)));
        response.putAll(model);
        response.put("canViewCompanyAccount", true);
        response.put("canUseCompanyAccountSave", true);
        response.put("isEditMode", !safeString(insttId).isEmpty());
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/api/admin/member/company-account", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> companyAccountSubmitApi(
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam("membershipType") String membershipType,
            @RequestParam("agencyName") String agencyName,
            @RequestParam("representativeName") String representativeName,
            @RequestParam("bizRegistrationNumber") String bizRegistrationNumber,
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
        Map<String, Object> response = new LinkedHashMap<>();
        if (!hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode)) {
            response.put("success", false);
            response.put("message", isEn ? "Only global administrators can manage company accounts." : "회원사 관리는 전체 관리자만 처리할 수 있습니다.");
            return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
        }

        String normalizedInsttId = safeString(insttId);
        String normalizedMembershipType = normalizeMembershipCode(membershipType);
        String normalizedAgencyName = trimToLen(safeString(agencyName), 100);
        String normalizedRepresentativeName = trimToLen(safeString(representativeName), 60);
        String normalizedBizNo = trimToLen(digitsOnly(bizRegistrationNumber), 10);
        String normalizedZipCode = trimToLen(digitsOnly(zipCode), 6);
        String normalizedAddress = trimToLen(safeString(companyAddress), 200);
        String normalizedAddressDetail = trimToLen(safeString(companyAddressDetail), 200);
        String normalizedChargerName = trimToLen(safeString(chargerName), 60);
        String normalizedChargerEmail = trimToLen(safeString(chargerEmail), 100);
        String normalizedChargerTel = trimToLen(safeString(chargerTel), 30);

        List<String> errors = new ArrayList<>();
        if (normalizedMembershipType.isEmpty()) {
            errors.add(isEn ? "Please select a valid membership type." : "유효한 회원 유형을 선택해 주세요.");
        }
        if (normalizedAgencyName.isEmpty()) {
            errors.add(isEn ? "Please enter the institution or company name." : "기관/기업명을 입력해 주세요.");
        }
        if (normalizedRepresentativeName.isEmpty()) {
            errors.add(isEn ? "Please enter the representative name." : "대표자명을 입력해 주세요.");
        }
        if (normalizedBizNo.length() != 10) {
            errors.add(isEn ? "Please enter a 10-digit business registration number." : "사업자등록번호 10자리를 입력해 주세요.");
        }
        if (normalizedZipCode.isEmpty()) {
            errors.add(isEn ? "Please search and enter the postal code." : "우편번호를 입력해 주세요.");
        }
        if (normalizedAddress.isEmpty()) {
            errors.add(isEn ? "Please enter the business address." : "사업장 주소를 입력해 주세요.");
        }
        if (normalizedChargerName.isEmpty()) {
            errors.add(isEn ? "Please enter the contact name." : "담당자 성명을 입력해 주세요.");
        }
        if (!isValidEmail(normalizedChargerEmail)) {
            errors.add(isEn ? "Please enter a valid email address." : "올바른 담당자 이메일을 입력해 주세요.");
        }
        if (digitsOnly(normalizedChargerTel).length() < 9) {
            errors.add(isEn ? "Please enter a valid contact number." : "올바른 담당자 연락처를 입력해 주세요.");
        }

        InstitutionStatusVO existingInstitution = loadInstitutionInfoByInsttId(normalizedInsttId);
        List<InsttFileVO> existingFiles = loadInsttFilesByInsttId(normalizedInsttId);
        boolean hasExistingFiles = existingFiles != null && !existingFiles.isEmpty();
        if (!hasValidInsttEvidenceFiles(fileUploads) && !hasExistingFiles) {
            errors.add(isEn ? "Please upload at least one supporting document." : "증빙 서류를 1개 이상 업로드해 주세요.");
        }

        if (!errors.isEmpty()) {
            response.put("success", false);
            response.put("errors", errors);
            return ResponseEntity.badRequest().body(response);
        }

        try {
            String targetInsttId = normalizedInsttId;
            boolean exists = existingInstitution != null && !existingInstitution.isEmpty();
            if (targetInsttId.isEmpty()) {
                targetInsttId = createInstitutionId();
            }

            InsttInfoVO vo = new InsttInfoVO();
            vo.setInsttId(targetInsttId);
            vo.setInsttNm(normalizedAgencyName);
            vo.setReprsntNm(normalizedRepresentativeName);
            vo.setBizrno(normalizedBizNo);
            vo.setZip(normalizedZipCode);
            vo.setAdres(normalizedAddress);
            vo.setDetailAdres(normalizedAddressDetail);
            vo.setChargerNm(normalizedChargerName);
            vo.setChargerEmail(normalizedChargerEmail);
            vo.setChargerTel(normalizedChargerTel);
            vo.setEntrprsSeCode(normalizedMembershipType);
            vo.setInsttSttus("P");

            int nextFileSn = hasExistingFiles ? existingFiles.size() + 1 : 1;
            List<InsttFileVO> newFiles = saveAdminInsttEvidenceFiles(targetInsttId, fileUploads, nextFileSn);
            if (!newFiles.isEmpty()) {
                vo.setBizRegFilePath(joinInsttEvidencePaths(newFiles));
            } else if (exists) {
                vo.setBizRegFilePath(existingInstitution.getBizRegFilePath());
            }

            if (exists) {
                entrprsManageService.updateInsttInfo(vo);
            } else {
                entrprsManageService.insertInsttInfo(vo);
            }
            entrprsManageService.insertInsttFiles(newFiles);

            response.put("success", true);
            response.put("insttId", targetInsttId);
            response.put("saved", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to save admin company account api. insttId={}", normalizedInsttId, e);
            response.put("success", false);
            response.put("message", isEn ? "An error occurred while saving the company registration." : "회원사 등록 저장 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @RequestMapping(value = "/member/company_account", method = RequestMethod.POST, params = "agencyName")
    public String company_accountSubmit(
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam("membershipType") String membershipType,
            @RequestParam("agencyName") String agencyName,
            @RequestParam("representativeName") String representativeName,
            @RequestParam("bizRegistrationNumber") String bizRegistrationNumber,
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
        if (!hasGlobalDeptRoleAccess(extractCurrentUserId(request), resolveCurrentUserAuthorCode(extractCurrentUserId(request)))) {
            model.addAttribute("companyAccountErrors", Collections.singletonList(
                    isEn ? "Only global administrators can manage company accounts." : "회원사 관리는 전체 관리자만 처리할 수 있습니다."));
            return isEn ? "egovframework/com/admin/company_account_en" : "egovframework/com/admin/company_account";
        }
        String normalizedInsttId = safeString(insttId);
        String normalizedMembershipType = normalizeMembershipCode(membershipType);
        String normalizedAgencyName = trimToLen(safeString(agencyName), 100);
        String normalizedRepresentativeName = trimToLen(safeString(representativeName), 60);
        String normalizedBizNo = trimToLen(digitsOnly(bizRegistrationNumber), 10);
        String normalizedZipCode = trimToLen(digitsOnly(zipCode), 6);
        String normalizedAddress = trimToLen(safeString(companyAddress), 200);
        String normalizedAddressDetail = trimToLen(safeString(companyAddressDetail), 200);
        String normalizedChargerName = trimToLen(safeString(chargerName), 60);
        String normalizedChargerEmail = trimToLen(safeString(chargerEmail), 100);
        String normalizedChargerTel = trimToLen(safeString(chargerTel), 30);

        List<String> errors = new ArrayList<>();
        if (normalizedMembershipType.isEmpty()) {
            errors.add(isEn ? "Please select a valid membership type." : "유효한 회원 유형을 선택해 주세요.");
        }
        if (normalizedAgencyName.isEmpty()) {
            errors.add(isEn ? "Please enter the institution or company name." : "기관/기업명을 입력해 주세요.");
        }
        if (normalizedRepresentativeName.isEmpty()) {
            errors.add(isEn ? "Please enter the representative name." : "대표자명을 입력해 주세요.");
        }
        if (normalizedBizNo.length() != 10) {
            errors.add(isEn ? "Please enter a 10-digit business registration number." : "사업자등록번호 10자리를 입력해 주세요.");
        }
        if (normalizedZipCode.isEmpty()) {
            errors.add(isEn ? "Please search and enter the postal code." : "우편번호를 입력해 주세요.");
        }
        if (normalizedAddress.isEmpty()) {
            errors.add(isEn ? "Please enter the business address." : "사업장 주소를 입력해 주세요.");
        }
        if (normalizedChargerName.isEmpty()) {
            errors.add(isEn ? "Please enter the contact name." : "담당자 성명을 입력해 주세요.");
        }
        if (!isValidEmail(normalizedChargerEmail)) {
            errors.add(isEn ? "Please enter a valid email address." : "올바른 담당자 이메일을 입력해 주세요.");
        }
        if (digitsOnly(normalizedChargerTel).length() < 9) {
            errors.add(isEn ? "Please enter a valid contact number." : "올바른 담당자 연락처를 입력해 주세요.");
        }

        InstitutionStatusVO existingInstitution = loadInstitutionInfoByInsttId(normalizedInsttId);
        List<InsttFileVO> existingFiles = loadInsttFilesByInsttId(normalizedInsttId);
        boolean hasExistingFiles = existingFiles != null && !existingFiles.isEmpty();
        if (!hasValidInsttEvidenceFiles(fileUploads) && !hasExistingFiles) {
            errors.add(isEn ? "Please upload at least one supporting document." : "증빙 서류를 1개 이상 업로드해 주세요.");
        }

        if (!errors.isEmpty()) {
            populateCompanyAccountModelFromValues(
                    normalizedInsttId,
                    normalizedMembershipType,
                    normalizedAgencyName,
                    normalizedRepresentativeName,
                    normalizedBizNo,
                    normalizedZipCode,
                    normalizedAddress,
                    normalizedAddressDetail,
                    normalizedChargerName,
                    normalizedChargerEmail,
                    normalizedChargerTel,
                    isEn,
                    model);
            model.addAttribute("companyAccountFiles", existingFiles == null ? Collections.emptyList() : existingFiles);
            model.addAttribute("companyAccountErrors", errors);
            return isEn ? "egovframework/com/admin/company_account_en" : "egovframework/com/admin/company_account";
        }

        try {
            String targetInsttId = normalizedInsttId;
            boolean exists = existingInstitution != null && !existingInstitution.isEmpty();
            if (targetInsttId.isEmpty()) {
                targetInsttId = createInstitutionId();
            }

            InsttInfoVO vo = new InsttInfoVO();
            vo.setInsttId(targetInsttId);
            vo.setInsttNm(normalizedAgencyName);
            vo.setReprsntNm(normalizedRepresentativeName);
            vo.setBizrno(normalizedBizNo);
            vo.setZip(normalizedZipCode);
            vo.setAdres(normalizedAddress);
            vo.setDetailAdres(normalizedAddressDetail);
            vo.setChargerNm(normalizedChargerName);
            vo.setChargerEmail(normalizedChargerEmail);
            vo.setChargerTel(normalizedChargerTel);
            vo.setEntrprsSeCode(normalizedMembershipType);
            vo.setInsttSttus("P");

            int nextFileSn = hasExistingFiles ? existingFiles.size() + 1 : 1;
            List<InsttFileVO> newFiles = saveAdminInsttEvidenceFiles(targetInsttId, fileUploads, nextFileSn);
            if (!newFiles.isEmpty()) {
                vo.setBizRegFilePath(joinInsttEvidencePaths(newFiles));
            } else if (exists) {
                vo.setBizRegFilePath(existingInstitution.getBizRegFilePath());
            }

            if (exists) {
                entrprsManageService.updateInsttInfo(vo);
            } else {
                entrprsManageService.insertInsttInfo(vo);
            }
            entrprsManageService.insertInsttFiles(newFiles);
            return "redirect:" + adminPrefix(request, locale) + "/member/company_account?insttId=" + urlEncode(targetInsttId) + "&saved=Y";
        } catch (Exception e) {
            log.error("Failed to save admin company account. insttId={}", normalizedInsttId, e);
            populateCompanyAccountModelFromValues(
                    normalizedInsttId,
                    normalizedMembershipType,
                    normalizedAgencyName,
                    normalizedRepresentativeName,
                    normalizedBizNo,
                    normalizedZipCode,
                    normalizedAddress,
                    normalizedAddressDetail,
                    normalizedChargerName,
                    normalizedChargerEmail,
                    normalizedChargerTel,
                    isEn,
                    model);
            model.addAttribute("companyAccountFiles", existingFiles == null ? Collections.emptyList() : existingFiles);
            model.addAttribute("companyAccountErrors", Collections.singletonList(
                    isEn ? "An error occurred while saving the company registration." : "회원사 등록 저장 중 오류가 발생했습니다."));
            return isEn ? "egovframework/com/admin/company_account_en" : "egovframework/com/admin/company_account";
        }
    }

    @RequestMapping(value = "/member/company-file", method = RequestMethod.GET)
    public void companyFile(
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

    @RequestMapping(value = "/system/security", method = { RequestMethod.GET, RequestMethod.POST })
    public String security_history(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "userSe", required = false) String userSe,
            @RequestParam(value = "loginResult", required = false) String loginResult,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "security-history");
    }

    @GetMapping("/system/security/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> securityHistoryPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "userSe", required = false) String userSe,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        boolean isEn = isEnglishRequest(request, locale);
        ExtendedModelMap model = new ExtendedModelMap();
        populateBlockedLoginHistory(pageIndexParam, searchKeyword, userSe, model, isEn ? "egovframework/com/admin/security_history_en" : "egovframework/com/admin/security_history");
        model.addAttribute("isEn", isEn);
        return ResponseEntity.ok(new LinkedHashMap<>(model));
    }

    @RequestMapping(value = "/system/security-policy", method = { RequestMethod.GET, RequestMethod.POST })
    public String security_policy(
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "security-policy");
    }

    @GetMapping("/system/security-policy/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> securityPolicyPageApi(
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        boolean isEn = isEnglishRequest(request, locale);
        ExtendedModelMap model = new ExtendedModelMap();
        populateSecurityPolicyPage(model, isEn ? "egovframework/com/admin/security_policy_en" : "egovframework/com/admin/security_policy", isEn);
        model.addAttribute("isEn", isEn);
        return ResponseEntity.ok(new LinkedHashMap<>(model));
    }

    @RequestMapping(value = "/system/security-monitoring", method = { RequestMethod.GET, RequestMethod.POST })
    public String security_monitoring(
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "security-monitoring");
    }

    @GetMapping("/system/security-monitoring/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> securityMonitoringPageApi(
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        boolean isEn = isEnglishRequest(request, locale);
        ExtendedModelMap model = new ExtendedModelMap();
        populateSecurityMonitoringPage(model, isEn ? "egovframework/com/admin/security_monitoring_en" : "egovframework/com/admin/security_monitoring", isEn);
        model.addAttribute("isEn", isEn);
        return ResponseEntity.ok(new LinkedHashMap<>(model));
    }

    @RequestMapping(value = "/system/blocklist", method = { RequestMethod.GET, RequestMethod.POST })
    public String security_blocklist(
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "blockType", required = false) String blockType,
            @RequestParam(value = "status", required = false) String status,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "blocklist");
    }

    @GetMapping("/system/blocklist/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> blocklistPageApi(
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "blockType", required = false) String blockType,
            @RequestParam(value = "status", required = false) String status,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        boolean isEn = isEnglishRequest(request, locale);
        ExtendedModelMap model = new ExtendedModelMap();
        populateBlocklistPage(searchKeyword, blockType, status, model, isEn ? "egovframework/com/admin/blocklist_en" : "egovframework/com/admin/blocklist", isEn);
        model.addAttribute("isEn", isEn);
        return ResponseEntity.ok(new LinkedHashMap<>(model));
    }

    @RequestMapping(value = "/system/security-audit", method = { RequestMethod.GET, RequestMethod.POST })
    public String security_audit(
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "security-audit");
    }

    @GetMapping("/system/security-audit/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> securityAuditPageApi(
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        boolean isEn = isEnglishRequest(request, locale);
        ExtendedModelMap model = new ExtendedModelMap();
        populateSecurityAuditPage(model, isEn ? "egovframework/com/admin/security_audit_en" : "egovframework/com/admin/security_audit", isEn);
        model.addAttribute("isEn", isEn);
        return ResponseEntity.ok(new LinkedHashMap<>(model));
    }

    @RequestMapping(value = "/system/scheduler", method = { RequestMethod.GET, RequestMethod.POST })
    public String scheduler_management(
            @RequestParam(value = "jobStatus", required = false) String jobStatus,
            @RequestParam(value = "executionType", required = false) String executionType,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "scheduler-management");
    }

    @GetMapping("/system/scheduler/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> schedulerPageApi(
            @RequestParam(value = "jobStatus", required = false) String jobStatus,
            @RequestParam(value = "executionType", required = false) String executionType,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        boolean isEn = isEnglishRequest(request, locale);
        ExtendedModelMap model = new ExtendedModelMap();
        populateSchedulerPage(jobStatus, executionType, model, isEn ? "egovframework/com/admin/scheduler_management_en" : "egovframework/com/admin/scheduler_management", isEn);
        model.addAttribute("isEn", isEn);
        return ResponseEntity.ok(new LinkedHashMap<>(model));
    }

    @RequestMapping(value = "/member/login_history", method = { RequestMethod.GET, RequestMethod.POST })
    public String login_history(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "userSe", required = false) String userSe,
            @RequestParam(value = "loginResult", required = false) String loginResult,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "login-history");
    }

    @GetMapping("/api/admin/member/login-history/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> loginHistoryPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "userSe", required = false) String userSe,
            @RequestParam(value = "loginResult", required = false) String loginResult,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        boolean isEn = isEnglishRequest(request, locale);
        ExtendedModelMap model = new ExtendedModelMap();
        populateLoginHistory(pageIndexParam, searchKeyword, userSe, loginResult, model, isEn ? "egovframework/com/admin/login_history_en" : "egovframework/com/admin/login_history");
        model.addAttribute("isEn", isEn);
        return ResponseEntity.ok(new LinkedHashMap<>(model));
    }

    private String populateMemberList(
            String pageIndexParam,
            String searchKeyword,
            String membershipType,
            String sbscrbSttus,
            Model model,
            String viewName,
            HttpServletRequest request) {
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

        EntrprsManageVO searchVO = new EntrprsManageVO();
        searchVO.setPageIndex(currentPage);
        searchVO.setRecordCountPerPage(pageSize);

        String keyword = searchKeyword == null ? "" : searchKeyword.trim();
        searchVO.setSearchKeyword(keyword);
        searchVO.setSearchCondition("all");

        String memberType = membershipType == null ? "" : membershipType.trim().toUpperCase();
        if (!memberType.isEmpty()) {
            String dbTypeCode = normalizeMembershipCode(memberType);
            if (!dbTypeCode.isEmpty()) {
                searchVO.setEntrprsSeCode(dbTypeCode);
            }
        }

        String status = sbscrbSttus == null ? "" : sbscrbSttus.trim();
        if (!status.isEmpty()) {
            searchVO.setSbscrbSttus(status);
        }
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        if (requiresOwnCompanyAccess(currentUserId, currentUserAuthorCode)) {
            searchVO.setInsttId(resolveCurrentUserInsttId(currentUserId));
        }

        List<EntrprsManageVO> member_list;
        int totalCount;
        try {
            totalCount = entrprsManageService.selectEntrprsMberListTotCnt(searchVO);
            int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
            if (currentPage > totalPages) {
                currentPage = totalPages;
            }
            searchVO.setPageIndex(currentPage);
            searchVO.setFirstIndex((currentPage - 1) * pageSize);
            member_list = entrprsManageService.selectEntrprsMberList(searchVO);
        } catch (Exception e) {
            member_list = Collections.emptyList();
            totalCount = 0;
            model.addAttribute("member_listError", e.getMessage());
        }

        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        int startPage = Math.max(1, currentPage - 4);
        int endPage = Math.min(totalPages, startPage + 9);
        if (endPage - startPage < 9) {
            startPage = Math.max(1, endPage - 9);
        }

        model.addAttribute("member_list", member_list);
        model.addAttribute("totalCount", totalCount);
        model.addAttribute("pageIndex", currentPage);
        model.addAttribute("pageSize", pageSize);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("startPage", startPage);
        model.addAttribute("endPage", endPage);
        model.addAttribute("searchKeyword", keyword);
        model.addAttribute("membershipType", memberType);
        model.addAttribute("sbscrbSttus", status);
        return viewName;
    }

    private String populateMemberApprovalList(
            String pageIndexParam,
            String searchKeyword,
            String membershipType,
            String sbscrbSttus,
            String result,
            Model model,
            String viewName,
            boolean isEn,
            HttpServletRequest request,
            Locale locale) {
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

        EntrprsManageVO searchVO = new EntrprsManageVO();
        searchVO.setPageIndex(currentPage);
        searchVO.setRecordCountPerPage(pageSize);

        String keyword = safeString(searchKeyword);
        searchVO.setSearchKeyword(keyword);
        searchVO.setSearchCondition("all");

        String memberType = safeString(membershipType).toUpperCase(Locale.ROOT);
        if (!memberType.isEmpty()) {
            String dbTypeCode = normalizeMembershipCode(memberType);
            if (!dbTypeCode.isEmpty()) {
                searchVO.setEntrprsSeCode(dbTypeCode);
            }
        }

        String status = safeString(sbscrbSttus).toUpperCase(Locale.ROOT);
        if (status.isEmpty()) {
            status = "A";
        }
        searchVO.setSbscrbSttus(status);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        if (!hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode)) {
            model.addAttribute("memberApprovalError",
                    isEn ? "Only global administrators can view member approvals." : "회원 승인 목록은 전체 관리자만 조회할 수 있습니다.");
            model.addAttribute("approvalRows", Collections.emptyList());
            model.addAttribute("memberApprovalTotalCount", 0);
            model.addAttribute("pageIndex", 1);
            model.addAttribute("pageSize", pageSize);
            model.addAttribute("totalPages", 1);
            model.addAttribute("startPage", 1);
            model.addAttribute("endPage", 1);
            model.addAttribute("searchKeyword", keyword);
            model.addAttribute("membershipType", memberType);
            model.addAttribute("sbscrbSttus", status);
            String approvalBasePath = resolveMemberApprovalBasePath(request, locale);
            model.addAttribute("memberApprovalAction", approvalBasePath);
            model.addAttribute("memberApprovalListUrl", approvalBasePath);
            model.addAttribute("memberApprovalResult", safeString(result));
            model.addAttribute("memberApprovalResultMessage", resolveApprovalResultMessage(result, isEn));
            model.addAttribute("memberApprovalStatusOptions", buildApprovalStatusOptions(isEn));
            model.addAttribute("memberTypeOptions", buildMemberTypeOptions(isEn));
            return viewName;
        }

        List<EntrprsManageVO> memberList;
        int totalCount;
        try {
            totalCount = entrprsManageService.selectEntrprsMberListTotCnt(searchVO);
            int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
            if (currentPage > totalPages) {
                currentPage = totalPages;
            }
            searchVO.setPageIndex(currentPage);
            searchVO.setFirstIndex((currentPage - 1) * pageSize);
            memberList = entrprsManageService.selectEntrprsMberList(searchVO);
        } catch (Exception e) {
            log.error("Failed to load member approval list.", e);
            memberList = Collections.emptyList();
            totalCount = 0;
            model.addAttribute("memberApprovalError",
                    isEn ? "An error occurred while retrieving the approval list." : "승인 대기 목록 조회 중 오류가 발생했습니다.");
        }

        List<Map<String, Object>> approvalRows = new ArrayList<>();
        for (EntrprsManageVO member : memberList) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("member", member);
            row.put("memberId", safeString(member.getEntrprsmberId()));
            row.put("memberName", safeString(member.getApplcntNm()));
            row.put("companyName", safeString(member.getCmpnyNm()));
            row.put("joinDate", safeString(member.getSbscrbDe()));
            row.put("membershipTypeLabel", isEn
                    ? resolveMembershipTypeLabelEn(member.getEntrprsSeCode())
                    : resolveMembershipTypeLabel(member.getEntrprsSeCode()));
            row.put("statusLabel", isEn
                    ? resolveStatusLabelEn(member.getEntrprsMberSttus())
                    : resolveStatusLabel(member.getEntrprsMberSttus()));
            row.put("statusBadgeClass", resolveStatusBadgeClass(member.getEntrprsMberSttus()));
            row.put("detailUrl", adminPrefix(request, locale) + "/member/detail?memberId=" + urlEncode(member.getEntrprsmberId()));
            List<EvidenceFileView> evidenceFiles = loadEvidenceFiles(member);
            row.put("evidenceFiles", evidenceFiles);
            row.put("hasEvidenceFiles", !evidenceFiles.isEmpty());
            approvalRows.add(row);
        }

        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        int startPage = Math.max(1, currentPage - 4);
        int endPage = Math.min(totalPages, startPage + 9);
        if (endPage - startPage < 9) {
            startPage = Math.max(1, endPage - 9);
        }

        model.addAttribute("approvalRows", approvalRows);
        model.addAttribute("memberApprovalTotalCount", totalCount);
        model.addAttribute("pageIndex", currentPage);
        model.addAttribute("pageSize", pageSize);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("startPage", startPage);
        model.addAttribute("endPage", endPage);
        model.addAttribute("searchKeyword", keyword);
        model.addAttribute("membershipType", memberType);
        model.addAttribute("sbscrbSttus", status);
        String approvalBasePath = resolveMemberApprovalBasePath(request, locale);
        model.addAttribute("memberApprovalAction", approvalBasePath);
        model.addAttribute("memberApprovalListUrl", approvalBasePath);
        model.addAttribute("memberApprovalResult", safeString(result));
        model.addAttribute("memberApprovalResultMessage", resolveApprovalResultMessage(result, isEn));
        model.addAttribute("memberApprovalStatusOptions", buildApprovalStatusOptions(isEn));
        model.addAttribute("memberTypeOptions", buildMemberTypeOptions(isEn));
        return viewName;
    }

    private String populateCompanyApprovalList(
            String pageIndexParam,
            String searchKeyword,
            String sbscrbSttus,
            String result,
            Model model,
            String viewName,
            boolean isEn,
            HttpServletRequest request,
            Locale locale) {
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

        String keyword = safeString(searchKeyword);
        String status = safeString(sbscrbSttus).toUpperCase(Locale.ROOT);
        if (status.isEmpty()) {
            status = "A";
        }
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        if (!hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode)) {
            model.addAttribute("memberApprovalError",
                    isEn ? "Only global administrators can view company approvals." : "회원사 승인 목록은 전체 관리자만 조회할 수 있습니다.");
            model.addAttribute("approvalRows", Collections.emptyList());
            model.addAttribute("memberApprovalTotalCount", 0);
            model.addAttribute("pageIndex", 1);
            model.addAttribute("pageSize", pageSize);
            model.addAttribute("totalPages", 1);
            model.addAttribute("startPage", 1);
            model.addAttribute("endPage", 1);
            model.addAttribute("searchKeyword", keyword);
            model.addAttribute("sbscrbSttus", status);
            model.addAttribute("memberApprovalAction", adminPrefix(request, locale) + "/member/company-approve");
            model.addAttribute("memberApprovalListUrl", adminPrefix(request, locale) + "/member/company-approve");
            model.addAttribute("memberApprovalResult", safeString(result));
            model.addAttribute("memberApprovalResultMessage", resolveCompanyApprovalResultMessage(result, isEn));
            model.addAttribute("memberApprovalStatusOptions", buildApprovalStatusOptions(isEn));
            return viewName;
        }

        List<?> companyList;
        int totalCount;
        try {
            Map<String, Object> searchParams = new LinkedHashMap<>();
            searchParams.put("keyword", keyword);
            searchParams.put("status", status);
            totalCount = entrprsManageService.searchCompanyListTotCnt(searchParams);
            int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
            if (currentPage > totalPages) {
                currentPage = totalPages;
            }
            int offset = (currentPage - 1) * pageSize;
            searchParams.put("offset", offset);
            searchParams.put("pageSize", pageSize);
            companyList = entrprsManageService.searchCompanyListPaged(searchParams);
        } catch (Exception e) {
            log.error("Failed to load company approval list.", e);
            companyList = Collections.emptyList();
            totalCount = 0;
            model.addAttribute("memberApprovalError",
                    isEn ? "An error occurred while retrieving the company approval list." : "회원사 승인 목록 조회 중 오류가 발생했습니다.");
        }

        List<Map<String, Object>> approvalRows = new ArrayList<>();
        for (Object company : companyList) {
            Map<String, Object> row = new LinkedHashMap<>();
            String insttId;
            String companyName;
            String businessNumber;
            String representativeName;
            String membershipTypeCode;
            String joinStat;

            if (company instanceof CompanyListItemVO) {
                CompanyListItemVO companyVO = (CompanyListItemVO) company;
                insttId = safeString(companyVO.getInsttId());
                companyName = safeString(companyVO.getCmpnyNm());
                businessNumber = safeString(companyVO.getBizrno());
                representativeName = safeString(companyVO.getCxfc());
                membershipTypeCode = safeString(companyVO.getEntrprsSeCode());
                joinStat = safeString(companyVO.getJoinStat());
            } else if (company instanceof Map) {
                Map<?, ?> companyMap = (Map<?, ?>) company;
                insttId = stringValue(companyMap.get("insttId"));
                if (insttId.isEmpty()) insttId = stringValue(companyMap.get("INSTT_ID"));
                companyName = stringValue(companyMap.get("cmpnyNm"));
                if (companyName.isEmpty()) companyName = stringValue(companyMap.get("CMPNY_NM"));
                businessNumber = stringValue(companyMap.get("bizrno"));
                if (businessNumber.isEmpty()) businessNumber = stringValue(companyMap.get("BIZRNO"));
                representativeName = stringValue(companyMap.get("cxfc"));
                if (representativeName.isEmpty()) representativeName = stringValue(companyMap.get("CXFC"));
                membershipTypeCode = stringValue(companyMap.get("entrprsSeCode"));
                if (membershipTypeCode.isEmpty()) membershipTypeCode = stringValue(companyMap.get("ENTRPRS_SE_CODE"));
                joinStat = stringValue(companyMap.get("joinStat"));
                if (joinStat.isEmpty()) joinStat = stringValue(companyMap.get("JOIN_STAT"));
            } else {
                continue;
            }
            row.put("insttId", insttId);
            row.put("companyName", companyName);
            row.put("businessNumber", businessNumber);
            row.put("representativeName", representativeName);
            row.put("membershipTypeLabel", isEn
                    ? resolveMembershipTypeLabelEn(membershipTypeCode)
                    : resolveMembershipTypeLabel(membershipTypeCode));
            row.put("statusLabel", isEn
                    ? resolveInstitutionStatusLabelEn(joinStat)
                    : resolveInstitutionStatusLabel(joinStat));
            row.put("statusBadgeClass", resolveInstitutionStatusBadgeClass(joinStat));
            row.put("detailUrl", adminPrefix(request, locale) + "/member/company_detail?insttId=" + urlEncode(insttId));
            row.put("editUrl", adminPrefix(request, locale) + "/member/company_account?insttId=" + urlEncode(insttId));

            List<InsttFileVO> fileList = loadInsttFilesByInsttId(insttId);
            List<Map<String, String>> evidenceFiles = new ArrayList<>();
            for (InsttFileVO file : fileList) {
                Map<String, String> fileRow = new LinkedHashMap<>();
                fileRow.put("fileName", safeString(file.getOrignlFileNm()));
                fileRow.put("downloadUrl",
                        adminPrefix(request, locale) + "/member/company-file?fileId=" + urlEncode(file.getFileId()) + "&download=true");
                evidenceFiles.add(fileRow);
            }
            row.put("evidenceFiles", evidenceFiles);
            row.put("hasEvidenceFiles", !evidenceFiles.isEmpty());
            approvalRows.add(row);
        }

        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        int startPage = Math.max(1, currentPage - 4);
        int endPage = Math.min(totalPages, startPage + 9);
        if (endPage - startPage < 9) {
            startPage = Math.max(1, endPage - 9);
        }

        model.addAttribute("approvalRows", approvalRows);
        model.addAttribute("memberApprovalTotalCount", totalCount);
        model.addAttribute("pageIndex", currentPage);
        model.addAttribute("pageSize", pageSize);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("startPage", startPage);
        model.addAttribute("endPage", endPage);
        model.addAttribute("searchKeyword", keyword);
        model.addAttribute("sbscrbSttus", status);
        model.addAttribute("memberApprovalAction", adminPrefix(request, locale) + "/member/company-approve");
        model.addAttribute("memberApprovalListUrl", adminPrefix(request, locale) + "/member/company-approve");
        model.addAttribute("memberApprovalResult", safeString(result));
        model.addAttribute("memberApprovalResultMessage", resolveCompanyApprovalResultMessage(result, isEn));
        model.addAttribute("memberApprovalStatusOptions", buildApprovalStatusOptions(isEn));
        return viewName;
    }

    private void processMemberApprovalStatusChange(String memberId, String targetStatus) throws Exception {
        String normalizedMemberId = safeString(memberId);
        String normalizedTargetStatus = normalizeMemberStatusCode(targetStatus);
        if (normalizedMemberId.isEmpty() || normalizedTargetStatus.isEmpty()) {
            return;
        }
        EntrprsManageVO member = entrprsManageService.selectEntrprsmberByMberId(normalizedMemberId);
        if (member == null || safeString(member.getEntrprsmberId()).isEmpty()) {
            return;
        }
        member.setEntrprsMberSttus(normalizedTargetStatus);
        entrprsManageService.updateEntrprsmber(member);
        if ("P".equals(normalizedTargetStatus)) {
            entrprsManageService.ensureEnterpriseSecurityMapping(member.getUniqId());
        }
    }

    private void processCompanyApprovalStatusChange(String insttId, String targetStatus) throws Exception {
        String normalizedInsttId = safeString(insttId);
        String normalizedTargetStatus = normalizeMemberStatusCode(targetStatus);
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
        vo.setRjctRsn(current.getRjctRsn());
        vo.setRjctPnttm(current.getRjctPnttm());
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

    private String resolveMemberApprovalBasePath(HttpServletRequest request, Locale locale) {
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

    private String resolveApprovalResultMessage(String result, boolean isEn) {
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

    private String resolveCompanyApprovalResultMessage(String result, boolean isEn) {
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

    private List<Map<String, String>> buildApprovalStatusOptions(boolean isEn) {
        List<Map<String, String>> options = new ArrayList<>();
        options.add(buildOption("A", isEn ? "Pending Approval" : "승인 대기"));
        options.add(buildOption("P", isEn ? "Active" : "활성"));
        options.add(buildOption("R", isEn ? "Rejected" : "반려"));
        return options;
    }

    private String populateAdminMemberList(
            String pageIndexParam,
            String searchKeyword,
            String sbscrbSttus,
            Model model,
            String viewName) {
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

        String keyword = safeString(searchKeyword);
        String status = safeString(sbscrbSttus).toUpperCase(Locale.ROOT);
        Sort sort = Sort.by(Sort.Direction.DESC, "sbscrbDe");
        Page<EmplyrInfo> page;
        try {
            page = employMemberRepository.searchAdminMembers(keyword, status,
                    PageRequest.of(currentPage - 1, pageSize, sort));
            int totalPages = page.getTotalPages();
            if (totalPages > 0 && currentPage > totalPages) {
                currentPage = totalPages;
                page = employMemberRepository.searchAdminMembers(keyword, status,
                        PageRequest.of(currentPage - 1, pageSize, sort));
            }
        } catch (Exception e) {
            log.error("Failed to load admin member list.", e);
            model.addAttribute("member_listError", e.getMessage());
            model.addAttribute("member_list", Collections.emptyList());
            model.addAttribute("totalCount", 0);
            model.addAttribute("pageIndex", 1);
            model.addAttribute("pageSize", pageSize);
            model.addAttribute("totalPages", 1);
            model.addAttribute("startPage", 1);
            model.addAttribute("endPage", 1);
            model.addAttribute("searchKeyword", keyword);
            model.addAttribute("sbscrbSttus", status);
            return viewName;
        }

        int totalCount = (int) page.getTotalElements();
        int totalPages = Math.max(page.getTotalPages(), 1);
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

        model.addAttribute("member_list", page.getContent());
        model.addAttribute("totalCount", totalCount);
        model.addAttribute("pageIndex", currentPage);
        model.addAttribute("pageSize", pageSize);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("startPage", startPage);
        model.addAttribute("endPage", endPage);
        model.addAttribute("prevPage", prevPage);
        model.addAttribute("nextPage", nextPage);
        model.addAttribute("searchKeyword", keyword);
        model.addAttribute("sbscrbSttus", status);
        return viewName;
    }

    private String populateCompanyList(
            String pageIndexParam,
            String searchKeyword,
            String sbscrbSttus,
            Model model,
            String viewName,
            HttpServletRequest request) {
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

        String keyword = safeString(searchKeyword);
        String status = safeString(sbscrbSttus).toUpperCase(Locale.ROOT);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        String scopedInsttId = requiresOwnCompanyAccess(currentUserId, currentUserAuthorCode)
                ? resolveCurrentUserInsttId(currentUserId)
                : "";

        List<CompanyListItemVO> company_list;
        int totalCount;
        try {
            Map<String, Object> searchParams = new LinkedHashMap<>();
            searchParams.put("keyword", keyword);
            searchParams.put("status", status);
            searchParams.put("insttId", scopedInsttId);
            totalCount = entrprsManageService.searchCompanyListTotCnt(searchParams);
            int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
            if (currentPage > totalPages) {
                currentPage = totalPages;
            }
            int offset = (currentPage - 1) * pageSize;
            searchParams.put("offset", offset);
            searchParams.put("pageSize", pageSize);
            company_list = entrprsManageService.searchCompanyListPaged(searchParams);
        } catch (Exception e) {
            log.error("Failed to load company list.", e);
            company_list = Collections.emptyList();
            totalCount = 0;
            model.addAttribute("company_listError", e.getMessage());
        }

        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
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

        model.addAttribute("company_list", company_list);
        model.addAttribute("totalCount", totalCount);
        model.addAttribute("pageIndex", currentPage);
        model.addAttribute("pageSize", pageSize);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("startPage", startPage);
        model.addAttribute("endPage", endPage);
        model.addAttribute("prevPage", prevPage);
        model.addAttribute("nextPage", nextPage);
        model.addAttribute("searchKeyword", keyword);
        model.addAttribute("sbscrbSttus", status);
        return viewName;
    }

    private Map<String, Object> buildMemberStatsPageData(boolean isEn) {
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

    private Map<String, Object> buildMemberRegisterPageData(boolean isEn) {
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

    private String populateEmissionResultList(
            String pageIndexParam,
            String searchKeyword,
            String resultStatus,
            String verificationStatus,
            Model model,
            String viewName,
            boolean isEn) {
        int pageIndex = 1;
        if (pageIndexParam != null && !pageIndexParam.trim().isEmpty()) {
            try {
                pageIndex = Integer.parseInt(pageIndexParam.trim());
            } catch (NumberFormatException ignored) {
                pageIndex = 1;
            }
        }

        String keyword = safeString(searchKeyword).toLowerCase(Locale.ROOT);
        String normalizedResultStatus = safeString(resultStatus).toUpperCase(Locale.ROOT);
        String normalizedVerificationStatus = safeString(verificationStatus).toUpperCase(Locale.ROOT);

        List<EmissionResultSummaryView> allItems = buildEmissionResultSummaryViews(isEn);
        List<EmissionResultSummaryView> filteredItems = allItems.stream()
                .filter(item -> keyword.isEmpty()
                        || item.getProjectName().toLowerCase(Locale.ROOT).contains(keyword)
                        || item.getCompanyName().toLowerCase(Locale.ROOT).contains(keyword)
                        || item.getResultId().toLowerCase(Locale.ROOT).contains(keyword))
                .filter(item -> normalizedResultStatus.isEmpty() || normalizedResultStatus.equals(item.getResultStatusCode()))
                .filter(item -> normalizedVerificationStatus.isEmpty()
                        || normalizedVerificationStatus.equals(item.getVerificationStatusCode()))
                .collect(Collectors.toList());

        int pageSize = 10;
        int totalCount = filteredItems.size();
        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
        int currentPage = Math.max(1, Math.min(pageIndex, totalPages));
        int fromIndex = Math.min((currentPage - 1) * pageSize, totalCount);
        int toIndex = Math.min(fromIndex + pageSize, totalCount);
        List<EmissionResultSummaryView> pageItems = filteredItems.subList(fromIndex, toIndex);
        long reviewCount = filteredItems.stream().filter(item -> "REVIEW".equals(item.getResultStatusCode())).count();
        long verifiedCount = filteredItems.stream().filter(item -> "VERIFIED".equals(item.getVerificationStatusCode())).count();

        int startPage = Math.max(1, currentPage - 4);
        int endPage = Math.min(totalPages, startPage + 9);
        if (endPage - startPage < 9) {
            startPage = Math.max(1, endPage - 9);
        }

        model.addAttribute("emissionResultList", pageItems);
        model.addAttribute("totalCount", totalCount);
        model.addAttribute("reviewCount", reviewCount);
        model.addAttribute("verifiedCount", verifiedCount);
        model.addAttribute("pageIndex", currentPage);
        model.addAttribute("pageSize", pageSize);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("startPage", startPage);
        model.addAttribute("endPage", endPage);
        model.addAttribute("prevPage", Math.max(1, currentPage - 1));
        model.addAttribute("nextPage", Math.min(totalPages, currentPage + 1));
        model.addAttribute("searchKeyword", safeString(searchKeyword));
        model.addAttribute("resultStatus", normalizedResultStatus);
        model.addAttribute("verificationStatus", normalizedVerificationStatus);
        return viewName;
    }

    private List<EmissionResultSummaryView> buildEmissionResultSummaryViews(boolean isEn) {
        String prefix = isEn ? "/en/admin" : "/admin";
        List<EmissionResultSummaryView> items = new ArrayList<>();
        items.add(new EmissionResultSummaryView("ER-2026-001", "2026 Q1 Capture Plant Baseline",
                "Korea CCUS Plant", "2026-03-04", "125,440 tCO2e", "COMPLETED",
                isEn ? "Completed" : "산정 완료", "VERIFIED", isEn ? "Verified" : "검증 완료",
                prefix + "/emission/result_detail?resultId=ER-2026-001"));
        items.add(new EmissionResultSummaryView("ER-2026-002", "Blue Hydrogen Process Review",
                "Hanbit Energy", "2026-03-03", "84,210 tCO2e", "REVIEW",
                isEn ? "Under Review" : "검토 중", "PENDING", isEn ? "Pending" : "검증 대기",
                prefix + "/emission/result_detail?resultId=ER-2026-002"));
        items.add(new EmissionResultSummaryView("ER-2026-003", "Transport Network Simulation",
                "East Carbon Hub", "2026-02-28", "56,980 tCO2e", "DRAFT",
                isEn ? "Draft" : "임시 저장", "NOT_REQUIRED", isEn ? "Not Required" : "검증 제외",
                prefix + "/emission/result_detail?resultId=ER-2026-003"));
        items.add(new EmissionResultSummaryView("ER-2026-004", "Storage Integrity Monitoring",
                "Seohae Storage", "2026-02-26", "142,300 tCO2e", "COMPLETED",
                isEn ? "Completed" : "산정 완료", "FAILED", isEn ? "Recheck Needed" : "재검토 필요",
                prefix + "/emission/result_detail?resultId=ER-2026-004"));
        items.add(new EmissionResultSummaryView("ER-2026-005", "Methanol Conversion Project",
                "Green Synthesis", "2026-02-21", "39,870 tCO2e", "REVIEW",
                isEn ? "Under Review" : "검토 중", "IN_PROGRESS", isEn ? "In Progress" : "검증 진행중",
                prefix + "/emission/result_detail?resultId=ER-2026-005"));
        items.add(new EmissionResultSummaryView("ER-2026-006", "Regional Capture Efficiency Audit",
                "Daehan Capture", "2026-02-18", "73,120 tCO2e", "COMPLETED",
                isEn ? "Completed" : "산정 완료", "VERIFIED", isEn ? "Verified" : "검증 완료",
                prefix + "/emission/result_detail?resultId=ER-2026-006"));
        return items;
    }

    private String populateLoginHistory(
            String pageIndexParam,
            String searchKeyword,
            String userSe,
            String loginResult,
            Model model,
            String viewName) {
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
        String keyword = safeString(searchKeyword);
        String normalizedUserSe = safeString(userSe).toUpperCase(Locale.ROOT);
        String normalizedLoginResult = safeString(loginResult).toUpperCase(Locale.ROOT);

        LoginHistorySearchVO searchVO = new LoginHistorySearchVO();
        searchVO.setSearchKeyword(keyword);
        searchVO.setUserSe(normalizedUserSe);
        searchVO.setLoginResult(normalizedLoginResult);
        searchVO.setRecordCountPerPage(pageSize);

        List<LoginHistoryVO> pageItems;
        int totalCount;
        try {
            totalCount = adminLoginHistoryService.selectLoginHistoryListTotCnt(searchVO);
            int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
            if (currentPage > totalPages) {
                currentPage = totalPages;
            }
            searchVO.setFirstIndex((currentPage - 1) * pageSize);
            pageItems = adminLoginHistoryService.selectLoginHistoryList(searchVO);
        } catch (Exception e) {
            log.error("Failed to load login history.", e);
            totalCount = 0;
            pageItems = Collections.emptyList();
            model.addAttribute("loginHistoryError", e.getMessage());
        }

        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
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

        model.addAttribute("loginHistoryList", pageItems);
        model.addAttribute("totalCount", totalCount);
        model.addAttribute("pageIndex", currentPage);
        model.addAttribute("pageSize", pageSize);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("startPage", startPage);
        model.addAttribute("endPage", endPage);
        model.addAttribute("prevPage", prevPage);
        model.addAttribute("nextPage", nextPage);
        model.addAttribute("searchKeyword", keyword);
        model.addAttribute("userSe", normalizedUserSe);
        model.addAttribute("loginResult", normalizedLoginResult);
        return viewName;
    }

    private String populateBlockedLoginHistory(
            String pageIndexParam,
            String searchKeyword,
            String userSe,
            Model model,
            String viewName) {
        return populateLoginHistoryInternal(pageIndexParam, searchKeyword, userSe, "FAIL", "Y", model, viewName);
    }

    private String populateLoginHistoryInternal(
            String pageIndexParam,
            String searchKeyword,
            String userSe,
            String loginResult,
            String blockedOnly,
            Model model,
            String viewName) {
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
        String keyword = safeString(searchKeyword);
        String normalizedUserSe = safeString(userSe).toUpperCase(Locale.ROOT);
        String normalizedLoginResult = safeString(loginResult).toUpperCase(Locale.ROOT);
        String normalizedBlockedOnly = safeString(blockedOnly).toUpperCase(Locale.ROOT);

        LoginHistorySearchVO searchVO = new LoginHistorySearchVO();
        searchVO.setSearchKeyword(keyword);
        searchVO.setUserSe(normalizedUserSe);
        searchVO.setLoginResult(normalizedLoginResult);
        searchVO.setBlockedOnly(normalizedBlockedOnly);
        searchVO.setRecordCountPerPage(pageSize);

        List<LoginHistoryVO> pageItems;
        int totalCount;
        try {
            totalCount = adminLoginHistoryService.selectLoginHistoryListTotCnt(searchVO);
            int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
            if (currentPage > totalPages) {
                currentPage = totalPages;
            }
            searchVO.setFirstIndex((currentPage - 1) * pageSize);
            pageItems = adminLoginHistoryService.selectLoginHistoryList(searchVO);
        } catch (Exception e) {
            log.error("Failed to load login history.", e);
            totalCount = 0;
            pageItems = Collections.emptyList();
            model.addAttribute("loginHistoryError", e.getMessage());
        }

        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
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

        model.addAttribute("loginHistoryList", pageItems);
        model.addAttribute("totalCount", totalCount);
        model.addAttribute("pageIndex", currentPage);
        model.addAttribute("pageSize", pageSize);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("startPage", startPage);
        model.addAttribute("endPage", endPage);
        model.addAttribute("prevPage", prevPage);
        model.addAttribute("nextPage", nextPage);
        model.addAttribute("searchKeyword", keyword);
        model.addAttribute("userSe", normalizedUserSe);
        model.addAttribute("loginResult", normalizedLoginResult);
        return viewName;
    }

    private String populatePasswordResetHistory(
            String pageIndexParam,
            String searchKeyword,
            String resetSource,
            Model model,
            String viewName,
            boolean isEn) {
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
        String keyword = safeString(searchKeyword).toLowerCase(Locale.ROOT);
        String normalizedSource = safeString(resetSource).toUpperCase(Locale.ROOT);

        List<PasswordResetHistory> filteredItems;
        try {
            filteredItems = authService.findAllPasswordResetHistories().stream()
                    .filter(history -> normalizedSource.isEmpty()
                            || normalizedSource.equalsIgnoreCase(safeString(history.getResetSource())))
                    .filter(history -> keyword.isEmpty() || containsPasswordResetKeyword(history, keyword))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to load password reset history.", e);
            filteredItems = Collections.emptyList();
            model.addAttribute("member_resetPasswordError",
                    isEn ? "Failed to load password reset history." : "비밀번호 초기화 이력을 불러오지 못했습니다.");
        }

        int totalCount = filteredItems.size();
        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        int fromIndex = Math.min((currentPage - 1) * pageSize, totalCount);
        int toIndex = Math.min(fromIndex + pageSize, totalCount);
        List<PasswordResetHistory> pageItems = filteredItems.subList(fromIndex, toIndex);

        int startPage = Math.max(1, currentPage - 4);
        int endPage = Math.min(totalPages, startPage + 9);
        if (endPage - startPage < 9) {
            startPage = Math.max(1, endPage - 9);
        }
        int prevPage = Math.max(1, currentPage - 1);
        int nextPage = Math.min(totalPages, currentPage + 1);

        model.addAttribute("passwordResetHistoryList", buildPasswordResetHistoryListRows(pageItems, isEn));
        model.addAttribute("totalCount", totalCount);
        model.addAttribute("pageIndex", currentPage);
        model.addAttribute("pageSize", pageSize);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("startPage", startPage);
        model.addAttribute("endPage", endPage);
        model.addAttribute("prevPage", prevPage);
        model.addAttribute("nextPage", nextPage);
        model.addAttribute("searchKeyword", safeString(searchKeyword));
        model.addAttribute("resetSource", normalizedSource);
        return viewName;
    }

    @RequestMapping(value = { "/member/auth-group", "/auth/group", "/system/role" }, method = RequestMethod.GET)
    public String auth_group(
            @RequestParam(value = "authorCode", required = false) String authorCode,
            @RequestParam(value = "roleCategory", required = false) String roleCategory,
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "userSearchKeyword", required = false) String userSearchKeyword,
            HttpServletRequest request, Locale locale, Model model) {
        return redirectReactMigration(request, locale, "auth-group");
    }

    @GetMapping("/api/admin/auth-groups/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> authGroupPageApi(
            @RequestParam(value = "authorCode", required = false) String authorCode,
            @RequestParam(value = "roleCategory", required = false) String roleCategory,
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "userSearchKeyword", required = false) String userSearchKeyword,
            HttpServletRequest request, Locale locale) {
        Map<String, Object> response = new LinkedHashMap<>();
        boolean isEn = isEnglishRequest(request, locale);
        primeCsrfToken(request);
        String currentUserId = extractCurrentUserId(request);
        boolean webmaster = "webmaster".equalsIgnoreCase(currentUserId);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        boolean canManageScopedAuthorityGroups = webmaster || requiresOwnCompanyAccess(currentUserId, currentUserAuthorCode);
        boolean canViewGeneralAuthorityGroups = false;
        String selectedRoleCategory = resolveRoleCategory(roleCategory);

        List<AuthorInfoVO> authorGroups;
        List<AuthorInfoVO> filteredAuthorGroups;
        List<FeatureCatalogSectionVO> featureSections;
        Map<String, Integer> featureAssignmentCounts;
        List<String> selectedFeatureCodes;
        AuthGroupScopeContext scopeContext;
        String selectedAuthorCode = "";
        String selectedAuthorName = "";
        String authGroupError = "";
        boolean featureCatalogDeferred = false;
        try {
            canViewGeneralAuthorityGroups = hasGeneralAuthorityGroupAccess(currentUserId, webmaster);
            if (!canViewGeneralAuthorityGroups && "GENERAL".equals(selectedRoleCategory)) {
                selectedRoleCategory = "DEPARTMENT";
                authGroupError = isEn
                        ? "Only master authority can view general authority groups."
                        : "일반 권한 그룹은 마스터 권한이 있을 때만 조회할 수 있습니다.";
            }
            authorGroups = authGroupManageService.selectAuthorList();
            scopeContext = buildAuthGroupScopeContext(insttId, userSearchKeyword, selectedRoleCategory,
                    currentUserId, webmaster, authorGroups, isEn);
            filteredAuthorGroups = scopeContext.getReferenceAuthorGroups();
            selectedAuthorCode = resolveSelectedAuthorCode(authorCode, filteredAuthorGroups);
            if (selectedAuthorCode.isEmpty()) {
                featureAssignmentCounts = Collections.emptyMap();
                featureSections = Collections.emptyList();
                selectedFeatureCodes = Collections.emptyList();
                featureCatalogDeferred = true;
            } else {
                featureAssignmentCounts = toFeatureAssignmentCountMap(authGroupManageService.selectFeatureAssignmentStats());
                Set<String> grantableFeatureCodes = resolveGrantableFeatureCodeSet(currentUserId, webmaster);
                featureSections = filterFeatureCatalogSectionsByGrantable(
                        buildFeatureCatalogSections(
                                applyFeatureAssignmentStats(authGroupManageService.selectFeatureCatalog(), featureAssignmentCounts), isEn),
                        grantableFeatureCodes);
                selectedFeatureCodes = filterFeatureCodesByGrantable(
                        authGroupManageService.selectAuthorFeatureCodes(selectedAuthorCode),
                        grantableFeatureCodes);
            }
            selectedAuthorName = resolveSelectedAuthorName(selectedAuthorCode, filteredAuthorGroups);
            if (authGroupError.isEmpty()) {
                authGroupError = safeString(scopeContext.getErrorMessage());
            }
        } catch (Exception e) {
            log.error("Failed to load auth group page api.", e);
            authorGroups = Collections.emptyList();
            filteredAuthorGroups = Collections.emptyList();
            featureSections = Collections.emptyList();
            featureAssignmentCounts = Collections.emptyMap();
            selectedFeatureCodes = Collections.emptyList();
            scopeContext = AuthGroupScopeContext.empty();
            authGroupError = isEn
                    ? "Failed to load permission groups and feature catalog."
                    : "권한 그룹 및 기능 목록을 불러오지 못했습니다.";
            featureCatalogDeferred = false;
        }

        response.put("isEn", isEn);
        response.put("currentUserId", currentUserId);
        response.put("isWebmaster", webmaster);
        response.put("authorGroups", authorGroups);
        response.put("filteredAuthorGroups", filteredAuthorGroups);
        response.put("referenceAuthorGroups", filteredAuthorGroups);
        response.put("generalAuthorGroups", filterAuthorGroups(authorGroups, "GENERAL"));
        response.put("featureSections", featureSections);
        response.put("authorGroupCount", filteredAuthorGroups.size());
        response.put("featureCount", selectedFeatureCodes.size());
        response.put("catalogFeatureCount", countTotalFeatureCount(featureSections));
        response.put("pageCount", countSelectedPageCount(featureSections, selectedFeatureCodes));
        response.put("unassignedFeatureCount", countUnassignedFeatureCount(featureSections));
        response.put("recommendedRoleSections", filterRecommendedRoleSections(buildRecommendedRoleSections(authorGroups, isEn), selectedRoleCategory));
        response.put("assignmentAuthorities", buildAssignmentAuthorities(isEn));
        response.put("roleCategories", buildRoleCategories(isEn));
        response.put("roleCategoryOptions", buildRoleCategoryOptions(isEn, canViewGeneralAuthorityGroups));
        response.put("selectedRoleCategory", selectedRoleCategory);
        response.put("selectedAuthorCode", selectedAuthorCode);
        response.put("selectedAuthorName", selectedAuthorName);
        response.put("selectedFeatureCodes", selectedFeatureCodes);
        response.put("featureCatalogDeferred", featureCatalogDeferred);
        response.put("canViewGeneralAuthorityGroups", canViewGeneralAuthorityGroups);
        response.put("canManageScopedAuthorityGroups", canManageScopedAuthorityGroups);
        response.put("authGroupBasePath", resolveAuthGroupBasePath(request, locale));
        response.put("authGroupCreatePath", resolveAuthGroupBasePath(request, locale) + "/create");
        response.put("authGroupSaveFeaturesPath", resolveAuthGroupBasePath(request, locale) + "/save-features");
        response.put("authGroupCompanyOptions", scopeContext.getCompanyOptions());
        response.put("authGroupSelectedInsttId", scopeContext.getSelectedInsttId());
        response.put("authGroupDepartmentRows", scopeContext.getDepartmentRows());
        response.put("authGroupDepartmentRoleSummaries", scopeContext.getDepartmentRoleSummaries());
        response.put("userAuthorityTargets", scopeContext.getUserAuthorityTargets());
        response.put("userSearchKeyword", scopeContext.getUserSearchKeyword());
        response.put("authGroupError", authGroupError);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/admin/auth-groups")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createAuthGroupApi(
            @RequestBody AdminAuthGroupCreateRequestDTO payload,
            HttpServletRequest request, Locale locale) {
        Map<String, Object> response = new LinkedHashMap<>();
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        boolean webmaster = isWebmaster(currentUserId);
        boolean ownCompanyAccess = requiresOwnCompanyAccess(currentUserId, currentUserAuthorCode);
        String selectedRoleCategory = resolveRoleCategory(payload == null ? null : payload.getRoleCategory());

        if (!webmaster && !ownCompanyAccess) {
            response.put("success", false);
            response.put("message", isEn
                    ? "Only webmaster or company-scoped administrators can create authority groups."
                    : "webmaster 또는 회사 범위 관리자가 권한 그룹을 추가할 수 있습니다.");
            return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
        }
        if (!webmaster && "GENERAL".equals(selectedRoleCategory)) {
            response.put("success", false);
            response.put("message", isEn
                    ? "Company-scoped administrators can only create department or user roles."
                    : "회사 범위 관리자는 부서/사용자 권한 그룹만 생성할 수 있습니다.");
            return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
        }

        String requestedInsttId = safeString(payload == null ? null : payload.getInsttId());
        String scopedInsttId = ownCompanyAccess ? resolveCurrentUserInsttId(currentUserId) : requestedInsttId;
        boolean forceScoped = ownCompanyAccess
                || (!requestedInsttId.isEmpty() && ("DEPARTMENT".equals(selectedRoleCategory) || "USER".equals(selectedRoleCategory)));
        String normalizedCode = normalizeScopedAuthorCode(payload == null ? null : payload.getAuthorCode(), selectedRoleCategory, scopedInsttId, forceScoped);
        String normalizedName = safeString(payload == null ? null : payload.getAuthorNm());
        String normalizedDesc = safeString(payload == null ? null : payload.getAuthorDc());
        if (normalizedCode.isEmpty() || normalizedName.isEmpty()) {
            response.put("success", false);
            response.put("message", isEn ? "Role code and role name are required." : "Role 코드와 Role 명은 필수입니다.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            if (authGroupManageService.countAuthorCode(normalizedCode) > 0) {
                response.put("success", false);
                response.put("message", isEn ? "The role code already exists." : "이미 존재하는 Role 코드입니다.");
                return ResponseEntity.badRequest().body(response);
            }
            authGroupManageService.insertAuthor(normalizedCode, normalizedName, normalizedDesc);
        } catch (Exception e) {
            log.error("Failed to create authority group api. authorCode={}", normalizedCode, e);
            response.put("success", false);
            response.put("message", isEn ? "Failed to create the role group." : "권한 그룹 추가에 실패했습니다.");
            return ResponseEntity.internalServerError().body(response);
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
        response.put("success", true);
        response.put("authorCode", normalizedCode);
        response.put("roleCategory", selectedRoleCategory);
        response.put("insttId", scopedInsttId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/admin/auth-groups/features")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveAuthGroupFeaturesApi(
            @RequestBody AdminAuthGroupFeatureSaveRequestDTO payload,
            HttpServletRequest request, Locale locale) {
        Map<String, Object> response = new LinkedHashMap<>();
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        boolean webmaster = isWebmaster(currentUserId);
        boolean ownCompanyAccess = requiresOwnCompanyAccess(currentUserId, currentUserAuthorCode);
        String selectedRoleCategory = resolveRoleCategory(payload == null ? null : payload.getRoleCategory());
        String scopedInsttId = ownCompanyAccess ? resolveCurrentUserInsttId(currentUserId) : "";

        if (!webmaster && !ownCompanyAccess) {
            response.put("success", false);
            response.put("message", isEn
                    ? "Only webmaster or company-scoped administrators can update role-feature mappings."
                    : "webmaster 또는 회사 범위 관리자만 Role-기능 매핑을 수정할 수 있습니다.");
            return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
        }

        String normalizedAuthorCode = safeString(payload == null ? null : payload.getAuthorCode()).toUpperCase(Locale.ROOT);
        if (normalizedAuthorCode.isEmpty()) {
            response.put("success", false);
            response.put("message", isEn ? "Role code is required." : "Role 코드를 확인해 주세요.");
            return ResponseEntity.badRequest().body(response);
        }
        if (!webmaster) {
            if ("GENERAL".equals(selectedRoleCategory)) {
                response.put("success", false);
                response.put("message", isEn
                        ? "Company-scoped administrators can only update department or user roles."
                        : "회사 범위 관리자는 부서/사용자 권한 그룹만 수정할 수 있습니다.");
                return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
            }
            if (!isCompanyScopedAuthorCodeForInstt(normalizedAuthorCode, selectedRoleCategory, scopedInsttId)) {
                response.put("success", false);
                response.put("message", isEn
                        ? "You can only update role groups created for your own company."
                        : "본인 회사에 속한 권한 그룹만 수정할 수 있습니다.");
                return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
            }
        }

        Set<String> grantableFeatureCodes;
        try {
            grantableFeatureCodes = resolveGrantableFeatureCodeSet(currentUserId, webmaster);
            authGroupManageService.saveAuthorFeatureRelations(
                    normalizedAuthorCode,
                    mergeRoleFeatureSelection(
                            normalizedAuthorCode,
                            payload == null ? Collections.emptyList() : payload.getFeatureCodes(),
                            grantableFeatureCodes));
        } catch (Exception e) {
            log.error("Failed to save role-feature relations api. authorCode={}", normalizedAuthorCode, e);
            response.put("success", false);
            response.put("message", isEn ? "Failed to save role-feature mappings." : "Role-기능 매핑 저장에 실패했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }

        List<String> savedFeatureCodes = filterFeatureCodesByGrantable(
                payload == null ? Collections.emptyList() : payload.getFeatureCodes(),
                grantableFeatureCodes);
        response.put("success", true);
        response.put("authorCode", normalizedAuthorCode);
        response.put("featureCount", savedFeatureCodes.size());
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
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = { "/member/auth-change", "/system/auth-change" }, method = RequestMethod.GET)
    public String auth_change(
            @RequestParam(value = "updated", required = false) String updated,
            @RequestParam(value = "targetUserId", required = false) String targetUserId,
            @RequestParam(value = "error", required = false) String error,
            HttpServletRequest request, Locale locale, Model model) {
        return redirectReactMigration(request, locale, "auth-change");
    }

    @GetMapping("/api/admin/auth-change/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> authChangePageApi(
            @RequestParam(value = "updated", required = false) String updated,
            @RequestParam(value = "targetUserId", required = false) String targetUserId,
            @RequestParam(value = "error", required = false) String error,
            HttpServletRequest request, Locale locale) {
        Map<String, Object> response = new LinkedHashMap<>();
        boolean isEn = isEnglishRequest(request, locale);
        primeCsrfToken(request);
        String currentUserId = extractCurrentUserId(request);
        boolean isWebmaster = isWebmaster(currentUserId);
        String authChangeError = "";
        List<AdminRoleAssignmentVO> assignments;
        List<AuthorInfoVO> authorGroups;
        int assignmentCount;
        try {
            assignments = authGroupManageService.selectAdminRoleAssignments();
            authorGroups = filterAuthorGroups(authGroupManageService.selectAuthorList(), "GENERAL");
            assignmentCount = assignments.size();
        } catch (Exception e) {
            log.error("Failed to load auth change page api.", e);
            assignments = Collections.emptyList();
            authorGroups = Collections.emptyList();
            assignmentCount = 0;
            authChangeError = isEn
                    ? "Failed to load user role assignments."
                    : "사용자 권한 변경 목록을 불러오지 못했습니다.";
        }

        response.put("isEn", isEn);
        response.put("currentUserId", currentUserId);
        response.put("isWebmaster", isWebmaster);
        response.put("roleAssignments", assignments);
        response.put("authorGroups", authorGroups);
        response.put("assignmentCount", assignmentCount);
        response.put("authChangeUpdated", "true".equalsIgnoreCase(safeString(updated)));
        response.put("authChangeTargetUserId", safeString(targetUserId));
        response.put("authChangeMessage", resolveAuthChangeMessage(error, isEn));
        response.put("authChangeError", authChangeError);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/admin/auth-change/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveAuthChangeApi(
            @RequestBody AdminAuthChangeSaveRequestDTO payload,
            HttpServletRequest request, Locale locale) {
        Map<String, Object> response = new LinkedHashMap<>();
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        if (!isWebmaster(currentUserId)) {
            response.put("success", false);
            response.put("message", isEn
                    ? "Only webmaster can change administrator roles."
                    : "webmaster만 관리자 권한을 변경할 수 있습니다.");
            return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
        }

        String normalizedEmplyrId = safeString(payload == null ? null : payload.getEmplyrId());
        String normalizedAuthorCode = safeString(payload == null ? null : payload.getAuthorCode()).toUpperCase(Locale.ROOT);
        if (normalizedEmplyrId.isEmpty() || normalizedAuthorCode.isEmpty()) {
            response.put("success", false);
            response.put("message", isEn
                    ? "Administrator ID and role are required."
                    : "관리자 ID와 권한 그룹을 확인해 주세요.");
            return ResponseEntity.badRequest().body(response);
        }
        if ("webmaster".equalsIgnoreCase(normalizedEmplyrId) && !"ROLE_SYSTEM_MASTER".equalsIgnoreCase(normalizedAuthorCode)) {
            response.put("success", false);
            response.put("message", isEn
                    ? "webmaster must keep ROLE_SYSTEM_MASTER."
                    : "webmaster 계정은 ROLE_SYSTEM_MASTER만 유지할 수 있습니다.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            authGroupManageService.updateAdminRoleAssignment(normalizedEmplyrId, normalizedAuthorCode);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Failed to save admin role assignment api. emplyrId={}, authorCode={}", normalizedEmplyrId, normalizedAuthorCode, e);
            response.put("success", false);
            response.put("message", isEn
                    ? "Failed to save administrator role assignment."
                    : "관리자 권한 변경 저장에 실패했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }

        response.put("success", true);
        response.put("emplyrId", normalizedEmplyrId);
        response.put("authorCode", normalizedAuthorCode);
        recordAdminActionAudit(request,
                currentUserId,
                resolveCurrentUserAuthorCode(currentUserId),
                "AMENU_AUTH_CHANGE",
                "auth-change",
                "ADMIN_ROLE_ASSIGNMENT_SAVE",
                "ADMIN",
                normalizedEmplyrId,
                "{\"emplyrId\":\"" + safeJson(normalizedEmplyrId) + "\",\"authorCode\":\"" + safeJson(normalizedAuthorCode) + "\"}",
                "{\"status\":\"SUCCESS\"}");
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = { "/member/auth-change/save", "/system/auth-change/save" }, method = RequestMethod.POST)
    public String saveAuthChange(
            @RequestParam(value = "emplyrId", required = false) String emplyrId,
            @RequestParam(value = "authorCode", required = false) String authorCode,
            HttpServletRequest request, Locale locale, Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        if (!isWebmaster(currentUserId)) {
            model.addAttribute("authChangeError", isEn
                    ? "Only webmaster can change administrator roles."
                    : "webmaster만 관리자 권한을 변경할 수 있습니다.");
            return auth_change(null, null, null, request, locale, model);
        }

        String normalizedEmplyrId = safeString(emplyrId);
        String normalizedAuthorCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        if (normalizedEmplyrId.isEmpty() || normalizedAuthorCode.isEmpty()) {
            model.addAttribute("authChangeError", isEn
                    ? "Administrator ID and role are required."
                    : "관리자 ID와 권한 그룹을 확인해 주세요.");
            return auth_change(null, null, null, request, locale, model);
        }
        if ("webmaster".equalsIgnoreCase(normalizedEmplyrId) && !"ROLE_SYSTEM_MASTER".equalsIgnoreCase(normalizedAuthorCode)) {
            model.addAttribute("authChangeError", isEn
                    ? "webmaster must keep ROLE_SYSTEM_MASTER."
                    : "webmaster 계정은 ROLE_SYSTEM_MASTER만 유지할 수 있습니다.");
            return auth_change(null, null, null, request, locale, model);
        }

        try {
            authGroupManageService.updateAdminRoleAssignment(normalizedEmplyrId, normalizedAuthorCode);
        } catch (IllegalArgumentException e) {
            model.addAttribute("authChangeError", e.getMessage());
            return auth_change(null, null, null, request, locale, model);
        } catch (Exception e) {
            log.error("Failed to save admin role assignment. emplyrId={}, authorCode={}", normalizedEmplyrId, normalizedAuthorCode, e);
            return "redirect:" + buildAuthChangeRedirectUrl(request, locale, normalizedEmplyrId, "save_failed");
        }

        return "redirect:" + buildAuthChangeRedirectUrl(request, locale, normalizedEmplyrId, null);
    }

    @RequestMapping(value = { "/member/dept-role-mapping", "/system/dept-role-mapping" }, method = RequestMethod.GET)
    public String dept_role_mapping(
            @RequestParam(value = "updated", required = false) String updated,
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "error", required = false) String error,
            HttpServletRequest request, Locale locale, Model model) {
        return redirectReactMigration(request, locale, "dept-role");
    }

    @GetMapping("/api/admin/dept-role-mapping/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deptRoleMappingPageApi(
            @RequestParam(value = "updated", required = false) String updated,
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "error", required = false) String error,
            HttpServletRequest request, Locale locale) {
        Map<String, Object> response = new LinkedHashMap<>();
        boolean isEn = isEnglishRequest(request, locale);
        primeCsrfToken(request);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        boolean globalDeptRoleAccess = hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode);
        boolean ownCompanyDeptRoleAccess = hasOwnCompanyDeptRoleAccess(currentUserId, currentUserAuthorCode);
        String deptRoleError = "";

        List<Map<String, String>> departmentRows;
        List<AuthorInfoVO> authorGroups;
        List<AuthorInfoVO> memberAssignableAuthorGroups;
        List<Map<String, String>> companyOptions;
        String selectedInsttId;
        List<UserAuthorityTargetVO> companyMembers;
        int companyMemberCount;
        int mappingCount;
        try {
            List<DepartmentRoleMappingVO> mappings = authGroupManageService.selectDepartmentRoleMappings();
            List<AuthorInfoVO> allAuthorGroups = authGroupManageService.selectAuthorList();
            String currentUserInsttId = resolveCurrentUserInsttId(currentUserId);
            String scopedInsttId = globalDeptRoleAccess ? safeString(insttId) : currentUserInsttId;
            departmentRows = buildDepartmentRoleRows(mappings, isEn);
            companyOptions = buildDepartmentCompanyOptions(departmentRows);
            if (!globalDeptRoleAccess) {
                companyOptions = companyOptions.stream()
                        .filter(option -> currentUserInsttId.equals(option.get("insttId")))
                        .collect(Collectors.toList());
            }
            String requestedInsttId = globalDeptRoleAccess ? insttId : currentUserInsttId;
            selectedInsttId = resolveSelectedInsttId(requestedInsttId, companyOptions);
            if (!selectedInsttId.isEmpty()) {
                final String selectedInsttIdValue = selectedInsttId;
                departmentRows = departmentRows.stream()
                        .filter(row -> selectedInsttIdValue.equals(row.get("insttId")))
                        .collect(Collectors.toList());
            }
            String authorScopeInsttId = !selectedInsttId.isEmpty() ? selectedInsttId : scopedInsttId;
            authorGroups = filterScopedDepartmentAuthorGroups(
                    filterAuthorGroupsByScope(allAuthorGroups, "DEPARTMENT", authorScopeInsttId, globalDeptRoleAccess),
                    departmentRows);
            companyMembers = selectedInsttId.isEmpty()
                    ? Collections.emptyList()
                    : authGroupManageService.selectUserAuthorityTargets(selectedInsttId, null);
            memberAssignableAuthorGroups = buildDeptMemberAssignableGroups(allAuthorGroups, authorScopeInsttId, globalDeptRoleAccess);
            companyMemberCount = companyMembers.size();
            mappingCount = departmentRows.size();
        } catch (Exception e) {
            log.error("Failed to load department role mapping page api.", e);
            deptRoleError = isEn
                    ? "Failed to load department role mappings."
                    : "부서 권한 맵핑 목록을 불러오지 못했습니다.";
            departmentRows = Collections.emptyList();
            authorGroups = Collections.emptyList();
            memberAssignableAuthorGroups = Collections.emptyList();
            companyOptions = Collections.emptyList();
            selectedInsttId = "";
            companyMembers = Collections.emptyList();
            companyMemberCount = 0;
            mappingCount = 0;
        }

        response.put("isEn", isEn);
        response.put("deptRoleUpdated", "true".equalsIgnoreCase(safeString(updated)));
        response.put("deptRoleTargetInsttId", safeString(insttId));
        response.put("deptRoleMessage", resolveDeptRoleMessage(error, isEn));
        response.put("deptRoleError", deptRoleError);
        response.put("currentUserId", currentUserId);
        response.put("isWebmaster", isWebmaster(currentUserId));
        response.put("canManageAllCompanies", globalDeptRoleAccess);
        response.put("canManageOwnCompany", ownCompanyDeptRoleAccess);
        response.put("departmentMappings", departmentRows);
        response.put("departmentAuthorGroups", authorGroups);
        response.put("memberAssignableAuthorGroups", memberAssignableAuthorGroups);
        response.put("departmentCompanyOptions", companyOptions);
        response.put("selectedInsttId", selectedInsttId);
        response.put("companyMembers", companyMembers);
        response.put("companyMemberCount", companyMemberCount);
        response.put("mappingCount", mappingCount);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/admin/dept-role-mapping/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveDeptRoleMappingApi(
            @RequestBody AdminDeptRoleMappingSaveRequestDTO payload,
            HttpServletRequest request, Locale locale) {
        Map<String, Object> response = new LinkedHashMap<>();
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        boolean globalDeptRoleAccess = hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode);
        boolean ownCompanyDeptRoleAccess = hasOwnCompanyDeptRoleAccess(currentUserId, currentUserAuthorCode);
        String currentUserInsttId = resolveCurrentUserInsttId(currentUserId);
        if (!globalDeptRoleAccess && !ownCompanyDeptRoleAccess) {
            response.put("success", false);
            response.put("message", isEn
                    ? "You do not have permission to change department role mappings."
                    : "부서 권한 맵핑을 변경할 권한이 없습니다.");
            return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
        }

        String normalizedInsttId = safeString(payload == null ? null : payload.getInsttId());
        String normalizedCmpnyNm = safeString(payload == null ? null : payload.getCmpnyNm());
        String normalizedDeptNm = safeString(payload == null ? null : payload.getDeptNm());
        String normalizedAuthorCode = safeString(payload == null ? null : payload.getAuthorCode()).toUpperCase(Locale.ROOT);
        if (normalizedInsttId.isEmpty() || normalizedDeptNm.isEmpty() || normalizedAuthorCode.isEmpty()) {
            response.put("success", false);
            response.put("message", isEn
                    ? "Company ID, department, and role are required."
                    : "회사 ID, 부서명, 권한 그룹을 확인해 주세요.");
            return ResponseEntity.badRequest().body(response);
        }
        if (!globalDeptRoleAccess && !normalizedInsttId.equals(currentUserInsttId)) {
            response.put("success", false);
            response.put("message", isEn
                    ? "You can only change department role mappings for your own company."
                    : "본인 회사의 부서 권한 맵핑만 변경할 수 있습니다.");
            return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
        }
        if (!canAssignDepartmentAuthorCode(normalizedAuthorCode, normalizedInsttId, globalDeptRoleAccess)) {
            response.put("success", false);
            response.put("message", isEn
                    ? "You can only assign department roles allowed for the selected company."
                    : "선택한 회사에서 허용된 부서 권한만 지정할 수 있습니다.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            authGroupManageService.saveDepartmentRoleMapping(
                    normalizedInsttId,
                    normalizedCmpnyNm,
                    normalizedDeptNm,
                    normalizedAuthorCode,
                    currentUserId);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Failed to save department role mapping api. insttId={}, deptNm={}, authorCode={}",
                    normalizedInsttId, normalizedDeptNm, normalizedAuthorCode, e);
            response.put("success", false);
            response.put("message", isEn
                    ? "Failed to save department role mapping."
                    : "부서 권한 맵핑 저장에 실패했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }

        response.put("success", true);
        response.put("insttId", normalizedInsttId);
        response.put("deptNm", normalizedDeptNm);
        response.put("authorCode", normalizedAuthorCode);
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
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/admin/dept-role-mapping/member-save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveDeptRoleMemberApi(
            @RequestBody AdminDeptRoleMemberSaveRequestDTO payload,
            HttpServletRequest request, Locale locale) {
        Map<String, Object> response = new LinkedHashMap<>();
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        boolean globalDeptRoleAccess = hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode);
        boolean ownCompanyDeptRoleAccess = hasOwnCompanyDeptRoleAccess(currentUserId, currentUserAuthorCode);

        String normalizedInsttId = safeString(payload == null ? null : payload.getInsttId());
        String normalizedEntrprsMberId = safeString(payload == null ? null : payload.getEntrprsMberId());
        String normalizedAuthorCode = safeString(payload == null ? null : payload.getAuthorCode()).toUpperCase(Locale.ROOT);
        if (normalizedInsttId.isEmpty() || normalizedEntrprsMberId.isEmpty() || normalizedAuthorCode.isEmpty()) {
            response.put("success", false);
            response.put("message", isEn
                    ? "Company, member, and role are required."
                    : "회사, 회원, 권한 그룹을 확인해 주세요.");
            return ResponseEntity.badRequest().body(response);
        }

        String currentUserInsttId = resolveCurrentUserInsttId(currentUserId);
        try {
            String targetInsttId = safeString(authGroupManageService.selectEnterpriseInsttIdByUserId(normalizedEntrprsMberId));
            if (!globalDeptRoleAccess && ownCompanyDeptRoleAccess && !normalizedInsttId.equals(currentUserInsttId)) {
                response.put("success", false);
                response.put("message", isEn
                        ? "You can only update members in your own company."
                        : "본인 회사 소속 회원만 수정할 수 있습니다.");
                return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
            }
            if (!globalDeptRoleAccess && !ownCompanyDeptRoleAccess) {
                response.put("success", false);
                response.put("message", isEn
                        ? "You do not have permission to update company member roles."
                        : "회사 회원 권한을 변경할 권한이 없습니다.");
                return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(response);
            }
            if (!targetInsttId.isEmpty() && !normalizedInsttId.equals(targetInsttId)) {
                response.put("success", false);
                response.put("message", isEn
                        ? "Selected company and member company do not match."
                        : "선택한 회사와 회원 소속 회사가 일치하지 않습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            if (!canAssignMemberAuthorCode(normalizedAuthorCode, normalizedInsttId, globalDeptRoleAccess)) {
                response.put("success", false);
                response.put("message", isEn
                        ? "You can only assign roles allowed for the selected company."
                        : "선택한 회사에서 허용된 권한만 부여할 수 있습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            authGroupManageService.updateEnterpriseUserRoleAssignment(normalizedEntrprsMberId, normalizedAuthorCode);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Failed to save company member role api. insttId={}, entrprsMberId={}, authorCode={}",
                    normalizedInsttId, normalizedEntrprsMberId, normalizedAuthorCode, e);
            response.put("success", false);
            response.put("message", isEn
                    ? "Failed to save company member role."
                    : "회사 회원 권한 저장에 실패했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }

        response.put("success", true);
        response.put("insttId", normalizedInsttId);
        response.put("entrprsMberId", normalizedEntrprsMberId);
        response.put("authorCode", normalizedAuthorCode);
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
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = { "/member/dept-role-mapping/save", "/system/dept-role-mapping/save" }, method = RequestMethod.POST)
    public String saveDeptRoleMapping(
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "cmpnyNm", required = false) String cmpnyNm,
            @RequestParam(value = "deptNm", required = false) String deptNm,
            @RequestParam(value = "authorCode", required = false) String authorCode,
            HttpServletRequest request, Locale locale, Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        boolean globalDeptRoleAccess = hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode);
        boolean ownCompanyDeptRoleAccess = hasOwnCompanyDeptRoleAccess(currentUserId, currentUserAuthorCode);
        String currentUserInsttId = resolveCurrentUserInsttId(currentUserId);
        if (!globalDeptRoleAccess && !ownCompanyDeptRoleAccess) {
            model.addAttribute("deptRoleError", isEn
                    ? "You do not have permission to change department role mappings."
                    : "부서 권한 맵핑을 변경할 권한이 없습니다.");
            return dept_role_mapping(null, null, null, request, locale, model);
        }

        String normalizedInsttId = safeString(insttId);
        String normalizedCmpnyNm = safeString(cmpnyNm);
        String normalizedDeptNm = safeString(deptNm);
        String normalizedAuthorCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        if (normalizedInsttId.isEmpty() || normalizedDeptNm.isEmpty() || normalizedAuthorCode.isEmpty()) {
            model.addAttribute("deptRoleError", isEn
                    ? "Company ID, department, and role are required."
                    : "회사 ID, 부서명, 권한 그룹을 확인해 주세요.");
            return dept_role_mapping(null, null, null, request, locale, model);
        }
        if (!globalDeptRoleAccess && !normalizedInsttId.equals(currentUserInsttId)) {
            model.addAttribute("deptRoleError", isEn
                    ? "You can only change department role mappings for your own company."
                    : "본인 회사의 부서 권한 맵핑만 변경할 수 있습니다.");
            return dept_role_mapping(null, currentUserInsttId, null, request, locale, model);
        }
        if (!canAssignDepartmentAuthorCode(normalizedAuthorCode, normalizedInsttId, globalDeptRoleAccess)) {
            model.addAttribute("deptRoleError", isEn
                    ? "You can only assign department roles allowed for the selected company."
                    : "선택한 회사에서 허용된 부서 권한만 지정할 수 있습니다.");
            return dept_role_mapping(null, normalizedInsttId, null, request, locale, model);
        }

        try {
            authGroupManageService.saveDepartmentRoleMapping(
                    normalizedInsttId,
                    normalizedCmpnyNm,
                    normalizedDeptNm,
                    normalizedAuthorCode,
                    currentUserId);
        } catch (IllegalArgumentException e) {
            model.addAttribute("deptRoleError", e.getMessage());
            return dept_role_mapping(null, null, null, request, locale, model);
        } catch (Exception e) {
            log.error("Failed to save department role mapping. insttId={}, deptNm={}, authorCode={}",
                    normalizedInsttId, normalizedDeptNm, normalizedAuthorCode, e);
            return "redirect:" + buildDeptRoleRedirectUrl(request, locale, normalizedInsttId, "save_failed");
        }

        return "redirect:" + buildDeptRoleRedirectUrl(request, locale, normalizedInsttId, null);
    }

    @RequestMapping(value = { "/member/dept-role-mapping/member-save", "/system/dept-role-mapping/member-save" }, method = RequestMethod.POST)
    public String saveDeptRoleMember(
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "entrprsMberId", required = false) String entrprsMberId,
            @RequestParam(value = "authorCode", required = false) String authorCode,
            HttpServletRequest request, Locale locale, Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String currentUserId = extractCurrentUserId(request);
        String currentUserAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        boolean globalDeptRoleAccess = hasGlobalDeptRoleAccess(currentUserId, currentUserAuthorCode);
        boolean ownCompanyDeptRoleAccess = hasOwnCompanyDeptRoleAccess(currentUserId, currentUserAuthorCode);

        String normalizedInsttId = safeString(insttId);
        String normalizedEntrprsMberId = safeString(entrprsMberId);
        String normalizedAuthorCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        if (normalizedInsttId.isEmpty() || normalizedEntrprsMberId.isEmpty() || normalizedAuthorCode.isEmpty()) {
            model.addAttribute("deptRoleError", isEn
                    ? "Company, member, and role are required."
                    : "회사, 회원, 권한 그룹을 확인해 주세요.");
            return dept_role_mapping(null, normalizedInsttId, null, request, locale, model);
        }

        String currentUserInsttId = resolveCurrentUserInsttId(currentUserId);
        try {
            String targetInsttId = safeString(authGroupManageService.selectEnterpriseInsttIdByUserId(normalizedEntrprsMberId));
            if (!globalDeptRoleAccess && ownCompanyDeptRoleAccess && !normalizedInsttId.equals(currentUserInsttId)) {
                model.addAttribute("deptRoleError", isEn
                        ? "You can only update members in your own company."
                        : "본인 회사 소속 회원만 수정할 수 있습니다.");
                return dept_role_mapping(null, currentUserInsttId, null, request, locale, model);
            }
            if (!globalDeptRoleAccess && !ownCompanyDeptRoleAccess) {
                model.addAttribute("deptRoleError", isEn
                        ? "You do not have permission to update company member roles."
                        : "회사 회원 권한을 변경할 권한이 없습니다.");
                return dept_role_mapping(null, normalizedInsttId, null, request, locale, model);
            }
            if (!targetInsttId.isEmpty() && !normalizedInsttId.equals(targetInsttId)) {
                model.addAttribute("deptRoleError", isEn
                        ? "Selected company and member company do not match."
                        : "선택한 회사와 회원 소속 회사가 일치하지 않습니다.");
                return dept_role_mapping(null, normalizedInsttId, null, request, locale, model);
            }
            if (!canAssignMemberAuthorCode(normalizedAuthorCode, normalizedInsttId, globalDeptRoleAccess)) {
                model.addAttribute("deptRoleError", isEn
                        ? "You can only assign roles allowed for the selected company."
                        : "선택한 회사에서 허용된 권한만 부여할 수 있습니다.");
                return dept_role_mapping(null, normalizedInsttId, null, request, locale, model);
            }
            authGroupManageService.updateEnterpriseUserRoleAssignment(normalizedEntrprsMberId, normalizedAuthorCode);
        } catch (IllegalArgumentException e) {
            model.addAttribute("deptRoleError", e.getMessage());
            return dept_role_mapping(null, normalizedInsttId, null, request, locale, model);
        } catch (Exception e) {
            log.error("Failed to save company member role. insttId={}, entrprsMberId={}, authorCode={}",
                    normalizedInsttId, normalizedEntrprsMberId, normalizedAuthorCode, e);
            return "redirect:" + buildDeptRoleRedirectUrl(request, locale, normalizedInsttId, "save_failed");
        }

        return "redirect:" + buildDeptRoleRedirectUrl(request, locale, normalizedInsttId, null);
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

    @RequestMapping(value = "/member/list/excel", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<byte[]> member_listExcel(
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "membershipType", required = false) String membershipType,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus) throws Exception {
        EntrprsManageVO searchVO = new EntrprsManageVO();
        searchVO.setPageIndex(1);
        searchVO.setFirstIndex(0);

        String keyword = searchKeyword == null ? "" : searchKeyword.trim();
        searchVO.setSearchKeyword(keyword);
        searchVO.setSearchCondition("all");

        String memberType = membershipType == null ? "" : membershipType.trim().toUpperCase();
        if (!memberType.isEmpty()) {
            String dbTypeCode = normalizeMembershipCode(memberType);
            if (!dbTypeCode.isEmpty()) {
                searchVO.setEntrprsSeCode(dbTypeCode);
            }
        }

        String status = sbscrbSttus == null ? "" : sbscrbSttus.trim();
        if (!status.isEmpty()) {
            searchVO.setSbscrbSttus(status);
        }

        int totalCount = entrprsManageService.selectEntrprsMberListTotCnt(searchVO);
        searchVO.setRecordCountPerPage(Math.max(totalCount, 1));

        @SuppressWarnings("unchecked")
        List<EntrprsManageVO> member_list = (List<EntrprsManageVO>) (List<?>) entrprsManageService.selectEntrprsMberList(searchVO);

        byte[] content;
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("회원목록");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            DataFormat dataFormat = workbook.createDataFormat();
            CellStyle dateTimeStyle = workbook.createCellStyle();
            dateTimeStyle.setDataFormat(dataFormat.getFormat("yyyy-mm-dd hh:mm:ss"));
            dateTimeStyle.setAlignment(HorizontalAlignment.CENTER);

            String[] headers = {"번호", "회원명", "아이디", "회원유형", "소속기관", "가입일", "상태"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(headers[i]);
                c.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            int no = totalCount;
            for (EntrprsManageVO m : member_list) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(no--);
                row.createCell(1).setCellValue(safeString(m.getApplcntNm()));
                row.createCell(2).setCellValue(safeString(m.getEntrprsmberId()));
                row.createCell(3).setCellValue(resolveMembershipTypeLabel(m.getEntrprsSeCode()));
                row.createCell(4).setCellValue(safeString(m.getCmpnyNm()));

                Cell joinDateCell = row.createCell(5);
                Date joinDate = parseJoinDate(m.getSbscrbDe());
                if (joinDate != null) {
                    joinDateCell.setCellValue(joinDate);
                    joinDateCell.setCellStyle(dateTimeStyle);
                } else {
                    joinDateCell.setCellValue(safeString(m.getSbscrbDe()));
                }

                row.createCell(6).setCellValue(resolveStatusLabel(m.getEntrprsMberSttus()));
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                int width = sheet.getColumnWidth(i);
                sheet.setColumnWidth(i, Math.min(width + 1024, 256 * 50));
            }

            workbook.write(out);
            content = out.toByteArray();
        }

        String baseName = "member_list_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";
        String encoded = URLEncoder.encode(baseName, StandardCharsets.UTF_8.name()).replaceAll("\\+", "%20");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encoded);

        return ResponseEntity.ok()
                .headers(headers)
                .body(content);
    }

    @RequestMapping(value = { "/member/admin_list/excel", "/member/admin-list/excel" }, method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<byte[]> adminListExcel(
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus) throws Exception {
        String keyword = safeString(searchKeyword);
        String status = safeString(sbscrbSttus).toUpperCase(Locale.ROOT);
        Sort sort = Sort.by(Sort.Direction.DESC, "sbscrbDe");

        Page<EmplyrInfo> countPage = employMemberRepository.searchAdminMembers(keyword, status,
                PageRequest.of(0, 1, sort));
        int totalCount = (int) countPage.getTotalElements();
        int pageSize = Math.max(totalCount, 1);
        Page<EmplyrInfo> listPage = employMemberRepository.searchAdminMembers(keyword, status,
                PageRequest.of(0, pageSize, sort));
        List<EmplyrInfo> member_list = listPage.getContent();

        byte[] content;
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("관리자목록");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            DataFormat dataFormat = workbook.createDataFormat();
            CellStyle dateTimeStyle = workbook.createCellStyle();
            dateTimeStyle.setDataFormat(dataFormat.getFormat("yyyy-mm-dd hh:mm:ss"));
            dateTimeStyle.setAlignment(HorizontalAlignment.CENTER);

            String[] headers = {"번호", "성명", "아이디", "조직 ID", "이메일", "가입일", "상태"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(headers[i]);
                c.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            int no = totalCount;
            for (EmplyrInfo m : member_list) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(no--);
                row.createCell(1).setCellValue(safeString(m.getUserNm()));
                row.createCell(2).setCellValue(safeString(m.getEmplyrId()));
                row.createCell(3).setCellValue(safeString(m.getOrgnztId()));
                row.createCell(4).setCellValue(safeString(m.getEmailAdres()));

                Cell joinDateCell = row.createCell(5);
                if (m.getSbscrbDe() != null) {
                    joinDateCell.setCellValue(java.sql.Timestamp.valueOf(m.getSbscrbDe()));
                    joinDateCell.setCellStyle(dateTimeStyle);
                } else {
                    joinDateCell.setCellValue("-");
                }

                row.createCell(6).setCellValue(resolveStatusLabel(m.getEmplyrStusCode()));
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                int width = sheet.getColumnWidth(i);
                sheet.setColumnWidth(i, Math.min(width + 1024, 256 * 50));
            }

            workbook.write(out);
            content = out.toByteArray();
        }

        String baseName = "admin_list_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";
        String encoded = URLEncoder.encode(baseName, StandardCharsets.UTF_8.name()).replaceAll("\\+", "%20");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encoded);

        return ResponseEntity.ok()
                .headers(headers)
                .body(content);
    }

    @RequestMapping(value = "/member/company_list/excel", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<byte[]> company_listExcel(
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus) throws Exception {
        String keyword = safeString(searchKeyword);
        String status = safeString(sbscrbSttus).toUpperCase(Locale.ROOT);

        int totalCount = entrprsManageService.searchCompanyListTotCnt(keyword, status);
        int pageSize = Math.max(totalCount, 1);
        List<CompanyListItemVO> company_list = entrprsManageService.searchCompanyListPaged(keyword, status, 0, pageSize);

        byte[] content;
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("회원사목록");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            String[] headers = {"번호", "기관명", "사업자등록번호", "대표자명", "상태"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(headers[i]);
                c.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            int no = totalCount;
            for (CompanyListItemVO company : company_list) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(no--);
                row.createCell(1).setCellValue(stringValue(company.getCmpnyNm()));
                row.createCell(2).setCellValue(stringValue(company.getBizrno()));
                row.createCell(3).setCellValue(stringValue(company.getCxfc()));
                row.createCell(4).setCellValue(resolveInstitutionStatusLabel(stringValue(company.getJoinStat())));
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                int width = sheet.getColumnWidth(i);
                sheet.setColumnWidth(i, Math.min(width + 1024, 256 * 50));
            }

            workbook.write(out);
            content = out.toByteArray();
        }

        String baseName = "company_list_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";
        String encoded = URLEncoder.encode(baseName, StandardCharsets.UTF_8.name()).replaceAll("\\+", "%20");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encoded);

        return ResponseEntity.ok()
                .headers(headers)
                .body(content);
    }

    @RequestMapping(value = "/**", method = { RequestMethod.GET, RequestMethod.POST })
    public String adminFallback(HttpServletRequest request, Locale locale, Model model) {
        String accessToken = jwtProvider.getCookie(request, "accessToken");
        if (ObjectUtils.isEmpty(accessToken)) {
            return resolveAdminLoginRedirect(request);
        }
        MenuInfoDTO menu = loadMenuByRequestPath(request);
        if (menu != null) {
            populateAdminFallbackModel(model, request, locale, menu);
            if (isEnglishRequest(request, locale)) {
                return "egovframework/com/admin/menu_placeholder_en";
            }
            return "egovframework/com/admin/menu_placeholder";
        }
        if (isEnglishRequest(request, locale)) {
            return "egovframework/com/admin/index_en";
        }
        return "egovframework/com/admin/index";
    }

    private MenuInfoDTO loadMenuByRequestPath(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        String requestUri = request.getRequestURI();
        if (ObjectUtils.isEmpty(requestUri)) {
            return null;
        }
        String normalized = requestUri.startsWith("/en/") ? requestUri.substring(3) : requestUri;
        try {
            MenuInfoDTO menu = menuInfoService.selectMenuDetailByUrl(normalized);
            if (menu == null || ObjectUtils.isEmpty(menu.getCode())) {
                return null;
            }
            return menu;
        } catch (Exception e) {
            log.error("Failed to load fallback admin menu. path={}", normalized, e);
            return null;
        }
    }

    private void populateAdminFallbackModel(Model model, HttpServletRequest request, Locale locale, MenuInfoDTO menu) {
        boolean isEn = isEnglishRequest(request, locale);
        model.addAttribute("placeholderTitle", isEn ? fallbackLabel(menu.getCodeDc(), menu.getCodeNm()) : fallbackLabel(menu.getCodeNm(), menu.getCodeDc()));
        model.addAttribute("placeholderTitleEn", fallbackLabel(menu.getCodeDc(), menu.getCodeNm()));
        model.addAttribute("placeholderCode", safeString(menu.getCode()));
        model.addAttribute("placeholderUrl", request.getRequestURI());
        model.addAttribute("placeholderIcon", safeString(menu.getMenuIcon()).isEmpty() ? "web" : safeString(menu.getMenuIcon()));
    }

    private String fallbackLabel(String primary, String fallback) {
        String value = safeString(primary);
        return value.isEmpty() ? safeString(fallback) : value;
    }

    private String resolveAdminLoginRedirect(HttpServletRequest request) {
        return "redirect:" + adminPrefix(request, null) + "/login/loginView";
    }

    private List<FeatureCatalogSectionVO> buildFeatureCatalogSections(List<FeatureCatalogItemVO> featureRows, boolean isEn) {
        Map<String, FeatureCatalogSectionVO> sectionMap = new java.util.LinkedHashMap<>();
        for (FeatureCatalogItemVO row : featureRows) {
            String mappedMenuUrl = ReactPageUrlMapper.toRuntimeUrl(row.getMenuUrl(), isEn);
            row.setMenuUrl(mappedMenuUrl.isEmpty() ? row.getMenuUrl() : mappedMenuUrl);
            FeatureCatalogSectionVO section = sectionMap.computeIfAbsent(row.getMenuCode(), key -> {
                FeatureCatalogSectionVO value = new FeatureCatalogSectionVO();
                value.setMenuCode(row.getMenuCode());
                value.setMenuNm(row.getMenuNm());
                value.setMenuNmEn(row.getMenuNmEn());
                value.setMenuUrl(row.getMenuUrl());
                return value;
            });
            section.getFeatures().add(row);
        }
        return new ArrayList<>(sectionMap.values());
    }

    private List<FeatureCatalogItemVO> applyFeatureAssignmentStats(
            List<FeatureCatalogItemVO> featureRows,
            Map<String, Integer> featureAssignmentCounts) {
        if (featureRows == null || featureRows.isEmpty()) {
            return Collections.emptyList();
        }
        for (FeatureCatalogItemVO row : featureRows) {
            String featureCode = safeString(row.getFeatureCode()).toUpperCase(Locale.ROOT);
            int assignedRoleCount = featureAssignmentCounts.getOrDefault(featureCode, 0);
            row.setAssignedRoleCount(assignedRoleCount);
            row.setUnassignedToRole(assignedRoleCount == 0);
        }
        return featureRows;
    }

    private Map<String, Integer> toFeatureAssignmentCountMap(List<FeatureAssignmentStatVO> stats) {
        if (stats == null || stats.isEmpty()) {
            return Collections.emptyMap();
        }
        Map<String, Integer> result = new LinkedHashMap<>();
        for (FeatureAssignmentStatVO stat : stats) {
            String featureCode = safeString(stat.getFeatureCode()).toUpperCase(Locale.ROOT);
            if (!featureCode.isEmpty()) {
                result.put(featureCode, stat.getAssignedRoleCount());
            }
        }
        return result;
    }

    private String resolveSelectedAuthorCode(String authorCode, List<AuthorInfoVO> authorGroups) {
        String normalized = safeString(authorCode).toUpperCase(Locale.ROOT);
        if (!normalized.isEmpty()) {
            return normalized;
        }
        if (authorGroups == null || authorGroups.isEmpty()) {
            return "";
        }
        return safeString(authorGroups.get(0).getAuthorCode()).toUpperCase(Locale.ROOT);
    }

    private String resolveSelectedAuthorName(String authorCode, List<AuthorInfoVO> authorGroups) {
        String normalized = safeString(authorCode).toUpperCase(Locale.ROOT);
        if (normalized.isEmpty() || authorGroups == null || authorGroups.isEmpty()) {
            return "";
        }
        return authorGroups.stream()
                .filter(group -> normalized.equalsIgnoreCase(safeString(group.getAuthorCode())))
                .map(AuthorInfoVO::getAuthorNm)
                .filter(name -> !safeString(name).isEmpty())
                .findFirst()
                .orElse("");
    }

    private int countSelectedPageCount(List<FeatureCatalogSectionVO> featureSections, List<String> selectedFeatureCodes) {
        if (featureSections == null || featureSections.isEmpty() || selectedFeatureCodes == null || selectedFeatureCodes.isEmpty()) {
            return 0;
        }
        java.util.Set<String> selectedCodes = new java.util.HashSet<>(selectedFeatureCodes);
        return (int) featureSections.stream()
                .filter(section -> section.getFeatures().stream()
                .anyMatch(feature -> selectedCodes.contains(feature.getFeatureCode())))
                .count();
    }

    private int countTotalFeatureCount(List<FeatureCatalogSectionVO> featureSections) {
        if (featureSections == null || featureSections.isEmpty()) {
            return 0;
        }
        return featureSections.stream()
                .mapToInt(section -> section.getFeatures() == null ? 0 : section.getFeatures().size())
                .sum();
    }

    private int countUnassignedFeatureCount(List<FeatureCatalogSectionVO> featureSections) {
        if (featureSections == null || featureSections.isEmpty()) {
            return 0;
        }
        return (int) featureSections.stream()
                .flatMap(section -> section.getFeatures().stream())
                .filter(FeatureCatalogItemVO::isUnassignedToRole)
                .count();
    }

    private String extractCurrentUserId(HttpServletRequest request) {
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

    private String preferredResetHistoryKeyword(String memberId, String searchKeyword) {
        String normalizedKeyword = safeString(searchKeyword);
        if (!normalizedKeyword.isEmpty()) {
            return normalizedKeyword;
        }
        return safeString(memberId);
    }

    private String redirectReactMigration(HttpServletRequest request, Locale locale, String route) {
        StringBuilder builder = new StringBuilder("forward:");
        builder.append(isEnglishRequest(request, locale) ? "/en/admin/app?route=" : "/admin/app?route=");
        builder.append(route == null ? "" : route.replace('-', '_'));
        String query = request == null ? "" : safeString(request.getQueryString());
        if (!query.isEmpty()) {
            builder.append("&").append(query);
        }
        return builder.toString();
    }

    private boolean containsPasswordResetKeyword(PasswordResetHistory history, String keyword) {
        return safeString(history.getTargetUserId()).toLowerCase(Locale.ROOT).contains(keyword)
                || safeString(history.getResetByUserId()).toLowerCase(Locale.ROOT).contains(keyword)
                || safeString(history.getResetIp()).toLowerCase(Locale.ROOT).contains(keyword)
                || safeString(history.getResetSource()).toLowerCase(Locale.ROOT).contains(keyword)
                || safeString(history.getTargetUserSe()).toLowerCase(Locale.ROOT).contains(keyword);
    }

    private List<Map<String, String>> buildPasswordResetHistoryListRows(List<PasswordResetHistory> histories, boolean isEn) {
        if (histories == null || histories.isEmpty()) {
            return Collections.emptyList();
        }

        List<Map<String, String>> rows = new ArrayList<>();
        for (PasswordResetHistory history : histories) {
            Map<String, String> row = new LinkedHashMap<>();
            row.put("resetAt", formatDateTime(history.getResetPnttm()));
            row.put("targetUserId", safeString(history.getTargetUserId()));
            row.put("targetUserSe", safeString(history.getTargetUserSe()));
            row.put("targetUserSeLabel", resolveUserSeLabel(history.getTargetUserSe(), isEn));
            row.put("resetBy", safeString(history.getResetByUserId()));
            row.put("resetIp", safeString(history.getResetIp()));
            row.put("resetSource", safeString(history.getResetSource()));
            row.put("detailUrl", (isEn ? "/en/admin" : "/admin") + "/member/detail?memberId="
                    + urlEncode(safeString(history.getTargetUserId())));
            rows.add(row);
        }
        return rows;
    }

    private List<Map<String, String>> buildPasswordResetHistoryRows(List<PasswordResetHistory> histories) {
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

    private boolean isWebmaster(String userId) {
        return "webmaster".equalsIgnoreCase(safeString(userId));
    }

    private String resolveCurrentUserAuthorCode(String currentUserId) {
        if (isWebmaster(currentUserId)) {
            return ROLE_SYSTEM_MASTER;
        }
        try {
            return safeString(authGroupManageService.selectAuthorCodeByUserId(currentUserId)).toUpperCase(Locale.ROOT);
        } catch (Exception e) {
            log.error("Failed to resolve current admin role. userId={}", safeString(currentUserId), e);
            return "";
        }
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

    private boolean hasGlobalDeptRoleAccess(String currentUserId, String authorCode) {
        if (isWebmaster(currentUserId)) {
            return true;
        }
        String normalizedAuthorCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        return ROLE_SYSTEM_MASTER.equals(normalizedAuthorCode)
                || ROLE_SYSTEM_ADMIN.equals(normalizedAuthorCode)
                || ROLE_ADMIN.equals(normalizedAuthorCode);
    }

    private boolean hasOwnCompanyDeptRoleAccess(String currentUserId, String authorCode) {
        if (hasGlobalDeptRoleAccess(currentUserId, authorCode)) {
            return true;
        }
        return ROLE_OPERATION_ADMIN.equals(safeString(authorCode).toUpperCase(Locale.ROOT));
    }

    private List<Map<String, Object>> buildRecommendedRoleSections(List<AuthorInfoVO> authorGroups, boolean isEn) {
        java.util.Set<String> existingCodes = authorGroups.stream()
                .map(AuthorInfoVO::getAuthorCode)
                .filter(code -> !ObjectUtils.isEmpty(code))
                .collect(Collectors.toSet());

        List<Map<String, Object>> sections = new ArrayList<>();

        List<Map<String, String>> generalRoles = new ArrayList<>();
        generalRoles.add(recommendedRole("ROLE_ADMIN",
                isEn ? "Administrator" : "관리자",
                isEn ? "Baseline administrator role assigned to privileged user accounts." : "운영 관리자 계정에 기본 부여하는 기준 관리자 Role입니다.",
                existingCodes));
        generalRoles.add(recommendedRole("ROLE_USER",
                isEn ? "General User" : "일반 사용자",
                isEn ? "Baseline end-user role assigned to standard accounts." : "일반 사용자 계정에 기본 부여하는 기준 사용자 Role입니다.",
                existingCodes));
        generalRoles.add(recommendedRole("ROLE_SYSTEM_MASTER",
                isEn ? "System Master" : "시스템 마스터",
                isEn ? "Full access for webmaster only" : "webmaster 전용 전체 권한",
                existingCodes));
        generalRoles.add(recommendedRole("ROLE_SYSTEM_ADMIN",
                isEn ? "System Admin" : "시스템 관리자",
                isEn ? "Code, page, feature and role administration" : "코드/페이지/기능/권한 운영 관리",
                existingCodes));
        generalRoles.add(recommendedRole("ROLE_OPERATION_ADMIN",
                isEn ? "Operation Admin" : "운영 관리자",
                isEn ? "Operational processing across service domains" : "서비스 운영 전반 처리 권한",
                existingCodes));
        generalRoles.add(recommendedRole("ROLE_COMPANY_ADMIN",
                isEn ? "Company Admin" : "회원사 관리자",
                isEn ? "Company-scoped authority management for one institution" : "단일 회원사 범위의 권한/회원 운영 기준 롤",
                existingCodes));
        generalRoles.add(recommendedRole("ROLE_CS_ADMIN",
                isEn ? "CS Admin" : "CS 관리자",
                isEn ? "Customer support and member response authority" : "고객 지원 및 회원 응대 권한",
                existingCodes));
        sections.add(recommendedRoleSection(
                "GENERAL",
                isEn ? "General authority groups" : "일반 권한 그룹",
                isEn ? "Baseline authority groups used as common execution roles across the system." : "시스템 전반에서 기준 권한으로 사용하는 공통 실행 Role입니다.",
                generalRoles
        ));

        List<Map<String, String>> departmentRoles = new ArrayList<>();
        departmentRoles.add(recommendedRole("ROLE_DEPT_OPERATION",
                isEn ? "Department Operation" : "부서 운영 기본권한",
                isEn ? "Default department-level operational baseline" : "운영부서 기본 권한 베이스라인",
                existingCodes));
        departmentRoles.add(recommendedRole("ROLE_DEPT_CS",
                isEn ? "Department CS" : "부서 CS 기본권한",
                isEn ? "Default department-level customer support baseline" : "CS부서 기본 권한 베이스라인",
                existingCodes));
        departmentRoles.add(recommendedRole("ROLE_DEPT_SUSTAINABILITY",
                isEn ? "Department Sustainability" : "부서 탄소/ESG 기본권한",
                isEn ? "Baseline role for carbon, ESG, and sustainability departments" : "탄소/ESG/지속가능경영 부서 기준 권한",
                existingCodes));
        departmentRoles.add(recommendedRole("ROLE_DEPT_PRODUCTION",
                isEn ? "Department Production" : "부서 생산 기본권한",
                isEn ? "Baseline role for production and manufacturing departments" : "생산/공정 부서 기준 권한",
                existingCodes));
        departmentRoles.add(recommendedRole("ROLE_DEPT_PROCUREMENT",
                isEn ? "Department Procurement" : "부서 구매 기본권한",
                isEn ? "Baseline role for procurement and SCM departments" : "구매/SCM 부서 기준 권한",
                existingCodes));
        departmentRoles.add(recommendedRole("ROLE_DEPT_QUALITY",
                isEn ? "Department Quality" : "부서 품질 기본권한",
                isEn ? "Baseline role for quality, certification, and audit departments" : "품질/인증/심사 부서 기준 권한",
                existingCodes));
        departmentRoles.add(recommendedRole("ROLE_DEPT_SALES",
                isEn ? "Department Sales" : "부서 영업 기본권한",
                isEn ? "Baseline role for sales and account management departments" : "영업/고객사 관리 부서 기준 권한",
                existingCodes));
        sections.add(recommendedRoleSection(
                "DEPARTMENT",
                isEn ? "Department authority groups" : "부서 권한 그룹",
                isEn ? "Baseline roles assigned automatically by department." : "부서 기준으로 기본 부여하는 베이스라인 Role입니다.",
                departmentRoles
        ));

        List<Map<String, String>> userRoles = new ArrayList<>();
        sections.add(recommendedRoleSection(
                "USER",
                isEn ? "User authority groups" : "사용자 권한 그룹",
                isEn ? "No user-specific role groups have been prepared yet. Add these later for direct assignment exceptions." : "아직 별도로 준비된 사용자 전용 Role은 없습니다. 직접 부여 예외가 필요할 때 추가합니다.",
                userRoles
        ));

        return sections;
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

    private List<Map<String, Object>> filterRecommendedRoleSections(List<Map<String, Object>> sections, String selectedRoleCategory) {
        return sections.stream()
                .filter(section -> selectedRoleCategory.equals(section.get("category")))
                .collect(Collectors.toList());
    }

    private List<AuthorInfoVO> filterAuthorGroups(List<AuthorInfoVO> authorGroups, String selectedRoleCategory) {
        return authorGroups.stream()
                .filter(group -> matchesRoleCategory(group.getAuthorCode(), selectedRoleCategory))
                .collect(Collectors.toList());
    }

    private List<AuthorInfoVO> filterAuthorGroupsByScope(List<AuthorInfoVO> authorGroups, String selectedRoleCategory,
                                                         String insttId, boolean globalAccess) {
        return authorGroups.stream()
                .filter(group -> matchesRoleCategory(group.getAuthorCode(), selectedRoleCategory))
                .filter(group -> globalAccess || isVisibleScopedAuthorCode(group.getAuthorCode(), selectedRoleCategory, insttId))
                .collect(Collectors.toList());
    }

    private List<AuthorInfoVO> buildDeptMemberAssignableGroups(List<AuthorInfoVO> authorGroups, String insttId, boolean globalAccess) {
        return authorGroups.stream()
                .filter(group -> {
                    String normalizedCode = safeString(group.getAuthorCode()).toUpperCase(Locale.ROOT);
                    return "ROLE_USER".equals(normalizedCode)
                            || normalizedCode.startsWith("ROLE_DEPT_")
                            || normalizedCode.startsWith("ROLE_USER_")
                            || normalizedCode.startsWith("ROLE_MEMBER_")
                            || normalizedCode.startsWith("ROLE_ACCOUNT_");
                })
                .filter(group -> globalAccess
                        || isVisibleScopedAuthorCode(group.getAuthorCode(), "DEPARTMENT", insttId)
                        || isVisibleScopedAuthorCode(group.getAuthorCode(), "USER", insttId))
                .collect(Collectors.toList());
    }

    private boolean matchesRoleCategory(String authorCode, String selectedRoleCategory) {
        String normalizedCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        if ("DEPARTMENT".equals(selectedRoleCategory)) {
            return normalizedCode.startsWith("ROLE_DEPT_");
        }
        if ("USER".equals(selectedRoleCategory)) {
            return normalizedCode.startsWith("ROLE_USER_")
                    || normalizedCode.startsWith("ROLE_MEMBER_")
                    || normalizedCode.startsWith("ROLE_ACCOUNT_");
        }
        return !normalizedCode.startsWith("ROLE_DEPT_")
                && !normalizedCode.startsWith("ROLE_USER_")
                && !normalizedCode.startsWith("ROLE_MEMBER_")
                && !normalizedCode.startsWith("ROLE_ACCOUNT_");
    }

    private String resolveRoleCategory(String roleCategory) {
        String normalized = safeString(roleCategory).toUpperCase(Locale.ROOT);
        if ("GENERAL".equals(normalized) || "DEPARTMENT".equals(normalized) || "USER".equals(normalized)) {
            return normalized;
        }
        return "GENERAL";
    }

    private List<Map<String, String>> buildRoleCategoryOptions(boolean isEn, boolean canViewGeneralAuthorityGroups) {
        List<Map<String, String>> rows = new ArrayList<>();
        if (canViewGeneralAuthorityGroups) {
            rows.add(roleCategoryOption("GENERAL", isEn ? "General groups" : "일반 권한 그룹"));
        }
        rows.add(roleCategoryOption("DEPARTMENT", isEn ? "Department groups" : "부서 권한 그룹"));
        rows.add(roleCategoryOption("USER", isEn ? "User groups" : "사용자 권한 그룹"));
        return rows;
    }

    private boolean hasGeneralAuthorityGroupAccess(String currentUserId, boolean webmaster) throws Exception {
        if (webmaster) {
            return true;
        }
        String authorCode = safeString(authGroupManageService.selectAuthorCodeByUserId(currentUserId));
        if (authorCode.isEmpty()) {
            return false;
        }
        return authGroupManageService.hasAuthorFeaturePermission(authorCode, AUTH_GROUP_GENERAL_VIEW_FEATURE_CODE);
    }

    private List<Map<String, String>> buildDepartmentRoleRows(List<DepartmentRoleMappingVO> mappings, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        for (DepartmentRoleMappingVO mapping : mappings) {
            Map<String, String> row = new java.util.LinkedHashMap<>();
            String deptName = safeString(mapping.getDeptNm());
            String mappedAuthorCode = safeString(mapping.getAuthorCode());
            String companyName = safeString(mapping.getCmpnyNm());
            String insttId = safeString(mapping.getInsttId());
            row.put("cmpnyNm", companyName);
            row.put("insttId", insttId);
            row.put("deptNm", deptName.isEmpty() ? (isEn ? "Unassigned" : "미지정") : deptName);
            row.put("memberCount", String.valueOf(mapping.getMemberCount()));
            String recommendedRoleCode = mappedAuthorCode.isEmpty()
                    ? resolveDepartmentRoleCode(insttId, companyName, deptName)
                    : mappedAuthorCode;
            row.put("recommendedRoleCode", recommendedRoleCode);
            row.put("recommendedRoleName",
                    safeString(mapping.getAuthorNm()).isEmpty()
                            ? resolveDepartmentRoleName(recommendedRoleCode, isEn)
                            : safeString(mapping.getAuthorNm()));
            row.put("status",
                    mappedAuthorCode.isEmpty()
                            ? (isUnknownDepartmentRole(recommendedRoleCode) ? "review" : "ready")
                            : "mapped");
            rows.add(row);
        }
        return rows;
    }

    private List<Map<String, String>> buildDepartmentCompanyOptions(List<Map<String, String>> departmentRows) {
        Map<String, String> dedup = new LinkedHashMap<>();
        for (Map<String, String> row : departmentRows) {
            String insttId = safeString(row.get("insttId"));
            if (insttId.isEmpty() || dedup.containsKey(insttId)) {
                continue;
            }
            dedup.put(insttId, safeString(row.get("cmpnyNm")));
        }
        List<Map<String, String>> options = new ArrayList<>();
        for (Map.Entry<String, String> entry : dedup.entrySet()) {
            Map<String, String> option = new LinkedHashMap<>();
            option.put("insttId", entry.getKey());
            option.put("cmpnyNm", entry.getValue());
            options.add(option);
        }
        return options;
    }

    private List<Map<String, String>> buildDepartmentRoleSummaries(List<Map<String, String>> departmentRows, boolean isEn) {
        Map<String, Map<String, String>> dedup = new LinkedHashMap<>();
        for (Map<String, String> row : departmentRows) {
            String roleCode = safeString(row.get("recommendedRoleCode"));
            if (roleCode.isEmpty() || dedup.containsKey(roleCode)) {
                continue;
            }
            Map<String, String> summary = new LinkedHashMap<>();
            summary.put("code", roleCode);
            summary.put("name", safeString(row.get("recommendedRoleName")));
            summary.put("description", resolveDepartmentRoleDescription(roleCode, isEn));
            summary.put("status", isUnknownDepartmentRole(roleCode) ? "missing" : "existing");
            dedup.put(roleCode, summary);
        }
        return new ArrayList<>(dedup.values());
    }

    private List<AuthorInfoVO> filterScopedDepartmentAuthorGroups(List<AuthorInfoVO> authorGroups, List<Map<String, String>> departmentRows) {
        if (departmentRows == null || departmentRows.isEmpty()) {
            return Collections.emptyList();
        }
        java.util.Set<String> allowedCodes = departmentRows.stream()
                .map(row -> safeString(row.get("recommendedRoleCode")).toUpperCase(Locale.ROOT))
                .filter(code -> !code.isEmpty())
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new));
        return authorGroups.stream()
                .filter(group -> allowedCodes.contains(safeString(group.getAuthorCode()).toUpperCase(Locale.ROOT)))
                .collect(Collectors.toList());
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

    private String resolveSelectedInsttId(String insttId, List<Map<String, String>> companyOptions) {
        return resolveSelectedInsttId(insttId, companyOptions, false);
    }

    private String resolveSelectedInsttId(String insttId, List<Map<String, String>> companyOptions, boolean allowEmptySelection) {
        String normalized = safeString(insttId);
        if (allowEmptySelection && normalized.isEmpty()) {
            return "";
        }
        if (normalized.isEmpty()) {
            return companyOptions.isEmpty() ? "" : safeString(companyOptions.get(0).get("insttId"));
        }
        boolean exists = companyOptions.stream()
                .anyMatch(option -> normalized.equals(option.get("insttId")));
        return exists ? normalized : (companyOptions.isEmpty() ? "" : safeString(companyOptions.get(0).get("insttId")));
    }

    private AuthGroupScopeContext buildAuthGroupScopeContext(String insttId, String userSearchKeyword, String selectedRoleCategory,
                                                             String currentUserId, boolean webmaster, List<AuthorInfoVO> authorGroups,
                                                             boolean isEn) {
        AuthGroupScopeContext context = AuthGroupScopeContext.empty();
        context.setUserSearchKeyword(safeString(userSearchKeyword));
        context.setReferenceAuthorGroups(filterAuthorGroups(authorGroups, selectedRoleCategory));
        if (!"DEPARTMENT".equals(selectedRoleCategory) && !"USER".equals(selectedRoleCategory)) {
            return context;
        }
        try {
            List<Map<String, String>> departmentRows = buildDepartmentRoleRows(authGroupManageService.selectDepartmentRoleMappings(), isEn);
            List<Map<String, String>> companyOptions = buildDepartmentCompanyOptions(departmentRows);
            String currentUserInsttId = resolveCurrentUserInsttId(currentUserId);
            if (!webmaster) {
                companyOptions = companyOptions.stream()
                        .filter(option -> currentUserInsttId.equals(option.get("insttId")))
                        .collect(Collectors.toList());
            }
            String selectedInsttId = resolveSelectedInsttId(webmaster ? insttId : currentUserInsttId, companyOptions, webmaster);
            context.setCompanyOptions(companyOptions);
            context.setSelectedInsttId(selectedInsttId);
            boolean globalAccess = webmaster || hasGlobalDeptRoleAccess(currentUserId, resolveCurrentUserAuthorCode(currentUserId));

            if ("DEPARTMENT".equals(selectedRoleCategory)) {
                List<Map<String, String>> filteredRows = departmentRows;
                if (!selectedInsttId.isEmpty()) {
                    filteredRows = departmentRows.stream()
                            .filter(row -> selectedInsttId.equals(row.get("insttId")))
                            .collect(Collectors.toList());
                }
                context.setDepartmentRows(filteredRows);
                context.setDepartmentRoleSummaries(buildDepartmentRoleSummaries(filteredRows, isEn));
                context.setReferenceAuthorGroups(filterScopedDepartmentAuthorGroups(
                        filterAuthorGroupsByScope(authorGroups, "DEPARTMENT", selectedInsttId, globalAccess), filteredRows));
                return context;
            }

            if ("USER".equals(selectedRoleCategory) && !selectedInsttId.isEmpty()) {
                context.setReferenceAuthorGroups(filterAuthorGroupsByScope(authorGroups, "USER", selectedInsttId, globalAccess));
                context.setUserAuthorityTargets(authGroupManageService.selectUserAuthorityTargets(selectedInsttId, userSearchKeyword));
            }
        } catch (Exception e) {
            log.error("Failed to load scoped authority targets. roleCategory={}, insttId={}", selectedRoleCategory, insttId, e);
            context.setErrorMessage(isEn
                    ? "Failed to load company-specific authority data."
                    : "회사별 권한 데이터를 불러오지 못했습니다.");
        }
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

    private String resolveCurrentUserInsttId(String currentUserId) {
        String normalizedUserId = safeString(currentUserId);
        if (normalizedUserId.isEmpty() || isWebmaster(normalizedUserId)) {
            return "";
        }
        try {
            return employMemberRepository.findById(normalizedUserId)
                    .map(EmplyrInfo::getInsttId)
                    .map(this::safeString)
                    .orElse("");
        } catch (Exception e) {
            log.error("Failed to resolve current admin institution. userId={}", normalizedUserId, e);
            return "";
        }
    }

    private boolean requiresOwnCompanyAccess(String currentUserId, String authorCode) {
        return !hasGlobalDeptRoleAccess(currentUserId, authorCode) && hasOwnCompanyDeptRoleAccess(currentUserId, authorCode);
    }

    private boolean canCurrentAdminAccessMember(HttpServletRequest request, EntrprsManageVO member) {
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

    private String resolveDepartmentRoleCode(String insttId, String companyName, String deptName) {
        String departmentRoleType = resolveDepartmentRoleTypeFromDeptName(companyName, deptName);
        if ("UNKNOWN".equals(departmentRoleType)) {
            return "ROLE_DEPT_UNKNOWN";
        }
        String scopedPrefix = buildScopedAuthorPrefix("DEPARTMENT", insttId);
        if (!scopedPrefix.isEmpty()) {
            return scopedPrefix + departmentRoleType;
        }
        return "ROLE_DEPT_" + departmentRoleType;
    }

    private String resolveDepartmentRoleName(String roleCode, boolean isEn) {
        String roleType = resolveDepartmentRoleType(roleCode);
        if ("CS".equals(roleType)) {
            return isEn ? "Department CS baseline" : "부서 CS 기본권한";
        }
        if ("OPS".equals(roleType) || "OPERATION".equals(roleType)) {
            return isEn ? "Department operation baseline" : "부서 운영 기본권한";
        }
        if ("ESG".equals(roleType) || "SUSTAINABILITY".equals(roleType)) {
            return isEn ? "Department sustainability baseline" : "부서 탄소/ESG 기본권한";
        }
        if ("PROD".equals(roleType) || "PRODUCTION".equals(roleType)) {
            return isEn ? "Department production baseline" : "부서 생산 기본권한";
        }
        if ("PROC".equals(roleType) || "PROCUREMENT".equals(roleType)) {
            return isEn ? "Department procurement baseline" : "부서 구매 기본권한";
        }
        if ("QUAL".equals(roleType) || "QUALITY".equals(roleType)) {
            return isEn ? "Department quality baseline" : "부서 품질 기본권한";
        }
        if ("SALE".equals(roleType) || "SALES".equals(roleType)) {
            return isEn ? "Department sales baseline" : "부서 영업 기본권한";
        }
        if ("MGMT".equals(roleType) || "MANAGEMENT".equals(roleType)) {
            return isEn ? "Department management baseline" : "부서 경영지원 기본권한";
        }
        return isEn ? "Needs review" : "검토 필요";
    }

    private String resolveDepartmentRoleDescription(String roleCode, boolean isEn) {
        String roleType = resolveDepartmentRoleType(roleCode);
        if ("CS".equals(roleType)) {
            return isEn ? "Baseline authority for customer support departments." : "CS부서 기본 권한 베이스라인";
        }
        if ("OPS".equals(roleType) || "OPERATION".equals(roleType)) {
            return isEn ? "Baseline authority for operations and technical departments." : "운영/기술 부서 기본 권한 베이스라인";
        }
        if ("ESG".equals(roleType) || "SUSTAINABILITY".equals(roleType)) {
            return isEn ? "Baseline authority for carbon, ESG, and sustainability departments." : "탄소/ESG/지속가능경영 부서 기본 권한 베이스라인";
        }
        if ("PROD".equals(roleType) || "PRODUCTION".equals(roleType)) {
            return isEn ? "Baseline authority for production and manufacturing departments." : "생산/공정 부서 기본 권한 베이스라인";
        }
        if ("PROC".equals(roleType) || "PROCUREMENT".equals(roleType)) {
            return isEn ? "Baseline authority for procurement and SCM departments." : "구매/SCM 부서 기본 권한 베이스라인";
        }
        if ("QUAL".equals(roleType) || "QUALITY".equals(roleType)) {
            return isEn ? "Baseline authority for quality, certification, and audit departments." : "품질/인증/심사 부서 기본 권한 베이스라인";
        }
        if ("SALE".equals(roleType) || "SALES".equals(roleType)) {
            return isEn ? "Baseline authority for sales and account management departments." : "영업/고객사 관리 부서 기본 권한 베이스라인";
        }
        if ("MGMT".equals(roleType) || "MANAGEMENT".equals(roleType)) {
            return isEn ? "Baseline authority for management support, finance, and HR departments." : "경영지원/재무/인사 부서 기본 권한 베이스라인";
        }
        return isEn ? "Department role needs review." : "회사/부서 기준 검토가 필요한 권한입니다.";
    }

    private String resolveDepartmentRoleTypeFromDeptName(String companyName, String deptName) {
        String searchText = (safeString(companyName) + " " + safeString(deptName)).toUpperCase(Locale.ROOT);
        if (containsAny(searchText, "탄소", "ESG", "환경", "지속가능", "NETZERO", "SUSTAIN")) {
            return "ESG";
        }
        if (containsAny(searchText, "생산", "제조", "공정", "설비", "PLANT", "PRODUCTION", "MANUFACTUR", "FACTORY")) {
            return "PROD";
        }
        if (containsAny(searchText, "구매", "자재", "조달", "SCM", "PROCUREMENT", "PURCHASE", "MATERIAL")) {
            return "PROC";
        }
        if (containsAny(searchText, "품질", "QA", "QC", "인증", "심사", "QUALITY", "AUDIT", "CERT")) {
            return "QUAL";
        }
        if (containsAny(searchText, "영업", "마케팅", "사업", "SALES", "ACCOUNT", "BIZDEV", "BUSINESS")) {
            return "SALE";
        }
        if (containsAny(searchText, "고객", "문의", "CS", "VOC", "SUPPORT", "HELPDESK")) {
            return "CS";
        }
        if (containsAny(searchText, "운영", "기술", "개발", "IT", "시스템", "플랫폼", "INFRA", "DEVOPS", "ENGINEER")) {
            return "OPS";
        }
        if (containsAny(searchText, "경영", "지원", "재무", "회계", "인사", "총무", "HR", "FINANCE", "ACCOUNTING", "MANAGEMENT")) {
            return "MGMT";
        }
        return "UNKNOWN";
    }

    private String resolveDepartmentRoleType(String roleCode) {
        String normalizedRoleCode = safeString(roleCode).toUpperCase(Locale.ROOT);
        if (normalizedRoleCode.startsWith("ROLE_DEPT_I")) {
            int lastUnderscore = normalizedRoleCode.lastIndexOf('_');
            if (lastUnderscore > "ROLE_DEPT_I".length()) {
                return normalizedRoleCode.substring(lastUnderscore + 1);
            }
        }
        if (normalizedRoleCode.startsWith("ROLE_DEPT_")) {
            return normalizedRoleCode.substring("ROLE_DEPT_".length());
        }
        return "UNKNOWN";
    }

    private boolean isUnknownDepartmentRole(String roleCode) {
        return "UNKNOWN".equals(resolveDepartmentRoleType(roleCode));
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

    private Map<String, String> roleCategoryOption(String code, String name) {
        Map<String, String> row = new java.util.LinkedHashMap<>();
        row.put("code", code);
        row.put("name", name);
        return row;
    }

    private static final class AuthGroupScopeContext {
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

    private List<Map<String, String>> buildAssignmentAuthorities(boolean isEn) {
        List<Map<String, String>> items = new ArrayList<>();
        items.add(assignmentAuthority(
                isEn ? "Role assignment authority" : "권한 할당 권한",
                isEn ? "Controls which role groups the current administrator can assign on the member edit page." : "회원 수정 화면에서 현재 관리자가 어떤 Role을 부여할 수 있는지 제어합니다."
        ));
        items.add(assignmentAuthority(
                isEn ? "Grant authority" : "권한 부여 권한",
                isEn ? "Separates execution authority from authority to delegate that execution authority to others." : "실행 권한과 타인에게 그 권한을 위임할 수 있는 권한을 분리합니다."
        ));
        items.add(assignmentAuthority(
                isEn ? "Department baseline authority" : "부서 기본 권한",
                isEn ? "Provides default roles by department, then merges them with user-specific roles." : "부서별 기본 Role을 부여하고 사용자별 직접 권한과 합산합니다."
        ));
        return items;
    }

    private Map<String, String> assignmentAuthority(String title, String description) {
        Map<String, String> row = new java.util.LinkedHashMap<>();
        row.put("title", title);
        row.put("description", description);
        return row;
    }

    private List<Map<String, String>> buildRoleCategories(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(roleCategory(
                isEn ? "General authority list" : "일반 권한 목록",
                isEn ? "Master feature catalog. All VIEW and action permissions are defined here." : "기능 마스터 카탈로그입니다. 모든 VIEW 및 액션 권한의 원본입니다."
        ));
        rows.add(roleCategory(
                isEn ? "Department authority list" : "부서 권한 목록",
                isEn ? "Department-level baseline roles for operation, CS, audit and similar teams." : "운영, CS, 감사 등 부서 단위 기본 Role 목록입니다."
        ));
        rows.add(roleCategory(
                isEn ? "User authority list" : "사용자 권한 목록",
                isEn ? "Direct user-specific role assignments and exceptions managed from member edit." : "회원 수정 화면에서 관리하는 사용자 직접 Role 및 예외 권한입니다."
        ));
        return rows;
    }

    private Map<String, String> roleCategory(String title, String description) {
        Map<String, String> row = new java.util.LinkedHashMap<>();
        row.put("title", title);
        row.put("description", description);
        return row;
    }

    private String adminPrefix(HttpServletRequest request, Locale locale) {
        return isEnglishRequest(request, locale) ? "/en/admin" : "/admin";
    }

    private void populateCompanyAccountModel(String insttId, boolean isEn, Model model) {
        InstitutionStatusVO form = loadInstitutionInfoByInsttId(insttId);
        if (form == null || form.isEmpty()) {
            form = new InstitutionStatusVO();
            form.setEntrprsSeCode("E");
        }
        model.addAttribute("companyAccountForm", form);
        model.addAttribute("companyAccountFiles", loadInsttFilesByInsttId(insttId));
        model.addAttribute("companyAccountAction", isEn ? "/en/admin/member/company_account" : "/admin/member/company_account");
        model.addAttribute("companyAccountFileBaseUrl", isEn ? "/en/admin/member/company-file" : "/admin/member/company-file");
        model.addAttribute("companyAccountSaved", false);
        model.addAttribute("companyAccountErrors", Collections.emptyList());
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

    private InstitutionStatusVO loadInstitutionInfoByInsttId(String insttId) {
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

    private List<InsttFileVO> loadInsttFilesByInsttId(String insttId) {
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

    private boolean hasValidInsttEvidenceFiles(List<MultipartFile> fileUploads) {
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

    private List<InsttFileVO> saveAdminInsttEvidenceFiles(String insttId, List<MultipartFile> fileUploads, int startFileSn) throws Exception {
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

    private String joinInsttEvidencePaths(List<InsttFileVO> fileList) {
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

    private String createInstitutionId() {
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

    private String resolveAuthChangeMessage(String error, boolean isEn) {
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

    private String resolveDeptRoleMessage(String error, boolean isEn) {
        String normalized = safeString(error).toLowerCase(Locale.ROOT);
        if (normalized.isEmpty()) {
            return "";
        }
        if ("save_failed".equals(normalized)) {
            return isEn ? "Failed to save the department role mapping." : "부서 권한 맵핑 저장에 실패했습니다.";
        }
        return isEn ? "Failed to process the department role mapping." : "부서 권한 맵핑 처리에 실패했습니다.";
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

    private String resolveInstitutionStatusBadgeClass(String statusCode) {
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

    private String resolveAuthGroupBasePath(HttpServletRequest request, Locale locale) {
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

    private boolean isEnglishRequest(HttpServletRequest request, Locale locale) {
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

    private String normalizeMembershipCode(String membershipType) {
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

    private String resolveMembershipTypeLabel(String code) {
        String v = code == null ? "" : code.trim().toUpperCase();
        if ("E".equals(v) || "EMITTER".equals(v)) return "CO2 배출 및 포집 기업";
        if ("P".equals(v) || "PERFORMER".equals(v)) return "CCUS 사업 수행 기업";
        if ("C".equals(v) || "CENTER".equals(v)) return "CCUS 진흥센터";
        if ("G".equals(v) || "GOV".equals(v)) return "주무관청 / 행정기관";
        return v.isEmpty() ? "기타" : v;
    }

    private String resolveMembershipTypeLabelEn(String code) {
        String v = code == null ? "" : code.trim().toUpperCase();
        if ("E".equals(v) || "EMITTER".equals(v)) return "CO2 Emitter/Capture Company";
        if ("P".equals(v) || "PERFORMER".equals(v)) return "CCUS Project Company";
        if ("C".equals(v) || "CENTER".equals(v)) return "CCUS Promotion Center";
        if ("G".equals(v) || "GOV".equals(v)) return "Government / Agency";
        return v.isEmpty() ? "Other" : v;
    }

    private String resolveStatusLabel(String statusCode) {
        String v = statusCode == null ? "" : statusCode.trim().toUpperCase();
        if ("P".equals(v)) return "활성";
        if ("A".equals(v)) return "승인 대기";
        if ("R".equals(v)) return "반려";
        if ("D".equals(v)) return "삭제";
        if ("X".equals(v)) return "차단";
        return v.isEmpty() ? "기타" : v;
    }

    private String resolveStatusLabelEn(String statusCode) {
        String v = statusCode == null ? "" : statusCode.trim().toUpperCase();
        if ("P".equals(v)) return "Active";
        if ("A".equals(v)) return "Pending Approval";
        if ("R".equals(v)) return "Rejected";
        if ("D".equals(v)) return "Deleted";
        if ("X".equals(v)) return "Blocked";
        return v.isEmpty() ? "Other" : v;
    }

    private String resolveStatusBadgeClass(String statusCode) {
        String v = statusCode == null ? "" : statusCode.trim().toUpperCase();
        if ("P".equals(v)) return "bg-emerald-100 text-emerald-700";
        if ("A".equals(v)) return "bg-blue-100 text-blue-700";
        if ("R".equals(v)) return "bg-amber-100 text-amber-700";
        if ("D".equals(v)) return "bg-slate-200 text-slate-700";
        if ("X".equals(v)) return "bg-red-100 text-red-700";
        return "bg-gray-100 text-gray-700";
    }

    private String resolveInstitutionStatusLabel(String statusCode) {
        String v = safeString(statusCode).toUpperCase();
        if ("A".equals(v)) return "검토 중";
        if ("P".equals(v)) return "가입 승인 완료";
        if ("R".equals(v)) return "반려";
        if ("X".equals(v)) return "차단";
        if ("D".equals(v)) return "삭제";
        return v.isEmpty() ? "-" : v;
    }

    private String resolveInstitutionStatusLabelEn(String statusCode) {
        String v = safeString(statusCode).toUpperCase();
        if ("A".equals(v)) return "Under Review";
        if ("P".equals(v)) return "Approved";
        if ("R".equals(v)) return "Rejected";
        if ("X".equals(v)) return "Blocked";
        if ("D".equals(v)) return "Deleted";
        return v.isEmpty() ? "-" : v;
    }

    private String resolveBusinessRoleLabel(String code) {
        String v = safeString(code).toUpperCase();
        if ("E".equals(v)) return "배출량 산정 및 감축 실적 제출 담당";
        if ("P".equals(v)) return "CCUS 사업 수행 및 거래 연계 담당";
        if ("C".equals(v)) return "진흥센터 인증 및 통합 관제 담당";
        if ("G".equals(v)) return "정책 검토 및 행정 승인 담당";
        return "플랫폼 일반 사용자";
    }

    private String resolveBusinessRoleLabelEn(String code) {
        String v = safeString(code).toUpperCase();
        if ("E".equals(v)) return "Emission calculation and reduction submission owner";
        if ("P".equals(v)) return "CCUS execution and trading liaison";
        if ("C".equals(v)) return "Certification and integrated monitoring operator";
        if ("G".equals(v)) return "Policy review and administrative approver";
        return "General platform user";
    }

    private List<String> resolveAccessScopes(String code) {
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

    private List<String> resolveAccessScopesEn(String code) {
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

    private String populateIpWhitelistPage(
            String searchIp,
            String accessScope,
            String status,
            Model model,
            String viewName,
            boolean isEn) {
        model.addAttribute("searchIp", safeString(searchIp));
        model.addAttribute("accessScope", safeString(accessScope).toUpperCase(Locale.ROOT));
        model.addAttribute("status", safeString(status).toUpperCase(Locale.ROOT));
        model.addAttribute("ipWhitelistSummary", buildIpWhitelistSummary(isEn));
        model.addAttribute("ipWhitelistRows", buildIpWhitelistRows(isEn));
        model.addAttribute("ipWhitelistRequestRows", buildIpWhitelistRequestRows(isEn));
        return viewName;
    }

    private String populateSecurityPolicyPage(Model model, String viewName, boolean isEn) {
        model.addAttribute("securityPolicySummary", buildSecurityPolicySummary(isEn));
        model.addAttribute("securityPolicyRows", buildSecurityPolicyRows(isEn));
        model.addAttribute("securityPolicyPlaybooks", buildSecurityPolicyPlaybooks(isEn));
        return viewName;
    }

    private String populateSecurityMonitoringPage(Model model, String viewName, boolean isEn) {
        model.addAttribute("securityMonitoringCards", buildSecurityMonitoringCards(isEn));
        model.addAttribute("securityMonitoringTargets", buildSecurityMonitoringTargets(isEn));
        model.addAttribute("securityMonitoringIps", buildSecurityMonitoringIps(isEn));
        model.addAttribute("securityMonitoringEvents", buildSecurityMonitoringEvents(isEn));
        return viewName;
    }

    private String populateBlocklistPage(
            String searchKeyword,
            String blockType,
            String status,
            Model model,
            String viewName,
            boolean isEn) {
        model.addAttribute("searchKeyword", safeString(searchKeyword));
        model.addAttribute("blockType", safeString(blockType).toUpperCase(Locale.ROOT));
        model.addAttribute("status", safeString(status).toUpperCase(Locale.ROOT));
        model.addAttribute("blocklistSummary", buildBlocklistSummary(isEn));
        model.addAttribute("blocklistRows", buildBlocklistRows(isEn));
        model.addAttribute("blocklistReleaseQueue", buildBlocklistReleaseQueue(isEn));
        return viewName;
    }

    private String populateSecurityAuditPage(Model model, String viewName, boolean isEn) {
        List<RequestExecutionLogVO> auditLogs = loadSecurityAuditLogs();
        model.addAttribute("securityAuditSummary", buildSecurityAuditSummary(auditLogs, isEn));
        model.addAttribute("securityAuditRows", buildSecurityAuditRows(auditLogs, isEn));
        return viewName;
    }

    private String populateSchedulerPage(
            String jobStatus,
            String executionType,
            Model model,
            String viewName,
            boolean isEn) {
        String normalizedJobStatus = safeString(jobStatus).toUpperCase(Locale.ROOT);
        String normalizedExecutionType = safeString(executionType).toUpperCase(Locale.ROOT);
        List<Map<String, String>> jobRows = buildSchedulerJobRows(isEn);
        List<Map<String, String>> filteredRows = new ArrayList<>();
        for (Map<String, String> row : jobRows) {
            String rowStatus = safeString(row.get("jobStatus")).toUpperCase(Locale.ROOT);
            String rowType = safeString(row.get("executionTypeCode")).toUpperCase(Locale.ROOT);
            boolean matchesStatus = normalizedJobStatus.isEmpty() || normalizedJobStatus.equals(rowStatus);
            boolean matchesType = normalizedExecutionType.isEmpty() || normalizedExecutionType.equals(rowType);
            if (matchesStatus && matchesType) {
                filteredRows.add(row);
            }
        }
        model.addAttribute("jobStatus", normalizedJobStatus);
        model.addAttribute("executionType", normalizedExecutionType);
        model.addAttribute("schedulerSummary", buildSchedulerSummary(isEn));
        model.addAttribute("schedulerJobRows", filteredRows);
        model.addAttribute("schedulerNodeRows", buildSchedulerNodeRows(isEn));
        model.addAttribute("schedulerExecutionRows", buildSchedulerExecutionRows(isEn));
        model.addAttribute("schedulerPlaybooks", buildSchedulerPlaybooks(isEn));
        return viewName;
    }

    private List<Map<String, String>> buildIpWhitelistSummary(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(summaryCard(isEn ? "Active Rules" : "활성 규칙", "12",
                isEn ? "CIDR and single-IP policies currently applied." : "현재 게이트웨이에 반영 중인 CIDR/단일 IP 정책"));
        rows.add(summaryCard(isEn ? "Pending Requests" : "승인 대기", "3",
                isEn ? "Approval requests waiting for security review." : "보안담당 승인 대기 중인 예외 허용 요청"));
        rows.add(summaryCard(isEn ? "Expiring Today" : "오늘 만료", "2",
                isEn ? "Temporary exceptions scheduled to expire today." : "오늘 자동 회수 예정인 임시 허용"));
        rows.add(summaryCard(isEn ? "Protected Scopes" : "보호 범위", "4",
                isEn ? "Admin, API, Batch, and Internal access scopes." : "관리자, API, Batch, 내부망 범위 운영"));
        return rows;
    }

    private List<Map<String, String>> buildIpWhitelistRows(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(mapOf(
                "ruleId", "WL-001",
                "ipAddress", "203.248.117.0/24",
                "accessScope", "ADMIN",
                "description", "운영센터 고정망",
                "descriptionEn", "Primary operations network",
                "owner", "정책관리팀",
                "ownerEn", "Policy Admin Team",
                "status", "ACTIVE",
                "updatedAt", "2026-03-12 08:40",
                "memo", "상시 허용",
                "memoEn", "Always allowed"));
        rows.add(mapOf(
                "ruleId", "WL-002",
                "ipAddress", "10.10.24.15",
                "accessScope", "BATCH",
                "description", "배치 서버 고정 IP",
                "descriptionEn", "Batch server fixed IP",
                "owner", "인프라운영팀",
                "ownerEn", "Infrastructure Team",
                "status", "ACTIVE",
                "updatedAt", "2026-03-11 22:10",
                "memo", "인증서 갱신 완료",
                "memoEn", "Certificate rotation completed"));
        rows.add(mapOf(
                "ruleId", "WL-003",
                "ipAddress", "175.213.44.82",
                "accessScope", "API",
                "description", "협력사 취약점 점검",
                "descriptionEn", "Vendor security assessment",
                "owner", "보안담당",
                "ownerEn", "Security Office",
                "status", "PENDING",
                "updatedAt", "2026-03-12 09:05",
                "memo", "금일 18시까지",
                "memoEn", "Valid until 18:00 today"));
        return rows;
    }

    private List<Map<String, String>> buildIpWhitelistRequestRows(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(mapOf(
                "requestId", "REQ-240312-01",
                "ipAddress", "175.213.44.82",
                "accessScope", "ADMIN",
                "reason", "협력사 취약점 점검",
                "reasonEn", "Vendor security inspection",
                "approvalStatus", "검토중",
                "approvalStatusEn", "Under Review",
                "requestedAt", "2026-03-12 08:45",
                "requester", "보안담당 김민수",
                "requesterEn", "Security Officer Minsu Kim"));
        rows.add(mapOf(
                "requestId", "REQ-240312-02",
                "ipAddress", "61.77.12.44",
                "accessScope", "API",
                "reason", "연계 점검",
                "reasonEn", "Integration test window",
                "approvalStatus", "승인대기",
                "approvalStatusEn", "Pending Approval",
                "requestedAt", "2026-03-12 09:10",
                "requester", "대외연계 담당",
                "requesterEn", "External Integration Lead"));
        return rows;
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

    private List<Map<String, String>> buildSecurityPolicyRows(boolean isEn) {
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

    private List<Map<String, String>> buildSecurityPolicyPlaybooks(boolean isEn) {
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


    private List<Map<String, String>> buildSecurityMonitoringTargets(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(mapOf("url", "/admin/login/actionLogin", "rps", "88", "status", isEn ? "Escalated" : "경계", "rule", isEn ? "Admin login hardening" : "관리자 로그인 강화"));
        rows.add(mapOf("url", "/signin/actionLogin", "rps", "240", "status", isEn ? "Protected" : "방어중", "rule", isEn ? "User login protection" : "사용자 로그인 보호"));
        rows.add(mapOf("url", "/api/search/carbon-footprint", "rps", "510", "status", isEn ? "Throttled" : "제한중", "rule", isEn ? "Search API throttle" : "검색 API 제어"));
        return rows;
    }

    private List<Map<String, String>> buildSecurityMonitoringIps(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(mapOf("ip", "198.51.100.42", "country", "US", "requestCount", "4,120", "action", isEn ? "Temp blocked" : "임시차단"));
        rows.add(mapOf("ip", "203.0.113.78", "country", "KR", "requestCount", "2,844", "action", isEn ? "Captcha enforced" : "CAPTCHA 전환"));
        rows.add(mapOf("ip", "45.67.22.91", "country", "DE", "requestCount", "2,337", "action", isEn ? "429 only" : "429 응답"));
        return rows;
    }

    private List<Map<String, String>> buildSecurityMonitoringEvents(boolean isEn) {
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

    private List<Map<String, String>> buildBlocklistRows(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(mapOf("blockId", "BL-240312-01", "target", "198.51.100.42", "blockType", "IP", "reason", isEn ? "Admin login burst" : "관리자 로그인 버스트", "status", "ACTIVE", "expiresAt", "2026-03-12 10:00", "owner", isEn ? "Auto Rule" : "자동 룰"));
        rows.add(mapOf("blockId", "BL-240312-02", "target", "203.0.113.0/24", "blockType", "CIDR", "reason", isEn ? "Credential stuffing pattern" : "Credential stuffing 패턴", "status", "ACTIVE", "expiresAt", "2026-03-12 18:00", "owner", isEn ? "Security Operator" : "보안운영자"));
        rows.add(mapOf("blockId", "BL-240311-04", "target", "bot-agent/7.2", "blockType", "UA", "reason", isEn ? "Search scraping" : "검색 스크래핑", "status", "REVIEW", "expiresAt", "-", "owner", isEn ? "Monitoring Queue" : "모니터링 큐"));
        return rows;
    }

    private List<Map<String, String>> buildBlocklistReleaseQueue(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(mapOf("target", "198.51.100.42", "releaseAt", "2026-03-12 10:00", "condition", isEn ? "Auto release if no re-hit for 30 min" : "30분 재탐지 없으면 자동 해제"));
        rows.add(mapOf("target", "203.0.113.0/24", "releaseAt", "2026-03-12 18:00", "condition", isEn ? "Operator approval required" : "운영자 승인 후 해제"));
        return rows;
    }

    private List<RequestExecutionLogVO> loadSecurityAuditLogs() {
        try {
            return requestExecutionLogService.readRecent(300).stream()
                    .filter(this::isSecurityAuditTarget)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Failed to load request execution logs for security audit.", e);
            return Collections.emptyList();
        }
    }

    private boolean isSecurityAuditTarget(RequestExecutionLogVO item) {
        if (item == null) {
            return false;
        }
        String decision = safeString(item.getCompanyScopeDecision()).toUpperCase(Locale.ROOT);
        return !decision.isEmpty()
                && ("DENY_MISSING_COMPANY_CONTEXT".equals(decision)
                || "DENY_COMPANY_MISMATCH".equals(decision)
                || "DENY_NO_ACTOR_COMPANY".equals(decision)
                || "ALLOW_GLOBAL_NO_CONTEXT".equals(decision)
                || "ALLOW_IMPLICIT_SELF".equals(decision)
                || "DENY_GLOBAL_ONLY_ROUTE".equals(decision)
                || "DENY_NO_COMPANY_SCOPE_PERMISSION".equals(decision));
    }

    private List<Map<String, String>> buildSecurityAuditSummary(List<RequestExecutionLogVO> auditLogs, boolean isEn) {
        long deniedCount = auditLogs.stream()
                .filter(item -> safeString(item.getCompanyScopeDecision()).startsWith("DENY_"))
                .count();
        long globalBypassCount = auditLogs.stream()
                .filter(item -> "ALLOW_GLOBAL_NO_CONTEXT".equalsIgnoreCase(safeString(item.getCompanyScopeDecision())))
                .count();
        long implicitSelfCount = auditLogs.stream()
                .filter(item -> "ALLOW_IMPLICIT_SELF".equalsIgnoreCase(safeString(item.getCompanyScopeDecision())))
                .count();
        long mismatchCount = auditLogs.stream()
                .filter(item -> "DENY_COMPANY_MISMATCH".equalsIgnoreCase(safeString(item.getCompanyScopeDecision())))
                .count();
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(summaryCard(isEn ? "Company Scope Denies" : "회사 스코프 차단", String.valueOf(deniedCount),
                isEn ? "Blocked requests due to missing or mismatched company scope." : "회사 컨텍스트 누락 또는 불일치로 차단된 요청"));
        rows.add(summaryCard(isEn ? "Global No-Context" : "전역 예외 허용", String.valueOf(globalBypassCount),
                isEn ? "Global admin executions without an explicit company context." : "명시적 회사 ID 없이 허용된 전역 관리자 실행"));
        rows.add(summaryCard(isEn ? "Implicit Self Scope" : "자기회사 암묵 적용", String.valueOf(implicitSelfCount),
                isEn ? "Requests resolved to the actor company without an explicit company parameter." : "회사 ID 파라미터 없이 계정 회사로 해석된 요청"));
        rows.add(summaryCard(isEn ? "Company Mismatch" : "회사 불일치", String.valueOf(mismatchCount),
                isEn ? "Requests blocked because the target company did not match the actor company." : "대상 회사와 계정 회사가 달라 차단된 요청"));
        return rows;
    }

    private List<Map<String, String>> buildSecurityAuditRows(List<RequestExecutionLogVO> auditLogs, boolean isEn) {
        return auditLogs.stream()
                .limit(50)
                .map(item -> mapOf(
                        "auditAt", safeString(item.getExecutedAt()),
                        "actor", resolveSecurityAuditActor(item),
                        "action", resolveSecurityAuditAction(item, isEn),
                        "target", safeString(item.getRequestUri()),
                        "detail", resolveSecurityAuditDetail(item, isEn)))
                .collect(Collectors.toList());
    }

    private String resolveSecurityAuditActor(RequestExecutionLogVO item) {
        String actor = safeString(item.getActorUserId());
        String actorType = safeString(item.getActorType());
        String insttId = safeString(item.getActorInsttId());
        StringBuilder builder = new StringBuilder(actor.isEmpty() ? "-" : actor);
        if (!actorType.isEmpty()) {
            builder.append(" (").append(actorType).append(")");
        }
        if (!insttId.isEmpty()) {
            builder.append(" / ").append(insttId);
        }
        return builder.toString();
    }

    private String resolveSecurityAuditAction(RequestExecutionLogVO item, boolean isEn) {
        String decision = safeString(item.getCompanyScopeDecision()).toUpperCase(Locale.ROOT);
        if ("DENY_MISSING_COMPANY_CONTEXT".equals(decision)) {
            return isEn ? "Blocked missing company context" : "회사 컨텍스트 누락 차단";
        }
        if ("DENY_COMPANY_MISMATCH".equals(decision)) {
            return isEn ? "Blocked company mismatch" : "회사 불일치 차단";
        }
        if ("DENY_NO_ACTOR_COMPANY".equals(decision)) {
            return isEn ? "Blocked missing actor company" : "계정 회사 정보 누락 차단";
        }
        if ("ALLOW_GLOBAL_NO_CONTEXT".equals(decision)) {
            return isEn ? "Allowed global execution without company context" : "회사 컨텍스트 없는 전역 관리자 허용";
        }
        if ("ALLOW_IMPLICIT_SELF".equals(decision)) {
            return isEn ? "Allowed implicit self-company resolution" : "자기회사 암묵 해석 허용";
        }
        if ("DENY_GLOBAL_ONLY_ROUTE".equals(decision)) {
            return isEn ? "Blocked global-only route" : "전체 관리자 전용 경로 차단";
        }
        return decision.isEmpty() ? (isEn ? "Request audit" : "요청 감사") : decision;
    }

    private String resolveSecurityAuditDetail(RequestExecutionLogVO item, boolean isEn) {
        String actorInsttId = safeString(item.getActorInsttId());
        String targetInsttId = safeString(item.getTargetCompanyContextId());
        String explicit = item.isCompanyContextExplicit()
                ? (isEn ? "Explicit context" : "명시적 컨텍스트")
                : (isEn ? "Implicit/no parameter" : "암묵/파라미터 없음");
        String reason = safeString(item.getCompanyScopeReason());
        return (isEn ? "actor=" : "계정=") + (actorInsttId.isEmpty() ? "-" : actorInsttId)
                + ", " + (isEn ? "target=" : "대상=") + (targetInsttId.isEmpty() ? "-" : targetInsttId)
                + ", " + explicit
                + (reason.isEmpty() ? "" : ", " + reason);
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

    private List<Map<String, String>> buildSchedulerJobRows(boolean isEn) {
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

    private List<Map<String, String>> buildSchedulerNodeRows(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(mapOf("nodeId", "batch-node-01", "role", isEn ? "Primary scheduler" : "주 스케줄러", "status", "HEALTHY", "runningJobs", "5", "heartbeatAt", "2026-03-13 11:46:11"));
        rows.add(mapOf("nodeId", "batch-node-02", "role", isEn ? "Failover worker" : "대기 워커", "status", "STANDBY", "runningJobs", "0", "heartbeatAt", "2026-03-13 11:46:04"));
        rows.add(mapOf("nodeId", "batch-node-03", "role", isEn ? "Settlement queue worker" : "정산 큐 워커", "status", "DEGRADED", "runningJobs", "2", "heartbeatAt", "2026-03-13 11:45:31"));
        return rows;
    }

    private List<Map<String, String>> buildSchedulerExecutionRows(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(mapOf("executedAt", "2026-03-13 11:30", "jobId", "SCH-002", "result", "SUCCESS", "duration", "18s", "message", isEn ? "Certificate expiration cache synchronized." : "인증서 만료 캐시 동기화 완료"));
        rows.add(mapOf("executedAt", "2026-03-13 11:10", "jobId", "SCH-003", "result", "FAILED", "duration", "47s", "message", isEn ? "Token endpoint timeout. Retry queued." : "토큰 엔드포인트 타임아웃, 재시도 대기"));
        rows.add(mapOf("executedAt", "2026-03-13 10:00", "jobId", "SCH-001", "result", "SUCCESS", "duration", "3m 12s", "message", isEn ? "1,284 aggregation rows persisted." : "집계 1,284건 적재 완료"));
        rows.add(mapOf("executedAt", "2026-03-12 18:10", "jobId", "SCH-004", "result", "REVIEW", "duration", "9m 05s", "message", isEn ? "Manual backfill requires settlement approval." : "수동 보정 후 정산 승인 필요"));
        return rows;
    }

    private List<Map<String, String>> buildSchedulerPlaybooks(boolean isEn) {
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

    private String resolveDocumentStatusLabel(String filePath) {
        return safeString(filePath).isEmpty() ? "등록 문서 없음" : "사업자등록증 등록됨";
    }

    private String resolveDocumentStatusLabelEn(String filePath) {
        return safeString(filePath).isEmpty() ? "No document registered" : "Business registration file attached";
    }

    private void populateMemberEditModel(Model model, EntrprsManageVO member, boolean isEn,
                                         String currentUserId) throws Exception {
        ensureMemberEditDefaults(model, isEn);
        InstitutionStatusVO institutionInfo = loadInstitutionInfo(member);
        EntrprsManageVO displayMember = mergeMemberWithInstitutionInfo(member, institutionInfo);
        model.addAttribute("member", displayMember);
        model.addAttribute("memberEvidenceFiles", loadEvidenceFiles(displayMember));
        model.addAttribute("memberId", safeString(displayMember.getEntrprsmberId()));
        model.addAttribute("phoneNumber", formatPhoneNumber(displayMember.getAreaNo(), displayMember.getEntrprsMiddleTelno(), displayMember.getEntrprsEndTelno()));
        model.addAttribute("membershipTypeLabel", isEn
                ? resolveMembershipTypeLabelEn(displayMember.getEntrprsSeCode())
                : resolveMembershipTypeLabel(displayMember.getEntrprsSeCode()));
        model.addAttribute("businessRoleLabel", isEn
                ? resolveBusinessRoleLabelEn(displayMember.getEntrprsSeCode())
                : resolveBusinessRoleLabel(displayMember.getEntrprsSeCode()));
        model.addAttribute("accessScopes", isEn
                ? resolveAccessScopesEn(displayMember.getEntrprsSeCode())
                : resolveAccessScopes(displayMember.getEntrprsSeCode()));
        model.addAttribute("statusLabel", isEn
                ? resolveStatusLabelEn(displayMember.getEntrprsMberSttus())
                : resolveStatusLabel(displayMember.getEntrprsMberSttus()));
        model.addAttribute("memberStatusCode", safeString(displayMember.getEntrprsMberSttus()).toUpperCase());
        model.addAttribute("memberTypeCode", safeString(displayMember.getEntrprsSeCode()).toUpperCase());
        model.addAttribute("memberDocumentStatusLabel", isEn
                ? resolveDocumentStatusLabelEn(displayMember.getBizRegFilePath())
                : resolveDocumentStatusLabel(displayMember.getBizRegFilePath()));
        if (institutionInfo != null && !institutionInfo.isEmpty()) {
            model.addAttribute("institutionInfo", institutionInfo);
            model.addAttribute("institutionStatusLabel", isEn
                    ? resolveInstitutionStatusLabelEn(stringValue(institutionInfo.getInsttSttus()))
                    : resolveInstitutionStatusLabel(stringValue(institutionInfo.getInsttSttus())));
            model.addAttribute("institutionInsttId", stringValue(institutionInfo.getInsttId()));
            model.addAttribute("documentStatusLabel", isEn
                    ? resolveDocumentStatusLabelEn(stringValue(institutionInfo.getBizRegFilePath()))
                    : resolveDocumentStatusLabel(stringValue(institutionInfo.getBizRegFilePath())));
        } else {
            model.addAttribute("institutionStatusLabel", "-");
            model.addAttribute("institutionInsttId", "");
            model.addAttribute("documentStatusLabel", isEn ? "No document registered" : "등록 문서 없음");
        }
        populatePermissionEditorModel(
                model,
                authGroupManageService.selectAuthorList(),
                safeString(authGroupManageService.selectEnterpriseAuthorCodeByUserId(displayMember.getEntrprsmberId())),
                safeString(displayMember.getUniqId()),
                null,
                isEn,
                currentUserId);
    }

    private void ensureMemberEditDefaults(Model model, boolean isEn) {
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

    private void ensureAdminAccountDefaults(Model model, boolean isEn) {
        model.addAttribute("adminPermissionTarget", null);
        model.addAttribute("adminPermissionUpdated", false);
        model.addAttribute("adminAccountMode", "");
        model.addAttribute("adminAccountReadOnly", false);
        model.addAttribute("adminPermissionStatusLabel", "-");
        model.addAttribute("adminPermissionJoinedAt", "-");
        ensurePermissionEditorDefaults(model, isEn);
    }

    private void ensureAdminAccountCreateDefaults(Model model, boolean isEn) {
        model.addAttribute("adminAccountCreateError", "");
        model.addAttribute("adminAccountCreatePreset", "MASTER");
        model.addAttribute("adminAccountCreatePresetAuthorCodes", defaultAdminPresetAuthorCodes());
        model.addAttribute("adminAccountCreatePresetFeatureCodes", Collections.emptyMap());
        model.addAttribute("adminAccountCreateCompanyName", "");
        ensurePermissionEditorDefaults(model, isEn);
    }

    private void ensurePermissionEditorDefaults(Model model, boolean isEn) {
        model.addAttribute("permissionAuthorGroups", Collections.emptyList());
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

    private void populateAdminAccountEditModel(Model model, EmplyrInfo adminMember, boolean isEn,
                                               List<String> effectiveFeatureCodes, String currentUserId) throws Exception {
        ensureAdminAccountDefaults(model, isEn);
        model.addAttribute("adminPermissionTarget", adminMember);
        model.addAttribute("adminPermissionStatusLabel", isEn
                ? resolveStatusLabelEn(adminMember.getEmplyrStusCode())
                : resolveStatusLabel(adminMember.getEmplyrStusCode()));
        model.addAttribute("adminPermissionJoinedAt",
                adminMember.getSbscrbDe() == null ? "-"
                        : adminMember.getSbscrbDe().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        Object adminAccountMode = model.getAttribute("adminAccountMode");
        model.addAttribute("adminAccountReadOnly", "detail".equalsIgnoreCase(adminAccountMode == null ? "" : adminAccountMode.toString()));
        populatePermissionEditorModel(
                model,
                filterAuthorGroups(authGroupManageService.selectAuthorList(), "GENERAL"),
                safeString(authGroupManageService.selectAuthorCodeByUserId(adminMember.getEmplyrId())),
                safeString(adminMember.getEsntlId()),
                effectiveFeatureCodes,
                isEn,
                currentUserId);
    }

    private void populatePermissionEditorModel(Model model, List<AuthorInfoVO> authorGroups, String selectedAuthorCode,
                                               String scrtyTargetId, List<String> effectiveFeatureCodes,
                                               boolean isEn, String currentUserId) throws Exception {
        ensurePermissionEditorDefaults(model, isEn);
        List<AuthorInfoVO> safeAuthorGroups = authorGroups == null ? Collections.emptyList() : authorGroups;
        Set<String> grantableFeatureCodes = resolveGrantableFeatureCodeSet(currentUserId, isWebmaster(currentUserId));
        List<FeatureCatalogSectionVO> featureSections = filterFeatureCatalogSectionsByGrantable(
                buildFeatureCatalogSections(authGroupManageService.selectFeatureCatalog(), isEn),
                grantableFeatureCodes);
        String normalizedAuthorCode = normalizeSelectedAuthorCode(selectedAuthorCode, safeAuthorGroups);
        Set<String> baselineFeatureCodes = new LinkedHashSet<>(normalizedAuthorCode.isEmpty()
                ? Collections.emptyList()
                : normalizeFeatureCodes(authGroupManageService.selectAuthorFeatureCodes(normalizedAuthorCode)));
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

        Set<String> addedFeatureCodes = new LinkedHashSet<>(effectiveCodeSet);
        addedFeatureCodes.removeAll(baselineFeatureCodes);
        Set<String> removedFeatureCodes = new LinkedHashSet<>(baselineFeatureCodes);
        removedFeatureCodes.removeAll(effectiveCodeSet);

        model.addAttribute("permissionAuthorGroups", safeAuthorGroups);
        model.addAttribute("permissionSelectedAuthorCode", normalizedAuthorCode);
        model.addAttribute("permissionSelectedAuthorName", resolveSelectedAuthorName(normalizedAuthorCode, safeAuthorGroups));
        model.addAttribute("permissionFeatureSections", featureSections);
        model.addAttribute("permissionBaseFeatureCodes", baselineFeatureCodes);
        model.addAttribute("permissionEffectiveFeatureCodes", effectiveCodeSet);
        model.addAttribute("permissionAddedFeatureCodes", addedFeatureCodes);
        model.addAttribute("permissionRemovedFeatureCodes", removedFeatureCodes);
        model.addAttribute("permissionFeatureCount", effectiveCodeSet.size());
        model.addAttribute("permissionPageCount", countSelectedPageCount(featureSections, new ArrayList<>(effectiveCodeSet)));
    }

    private void populateAdminAccountCreatePageModel(Model model, boolean isEn) {
        try {
            List<FeatureCatalogSectionVO> featureSections = buildFeatureCatalogSections(authGroupManageService.selectFeatureCatalog(), isEn);
            Map<String, String> presetAuthorCodes = defaultAdminPresetAuthorCodes();
            Map<String, List<String>> presetFeatureCodes = new LinkedHashMap<>();
            for (Map.Entry<String, String> entry : presetAuthorCodes.entrySet()) {
                presetFeatureCodes.put(entry.getKey(), normalizeFeatureCodes(authGroupManageService.selectAuthorFeatureCodes(entry.getValue())));
            }
            model.addAttribute("permissionFeatureSections", featureSections);
            model.addAttribute("adminAccountCreatePresetAuthorCodes", presetAuthorCodes);
            model.addAttribute("adminAccountCreatePresetFeatureCodes", presetFeatureCodes);
            model.addAttribute("permissionFeatureCount", presetFeatureCodes.get("MASTER") == null ? 0 : presetFeatureCodes.get("MASTER").size());
            model.addAttribute("permissionPageCount", countSelectedPageCount(featureSections, presetFeatureCodes.get("MASTER")));
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

    private Map<String, String> defaultAdminPresetAuthorCodes() {
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
        return authorGroups != null && authorGroups.stream()
                .map(AuthorInfoVO::getAuthorCode)
                .map(this::safeString)
                .map(value -> value.toUpperCase(Locale.ROOT))
                .anyMatch(normalizedAuthorCode::equals);
    }

    private String normalizeSelectedAuthorCode(String authorCode, List<AuthorInfoVO> authorGroups) {
        String normalizedAuthorCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        if (normalizedAuthorCode.isEmpty()) {
            return "";
        }
        return containsAuthorCode(authorGroups, normalizedAuthorCode) ? normalizedAuthorCode : "";
    }

    private List<String> extractPayloadIds(Object selectedIds, String singleId) {
        List<String> ids = new ArrayList<>();
        String normalizedSingleId = safeString(singleId);
        if (!normalizedSingleId.isEmpty()) {
            ids.add(normalizedSingleId);
        }
        if (!(selectedIds instanceof List<?>)) {
            return ids;
        }
        for (Object item : (List<?>) selectedIds) {
            String value = safeString(item == null ? null : item.toString());
            if (!value.isEmpty() && !ids.contains(value)) {
                ids.add(value);
            }
        }
        return ids;
    }

    private List<String> normalizeFeatureCodes(List<String> featureCodes) {
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

    private void savePermissionOverrides(String scrtyTargetId, String memberTypeCode,
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

    private List<Map<String, String>> buildMemberTypeOptions(boolean isEn) {
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

    private Set<String> resolveGrantableFeatureCodeSet(String currentUserId, boolean webmaster) throws Exception {
        if (webmaster) {
            return null;
        }
        Set<String> grantable = new LinkedHashSet<>();
        String currentAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        if (!currentAuthorCode.isEmpty()) {
            grantable.addAll(normalizeFeatureCodes(authGroupManageService.selectAuthorFeatureCodes(currentAuthorCode)));
        }
        String actorEsntlId = safeString(authGroupManageService.selectAdminEssentialIdByUserId(currentUserId));
        if (!actorEsntlId.isEmpty()) {
            applyUserFeatureOverrides(grantable, authGroupManageService.selectUserFeatureOverrides(actorEsntlId));
        }
        return grantable;
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

    private List<FeatureCatalogSectionVO> filterFeatureCatalogSectionsByGrantable(List<FeatureCatalogSectionVO> featureSections,
                                                                                  Set<String> grantableFeatureCodes) {
        if (grantableFeatureCodes == null) {
            return featureSections == null ? Collections.emptyList() : featureSections;
        }
        if (featureSections == null || featureSections.isEmpty() || grantableFeatureCodes.isEmpty()) {
            return Collections.emptyList();
        }
        List<FeatureCatalogSectionVO> filteredSections = new ArrayList<>();
        for (FeatureCatalogSectionVO section : featureSections) {
            List<FeatureCatalogItemVO> filteredFeatures = section.getFeatures().stream()
                    .filter(feature -> grantableFeatureCodes.contains(safeString(feature.getFeatureCode()).toUpperCase(Locale.ROOT)))
                    .collect(Collectors.toList());
            if (filteredFeatures.isEmpty()) {
                continue;
            }
            FeatureCatalogSectionVO filteredSection = new FeatureCatalogSectionVO();
            filteredSection.setMenuCode(section.getMenuCode());
            filteredSection.setMenuNm(section.getMenuNm());
            filteredSection.setMenuNmEn(section.getMenuNmEn());
            filteredSection.setMenuUrl(section.getMenuUrl());
            filteredSection.setFeatures(filteredFeatures);
            filteredSections.add(filteredSection);
        }
        return filteredSections;
    }

    private List<String> filterFeatureCodesByGrantable(List<String> featureCodes, Set<String> grantableFeatureCodes) {
        if (grantableFeatureCodes == null) {
            return normalizeFeatureCodes(featureCodes);
        }
        if (featureCodes == null || featureCodes.isEmpty() || grantableFeatureCodes.isEmpty()) {
            return Collections.emptyList();
        }
        return normalizeFeatureCodes(featureCodes).stream()
                .filter(grantableFeatureCodes::contains)
                .collect(Collectors.toList());
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
            return new LinkedHashSet<>(requestedManagedFeatureCodes);
        }
        Set<String> merged = new LinkedHashSet<>(baselineFeatureCodes == null ? Collections.emptySet() : baselineFeatureCodes);
        Set<String> currentEffective = currentEffectiveFeatureCodes == null ? Collections.emptySet() : currentEffectiveFeatureCodes;
        for (String featureCode : currentEffective) {
            if (!grantableFeatureCodes.contains(featureCode)) {
                merged.add(featureCode);
            }
        }
        if (baselineFeatureCodes != null) {
            for (String featureCode : baselineFeatureCodes) {
                if (!grantableFeatureCodes.contains(featureCode) && !currentEffective.contains(featureCode)) {
                    merged.remove(featureCode);
                }
            }
        }
        merged.removeIf(grantableFeatureCodes::contains);
        if (requestedManagedFeatureCodes != null) {
            merged.addAll(requestedManagedFeatureCodes.stream()
                    .filter(grantableFeatureCodes::contains)
                    .collect(Collectors.toCollection(LinkedHashSet::new)));
        }
        return merged;
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


    private void primeCsrfToken(HttpServletRequest request) {
        if (request == null) {
            return;
        }
        Object token = request.getAttribute("_csrf");
        if (token instanceof CsrfToken) {
            ((CsrfToken) token).getToken();
        }
    }

    private EntrprsManageVO mergeMemberWithInstitutionInfo(EntrprsManageVO member, InstitutionStatusVO institutionInfo) {
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

    private List<EvidenceFileView> loadEvidenceFiles(EntrprsManageVO member) {
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

    private InstitutionStatusVO loadInstitutionInfo(EntrprsManageVO member) {
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

    private String formatPhoneNumber(String areaNo, String middleNo, String endNo) {
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

    private boolean isValidEmail(String email) {
        String value = safeString(email);
        return !value.isEmpty() && value.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    }

    private String digitsOnly(String value) {
        return safeString(value).replaceAll("[^0-9]", "");
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String trimToLen(String value, int maxLen) {
        String normalized = safeString(value);
        if (normalized.length() <= maxLen) {
            return normalized;
        }
        return normalized.substring(0, maxLen);
    }

    private String urlEncode(String value) {
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

    private String safeString(String value) {
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

    private static class EmissionResultSummaryView {
        private final String resultId;
        private final String projectName;
        private final String companyName;
        private final String calculatedAt;
        private final String totalEmission;
        private final String resultStatusCode;
        private final String resultStatusLabel;
        private final String verificationStatusCode;
        private final String verificationStatusLabel;
        private final String detailUrl;

        private EmissionResultSummaryView(String resultId, String projectName, String companyName,
                String calculatedAt, String totalEmission, String resultStatusCode, String resultStatusLabel,
                String verificationStatusCode, String verificationStatusLabel, String detailUrl) {
            this.resultId = resultId;
            this.projectName = projectName;
            this.companyName = companyName;
            this.calculatedAt = calculatedAt;
            this.totalEmission = totalEmission;
            this.resultStatusCode = resultStatusCode;
            this.resultStatusLabel = resultStatusLabel;
            this.verificationStatusCode = verificationStatusCode;
            this.verificationStatusLabel = verificationStatusLabel;
            this.detailUrl = detailUrl;
        }

        public String getResultId() {
            return resultId;
        }

        public String getProjectName() {
            return projectName;
        }

        public String getCompanyName() {
            return companyName;
        }

        public String getCalculatedAt() {
            return calculatedAt;
        }

        public String getTotalEmission() {
            return totalEmission;
        }

        public String getResultStatusCode() {
            return resultStatusCode;
        }

        public String getResultStatusLabel() {
            return resultStatusLabel;
        }

        public String getVerificationStatusCode() {
            return verificationStatusCode;
        }

        public String getVerificationStatusLabel() {
            return verificationStatusLabel;
        }

        public String getDetailUrl() {
            return detailUrl;
        }
    }
}
