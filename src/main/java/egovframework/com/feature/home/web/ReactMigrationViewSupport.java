package egovframework.com.feature.home.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.ui.Model;

@Component
public class ReactMigrationViewSupport {

    @Value("${carbonet.react-migration.dev-url:http://127.0.0.1:5173}")
    private String reactMigrationDevUrl;
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
                ? (en ? "Admin React Migration" : "관리자 React 마이그레이션")
                : (en ? "Home React Migration" : "홈 React 마이그레이션"));
        model.addAttribute("reactShellDescription", en
                ? "This page mounts the React migration shell."
                : "이 페이지는 React 마이그레이션 셸을 마운트합니다.");
        model.addAttribute("reactMigrationDevUrl", reactMigrationDevUrl);
        model.addAttribute("reactMigrationProdJs", assets.getJsPath());
        model.addAttribute("reactMigrationProdCss", assets.getCssPath());
        return en ? "egovframework/com/home/react_migration_shell_en" : "egovframework/com/home/react_migration_shell";
    }

    private String normalizeRoute(String route, boolean admin) {
        String normalized = route == null ? "" : route.trim();
        if (normalized.isEmpty()) {
            return admin ? "auth-group" : "mypage";
        }
        return normalized;
    }
}
