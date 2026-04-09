package egovframework.com.platform.observability.service;

import egovframework.com.feature.admin.service.AdminShellBootstrapPageService;
import egovframework.com.platform.service.observability.CertificateAuditLogPageDataPort;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CertificateAuditLogPageDataPortBridge implements CertificateAuditLogPageDataPort {

    private final AdminShellBootstrapPageService adminShellBootstrapPageService;

    public CertificateAuditLogPageDataPortBridge(AdminShellBootstrapPageService adminShellBootstrapPageService) {
        this.adminShellBootstrapPageService = adminShellBootstrapPageService;
    }

    @Override
    public Map<String, Object> buildCertificateAuditLogPageData(String pageIndexParam, String searchKeyword, String auditType,
                                                                String status, String certificateType, String startDate,
                                                                String endDate, boolean isEn) {
        return adminShellBootstrapPageService.buildCertificateAuditLogPageData(
                pageIndexParam, searchKeyword, auditType, status, certificateType, startDate, endDate, isEn);
    }
}
