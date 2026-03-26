package egovframework.com.feature.auth.service;

import egovframework.com.feature.auth.dto.response.FrontendSessionResponseDTO;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class FrontendSessionService {
    private static final Logger log = LoggerFactory.getLogger(FrontendSessionService.class);

    private final CurrentUserContextService currentUserContextService;

    public FrontendSessionResponseDTO buildSession(HttpServletRequest request) {
        FrontendSessionResponseDTO response = new FrontendSessionResponseDTO();
        CurrentUserContextService.CurrentUserContext context = currentUserContextService.resolve(request);
        response.setCsrfToken(context.getCsrfToken());
        response.setCsrfHeaderName(context.getCsrfHeaderName());
        response.setAuthenticated(context.isAuthenticated());
        response.setActualUserId(context.getActualUserId());
        response.setUserId(context.getUserId());
        response.setSimulationAvailable(context.isSimulationAvailable());
        response.setSimulationActive(context.isSimulationActive());
        try {
            response.setAuthorCode(context.getAuthorCode());
            response.setInsttId(context.getInsttId());
            response.setCompanyScope(context.getCompanyScope());
            response.setFeatureCodes(context.getFeatureCodes());
            response.setCapabilityCodes(context.getCapabilityCodes());
        } catch (Exception e) {
            log.error("Failed to build frontend session payload. userId={}", context.getUserId(), e);
            response.setAuthorCode("");
            response.setInsttId("");
            response.setCompanyScope("unknown");
            response.setFeatureCodes(new ArrayList<>());
            response.setCapabilityCodes(new ArrayList<>());
        }
        return response;
    }
}
