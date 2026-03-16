package egovframework.com.feature.home.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.ui.Model;

@Component
public class ReactMigrationViewSupport {

    @Value("${carbonet.react-app.dev-url:http://127.0.0.1:5173}")
    private String reactAppDevUrl;
    private final ReactMigrationAssetResolver reactMigrationAssetResolver;

    public ReactMigrationViewSupport(ReactMigrationAssetResolver reactMigrationAssetResolver) {
        this.reactMigrationAssetResolver = reactMigrationAssetResolver;
    }

    public String render(Model model, String route, boolean en, boolean admin) {
        ReactMigrationAssetResolver.ReactMigrationAssets assets = reactMigrationAssetResolver.resolveAssets();
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
        return en ? "egovframework/com/home/react_app_shell_en" : "egovframework/com/home/react_app_shell";
    }

    public void populate(Model model, String route, boolean en, boolean admin) {
        ReactMigrationAssetResolver.ReactMigrationAssets assets = reactMigrationAssetResolver.resolveAssets();
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

    private String normalizeRoute(String route, boolean admin) {
        String normalized = route == null ? "" : route.trim();
        if (normalized.isEmpty()) {
            return admin ? "auth_group" : "mypage";
        }
        return normalized.replace('-', '_');
    }
}
