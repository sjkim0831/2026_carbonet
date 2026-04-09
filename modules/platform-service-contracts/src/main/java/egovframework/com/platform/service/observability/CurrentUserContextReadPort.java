package egovframework.com.platform.service.observability;

import javax.servlet.http.HttpServletRequest;

public interface CurrentUserContextReadPort {

    CurrentUserContextSnapshot resolve(HttpServletRequest request);
}
