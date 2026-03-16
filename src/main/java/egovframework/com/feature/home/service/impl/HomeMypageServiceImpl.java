package egovframework.com.feature.home.service.impl;

import egovframework.com.feature.auth.domain.entity.EntrprsMber;
import egovframework.com.feature.auth.domain.repository.EnterpriseMemberRepository;
import egovframework.com.feature.auth.domain.entity.PasswordResetHistory;
import egovframework.com.feature.auth.service.AuthService;
import egovframework.com.feature.auth.util.JwtTokenProvider;
import egovframework.com.feature.home.service.HomeMypageService;
import egovframework.com.feature.member.model.vo.InsttInfoVO;
import egovframework.com.feature.member.model.vo.InstitutionStatusVO;
import egovframework.com.feature.member.service.EnterpriseMemberService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;
import org.springframework.util.ObjectUtils;

import javax.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import org.apache.tomcat.util.codec.binary.Base64;

@Service("homeMypageService")
@RequiredArgsConstructor
public class HomeMypageServiceImpl implements HomeMypageService {

    private static final DateTimeFormatter DISPLAY_DATE_TIME = DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm:ss");

    private final JwtTokenProvider jwtProvider;
    private final EnterpriseMemberRepository enterpriseMemberRepository;
    private final EnterpriseMemberService entrprsManageService;
    private final AuthService authService;

    @Override
    public String resolveMypageView(boolean en, Model model, HttpServletRequest request) {
        String accessToken = jwtProvider.getCookie(request, "accessToken");
        if (ObjectUtils.isEmpty(accessToken)) {
            return en ? "redirect:/en/signin/loginView" : "redirect:/signin/loginView";
        }

        String userId = extractUserId(accessToken);
        if (ObjectUtils.isEmpty(userId)) {
            return en ? "redirect:/en/signin/loginView" : "redirect:/signin/loginView";
        }

        model.addAttribute("isLoggedIn", true);
        Optional<EntrprsMber> enterpriseOpt = enterpriseMemberRepository.findById(userId);
        if (enterpriseOpt.isEmpty()) {
            return en ? "egovframework/com/home/mypage_en" : "egovframework/com/home/mypage";
        }

        EntrprsMber enterprise = enterpriseOpt.get();
        String entrprsMberSttus = ObjectUtils.isEmpty(enterprise.getEntrprsMberStus())
                ? ""
                : enterprise.getEntrprsMberStus().trim();

        if ("X".equalsIgnoreCase(entrprsMberSttus)) {
            model.addAttribute("userId", userId);
            model.addAttribute("companyName", ObjectUtils.isEmpty(enterprise.getCmpnyNm()) ? "-" : enterprise.getCmpnyNm());
            model.addAttribute("memberStatus", entrprsMberSttus.toUpperCase(Locale.ROOT));
            return en ? "egovframework/com/home/mypage_blocked_en" : "egovframework/com/home/mypage_blocked";
        }

        if ("A".equalsIgnoreCase(entrprsMberSttus) || "R".equalsIgnoreCase(entrprsMberSttus)) {
            model.addAttribute("submittedAt", formatSubmittedAt(enterprise));
            model.addAttribute("userId", userId);
            model.addAttribute("companyName", ObjectUtils.isEmpty(enterprise.getCmpnyNm()) ? "-" : enterprise.getCmpnyNm());
            model.addAttribute("pendingStatus", entrprsMberSttus.toUpperCase(Locale.ROOT));
            populateInstitutionReviewInfo(model, enterprise);
            return en ? "egovframework/com/home/mypage_pending_en" : "egovframework/com/home/mypage_pending";
        }

        return en ? "egovframework/com/home/mypage_en" : "egovframework/com/home/mypage";
    }

    @Override
    public Map<String, Object> buildMypageContext(boolean en, HttpServletRequest request) {
        Map<String, Object> payload = new LinkedHashMap<>();
        String accessToken = jwtProvider.getCookie(request, "accessToken");
        if (ObjectUtils.isEmpty(accessToken)) {
            payload.put("authenticated", false);
            payload.put("redirectUrl", en ? "/en/signin/loginView" : "/signin/loginView");
            payload.put("insttId", "");
            return payload;
        }

        String userId = extractUserId(accessToken);
        if (ObjectUtils.isEmpty(userId)) {
            payload.put("authenticated", false);
            payload.put("redirectUrl", en ? "/en/signin/loginView" : "/signin/loginView");
            payload.put("insttId", "");
            return payload;
        }

        payload.put("authenticated", true);
        payload.put("userId", userId);
        payload.put("insttId", enterpriseMemberRepository.findById(userId)
                .map(EntrprsMber::getInsttId)
                .map(this::safeString)
                .orElse(""));
        return payload;
    }

