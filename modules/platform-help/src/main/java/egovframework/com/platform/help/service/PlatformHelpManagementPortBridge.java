package egovframework.com.platform.help.service;

import egovframework.com.common.help.HelpManagementSaveRequest;
import egovframework.com.platform.help.web.HelpManagementApiController;
import egovframework.com.platform.service.help.PlatformHelpManagementPort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@Service
public class PlatformHelpManagementPortBridge implements PlatformHelpManagementPort {

    private final HelpManagementApiController delegate;

    public PlatformHelpManagementPortBridge(HelpManagementApiController delegate) {
        this.delegate = delegate;
    }

    @Override
    public ResponseEntity<Map<String, Object>> getHelpPage(String pageId) {
        return delegate.getHelpPage(pageId);
    }

    @Override
    public ResponseEntity<Map<String, Object>> getScreenCommandPage(String pageId) throws Exception {
        return delegate.getScreenCommandPage(pageId);
    }

    @Override
    public ResponseEntity<Map<String, Object>> saveHelpPage(HelpManagementSaveRequest request,
                                                            HttpServletRequest httpServletRequest) {
        return delegate.saveHelpPage(request, httpServletRequest);
    }

    @Override
    public ResponseEntity<Map<String, Object>> saveScreenCommandMenuMapping(Map<String, Object> requestBody,
                                                                            HttpServletRequest httpServletRequest) throws Exception {
        return delegate.saveScreenCommandMenuMapping(requestBody, httpServletRequest);
    }
}
