package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.service.AdminFaqManagementService;
import egovframework.com.feature.home.web.ReactAppViewSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AdminFaqManagementController {

    private final AdminFaqManagementService adminFaqManagementService;
    private final ObjectProvider<ReactAppViewSupport> reactAppViewSupportProvider;

    @RequestMapping(value = {"/admin/content/faq_list"}, method = {RequestMethod.GET, RequestMethod.POST})
    public String faqManagement(HttpServletRequest request, Model model) {
        return reactAppViewSupportProvider.getObject().render(model, "faq-management", false, true);
    }

    @RequestMapping(value = {"/en/admin/content/faq_list"}, method = {RequestMethod.GET, RequestMethod.POST})
    public String faqManagementEn(HttpServletRequest request, Model model) {
        return reactAppViewSupportProvider.getObject().render(model, "faq-management", true, true);
    }

    @GetMapping("/admin/api/admin/content/faq")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> faqManagementApi(
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "exposure", required = false) String exposure,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "faqId", required = false) String faqId) {
        return ResponseEntity.ok(adminFaqManagementService.buildPagePayload(searchKeyword, status, exposure, category, faqId, false));
    }

    @GetMapping("/en/admin/api/admin/content/faq")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> faqManagementApiEn(
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "exposure", required = false) String exposure,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "faqId", required = false) String faqId) {
        return ResponseEntity.ok(adminFaqManagementService.buildPagePayload(searchKeyword, status, exposure, category, faqId, true));
    }

    @PostMapping("/admin/api/admin/content/faq/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveFaqManagementApi(
            @RequestParam(value = "faqId", required = false) String faqId,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "question", required = false) String question,
            @RequestParam(value = "answerScope", required = false) String answerScope,
            @RequestParam(value = "exposure", required = false) String exposure,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "displayOrder", required = false) String displayOrder) {
        return ResponseEntity.ok(adminFaqManagementService.saveFaq(faqId, category, question, answerScope, exposure, status, displayOrder, false));
    }

    @PostMapping("/en/admin/api/admin/content/faq/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveFaqManagementApiEn(
            @RequestParam(value = "faqId", required = false) String faqId,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "question", required = false) String question,
            @RequestParam(value = "answerScope", required = false) String answerScope,
            @RequestParam(value = "exposure", required = false) String exposure,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "displayOrder", required = false) String displayOrder) {
        return ResponseEntity.ok(adminFaqManagementService.saveFaq(faqId, category, question, answerScope, exposure, status, displayOrder, true));
    }
}
