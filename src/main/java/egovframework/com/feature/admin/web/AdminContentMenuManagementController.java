package egovframework.com.feature.admin.web;

import egovframework.com.feature.home.web.ReactAppViewSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AdminContentMenuManagementController {

    private static final String FAQ_BRANCH_CODE = "A00403";

    private final ObjectProvider<ReactAppViewSupport> reactAppViewSupportProvider;
    private final AdminSystemCodeController adminSystemCodeController;

    @RequestMapping(value = {"/admin/content/menu"}, method = {RequestMethod.GET, RequestMethod.POST})
    public String menuManagement(HttpServletRequest request, Model model) {
        return reactAppViewSupportProvider.getObject().render(model, "faq-menu-management", false, true);
    }

    @RequestMapping(value = {"/en/admin/content/menu"}, method = {RequestMethod.GET, RequestMethod.POST})
    public String menuManagementEn(HttpServletRequest request, Model model) {
        return reactAppViewSupportProvider.getObject().render(model, "faq-menu-management", true, true);
    }

    @GetMapping("/admin/content/menu/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> contentMenuManagementPageApi(
            @RequestParam(value = "saved", required = false) String saved,
            HttpServletRequest request,
            Locale locale) {
        return filterContentMenuPayload(adminSystemCodeController.menuManagementPageApi("ADMIN", saved, request, locale));
    }

    @GetMapping("/en/admin/content/menu/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> contentMenuManagementPageApiEn(
            @RequestParam(value = "saved", required = false) String saved,
            HttpServletRequest request,
            Locale locale) {
        return filterContentMenuPayload(adminSystemCodeController.menuManagementPageApi("ADMIN", saved, request, locale));
    }

    @PostMapping("/admin/content/menu/order")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveContentMenuManagementOrder(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "orderPayload", required = false) String orderPayload,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return adminSystemCodeController.saveMenuManagementOrder(menuType, orderPayload, request, locale, model);
    }

    @PostMapping("/en/admin/content/menu/order")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveContentMenuManagementOrderEn(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "orderPayload", required = false) String orderPayload,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return adminSystemCodeController.saveMenuManagementOrder(menuType, orderPayload, request, locale, model);
    }

    @PostMapping("/admin/content/menu/create-page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createContentMenuManagedPageApi(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "parentCode", required = false) String parentCode,
            @RequestParam(value = "codeNm", required = false) String codeNm,
            @RequestParam(value = "codeDc", required = false) String codeDc,
            @RequestParam(value = "menuUrl", required = false) String menuUrl,
            @RequestParam(value = "menuIcon", required = false) String menuIcon,
            @RequestParam(value = "useAt", required = false) String useAt,
            HttpServletRequest request,
            Locale locale) {
        return adminSystemCodeController.createMenuManagedPageApi(
                menuType,
                parentCode,
                codeNm,
                codeDc,
                menuUrl,
                menuIcon,
                useAt,
                request,
                locale);
    }

    @PostMapping("/en/admin/content/menu/create-page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createContentMenuManagedPageApiEn(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "parentCode", required = false) String parentCode,
            @RequestParam(value = "codeNm", required = false) String codeNm,
            @RequestParam(value = "codeDc", required = false) String codeDc,
            @RequestParam(value = "menuUrl", required = false) String menuUrl,
            @RequestParam(value = "menuIcon", required = false) String menuIcon,
            @RequestParam(value = "useAt", required = false) String useAt,
            HttpServletRequest request,
            Locale locale) {
        return adminSystemCodeController.createMenuManagedPageApi(
                menuType,
                parentCode,
                codeNm,
                codeDc,
                menuUrl,
                menuIcon,
                useAt,
                request,
                locale);
    }

    private ResponseEntity<Map<String, Object>> filterContentMenuPayload(ResponseEntity<Map<String, Object>> responseEntity) {
        Map<String, Object> body = responseEntity.getBody();
        if (body == null) {
            return responseEntity;
        }

        Map<String, Object> filtered = new LinkedHashMap<>(body);
        filtered.put("menuRows", filterMenuRows(body.get("menuRows")));
        filtered.put("groupMenuOptions", filterGroupMenuOptions(body.get("groupMenuOptions")));
        filtered.put("menuType", "CONTENT");
        return ResponseEntity.status(responseEntity.getStatusCode()).body(filtered);
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> filterMenuRows(Object menuRows) {
        List<Map<String, Object>> filtered = new ArrayList<>();
        if (!(menuRows instanceof List<?>)) {
            return filtered;
        }
        List<?> rows = (List<?>) menuRows;
        for (Object row : rows) {
            if (!(row instanceof Map<?, ?>)) {
                continue;
            }
            Map<?, ?> rawRow = (Map<?, ?>) row;
            Object code = rawRow.get("code");
            String normalizedCode = code == null ? "" : String.valueOf(code).trim().toUpperCase(Locale.ROOT);
            if (normalizedCode.startsWith(FAQ_BRANCH_CODE)) {
                filtered.add((Map<String, Object>) rawRow);
            }
        }
        return filtered;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> filterGroupMenuOptions(Object options) {
        List<Map<String, Object>> filtered = new ArrayList<>();
        if (!(options instanceof List<?>)) {
            return filtered;
        }
        List<?> rows = (List<?>) options;
        for (Object option : rows) {
            if (!(option instanceof Map<?, ?>)) {
                continue;
            }
            Map<?, ?> rawOption = (Map<?, ?>) option;
            Object value = rawOption.get("value");
            String normalizedValue = value == null ? "" : String.valueOf(value).trim().toUpperCase(Locale.ROOT);
            if (normalizedValue.startsWith(FAQ_BRANCH_CODE)) {
                filtered.add((Map<String, Object>) rawOption);
            }
        }
        return filtered;
    }
}
