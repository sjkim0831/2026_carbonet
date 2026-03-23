package egovframework.com.feature.auth.service;

import egovframework.com.feature.admin.service.AuthGroupManageService;
import egovframework.com.feature.auth.domain.entity.EmplyrInfo;
import egovframework.com.feature.auth.domain.entity.EntrprsMber;
import egovframework.com.feature.auth.domain.repository.EmployeeMemberRepository;
import egovframework.com.feature.auth.domain.repository.EnterpriseMemberRepository;
import egovframework.com.feature.auth.util.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class CurrentUserContextService {

    private static final String ROLE_SYSTEM_MASTER = "ROLE_SYSTEM_MASTER";
    private static final String ROLE_SYSTEM_ADMIN = "ROLE_SYSTEM_ADMIN";
    private static final String ROLE_ADMIN = "ROLE_ADMIN";
    private static final String ROLE_OPERATION_ADMIN = "ROLE_OPERATION_ADMIN";

    private final JwtTokenProvider jwtProvider;
    private final AuthGroupManageService authGroupManageService;
    private final EmployeeMemberRepository employeeMemberRepository;
    private final EnterpriseMemberRepository enterpriseMemberRepository;

    public CurrentUserContextService(JwtTokenProvider jwtProvider,
                                     AuthGroupManageService authGroupManageService,
                                     EmployeeMemberRepository employeeMemberRepository,
                                     EnterpriseMemberRepository enterpriseMemberRepository) {
        this.jwtProvider = jwtProvider;
        this.authGroupManageService = authGroupManageService;
        this.employeeMemberRepository = employeeMemberRepository;
        this.enterpriseMemberRepository = enterpriseMemberRepository;
    }

    public CurrentUserContext resolve(HttpServletRequest request) {
        CurrentUserContext context = new CurrentUserContext();
        if (request == null) {
            return context;
        }
        Object token = request.getAttribute("_csrf");
        if (token instanceof CsrfToken) {
            CsrfToken csrfToken = (CsrfToken) token;
            context.setCsrfToken(csrfToken.getToken());
            context.setCsrfHeaderName(csrfToken.getHeaderName());
        }
        return resolve(extractCurrentUserId(request), context);
    }

    public CurrentUserContext resolve(String userId) {
        return resolve(userId, new CurrentUserContext());
    }

    private CurrentUserContext resolve(String userId, CurrentUserContext context) {
        String normalizedUserId = safeString(userId);
        context.setUserId(normalizedUserId);
        context.setAuthenticated(!normalizedUserId.isEmpty());
        context.setWebmaster(isWebmaster(normalizedUserId));
        if (normalizedUserId.isEmpty()) {
            context.setCompanyScope("anonymous");
            return context;
        }

        String authorCode = resolveAuthorCode(normalizedUserId);
        List<String> featureCodes = resolveFeatureCodes(authorCode);
        context.setAuthorCode(authorCode);
        context.setInsttId(resolveInsttId(normalizedUserId));
        context.setCompanyScope(resolveCompanyScope(normalizedUserId, authorCode));
        context.setFeatureCodes(featureCodes);
        context.setCapabilityCodes(toCapabilityCodes(featureCodes));
        return context;
    }

    private String extractCurrentUserId(HttpServletRequest request) {
        try {
            String accessToken = jwtProvider.getCookie(request, "accessToken");
            if (ObjectUtils.isEmpty(accessToken)) {
                return "";
            }
            Claims claims = jwtProvider.accessExtractClaims(accessToken);
            Object encryptedUserId = claims.get("userId");
            return encryptedUserId == null ? "" : safeString(jwtProvider.decrypt(encryptedUserId.toString()));
        } catch (Exception e) {
            return "";
        }
    }

    private String resolveAuthorCode(String userId) {
        if (isWebmaster(userId)) {
            return ROLE_SYSTEM_MASTER;
        }
        try {
            return safeString(authGroupManageService.selectAuthorCodeByUserId(userId)).toUpperCase(Locale.ROOT);
        } catch (Exception e) {
            return "";
        }
    }

    private List<String> resolveFeatureCodes(String authorCode) {
        try {
            return normalizeFeatureCodes(authGroupManageService.selectAuthorFeatureCodes(authorCode));
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private String resolveInsttId(String userId) {
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

    private String resolveCompanyScope(String userId, String authorCode) {
        if (isWebmaster(userId)) {
            return "global";
        }
        String normalizedAuthorCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        if (ROLE_SYSTEM_MASTER.equals(normalizedAuthorCode)
                || ROLE_SYSTEM_ADMIN.equals(normalizedAuthorCode)
                || ROLE_ADMIN.equals(normalizedAuthorCode)) {
            return "global";
        }
        if (ROLE_OPERATION_ADMIN.equals(normalizedAuthorCode)) {
            return "own-company";
        }
        return "role-scoped";
    }

    private List<String> normalizeFeatureCodes(List<String> featureCodes) {
        if (featureCodes == null) {
            return new ArrayList<>();
        }
        Set<String> dedup = new LinkedHashSet<>();
        for (String featureCode : featureCodes) {
            String normalized = safeString(featureCode).toUpperCase(Locale.ROOT);
            if (!normalized.isEmpty()) {
                dedup.add(normalized);
            }
        }
        return new ArrayList<>(dedup);
    }

    private List<String> toCapabilityCodes(List<String> featureCodes) {
        List<String> capabilityCodes = new ArrayList<>();
        for (String featureCode : featureCodes) {
            capabilityCodes.add(featureCode.toLowerCase(Locale.ROOT).replace('_', '.'));
        }
        return capabilityCodes;
    }

    private boolean isWebmaster(String userId) {
        return "webmaster".equalsIgnoreCase(safeString(userId));
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }

    public static class CurrentUserContext {
        private String userId = "";
        private String authorCode = "";
        private String insttId = "";
        private String companyScope = "anonymous";
        private boolean authenticated;
        private boolean webmaster;
        private String csrfToken = "";
        private String csrfHeaderName = "";
        private List<String> featureCodes = new ArrayList<>();
        private List<String> capabilityCodes = new ArrayList<>();

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId == null ? "" : userId;
        }

        public String getAuthorCode() {
            return authorCode;
        }

        public void setAuthorCode(String authorCode) {
            this.authorCode = authorCode == null ? "" : authorCode;
        }

        public String getInsttId() {
            return insttId;
        }

        public void setInsttId(String insttId) {
            this.insttId = insttId == null ? "" : insttId;
        }

        public String getCompanyScope() {
            return companyScope;
        }

        public void setCompanyScope(String companyScope) {
            this.companyScope = companyScope == null ? "" : companyScope;
        }

        public boolean isAuthenticated() {
            return authenticated;
        }

        public void setAuthenticated(boolean authenticated) {
            this.authenticated = authenticated;
        }

        public boolean isWebmaster() {
            return webmaster;
        }

        public void setWebmaster(boolean webmaster) {
            this.webmaster = webmaster;
        }

        public String getCsrfToken() {
            return csrfToken;
        }

        public void setCsrfToken(String csrfToken) {
            this.csrfToken = csrfToken == null ? "" : csrfToken;
        }

        public String getCsrfHeaderName() {
            return csrfHeaderName;
        }

        public void setCsrfHeaderName(String csrfHeaderName) {
            this.csrfHeaderName = csrfHeaderName == null ? "" : csrfHeaderName;
        }

        public List<String> getFeatureCodes() {
            return featureCodes;
        }

        public void setFeatureCodes(List<String> featureCodes) {
            this.featureCodes = featureCodes == null ? new ArrayList<>() : new ArrayList<>(featureCodes);
        }

        public List<String> getCapabilityCodes() {
            return capabilityCodes;
        }

        public void setCapabilityCodes(List<String> capabilityCodes) {
            this.capabilityCodes = capabilityCodes == null ? new ArrayList<>() : new ArrayList<>(capabilityCodes);
        }
    }
}
