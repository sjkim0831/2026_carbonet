package egovframework.com.feature.home.web;

import egovframework.com.common.util.ReactPageUrlMapper;
import egovframework.com.feature.admin.dto.response.MenuInfoDTO;
import egovframework.com.feature.admin.service.MenuInfoService;
import egovframework.com.feature.home.service.HomeMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.Cookie;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class HomeMenuFallbackController {

    private final MenuInfoService menuInfoService;
    private final HomeMenuService homeMenuService;
    private final ReactAppViewSupport reactAppViewSupport;

    @RequestMapping(
            value = {
                    "/emission/**", "/certificate/**", "/co2/**", "/trade/**", "/monitoring/**",
                    "/payment/**", "/edu/**", "/support/**", "/mtn/**",
                    "/mypage/**",
                    "/en/emission/**", "/en/certificate/**", "/en/co2/**", "/en/trade/**", "/en/monitoring/**",
                    "/en/payment/**", "/en/edu/**", "/en/support/**", "/en/mtn/**",
                    "/en/mypage/**"
            },
            method = { RequestMethod.GET })
    public String homeMenuPlaceholder(HttpServletRequest request, Locale locale, Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalized = normalizeRequestUri(request);
        if ("/mypage/profile".equals(normalized)) {
            return reactAppViewSupport.render(model, "mypage", isEn, false);
        }
        String routeId = ReactPageUrlMapper.resolveRouteIdForPath(request == null ? "" : request.getRequestURI());
        if ("emission_project_list".equals(routeId)) {
            return reactAppViewSupport.render(model, "emission-project-list", isEn, false);
        }
        if ("emission_home_validate".equals(routeId)) {
            return reactAppViewSupport.render(model, "emission-home-validate", isEn, false);
        }
        if (!routeId.isEmpty()) {
            return reactAppViewSupport.render(model, routeId.replace('_', '-'), isEn, false);
        }
        MenuInfoDTO menu = loadMenu(normalized);
        if (menu == null) {
            return isEn ? "redirect:/en/home" : "redirect:/home";
        }
        return reactAppViewSupport.render(model, "home-menu-placeholder", isEn, false);
    }

    @GetMapping("/api/home/menu-placeholder")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> homeMenuPlaceholderApi(
            @RequestParam(value = "requestPath", required = false) String requestPath,
            HttpServletRequest request,
            Locale locale) {
        return ResponseEntity.ok(buildPlaceholderPayload(requestPath, request, locale, false));
    }

    @GetMapping("/api/en/home/menu-placeholder")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> homeMenuPlaceholderApiEn(
            @RequestParam(value = "requestPath", required = false) String requestPath,
            HttpServletRequest request,
            Locale locale) {
        return ResponseEntity.ok(buildPlaceholderPayload(requestPath, request, locale, true));
    }

    private MenuInfoDTO loadMenu(String normalizedUrl) {
        try {
            return menuInfoService.selectMenuDetailByUrl(normalizedUrl);
        } catch (Exception e) {
            return null;
        }
    }

    private Map<String, Object> buildPlaceholderPayload(
            String requestPath,
            HttpServletRequest request,
            Locale locale,
            boolean forceEn) {
        boolean isEn = forceEn || resolveEnglishFromRequestPath(requestPath, request, locale);
        String normalized = normalizeRequestPath(requestPath, request);
        MenuInfoDTO menu = loadMenu(normalized);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isLoggedIn", hasAccessToken(request));
        payload.put("isEn", isEn);
        payload.put("homeMenu", homeMenuService.getHomeMenu(isEn));
        if (menu != null) {
            payload.put("placeholderTitle", isEn ? fallbackLabel(menu.getCodeDc(), menu.getCodeNm()) : fallbackLabel(menu.getCodeNm(), menu.getCodeDc()));
            payload.put("placeholderTitleEn", fallbackLabel(menu.getCodeDc(), menu.getCodeNm()));
            payload.put("placeholderCode", safeString(menu.getCode()));
            payload.put("placeholderUrl", safeString(requestPath).isEmpty() ? (request == null ? "" : request.getRequestURI()) : safeString(requestPath));
            payload.put("placeholderIcon", safeString(menu.getMenuIcon()).isEmpty() ? "web" : safeString(menu.getMenuIcon()));
        }
        return payload;
    }

    private boolean resolveEnglishFromRequestPath(String requestPath, HttpServletRequest request, Locale locale) {
        String value = safeString(requestPath);
        if (!value.isEmpty()) {
            return value.startsWith("/en/");
        }
        return isEnglishRequest(request, locale);
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

    private String normalizeRequestPath(String requestPath, HttpServletRequest request) {
        String value = safeString(requestPath);
        if (value.isEmpty()) {
            return normalizeRequestUri(request);
        }
        int queryIndex = value.indexOf('?');
        if (queryIndex >= 0) {
            value = value.substring(0, queryIndex);
        }
        return value.startsWith("/en/") ? value.substring(3) : value;
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
