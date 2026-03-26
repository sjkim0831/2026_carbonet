package egovframework.com.feature.admin.service.impl;

import egovframework.com.feature.admin.service.AdminCodeManageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminUnifiedLogMenuUrlCorrectionBootstrap {

    private static final String ACTOR_ID = "SYSTEM_BOOTSTRAP";

    private final AdminCodeManageService adminCodeManageService;

    @EventListener(ApplicationReadyEvent.class)
    @Order(Ordered.LOWEST_PRECEDENCE)
    public void correctUnifiedLogSubmenuUrls() {
        correct("A0060305", "추적 로그", "Trace Logs", "/admin/system/unified_log/trace", "timeline");
        correct("A0060306", "페이지 이벤트 로그", "Page Event Logs", "/admin/system/unified_log/page-events", "pageview");
        correct("A0060307", "UI 액션 로그", "UI Action Logs", "/admin/system/unified_log/ui-actions", "touch_app");
        correct("A0060308", "API 추적 로그", "API Trace Logs", "/admin/system/unified_log/api-trace", "api");
        correct("A0060309", "UI 오류 로그", "UI Error Logs", "/admin/system/unified_log/ui-errors", "bug_report");
        correct("A0060310", "레이아웃 렌더 로그", "Layout Render Logs", "/admin/system/unified_log/layout-render", "dashboard_customize");
    }

    private void correct(String code, String nameKo, String nameEn, String menuUrl, String icon) {
        try {
            if (adminCodeManageService.countPageManagementByCode("AMENU1", code) == 0) {
                return;
            }
            adminCodeManageService.updatePageManagement(
                    code,
                    nameKo,
                    nameEn,
                    menuUrl,
                    icon,
                    "Y",
                    ACTOR_ID
            );
        } catch (Exception e) {
            log.error("Failed to correct unified log submenu menuUrl. code={}, menuUrl={}", code, menuUrl, e);
        }
    }
}
