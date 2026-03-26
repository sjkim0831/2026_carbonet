package egovframework.com.feature.admin.service.impl;

import egovframework.com.feature.admin.model.vo.PageManagementVO;
import egovframework.com.feature.admin.service.AdminCodeManageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminLogMenuBaselineRestoreBootstrap {

    private final AdminCodeManageService adminCodeManageService;

    @EventListener(ApplicationReadyEvent.class)
    public void restoreBaselineLogMenus() {
        try {
            logCurrentState();
            restoreBaselineMenus();
        } catch (Exception e) {
            log.error("Failed to restore log menu baseline.", e);
        }
    }

    private void logCurrentState() throws Exception {
        List<PageManagementVO> logMenus = adminCodeManageService.selectPageManagementList(
                AdminLogMenuBaselineCatalog.CODE_ID,
                "로그",
                null
        ).stream()
                .filter(row -> row != null && row.getCode() != null && row.getCode().startsWith("A00603"))
                .collect(Collectors.toList());
        String snapshot = logMenus.stream()
                .map(row -> String.format("%s:%s:%s:%s",
                        safe(row.getCode()),
                        safe(row.getCodeNm()),
                        safe(row.getMenuUrl()),
                        safe(row.getUseAt())))
                .collect(Collectors.joining(", "));
        log.info("Current log menu snapshot: [{}]", snapshot);
    }

    private void restoreBaselineMenus() throws Exception {
        for (AdminLogMenuBaselineCatalog.LogMenuSnapshot menu : AdminLogMenuBaselineCatalog.BASELINE_MENUS) {
            if (adminCodeManageService.countPageManagementByCode(AdminLogMenuBaselineCatalog.CODE_ID, menu.getCode()) == 0) {
                adminCodeManageService.insertPageManagement(
                        AdminLogMenuBaselineCatalog.CODE_ID,
                        menu.getCode(),
                        menu.getCodeNm(),
                        menu.getCodeDc(),
                        menu.getMenuUrl(),
                        menu.getMenuIcon(),
                        menu.getUseAt(),
                        AdminLogMenuBaselineCatalog.ACTOR_ID
                );
            } else {
                adminCodeManageService.updatePageManagement(
                        menu.getCode(),
                        menu.getCodeNm(),
                        menu.getCodeDc(),
                        menu.getMenuUrl(),
                        menu.getMenuIcon(),
                        menu.getUseAt(),
                        AdminLogMenuBaselineCatalog.ACTOR_ID
                );
            }
        }
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }
}
