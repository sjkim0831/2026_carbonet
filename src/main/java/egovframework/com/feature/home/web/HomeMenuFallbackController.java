package egovframework.com.feature.home.web;

import egovframework.com.feature.admin.dto.response.MenuInfoDTO;
import egovframework.com.feature.admin.service.MenuInfoService;
import egovframework.com.feature.home.service.HomeMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.Cookie;
import java.util.Locale;

@Controller
@RequiredArgsConstructor
public class HomeMenuFallbackController {

    private final MenuInfoService menuInfoService;
    private final HomeMenuService homeMenuService;
    private final ReactMigrationViewSupport reactMigrationViewSupport;

    @RequestMapping(
            value = {
                    "/emission/**", "/certificate/**", "/co2/**", "/trade/**", "/monitoring/**",
                    "/payment/**", "/edu/**", "/support/**", "/mtn/**",
                    "/mypage/profile", "/mypage/company", "/mypage/staff", "/mypage/notification",
                    "/mypage/password", "/mypage/email", "/mypage/marketing",
                    "/en/emission/**", "/en/certificate/**", "/en/co2/**", "/en/trade/**", "/en/monitoring/**",
                    "/en/payment/**", "/en/edu/**", "/en/support/**", "/en/mtn/**",
                    "/en/mypage/profile", "/en/mypage/company", "/en/mypage/staff", "/en/mypage/notification",
                    "/en/mypage/password", "/en/mypage/email", "/en/mypage/marketing"
            },
            method = { RequestMethod.GET, RequestMethod.POST })
    public String homeMenuPlaceholder(HttpServletRequest request, Locale locale, Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalized = normalizeRequestUri(request);
        if (normalized.startsWith("/mypage/")) {
            return reactMigrationViewSupport.render(model, "mypage", isEn, false);
        }
        MenuInfoDTO menu = loadMenu(normalized);
        if (menu == null) {
            return isEn ? "redirect:/en/home" : "redirect:/home";
        }

        model.addAttribute("isLoggedIn", hasAccessToken(request));
        model.addAttribute("homeMenu", homeMenuService.getHomeMenu(isEn));
        model.addAttribute("placeholderTitle", isEn ? fallbackLabel(menu.getCodeDc(), menu.getCodeNm()) : fallbackLabel(menu.getCodeNm(), menu.getCodeDc()));
        model.addAttribute("placeholderTitleEn", fallbackLabel(menu.getCodeDc(), menu.getCodeNm()));
        model.addAttribute("placeholderCode", safeString(menu.getCode()));
        model.addAttribute("placeholderUrl", request.getRequestURI());
        model.addAttribute("placeholderIcon", safeString(menu.getMenuIcon()).isEmpty() ? "web" : safeString(menu.getMenuIcon()));
        return isEn ? "egovframework/com/home/menu_placeholder_en" : "egovframework/com/home/menu_placeholder";
    }

    private MenuInfoDTO loadMenu(String normalizedUrl) {
        try {
            return menuInfoService.selectMenuDetailByUrl(normalizedUrl);
        } catch (Exception e) {
            return null;
        }
    }

    private boolean isEnglishRequest(HttpServletRequest request, Locale locale) {
        if (request != null) {
            String path = request.getRequestURI();
            if (path != null && path.startsWith("/en/")) {
                return true;
            }
            String param = request.getParameter("language");
            if ("en".equalsIgnoreCase(param)) {
                return true;
            }
        }
        return locale != null && locale.getLanguage().toLowerCase(Locale.ROOT).startsWith("en");
    }

    private String normalizeRequestUri(HttpServletRequest request) {
        String requestUri = request == null ? "" : safeString(request.getRequestURI());
        return requestUri.startsWith("/en/") ? requestUri.substring(3) : requestUri;
    }

    private String fallbackLabel(String primary, String fallback) {
        String value = safeString(primary);
        return value.isEmpty() ? safeString(fallback) : value;
    }

    private boolean hasAccessToken(HttpServletRequest request) {
        if (request == null || request.getCookies() == null) {
            return false;
        }
        for (Cookie cookie : request.getCookies()) {
            if ("accessToken".equals(cookie.getName()) && !safeString(cookie.getValue()).isEmpty()) {
                return true;
            }
        }
        return false;
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }
}
