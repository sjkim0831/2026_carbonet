package egovframework.com.feature.home.web;

import egovframework.com.common.menu.service.SiteMapService;
import egovframework.com.feature.home.service.HomeMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequiredArgsConstructor
public class SiteMapPageController {

    private final SiteMapService siteMapService;
    private final HomeMenuService homeMenuService;

    @RequestMapping(value = {"/sitemap"}, method = {RequestMethod.GET, RequestMethod.POST})
    public String sitemap(@CookieValue(value = "accessToken", required = false) String accessToken, Model model) {
        model.addAttribute("isLoggedIn", accessToken != null);
        model.addAttribute("homeMenu", homeMenuService.getHomeMenu(false));
        model.addAttribute("siteMapSections", siteMapService.getUserSiteMap(false));
        return "egovframework/com/home/sitemap";
    }

    @RequestMapping(value = {"/en/sitemap"}, method = {RequestMethod.GET, RequestMethod.POST})
    public String sitemapEn(@CookieValue(value = "accessToken", required = false) String accessToken, Model model) {
        model.addAttribute("isLoggedIn", accessToken != null);
        model.addAttribute("homeMenu", homeMenuService.getHomeMenu(true));
        model.addAttribute("siteMapSections", siteMapService.getUserSiteMap(true));
        return "egovframework/com/home/sitemap_en";
    }
}
