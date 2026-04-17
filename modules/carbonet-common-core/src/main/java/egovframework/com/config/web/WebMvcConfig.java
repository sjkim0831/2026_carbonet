package egovframework.com.config.web;

import egovframework.com.common.interceptor.CompanyScopeInterceptor;
import egovframework.com.common.interceptor.ReactShellNoCacheInterceptor;
import egovframework.com.common.interceptor.TraceContextInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;

import java.util.concurrent.TimeUnit;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final CompanyScopeInterceptor companyScopeInterceptor;
    private final TraceContextInterceptor traceContextInterceptor;
    private final ReactShellNoCacheInterceptor reactShellNoCacheInterceptor;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/home/**").addResourceLocations("classpath:/static/");
        registry.addResourceHandler("/signin/**").addResourceLocations("classpath:/static/");
        registry.addResourceHandler("/main/**").addResourceLocations("classpath:/static/");
        registry.addResourceHandler("/react-shell/**")
                .addResourceLocations("classpath:/static/react-shell/")
                .setCacheControl(CacheControl.noStore().mustRevalidate());
        registry.addResourceHandler("/assets/react/index.html")
                .addResourceLocations("classpath:/static/react-app/index.html")
                .setCacheControl(CacheControl.noCache());
        registry.addResourceHandler("/assets/react/assets/**")
                .addResourceLocations("classpath:/static/react-app/assets/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic());
        registry.addResourceHandler("/assets/react/.vite/**")
                .addResourceLocations("classpath:/static/react-app/.vite/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic());
        registry.addResourceHandler("/admin/assets/react/**", "/en/admin/assets/react/**")
                .addResourceLocations("classpath:/static/react-app/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic());
        registry.addResourceHandler("/admin/**").addResourceLocations("classpath:/static/");
        registry.addResourceHandler("/assets/react/**")
                .addResourceLocations("classpath:/static/react-app/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic());
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(localeChangeInterceptor());
        registry.addInterceptor(companyScopeInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/css/**",
                        "/js/**",
                        "/images/**",
                        "/webjars/**",
                        "/error/**",
                        "/favicon.ico",
                        "/assets/react/**",
                        "/admin/assets/react/**",
                        "/en/admin/assets/react/**");
        registry.addInterceptor(traceContextInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/css/**",
                        "/js/**",
                        "/images/**",
                        "/webjars/**",
                        "/error/**",
                        "/favicon.ico",
                        "/assets/react/**",
                        "/admin/assets/react/**",
                        "/en/admin/assets/react/**");
        registry.addInterceptor(reactShellNoCacheInterceptor).addPathPatterns("/**");
    }

    @Bean
    public LocaleChangeInterceptor localeChangeInterceptor() {
        LocaleChangeInterceptor interceptor = new LocaleChangeInterceptor();
        interceptor.setParamName("language");
        return interceptor;
    }

    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}
