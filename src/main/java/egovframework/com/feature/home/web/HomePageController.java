package egovframework.com.feature.home.web;

import egovframework.com.feature.home.service.HomeMenuService;
import egovframework.com.feature.home.service.HomeMypageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.http.ResponseEntity;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Locale;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class HomePageController {

    private final HomeMenuService homeMenuService;
    private final HomeMypageService homeMypageService;
    private final ReactAppViewSupport reactAppViewSupport;

    @RequestMapping(value = { "/" }, method = { RequestMethod.GET, RequestMethod.POST })
    public String root() {
        return "redirect:/home";
    }

    @RequestMapping(value = { "/home" }, method = { RequestMethod.GET, RequestMethod.POST })
    public String index(HttpServletRequest request, Model model) {
        return reactAppViewSupport.render(model, "home", false, false);
    }

    @RequestMapping(value = { "/ko/home" }, method = { RequestMethod.GET, RequestMethod.POST })
    public String legacyKoHome() {
        return "redirect:/home";
    }

    @RequestMapping(value = { "/home/en" }, method = { RequestMethod.GET, RequestMethod.POST })
    public String legacyHomeEn() {
        return "redirect:/en/home";
    }

    @RequestMapping(value = { "/en/home" }, method = { RequestMethod.GET, RequestMethod.POST })
    public String indexEn(HttpServletRequest request, Model model) {
        return reactAppViewSupport.render(model, "home", true, false);
    }

    @GetMapping("/api/home")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> homeApi(
            @CookieValue(value = "accessToken", required = false) String accessToken) {
        return ResponseEntity.ok(Map.of(
                "isLoggedIn", accessToken != null,
                "isEn", false,
                "homeMenu", homeMenuService.getHomeMenu(false)));
    }

    @GetMapping("/api/en/home")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> homeApiEn(
            @CookieValue(value = "accessToken", required = false) String accessToken) {
        return ResponseEntity.ok(Map.of(
                "isLoggedIn", accessToken != null,
                "isEn", true,
                "homeMenu", homeMenuService.getHomeMenu(true)));
    }

    @RequestMapping(value = { "/mypage" }, method = { RequestMethod.GET, RequestMethod.POST })
    public String mypage(HttpServletRequest request, Model model) {
        return reactAppViewSupport.render(model, "mypage", false, false);
    }

    @RequestMapping(value = { "/ko/mypage" }, method = { RequestMethod.GET, RequestMethod.POST })
    public String legacyKoMypage() {
        return "redirect:/mypage";
    }

    @RequestMapping(value = { "/mypage/index", "/ko/mypage/index" }, method = { RequestMethod.GET, RequestMethod.POST })
    public String legacyMypageIndex() {
        return "redirect:/mypage";
    }

    @RequestMapping(value = { "/mypage/en" }, method = { RequestMethod.GET, RequestMethod.POST })
    public String legacyMypageEn() {
        return "redirect:/en/mypage";
    }

    @RequestMapping(value = { "/en/mypage/index", "/mypage/index/en" }, method = { RequestMethod.GET, RequestMethod.POST })
    public String legacyMypageIndexEn() {
        return "redirect:/en/mypage";
    }

    @RequestMapping(value = { "/en/mypage" }, method = { RequestMethod.GET, RequestMethod.POST })
    public String mypageEn(HttpServletRequest request, Model model) {
        return reactAppViewSupport.render(model, "mypage", true, false);
    }

    @GetMapping("/api/mypage/context")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> mypageContextApi(HttpServletRequest request) {
        Map<String, Object> payload = homeMypageService.buildMypageContext(false, request);
        boolean authenticated = Boolean.TRUE.equals(payload.get("authenticated"));
        return authenticated ? ResponseEntity.ok(payload) : ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(payload);
    }

    @GetMapping("/api/en/mypage/context")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> mypageContextApiEn(HttpServletRequest request) {
        Map<String, Object> payload = homeMypageService.buildMypageContext(true, request);
        boolean authenticated = Boolean.TRUE.equals(payload.get("authenticated"));
        return authenticated ? ResponseEntity.ok(payload) : ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(payload);
    }

    @GetMapping("/api/mypage")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> mypageApi(HttpServletRequest request) {
        Map<String, Object> payload = homeMypageService.buildMypagePayload(false, request);
        boolean authenticated = Boolean.TRUE.equals(payload.get("authenticated"));
        return authenticated ? ResponseEntity.ok(payload) : ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(payload);
    }

    @GetMapping("/api/en/mypage")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> mypageApiEn(HttpServletRequest request) {
        Map<String, Object> payload = homeMypageService.buildMypagePayload(true, request);
        boolean authenticated = Boolean.TRUE.equals(payload.get("authenticated"));
        return authenticated ? ResponseEntity.ok(payload) : ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(payload);
    }

    @GetMapping("/api/mypage/section/{section}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> mypageSectionApi(@PathVariable("section") String section,
            HttpServletRequest request) {
        Map<String, Object> payload = homeMypageService.buildMypageSectionPayload(false, section, request);
        boolean authenticated = Boolean.TRUE.equals(payload.get("authenticated"));
        return authenticated ? ResponseEntity.ok(payload) : ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(payload);
    }

    @GetMapping("/api/en/mypage/section/{section}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> mypageSectionApiEn(@PathVariable("section") String section,
            HttpServletRequest request) {
        Map<String, Object> payload = homeMypageService.buildMypageSectionPayload(true, section, request);
        boolean authenticated = Boolean.TRUE.equals(payload.get("authenticated"));
        return authenticated ? ResponseEntity.ok(payload) : ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(payload);
    }

    @PostMapping("/api/mypage/profile")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateMypageProfile(
            @RequestParam(value = "zip", required = false) String zip,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "detailAddress", required = false) String detailAddress,
            HttpServletRequest request) {
        Map<String, Object> payload = homeMypageService.updateProfile(false, zip, address, detailAddress, request);
        boolean authenticated = Boolean.TRUE.equals(payload.get("authenticated"));
        return authenticated ? ResponseEntity.ok(payload) : ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(payload);
    }

    @PostMapping("/api/en/mypage/profile")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateMypageProfileEn(
            @RequestParam(value = "zip", required = false) String zip,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "detailAddress", required = false) String detailAddress,
            HttpServletRequest request) {
        Map<String, Object> payload = homeMypageService.updateProfile(true, zip, address, detailAddress, request);
        boolean authenticated = Boolean.TRUE.equals(payload.get("authenticated"));
        return authenticated ? ResponseEntity.ok(payload) : ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(payload);
    }

    @PostMapping("/api/mypage/company")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateMypageCompany(
            @RequestParam(value = "companyName", required = false) String companyName,
            @RequestParam(value = "representativeName", required = false) String representativeName,
            @RequestParam(value = "zip", required = false) String zip,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "detailAddress", required = false) String detailAddress,
            HttpServletRequest request) {
        Map<String, Object> payload = homeMypageService.updateCompany(false, companyName, representativeName, zip,
                address, detailAddress, request);
        boolean authenticated = Boolean.TRUE.equals(payload.get("authenticated"));
        return authenticated ? ResponseEntity.ok(payload) : ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(payload);
    }

    @PostMapping("/api/en/mypage/company")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateMypageCompanyEn(
            @RequestParam(value = "companyName", required = false) String companyName,
            @RequestParam(value = "representativeName", required = false) String representativeName,
            @RequestParam(value = "zip", required = false) String zip,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "detailAddress", required = false) String detailAddress,
            HttpServletRequest request) {
        Map<String, Object> payload = homeMypageService.updateCompany(true, companyName, representativeName, zip,
                address, detailAddress, request);
        boolean authenticated = Boolean.TRUE.equals(payload.get("authenticated"));
        return authenticated ? ResponseEntity.ok(payload) : ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(payload);
    }

    @PostMapping("/api/mypage/marketing")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateMypageMarketing(
            @RequestParam(value = "marketingYn", required = false) String marketingYn,
            HttpServletRequest request) {
        Map<String, Object> payload = homeMypageService.updateMarketingPreference(false, marketingYn, request);
        boolean authenticated = Boolean.TRUE.equals(payload.get("authenticated"));
        return authenticated ? ResponseEntity.ok(payload) : ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(payload);
    }

    @PostMapping("/api/en/mypage/marketing")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateMypageMarketingEn(
            @RequestParam(value = "marketingYn", required = false) String marketingYn,
            HttpServletRequest request) {
        Map<String, Object> payload = homeMypageService.updateMarketingPreference(true, marketingYn, request);
        boolean authenticated = Boolean.TRUE.equals(payload.get("authenticated"));
        return authenticated ? ResponseEntity.ok(payload) : ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(payload);
    }

    @PostMapping("/api/mypage/staff")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateMypageStaff(
            @RequestParam(value = "staffName", required = false) String staffName,
            @RequestParam(value = "deptNm", required = false) String deptNm,
            @RequestParam(value = "areaNo", required = false) String areaNo,
            @RequestParam(value = "middleTelno", required = false) String middleTelno,
            @RequestParam(value = "endTelno", required = false) String endTelno,
            HttpServletRequest request) {
        Map<String, Object> payload = homeMypageService.updateStaffContact(false, staffName, deptNm, areaNo,
                middleTelno, endTelno, request);
        boolean authenticated = Boolean.TRUE.equals(payload.get("authenticated"));
        return authenticated ? ResponseEntity.ok(payload)
                : ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(payload);
    }

    @PostMapping("/api/en/mypage/staff")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateMypageStaffEn(
            @RequestParam(value = "staffName", required = false) String staffName,
            @RequestParam(value = "deptNm", required = false) String deptNm,
            @RequestParam(value = "areaNo", required = false) String areaNo,
            @RequestParam(value = "middleTelno", required = false) String middleTelno,
            @RequestParam(value = "endTelno", required = false) String endTelno,
            HttpServletRequest request) {
        Map<String, Object> payload = homeMypageService.updateStaffContact(true, staffName, deptNm, areaNo,
                middleTelno, endTelno, request);
        boolean authenticated = Boolean.TRUE.equals(payload.get("authenticated"));
        return authenticated ? ResponseEntity.ok(payload)
                : ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(payload);
    }

    @PostMapping("/api/mypage/email")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateMypageEmail(
            @RequestParam(value = "email", required = false) String email,
            HttpServletRequest request) {
        Map<String, Object> payload = homeMypageService.updateEmailAddress(false, email, request);
        boolean authenticated = Boolean.TRUE.equals(payload.get("authenticated"));
        return authenticated ? ResponseEntity.ok(payload) : ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(payload);
    }

    @PostMapping("/api/en/mypage/email")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateMypageEmailEn(
            @RequestParam(value = "email", required = false) String email,
            HttpServletRequest request) {
        Map<String, Object> payload = homeMypageService.updateEmailAddress(true, email, request);
        boolean authenticated = Boolean.TRUE.equals(payload.get("authenticated"));
        return authenticated ? ResponseEntity.ok(payload) : ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(payload);
    }

    @PostMapping("/api/mypage/password")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateMypagePassword(
            @RequestParam(value = "currentPassword", required = false) String currentPassword,
            @RequestParam(value = "newPassword", required = false) String newPassword,
            HttpServletRequest request) {
        Map<String, Object> payload = homeMypageService.updatePassword(false, currentPassword, newPassword, request);
        boolean authenticated = Boolean.TRUE.equals(payload.get("authenticated"));
        return authenticated ? ResponseEntity.ok(payload) : ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(payload);
    }

    @PostMapping("/api/en/mypage/password")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateMypagePasswordEn(
            @RequestParam(value = "currentPassword", required = false) String currentPassword,
            @RequestParam(value = "newPassword", required = false) String newPassword,
            HttpServletRequest request) {
        Map<String, Object> payload = homeMypageService.updatePassword(true, currentPassword, newPassword, request);
        boolean authenticated = Boolean.TRUE.equals(payload.get("authenticated"));
        return authenticated ? ResponseEntity.ok(payload) : ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(payload);
    }
}
