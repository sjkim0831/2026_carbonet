package egovframework.com.framework.builder.web;

import egovframework.com.framework.builder.model.FrameworkBuilderContractVO;
import egovframework.com.framework.builder.service.FrameworkBuilderContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.Locale;

@Controller
@RequestMapping({"/admin", "/en/admin"})
@RequiredArgsConstructor
public class FrameworkBuilderContractController {

    private final FrameworkBuilderContractService frameworkBuilderContractService;

    @GetMapping("/api/admin/framework/builder-contract")
    @ResponseBody
    public ResponseEntity<FrameworkBuilderContractVO> getFrameworkBuilderContract(HttpServletRequest request,
                                                                                  Locale locale) throws Exception {
        return ResponseEntity.ok(frameworkBuilderContractService.getBuilderContract(isEnglishRequest(request, locale)));
    }

    private boolean isEnglishRequest(HttpServletRequest request, Locale locale) {
        String requestUri = request == null ? "" : safe(request.getRequestURI());
        if (requestUri.startsWith("/en/")) {
            return true;
        }
        return locale != null && "en".equalsIgnoreCase(locale.getLanguage());
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }
}

