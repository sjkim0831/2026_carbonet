package egovframework.com.feature.admin.service.impl;

import egovframework.com.feature.admin.dto.response.AdminMenuDomainDTO;
import egovframework.com.feature.admin.service.AdminMenuTreeService;
import egovframework.com.platform.read.AdminMenuTreeReadPort;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@Service
public class CarbonetAdminMenuTreeReadAdapter implements AdminMenuTreeReadPort {

    private final AdminMenuTreeService adminMenuTreeService;

    public CarbonetAdminMenuTreeReadAdapter(AdminMenuTreeService adminMenuTreeService) {
        this.adminMenuTreeService = adminMenuTreeService;
    }

    @Override
    public Map<String, AdminMenuDomainDTO> buildAdminMenuTree(boolean isEn, HttpServletRequest request) {
        return adminMenuTreeService.buildAdminMenuTree(isEn, request);
    }

    @Override
    public Map<String, AdminMenuDomainDTO> buildAdminMenuTree(boolean isEn, String authorCode) {
        return adminMenuTreeService.buildAdminMenuTree(isEn, authorCode);
    }
}
