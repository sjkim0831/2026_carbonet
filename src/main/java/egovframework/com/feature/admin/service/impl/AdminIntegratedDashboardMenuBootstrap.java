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
public class AdminIntegratedDashboardMenuBootstrap {

    private static final String MENU_CODE = "A0070101";
    private static final String MENU_NAME_KO = "통합 대시보드";
    private static final String MENU_NAME_EN = "Integrated Dashboard";
    private static final String MENU_URL = "/admin/";
    private static final String MENU_ICON = "dashboard";
    private static final String ACTOR_ID = "SYSTEM_BOOTSTRAP";

    private final AdminCodeManageService adminCodeManageService;

    @EventListener(ApplicationReadyEvent.class)
    public void ensureIntegratedDashboardMenu() {
        try {
            adminCodeManageService.updatePageManagement(
                    MENU_CODE,
                    MENU_NAME_KO,
                    MENU_NAME_EN,
                    MENU_URL,
                    MENU_ICON,
                    "Y",
                    ACTOR_ID
            );
            log.info("Integrated dashboard menu reconciled. code={}, url={}", MENU_CODE, MENU_URL);
        } catch (Exception e) {
            log.error("Failed to reconcile integrated dashboard menu metadata.", e);
        }
    }
}
