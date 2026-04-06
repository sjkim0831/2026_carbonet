package egovframework.com.feature.home.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.ui.Model;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class ReactAppViewSupport {

    @Value("${carbonet.react-app.dev-url:http://127.0.0.1:5173}")
    private String reactAppDevUrl;
    private final ReactAppAssetResolver reactAppAssetResolver;
    private final ReactAppBootstrapService reactAppBootstrapService;

    public ReactAppViewSupport(ReactAppAssetResolver reactAppAssetResolver,
            ReactAppBootstrapService reactAppBootstrapService) {
        this.reactAppAssetResolver = reactAppAssetResolver;
        this.reactAppBootstrapService = reactAppBootstrapService;
    }

    public String render(Model model, String route, boolean en, boolean admin) {
        populate(model, route, en, admin, currentRequest());
        return "forward:/react-shell/index.html";
    }

    public void populate(Model model, String route, boolean en, boolean admin) {
        populate(model, route, en, admin, currentRequest());
    }

    public void populate(Model model, String route, boolean en, boolean admin, HttpServletRequest request) {
        ReactAppAssetResolver.ReactAppAssets assets = reactAppAssetResolver.resolveAssets();
        String jsPath = adaptAssetPath(assets.getJsPath(), admin, en);
        String cssPath = adaptAssetPath(assets.getCssPath(), admin, en);
        applyNoStoreCacheHeaders(currentResponse());
        model.addAttribute("reactRoute", normalizeRoute(route, admin));
        model.addAttribute("reactLocale", en ? "en" : "ko");
        model.addAttribute("reactAdmin", admin);
        model.addAttribute("reactShellTitle", admin
                ? (en ? "Admin React App" : "관리자 React 앱")
                : (en ? "Home React App" : "홈 React 앱"));
        model.addAttribute("reactShellDescription", en
                ? "This page mounts the React app shell."
                : "이 페이지는 React 앱 셸을 마운트합니다.");
        model.addAttribute("reactAppDevUrl", reactAppDevUrl);
        model.addAttribute("reactAppProdJs", jsPath);
        model.addAttribute("reactAppProdCss", cssPath);
        model.addAttribute("reactBootstrapPayload", reactAppBootstrapService.buildBootstrapPayload(route, en, admin, request));
    }

    public Map<String, Object> createBootstrapPayload(String route, boolean en, boolean admin) {
        return createBootstrapPayload(route, en, admin, currentRequest());
    }

    public Map<String, Object> createBootstrapPayload(String route, boolean en, boolean admin, HttpServletRequest request) {
        ReactAppAssetResolver.ReactAppAssets assets = reactAppAssetResolver.resolveAssets();
        String jsPath = adaptAssetPath(assets.getJsPath(), admin, en);
        String cssPath = adaptAssetPath(assets.getCssPath(), admin, en);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("reactRoute", normalizeRoute(route, admin));
        payload.put("reactLocale", en ? "en" : "ko");
        payload.put("reactAdmin", admin);
        payload.put("reactShellTitle", admin
                ? (en ? "Admin React App" : "관리자 React 앱")
                : (en ? "Home React App" : "홈 React 앱"));
        payload.put("reactShellDescription", en
                ? "This page mounts the React app shell."
                : "이 페이지는 React 앱 셸을 마운트합니다.");
        payload.put("reactAppDevUrl", reactAppDevUrl);
        payload.put("reactAppProdJs", jsPath);
        payload.put("reactAppProdCss", cssPath);
        payload.put("reactBootstrapPayload", reactAppBootstrapService.buildBootstrapPayload(route, en, admin, request));
        return payload;
    }

    private String normalizeRoute(String route, boolean admin) {
        String normalized = route == null ? "" : route.trim();
        if (normalized.isEmpty()) {
            return admin ? "auth-group" : "mypage";
        }
        return normalized.replace('_', '-');
    }

    private HttpServletRequest currentRequest() {
        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
        if (requestAttributes instanceof ServletRequestAttributes) {
            return ((ServletRequestAttributes) requestAttributes).getRequest();
        }
        return null;
    }

    private HttpServletResponse currentResponse() {
        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
        if (requestAttributes instanceof ServletRequestAttributes) {
            return ((ServletRequestAttributes) requestAttributes).getResponse();
        }
        return null;
    }

    private void applyNoStoreCacheHeaders(HttpServletResponse response) {
        if (response == null) {
            return;
        }
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store, no-cache, must-revalidate, max-age=0");
        response.setHeader(HttpHeaders.PRAGMA, "no-cache");
        response.setDateHeader(HttpHeaders.EXPIRES, 0);
    }

    private String adaptAssetPath(String path, boolean admin, boolean en) {
        return path == null ? "" : path.trim();
    }
}