    @Override
    public Map<String, Object> buildMypagePayload(boolean en, HttpServletRequest request) {
        Map<String, Object> payload = new LinkedHashMap<>();
        String accessToken = jwtProvider.getCookie(request, "accessToken");
        if (ObjectUtils.isEmpty(accessToken)) {
            payload.put("authenticated", false);
            payload.put("redirectUrl", en ? "/en/signin/loginView" : "/signin/loginView");
            payload.put("pageType", "redirect");
            return payload;
        }

        String userId = extractUserId(accessToken);
        if (ObjectUtils.isEmpty(userId)) {
            payload.put("authenticated", false);
            payload.put("redirectUrl", en ? "/en/signin/loginView" : "/signin/loginView");
            payload.put("pageType", "redirect");
            return payload;
        }

        payload.put("authenticated", true);
        payload.put("userId", userId);
        payload.put("isLoggedIn", true);

        Optional<EntrprsMber> enterpriseOpt = enterpriseMemberRepository.findById(userId);
        if (enterpriseOpt.isEmpty()) {
            payload.put("pageType", "default");
            return payload;
        }

        EntrprsMber enterprise = enterpriseOpt.get();
        payload.put("member", enterprise);
        String entrprsMberSttus = ObjectUtils.isEmpty(enterprise.getEntrprsMberStus())
                ? ""
                : enterprise.getEntrprsMberStus().trim();

        if ("X".equalsIgnoreCase(entrprsMberSttus)) {
            payload.put("pageType", "blocked");
            payload.put("companyName", ObjectUtils.isEmpty(enterprise.getCmpnyNm()) ? "-" : enterprise.getCmpnyNm());
            payload.put("memberStatus", entrprsMberSttus.toUpperCase(Locale.ROOT));
            return payload;
        }

        if ("A".equalsIgnoreCase(entrprsMberSttus) || "R".equalsIgnoreCase(entrprsMberSttus)) {
            payload.put("pageType", "pending");
            payload.put("submittedAt", formatSubmittedAt(enterprise));
            payload.put("companyName", ObjectUtils.isEmpty(enterprise.getCmpnyNm()) ? "-" : enterprise.getCmpnyNm());
            payload.put("pendingStatus", entrprsMberSttus.toUpperCase(Locale.ROOT));
            populateInstitutionReviewInfoMap(payload, enterprise);
            return payload;
        }

        payload.put("pageType", "default");
        return payload;
    }

    @Override
    public Map<String, Object> buildMypageSectionPayload(boolean en, String section, HttpServletRequest request) {
        String normalizedSection = normalizeSection(section);
        Map<String, Object> payload = buildMypagePayload(en, request);
        payload.put("section", normalizedSection);
        payload.put("sectionTitle", resolveSectionTitle(normalizedSection, en));
        payload.put("canViewSection", false);
        payload.put("canUseSection", false);
        payload.put("sectionReason", "");
        payload.put("items", Collections.emptyList());

        if (!Boolean.TRUE.equals(payload.get("authenticated"))) {
            payload.put("sectionReason", en ? "Please sign in first." : "로그인 후 이용 가능합니다.");
            return payload;
        }

        if (!"default".equals(payload.get("pageType"))) {
            payload.put("sectionReason", en
                    ? "This section is available after the company review is completed."
                    : "이 섹션은 회원사 승인이 완료된 뒤 이용할 수 있습니다.");
            return payload;
        }

        Object memberObject = payload.get("member");
        if (!(memberObject instanceof EntrprsMber)) {
            payload.put("sectionReason", en
                    ? "Member information could not be loaded."
                    : "회원 정보를 불러오지 못했습니다.");
            return payload;
        }

        EntrprsMber member = (EntrprsMber) memberObject;
        payload.put("canViewSection", true);
        payload.put("canUseSection", "profile".equals(normalizedSection)
                || "company".equals(normalizedSection)
                || "staff".equals(normalizedSection)
                || "marketing".equals(normalizedSection)
                || "email".equals(normalizedSection)
                || "password".equals(normalizedSection));
        payload.put("items", buildSectionItems(normalizedSection, member));

        if ("password".equals(normalizedSection)) {
            payload.put("passwordHistory", buildPasswordHistory(member.getEntrprsMberId()));
        }

        return payload;
    }

