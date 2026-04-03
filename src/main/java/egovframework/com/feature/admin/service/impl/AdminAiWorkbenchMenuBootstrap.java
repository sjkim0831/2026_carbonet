package egovframework.com.feature.admin.service.impl;

import egovframework.com.feature.admin.dto.request.CodexProvisionRequest;
import egovframework.com.feature.admin.dto.response.CodexProvisionResponse;
import egovframework.com.feature.admin.mapper.AuthGroupManageMapper;
import egovframework.com.feature.admin.service.AdminCodeManageService;
import egovframework.com.feature.admin.service.CodexProvisioningService;
import egovframework.com.feature.admin.service.MenuFeatureManageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminAiWorkbenchMenuBootstrap {

    private static final String DOMAIN_CODE = "A190";
    private static final String DOMAIN_NAME = "AI 운영";
    private static final String DOMAIN_NAME_EN = "AI Operations";
    private static final String GROUP_CODE = "A19001";
    private static final String GROUP_NAME = "AI 작업센터";
    private static final String GROUP_NAME_EN = "AI Workbench";
    private static final String HELP_MENU_CODE = "A1900101";
    private static final String SR_MENU_CODE = "A1900102";
    private static final String CODEX_MENU_CODE = "A1900103";
    private static final String WBS_MENU_CODE = "A1900104";
    private static final String NEW_PAGE_MENU_CODE = "A1900106";
    private static final String SYSTEM_AUDIT_LOG_MENU_CODE = "A0060303";
    private static final String ACTOR_ID = "SYSTEM_BOOTSTRAP";
    private static final List<String> STANDARD_ADMIN_ROLES = Arrays.asList(
            "ROLE_SYSTEM_MASTER",
            "ROLE_SYSTEM_ADMIN",
            "ROLE_ADMIN",
            "ROLE_OPERATION_ADMIN"
    );

    private final CodexProvisioningService codexProvisioningService;
    private final AuthGroupManageMapper authGroupManageMapper;
    private final AdminCodeManageService adminCodeManageService;
    private final MenuFeatureManageService menuFeatureManageService;

    @EventListener(ApplicationReadyEvent.class)
    public void ensureAdminAiWorkbenchMenus() {
        provision("help-management", buildHelpManagementRequest());
        provision("sr-workbench", buildSrWorkbenchRequest());
        provision("codex-request", buildCodexRequest());
        provision("wbs-management", buildWbsManagementRequest());
        provision("new-page", buildNewPageRequest());
        cleanupLegacyMenus();
    }

    private void provision(String registrationId, CodexProvisionRequest request) {
        try {
            CodexProvisionResponse response = codexProvisioningService.provision(request);
            reconcileStandardRoleAssignments(registrationId);
            log.info("Admin AI workbench menu provisioned. registrationId={}, created={}, existing={}, skipped={}",
                    registrationId, response.getCreatedCount(), response.getExistingCount(), response.getSkippedCount());
        } catch (Exception e) {
            log.error("Failed to provision admin AI workbench menu. registrationId={}", registrationId, e);
        }
    }

    private CodexProvisionRequest buildHelpManagementRequest() {
        CodexProvisionRequest request = baseRequest("BOOTSTRAP-HELP-MANAGEMENT", "/admin/system/help-management");
        request.setPage(pageRequest(
                HELP_MENU_CODE,
                "화면 도움말 운영",
                "Help Management",
                "/admin/system/help-management",
                "help_center"
        ));
        request.setFeatures(Arrays.asList(
                featureRequest(HELP_MENU_CODE, HELP_MENU_CODE + "_VIEW", "화면 도움말 조회", "View Help Management", "Help management page access"),
                featureRequest(HELP_MENU_CODE, HELP_MENU_CODE + "_EDIT", "화면 도움말 저장", "Edit Help Management", "Help management save permission")
        ));
        request.setAuthors(Arrays.asList(
                authorRequest("ROLE_SYSTEM_MASTER", "시스템 마스터", "System Master", HELP_MENU_CODE + "_VIEW", HELP_MENU_CODE + "_EDIT"),
                authorRequest("ROLE_SYSTEM_ADMIN", "시스템 관리자", "System Administrator", HELP_MENU_CODE + "_VIEW", HELP_MENU_CODE + "_EDIT"),
                authorRequest("ROLE_ADMIN", "일반 관리자", "General Administrator", HELP_MENU_CODE + "_VIEW", HELP_MENU_CODE + "_EDIT")
        ));
        return request;
    }

    private CodexProvisionRequest buildSrWorkbenchRequest() {
        CodexProvisionRequest request = baseRequest("BOOTSTRAP-SR-WORKBENCH", "/admin/system/sr-workbench");
        request.setPage(pageRequest(
                SR_MENU_CODE,
                "SR 워크벤치",
                "SR Workbench",
                "/admin/system/sr-workbench",
                "integration_instructions"
        ));
        request.setFeatures(Arrays.asList(
                featureRequest(SR_MENU_CODE, SR_MENU_CODE + "_VIEW", "SR 워크벤치 조회", "View SR Workbench", "SR workbench page access"),
                featureRequest(SR_MENU_CODE, SR_MENU_CODE + "_CREATE", "SR 티켓 발행", "Create SR Ticket", "SR ticket creation"),
                featureRequest(SR_MENU_CODE, SR_MENU_CODE + "_APPROVE", "SR 승인 처리", "Approve SR Ticket", "SR approval"),
                featureRequest(SR_MENU_CODE, SR_MENU_CODE + "_PREPARE", "SR 실행 준비", "Prepare SR Execution", "SR execution preparation"),
                featureRequest(SR_MENU_CODE, SR_MENU_CODE + "_EXECUTE", "SR Codex 실행", "Execute SR Codex", "SR Codex execution")
        ));
        request.setAuthors(Arrays.asList(
                authorRequest("ROLE_SYSTEM_MASTER", "시스템 마스터", "System Master",
                        SR_MENU_CODE + "_VIEW", SR_MENU_CODE + "_CREATE", SR_MENU_CODE + "_APPROVE", SR_MENU_CODE + "_PREPARE", SR_MENU_CODE + "_EXECUTE"),
                authorRequest("ROLE_SYSTEM_ADMIN", "시스템 관리자", "System Administrator",
                        SR_MENU_CODE + "_VIEW", SR_MENU_CODE + "_CREATE", SR_MENU_CODE + "_APPROVE", SR_MENU_CODE + "_PREPARE", SR_MENU_CODE + "_EXECUTE"),
                authorRequest("ROLE_ADMIN", "일반 관리자", "General Administrator",
                        SR_MENU_CODE + "_VIEW", SR_MENU_CODE + "_CREATE")
        ));
        return request;
    }

    private CodexProvisionRequest buildCodexRequest() {
        CodexProvisionRequest request = baseRequest("BOOTSTRAP-CODEX-REQUEST", "/admin/system/codex-request");
        request.setPage(pageRequest(
                CODEX_MENU_CODE,
                "Codex 요청",
                "Codex Request",
                "/admin/system/codex-request",
                "smart_toy"
        ));
        request.setFeatures(Arrays.asList(
                featureRequest(CODEX_MENU_CODE, CODEX_MENU_CODE + "_VIEW", "Codex 요청 조회", "View Codex Request", "Codex request page access"),
                featureRequest(CODEX_MENU_CODE, CODEX_MENU_CODE + "_EXECUTE", "Codex 요청 실행", "Execute Codex Request", "Codex request execution permission")
        ));
        request.setAuthors(Arrays.asList(
                authorRequest("ROLE_SYSTEM_MASTER", "시스템 마스터", "System Master", CODEX_MENU_CODE + "_VIEW", CODEX_MENU_CODE + "_EXECUTE"),
                authorRequest("ROLE_SYSTEM_ADMIN", "시스템 관리자", "System Administrator", CODEX_MENU_CODE + "_VIEW", CODEX_MENU_CODE + "_EXECUTE"),
                authorRequest("ROLE_ADMIN", "일반 관리자", "General Administrator", CODEX_MENU_CODE + "_VIEW", CODEX_MENU_CODE + "_EXECUTE")
        ));
        return request;
    }

    private CodexProvisionRequest buildWbsManagementRequest() {
        CodexProvisionRequest request = baseRequest("BOOTSTRAP-WBS-MANAGEMENT-AI", "/admin/system/wbs-management");
        request.setPage(pageRequest(
                WBS_MENU_CODE,
                "WBS 관리",
                "WBS Management",
                "/admin/system/wbs-management",
                "calendar_month"
        ));
        request.setFeatures(Arrays.asList(
                featureRequest(WBS_MENU_CODE, WBS_MENU_CODE + "_VIEW", "WBS 관리 조회", "View WBS Management", "WBS management page access"),
                featureRequest(WBS_MENU_CODE, WBS_MENU_CODE + "_EDIT", "WBS 관리 편집", "Edit WBS Management", "WBS schedule save permission")
        ));
        request.setAuthors(Arrays.asList(
                authorRequest("ROLE_SYSTEM_MASTER", "시스템 마스터", "System Master", WBS_MENU_CODE + "_VIEW", WBS_MENU_CODE + "_EDIT"),
                authorRequest("ROLE_SYSTEM_ADMIN", "시스템 관리자", "System Administrator", WBS_MENU_CODE + "_VIEW", WBS_MENU_CODE + "_EDIT"),
                authorRequest("ROLE_ADMIN", "일반 관리자", "General Administrator", WBS_MENU_CODE + "_VIEW", WBS_MENU_CODE + "_EDIT")
        ));
        return request;
    }

    private CodexProvisionRequest buildNewPageRequest() {
        CodexProvisionRequest request = baseRequest("BOOTSTRAP-NEW-PAGE", "/admin/system/new-page");
        request.setPage(pageRequest(
                NEW_PAGE_MENU_CODE,
                "새 페이지",
                "New Page",
                "/admin/system/new-page",
                "note_stack"
        ));
        request.setFeatures(Collections.singletonList(
                featureRequest(NEW_PAGE_MENU_CODE, NEW_PAGE_MENU_CODE + "_VIEW", "새 페이지 조회", "View New Page", "New page scaffold access")
        ));
        request.setAuthors(Arrays.asList(
                authorRequest("ROLE_SYSTEM_MASTER", "시스템 마스터", "System Master", NEW_PAGE_MENU_CODE + "_VIEW"),
                authorRequest("ROLE_SYSTEM_ADMIN", "시스템 관리자", "System Administrator", NEW_PAGE_MENU_CODE + "_VIEW"),
                authorRequest("ROLE_ADMIN", "일반 관리자", "General Administrator", NEW_PAGE_MENU_CODE + "_VIEW")
        ));
        return request;
    }

    private void reconcileStandardRoleAssignments(String registrationId) {
        Map<String, Set<String>> desiredByRole = buildDesiredFeatureCodesByRole();
        Set<String> targetFeatureCodes = new LinkedHashSet<>();
        for (Set<String> featureCodes : desiredByRole.values()) {
            targetFeatureCodes.addAll(featureCodes);
        }

        int inserted = 0;
        int deleted = 0;
        for (String authorCode : STANDARD_ADMIN_ROLES) {
            Set<String> desired = desiredByRole.getOrDefault(normalize(authorCode), Collections.emptySet());
            for (String featureCode : targetFeatureCodes) {
                boolean exists = authGroupManageMapper.countAuthorFeaturePermission(authorCode, featureCode) > 0;
                boolean shouldExist = desired.contains(featureCode);
                if (shouldExist && !exists) {
                    Map<String, String> params = new LinkedHashMap<>();
                    params.put("authorCode", authorCode);
                    params.put("featureCode", featureCode);
                    authGroupManageMapper.insertAuthorFeatureRelation(params);
                    inserted++;
                } else if (!shouldExist && exists) {
                    authGroupManageMapper.deleteAuthorFeatureRelation(authorCode, featureCode);
                    deleted++;
                }
            }
        }

        log.info("Admin AI workbench role assignments reconciled. registrationId={}, inserted={}, deleted={}, targetFeatures={}",
                registrationId, inserted, deleted, targetFeatureCodes.size());
    }

    private Map<String, Set<String>> buildDesiredFeatureCodesByRole() {
        Map<String, Set<String>> desired = new LinkedHashMap<>();
        desired.put("ROLE_SYSTEM_MASTER", linkedSet(
                HELP_MENU_CODE + "_VIEW",
                HELP_MENU_CODE + "_EDIT",
                SR_MENU_CODE + "_VIEW",
                SR_MENU_CODE + "_CREATE",
                SR_MENU_CODE + "_APPROVE",
                SR_MENU_CODE + "_PREPARE",
                SR_MENU_CODE + "_EXECUTE",
                CODEX_MENU_CODE + "_VIEW",
                CODEX_MENU_CODE + "_EXECUTE",
                WBS_MENU_CODE + "_VIEW",
                WBS_MENU_CODE + "_EDIT",
                NEW_PAGE_MENU_CODE + "_VIEW",
                SYSTEM_AUDIT_LOG_MENU_CODE + "_VIEW"
        ));
        desired.put("ROLE_SYSTEM_ADMIN", linkedSet(
                HELP_MENU_CODE + "_VIEW",
                HELP_MENU_CODE + "_EDIT",
                SR_MENU_CODE + "_VIEW",
                SR_MENU_CODE + "_CREATE",
                SR_MENU_CODE + "_APPROVE",
                SR_MENU_CODE + "_PREPARE",
                SR_MENU_CODE + "_EXECUTE",
                CODEX_MENU_CODE + "_VIEW",
                CODEX_MENU_CODE + "_EXECUTE",
                WBS_MENU_CODE + "_VIEW",
                WBS_MENU_CODE + "_EDIT",
                NEW_PAGE_MENU_CODE + "_VIEW",
                SYSTEM_AUDIT_LOG_MENU_CODE + "_VIEW"
        ));
        desired.put("ROLE_ADMIN", linkedSet(
                HELP_MENU_CODE + "_VIEW",
                HELP_MENU_CODE + "_EDIT",
                SR_MENU_CODE + "_VIEW",
                SR_MENU_CODE + "_CREATE",
                CODEX_MENU_CODE + "_VIEW",
                CODEX_MENU_CODE + "_EXECUTE",
                WBS_MENU_CODE + "_VIEW",
                WBS_MENU_CODE + "_EDIT",
                NEW_PAGE_MENU_CODE + "_VIEW",
                SYSTEM_AUDIT_LOG_MENU_CODE + "_VIEW"
        ));
        desired.put("ROLE_OPERATION_ADMIN", Collections.emptySet());
        return desired;
    }

    private void cleanupLegacyMenus() {
        cleanupLegacyMenu("A006", "A0060119", "A0060119_VIEW", "A0060119_EDIT");
        cleanupLegacyMenu("A101", "A1010201", "A1010201_VIEW");
    }

    private void cleanupLegacyMenu(String codeId, String menuCode, String... featureCodes) {
        try {
            for (String featureCode : featureCodes) {
                authGroupManageMapper.deleteAuthorFeatureRelationsByFeatureCode(featureCode);
                menuFeatureManageService.deleteMenuFeature(featureCode);
            }
            adminCodeManageService.deletePageManagement(codeId, menuCode);
            log.info("Legacy AI/system menu cleaned up. codeId={}, menuCode={}, featureCount={}", codeId, menuCode, featureCodes == null ? 0 : featureCodes.length);
        } catch (Exception e) {
            log.warn("Failed to clean up legacy AI/system menu. codeId={}, menuCode={}", codeId, menuCode, e);
        }
    }

    private Set<String> linkedSet(String... values) {
        Set<String> items = new LinkedHashSet<>();
        if (values == null) {
            return items;
        }
        for (String value : values) {
            String normalized = normalize(value);
            if (!normalized.isEmpty()) {
                items.add(normalized);
            }
        }
        return items;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }

    private CodexProvisionRequest baseRequest(String requestId, String targetApiPath) {
        CodexProvisionRequest request = new CodexProvisionRequest();
        request.setRequestId(requestId);
        request.setActorId(ACTOR_ID);
        request.setTargetApiPath(targetApiPath);
        request.setMenuType("ADMIN");
        request.setReloadSecurityMetadata(true);
        return request;
    }

    private CodexProvisionRequest.PageRequest pageRequest(String menuCode, String nameKo, String nameEn,
                                                          String menuUrl, String menuIcon) {
        CodexProvisionRequest.PageRequest page = new CodexProvisionRequest.PageRequest();
        page.setDomainCode(DOMAIN_CODE);
        page.setDomainName(DOMAIN_NAME);
        page.setDomainNameEn(DOMAIN_NAME_EN);
        page.setGroupCode(GROUP_CODE);
        page.setGroupName(GROUP_NAME);
        page.setGroupNameEn(GROUP_NAME_EN);
        page.setCode(menuCode);
        page.setCodeNm(nameKo);
        page.setCodeDc(nameEn);
        page.setMenuUrl(menuUrl);
        page.setMenuIcon(menuIcon);
        page.setUseAt("Y");
        return page;
    }

    private CodexProvisionRequest.FeatureRequest featureRequest(String menuCode, String featureCode, String nameKo,
                                                                String nameEn, String description) {
        CodexProvisionRequest.FeatureRequest feature = new CodexProvisionRequest.FeatureRequest();
        feature.setMenuCode(menuCode);
        feature.setFeatureCode(featureCode);
        feature.setFeatureNm(nameKo);
        feature.setFeatureNmEn(nameEn);
        feature.setFeatureDc(description);
        feature.setUseAt("Y");
        return feature;
    }

    private CodexProvisionRequest.AuthorRequest authorRequest(String authorCode, String authorNm, String authorDc,
                                                              String... featureCodes) {
        CodexProvisionRequest.AuthorRequest author = new CodexProvisionRequest.AuthorRequest();
        author.setAuthorCode(authorCode);
        author.setAuthorNm(authorNm);
        author.setAuthorDc(authorDc);
        author.setFeatureCodes(Arrays.asList(featureCodes));
        return author;
    }
}
