package egovframework.com.framework.authority.service;

import egovframework.com.feature.admin.screenbuilder.support.CarbonetScreenBuilderAuthoritySource;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FrameworkAuthorityScreenBuilderConfiguration {

    @Bean
    @ConditionalOnMissingBean(CarbonetScreenBuilderAuthoritySource.class)
    public CarbonetScreenBuilderAuthoritySource carbonetScreenBuilderAuthoritySource(
            FrameworkAuthorityContractService frameworkAuthorityContractService) {
        return new CarbonetScreenBuilderAuthoritySourceAdapter(frameworkAuthorityContractService);
    }
}
