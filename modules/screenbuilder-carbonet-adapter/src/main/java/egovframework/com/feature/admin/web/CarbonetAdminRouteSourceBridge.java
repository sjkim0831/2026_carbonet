package egovframework.com.feature.admin.web;

import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.util.Locale;

@Component
public class CarbonetAdminRouteSourceBridge implements CarbonetAdminRouteSource {

    private final AdminReactRouteSupport adminReactRouteSupport;

    public CarbonetAdminRouteSourceBridge(AdminReactRouteSupport adminReactRouteSupport) {
        this.adminReactRouteSupport = adminReactRouteSupport;
    }

    @Override
    public String forwardAdminRoute(HttpServletRequest request, Locale locale, String route) {
        return adminReactRouteSupport.forwardAdminRoute(request, locale, route);
    }
}