    @Override
    public Map<String, Object> updateProfile(boolean en, String zip, String address, String detailAddress,
            HttpServletRequest request) {
        Map<String, Object> payload = buildMypageSectionPayload(en, "profile", request);
        if (!Boolean.TRUE.equals(payload.get("authenticated"))) {
            payload.put("saved", false);
            return payload;
        }
        if (!Boolean.TRUE.equals(payload.get("canUseSection"))) {
            payload.put("saved", false);
            payload.put("message", payload.get("sectionReason"));
            return payload;
        }
        Object memberObject = payload.get("member");
        if (!(memberObject instanceof EntrprsMber)) {
            payload.put("saved", false);
            payload.put("message", en ? "Member information could not be loaded." : "회원 정보를 불러오지 못했습니다.");
            return payload;
        }
        EntrprsMber member = (EntrprsMber) memberObject;
        member.setZip(normalizeZip(zip));
        member.setAdres(safeString(address));
        member.setDetailAdres(safeString(detailAddress));
        enterpriseMemberRepository.save(member);
        payload.put("member", member);
        payload.put("items", buildSectionItems("profile", member));
        payload.put("saved", true);
        payload.put("message", en ? "Profile updated." : "개인정보를 저장했습니다.");
        return payload;
    }

    @Override
    public Map<String, Object> updateCompany(boolean en, String companyName, String representativeName, String zip,
            String address, String detailAddress, HttpServletRequest request) {
        Map<String, Object> payload = buildMypageSectionPayload(en, "company", request);
        if (!Boolean.TRUE.equals(payload.get("authenticated"))) {
            payload.put("saved", false);
            return payload;
        }
        if (!Boolean.TRUE.equals(payload.get("canUseSection"))) {
            payload.put("saved", false);
            payload.put("message", payload.get("sectionReason"));
            return payload;
        }
        Object memberObject = payload.get("member");
        if (!(memberObject instanceof EntrprsMber)) {
            payload.put("saved", false);
            payload.put("message", en ? "Member information could not be loaded." : "회원 정보를 불러오지 못했습니다.");
            return payload;
        }
        String normalizedCompanyName = safeString(companyName);
        String normalizedRepresentativeName = safeString(representativeName);
        if (normalizedCompanyName.isEmpty()) {
            payload.put("saved", false);
            payload.put("message", en ? "Please enter the company name." : "회사명을 입력해 주세요.");
            return payload;
        }
        EntrprsMber member = (EntrprsMber) memberObject;
        member.setCmpnyNm(normalizedCompanyName);
        member.setCxfc(normalizedRepresentativeName);
        member.setZip(normalizeZip(zip));
        member.setAdres(safeString(address));
        member.setDetailAdres(safeString(detailAddress));
        enterpriseMemberRepository.save(member);
        payload.put("member", member);
        payload.put("items", buildSectionItems("company", member));
        payload.put("saved", true);
        payload.put("message", en ? "Company information updated." : "회사정보를 저장했습니다.");
        return payload;
    }

    @Override
    public Map<String, Object> updateMarketingPreference(boolean en, String marketingYn, HttpServletRequest request) {
        Map<String, Object> payload = buildMypageSectionPayload(en, "marketing", request);
        if (!Boolean.TRUE.equals(payload.get("authenticated"))) {
            payload.put("saved", false);
            return payload;
        }
        if (!Boolean.TRUE.equals(payload.get("canUseSection"))) {
            payload.put("saved", false);
            payload.put("message", payload.get("sectionReason"));
            return payload;
        }
        Object memberObject = payload.get("member");
        if (!(memberObject instanceof EntrprsMber)) {
            payload.put("saved", false);
            payload.put("message", en ? "Member information could not be loaded." : "회원 정보를 불러오지 못했습니다.");
            return payload;
        }

        String normalizedMarketingYn = normalizeMarketingYn(marketingYn);
        EntrprsMber member = (EntrprsMber) memberObject;
        member.setMarketingYn(normalizedMarketingYn);
        enterpriseMemberRepository.save(member);

        payload.put("member", member);
        payload.put("items", buildSectionItems("marketing", member));
        payload.put("saved", true);
        payload.put("message", en ? "Marketing preference updated." : "마케팅 수신 설정을 저장했습니다.");
        return payload;
    }

