package egovframework.com.feature.admin.web;

import egovframework.com.feature.member.model.vo.CompanyListItemVO;
import egovframework.com.feature.member.model.vo.EntrprsManageVO;
import egovframework.com.feature.member.model.vo.InsttFileVO;
import egovframework.com.feature.member.service.EnterpriseMemberService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminApprovalPageModelAssembler {

    private static final Logger log = LoggerFactory.getLogger(AdminApprovalPageModelAssembler.class);

    private final ObjectProvider<AdminMainController> adminMainControllerProvider;
    private final EnterpriseMemberService entrprsManageService;

    private AdminMainController adminMainController() {
        return adminMainControllerProvider.getObject();
    }

    public void populateMemberApprovalList(
            String pageIndexParam,
            String searchKeyword,
            String membershipType,
            String sbscrbSttus,
            String result,
            Model model,
            boolean isEn,
            HttpServletRequest request,
            Locale locale) {
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

        EntrprsManageVO searchVO = new EntrprsManageVO();
        searchVO.setPageIndex(currentPage);
        searchVO.setRecordCountPerPage(pageSize);

        String keyword = controller.safeString(searchKeyword);
        searchVO.setSearchKeyword(keyword);
        searchVO.setSearchCondition("all");

        String memberType = controller.safeString(membershipType).toUpperCase(Locale.ROOT);
        if (!memberType.isEmpty()) {
            String dbTypeCode = controller.normalizeMembershipCode(memberType);
            if (!dbTypeCode.isEmpty()) {
                searchVO.setEntrprsSeCode(dbTypeCode);
            }
        }

        String status = controller.safeString(sbscrbSttus).toUpperCase(Locale.ROOT);
        if (status.isEmpty()) {
            status = "A";
        }
        searchVO.setSbscrbSttus(status);
        String currentUserId = controller.extractCurrentUserId(request);
        String currentUserAuthorCode = controller.resolveCurrentUserAuthorCode(currentUserId);
        if (!controller.hasMemberManagementCompanyOperatorAccess(currentUserId, currentUserAuthorCode)) {
            populateMemberApprovalForbidden(model, keyword, memberType, status, result, isEn, request, locale, controller, pageSize);
            return;
        }
        if (controller.requiresMemberManagementCompanyScope(currentUserId, currentUserAuthorCode)) {
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
            log.error("Failed to load member approval list.", e);
            memberList = Collections.emptyList();
            totalCount = 0;
            model.addAttribute("memberApprovalError",
                    isEn ? "An error occurred while retrieving the approval list." : "승인 대기 목록 조회 중 오류가 발생했습니다.");
        }

        List<Map<String, Object>> approvalRows = new ArrayList<>();
        for (EntrprsManageVO member : memberList) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("memberId", controller.safeString(member.getEntrprsmberId()));
            row.put("memberName", controller.safeString(member.getApplcntNm()));
            row.put("companyName", controller.safeString(member.getCmpnyNm()));
            row.put("businessNumber", controller.safeString(member.getBizrno()));
            row.put("departmentName", controller.safeString(member.getDeptNm()));
            row.put("representativeName", controller.safeString(member.getCxfc()));
            row.put("joinDate", controller.safeString(member.getSbscrbDe()));
            row.put("membershipTypeLabel", isEn
                    ? controller.resolveMembershipTypeLabelEn(member.getEntrprsSeCode())
                    : controller.resolveMembershipTypeLabel(member.getEntrprsSeCode()));
            row.put("statusLabel", isEn
                    ? controller.resolveStatusLabelEn(member.getEntrprsMberSttus())
                    : controller.resolveStatusLabel(member.getEntrprsMberSttus()));
            row.put("statusBadgeClass", controller.resolveStatusBadgeClass(member.getEntrprsMberSttus()));
            row.put("rejectReason", controller.safeString(member.getRjctRsn()));
            row.put("detailUrl", controller.adminPrefix(request, locale) + "/member/detail?memberId="
                    + controller.urlEncode(member.getEntrprsmberId()));
            List<AdminMainController.EvidenceFileView> evidenceFiles = controller.loadEvidenceFiles(member);
            List<Map<String, Object>> evidencePreviewFiles = new ArrayList<>();
            for (int fileIndex = 0; fileIndex < Math.min(evidenceFiles.size(), 2); fileIndex++) {
                AdminMainController.EvidenceFileView file = evidenceFiles.get(fileIndex);
                Map<String, Object> preview = new LinkedHashMap<>();
                preview.put("fileName", controller.safeString(file.getFileName()));
                preview.put("downloadUrl", controller.safeString(file.getDownloadUrl()));
                evidencePreviewFiles.add(preview);
            }
            row.put("evidenceFiles", evidencePreviewFiles);
            row.put("evidenceFileCount", evidenceFiles.size());
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
        String approvalBasePath = controller.resolveMemberApprovalBasePath(request, locale);
        model.addAttribute("memberApprovalAction", approvalBasePath);
        model.addAttribute("memberApprovalListUrl", approvalBasePath);
        model.addAttribute("memberApprovalResult", controller.safeString(result));
        model.addAttribute("memberApprovalResultMessage", controller.resolveApprovalResultMessage(result, isEn));
        model.addAttribute("memberApprovalStatusOptions", controller.buildApprovalStatusOptions(isEn));
        model.addAttribute("memberTypeOptions", controller.buildMemberTypeOptions(isEn));
    }

    public void populateCompanyApprovalList(
            String pageIndexParam,
            String searchKeyword,
            String sbscrbSttus,
            String result,
            Model model,
            boolean isEn,
            HttpServletRequest request,
            Locale locale) {
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
        String status = controller.safeString(sbscrbSttus).toUpperCase(Locale.ROOT);
        if (status.isEmpty()) {
            status = "A";
        }
        String currentUserId = controller.extractCurrentUserId(request);
        String currentUserAuthorCode = controller.resolveCurrentUserAuthorCode(currentUserId);
        if (!controller.hasMemberManagementMasterAccess(currentUserId, currentUserAuthorCode)) {
            populateCompanyApprovalForbidden(model, keyword, status, result, isEn, request, locale, controller, pageSize);
            return;
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
                insttId = controller.safeString(companyVO.getInsttId());
                companyName = controller.safeString(companyVO.getCmpnyNm());
                businessNumber = controller.safeString(companyVO.getBizrno());
                representativeName = controller.safeString(companyVO.getCxfc());
                membershipTypeCode = controller.safeString(companyVO.getEntrprsSeCode());
                joinStat = controller.safeString(companyVO.getJoinStat());
            } else if (company instanceof Map) {
                Map<?, ?> companyMap = (Map<?, ?>) company;
                insttId = controller.stringValue(companyMap.get("insttId"));
                if (insttId.isEmpty()) insttId = controller.stringValue(companyMap.get("INSTT_ID"));
                companyName = controller.stringValue(companyMap.get("cmpnyNm"));
                if (companyName.isEmpty()) companyName = controller.stringValue(companyMap.get("CMPNY_NM"));
                businessNumber = controller.stringValue(companyMap.get("bizrno"));
                if (businessNumber.isEmpty()) businessNumber = controller.stringValue(companyMap.get("BIZRNO"));
                representativeName = controller.stringValue(companyMap.get("cxfc"));
                if (representativeName.isEmpty()) representativeName = controller.stringValue(companyMap.get("CXFC"));
                membershipTypeCode = controller.stringValue(companyMap.get("entrprsSeCode"));
                if (membershipTypeCode.isEmpty()) membershipTypeCode = controller.stringValue(companyMap.get("ENTRPRS_SE_CODE"));
                joinStat = controller.stringValue(companyMap.get("joinStat"));
                if (joinStat.isEmpty()) joinStat = controller.stringValue(companyMap.get("JOIN_STAT"));
            } else {
                continue;
            }
            row.put("insttId", insttId);
            row.put("companyName", companyName);
            row.put("businessNumber", businessNumber);
            row.put("representativeName", representativeName);
            row.put("membershipTypeLabel", isEn
                    ? controller.resolveMembershipTypeLabelEn(membershipTypeCode)
                    : controller.resolveMembershipTypeLabel(membershipTypeCode));
            row.put("statusLabel", isEn
                    ? controller.resolveInstitutionStatusLabelEn(joinStat)
                    : controller.resolveInstitutionStatusLabel(joinStat));
            row.put("statusBadgeClass", controller.resolveInstitutionStatusBadgeClass(joinStat));
            row.put("detailUrl", controller.adminPrefix(request, locale) + "/member/company_detail?insttId=" + controller.urlEncode(insttId));
            row.put("editUrl", controller.adminPrefix(request, locale) + "/member/company_account?insttId=" + controller.urlEncode(insttId));
            row.put("rejectReason", "");

            if (!insttId.isEmpty()) {
                try {
                    row.put("rejectReason", controller.safeString(controller.loadInstitutionInfoByInsttId(insttId).getRjctRsn()));
                } catch (Exception e) {
                    log.warn("Failed to load company rejection reason. insttId={}", insttId, e);
                }
            }

            List<InsttFileVO> fileList = controller.loadInsttFilesByInsttId(insttId);
            List<Map<String, String>> evidenceFiles = new ArrayList<>();
            for (InsttFileVO file : fileList) {
                Map<String, String> fileRow = new LinkedHashMap<>();
                fileRow.put("fileName", controller.safeString(file.getOrignlFileNm()));
                fileRow.put("downloadUrl",
                        controller.adminPrefix(request, locale) + "/member/company-file?fileId="
                                + controller.urlEncode(file.getFileId()) + "&download=true");
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
        model.addAttribute("memberApprovalAction", controller.adminPrefix(request, locale) + "/member/company-approve");
        model.addAttribute("memberApprovalListUrl", controller.adminPrefix(request, locale) + "/member/company-approve");
        model.addAttribute("memberApprovalResult", controller.safeString(result));
        model.addAttribute("memberApprovalResultMessage", controller.resolveCompanyApprovalResultMessage(result, isEn));
        model.addAttribute("memberApprovalStatusOptions", controller.buildApprovalStatusOptions(isEn));
    }

    private void populateMemberApprovalForbidden(
            Model model,
            String keyword,
            String memberType,
            String status,
            String result,
            boolean isEn,
            HttpServletRequest request,
            Locale locale,
            AdminMainController controller,
            int pageSize) {
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
        String approvalBasePath = controller.resolveMemberApprovalBasePath(request, locale);
        model.addAttribute("memberApprovalAction", approvalBasePath);
        model.addAttribute("memberApprovalListUrl", approvalBasePath);
        model.addAttribute("memberApprovalResult", controller.safeString(result));
        model.addAttribute("memberApprovalResultMessage", controller.resolveApprovalResultMessage(result, isEn));
        model.addAttribute("memberApprovalStatusOptions", controller.buildApprovalStatusOptions(isEn));
        model.addAttribute("memberTypeOptions", controller.buildMemberTypeOptions(isEn));
    }

    private void populateCompanyApprovalForbidden(
            Model model,
            String keyword,
            String status,
            String result,
            boolean isEn,
            HttpServletRequest request,
            Locale locale,
            AdminMainController controller,
            int pageSize) {
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
        model.addAttribute("memberApprovalAction", controller.adminPrefix(request, locale) + "/member/company-approve");
        model.addAttribute("memberApprovalListUrl", controller.adminPrefix(request, locale) + "/member/company-approve");
        model.addAttribute("memberApprovalResult", controller.safeString(result));
        model.addAttribute("memberApprovalResultMessage", controller.resolveCompanyApprovalResultMessage(result, isEn));
        model.addAttribute("memberApprovalStatusOptions", controller.buildApprovalStatusOptions(isEn));
    }
}
