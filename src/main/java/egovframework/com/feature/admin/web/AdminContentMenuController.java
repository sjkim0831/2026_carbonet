package egovframework.com.feature.admin.web;

import egovframework.com.feature.home.web.ReactAppViewSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletRequest;
import java.util.Locale;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AdminContentMenuController {

    private final ObjectProvider<ReactAppViewSupport> reactAppViewSupportProvider;
    private final AdminSystemCodeController adminSystemCodeController;

    @RequestMapping(value = {"/admin/system/menu"}, method = {RequestMethod.GET, RequestMethod.POST})
    public String systemMenuManagement(HttpServletRequest request, Model model) {
        return reactAppViewSupportProvider.getObject().render(model, "menu-management", false, true);
    }

    @RequestMapping(value = {"/en/admin/system/menu"}, method = {RequestMethod.GET, RequestMethod.POST})
    public String systemMenuManagementEn(HttpServletRequest request, Model model) {
        return reactAppViewSupportProvider.getObject().render(model, "menu-management", true, true);
    }

    @GetMapping("/admin/system/menu/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> systemMenuManagementPageApi(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "saved", required = false) String saved,
            HttpServletRequest request,
            Locale locale) {
        return adminSystemCodeController.menuManagementPageApi(menuType, saved, request, locale);
    }

    @GetMapping("/en/admin/system/menu/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> systemMenuManagementPageApiEn(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "saved", required = false) String saved,
            HttpServletRequest request,
            Locale locale) {
        return adminSystemCodeController.menuManagementPageApi(menuType, saved, request, locale);
    }

    @PostMapping("/admin/system/menu/order")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveMenuManagementOrder(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "orderPayload", required = false) String orderPayload,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return adminSystemCodeController.saveMenuManagementOrder(menuType, orderPayload, request, locale, model);
    }

    @PostMapping("/en/admin/system/menu/order")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveMenuManagementOrderEn(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "orderPayload", required = false) String orderPayload,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return adminSystemCodeController.saveMenuManagementOrder(menuType, orderPayload, request, locale, model);
    }

    @PostMapping("/admin/system/menu/create-page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createMenuManagedPageApi(
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

    @PostMapping("/en/admin/system/menu/create-page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createMenuManagedPageApiEn(
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
}
