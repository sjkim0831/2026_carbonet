package egovframework.com.feature.admin.web;

import egovframework.com.common.menu.service.SiteMapService;
import egovframework.com.feature.home.web.ReactAppViewSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AdminSiteMapController {

    private final SiteMapService siteMapService;
    private final ReactAppViewSupport reactAppViewSupport;

    @RequestMapping(value = {"/admin/content/sitemap"}, method = {RequestMethod.GET, RequestMethod.POST})
    public String sitemap(HttpServletRequest request, Model model) {
        return reactAppViewSupport.render(model, "admin-sitemap", false, true);
    }

    @RequestMapping(value = {"/en/admin/content/sitemap"}, method = {RequestMethod.GET, RequestMethod.POST})
    public String sitemapEn(HttpServletRequest request, Model model) {
        return reactAppViewSupport.render(model, "admin-sitemap", true, true);
    }

    @GetMapping("/admin/api/admin/content/sitemap")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> sitemapApi(HttpServletRequest request) {
        return ResponseEntity.ok(buildPayload(false, request));
    }

    @GetMapping("/en/admin/api/admin/content/sitemap")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> sitemapApiEn(HttpServletRequest request) {
        return ResponseEntity.ok(buildPayload(true, request));
    }

    private Map<String, Object> buildPayload(boolean isEn, HttpServletRequest request) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isEn", isEn);
        payload.put("siteMapSections", siteMapService.getAdminSiteMap(isEn, request));
        return payload;
    }
}
