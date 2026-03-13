package egovframework.com.common.filter;

import egovframework.com.common.logging.RequestExecutionLogService;
import egovframework.com.common.logging.RequestExecutionLogVO;
import egovframework.com.feature.admin.service.AuthGroupManageService;
import egovframework.com.feature.auth.domain.entity.EmplyrInfo;
import egovframework.com.feature.auth.domain.entity.EntrprsMber;
import egovframework.com.feature.auth.domain.repository.EmployeeMemberRepository;
import egovframework.com.feature.auth.domain.repository.EnterpriseMemberRepository;
import egovframework.com.feature.auth.util.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.ObjectUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Slf4j
public class RequestExecutionLoggingFilter extends OncePerRequestFilter {

    private static final String MASTER_ROLE = "ROLE_SYSTEM_MASTER";
    private static final DateTimeFormatter TS_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final RequestExecutionLogService requestExecutionLogService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthGroupManageService authGroupManageService;
    private final EmployeeMemberRepository employeeMemberRepository;
    private final EnterpriseMemberRepository enterpriseMemberRepository;

    public RequestExecutionLoggingFilter(RequestExecutionLogService requestExecutionLogService,
                                         JwtTokenProvider jwtTokenProvider,
                                         AuthGroupManageService authGroupManageService,
                                         EmployeeMemberRepository employeeMemberRepository,
                                         EnterpriseMemberRepository enterpriseMemberRepository) {
        this.requestExecutionLogService = requestExecutionLogService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authGroupManageService = authGroupManageService;
        this.employeeMemberRepository = employeeMemberRepository;
        this.enterpriseMemberRepository = enterpriseMemberRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        long startedAt = System.currentTimeMillis();
        Exception failure = null;
        try {
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            failure = e;
            throw e;
        } finally {
            try {
                requestExecutionLogService.append(buildLog(request, response, startedAt, failure));
            } catch (Exception e) {
                log.warn("Failed to append request execution log. uri={}", request.getRequestURI(), e);
            }
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = safeString(request.getRequestURI()).toLowerCase(Locale.ROOT);
        return path.isEmpty()
                || path.startsWith("/css/")
                || path.startsWith("/js/")
                || path.startsWith("/images/")
                || path.startsWith("/webjars/")
                || path.startsWith("/error")
                || path.startsWith("/actuator")
                || path.matches(".*\\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|otf|eot|ico|html)$");
    }

    private RequestExecutionLogVO buildLog(HttpServletRequest request, HttpServletResponse response,
                                           long startedAt, Exception failure) {
        RequestExecutionLogVO item = new RequestExecutionLogVO();
        item.setLogId("REQ-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase(Locale.ROOT));
        item.setExecutedAt(LocalDateTime.now().format(TS_FORMAT));
        item.setRequestUri(safeString(request.getRequestURI()));
        item.setHttpMethod(safeString(request.getMethod()).toUpperCase(Locale.ROOT));
        item.setFeatureType(resolveFeatureType(request));
        item.setRequestContentType(safeString(request.getContentType()));
        item.setResponseStatus(response == null ? 0 : response.getStatus());
        item.setDurationMs(Math.max(System.currentTimeMillis() - startedAt, 0));
        item.setQueryString(safeString(request.getQueryString()));
        item.setParameterSummary(buildParameterSummary(request));
        item.setErrorMessage(failure == null ? "" : safeString(failure.getMessage()));

        populateActor(item, request);

        String explicitCompanyContextId = resolveExplicitCompanyContextId(request);
        String targetCompanyContextId = resolveTargetCompanyContextId(request, item.getActorInsttId());
        String companyContextId = explicitCompanyContextId.isEmpty() ? targetCompanyContextId : explicitCompanyContextId;
        boolean companyRequired = !MASTER_ROLE.equalsIgnoreCase(safeString(item.getActorAuthorCode()));
        item.setCompanyContextId(companyContextId);
        item.setTargetCompanyContextId(targetCompanyContextId);
        item.setCompanyContextRequired(companyRequired);
        item.setCompanyContextIncluded(!companyRequired || !safeString(companyContextId).isEmpty());
        item.setCompanyContextExplicit(!explicitCompanyContextId.isEmpty());
        item.setCompanyScopeDecision(safeString((String) request.getAttribute("companyScopeDecision")));
        item.setCompanyScopeReason(safeString((String) request.getAttribute("companyScopeReason")));

        return item;
    }

    private void populateActor(RequestExecutionLogVO item, HttpServletRequest request) {
        String accessToken = jwtTokenProvider.getCookie(request, "accessToken");
        String userId = extractCurrentUserId(accessToken);
        item.setActorUserId(userId);
        if (userId.isEmpty()) {
            item.setActorType("ANONYMOUS");
            return;
        }
        try {
            if (employeeMemberRepository.findById(userId).isPresent()) {
                item.setActorType("ADMIN");
            } else if (enterpriseMemberRepository.findById(userId).isPresent()) {
                item.setActorType("ENTERPRISE_MEMBER");
            } else {
                item.setActorType("AUTHENTICATED");
            }
            String authorCode = safeString(authGroupManageService.selectAuthorCodeByUserId(userId)).toUpperCase(Locale.ROOT);
            if (authorCode.isEmpty()) {
                authorCode = safeString(authGroupManageService.selectEnterpriseAuthorCodeByUserId(userId)).toUpperCase(Locale.ROOT);
            }
            item.setActorAuthorCode(authorCode);
        } catch (Exception e) {
            log.debug("Failed to resolve actor role. userId={}", userId, e);
        }
        try {
            String insttId = employeeMemberRepository.findById(userId)
                    .map(EmplyrInfo::getInsttId)
                    .map(this::safeString)
                    .orElse("");
            if (insttId.isEmpty()) {
                insttId = enterpriseMemberRepository.findById(userId)
                        .map(EntrprsMber::getInsttId)
                        .map(this::safeString)
                        .orElse("");
            }
            if (insttId.isEmpty()) {
                insttId = safeString(authGroupManageService.selectEnterpriseInsttIdByUserId(userId));
            }
            item.setActorInsttId(insttId);
        } catch (Exception e) {
            log.debug("Failed to resolve actor company. userId={}", userId, e);
        }
    }

    private String extractCurrentUserId(String accessToken) {
        if (ObjectUtils.isEmpty(accessToken)) {
            return "";
        }
        try {
            Claims claims = jwtTokenProvider.accessExtractClaims(accessToken);
            Object encryptedUserId = claims.get("userId");
            if (ObjectUtils.isEmpty(encryptedUserId)) {
                return "";
            }
            return safeString(jwtTokenProvider.decrypt(encryptedUserId.toString()));
        } catch (Exception e) {
            return "";
        }
    }

    private String resolveFeatureType(HttpServletRequest request) {
        String method = safeString(request.getMethod()).toUpperCase(Locale.ROOT);
        String uri = safeString(request.getRequestURI()).toLowerCase(Locale.ROOT);
        String contentType = safeString(request.getContentType()).toLowerCase(Locale.ROOT);

        if (contentType.contains("multipart/") || request.getParameter("fileUploads") != null || uri.contains("upload")) {
            return "FILE_UPLOAD";
        }
        if (uri.contains("address") || uri.contains("juso") || uri.contains("postcode") || uri.contains("roadaddr") || uri.contains("zip")) {
            return "ADDRESS_SEARCH";
        }
        if (uri.contains("download") || uri.contains("excel") || uri.contains("export")) {
            return "FILE_DOWNLOAD";
        }
        if (uri.contains("codex")) {
            return "CODEX";
        }
        if (uri.contains("login") || uri.contains("logout") || uri.contains("token")) {
            return "AUTH";
        }
        if ("GET".equals(method)) {
            if (uri.contains("search") || uri.contains("list") || uri.contains("detail")) {
                return "QUERY";
            }
            return "VIEW";
        }
        if (uri.contains("delete") || "DELETE".equals(method)) {
            return "DELETE";
        }
        if (uri.contains("create") || uri.contains("register")) {
            return "CREATE";
        }
        if (uri.contains("update") || uri.contains("save") || "PUT".equals(method) || "PATCH".equals(method)) {
            return "UPDATE";
        }
        return "ACTION";
    }

    private String resolveExplicitCompanyContextId(HttpServletRequest request) {
        List<String> candidates = new ArrayList<>();
        candidates.add(safeString(request.getParameter("companyId")));
        candidates.add(safeString(request.getParameter("insttId")));
        candidates.add(safeString(request.getParameter("cmpnyId")));
        candidates.add(safeString(request.getHeader("X-Company-Id")));
        candidates.add(safeString(request.getHeader("X-Instt-Id")));
        for (String candidate : candidates) {
            if (!candidate.isEmpty()) {
                return candidate;
            }
        }
        return "";
    }

    private String resolveTargetCompanyContextId(HttpServletRequest request, String actorInsttId) {
        String explicitCompanyContextId = resolveExplicitCompanyContextId(request);
        if (!explicitCompanyContextId.isEmpty()) {
            return explicitCompanyContextId;
        }
        return safeString(actorInsttId);
    }

    private String buildParameterSummary(HttpServletRequest request) {
        Enumeration<String> names = request.getParameterNames();
        List<String> pairs = new ArrayList<>();
        while (names != null && names.hasMoreElements()) {
            String name = names.nextElement();
            if (isSensitive(name)) {
                pairs.add(name + "=***");
                continue;
            }
            String[] values = request.getParameterValues(name);
            if (values == null || values.length == 0) {
                pairs.add(name + "=");
                continue;
            }
            String value = safeString(values[0]);
            if (value.length() > 60) {
                value = value.substring(0, 60) + "...";
            }
            pairs.add(name + "=" + value);
        }
        return String.join("&", pairs);
    }

    private boolean isSensitive(String name) {
        String normalized = safeString(name).toLowerCase(Locale.ROOT);
        return normalized.contains("password")
                || normalized.contains("passwd")
                || normalized.contains("token")
                || normalized.contains("secret");
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }
}