    @Override
    public Map<String, Object> updateStaffContact(boolean en, String staffName, String deptNm, String areaNo,
            String middleTelno, String endTelno, HttpServletRequest request) {
        Map<String, Object> payload = buildMypageSectionPayload(en, "staff", request);
        if (!Boolean.TRUE.equals(payload.get("authenticated"))) {
            payload.put("saved", false);
            return payload;
        }
        if (!Boolean.TRUE.equals(payload.get("canUseSection"))) {
            payload.put("saved", false);
            payload.put("message", payload.get("sectionReason"));
            return payload;
        }
        Object memberObject = payload.get("member");
        if (!(memberObject instanceof EntrprsMber)) {
            payload.put("saved", false);
            payload.put("message", en ? "Member information could not be loaded." : "회원 정보를 불러오지 못했습니다.");
            return payload;
        }
        String normalizedStaffName = safeString(staffName);
        String normalizedAreaNo = digitsOnly(areaNo, 4);
        String normalizedMiddleTelno = digitsOnly(middleTelno, 4);
        String normalizedEndTelno = digitsOnly(endTelno, 4);

        if (normalizedStaffName.isEmpty()) {
            payload.put("saved", false);
            payload.put("message", en ? "Please enter the staff name." : "담당자명을 입력해 주세요.");
            return payload;
        }
        if (!isValidPhonePart(normalizedAreaNo, 2, 4)
                || !isValidPhonePart(normalizedMiddleTelno, 3, 4)
                || !isValidPhonePart(normalizedEndTelno, 4, 4)) {
            payload.put("saved", false);
            payload.put("message", en ? "Please enter a valid phone number." : "올바른 연락처를 입력해 주세요.");
            return payload;
        }

        EntrprsMber member = (EntrprsMber) memberObject;
        member.setApplcntNm(normalizedStaffName);
        member.setDeptNm(safeString(deptNm));
        member.setAreaNo(normalizedAreaNo);
        member.setEntrprsMiddleTelno(normalizedMiddleTelno);
        member.setEntrprsEndTelno(normalizedEndTelno);
        enterpriseMemberRepository.save(member);

        payload.put("member", member);
        payload.put("items", buildSectionItems("staff", member));
        payload.put("saved", true);
        payload.put("message", en ? "Staff contact updated." : "실무자 정보를 저장했습니다.");
        return payload;
    }

    @Override
    public Map<String, Object> updateEmailAddress(boolean en, String email, HttpServletRequest request) {
        Map<String, Object> payload = buildMypageSectionPayload(en, "email", request);
        if (!Boolean.TRUE.equals(payload.get("authenticated"))) {
            payload.put("saved", false);
            return payload;
        }
        if (!Boolean.TRUE.equals(payload.get("canUseSection"))) {
            payload.put("saved", false);
            payload.put("message", payload.get("sectionReason"));
            return payload;
        }
        String normalizedEmail = safeString(email);
        if (!isValidEmail(normalizedEmail)) {
            payload.put("saved", false);
            payload.put("message", en ? "Please enter a valid email address." : "올바른 이메일 주소를 입력해 주세요.");
            return payload;
        }
        Object memberObject = payload.get("member");
        if (!(memberObject instanceof EntrprsMber)) {
            payload.put("saved", false);
            payload.put("message", en ? "Member information could not be loaded." : "회원 정보를 불러오지 못했습니다.");
            return payload;
        }
        EntrprsMber member = (EntrprsMber) memberObject;
        member.setApplcntEmailAdres(normalizedEmail);
        member.setAuthEmail(normalizedEmail);
        enterpriseMemberRepository.save(member);
        payload.put("member", member);
        payload.put("items", buildSectionItems("email", member));
        payload.put("saved", true);
        payload.put("message", en ? "Email address updated." : "이메일 주소를 저장했습니다.");
        return payload;
    }

