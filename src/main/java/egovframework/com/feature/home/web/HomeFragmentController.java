package egovframework.com.feature.home.web;

import egovframework.com.feature.home.service.HomeMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Controller
@RequiredArgsConstructor
public class HomeFragmentController {

    private final TemplateEngine templateEngine;
    private final HomeMenuService homeMenuService;

    @GetMapping(value = { "/home/fragments/header" }, produces = "text/html; charset=UTF-8")
    @ResponseBody
    public String headerFragment(
            @CookieValue(value = "accessToken", required = false) String accessToken) {
        Context ctx = new Context();
        ctx.setVariable("isLoggedIn", accessToken != null);
        ctx.setVariable("homeMenu", homeMenuService.getHomeMenu(false));
        String full = templateEngine.process("egovframework/com/common/fragments/header", ctx);

        int start = full.indexOf("<div th:fragment");
        if (start == -1) {
            start = full.indexOf("<div ");
        }
        int end = full.lastIndexOf("</body>");
        if (start >= 0 && end > start) {
            return full.substring(start, end).trim();
        }
        return full;
    }

    @GetMapping(value = { "/home/fragments/footer" }, produces = "text/html; charset=UTF-8")
    @ResponseBody
    public String footerFragment() {
        Context ctx = new Context();
        String full = templateEngine.process("egovframework/com/common/fragments/footer", ctx);

        int start = full.indexOf("<footer");
        int end = full.lastIndexOf("</body>");
        if (start >= 0 && end > start) {
            return full.substring(start, end).trim();
        }
        return full;
    }
}
