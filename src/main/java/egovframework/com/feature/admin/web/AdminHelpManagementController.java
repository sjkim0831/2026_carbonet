package egovframework.com.feature.admin.web;

import egovframework.com.common.help.HelpManagementSaveRequest;
import egovframework.com.platform.help.web.HelpManagementApiController;
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
public class AdminHelpManagementController {

    private final AdminReactRouteSupport adminReactRouteSupport;
    private final HelpManagementApiController platformHelpManagementApiController;

    @RequestMapping(value = "/system/help-management", method = RequestMethod.GET)
    public String helpManagementPage(HttpServletRequest request, Locale locale, Model model) {
        return adminReactRouteSupport.forwardAdminRoute(request, locale, "help-management");
    }

    @GetMapping("/api/admin/help-management/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getHelpPage(
            @RequestParam(value = "pageId", required = false) String pageId) {
        return platformHelpManagementApiController.getHelpPage(pageId);
    }

    @GetMapping("/api/admin/help-management/screen-command/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getScreenCommandPage(
            @RequestParam(value = "pageId", required = false) String pageId) throws Exception {
        return platformHelpManagementApiController.getScreenCommandPage(pageId);
    }

    @PostMapping("/api/admin/help-management/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveHelpPage(
            @RequestBody HelpManagementSaveRequest request,
            HttpServletRequest httpServletRequest) {
        return platformHelpManagementApiController.saveHelpPage(request, httpServletRequest);
    }

    @PostMapping("/api/admin/help-management/screen-command/map-menu")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveScreenCommandMenuMapping(
            @RequestBody Map<String, Object> requestBody,
            HttpServletRequest httpServletRequest) throws Exception {
        return platformHelpManagementApiController.saveScreenCommandMenuMapping(requestBody, httpServletRequest);
    }
}
