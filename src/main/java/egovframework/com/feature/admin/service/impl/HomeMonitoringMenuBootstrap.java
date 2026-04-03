package egovframework.com.feature.admin.service.impl;

import egovframework.com.feature.admin.service.AdminCodeManageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class HomeMonitoringMenuBootstrap {

    private static final String ACTOR_ID = "SYSTEM_BOOTSTRAP";

    private static final String DASHBOARD_MENU_CODE = "H0050101";
    private static final String DASHBOARD_MENU_NAME_KO = "통합 대시보드";
    private static final String DASHBOARD_MENU_NAME_EN = "Unified Dashboard";
    private static final String DASHBOARD_MENU_URL = "/monitoring/dashboard";
    private static final String DASHBOARD_MENU_ICON = "dashboard";

    private static final String REALTIME_MENU_CODE = "H0050102";
    private static final String REALTIME_MENU_NAME_KO = "실시간 모니터링";
    private static final String REALTIME_MENU_NAME_EN = "Real-time Monitoring";
    private static final String REALTIME_MENU_URL = "/monitoring/realtime";
    private static final String REALTIME_MENU_ICON = "monitoring";

    private final AdminCodeManageService adminCodeManageService;

    @EventListener(ApplicationReadyEvent.class)
    public void ensureHomeMonitoringMenus() {
        try {
            reconcileMenu(DASHBOARD_MENU_CODE, DASHBOARD_MENU_NAME_KO, DASHBOARD_MENU_NAME_EN, DASHBOARD_MENU_URL, DASHBOARD_MENU_ICON);
            reconcileMenu(REALTIME_MENU_CODE, REALTIME_MENU_NAME_KO, REALTIME_MENU_NAME_EN, REALTIME_MENU_URL, REALTIME_MENU_ICON);
            log.info("Home monitoring menus reconciled. dashboard={}, realtime={}", DASHBOARD_MENU_URL, REALTIME_MENU_URL);
        } catch (Exception e) {
            log.error("Failed to reconcile home monitoring menu metadata.", e);
        }
    }

    private void reconcileMenu(String menuCode, String menuNameKo, String menuNameEn, String menuUrl, String menuIcon) throws Exception {
        adminCodeManageService.updatePageManagement(
                menuCode,
                menuNameKo,
                menuNameEn,
                menuUrl,
                menuIcon,
                "Y",
                ACTOR_ID
        );
    }
}
