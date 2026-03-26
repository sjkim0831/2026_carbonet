package egovframework.com.feature.home.web;

import egovframework.com.common.util.ReactPageUrlMapper;
import org.springframework.stereotype.Controller;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.view.RedirectView;
import lombok.RequiredArgsConstructor;
import org.springframework.security.web.csrf.CsrfToken;

import javax.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ReactAppPageController {
    private final ReactAppViewSupport reactAppViewSupport;

    private String normalizeRoute(String route) {
        return route == null ? "" : route.trim().replace('_', '-');
    }

    private Object renderHomeShell(String route, Model model, boolean english) {
        String normalizedRoute = normalizeRoute(route);
        if ("mypage".equals(normalizedRoute)) {
            return new RedirectView(english ? "/en/mypage" : "/mypage");
        }
        if ("join-wizard".equals(normalizedRoute)) {
            return new RedirectView(english ? "/join/en/step1" : "/join/step1");
        }
        return reactAppViewSupport.render(model, normalizedRoute, english, false);
    }

    private String renderAdminShell(String route, Model model, boolean english) {
        return reactAppViewSupport.render(model, normalizeRoute(route), english, true);
    }

    @GetMapping("/app")
    public Object reactMigration(
            @RequestParam(value = "route", required = false, defaultValue = "mypage") String route,
            Model model) {
        return renderHomeShell(route, model, false);
    }

    @GetMapping("/en/app")
    public Object reactMigrationEn(
            @RequestParam(value = "route", required = false, defaultValue = "mypage") String route,
            Model model) {
        return renderHomeShell(route, model, true);
    }

    @GetMapping("/admin/app")
    public String adminReactMigration(
            @RequestParam(value = "route", required = false, defaultValue = "auth-group") String route,
            Model model) {
        return renderAdminShell(route, model, false);
    }

    @GetMapping("/en/admin/app")
    public String adminReactMigrationEn(
            @RequestParam(value = "route", required = false, defaultValue = "auth-group") String route,
            Model model) {
        return renderAdminShell(route, model, true);
    }

    @GetMapping({"/api/app/bootstrap", "/en/api/app/bootstrap"})
    @ResponseBody
    public ResponseEntity<Map<String, Object>> appBootstrap(
            @RequestParam(value = "route", required = false, defaultValue = "mypage") String route,
            @RequestParam(value = "path", required = false) String path,
            HttpServletRequest request) {
        return ResponseEntity.ok(buildBootstrapPayload(route, path, request, false));
    }

    @GetMapping({"/api/admin/app/bootstrap", "/en/api/admin/app/bootstrap"})
    @ResponseBody
    public ResponseEntity<Map<String, Object>> adminAppBootstrap(
            @RequestParam(value = "route", required = false, defaultValue = "auth-group") String route,
            @RequestParam(value = "path", required = false) String path,
            HttpServletRequest request) {
        return ResponseEntity.ok(buildBootstrapPayload(route, path, request, true));
    }

    private Map<String, Object> buildBootstrapPayload(String route, String path, HttpServletRequest request, boolean admin) {
        String resolvedRoute = normalizeRoute(route);
        String requestedPath = path == null || path.isBlank()
                ? request != null ? request.getHeader("X-Carbonet-Path") : ""
                : path;
        String normalizedRequestedPath = requestedPath == null ? "" : requestedPath.trim();
        if ("/signin/findId/overseas".equals(normalizedRequestedPath) || "/en/signin/findId/overseas".equals(normalizedRequestedPath)) {
            resolvedRoute = "signin_find_id";
        } else if ("/signin/findPassword/overseas".equals(normalizedRequestedPath) || "/en/signin/findPassword/overseas".equals(normalizedRequestedPath)) {
            resolvedRoute = "signin_find_password";
        }
        if (resolvedRoute.isEmpty() || "mypage".equals(resolvedRoute) || "auth-group".equals(resolvedRoute)) {
            String routeByPath = ReactPageUrlMapper.resolveRouteIdForPath(requestedPath);
            if (!routeByPath.isBlank()) {
                resolvedRoute = routeByPath;
            }
        }

        Map<String, Object> payload = new LinkedHashMap<>(reactAppViewSupport.createBootstrapPayload(resolvedRoute, isEnglishRequest(request), admin));
        if (request != null) {
            Object csrf = request.getAttribute("_csrf");
            if (csrf instanceof CsrfToken) {
                CsrfToken csrfToken = (CsrfToken) csrf;
                payload.put("csrfToken", csrfToken.getToken());
                payload.put("csrfHeaderName", csrfToken.getHeaderName());
            }
        }
        return payload;
    }

    private boolean isEnglishRequest(HttpServletRequest request) {
        if (request == null) {
            return false;
        }
        String uri = request.getRequestURI();
        return uri != null && uri.startsWith("/en/");
    }
}
