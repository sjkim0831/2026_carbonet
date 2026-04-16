package egovframework.com.config.security;

import org.egovframe.boot.security.EgovSecurityProperties;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.beans.factory.support.BeanDefinitionRegistryPostProcessor;
import org.springframework.beans.factory.support.RootBeanDefinition;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;

@Configuration
public class CarbonetSecurityOverrideConfig {

    @Bean
    public static BeanDefinitionRegistryPostProcessor carbonetAccessDeniedHandlerOverride() {
        return new BeanDefinitionRegistryPostProcessor() {
            @Override
            public void postProcessBeanDefinitionRegistry(@NonNull BeanDefinitionRegistry registry) throws BeansException {
                if (registry.containsBeanDefinition("egovAccessDeniedHandler")) {
                    registry.removeBeanDefinition("egovAccessDeniedHandler");
                }

                RootBeanDefinition beanDefinition = new RootBeanDefinition(CarbonetAccessDeniedHandler.class);
                beanDefinition.setRole(BeanDefinition.ROLE_APPLICATION);
                beanDefinition.setInstanceSupplier(() -> {
                    EgovSecurityProperties properties = SpringContextHolder.getBean(EgovSecurityProperties.class);
                    return new CarbonetAccessDeniedHandler(
                            properties.getAccessDeniedUrl(),
                            properties.getCsrfAccessDeniedUrl()
                    );
                });
                registry.registerBeanDefinition("egovAccessDeniedHandler", beanDefinition);

                if (registry.containsBeanDefinition("loginUrlAuthenticationEntryPoint")) {
                    registry.removeBeanDefinition("loginUrlAuthenticationEntryPoint");
                }

                RootBeanDefinition entryPointBeanDefinition =
                        new RootBeanDefinition(CarbonetAdminAwareLoginUrlAuthenticationEntryPoint.class);
                entryPointBeanDefinition.setRole(BeanDefinition.ROLE_APPLICATION);
                entryPointBeanDefinition.setInstanceSupplier(() -> {
                    EgovSecurityProperties properties = SpringContextHolder.getBean(EgovSecurityProperties.class);
                    return new CarbonetAdminAwareLoginUrlAuthenticationEntryPoint(properties.getLoginUrl());
                });
                registry.registerBeanDefinition("loginUrlAuthenticationEntryPoint", entryPointBeanDefinition);
            }

            @Override
            public void postProcessBeanFactory(@NonNull ConfigurableListableBeanFactory beanFactory) throws BeansException {
            }
        };
    }

    @Bean
    public static SpringContextHolder springContextHolder() {
        return new SpringContextHolder();
    }

    static final class SpringContextHolder implements ApplicationContextAware {

        private static ApplicationContext applicationContext;

        @Override
        public void setApplicationContext(@NonNull ApplicationContext applicationContext) throws BeansException {
            SpringContextHolder.applicationContext = applicationContext;
        }

        private static <T> T getBean(Class<T> beanType) {
            return applicationContext.getBean(beanType);
        }
    }
}
