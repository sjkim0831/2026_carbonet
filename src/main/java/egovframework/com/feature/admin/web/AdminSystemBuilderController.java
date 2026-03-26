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
public class AdminSystemBuilderController {

    private final AdminMainController adminMainController;

    @GetMapping("/api/admin/system/menu-permission-diagnostics")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> menuPermissionDiagnosticsApi(
            HttpServletRequest request,
            Locale locale) {
        return adminMainController.menuPermissionDiagnosticsApi(request, locale);
    }

    @GetMapping("/api/admin/menu-placeholder")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> adminMenuPlaceholderApi(
            @RequestParam(value = "requestPath", required = false) String requestPath,
            HttpServletRequest request,
            Locale locale) {
        return adminMainController.adminMenuPlaceholderApi(requestPath, request, locale);
    }

    @RequestMapping(value = "/**", method = { RequestMethod.GET })
    public String adminFallback(HttpServletRequest request, Locale locale, Model model) {
        return adminMainController.adminFallback(request, locale, model);
    }
}
