package egovframework.com.feature.admin.framework.builder.support.impl;

import egovframework.com.feature.admin.framework.builder.support.CarbonetFrameworkBuilderMetadataSource;
import egovframework.com.framework.contract.model.FrameworkContractMetadataVO;
import egovframework.com.framework.contract.service.FrameworkContractMetadataService;
import org.springframework.stereotype.Component;

@Component
public class CarbonetFrameworkBuilderMetadataSourceBridge implements CarbonetFrameworkBuilderMetadataSource {

    private final FrameworkContractMetadataService frameworkContractMetadataService;

    public CarbonetFrameworkBuilderMetadataSourceBridge(FrameworkContractMetadataService frameworkContractMetadataService) {
        this.frameworkContractMetadataService = frameworkContractMetadataService;
    }

    @Override
    public FrameworkContractMetadataVO getMetadata() throws Exception {
        return frameworkContractMetadataService.getMetadata();
    }
}
