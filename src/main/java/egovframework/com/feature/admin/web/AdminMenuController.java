package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.dto.response.AdminMenuDomainDTO;
import egovframework.com.feature.admin.service.AdminMenuTreeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.Locale;
import java.util.Map;

@Controller
@RequestMapping({"/admin/system", "/en/admin/system"})
@RequiredArgsConstructor
public class AdminMenuController {

    private final AdminMenuTreeService adminMenuTreeService;

    @RequestMapping(value = "/menu-data", method = RequestMethod.GET)
    @ResponseBody
    public Map<String, AdminMenuDomainDTO> adminMenuData(HttpServletRequest request, Locale locale) {
        return adminMenuTreeService.buildAdminMenuTree(isEnglishRequest(request, locale), request);
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
}
