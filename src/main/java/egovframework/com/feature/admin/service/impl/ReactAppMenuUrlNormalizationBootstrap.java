package egovframework.com.feature.admin.service.impl;

import egovframework.com.common.util.ReactPageUrlMapper;
import egovframework.com.feature.admin.dto.response.MenuInfoDTO;
import egovframework.com.feature.admin.service.AdminCodeManageService;
import egovframework.com.feature.admin.service.MenuInfoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReactAppMenuUrlNormalizationBootstrap {

    private static final String ACTOR_ID = "SYSTEM_BOOTSTRAP";
    private static final String MEMBER_REGISTER_MENU_CODE = "A0010102";
    private static final String MEMBER_REGISTER_MENU_NAME_KO = "신규 회원 등록";
    private static final String MEMBER_REGISTER_MENU_NAME_EN = "New Member Registration";
    private static final String MEMBER_REGISTER_MENU_URL = "/admin/member/register";
    private static final String MEMBER_REGISTER_MENU_ICON = "person_add";
    private static final String SYSTEM_MENU_MANAGEMENT_CODE = "A0060107";
    private static final String SYSTEM_MENU_MANAGEMENT_NAME_KO = "메뉴 관리";
    private static final String SYSTEM_MENU_MANAGEMENT_NAME_EN = "Menu Management";
    private static final String SYSTEM_MENU_MANAGEMENT_URL = "/admin/system/menu";
    private static final String SYSTEM_MENU_MANAGEMENT_ICON = "account_tree";
    private static final List<ManagedMenuDefinition> KNOWN_MANAGED_MENUS = Arrays.asList(
            new ManagedMenuDefinition(
                    MEMBER_REGISTER_MENU_CODE,
                    MEMBER_REGISTER_MENU_NAME_KO,
                    MEMBER_REGISTER_MENU_NAME_EN,
                    MEMBER_REGISTER_MENU_URL,
                    MEMBER_REGISTER_MENU_ICON
            ),
            new ManagedMenuDefinition(
                    "AMENU_MEMBER_APPROVE",
                    "회원 승인",
                    "Member Approval",
                    "/admin/member/approve",
                    "how_to_reg"
            ),
            new ManagedMenuDefinition(
                    "AMENU_COMPANY_APPROVE",
                    "회원사 승인",
                    "Company Approval",
                    "/admin/member/company-approve",
                    "domain_verification"
            ),
            new ManagedMenuDefinition(
                    SYSTEM_MENU_MANAGEMENT_CODE,
                    SYSTEM_MENU_MANAGEMENT_NAME_KO,
                    SYSTEM_MENU_MANAGEMENT_NAME_EN,
                    SYSTEM_MENU_MANAGEMENT_URL,
                    SYSTEM_MENU_MANAGEMENT_ICON
            )
    );

    private final MenuInfoService menuInfoService;
    private final AdminCodeManageService adminCodeManageService;

    @EventListener(ApplicationReadyEvent.class)
    public void normalizeLegacyReactMenuUrls() {
        try {
            List<MenuInfoDTO> rows = new ArrayList<>();
            rows.addAll(menuInfoService.selectMenuTreeList("AMENU1"));
            rows.addAll(menuInfoService.selectMenuTreeList("HMENU1"));

            int updated = 0;
            for (MenuInfoDTO row : rows) {
                if (reconcileKnownManagedMenu(row)) {
                    updated++;
                    continue;
                }

                String rawUrl = safe(row.getMenuUrl());
                if (!rawUrl.contains("/app?route=")) {
                    continue;
                }

                String canonicalUrl = ReactPageUrlMapper.toCanonicalMenuUrl(rawUrl);
                if (canonicalUrl.isEmpty() || canonicalUrl.equals(rawUrl)) {
                    continue;
                }

                adminCodeManageService.updatePageManagement(
                        safe(row.getCode()),
                        safe(row.getCodeNm()),
                        safe(row.getCodeDc()),
                        canonicalUrl,
                        safe(row.getMenuIcon()),
                        defaultUseAt(row.getUseAt()),
                        ACTOR_ID
                );
                updated++;
            }

            log.info("React app menu URL normalization completed. updated={}", updated);
        } catch (Exception e) {
            log.error("Failed to normalize legacy react menu URLs.", e);
        }
    }

    private boolean reconcileKnownManagedMenu(MenuInfoDTO row) throws Exception {
        String code = safe(row.getCode());
        ManagedMenuDefinition managedMenu = findManagedMenu(code);
        if (managedMenu == null) {
            return false;
        }

        boolean needsUpdate =
                !managedMenu.menuUrl.equals(safe(row.getMenuUrl()))
                        || !managedMenu.menuNameKo.equals(safe(row.getCodeNm()))
                        || !managedMenu.menuNameEn.equals(safe(row.getCodeDc()))
                        || !managedMenu.menuIcon.equals(safe(row.getMenuIcon()));
        if (!needsUpdate) {
            return false;
        }

        adminCodeManageService.updatePageManagement(
                managedMenu.menuCode,
                managedMenu.menuNameKo,
                managedMenu.menuNameEn,
                managedMenu.menuUrl,
                managedMenu.menuIcon,
                defaultUseAt(row.getUseAt()),
                ACTOR_ID
        );
        return true;
    }

    private ManagedMenuDefinition findManagedMenu(String code) {
        for (ManagedMenuDefinition managedMenu : KNOWN_MANAGED_MENUS) {
            if (managedMenu.menuCode.equalsIgnoreCase(code)) {
                return managedMenu;
            }
        }
        return null;
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private String defaultUseAt(String value) {
        String normalized = safe(value);
        return normalized.isEmpty() ? "Y" : normalized;
    }

    private static final class ManagedMenuDefinition {
        private final String menuCode;
        private final String menuNameKo;
        private final String menuNameEn;
        private final String menuUrl;
        private final String menuIcon;

        private ManagedMenuDefinition(String menuCode, String menuNameKo, String menuNameEn, String menuUrl, String menuIcon) {
            this.menuCode = menuCode;
            this.menuNameKo = menuNameKo;
            this.menuNameEn = menuNameEn;
            this.menuUrl = menuUrl;
            this.menuIcon = menuIcon;
        }
    }
}
