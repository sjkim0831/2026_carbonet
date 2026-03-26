package egovframework.com.feature.admin.web;

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
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Controller
@RequestMapping({"/admin", "/en/admin"})
@RequiredArgsConstructor
public class AdminApprovalController {

    private final AdminMainController adminMainController;

    @RequestMapping(value = "/member/approve", method = RequestMethod.GET)
    public String memberApprovePage(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "membershipType", required = false) String membershipType,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            @RequestParam(value = "result", required = false) String result,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return adminMainController.member_approve(pageIndexParam, searchKeyword, membershipType, sbscrbSttus, result, request, locale, model);
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
        return adminMainController.memberApprovePageApi(pageIndexParam, searchKeyword, membershipType, sbscrbSttus, result, request, locale);
    }

    @RequestMapping(value = "/member/company-approve", method = RequestMethod.GET)
    public String companyApprovePage(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            @RequestParam(value = "result", required = false) String result,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return adminMainController.companyMemberApprove(pageIndexParam, searchKeyword, sbscrbSttus, result, request, locale, model);
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
        return adminMainController.companyApprovePageApi(pageIndexParam, searchKeyword, sbscrbSttus, result, request, locale);
    }

    @RequestMapping(value = "/member/approve", method = RequestMethod.POST)
    public String memberApproveSubmit(
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
        return adminMainController.member_approveSubmit(action, memberId, selectedMemberIds, rejectReason, pageIndexParam, searchKeyword, membershipType, sbscrbSttus, request, locale, model);
    }

    @RequestMapping(value = "/member/company-approve", method = RequestMethod.POST)
    public String companyApproveSubmit(
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
        return adminMainController.companyMemberApproveSubmit(action, insttId, selectedInsttIds, rejectReason, pageIndexParam, searchKeyword, sbscrbSttus, request, locale, model);
    }

    @PostMapping("/api/admin/member/approve/action")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> memberApproveSubmitApi(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request,
            Locale locale) {
        return adminMainController.memberApproveSubmitApi(payload, request, locale);
    }

    @PostMapping("/api/admin/member/company-approve/action")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> companyApproveSubmitApi(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request,
            Locale locale) {
        return adminMainController.companyApproveSubmitApi(payload, request, locale);
    }
}
