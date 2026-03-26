package egovframework.com.feature.admin.web;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletRequest;
import java.util.Locale;

@Controller
@RequestMapping({"/admin", "/en/admin"})
@RequiredArgsConstructor
public class AdminMemberExportController {

    private final AdminMainController adminMainController;

    @RequestMapping(value = "/member/list/excel", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<byte[]> memberListExcel(
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "membershipType", required = false) String membershipType,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus) throws Exception {
        return adminMainController.member_listExcel(searchKeyword, membershipType, sbscrbSttus);
    }

    @RequestMapping(value = { "/member/admin_list/excel", "/member/admin-list/excel" }, method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<byte[]> adminListExcel(
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request) throws Exception {
        return adminMainController.adminListExcel(searchKeyword, sbscrbSttus, request);
    }

    @RequestMapping(value = { "/member/company_list/excel", "/member/company-list/excel" }, method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<byte[]> companyListExcel(
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
            HttpServletRequest request,
            Locale locale) throws Exception {
        return adminMainController.company_listExcel(searchKeyword, sbscrbSttus, request, locale);
    }
}
