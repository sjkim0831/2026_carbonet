package egovframework.com.feature.admin.web;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
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
public class AdminEmissionResultController {

    private final AdminMainController adminMainController;

    @RequestMapping(value = "/emission/result_list", method = { RequestMethod.GET, RequestMethod.POST })
    public String emissionResultListPage(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "resultStatus", required = false) String resultStatus,
            @RequestParam(value = "verificationStatus", required = false) String verificationStatus,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return adminMainController.emission_result_list(
                pageIndexParam,
                searchKeyword,
                resultStatus,
                verificationStatus,
                request,
                locale,
                model);
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
        return adminMainController.emissionResultListPageApi(
                pageIndexParam,
                searchKeyword,
                resultStatus,
                verificationStatus,
                request,
                locale);
    }
}
