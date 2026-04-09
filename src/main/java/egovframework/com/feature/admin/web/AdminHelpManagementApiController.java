package egovframework.com.feature.admin.web;

import egovframework.com.common.help.HelpManagementSaveRequest;
import egovframework.com.platform.help.web.HelpManagementApiController;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/help-management")
public class AdminHelpManagementApiController {

    private final HelpManagementApiController platformHelpManagementApiController;

    @GetMapping("/page")
    public ResponseEntity<Map<String, Object>> getHelpPage(
            @RequestParam(value = "pageId", required = false) String pageId) {
        return platformHelpManagementApiController.getHelpPage(pageId);
    }

    @GetMapping("/screen-command/page")
    public ResponseEntity<Map<String, Object>> getScreenCommandPage(
            @RequestParam(value = "pageId", required = false) String pageId) throws Exception {
        return platformHelpManagementApiController.getScreenCommandPage(pageId);
    }

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveHelpPage(
            @RequestBody HelpManagementSaveRequest request,
            HttpServletRequest httpServletRequest) {
        return platformHelpManagementApiController.saveHelpPage(request, httpServletRequest);
    }
}
