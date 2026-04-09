package egovframework.com.feature.auth.external.service;

import egovframework.com.feature.auth.external.dto.request.ExternalAuthCompleteRequest;
import egovframework.com.feature.auth.external.dto.request.ExternalAuthStartRequest;
import egovframework.com.feature.auth.external.dto.response.ExternalAuthMethodResponse;
import egovframework.com.feature.auth.external.dto.response.ExternalAuthStartResponse;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Map;

public interface ExternalAuthService {

    List<ExternalAuthMethodResponse> getAvailableMethods(boolean english);

    ExternalAuthStartResponse start(ExternalAuthStartRequest request, HttpServletRequest servletRequest);

    Map<String, Object> complete(ExternalAuthCompleteRequest request, HttpServletRequest servletRequest,
            HttpServletResponse servletResponse);
}
