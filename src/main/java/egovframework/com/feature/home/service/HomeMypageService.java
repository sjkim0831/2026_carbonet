package egovframework.com.feature.home.service;

import org.springframework.ui.Model;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

public interface HomeMypageService {

    String resolveMypageView(boolean en, Model model, HttpServletRequest request);

    Map<String, Object> buildMypagePayload(boolean en, HttpServletRequest request);

    Map<String, Object> buildMypageSectionPayload(boolean en, String section, HttpServletRequest request);

    Map<String, Object> updateProfile(boolean en, String zip, String address, String detailAddress,
            HttpServletRequest request);

    Map<String, Object> updateCompany(boolean en, String companyName, String representativeName, String zip,
            String address, String detailAddress, HttpServletRequest request);

    Map<String, Object> updateMarketingPreference(boolean en, String marketingYn, HttpServletRequest request);

    Map<String, Object> updateStaffContact(boolean en, String staffName, String deptNm, String areaNo,
            String middleTelno, String endTelno, HttpServletRequest request);

    Map<String, Object> updateEmailAddress(boolean en, String email, HttpServletRequest request);

    Map<String, Object> updatePassword(boolean en, String currentPassword, String newPassword, HttpServletRequest request);
}