    @Override
    public Map<String, Object> updatePassword(boolean en, String currentPassword, String newPassword, HttpServletRequest request) {
        Map<String, Object> payload = buildMypageSectionPayload(en, "password", request);
        if (!Boolean.TRUE.equals(payload.get("authenticated"))) {
            payload.put("saved", false);
            return payload;
        }
        if (!Boolean.TRUE.equals(payload.get("canUseSection"))) {
            payload.put("saved", false);
            payload.put("message", payload.get("sectionReason"));
            return payload;
        }
        Object memberObject = payload.get("member");
        if (!(memberObject instanceof EntrprsMber)) {
            payload.put("saved", false);
            payload.put("message", en ? "Member information could not be loaded." : "회원 정보를 불러오지 못했습니다.");
            return payload;
        }
        EntrprsMber member = (EntrprsMber) memberObject;
        if (!matchesPassword(currentPassword, member.getEntrprsMberId(), member.getEntrprsMberPassword())) {
            payload.put("saved", false);
            payload.put("message", en ? "Current password does not match." : "현재 비밀번호가 일치하지 않습니다.");
            return payload;
        }
        if (!validatePasswordPolicy(newPassword)) {
            payload.put("saved", false);
            payload.put("message", en
                    ? "Please meet the password policy (at least 9 chars and 3 character types)."
                    : "비밀번호 정책(9자리 이상, 3종류 조합)을 충족해 주세요.");
            return payload;
        }
        boolean updated = authService.resetPassword(member.getEntrprsMberId(), newPassword, member.getEntrprsMberId(),
                resolveClientIp(request), "MYPAGE_SELF_SERVICE");
        if (!updated) {
            payload.put("saved", false);
            payload.put("message", en ? "Password update failed." : "비밀번호 변경에 실패했습니다.");
            return payload;
        }
        Optional<EntrprsMber> refreshed = enterpriseMemberRepository.findById(member.getEntrprsMberId());
        refreshed.ifPresent(value -> {
            payload.put("member", value);
            payload.put("items", buildSectionItems("password", value));
            payload.put("passwordHistory", buildPasswordHistory(value.getEntrprsMberId()));
        });
        payload.put("saved", true);
        payload.put("message", en ? "Password updated." : "비밀번호를 변경했습니다.");
        return payload;
    }

    private String extractUserId(String accessToken) {
        try {
            Claims claims = jwtProvider.accessExtractClaims(accessToken);
            Object encryptedUserId = claims.get("userId");
            if (encryptedUserId == null) {
                return "";
            }
            return jwtProvider.decrypt(encryptedUserId.toString());
        } catch (Exception e) {
            return "";
        }
    }

    private List<Map<String, String>> buildSectionItems(String section, EntrprsMber member) {
        List<Map<String, String>> items = new java.util.ArrayList<>();
        switch (section) {
            case "profile":
                addItem(items, "아이디", member.getEntrprsMberId());
                addItem(items, "담당자명", member.getApplcntNm());
                addItem(items, "이메일", member.getApplcntEmailAdres());
                addItem(items, "전화번호", formatPhone(member));
                addItem(items, "주소", joinAddress(member.getZip(), member.getAdres(), member.getDetailAdres()));
                break;
            case "company":
                addItem(items, "회사명", member.getCmpnyNm());
                addItem(items, "사업자번호", member.getBizrno());
                addItem(items, "기관 ID", member.getInsttId());
                addItem(items, "대표자", member.getCxfc());
                addItem(items, "회사 연락처", formatPhone(member));
                addItem(items, "회사 주소", joinAddress(member.getZip(), member.getAdres(), member.getDetailAdres()));
                break;
            case "staff":
                addItem(items, "주 담당자", member.getApplcntNm());
                addItem(items, "연락 이메일", member.getApplcntEmailAdres());
                addItem(items, "대표 연락처", formatPhone(member));
                addItem(items, "안내", "현재는 대표 실무자 1건 기준으로 수정할 수 있습니다.");
                break;
            case "notification":
                addItem(items, "알림 수신 이메일", member.getApplcntEmailAdres());
                addItem(items, "마케팅 수신", yesNo(member.getMarketingYn()));
                addItem(items, "안내", "추가 알림 채널 설정 컬럼이 없어 현재는 읽기 전용입니다.");
                break;
            case "password":
                addItem(items, "마지막 비밀번호 변경", formatDateTime(member.getChgPwdLastPnttm()));
                addItem(items, "계정 잠금 여부", safeString(member.getLockAt()).isEmpty() ? "N" : safeString(member.getLockAt()));
                addItem(items, "안내", "현재는 이력 조회만 전환했습니다.");
                break;
            case "email":
                addItem(items, "현재 이메일", member.getApplcntEmailAdres());
                addItem(items, "인증 이메일", member.getAuthEmail());
                addItem(items, "안내", "이메일 변경은 별도 인증 흐름 정리 후 전환합니다.");
                break;
            case "marketing":
                addItem(items, "현재 수신 설정", yesNo(member.getMarketingYn()));
                addItem(items, "저장 가능", "Y");
                break;
            default:
                addItem(items, "안내", "지원하지 않는 섹션입니다.");
                break;
        }
        return items;
    }

