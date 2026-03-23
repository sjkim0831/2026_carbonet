package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.model.vo.LoginHistorySearchVO;
import egovframework.com.feature.admin.model.vo.LoginHistoryVO;
import egovframework.com.feature.admin.service.AdminLoginHistoryService;
import egovframework.com.feature.auth.domain.entity.EmplyrInfo;
import egovframework.com.feature.member.model.vo.CompanyListItemVO;
import egovframework.com.feature.member.model.vo.EntrprsManageVO;
import egovframework.com.feature.member.service.EnterpriseMemberService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;

import javax.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminListPageModelAssembler {

    private static final Logger log = LoggerFactory.getLogger(AdminListPageModelAssembler.class);

    private final ObjectProvider<AdminMainController> adminMainControllerProvider;
    private final EnterpriseMemberService entrprsManageService;
    private final AdminLoginHistoryService adminLoginHistoryService;

    private AdminMainController adminMainController() {
        return adminMainControllerProvider.getObject();
    }

    public void populateMemberList(
            String pageIndexParam,
            String searchKeyword,
            String membershipType,
            String sbscrbSttus,
            Model model,
            HttpServletRequest request) {
        AdminMainController controller = adminMainController();
        int pageIndex = parsePageIndex(pageIndexParam);
        int currentPage = Math.max(pageIndex, 1);
        int pageSize = 10;

        EntrprsManageVO searchVO = new EntrprsManageVO();
        searchVO.setPageIndex(currentPage);
        searchVO.setRecordCountPerPage(pageSize);

        String keyword = controller.safeString(searchKeyword).trim();
        searchVO.setSearchKeyword(keyword);
        searchVO.setSearchCondition("all");

        String memberType = controller.safeString(membershipType).trim().toUpperCase(Locale.ROOT);
        if (!memberType.isEmpty()) {
            String dbTypeCode = controller.normalizeMembershipCode(memberType);
            if (!dbTypeCode.isEmpty()) {
                searchVO.setEntrprsSeCode(dbTypeCode);
            }
        }

        String status = controller.safeString(sbscrbSttus).trim();
        if (!status.isEmpty()) {
            searchVO.setSbscrbSttus(status);
        }
        String currentUserId = controller.extractCurrentUserId(request);
        String currentUserAuthorCode = controller.resolveCurrentUserAuthorCode(currentUserId);
        if (controller.requiresOwnCompanyAccess(currentUserId, currentUserAuthorCode)) {
            searchVO.setInsttId(controller.resolveCurrentUserInsttId(currentUserId));
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
            memberList = Collections.emptyList();
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

        model.addAttribute("member_list", memberList);
        model.addAttribute("totalCount", totalCount);
        model.addAttribute("pageIndex", currentPage);
        model.addAttribute("pageSize", pageSize);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("startPage", startPage);
        model.addAttribute("endPage", endPage);
        model.addAttribute("searchKeyword", keyword);
        model.addAttribute("membershipType", memberType);
        model.addAttribute("sbscrbSttus", status);
    }

    public void populateAdminMemberList(
            String pageIndexParam,
            String searchKeyword,
            String sbscrbSttus,
            Model model,
            HttpServletRequest request) {
        AdminMainController controller = adminMainController();
        int pageIndex = parsePageIndex(pageIndexParam);
        int currentPage = Math.max(pageIndex, 1);
        int pageSize = 10;

        String keyword = controller.safeString(searchKeyword);
        String status = controller.safeString(sbscrbSttus).toUpperCase(Locale.ROOT);
        String currentUserId = controller.extractCurrentUserId(request);
        String currentUserAuthorCode = controller.resolveCurrentUserAuthorCode(currentUserId);
        boolean canView = controller.hasMemberManagementCompanyAdminAccess(currentUserId, currentUserAuthorCode);
        if (!canView) {
            model.addAttribute("member_listError", "관리자 목록을 조회할 권한이 없습니다.");
            model.addAttribute("member_list", Collections.emptyList());
            model.addAttribute("totalCount", 0);
            model.addAttribute("pageIndex", 1);
            model.addAttribute("pageSize", pageSize);
            model.addAttribute("totalPages", 1);
            model.addAttribute("startPage", 1);
            model.addAttribute("endPage", 1);
            model.addAttribute("searchKeyword", keyword);
            model.addAttribute("sbscrbSttus", status);
            model.addAttribute("canUseAdminListActions", false);
            return;
        }

        List<EmplyrInfo> visibleAdmins;
        try {
            visibleAdmins = controller.selectVisibleAdminMembers(currentUserId, currentUserAuthorCode, keyword, status);
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
            model.addAttribute("canUseAdminListActions", false);
            return;
        }

        int totalCount = visibleAdmins.size();
        int totalPages = Math.max((int) Math.ceil(totalCount / (double) pageSize), 1);
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        int fromIndex = Math.max(0, Math.min((currentPage - 1) * pageSize, totalCount));
        int toIndex = Math.max(fromIndex, Math.min(fromIndex + pageSize, totalCount));
        List<EmplyrInfo> pageItems = totalCount == 0 ? Collections.emptyList() : visibleAdmins.subList(fromIndex, toIndex);
        int startPage = Math.max(1, currentPage - 4);
        int endPage = Math.min(totalPages, startPage + 9);
        if (endPage - startPage < 9) {
            startPage = Math.max(1, endPage - 9);
        }
        int prevPage = Math.max(1, currentPage - 1);
        int nextPage = Math.min(totalPages, currentPage + 1);

        model.addAttribute("member_list", pageItems);
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
        model.addAttribute("canUseAdminListActions", controller.canCreateAdminAccounts(currentUserId, currentUserAuthorCode));
    }

    public void populateCompanyList(
            String pageIndexParam,
            String searchKeyword,
            String sbscrbSttus,
            Model model,
            HttpServletRequest request) {
        AdminMainController controller = adminMainController();
        int pageIndex = parsePageIndex(pageIndexParam);
        int currentPage = Math.max(pageIndex, 1);
        int pageSize = 10;

        String keyword = controller.safeString(searchKeyword);
        String status = controller.safeString(sbscrbSttus).toUpperCase(Locale.ROOT);
        String currentUserId = controller.extractCurrentUserId(request);
        String currentUserAuthorCode = controller.resolveCurrentUserAuthorCode(currentUserId);
        String scopedInsttId = controller.requiresOwnCompanyAccess(currentUserId, currentUserAuthorCode)
                ? controller.resolveCurrentUserInsttId(currentUserId)
                : "";

        List<CompanyListItemVO> companyList;
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
            companyList = entrprsManageService.searchCompanyListPaged(searchParams);
        } catch (Exception e) {
            log.error("Failed to load company list.", e);
            companyList = Collections.emptyList();
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

        model.addAttribute("company_list", companyList);
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
    }

    public void populateLoginHistory(
            String pageIndexParam,
            String searchKeyword,
            String userSe,
            String loginResult,
            String requestedInsttId,
            Model model,
            HttpServletRequest request) {
        AdminMainController controller = adminMainController();
        int pageIndex = parsePageIndex(pageIndexParam);
        int currentPage = Math.max(pageIndex, 1);
        int pageSize = 10;
        String keyword = controller.safeString(searchKeyword);
        String normalizedUserSe = controller.safeString(userSe).toUpperCase(Locale.ROOT);
        String normalizedLoginResult = controller.safeString(loginResult).toUpperCase(Locale.ROOT);
        String currentUserId = controller.extractCurrentUserId(request);
        String currentUserAuthorCode = controller.resolveCurrentUserAuthorCode(currentUserId);
        boolean masterAccess = controller.hasMemberManagementMasterAccess(currentUserId, currentUserAuthorCode);
        String currentUserInsttId = controller.resolveCurrentUserInsttId(currentUserId);
        List<Map<String, String>> companyOptions = masterAccess
                ? controller.loadAccessHistoryCompanyOptions()
                : controller.buildScopedAccessHistoryCompanyOptions(currentUserInsttId);
        String selectedInsttId = masterAccess
                ? controller.resolveSelectedInsttId(requestedInsttId, companyOptions, true)
                : currentUserInsttId;

        LoginHistorySearchVO searchVO = new LoginHistorySearchVO();
        searchVO.setSearchKeyword(keyword);
        searchVO.setUserSe(normalizedUserSe);
        searchVO.setLoginResult(normalizedLoginResult);
        searchVO.setInsttId(selectedInsttId);
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

        populateLoginHistoryModel(model, currentPage, pageSize, keyword, normalizedUserSe, normalizedLoginResult,
                companyOptions, selectedInsttId, masterAccess, pageItems, totalCount);
    }

    public void populateBlockedLoginHistory(
            String pageIndexParam,
            String searchKeyword,
            String userSe,
            String requestedInsttId,
            Model model,
            HttpServletRequest request) {
        AdminMainController controller = adminMainController();
        int pageIndex = parsePageIndex(pageIndexParam);
        int currentPage = Math.max(pageIndex, 1);
        int pageSize = 10;
        String keyword = controller.safeString(searchKeyword);
        String normalizedUserSe = controller.safeString(userSe).toUpperCase(Locale.ROOT);
        String normalizedLoginResult = "FAIL";
        String normalizedBlockedOnly = "Y";
        String currentUserId = controller.extractCurrentUserId(request);
        String currentUserAuthorCode = controller.resolveCurrentUserAuthorCode(currentUserId);
        boolean masterAccess = controller.hasMemberManagementMasterAccess(currentUserId, currentUserAuthorCode);
        String currentUserInsttId = controller.resolveCurrentUserInsttId(currentUserId);
        List<Map<String, String>> companyOptions = masterAccess
                ? controller.loadAccessHistoryCompanyOptions()
                : controller.buildScopedAccessHistoryCompanyOptions(currentUserInsttId);
        String selectedInsttId = masterAccess
                ? controller.resolveSelectedInsttId(requestedInsttId, companyOptions, true)
                : currentUserInsttId;

        LoginHistorySearchVO searchVO = new LoginHistorySearchVO();
        searchVO.setSearchKeyword(keyword);
        searchVO.setUserSe(normalizedUserSe);
        searchVO.setLoginResult(normalizedLoginResult);
        searchVO.setBlockedOnly(normalizedBlockedOnly);
        searchVO.setInsttId(selectedInsttId);
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

        populateLoginHistoryModel(model, currentPage, pageSize, keyword, normalizedUserSe, normalizedLoginResult,
                companyOptions, selectedInsttId, masterAccess, pageItems, totalCount);
    }

    private void populateLoginHistoryModel(
            Model model,
            int currentPage,
            int pageSize,
            String keyword,
            String normalizedUserSe,
            String normalizedLoginResult,
            List<Map<String, String>> companyOptions,
            String selectedInsttId,
            boolean masterAccess,
            List<LoginHistoryVO> pageItems,
            int totalCount) {
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
        model.addAttribute("companyOptions", companyOptions);
        model.addAttribute("selectedInsttId", selectedInsttId);
        model.addAttribute("canManageAllCompanies", masterAccess);
    }

    private int parsePageIndex(String pageIndexParam) {
        if (pageIndexParam != null && !pageIndexParam.trim().isEmpty()) {
            try {
                return Integer.parseInt(pageIndexParam.trim());
            } catch (NumberFormatException ignored) {
                return 1;
            }
        }
        return 1;
    }
}
