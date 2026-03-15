package egovframework.com.feature.admin.web;

import egovframework.com.common.menu.service.SiteMapService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.servlet.http.HttpServletRequest;

@Controller
@RequiredArgsConstructor
public class AdminSiteMapController {

    private final SiteMapService siteMapService;

    @RequestMapping(value = {"/admin/content/sitemap"}, method = {RequestMethod.GET, RequestMethod.POST})
    public String sitemap(HttpServletRequest request, Model model) {
        model.addAttribute("siteMapSections", siteMapService.getAdminSiteMap(false, request));
        return "egovframework/com/admin/sitemap";
    }

    @RequestMapping(value = {"/en/admin/content/sitemap"}, method = {RequestMethod.GET, RequestMethod.POST})
    public String sitemapEn(HttpServletRequest request, Model model) {
        model.addAttribute("siteMapSections", siteMapService.getAdminSiteMap(true, request));
        return "egovframework/com/admin/sitemap_en";
    }
}