    private List<Map<String, String>> buildPasswordHistory(String userId) {
        List<PasswordResetHistory> histories = authService.findRecentPasswordResetHistories(userId);
        List<Map<String, String>> rows = new java.util.ArrayList<>();
        for (PasswordResetHistory history : histories) {
            Map<String, String> row = new LinkedHashMap<>();
            row.put("resetAt", formatDateTime(history.getResetPnttm()));
            row.put("resetBy", safeString(history.getResetByUserId()));
            row.put("source", safeString(history.getResetSource()));
            rows.add(row);
        }
        return rows;
    }

    private void addItem(List<Map<String, String>> items, String label, String value) {
        Map<String, String> item = new LinkedHashMap<>();
        item.put("label", label);
        item.put("value", safeString(value).isEmpty() ? "-" : safeString(value));
        items.add(item);
    }

    private String resolveSectionTitle(String section, boolean en) {
        switch (section) {
            case "profile":
                return en ? "Profile" : "개인정보";
            case "company":
                return en ? "Company" : "회사정보";
            case "staff":
                return en ? "Staff" : "실무자 정보";
            case "notification":
                return en ? "Notifications" : "알림 설정";
            case "password":
                return en ? "Password" : "비밀번호";
            case "email":
                return en ? "Email" : "이메일";
            case "marketing":
                return en ? "Marketing" : "마케팅 수신";
            default:
                return en ? "Mypage" : "마이페이지";
        }
    }

    private String normalizeSection(String section) {
        String normalized = safeString(section).toLowerCase(Locale.ROOT);
        switch (normalized) {
            case "profile":
            case "company":
            case "staff":
            case "notification":
            case "password":
            case "email":
            case "marketing":
                return normalized;
            default:
                return "profile";
        }
    }

    private String normalizeMarketingYn(String marketingYn) {
        return "Y".equalsIgnoreCase(safeString(marketingYn)) ? "Y" : "N";
    }

    private String digitsOnly(String value, int maxLength) {
        String digits = safeString(value).replaceAll("[^0-9]", "");
        return digits.length() > maxLength ? digits.substring(0, maxLength) : digits;
    }

    private String normalizeZip(String zip) {
        return digitsOnly(zip, 6);
    }

    private boolean isValidPhonePart(String value, int minLength, int maxLength) {
        int length = safeString(value).length();
        return length >= minLength && length <= maxLength;
    }

    private boolean isValidEmail(String email) {
        return !safeString(email).isEmpty() && safeString(email).matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    }

    private boolean validatePasswordPolicy(String password) {
        if (password == null || password.length() < 9) {
            return false;
        }
        int classes = 0;
        if (password.matches(".*[a-z].*")) {
            classes++;
        }
        if (password.matches(".*[A-Z].*")) {
            classes++;
        }
        if (password.matches(".*\\d.*")) {
            classes++;
        }
        if (password.matches(".*[^A-Za-z0-9].*")) {
            classes++;
        }
        return classes >= 3;
    }

    private boolean matchesPassword(String rawPassword, String userId, String storedPassword) {
        if (rawPassword == null || userId == null || storedPassword == null) {
            return false;
        }
        String encoded = encryptPassword(rawPassword, userId);
        return Objects.equals(encoded, storedPassword) || Objects.equals(rawPassword, storedPassword);
    }

    private String encryptPassword(String key, String salt) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.reset();
            md.update(salt.getBytes(StandardCharsets.UTF_8));
            return Base64.encodeBase64String(md.digest(key.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            return "";
        }
    }

