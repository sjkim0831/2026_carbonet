package egovframework.com;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.beans.factory.support.BeanDefinitionRegistryPostProcessor;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.Arrays;
import java.util.List;

@SpringBootApplication
@ComponentScan(
        basePackages = { "egovframework.com", "org.egovframe.boot" },
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.REGEX, pattern = "egovframework\\.com\\.platform\\.screenbuilder\\..*"),
                @ComponentScan.Filter(type = FilterType.REGEX, pattern = "egovframework\\.com\\.feature\\.admin\\.screenbuilder\\..*"),
                @ComponentScan.Filter(type = FilterType.REGEX, pattern = "egovframework\\.com\\.framework\\.builder\\..*"),
                @ComponentScan.Filter(type = FilterType.REGEX, pattern = "egovframework\\.com\\.feature\\.admin\\.framework\\.builder\\..*")
        })
@EnableScheduling
public class CarbonetApplication {

    @Bean
    public static BeanDefinitionRegistryPostProcessor screenBuilderModuleIsolationPostProcessor() {
        return new BeanDefinitionRegistryPostProcessor() {
            private final List<String> excludedPrefixes = Arrays.asList(
                    "egovframework.com.platform.screenbuilder.",
                    "egovframework.com.feature.admin.screenbuilder.",
                    "egovframework.com.framework.builder.",
                    "egovframework.com.feature.admin.framework.builder.");
            private final List<String> excludedClasses = Arrays.asList(
                    "egovframework.com.feature.admin.web.AdminScreenBuilderController");
            private final List<String> excludedBeanNames = Arrays.asList(
                    "adminScreenBuilderController",
                    "screenBuilderApiController");

            @Override
            public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) throws BeansException {
                for (String beanName : registry.getBeanDefinitionNames()) {
                    if (excludedBeanNames.contains(beanName)) {
                        registry.removeBeanDefinition(beanName);
                        continue;
                    }
                    BeanDefinition beanDefinition = registry.getBeanDefinition(beanName);
                    String beanClassName = beanDefinition.getBeanClassName();
                    if (beanClassName == null || beanClassName.isEmpty()) {
                        continue;
                    }
                    if (isExcluded(beanClassName)) {
                        registry.removeBeanDefinition(beanName);
                    }
                }
            }

            @Override
            public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
            }

            private boolean isExcluded(String beanClassName) {
                for (String excludedClass : excludedClasses) {
                    if (excludedClass.equals(beanClassName)) {
                        return true;
                    }
                }
                for (String prefix : excludedPrefixes) {
                    if (beanClassName.startsWith(prefix)) {
                        return true;
                    }
                }
                return false;
            }
        };
    }

    public static void main(String[] args) {
        System.setProperty("file.encoding", "UTF-8");
        SpringApplication.run(CarbonetApplication.class, args);
    }
}
