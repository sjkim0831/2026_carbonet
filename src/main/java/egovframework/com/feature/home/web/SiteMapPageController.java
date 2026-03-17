package egovframework.com.feature.home.web;

import egovframework.com.common.menu.service.SiteMapService;
import egovframework.com.feature.home.service.HomeMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.LinkedHashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class SiteMapPageController {

    private final SiteMapService siteMapService;
    private final HomeMenuService homeMenuService;
    private final ReactAppViewSupport reactAppViewSupport;

    @RequestMapping(value = {"/sitemap"}, method = {RequestMethod.GET, RequestMethod.POST})
    public String sitemap(@CookieValue(value = "accessToken", required = false) String accessToken, Model model) {
        return reactAppViewSupport.render(model, "sitemap", false, false);
    }

    @RequestMapping(value = {"/en/sitemap"}, method = {RequestMethod.GET, RequestMethod.POST})
    public String sitemapEn(@CookieValue(value = "accessToken", required = false) String accessToken, Model model) {
        return reactAppViewSupport.render(model, "sitemap", true, false);
    }

    @GetMapping("/api/sitemap")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> sitemapApi(
            @CookieValue(value = "accessToken", required = false) String accessToken) {
        return ResponseEntity.ok(buildPayload(false, accessToken != null));
    }

    @GetMapping("/api/en/sitemap")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> sitemapApiEn(
            @CookieValue(value = "accessToken", required = false) String accessToken) {
        return ResponseEntity.ok(buildPayload(true, accessToken != null));
    }

    private Map<String, Object> buildPayload(boolean isEn, boolean isLoggedIn) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isLoggedIn", isLoggedIn);
        payload.put("isEn", isEn);
        payload.put("homeMenu", homeMenuService.getHomeMenu(isEn));
        payload.put("siteMapSections", siteMapService.getUserSiteMap(isEn));
        return payload;
    }
}
