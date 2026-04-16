package egovframework.com.config.mapper;

import egovframework.com.common.mapper.SystemAssetInventoryMapper;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SystemAssetInventoryMapperConfig {

    @Bean(name = "systemAssetInventoryMapper")
    @ConditionalOnMissingBean(SystemAssetInventoryMapper.class)
    public SystemAssetInventoryMapper systemAssetInventoryMapper() {
        return new SystemAssetInventoryMapper();
    }
}
