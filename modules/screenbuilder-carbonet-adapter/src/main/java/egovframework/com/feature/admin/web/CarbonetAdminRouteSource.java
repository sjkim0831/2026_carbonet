package egovframework.com.feature.admin.web;

import javax.servlet.http.HttpServletRequest;
import java.util.Locale;

public interface CarbonetAdminRouteSource {

    String forwardAdminRoute(HttpServletRequest request, Locale locale, String route);
}
