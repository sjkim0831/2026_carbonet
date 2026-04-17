package egovframework.com.common.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller to forward all non-API and non-static resource requests to the React SPA index.html.
 * This allows browser refreshes on React routes to work correctly.
 */
@Controller
public class SpaForwardingController {

    @RequestMapping(value = {
            "/",
            "/admin/**",
            "/en/admin/**",
            "/app/**",
            "/en/app/**"
    })
    public String forward() {
        return "forward:/static/react-app/index.html";
    }
}
