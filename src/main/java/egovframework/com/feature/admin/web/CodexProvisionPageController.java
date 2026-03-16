package egovframework.com.feature.admin.web;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.ui.ExtendedModelMap;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@Controller
@RequestMapping({"/admin/system", "/en/admin/system"})
@RequiredArgsConstructor
public class CodexProvisionPageController {

    @GetMapping({"/codex-request", "/codex-provision"})
    public String codexProvisionPage(HttpServletRequest request, Locale locale, Model model) {
        return redirectReactMigration(request, locale, "codex-request");
    }

    @GetMapping({"/codex-request/page-data", "/codex-provision/page-data"})
    @ResponseBody
    public ResponseEntity<Map<String, Object>> codexProvisionPageData(HttpServletRequest request, Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        primeCsrfToken(request);
        ExtendedModelMap model = new ExtendedModelMap();
        model.addAttribute("codexEnabled", true);
        model.addAttribute("codexSamplePayload", samplePayload());
        model.addAttribute("isEn", isEn);
        return ResponseEntity.ok(new LinkedHashMap<>(model));
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

    private String samplePayload() {
        return "{\n"
                + "  \"requestId\": \"REQ-20260313-001\",\n"
                + "  \"actorId\": \"CODEX\",\n"
                + "  \"targetApiPath\": \"/admin/system/codex-request\",\n"
                + "  \"companyId\": \"INSTT_0001\",\n"
                + "  \"menuType\": \"ADMIN\",\n"
                + "  \"reloadSecurityMetadata\": true,\n"
                + "  \"page\": {\n"
                + "    \"domainCode\": \"A101\",\n"
                + "    \"domainName\": \"시스템관리\",\n"
                + "    \"domainNameEn\": \"System Management\",\n"
                + "    \"groupCode\": \"A10102\",\n"
                + "    \"groupName\": \"Codex 관리\",\n"
                + "    \"groupNameEn\": \"Codex Management\",\n"
                + "    \"code\": \"A1010201\",\n"
                + "    \"codeNm\": \"Codex 요청 관리\",\n"
                + "    \"codeDc\": \"Codex Request Management\",\n"
                + "    \"menuUrl\": \"/admin/system/codex-request\",\n"
                + "    \"menuIcon\": \"smart_toy\",\n"
                + "    \"useAt\": \"Y\"\n"
                + "  },\n"
                + "  \"features\": [\n"
                + "    {\n"
                + "      \"menuCode\": \"A1010201\",\n"
                + "      \"featureCode\": \"A1010201_VIEW\",\n"
                + "      \"featureNm\": \"Codex 요청 조회\",\n"
                + "      \"featureNmEn\": \"View Codex Requests\",\n"
                + "      \"featureDc\": \"Codex request list view\",\n"
                + "      \"useAt\": \"Y\"\n"
                + "    }\n"
                + "  ]\n"
                + "}";
    }

    private void primeCsrfToken(HttpServletRequest request) {
        if (request == null) {
            return;
        }
        Object token = request.getAttribute("_csrf");
        if (token instanceof CsrfToken) {
            ((CsrfToken) token).getToken();
        }
    }

    private String redirectReactMigration(HttpServletRequest request, Locale locale, String route) {
        StringBuilder builder = new StringBuilder("forward:");
        builder.append(isEnglishRequest(request, locale) ? "/en/admin/app?route=" : "/admin/app?route=");
        builder.append(route);
        if (request != null) {
            String query = request.getQueryString();
            if (query != null && !query.isBlank()) {
                builder.append("&").append(query);
            }
        }
        return builder.toString();
    }
}
