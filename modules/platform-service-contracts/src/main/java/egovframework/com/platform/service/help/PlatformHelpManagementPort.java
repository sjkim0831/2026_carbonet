package egovframework.com.platform.service.help;

import egovframework.com.common.help.HelpManagementSaveRequest;
import org.springframework.http.ResponseEntity;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

public interface PlatformHelpManagementPort {

    ResponseEntity<Map<String, Object>> getHelpPage(String pageId);

    ResponseEntity<Map<String, Object>> getScreenCommandPage(String pageId) throws Exception;

    ResponseEntity<Map<String, Object>> saveHelpPage(HelpManagementSaveRequest request, HttpServletRequest httpServletRequest);

    ResponseEntity<Map<String, Object>> saveScreenCommandMenuMapping(Map<String, Object> requestBody,
                                                                     HttpServletRequest httpServletRequest) throws Exception;
}
