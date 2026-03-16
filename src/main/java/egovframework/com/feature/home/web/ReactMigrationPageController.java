package egovframework.com.feature.home.web;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.view.RedirectView;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ReactMigrationPageController {
    private final ReactMigrationViewSupport reactMigrationViewSupport;

    private String normalizeRoute(String route) {
        return route == null ? "" : route.trim().replace('-', '_');
    }

    @GetMapping("/react-migration")
    public Object reactMigration(
            @RequestParam(value = "route", required = false, defaultValue = "mypage") String route,
            Model model) {
        String normalizedRoute = normalizeRoute(route);
        if ("mypage".equals(normalizedRoute)) {
            return new RedirectView("/mypage");
        }
        if ("join_wizard".equals(normalizedRoute)) {
            return new RedirectView("/join/step1");
        }
        return reactMigrationViewSupport.render(model, normalizedRoute, false, false);
    }

    @GetMapping("/en/react-migration")
    public Object reactMigrationEn(
            @RequestParam(value = "route", required = false, defaultValue = "mypage") String route,
            Model model) {
        String normalizedRoute = normalizeRoute(route);
        if ("mypage".equals(normalizedRoute)) {
            return new RedirectView("/en/mypage");
        }
        if ("join_wizard".equals(normalizedRoute)) {
            return new RedirectView("/join/en/step1");
        }
        return reactMigrationViewSupport.render(model, normalizedRoute, true, false);
    }

    @GetMapping("/admin/react-migration")
    public String adminReactMigration(
            @RequestParam(value = "route", required = false, defaultValue = "auth_group") String route,
            Model model) {
        return reactMigrationViewSupport.render(model, normalizeRoute(route), false, true);
    }

    @GetMapping("/en/admin/react-migration")
    public String adminReactMigrationEn(
            @RequestParam(value = "route", required = false, defaultValue = "auth_group") String route,
            Model model) {
        return reactMigrationViewSupport.render(model, normalizeRoute(route), true, true);
    }
}
