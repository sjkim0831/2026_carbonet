package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.dto.request.AdminAuthChangeSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminAuthGroupCreateRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminAuthGroupFeatureSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminAuthorRoleProfileSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminDeptRoleMappingSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminDeptRoleMemberSaveRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.Locale;
import java.util.Map;

@Controller
@RequestMapping({"/admin", "/en/admin"})
@RequiredArgsConstructor
public class AdminAuthorityController {

    private final AdminMainController adminMainController;

    @RequestMapping(value = { "/member/auth-group", "/auth/group", "/system/role" }, method = RequestMethod.GET)
    public String authGroupPage(
            @RequestParam(value = "authorCode", required = false) String authorCode,
            @RequestParam(value = "roleCategory", required = false) String roleCategory,
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "userSearchKeyword", required = false) String userSearchKeyword,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return adminMainController.auth_group(authorCode, roleCategory, insttId, userSearchKeyword, request, locale, model);
    }

    @GetMapping("/api/admin/auth-groups/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> authGroupPageApi(
            @RequestParam(value = "authorCode", required = false) String authorCode,
            @RequestParam(value = "roleCategory", required = false) String roleCategory,
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "menuCode", required = false) String menuCode,
            @RequestParam(value = "featureCode", required = false) String featureCode,
            @RequestParam(value = "userSearchKeyword", required = false) String userSearchKeyword,
            HttpServletRequest request,
            Locale locale) {
        return adminMainController.authGroupPageApi(authorCode, roleCategory, insttId, menuCode, featureCode, userSearchKeyword, request, locale);
    }

    @PostMapping("/api/admin/auth-groups/profile-save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveAuthGroupProfileApi(
            @RequestBody AdminAuthorRoleProfileSaveRequestDTO payload,
            HttpServletRequest request,
            Locale locale) {
        return adminMainController.saveAuthGroupProfileApi(payload, request, locale);
    }

    @PostMapping("/api/admin/auth-groups")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createAuthGroupApi(
            @RequestBody AdminAuthGroupCreateRequestDTO payload,
            HttpServletRequest request,
            Locale locale) {
        return adminMainController.createAuthGroupApi(payload, request, locale);
    }

    @PostMapping("/api/admin/auth-groups/features")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveAuthGroupFeaturesApi(
            @RequestBody AdminAuthGroupFeatureSaveRequestDTO payload,
            HttpServletRequest request,
            Locale locale) {
        return adminMainController.saveAuthGroupFeaturesApi(payload, request, locale);
    }

    @RequestMapping(value = { "/member/auth-change", "/system/auth-change" }, method = RequestMethod.GET)
    public String authChangePage(
            @RequestParam(value = "updated", required = false) String updated,
            @RequestParam(value = "targetUserId", required = false) String targetUserId,
            @RequestParam(value = "error", required = false) String error,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return adminMainController.auth_change(updated, targetUserId, error, request, locale, model);
    }

    @GetMapping("/api/admin/auth-change/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> authChangePageApi(
            @RequestParam(value = "updated", required = false) String updated,
            @RequestParam(value = "targetUserId", required = false) String targetUserId,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "pageIndex", required = false) Integer pageIndex,
            @RequestParam(value = "error", required = false) String error,
            HttpServletRequest request,
            Locale locale) {
        return adminMainController.authChangePageApi(updated, targetUserId, searchKeyword, pageIndex, error, request, locale);
    }

    @GetMapping("/api/admin/auth-change/history")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> authChangeHistoryApi(
            HttpServletRequest request,
            Locale locale) {
        return adminMainController.authChangeHistoryApi(request, locale);
    }

    @PostMapping("/api/admin/auth-change/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveAuthChangeApi(
            @RequestBody AdminAuthChangeSaveRequestDTO payload,
            HttpServletRequest request,
            Locale locale) {
        return adminMainController.saveAuthChangeApi(payload, request, locale);
    }

    @RequestMapping(value = { "/member/dept-role-mapping", "/system/dept-role-mapping" }, method = RequestMethod.GET)
    public String deptRolePage(
            @RequestParam(value = "updated", required = false) String updated,
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "error", required = false) String error,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return adminMainController.dept_role_mapping(updated, insttId, error, request, locale, model);
    }

    @GetMapping("/api/admin/dept-role-mapping/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deptRoleMappingPageApi(
            @RequestParam(value = "updated", required = false) String updated,
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "memberSearchKeyword", required = false) String memberSearchKeyword,
            @RequestParam(value = "memberPageIndex", required = false) Integer memberPageIndex,
            @RequestParam(value = "error", required = false) String error,
            HttpServletRequest request,
            Locale locale) {
        return adminMainController.deptRoleMappingPageApi(updated, insttId, memberSearchKeyword, memberPageIndex, error, request, locale);
    }

    @PostMapping("/api/admin/dept-role-mapping/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveDeptRoleMappingApi(
            @RequestBody AdminDeptRoleMappingSaveRequestDTO payload,
            HttpServletRequest request,
            Locale locale) {
        return adminMainController.saveDeptRoleMappingApi(payload, request, locale);
    }

    @PostMapping("/api/admin/dept-role-mapping/member-save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveDeptRoleMemberApi(
            @RequestBody AdminDeptRoleMemberSaveRequestDTO payload,
            HttpServletRequest request,
            Locale locale) {
        return adminMainController.saveDeptRoleMemberApi(payload, request, locale);
    }
}
