package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.service.AdminTagManagementService;
import egovframework.com.feature.home.web.ReactAppViewSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AdminTagManagementController {

    private final AdminTagManagementService adminTagManagementService;
    private final ObjectProvider<ReactAppViewSupport> reactAppViewSupportProvider;

    @RequestMapping(value = {"/admin/content/tag"}, method = {RequestMethod.GET, RequestMethod.POST})
    public String tagManagement(HttpServletRequest request, Model model) {
        return reactAppViewSupportProvider.getObject().render(model, "tag-management", false, true);
    }

    @RequestMapping(value = {"/en/admin/content/tag"}, method = {RequestMethod.GET, RequestMethod.POST})
    public String tagManagementEn(HttpServletRequest request, Model model) {
        return reactAppViewSupportProvider.getObject().render(model, "tag-management", true, true);
    }

    @GetMapping("/admin/api/admin/content/tag")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> tagManagementApi(
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "status", required = false) String status) {
        return ResponseEntity.ok(adminTagManagementService.buildPagePayload(searchKeyword, status, false));
    }

    @GetMapping("/en/admin/api/admin/content/tag")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> tagManagementApiEn(
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "status", required = false) String status) {
        return ResponseEntity.ok(adminTagManagementService.buildPagePayload(searchKeyword, status, true));
    }
}