    private String resolveClientIp(HttpServletRequest request) {
        if (request == null) {
            return "LOCAL";
        }
        String forwardedFor = safeString(request.getHeader("X-Forwarded-For"));
        if (!forwardedFor.isEmpty()) {
            return safeString(forwardedFor.split(",")[0]);
        }
        String realIp = safeString(request.getHeader("X-Real-IP"));
        if (!realIp.isEmpty()) {
            return realIp;
        }
        String remoteAddr = safeString(request.getRemoteAddr());
        return remoteAddr.isEmpty() ? "LOCAL" : remoteAddr;
    }

    private String formatPhone(EntrprsMber member) {
        return safeString(member.getAreaNo()) + safeString(member.getEntrprsMiddleTelno()) + safeString(member.getEntrprsEndTelno());
    }

    private String joinAddress(String zip, String address, String detailAddress) {
        String merged = String.join(" ", safeString(zip), safeString(address), safeString(detailAddress)).trim();
        return merged.isEmpty() ? "-" : merged;
    }

    private String yesNo(String value) {
        return "Y".equalsIgnoreCase(safeString(value)) ? "Y" : "N";
    }

    private String formatDateTime(java.time.LocalDateTime value) {
        return value == null ? "-" : value.format(DISPLAY_DATE_TIME);
    }

    private void populateInstitutionReviewInfo(Model model, EntrprsMber enterprise) {
        try {
            InsttInfoVO searchVO = new InsttInfoVO();
            if (!ObjectUtils.isEmpty(enterprise.getInsttId())) {
                searchVO.setInsttId(enterprise.getInsttId());
            } else if (!ObjectUtils.isEmpty(enterprise.getBizrno())) {
                searchVO.setBizrno(enterprise.getBizrno());
            } else {
                return;
            }

            InstitutionStatusVO insttInfo = entrprsManageService.selectInsttInfoForStatus(searchVO);
            if (insttInfo == null || insttInfo.isEmpty()) {
                return;
            }

            Object submittedAt = insttInfo.getFrstRegistPnttm();
            Object rejectReason = insttInfo.getRjctRsn();
            Object rejectProcessedAt = insttInfo.getRjctPnttm();

            if (!ObjectUtils.isEmpty(submittedAt)) {
                model.addAttribute("submittedAt", submittedAt);
            }
            if (!ObjectUtils.isEmpty(rejectReason)) {
                model.addAttribute("rejectionReason", rejectReason.toString());
            }
            if (!ObjectUtils.isEmpty(rejectProcessedAt)) {
                model.addAttribute("rejectionProcessedAt", rejectProcessedAt.toString());
            }
        } catch (Exception ignored) {
            // Mypage gating must not fail even if institution review info lookup fails.
        }
    }

    private void populateInstitutionReviewInfoMap(Map<String, Object> payload, EntrprsMber enterprise) {
        try {
            InsttInfoVO searchVO = new InsttInfoVO();
            if (!ObjectUtils.isEmpty(enterprise.getInsttId())) {
                searchVO.setInsttId(enterprise.getInsttId());
            } else if (!ObjectUtils.isEmpty(enterprise.getBizrno())) {
                searchVO.setBizrno(enterprise.getBizrno());
            } else {
                return;
            }

            InstitutionStatusVO insttInfo = entrprsManageService.selectInsttInfoForStatus(searchVO);
            if (insttInfo == null || insttInfo.isEmpty()) {
                return;
            }

            Object submittedAt = insttInfo.getFrstRegistPnttm();
            Object rejectReason = insttInfo.getRjctRsn();
            Object rejectProcessedAt = insttInfo.getRjctPnttm();

            if (!ObjectUtils.isEmpty(submittedAt)) {
                payload.put("submittedAt", submittedAt);
            }
            if (!ObjectUtils.isEmpty(rejectReason)) {
                payload.put("rejectionReason", rejectReason.toString());
            }
            if (!ObjectUtils.isEmpty(rejectProcessedAt)) {
                payload.put("rejectionProcessedAt", rejectProcessedAt.toString());
            }
        } catch (Exception ignored) {
            // Mypage gating must not fail even if institution review info lookup fails.
        }
    }

    private String formatSubmittedAt(EntrprsMber enterprise) {
        if (enterprise.getSbscrbDe() == null) {
            return "-";
        }
        return enterprise.getSbscrbDe().format(DISPLAY_DATE_TIME);
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }
}
