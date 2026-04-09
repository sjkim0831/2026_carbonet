package egovframework.com.framework.authority.service;

import egovframework.com.framework.authority.model.FrameworkAuthorityRoleContractVO;
import egovframework.com.platform.screenbuilder.support.ScreenBuilderAuthorityContractPort;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class CarbonetScreenBuilderAuthoritySourceBridge implements ScreenBuilderAuthorityContractPort {

    private final FrameworkAuthorityContractService frameworkAuthorityContractService;

    public CarbonetScreenBuilderAuthoritySourceBridge(FrameworkAuthorityContractService frameworkAuthorityContractService) {
        this.frameworkAuthorityContractService = frameworkAuthorityContractService;
    }

    @Override
    public List<FrameworkAuthorityRoleContractVO> getAuthorityRoles() throws Exception {
        if (frameworkAuthorityContractService.getAuthorityContract() == null
                || frameworkAuthorityContractService.getAuthorityContract().getAuthorityRoles() == null) {
            return Collections.emptyList();
        }
        return frameworkAuthorityContractService.getAuthorityContract().getAuthorityRoles();
    }
}
