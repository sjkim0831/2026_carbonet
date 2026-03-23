package egovframework.com.feature.auth.service;

import egovframework.com.feature.admin.service.AuthGroupManageService;
import egovframework.com.feature.auth.domain.entity.EmplyrInfo;
import egovframework.com.feature.auth.domain.entity.EntrprsMber;
import egovframework.com.feature.auth.domain.repository.EmployeeMemberRepository;
import egovframework.com.feature.auth.domain.repository.EnterpriseMemberRepository;
import egovframework.com.feature.auth.dto.response.FrontendSessionResponseDTO;
import egovframework.com.feature.auth.util.JwtTokenProvider;
import egovframework.com.framework.authority.service.FrameworkAuthorityPolicyService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FrontendSessionService {

    private final JwtTokenProvider jwtProvider;
    private final AuthGroupManageService authGroupManageService;
    private final EmployeeMemberRepository employeeMemberRepository;
    private final EnterpriseMemberRepository enterpriseMemberRepository;
    private final FrameworkAuthorityPolicyService frameworkAuthorityPolicyService;

    public FrontendSessionResponseDTO buildSession(HttpServletRequest request) {
        FrontendSessionResponseDTO response = new FrontendSessionResponseDTO();
        applyCsrf(request, response);

        String userId = extractCurrentUserId(request);
        if (userId.isEmpty()) {
            response.setAuthenticated(false);
            response.setCompanyScope("anonymous");
            return response;
        }

        response.setAuthenticated(true);
        response.setUserId(userId);

        try {
            String authorCode = resolveCurrentUserAuthorCode(userId);
            List<String> featureCodes = frameworkAuthorityPolicyService.normalizeFeatureCodes(authGroupManageService.selectAuthorFeatureCodes(authorCode));
            response.setAuthorCode(authorCode);
            response.setInsttId(resolveCurrentUserInsttId(userId));
            response.setCompanyScope(frameworkAuthorityPolicyService.resolveCompanyScope(userId, authorCode));
            response.setFeatureCodes(featureCodes);
            response.setCapabilityCodes(toCapabilityCodes(featureCodes));
        } catch (Exception e) {
            log.error("Failed to build frontend session payload. userId={}", userId, e);
            response.setAuthorCode("");
            response.setInsttId("");
            response.setCompanyScope("unknown");
            response.setFeatureCodes(new ArrayList<>());
            response.setCapabilityCodes(new ArrayList<>());
        }

        return response;
    }

    private void applyCsrf(HttpServletRequest request, FrontendSessionResponseDTO response) {
        if (request == null) {
            return;
        }
        Object token = request.getAttribute("_csrf");
        if (token instanceof CsrfToken) {
            CsrfToken csrfToken = (CsrfToken) token;
            response.setCsrfToken(csrfToken.getToken());
            response.setCsrfHeaderName(csrfToken.getHeaderName());
        }
    }

    private String extractCurrentUserId(HttpServletRequest request) {
        if (request == null) {
            return "";
        }
        try {
            String accessToken = jwtProvider.getCookie(request, "accessToken");
            if (ObjectUtils.isEmpty(accessToken)) {
                return "";
            }
            Claims claims = jwtProvider.accessExtractClaims(accessToken);
            Object encryptedUserId = claims.get("userId");
            return encryptedUserId == null ? "" : safeString(jwtProvider.decrypt(encryptedUserId.toString()));
        } catch (Exception e) {
            log.debug("Failed to extract frontend session user id.", e);
            return "";
        }
    }

    private String resolveCurrentUserAuthorCode(String userId) throws Exception {
        if (isWebmaster(userId)) {
            return ROLE_SYSTEM_MASTER;
        }
        return safeString(authGroupManageService.selectAuthorCodeByUserId(userId)).toUpperCase(Locale.ROOT);
    }

    private String resolveCurrentUserInsttId(String userId) {
        if (userId.isEmpty() || isWebmaster(userId)) {
            return "";
        }

        String employeeInsttId = employeeMemberRepository.findById(userId)
                .map(EmplyrInfo::getInsttId)
                .map(this::safeString)
                .orElse("");
        if (!employeeInsttId.isEmpty()) {
            return employeeInsttId;
        }

        return enterpriseMemberRepository.findById(userId)
                .map(EntrprsMber::getInsttId)
                .map(this::safeString)
                .orElse("");
    }

    private List<String> toCapabilityCodes(List<String> featureCodes) {
        return featureCodes.stream()
                .map(code -> code.toLowerCase(Locale.ROOT).replace('_', '.'))
                .collect(Collectors.toList());
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }
}
