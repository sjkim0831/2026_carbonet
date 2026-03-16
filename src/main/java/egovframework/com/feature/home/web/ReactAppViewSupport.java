package egovframework.com.feature.home.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.ui.Model;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class ReactAppViewSupport {

    @Value("${carbonet.react-app.dev-url:http://127.0.0.1:5173}")
    private String reactAppDevUrl;
    private final ReactAppAssetResolver reactAppAssetResolver;

    public ReactAppViewSupport(ReactAppAssetResolver reactAppAssetResolver) {
        this.reactAppAssetResolver = reactAppAssetResolver;
    }

    public String render(Model model, String route, boolean en, boolean admin) {
        populate(model, route, en, admin);
        return "forward:/react-shell/index.html";
    }

    public void populate(Model model, String route, boolean en, boolean admin) {
        ReactAppAssetResolver.ReactAppAssets assets = reactAppAssetResolver.resolveAssets();
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
        model.addAttribute("reactAppProdJs", assets.getJsPath());
        model.addAttribute("reactAppProdCss", assets.getCssPath());
    }

    public Map<String, Object> createBootstrapPayload(String route, boolean en, boolean admin) {
        ReactAppAssetResolver.ReactAppAssets assets = reactAppAssetResolver.resolveAssets();
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
        payload.put("reactAppProdJs", assets.getJsPath());
        payload.put("reactAppProdCss", assets.getCssPath());
        return payload;
    }

    private String normalizeRoute(String route, boolean admin) {
        String normalized = route == null ? "" : route.trim();
        if (normalized.isEmpty()) {
            return admin ? "auth_group" : "mypage";
        }
        return normalized.replace('-', '_');
    }
}
