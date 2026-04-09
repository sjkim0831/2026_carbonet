package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.dto.response.AdminMenuDomainDTO;
import egovframework.com.platform.read.AdminMenuTreeReadPort;
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

    private final AdminReactRouteSupport adminReactRouteSupport;
    private final AdminMenuTreeReadPort adminMenuTreeReadPort;

    @RequestMapping(value = "/menu-data", method = RequestMethod.GET)
    @ResponseBody
    public Map<String, AdminMenuDomainDTO> adminMenuData(HttpServletRequest request, Locale locale) {
        return adminMenuTreeReadPort.buildAdminMenuTree(adminReactRouteSupport.isEnglishRequest(request, locale), request);
    }
}
