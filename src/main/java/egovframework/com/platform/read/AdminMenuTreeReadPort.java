package egovframework.com.platform.read;

import egovframework.com.feature.admin.dto.response.AdminMenuDomainDTO;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

public interface AdminMenuTreeReadPort {

    Map<String, AdminMenuDomainDTO> buildAdminMenuTree(boolean isEn, HttpServletRequest request);

    Map<String, AdminMenuDomainDTO> buildAdminMenuTree(boolean isEn, String authorCode);
}
