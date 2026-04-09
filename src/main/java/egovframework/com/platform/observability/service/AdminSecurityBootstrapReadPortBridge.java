package egovframework.com.platform.observability.service;

import egovframework.com.feature.admin.service.AdminSecurityBootstrapReadService;
import egovframework.com.platform.service.observability.AdminSecurityBootstrapReadPort;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AdminSecurityBootstrapReadPortBridge implements AdminSecurityBootstrapReadPort {

    private final AdminSecurityBootstrapReadService delegate;

    public AdminSecurityBootstrapReadPortBridge(AdminSecurityBootstrapReadService delegate) {
        this.delegate = delegate;
    }

    @Override
    public Map<String, Object> buildSecurityPolicyPageData(boolean isEn) {
        return delegate.buildSecurityPolicyPageData(isEn);
    }
}
