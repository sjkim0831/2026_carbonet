package egovframework.com.common.interceptor;

import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class ReactShellNoCacheInterceptor implements HandlerInterceptor {

    private static final String SHELL_VIEW_KO = "egovframework/com/home/react_migration_shell";
    private static final String SHELL_VIEW_EN = "egovframework/com/home/react_migration_shell_en";

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
            @Nullable ModelAndView modelAndView) {
        if (modelAndView == null || !"GET".equalsIgnoreCase(request.getMethod())) {
            return;
        }

        String viewName = modelAndView.getViewName();
        if (!SHELL_VIEW_KO.equals(viewName) && !SHELL_VIEW_EN.equals(viewName)) {
            return;
        }

        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);
    }
}
