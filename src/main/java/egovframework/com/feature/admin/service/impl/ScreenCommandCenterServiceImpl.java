package egovframework.com.feature.admin.service.impl;

import egovframework.com.common.trace.UiManifestRegistryService;
import egovframework.com.common.util.ReactPageUrlMapper;
import egovframework.com.feature.admin.dto.response.MenuInfoDTO;
import egovframework.com.feature.admin.model.vo.FeatureCatalogItemVO;
import egovframework.com.feature.admin.service.AuthGroupManageService;
import egovframework.com.feature.admin.service.MenuInfoService;
import egovframework.com.feature.admin.service.ScreenCommandCenterService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service("screenCommandCenterService")
public class ScreenCommandCenterServiceImpl implements ScreenCommandCenterService {

    private final AuthGroupManageService authGroupManageService;
    private final MenuInfoService menuInfoService;
    private final UiManifestRegistryService uiManifestRegistryService;

    public ScreenCommandCenterServiceImpl(AuthGroupManageService authGroupManageService,
                                          MenuInfoService menuInfoService,
                                          UiManifestRegistryService uiManifestRegistryService) {
        this.authGroupManageService = authGroupManageService;
        this.menuInfoService = menuInfoService;
        this.uiManifestRegistryService = uiManifestRegistryService;
    }

    @Override
    public Map<String, Object> getScreenCommandPage(String pageId) throws Exception {
        String normalizedPageId = canonicalPageId(normalize(pageId));
        if (normalizedPageId.isEmpty()) {
            normalizedPageId = "member-list";
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("selectedPageId", normalizedPageId);
        response.put("pages", buildPageOptions());

        Map<String, Object> page = buildPage(normalizedPageId);
        decoratePageMetadata(normalizedPageId, page);
        String routePath = stringValue(page.get("routePath"));
        String menuLookupUrl = resolveMenuLookupUrl(normalizedPageId, routePath);
        String menuCode = firstNonBlank(
                safeSelectMenuCode(menuLookupUrl),
                safeSelectMenuCode(routePath),
                stringValue(page.get("menuCode"))
        );

        page.put("menuLookupUrl", menuLookupUrl);
        page.put("menuCode", menuCode);
        page.put("menuPermission", buildMenuPermission(menuCode, menuLookupUrl, routePath));
        page.put("manifestRegistry", uiManifestRegistryService.syncPageRegistry(page));
        response.put("page", page);
        return response;
    }

    private List<Map<String, Object>> buildPageOptions() {
        List<Map<String, Object>> pages = new ArrayList<>();
        Set<String> knownPageIds = new LinkedHashSet<>();
        addStaticPageOption(pages, knownPageIds, "home", "홈", "/home", "HMENU_HOME", "home");
        addStaticPageOption(pages, knownPageIds, "admin-home", "관리자 홈", "/admin/", "AMENU_ADMIN_HOME", "admin");
        addStaticPageOption(pages, knownPageIds, "admin-login", "관리자 로그인", "/admin/login/loginView", "AMENU_ADMIN_LOGIN", "admin");
        addStaticPageOption(pages, knownPageIds, "signin-login", "로그인", "/signin/loginView", "HMENU_SIGNIN_LOGIN", "home");
        addStaticPageOption(pages, knownPageIds, "signin-auth-choice", "인증 수단 선택", "/signin/authChoice", "HMENU_SIGNIN_AUTH_CHOICE", "home");
        addStaticPageOption(pages, knownPageIds, "signin-find-id", "아이디 찾기", "/signin/findId", "HMENU_SIGNIN_FIND_ID", "home");
        addStaticPageOption(pages, knownPageIds, "signin-find-id-result", "아이디 찾기 결과", "/signin/findId/result", "HMENU_SIGNIN_FIND_ID_RESULT", "home");
        addStaticPageOption(pages, knownPageIds, "signin-find-password", "비밀번호 찾기", "/signin/findPassword", "HMENU_SIGNIN_FIND_PASSWORD", "home");
        addStaticPageOption(pages, knownPageIds, "signin-find-password-result", "비밀번호 찾기 완료", "/signin/findPassword/result", "HMENU_SIGNIN_FINDPW_RESULT", "home");
        addStaticPageOption(pages, knownPageIds, "signin-forbidden", "접근 거부", "/signin/loginForbidden", "HMENU_SIGNIN_FORBIDDEN", "home");
        addStaticPageOption(pages, knownPageIds, "mypage", "마이페이지", "/mypage", "HMENU_MYPAGE", "home");
        addStaticPageOption(pages, knownPageIds, "platform-studio", "플랫폼 스튜디오", "/admin/system/platform-studio", "A0060109", "admin");
        addStaticPageOption(pages, knownPageIds, "screen-elements-management", "화면 요소 관리", "/admin/system/screen-elements-management", "A0060110", "admin");
        addStaticPageOption(pages, knownPageIds, "event-management-console", "이벤트 관리", "/admin/system/event-management-console", "A0060111", "admin");
        addStaticPageOption(pages, knownPageIds, "function-management-console", "함수 콘솔", "/admin/system/function-management-console", "A0060112", "admin");
        addStaticPageOption(pages, knownPageIds, "api-management-console", "API 관리", "/admin/system/api-management-console", "A0060113", "admin");
        addStaticPageOption(pages, knownPageIds, "controller-management-console", "컨트롤러 관리", "/admin/system/controller-management-console", "A0060114", "admin");
        addStaticPageOption(pages, knownPageIds, "db-table-management", "DB 테이블 관리", "/admin/system/db-table-management", "A0060115", "admin");
        addStaticPageOption(pages, knownPageIds, "column-management-console", "컬럼 관리", "/admin/system/column-management-console", "A0060116", "admin");
        addStaticPageOption(pages, knownPageIds, "automation-studio", "자동화 스튜디오", "/admin/system/automation-studio", "A0060117", "admin");
        addStaticPageOption(pages, knownPageIds, "backup-config", "백업 설정", "/admin/system/backup_config", "A0060401", "admin");
        addStaticPageOption(pages, knownPageIds, "backup-execution", "백업 실행", "/admin/system/backup", "A0060402", "admin");
        addStaticPageOption(pages, knownPageIds, "restore-execution", "복구 실행", "/admin/system/restore", "A0060403", "admin");
        addStaticPageOption(pages, knownPageIds, "version-management", "버전 관리", "/admin/system/version", "A0060404", "admin");
        addStaticPageOption(pages, knownPageIds, "wbs-management", "WBS 관리", "/admin/system/wbs-management", "A1900104", "admin");
        addManagedMenuPageOptions(pages, knownPageIds, "AMENU1");
        addManagedMenuPageOptions(pages, knownPageIds, "HMENU1");
        for (Map<String, Object> registryPage : uiManifestRegistryService.selectActivePageOptions()) {
            String pageId = canonicalPageId(stringValue(registryPage.get("pageId")));
            if (!pageId.isEmpty() && !knownPageIds.contains(pageId)) {
                registryPage.put("pageId", pageId);
                pages.add(registryPage);
                knownPageIds.add(pageId);
            }
        }
        return pages;
    }

    private Map<String, Object> buildPage(String pageId) {
        switch (pageId) {
            case "home":
                return buildHomePage();
            case "admin-home":
                return buildAdminHomePage();
            case "admin-login":
                return buildAdminLoginPage();
            case "auth-group":
                return buildAuthGroupPage();
            case "auth-change":
                return buildAuthChangePage();
            case "dept-role":
                return buildDeptRolePage();
            case "admin-list":
                return buildAdminListPage();
            case "company-approve":
                return buildCompanyApprovePage();
            case "signin-login":
                return buildSigninLoginPage();
            case "signin-auth-choice":
                return buildSigninAuthChoicePage();
            case "signin-find-id":
                return buildSigninFindIdPage();
            case "signin-find-id-result":
                return buildSigninFindIdResultPage();
            case "signin-find-password":
                return buildSigninFindPasswordPage();
            case "signin-find-password-result":
                return buildSigninFindPasswordResultPage();
            case "signin-forbidden":
                return buildSigninForbiddenPage();
            case "member-approve":
                return buildMemberApprovePage();
            case "company-list":
                return buildCompanyListPage();
            case "member-detail":
                return buildMemberDetailPage();
            case "member-edit":
                return buildMemberEditPage();
            case "company-detail":
                return buildCompanyDetailPage();
            case "company-account":
                return buildCompanyAccountPage();
            case "join-company-register":
                return buildJoinCompanyRegisterPage();
            case "join-company-register-complete":
                return buildJoinCompanyRegisterCompletePage();
            case "join-company-status":
                return buildJoinCompanyStatusPage();
            case "join-company-status-guide":
                return buildJoinCompanyStatusGuidePage();
            case "join-company-status-detail":
                return buildJoinCompanyStatusDetailPage();
            case "join-company-reapply":
                return buildJoinCompanyReapplyPage();
            case "join-terms":
                return buildJoinTermsPage();
            case "join-auth":
                return buildJoinAuthPage();
            case "join-info":
                return buildJoinInfoPage();
            case "join-complete":
                return buildJoinCompletePage();
            case "mypage":
                return buildMypagePage();
            case "join-wizard":
                return buildJoinWizardPage();
            case "observability":
                return buildObservabilityPage();
            case "error-log":
                return buildErrorLogPage();
            case "help-management":
                return buildHelpManagementPage();
            case "codex-request":
                return buildCodexRequestPage();
            case "full-stack-management":
                return buildFullStackManagementPage();
            case "platform-studio":
                return buildPlatformStudioPage("platform-studio", "플랫폼 스튜디오", "/admin/system/platform-studio", "A0060109", "overview");
            case "screen-elements-management":
                return buildPlatformStudioPage("screen-elements-management", "화면 요소 관리", "/admin/system/screen-elements-management", "A0060110", "surfaces");
            case "event-management-console":
                return buildPlatformStudioPage("event-management-console", "이벤트 관리", "/admin/system/event-management-console", "A0060111", "events");
            case "function-management-console":
                return buildPlatformStudioPage("function-management-console", "함수 콘솔", "/admin/system/function-management-console", "A0060112", "functions");
            case "api-management-console":
                return buildPlatformStudioPage("api-management-console", "API 관리", "/admin/system/api-management-console", "A0060113", "apis");
            case "controller-management-console":
                return buildPlatformStudioPage("controller-management-console", "컨트롤러 관리", "/admin/system/controller-management-console", "A0060114", "controllers");
            case "db-table-management":
                return buildPlatformStudioPage("db-table-management", "DB 테이블 관리", "/admin/system/db-table-management", "A0060115", "db");
            case "column-management-console":
                return buildPlatformStudioPage("column-management-console", "컬럼 관리", "/admin/system/column-management-console", "A0060116", "columns");
            case "automation-studio":
                return buildPlatformStudioPage("automation-studio", "자동화 스튜디오", "/admin/system/automation-studio", "A0060117", "automation");
            case "backup-config":
                return buildBackupConfigPage();
            case "backup-execution":
                return buildBackupSubPage("backup-execution", "백업 실행", "/admin/system/backup", "A0060402", "execution");
            case "restore-execution":
                return buildBackupSubPage("restore-execution", "복구 실행", "/admin/system/restore", "A0060403", "restore");
            case "version-management":
                return buildBackupSubPage("version-management", "버전 관리", "/admin/system/version", "A0060404", "version");
            case "environment-management":
                return buildEnvironmentManagementPage();
            case "wbs-management":
                return buildWbsManagementPage();
            case "sr-workbench":
                return buildSrWorkbenchPage();
            case "member-list":
                return buildMemberListPage();
            default:
                return buildRegistryDraftPage(pageId);
        }
    }

    private Map<String, Object> buildRegistryDraftPage(String pageId) {
        String normalizedPageId = canonicalPageId(pageId);
        Map<String, Object> manifestRegistry = uiManifestRegistryService.getPageRegistry(normalizedPageId);
        MenuInfoDTO menuInfo = findManagedMenuByPageId(normalizedPageId);
        String routePath = firstNonBlank(stringValue(manifestRegistry.get("routePath")), menuInfo == null ? "" : stringValue(menuInfo.getMenuUrl()));
        String menuCode = firstNonBlank(stringValue(manifestRegistry.get("menuCode")), menuInfo == null ? "" : stringValue(menuInfo.getCode()));
        String domainCode = firstNonBlank(stringValue(manifestRegistry.get("domainCode")), inferDomainCode(routePath, menuCode));
        String pageName = firstNonBlank(stringValue(manifestRegistry.get("pageName")), menuInfo == null ? "" : stringValue(menuInfo.getCodeNm()), normalizedPageId);
        if (stringValue(manifestRegistry.get("pageId")).isEmpty()) {
            manifestRegistry = uiManifestRegistryService.ensureManagedPageDraft(normalizedPageId, pageName, routePath, menuCode, domainCode);
        }
        Map<String, Object> page = pageOption(normalizedPageId, pageName, routePath, menuCode, domainCode);
        List<Map<String, Object>> events = buildDraftEvents(pageName, routePath, menuCode, domainCode);
        List<Map<String, Object>> apis = buildDraftApis(pageName, routePath, menuCode, domainCode);
        List<Map<String, Object>> schemas = buildDraftSchemas(pageName, routePath, menuCode, domainCode);
        page.put("summary", "메뉴 생성 시 자동 등록된 draft manifest 기반 화면입니다.");
        page.put("source", "UI_PAGE_MANIFEST draft registry");
        page.put("surfaces", buildRegistrySurfaces(manifestRegistry, routePath, domainCode));
        page.put("events", events);
        page.put("apis", apis);
        page.put("schemas", schemas);
        page.put("commonCodeGroups", buildDraftCodeGroups(routePath, menuCode, domainCode));
        page.put("changeTargets", defaultChangeTargets());
        page.put("manifestRegistry", manifestRegistry);
        return page;
    }

    private List<Map<String, Object>> buildRegistrySurfaces(Map<String, Object> manifestRegistry,
                                                            String routePath,
                                                            String domainCode) {
        List<Map<String, Object>> surfaces = new ArrayList<>();
        for (Map<String, Object> component : safeMapList(manifestRegistry.get("components"))) {
            String instanceKey = firstNonBlank(stringValue(component.get("instanceKey")), stringValue(component.get("componentId")));
            String layoutZone = firstNonBlank(stringValue(component.get("layoutZone")), "content");
            surfaces.add(surface(
                    instanceKey,
                    firstNonBlank(stringValue(component.get("componentName")), instanceKey),
                    firstNonBlank(stringValue(component.get("designReference")), "[data-help-id=\"" + instanceKey + "\"]"),
                    stringValue(component.get("componentId")),
                    layoutZone,
                    buildDraftSurfaceEventIds(layoutZone, routePath, domainCode),
                    firstNonBlank(stringValue(component.get("conditionalRuleSummary")), "자동 생성된 draft manifest component")
            ));
        }
        if (surfaces.isEmpty()) {
            surfaces.add(surface("draft-page-content", "Draft Page Content", "[data-help-id=\"draft-page-content\"]",
                    "ManagedPageContent", "content", buildDraftSurfaceEventIds("content", routePath, domainCode),
                    "자동 생성된 기본 draft content"));
        }
        return surfaces;
    }

    private void addStaticPageOption(List<Map<String, Object>> pages,
                                     Set<String> knownPageIds,
                                     String pageId,
                                     String label,
                                     String routePath,
                                     String menuCode,
                                     String domainCode) {
        String normalizedPageId = canonicalPageId(pageId);
        if (normalizedPageId.isEmpty() || knownPageIds.contains(normalizedPageId)) {
            return;
        }
        pages.add(pageOption(normalizedPageId, label, routePath, menuCode, domainCode));
        knownPageIds.add(normalizedPageId);
    }

    private void addManagedMenuPageOptions(List<Map<String, Object>> pages,
                                           Set<String> knownPageIds,
                                           String codeId) {
        try {
            for (MenuInfoDTO menu : menuInfoService.selectMenuTreeList(codeId)) {
                if (menu == null) {
                    continue;
                }
                String menuCode = normalize(stringValue(menu.getCode())).toUpperCase(Locale.ROOT);
                String menuUrl = normalize(stringValue(menu.getMenuUrl()));
                if (menuCode.length() != 8 || menuUrl.isEmpty() || "#".equals(menuUrl)) {
                    continue;
                }
                String pageId = canonicalPageId(resolvePageIdForMenu(menuUrl, menuCode));
                if (pageId.isEmpty() || knownPageIds.contains(pageId)) {
                    continue;
                }
                pages.add(pageOption(
                        pageId,
                        firstNonBlank(stringValue(menu.getCodeNm()), pageId),
                        menuUrl,
                        menuCode,
                        inferDomainCode(menuUrl, menuCode)
                ));
                knownPageIds.add(pageId);
            }
        } catch (Exception ignored) {
            // Keep the screen-command catalog available even if menu metadata lookup fails.
        }
    }

    private MenuInfoDTO findManagedMenuByPageId(String pageId) {
        String normalizedPageId = canonicalPageId(pageId);
        for (String codeId : List.of("AMENU1", "HMENU1")) {
            try {
                for (MenuInfoDTO menu : menuInfoService.selectMenuTreeList(codeId)) {
                    if (menu == null) {
                        continue;
                    }
                    String menuCode = normalize(stringValue(menu.getCode())).toUpperCase(Locale.ROOT);
                    String menuUrl = normalize(stringValue(menu.getMenuUrl()));
                    if (menuCode.length() != 8 || menuUrl.isEmpty() || "#".equals(menuUrl)) {
                        continue;
                    }
                    if (normalizedPageId.equals(canonicalPageId(resolvePageIdForMenu(menuUrl, menuCode)))) {
                        return menu;
                    }
                }
            } catch (Exception ignored) {
                return null;
            }
        }
        return null;
    }

    private String resolvePageIdForMenu(String menuUrl, String menuCode) {
        String routeId = ReactPageUrlMapper.resolveRouteIdForPath(menuUrl);
        if (!routeId.isEmpty()) {
            return canonicalPageId(routeId);
        }
        if (!normalize(menuCode).isEmpty()) {
            return canonicalPageId(menuCode);
        }
        return canonicalPageId(menuUrl);
    }

    private String canonicalPageId(String value) {
        return normalize(value)
                .toLowerCase(Locale.ROOT)
                .replace('_', '-')
                .replaceAll("[^a-z0-9\\-]", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "");
    }

    private String inferDomainCode(String routePath, String menuCode) {
        String normalizedRoutePath = normalize(routePath);
        String normalizedMenuCode = normalize(menuCode).toUpperCase(Locale.ROOT);
        if (normalizedRoutePath.startsWith("/admin/") || normalizedMenuCode.startsWith("A")) {
            return "admin";
        }
        if (normalizedRoutePath.startsWith("/join/")) {
            return "join";
        }
        return "home";
    }

    private List<String> buildDraftSurfaceEventIds(String layoutZone, String routePath, String domainCode) {
        List<String> eventIds = new ArrayList<>();
        eventIds.add("draft-page-view");
        if ("actions".equalsIgnoreCase(layoutZone)) {
            eventIds.add("draft-page-search");
            eventIds.add("draft-page-open-dialog");
            eventIds.add("draft-page-save");
        } else if ("content".equalsIgnoreCase(layoutZone)) {
            eventIds.add("draft-page-row-select");
            if ("admin".equalsIgnoreCase(domainCode) || routePath.startsWith("/admin/")) {
                eventIds.add("draft-page-save");
            }
        } else if ("header".equalsIgnoreCase(layoutZone)) {
            eventIds.add("draft-page-search");
        }
        return eventIds;
    }

    private List<Map<String, Object>> buildDraftEvents(String pageName,
                                                       String routePath,
                                                       String menuCode,
                                                       String domainCode) {
        List<Map<String, Object>> events = new ArrayList<>();
        events.add(event("draft-page-view", pageName + " 화면 진입", "load", "loadDraftPage", routePath,
                Collections.singletonList("draft.page.view"),
                "자동 생성된 draft page의 기본 이동 이벤트입니다."));
        events.add(event("draft-page-search", pageName + " 조회 조건 변경", "change", "handleDraftFilterChange",
                "[data-help-id=\"managed-page-actions\"] form",
                Collections.singletonList("draft.page.search"),
                "목록/상세 화면 후보를 조회하기 위한 기본 검색 이벤트입니다."));
        events.add(event("draft-page-row-select", pageName + " 항목 선택", "click", "handleDraftRowSelect",
                "[data-help-id=\"managed-page-content\"] [data-row-id]",
                Collections.singletonList("draft.page.detail"),
                "선택한 항목 상세나 연결 메타데이터를 조회하기 위한 기본 선택 이벤트입니다."));
        events.add(event("draft-page-open-dialog", pageName + " 등록/수정 대화상자 열기", "click", "openDraftDialog",
                "[data-help-id=\"managed-page-actions\"] .secondary-button",
                Collections.emptyList(),
                "등록/수정 대화상자를 열거나 패널을 펼치는 기본 액션입니다."));
        events.add(event("draft-page-save", pageName + " 저장", "submit", "submitDraftSave",
                "[data-help-id=\"managed-page-content\"] form",
                Collections.singletonList("draft.page.save"),
                "화면 요소, 기능, 권한, 공통코드 후보를 저장하는 기본 submit 이벤트입니다."));

        enrichEvent(events, "draft-page-view",
                Arrays.asList(
                        field("routePath", "string", true, "route", "대상 화면 경로"),
                        field("menuCode", "string", false, "registry", "연결된 메뉴 코드"),
                        field("insttId", "string", false, "session/query", "비마스터 계정의 회사 범위")
                ),
                Arrays.asList(
                        field("pageId", "string", true, "json", "선택된 draft page id"),
                        field("manifestReady", "boolean", true, "json", "manifest registry 존재 여부"),
                        field("requiredViewFeatureCode", "string", false, "json", "기본 VIEW 기능 코드")
                ),
                buildDraftGuardConditions(domainCode),
                Arrays.asList("화면 요약 카드 갱신", "권한/기능/스키마 후보 메타데이터 로드")
        );
        enrichEvent(events, "draft-page-search",
                Arrays.asList(
                        field("searchKeyword", "string", false, "form", "검색 키워드"),
                        field("status", "string", false, "form", "상태/분류 필터"),
                        field("insttId", "string", false, "session/form", "회사 범위 필터")
                ),
                Arrays.asList(
                        field("resultCount", "number", true, "state", "조회된 결과 건수"),
                        field("selectedRowId", "string", false, "state", "자동 선택된 첫 항목 ID")
                ),
                buildDraftGuardConditions(domainCode),
                Arrays.asList("목록 재조회", "정렬/페이징 상태 유지")
        );
        enrichEvent(events, "draft-page-row-select",
                Arrays.asList(
                        field("rowId", "string", true, "dom", "선택된 행 식별자"),
                        field("pageId", "string", true, "state", "현재 관리 대상 화면")
                ),
                Arrays.asList(
                        field("detailLoaded", "boolean", true, "state", "상세 로드 완료 여부")
                ),
                Collections.emptyList(),
                Arrays.asList("상세 패널 갱신", "관련 기능/권한 영향도 다시 계산")
        );
        enrichEvent(events, "draft-page-open-dialog",
                Arrays.asList(
                        field("mode", "string", true, "state", "create/edit"),
                        field("selectedRowId", "string", false, "state", "수정 대상 행 식별자")
                ),
                Arrays.asList(
                        field("dialogOpen", "boolean", true, "state", "대화상자 오픈 여부")
                ),
                Collections.emptyList(),
                Arrays.asList("등록/수정 폼 초기화", "기본값 채우기")
        );
        enrichEvent(events, "draft-page-save",
                Arrays.asList(
                        field("pageId", "string", true, "state", "관리 대상 draft page id"),
                        field("menuCode", "string", true, "form", "메뉴 코드"),
                        field("featureCodes", "string[]", false, "form", "저장 대상 기능 코드"),
                        field("insttId", "string", false, "session/form", "회사 범위")
                ),
                Arrays.asList(
                        field("saved", "boolean", true, "json", "저장 성공 여부"),
                        field("auditEventId", "string", false, "json", "저장 감사로그 ID"),
                        field("updatedFeatureCount", "number", false, "json", "반영된 기능 수")
                ),
                buildDraftGuardConditions(domainCode),
                Arrays.asList("저장 성공 메시지 표시", "목록 및 권한 카탈로그 새로고침", "감사로그 적재")
        );
        return events;
    }

    private List<Map<String, Object>> buildDraftApis(String pageName,
                                                     String routePath,
                                                     String menuCode,
                                                     String domainCode) {
        String normalizedRoutePath = normalizeRoutePath(routePath);
        String apiBasePath = buildDraftApiBasePath(normalizedRoutePath, domainCode);
        List<Map<String, Object>> apis = new ArrayList<>();
        apis.add(routeApi("draft.page.view", "Draft page route", routePath, menuCode));
        apis.add(api("draft.page.search", pageName + " 화면 메타 조회", "GET", apiBasePath + "/page",
                "DraftManagedController.page", "DraftManagedService.selectPageMetadata", "DraftManagedMapper.selectPageMetadata",
                buildDraftRelatedTables(domainCode, true),
                Arrays.asList("draft-menu-schema", "draft-ui-manifest-schema", "draft-audit-schema"),
                "자동 생성 후보 endpoint입니다. 실제 controller/service/mapper 경로는 화면 구현 시 확정해야 합니다."));
        apis.add(api("draft.page.detail", pageName + " 상세 후보 조회", "GET", apiBasePath + "/detail",
                "DraftManagedController.detail", "DraftManagedService.selectDetail", "DraftManagedMapper.selectDetail",
                buildDraftRelatedTables(domainCode, false),
                Arrays.asList("draft-menu-schema", "draft-ui-manifest-schema"),
                "선택 행 상세와 연결된 기능/권한/테이블 후보를 조회하는 기본 draft candidate API입니다."));
        apis.add(api("draft.page.save", pageName + " 저장", "POST", apiBasePath + "/save",
                "DraftManagedController.save", "DraftManagedService.saveManagedDraft", "DraftManagedMapper.upsertManagedDraft",
                buildDraftRelatedTables(domainCode, false),
                Arrays.asList("draft-menu-schema", "draft-ui-manifest-schema", "draft-audit-schema"),
                "메뉴/기능/권한/manifest 초안을 함께 저장하는 기본 draft candidate API입니다."));

        enrichApi(apis, "draft.page.search",
                Arrays.asList(
                        field("pageId", "string", true, "query", "draft page 식별자"),
                        field("menuCode", "string", false, "query", "메뉴 코드"),
                        field("insttId", "string", false, "query", "비마스터 회사 범위"),
                        field("searchKeyword", "string", false, "query", "검색 키워드")
                ),
                Arrays.asList(
                        field("page", "object", true, "json", "화면 메타데이터 본문"),
                        field("menuPermission", "object", true, "json", "메뉴/기능 권한 요약"),
                        field("schemas", "array", true, "json", "관련 스키마 후보 목록")
                ),
                Arrays.asList(
                        mask("insttId", "allow", "회사 범위 식별자는 권한 검증 문맥으로 사용"),
                        mask("searchKeyword", "allow", "운영 검색어는 감사상 유지 가능")
                )
        );
        enrichApi(apis, "draft.page.detail",
                Arrays.asList(
                        field("pageId", "string", true, "query", "draft page 식별자"),
                        field("rowId", "string", true, "query", "선택 행 ID"),
                        field("insttId", "string", false, "query", "회사 범위")
                ),
                Arrays.asList(
                        field("detail", "object", true, "json", "선택 행 상세"),
                        field("featureImpact", "array", false, "json", "연결 기능/권한 영향도")
                ),
                Arrays.asList(
                        mask("insttId", "allow", "회사 범위 필터"),
                        mask("rowId", "allow", "선택 행 식별자")
                )
        );
        enrichApi(apis, "draft.page.save",
                Arrays.asList(
                        field("pageId", "string", true, "body", "draft page 식별자"),
                        field("menuCode", "string", true, "body", "저장 대상 메뉴 코드"),
                        field("featureCodes", "string[]", false, "body", "선택 기능 코드"),
                        field("insttId", "string", false, "body", "회사 범위"),
                        field("auditComment", "string", false, "body", "변경 사유")
                ),
                Arrays.asList(
                        field("saved", "boolean", true, "json", "저장 성공 여부"),
                        field("auditEventId", "string", false, "json", "감사로그 ID"),
                        field("updatedAt", "string", false, "json", "최종 반영 시각")
                ),
                Arrays.asList(
                        mask("insttId", "allow", "회사 범위 강제 검증에 사용"),
                        mask("auditComment", "allow", "운영 변경 사유는 감사로그에 남김")
                )
        );
        return apis;
    }

    private List<String> buildDraftRelatedTables(String domainCode, boolean includeAudit) {
        Set<String> tables = new LinkedHashSet<>();
        tables.add("COMTCCMMNDETAILCODE");
        tables.add("COMTNMENUINFO");
        tables.add("COMTNMENUFUNCTIONINFO");
        tables.add("UI_PAGE_MANIFEST");
        tables.add("UI_COMPONENT_REGISTRY");
        tables.add("UI_PAGE_COMPONENT_MAP");
        if ("admin".equalsIgnoreCase(domainCode)) {
            tables.add("COMTNAUTHORFUNCTIONRELATE");
            tables.add("COMTNUSERFEATUREOVERRIDE");
        }
        if (includeAudit) {
            tables.add("AUDIT_EVENT");
            tables.add("TRACE_EVENT");
        }
        return new ArrayList<>(tables);
    }

    private List<Map<String, Object>> buildDraftSchemas(String pageName,
                                                        String routePath,
                                                        String menuCode,
                                                        String domainCode) {
        List<Map<String, Object>> schemas = new ArrayList<>();
        schemas.add(schema("draft-menu-schema", "메뉴/페이지 메타데이터", "COMTCCMMNDETAILCODE / COMTNMENUINFO / COMTNMENUFUNCTIONINFO",
                Arrays.asList("CODE", "CODE_NM", "CODE_DC", "MENU_URL", "MENU_ICON", "FEATURE_CODE", "USE_AT"),
                Arrays.asList("SELECT", "INSERT", "UPDATE"),
                "메뉴 관리에서 자동 등록한 공통코드, 페이지, 기본 VIEW 기능 메타데이터입니다."));
        schemas.add(schema("draft-ui-manifest-schema", "화면 manifest registry", "UI_PAGE_MANIFEST / UI_COMPONENT_REGISTRY / UI_PAGE_COMPONENT_MAP",
                Arrays.asList("PAGE_ID", "PAGE_NAME", "ROUTE_PATH", "COMPONENT_ID", "INSTANCE_KEY", "LAYOUT_ZONE", "DESIGN_REFERENCE"),
                Arrays.asList("UPSERT"),
                "메뉴 생성 직후 자동 생성된 draft manifest registry입니다."));
        schemas.add(schema("draft-audit-schema", pageName + " 감사/추적 스키마", "AUDIT_EVENT / TRACE_EVENT",
                Arrays.asList("AUDIT_ID", "ACTOR_ID", "INSTT_ID", "TARGET_ID", "ACTION_TYPE", "TRACE_ID", "RESULT_STATUS"),
                Arrays.asList("INSERT"),
                "권한/메뉴/기능 저장 시 반드시 남겨야 하는 감사/추적 메타데이터 후보입니다."));

        if ("admin".equalsIgnoreCase(domainCode) || routePath.startsWith("/admin/")) {
            schemas.add(schema("draft-admin-auth-schema", "관리자 권한 연결 스키마",
                    "COMTNAUTHORINFO / COMTNAUTHORFUNCTIONRELATE / COMTNUSERFEATUREOVERRIDE",
                    Arrays.asList("AUTHOR_CODE", "FEATURE_CODE", "EMPLYR_ID", "INSTT_ID", "GRANT_SCOPE"),
                    Arrays.asList("SELECT", "UPSERT"),
                    "비마스터 계정은 instt_id 범위 내 기능만 조회/할당해야 하는 권한 체인 메타데이터입니다."));
        } else {
            schemas.add(schema("draft-public-route-schema", "공개 화면 라우팅 스키마",
                    "COMTCCMMNDETAILCODE / COMTNMENUINFO / HTTP_SESSION",
                    Arrays.asList("CODE", "MENU_URL", "SESSION_KEY", "USE_AT"),
                    Arrays.asList("SELECT"),
                    "홈/가입/로그인 계열 화면이 메뉴 노출과 세션 분기를 함께 해석할 때 확인하는 후보 스키마입니다."));
        }
        return schemas;
    }

    private List<Map<String, Object>> buildDraftCodeGroups(String routePath, String menuCode, String domainCode) {
        List<Map<String, Object>> groups = new ArrayList<>();
        groups.add(codeGroup("MANAGED_MENU_CODE", "메뉴 코드", Collections.singletonList(menuCode), "자동 생성된 관리 대상 메뉴 코드입니다."));
        groups.add(codeGroup("MANAGED_ROUTE_SEGMENT", "화면 경로 분류", buildDraftRouteSegments(routePath),
                "메뉴 생성 직후 route path에서 추출한 화면 분류 후보입니다."));
        groups.add(codeGroup("MANAGED_DOMAIN_SCOPE", "도메인 범위", Collections.singletonList(domainCode),
                "admin/home/join 중 화면이 속한 기본 범위입니다."));
        if ("admin".equalsIgnoreCase(domainCode) || routePath.startsWith("/admin/")) {
            groups.add(codeGroup("INSTT_SCOPE_POLICY", "회사 범위 정책", Arrays.asList("MASTER_BYPASS", "NON_MASTER_REQUIRES_INSTT_ID"),
                    "비마스터 계정은 API 파라미터와 서버 쿼리 양쪽에서 instt_id 범위를 강제해야 합니다."));
        }
        return groups;
    }

    private List<String> buildDraftRouteSegments(String routePath) {
        String normalizedRoutePath = normalizeRoutePath(routePath);
        if (normalizedRoutePath.isEmpty()) {
            return Collections.singletonList("root");
        }
        List<String> values = new ArrayList<>();
        for (String token : normalizedRoutePath.replaceFirst("^/", "").split("/")) {
            if (!token.isEmpty()) {
                values.add(token);
            }
        }
        return values.isEmpty() ? Collections.singletonList("root") : values;
    }

    private List<String> buildDraftGuardConditions(String domainCode) {
        List<String> guards = new ArrayList<>();
        guards.add("메뉴 코드와 routePath가 registry와 일치해야 함");
        if ("admin".equalsIgnoreCase(domainCode)) {
            guards.add("ROLE_SYSTEM_MASTER 외 계정은 instt_id 파라미터 또는 세션 범위가 필요함");
            guards.add("grantable 범위를 벗어난 기능/권한은 저장 대상에서 제외");
        }
        return guards;
    }

    private String buildDraftApiBasePath(String routePath, String domainCode) {
        String normalizedRoutePath = normalizeRoutePath(routePath);
        if (normalizedRoutePath.isEmpty()) {
            return "admin".equalsIgnoreCase(domainCode) ? "/api/admin/managed-page" : "/api/managed-page";
        }
        return "/api" + normalizedRoutePath;
    }

    private String normalizeRoutePath(String routePath) {
        String normalized = stringValue(routePath).trim();
        if (normalized.startsWith("/en/")) {
            normalized = normalized.substring(3);
        }
        return normalized;
    }

    private Map<String, Object> buildAuthGroupPage() {
        Map<String, Object> page = pageOption("auth-group", "권한 그룹", "/admin/auth/group", "AMENU_AUTH_GROUP", "admin");
        page.put("summary", "권한 분류, 그룹 생성, 기능 매핑을 운영하는 관리자 권한 설계 화면입니다.");
        page.put("source", "frontend/src/features/auth-groups/AuthGroupMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("auth-group-filters", "권한 그룹 필터", "[data-help-id=\"auth-group-filters\"]", "AuthGroupFilters", "actions",
                        Arrays.asList("auth-group-page-load"), "권한 분류, 회사, 권한 그룹을 바꿔 조회 범위를 좁힙니다."),
                surface("auth-group-create", "권한 그룹 생성", "[data-help-id=\"auth-group-create\"]", "AuthGroupCreateForm", "content",
                        Arrays.asList("auth-group-create-submit"), "신규 권한 그룹 코드와 설명을 생성합니다."),
                surface("auth-group-profile", "권한 그룹 프로필", "[data-help-id=\"auth-group-profile\"]", "AuthGroupRoleProfile", "content",
                        Arrays.asList("auth-group-profile-save"), "회원 수정 화면에 노출할 업무 역할명과 우선 제공 업무를 권한 그룹 메타데이터로 저장합니다."),
                surface("auth-group-features", "기능 매핑", "[data-help-id=\"auth-group-features\"]", "AuthGroupFeatureMatrix", "content",
                        Arrays.asList("auth-group-feature-save"), "선택한 권한 그룹에 기능 코드를 저장합니다.")
        ));
        page.put("events", Arrays.asList(
                event("auth-group-page-load", "권한 그룹 조회", "change", "fetchAuthGroupPage", "[data-help-id=\"auth-group-filters\"] select",
                        Arrays.asList("admin.auth-groups.page"), "권한 분류와 회사 범위에 따라 권한 그룹/기능 목록을 다시 조회합니다."),
                event("auth-group-create-submit", "권한 그룹 생성", "submit", "handleCreate", "[data-help-id=\"auth-group-create\"] form",
                        Arrays.asList("admin.auth-groups.create"), "신규 권한 그룹을 생성합니다."),
                event("auth-group-profile-save", "권한 그룹 프로필 저장", "click", "handleSaveRoleProfile", "[data-help-id=\"auth-group-profile\"] .primary-button",
                        Arrays.asList("admin.auth-groups.profile-save"), "권한 그룹에 연결된 업무 역할과 우선 제공 업무 메타데이터를 저장합니다."),
                event("auth-group-feature-save", "기능 매핑 저장", "click", "handleSaveFeatures", "[data-help-id=\"auth-group-features\"] .primary-button",
                        Arrays.asList("admin.auth-groups.features.save"), "선택 기능과 권한 그룹 매핑을 저장합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.auth-groups.page", "권한 그룹 화면 조회", "GET", "/api/admin/auth-groups/page",
                        "AdminMainController.getAuthGroupPage", "AuthGroupManageService.selectAuthorList / selectFeatureCatalog",
                        "AuthGroupManageMapper.selectAuthorList / selectFeatureCatalog / selectAuthorFeatureCodes",
                        Arrays.asList("COMTNAUTHORINFO", "COMTNMENUINFO", "COMTNMENUFUNCTIONINFO", "COMTNAUTHORFUNCTIONRELATE"),
                        Arrays.asList("author-group-schema", "menu-feature-schema"),
                        "권한 그룹, 기능 카탈로그, 현재 매핑을 함께 조회합니다."),
                api("admin.auth-groups.create", "권한 그룹 생성", "POST", "/api/admin/auth-groups",
                        "AdminMainController.createAuthGroup", "AuthGroupManageService.createAuthorGroup",
                        "AuthGroupManageMapper.insertAuthorInfo",
                        Arrays.asList("COMTNAUTHORINFO", "AUDIT_EVENT"), Arrays.asList("author-group-schema"),
                        "신규 권한 그룹을 생성합니다."),
                api("admin.auth-groups.profile-save", "권한 그룹 프로필 저장", "POST", "/api/admin/auth-groups/profile-save",
                        "AdminMainController.saveAuthGroupProfileApi", "AuthorRoleProfileService.saveProfile",
                        "author-role-profiles/profiles.json",
                        Arrays.asList("DATA_AUTHOR_ROLE_PROFILES", "AUDIT_EVENT"), Arrays.asList("author-group-schema", "author-role-profile-schema", "audit-event-schema"),
                        "권한 그룹별 업무 역할명, 우선 제공 업무, 회원 수정 화면 노출 여부를 저장합니다."),
                api("admin.auth-groups.features.save", "권한 그룹 기능 저장", "POST", "/api/admin/auth-groups/features",
                        "AdminMainController.saveAuthGroupFeatures", "AuthGroupManageService.saveAuthorFeatureRelations",
                        "AuthGroupManageMapper.deleteAuthorFeatureRelations / insertAuthorFeatureRelation",
                        Arrays.asList("COMTNAUTHORFUNCTIONRELATE", "AUDIT_EVENT"), Arrays.asList("menu-feature-schema", "audit-event-schema"),
                        "권한 그룹과 기능 코드 매핑을 저장합니다.")
        ));
        page.put("schemas", Arrays.asList(
                schema("author-group-schema", "권한 그룹 스키마", "COMTNAUTHORINFO",
                        Arrays.asList("AUTHOR_CODE", "AUTHOR_NM", "AUTHOR_DC"), Arrays.asList("SELECT", "INSERT"),
                        "권한 그룹 정의를 저장합니다."),
                schema("author-role-profile-schema", "권한 그룹 프로필 스키마", "data/author-role-profiles/profiles.json",
                        Arrays.asList("authorCode", "displayTitle", "priorityWorks", "description", "memberEditVisibleYn", "updatedAt"),
                        Arrays.asList("SELECT", "UPSERT"),
                        "권한 그룹에 연결된 업무 역할 프로필 메타데이터를 저장합니다."),
                schema("menu-feature-schema", "메뉴/기능 권한 스키마", "COMTNMENUINFO / COMTNMENUFUNCTIONINFO / COMTNAUTHORFUNCTIONRELATE",
                        Arrays.asList("MENU_CODE", "FEATURE_CODE", "AUTHOR_CODE"), Arrays.asList("SELECT", "INSERT", "DELETE"),
                        "권한 그룹별 기능 코드 매핑을 저장합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("ROLE_CATEGORY", "권한 분류", Arrays.asList("GENERAL", "DEPARTMENT", "USER"), "권한 그룹 범위를 나누는 기준입니다."),
                codeGroup("AMENU_AUTH", "권한 운영 메뉴", Arrays.asList("AMENU_AUTH_GROUP", "AMENU_AUTH_CHANGE", "AMENU_DEPT_ROLE"), "권한 운영 화면 메뉴 코드입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildHomePage() {
        Map<String, Object> page = pageOption("home", "홈", "/home", "HMENU_HOME", "home");
        page.put("summary", "메인 배너, 통합 검색, 핵심 서비스, 운영 요약을 제공하는 사용자 메인 홈 화면입니다.");
        page.put("source", "frontend/src/features/home-entry/HomeEntryPages.tsx, HomeEntrySections.tsx");
        page.put("surfaces", Arrays.asList(
                surface("home-hero", "메인 배너", "[data-help-id=\"home-hero\"]", "HomeHeroSection", "header",
                        Collections.emptyList(), "서비스 핵심 메시지와 대표 진입 링크를 제공합니다."),
                surface("home-search", "통합 검색", "[data-help-id=\"home-search\"]", "HomeSearchSection", "actions",
                        Collections.emptyList(), "주요 메뉴와 검색 키워드 탐색을 제공합니다."),
                surface("home-services", "핵심 서비스", "[data-help-id=\"home-services\"]", "HomeServiceGrid", "content",
                        Collections.emptyList(), "회원가입, 인증, 조회 등 주요 서비스를 카드형으로 제공합니다."),
                surface("home-summary", "운영 현황 요약", "[data-help-id=\"home-summary\"]", "HomeSummarySection", "content",
                        Collections.emptyList(), "최근 운영 지표와 요약 통계를 노출합니다.")
        ));
        page.put("events", Collections.emptyList());
        page.put("apis", Collections.emptyList());
        page.put("schemas", Collections.emptyList());
        page.put("commonCodeGroups", Collections.emptyList());
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildAdminHomePage() {
        Map<String, Object> page = pageOption("admin-home", "관리자 홈", "/admin/", "AMENU_ADMIN_HOME", "admin");
        page.put("summary", "운영 대시보드 카드, 승인 대기, 심사 진행 현황을 제공하는 관리자 메인 화면입니다.");
        page.put("source", "frontend/src/features/admin-entry/AdminEntryPages.tsx");
        page.put("surfaces", Arrays.asList(
                surface("admin-home-cards", "운영 요약 카드", "[data-help-id=\"admin-home-cards\"]", "AdminHomeCards", "content",
                        Collections.emptyList(), "회원, 배출량, 심사 현황 요약을 보여줍니다."),
                surface("admin-home-approvals", "승인 대기", "[data-help-id=\"admin-home-approvals\"]", "AdminHomeApprovals", "content",
                        Collections.emptyList(), "최근 가입 승인 대기 건을 노출합니다."),
                surface("admin-home-progress", "심사 진행 현황", "[data-help-id=\"admin-home-progress\"]", "AdminHomeProgress", "content",
                        Collections.emptyList(), "단계별 심사 진행 상태를 시각화합니다.")
        ));
        page.put("events", Collections.emptyList());
        page.put("apis", Collections.emptyList());
        page.put("schemas", Collections.emptyList());
        page.put("commonCodeGroups", Collections.emptyList());
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildAdminLoginPage() {
        Map<String, Object> page = pageOption("admin-login", "관리자 로그인", "/admin/login/loginView", "AMENU_ADMIN_LOGIN", "admin");
        page.put("summary", "관리자 ID/비밀번호와 2차 인증 수단을 제공하는 관리자 로그인 화면입니다.");
        page.put("source", "frontend/src/features/admin-entry/AdminEntryPages.tsx");
        page.put("surfaces", Arrays.asList(
                surface("admin-login-warning", "경고 배너", "[data-help-id=\"admin-login-warning\"]", "AdminLoginWarning", "header",
                        Collections.emptyList(), "관리 전용 시스템 경고와 보안 안내를 제공합니다."),
                surface("admin-login-form", "관리자 로그인 폼", "[data-help-id=\"admin-login-form\"]", "AdminLoginForm", "content",
                        Collections.singletonList("admin-login-submit"), "관리자 인증 입력 영역입니다."),
                surface("admin-login-mfa", "2차 인증 선택", "[data-help-id=\"admin-login-mfa\"]", "AdminLoginMfa", "content",
                        Collections.emptyList(), "공동인증서, OTP, 모바일 신분증 등 인증 수단을 보여줍니다.")
        ));
        page.put("events", Arrays.asList(
                event("admin-login-submit", "관리자 로그인", "submit", "handleSubmit", "[data-help-id=\"admin-login-form\"] form",
                        Arrays.asList("admin.login.action"), "관리자 로그인 요청을 전송합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.login.action", "관리자 로그인", "POST", "/admin/login/actionLogin",
                        "AdminLoginController.actionLogin", "LoginService.actionLogin",
                        "Authentication", Arrays.asList("COMTNEMPLYRINFO"), Collections.emptyList(),
                        "관리자 인증과 세션 수립을 수행합니다.")
        ));
        page.put("schemas", Collections.emptyList());
        page.put("commonCodeGroups", Collections.emptyList());
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildSigninForbiddenPage() {
        Map<String, Object> page = pageOption("signin-forbidden", "접근 거부", "/signin/loginForbidden", "HMENU_SIGNIN_FORBIDDEN", "home");
        page.put("summary", "권한이 없는 사용자에게 접근 거부 사유를 안내하는 공개 화면입니다.");
        page.put("source", "frontend/src/features/public-entry/PublicEntryPages.tsx");
        page.put("surfaces", Arrays.asList(
                surface("signin-forbidden-card", "접근 거부 카드", "[data-help-id=\"signin-forbidden-card\"]", "SigninForbiddenCard", "content",
                        Collections.emptyList(), "현재 페이지 접근 불가 상태와 안내 문구를 제공합니다.")
        ));
        page.put("events", Collections.emptyList());
        page.put("apis", Collections.emptyList());
        page.put("schemas", Collections.emptyList());
        page.put("commonCodeGroups", Collections.emptyList());
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildMemberApprovePage() {
        Map<String, Object> page = pageOption("member-approve", "회원 승인", "/admin/member/approve", "AMENU_MEMBER_APPROVE", "admin");
        page.put("summary", "회원 승인 검색, 일괄 처리, 행 단위 승인과 반려를 관리하는 관리자 화면입니다.");
        page.put("source", "frontend/src/features/member-approve/MemberApproveMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("member-approve-search", "승인 대상 검색", "[data-help-id=\"member-approve-search\"]", "MemberApprovalFilter", "actions",
                        Arrays.asList("member-approve-search-submit"), "회원구분, 상태, 검색어로 승인 대상을 조회합니다."),
                surface("member-approve-batch-actions", "일괄 승인/반려", "[data-help-id=\"member-approve-batch-actions\"]", "MemberApprovalBatchActions", "actions",
                        Arrays.asList("member-approve-batch-approve", "member-approve-batch-reject"), "선택한 회원을 일괄 승인 또는 반려합니다."),
                surface("member-approve-table", "회원 승인 목록", "[data-help-id=\"member-approve-table\"]", "MemberApprovalTable", "content",
                        Arrays.asList("member-approve-row-review", "member-approve-row-approve", "member-approve-row-reject"), "회원 기본정보와 증빙 서류를 검토하고 개별 처리합니다.")
        ));
        page.put("events", Arrays.asList(
                event("member-approve-search-submit", "회원 승인 목록 조회", "click", "applyFilters", "[data-help-id=\"member-approve-search\"] button",
                        Arrays.asList("admin.member.approve.page"), "검색 조건으로 회원 승인 목록을 다시 조회합니다."),
                event("member-approve-batch-approve", "선택 회원 승인", "click", "handleAction", "[data-help-id=\"member-approve-batch-actions\"] button",
                        Arrays.asList("admin.member.approve.action"), "선택한 회원을 일괄 승인합니다."),
                event("member-approve-batch-reject", "선택 회원 반려", "click", "handleAction", "[data-help-id=\"member-approve-batch-actions\"] button",
                        Arrays.asList("admin.member.approve.action"), "선택한 회원을 일괄 반려합니다."),
                event("member-approve-row-review", "회원 상세 검토", "click", "setReviewMemberId", "[data-help-id=\"member-approve-table\"] button",
                        Collections.emptyList(), "선택한 회원의 상세 검토 패널을 엽니다."),
                event("member-approve-row-approve", "회원 개별 승인", "click", "handleAction", "[data-help-id=\"member-approve-table\"] button",
                        Arrays.asList("admin.member.approve.action"), "개별 회원 승인 상태를 저장합니다."),
                event("member-approve-row-reject", "회원 개별 반려", "click", "handleAction", "[data-help-id=\"member-approve-table\"] button",
                        Arrays.asList("admin.member.approve.action"), "개별 회원 반려 상태를 저장합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.member.approve.page", "회원 승인 목록 조회", "GET", "/api/admin/member/approve/page",
                        "AdminMainController.memberApprovePageApi", "AdminMainController.populateMemberApprovePage",
                        "EntrprsManageMapper.selectMemberApprovalList / selectMemberApprovalListTotCnt",
                        Arrays.asList("COMTNENTRPRSMBER"), Arrays.asList("member-approve-schema"),
                        "승인 대상 회원 목록과 증빙 요약을 조회합니다."),
                api("admin.member.approve.action", "회원 승인/반려 처리", "POST", "/api/admin/member/approve/action",
                        "AdminMainController.memberApproveActionApi", "EntrprsManageService.updateMemberApprovalStatus",
                        "EntrprsManageMapper.updateMemberApprovalStatus / insertAuditEvent",
                        Arrays.asList("COMTNENTRPRSMBER", "AUDIT_EVENT"), Arrays.asList("member-approve-schema", "audit-event-schema"),
                        "회원 승인, 반려, 일괄 처리 결과를 저장합니다.")
        ));
        page.put("schemas", Arrays.asList(
                schema("member-approve-schema", "회원 승인 모델", "COMTNENTRPRSMBER",
                        Arrays.asList("ENTRPRS_MBER_ID", "APPLCNT_NM", "CMPNY_NM", "MBER_TY_CODE", "SBSCRB_STTUS"),
                        Arrays.asList("SELECT", "UPDATE"), "회원 가입 승인 상태와 기본 정보를 관리합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("MEMBER_STATUS", "회원 상태", Arrays.asList("A", "P", "R", "X"), "승인 상태 필터와 배지에 사용됩니다."),
                codeGroup("MEMBER_TYPE", "회원 유형", Arrays.asList("EMITTER", "PERFORMER", "CENTER", "GOV"), "회원구분 필터와 라벨에 사용됩니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildSigninAuthChoicePage() {
        Map<String, Object> page = pageOption("signin-auth-choice", "인증 수단 선택", "/signin/authChoice", "HMENU_SIGNIN_AUTH_CHOICE", "home");
        page.put("summary", "로그인 전 본인인증 수단을 선택하는 사용자 공용 진입 화면입니다.");
        page.put("source", "frontend/src/features/public-entry/PublicEntryPages.tsx");
        page.put("surfaces", Arrays.asList(
                surface("signin-auth-choice-options", "인증 수단 선택 카드", "[data-help-id=\"signin-auth-choice-options\"]", "SigninAuthChoiceOptions", "content",
                        Arrays.asList("signin-auth-choice-submit"), "간편인증, 공동인증서, 금융인증서를 선택합니다.")
        ));
        page.put("events", Arrays.asList(
                event("signin-auth-choice-submit", "인증 수단 선택", "click", "handleAuthChoice", "[data-help-id=\"signin-auth-choice-options\"] button",
                        Arrays.asList("signin.auth-choice.complete"), "선택한 인증 수단 결과를 저장하고 홈으로 이동합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("signin.auth-choice.complete", "인증 선택 완료", "POST", "/signin/api/auth-choice",
                        "PublicEntryApiController.completeAuthChoice", "PublicEntryService.completeAuthChoice",
                        "Session / temp auth store", Arrays.asList("HTTP_SESSION"), Arrays.asList("signin-auth-choice-schema"),
                        "선택한 인증 수단 정보를 임시 저장합니다.")
        ));
        page.put("schemas", Arrays.asList(
                schema("signin-auth-choice-schema", "인증 선택 세션 스키마", "HTTP_SESSION",
                        Arrays.asList("storedUserId", "authTy", "authDn", "authCi", "authDi"), Arrays.asList("SESSION_WRITE"),
                        "로그인 전 인증 선택 결과를 저장합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("AUTH_METHOD", "인증 수단", Arrays.asList("SIMPLE", "JOINT", "FINANCIAL"), "로그인 전 인증 수단 코드입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildSigninLoginPage() {
        Map<String, Object> page = pageOption("signin-login", "로그인", "/signin/loginView", "HMENU_SIGNIN_LOGIN", "home");
        page.put("summary", "로그인, 아이디 저장, 자동 로그인, 간편인증 진입을 제공하는 사용자 공용 로그인 화면입니다.");
        page.put("source", "frontend/src/features/public-entry/PublicEntryPages.tsx");
        page.put("surfaces", Arrays.asList(
                surface("signin-login-notice", "로그인 공지", "[data-help-id=\"signin-login-notice\"]", "SigninLoginNotice", "header",
                        Collections.emptyList(), "시스템 점검 및 보안 안내 공지를 노출합니다."),
                surface("signin-login-tabs", "회원 구분 탭", "[data-help-id=\"signin-login-tabs\"]", "SigninLoginTabs", "actions",
                        Arrays.asList("signin-login-tab-change"), "국내/해외 회원 유형에 따라 아이디 찾기, 비밀번호 찾기 링크를 바꿉니다."),
                surface("signin-login-form", "로그인 입력 폼", "[data-help-id=\"signin-login-form\"]", "SigninLoginForm", "content",
                        Arrays.asList("signin-login-submit", "signin-login-link-navigate"), "아이디, 비밀번호, 저장 옵션으로 로그인을 수행합니다."),
                surface("signin-login-simple-auth", "간편인증 로그인 진입", "[data-help-id=\"signin-login-simple-auth\"]", "SigninSimpleAuthActions", "content",
                        Arrays.asList("signin-login-simple-auth-select"), "간편인증, 공동인증서, 금융인증서 로그인을 선택합니다.")
        ));
        page.put("events", Arrays.asList(
                event("signin-login-tab-change", "로그인 탭 전환", "click", "setTab", "[data-help-id=\"signin-login-tabs\"] button",
                        Collections.emptyList(), "국내/해외 회원 구분을 전환합니다."),
                event("signin-login-submit", "로그인 제출", "submit", "handleSubmit / submitLogin", "[data-help-id=\"signin-login-form\"] form",
                        Arrays.asList("signin.login.submit"), "로그인 세션을 생성하고 인증 상태에 따라 다음 화면으로 이동합니다."),
                event("signin-login-link-navigate", "로그인 보조 링크 이동", "click", "navigate", "[data-help-id=\"signin-login-form\"] a",
                        Arrays.asList("route.signin.find-id", "route.signin.find-password", "route.join.step1"), "아이디 찾기, 비밀번호 찾기, 회원가입으로 이동합니다."),
                event("signin-login-simple-auth-select", "간편인증 로그인 선택", "click", "noop", "[data-help-id=\"signin-login-simple-auth\"] button",
                        Collections.emptyList(), "간편인증 로그인 방식 선택 UI를 제공합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("signin.login.submit", "로그인 처리", "POST", "/signin/actionLogin",
                        "SigninController.actionLogin", "LoginService.actionLogin",
                        "User login/auth", Arrays.asList("COMVNUSERMASTER", "HTTP_SESSION"), Arrays.asList("signin-login-schema"),
                        "아이디/비밀번호를 검증하고 로그인 세션을 구성합니다."),
                routeApi("route.signin.find-id", "아이디 찾기 이동", "/signin/findId", "HMENU_SIGNIN_FIND_ID"),
                routeApi("route.signin.find-password", "비밀번호 찾기 이동", "/signin/findPassword", "HMENU_SIGNIN_FIND_PASSWORD"),
                routeApi("route.join.step1", "회원가입 이동", "/join/step1", "HMENU_JOIN_STEP1")
        ));
        page.put("schemas", Arrays.asList(
                schema("signin-login-schema", "로그인 사용자 스키마", "COMVNUSERMASTER / HTTP_SESSION",
                        Arrays.asList("USER_ID", "PASSWORD", "USER_SE", "CERTIFIED"), Arrays.asList("SELECT", "SESSION_WRITE"),
                        "로그인 검증과 세션 생성에 사용됩니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("LOGIN_MEMBER_SCOPE", "로그인 회원 범위", Arrays.asList("domestic", "overseas"), "국내/해외 회원 탭 구분입니다."),
                codeGroup("LOGIN_AUTH_METHOD", "간편인증 로그인 수단", Arrays.asList("SIMPLE", "JOINT", "FINANCIAL"), "로그인 대체 인증 수단 코드입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildSigninFindIdPage() {
        Map<String, Object> page = pageOption("signin-find-id", "아이디 찾기", "/signin/findId", "HMENU_SIGNIN_FIND_ID", "home");
        page.put("summary", "이름, 이메일, 인증 방식으로 사용자 아이디를 찾는 공용 화면입니다.");
        page.put("source", "frontend/src/features/public-entry/PublicEntryPages.tsx");
        page.put("surfaces", Arrays.asList(
                surface("signin-find-id-form", "아이디 찾기 입력 폼", "[data-help-id=\"signin-find-id-form\"]", "SigninFindIdForm", "content",
                        Arrays.asList("signin-find-id-send-code", "signin-find-id-submit"), "이름, 이메일, 인증번호를 입력합니다."),
                surface("signin-find-id-methods", "국내 인증 수단 목록", "[data-help-id=\"signin-find-id-methods\"]", "SigninFindIdMethods", "content",
                        Collections.emptyList(), "국내 사용자의 본인인증 수단 목록을 보여줍니다."),
                surface("signin-find-id-result-card", "아이디 찾기 결과 카드", "[data-help-id=\"signin-find-id-result-card\"]", "SigninFindIdResultCard", "content",
                        Arrays.asList("signin-find-id-result-load"), "마스킹된 아이디 결과를 보여줍니다.")
        ));
        page.put("events", Arrays.asList(
                event("signin-find-id-send-code", "이메일 인증번호 발송", "click", "handleSendCode", "[data-help-id=\"signin-find-id-form\"] button",
                        Collections.emptyList(), "해외 사용자 이메일 인증번호를 발송합니다."),
                event("signin-find-id-submit", "아이디 찾기 제출", "click", "handleSubmit", "[data-help-id=\"signin-find-id-form\"] button",
                        Arrays.asList("route.signin.find-id-result"), "입력값을 검증하고 결과 화면으로 이동합니다."),
                event("signin-find-id-result-load", "아이디 찾기 결과 조회", "load", "useAsyncValue", "[data-help-id=\"signin-find-id-result-card\"]",
                        Arrays.asList("signin.find-id.result"), "마스킹된 아이디 결과를 조회합니다.")
        ));
        page.put("apis", Arrays.asList(
                routeApi("route.signin.find-id-result", "아이디 찾기 결과 이동", "/signin/findId/result", "HMENU_SIGNIN_FIND_ID_RESULT"),
                api("signin.find-id.result", "아이디 찾기 결과 조회", "GET", "/signin/api/findId/result",
                        "PublicEntryApiController.findIdResult", "PublicEntryService.findIdResult",
                        "User lookup", Arrays.asList("COMVNUSERMASTER"), Arrays.asList("signin-find-id-result-schema"),
                        "이름, 이메일 기준으로 마스킹된 아이디를 조회합니다.")
        ));
        page.put("schemas", Arrays.asList(
                schema("signin-find-id-result-schema", "아이디 찾기 결과 스키마", "COMVNUSERMASTER",
                        Arrays.asList("USER_ID", "USER_NM", "EMAIL_ADRES"), Arrays.asList("SELECT"),
                        "아이디 찾기 결과 조회에 사용됩니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("PUBLIC_TAB", "공용 탭 구분", Arrays.asList("domestic", "overseas"), "국내/해외 사용자 구분입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildSigninFindPasswordPage() {
        Map<String, Object> page = pageOption("signin-find-password", "비밀번호 찾기", "/signin/findPassword", "HMENU_SIGNIN_FIND_PASSWORD", "home");
        page.put("summary", "아이디와 이메일 또는 인증 수단으로 본인을 확인한 뒤 새 비밀번호를 설정하는 공용 화면입니다.");
        page.put("source", "frontend/src/features/public-entry/PublicEntryPages.tsx");
        page.put("surfaces", Arrays.asList(
                surface("signin-find-password-verify", "본인 확인 단계", "[data-help-id=\"signin-find-password-verify\"]", "SigninFindPasswordVerify", "content",
                        Arrays.asList("signin-find-password-verify", "signin-find-password-send-code"), "아이디와 인증 수단 또는 이메일로 본인을 확인합니다."),
                surface("signin-find-password-reset", "새 비밀번호 입력", "[data-help-id=\"signin-find-password-reset\"]", "SigninFindPasswordReset", "content",
                        Arrays.asList("signin-find-password-reset-submit"), "새 비밀번호와 확인 비밀번호를 입력합니다."),
                surface("signin-find-password-actions", "비밀번호 재설정 액션", "[data-help-id=\"signin-find-password-actions\"]", "SigninFindPasswordActions", "actions",
                        Arrays.asList("signin-find-password-reset-submit"), "재설정 완료를 제출합니다.")
        ));
        page.put("events", Arrays.asList(
                event("signin-find-password-send-code", "비밀번호 찾기 인증번호 발송", "click", "handleSendCode", "[data-help-id=\"signin-find-password-verify\"] button",
                        Collections.emptyList(), "이메일 인증번호를 발송합니다."),
                event("signin-find-password-verify", "본인 확인", "click", "verifyIdentity / verifyEmailAndProceed", "[data-help-id=\"signin-find-password-verify\"] button",
                        Collections.emptyList(), "본인 확인 상태를 완료로 전환합니다."),
                event("signin-find-password-reset-submit", "비밀번호 재설정 완료", "click", "handleReset", "[data-help-id=\"signin-find-password-actions\"] button",
                        Arrays.asList("signin.find-password.reset"), "새 비밀번호를 저장하고 결과 화면으로 이동합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("signin.find-password.reset", "비밀번호 재설정", "POST", "/signin/api/findPassword/reset",
                        "PublicEntryApiController.resetPassword", "PublicEntryService.resetPassword",
                        "User password update", Arrays.asList("COMVNUSERMASTER"), Arrays.asList("signin-password-reset-schema"),
                        "본인 확인 후 새 비밀번호를 저장합니다.")
        ));
        page.put("schemas", Arrays.asList(
                schema("signin-password-reset-schema", "비밀번호 재설정 스키마", "COMVNUSERMASTER",
                        Arrays.asList("USER_ID", "PASSWORD", "PASSWORD_CNSR"), Arrays.asList("SELECT", "UPDATE"),
                        "비밀번호 재설정 저장에 사용됩니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("PASSWORD_VERIFY_METHOD", "비밀번호 찾기 인증 수단", Arrays.asList("JOINT", "OTP", "EMAIL"), "비밀번호 찾기 본인 확인 수단입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildSigninFindIdResultPage() {
        Map<String, Object> page = pageOption("signin-find-id-result", "아이디 찾기 결과", "/signin/findId/result", "HMENU_SIGNIN_FIND_ID_RESULT", "home");
        page.put("summary", "마스킹된 아이디 조회 결과와 비밀번호 재설정 이동을 제공하는 결과 화면입니다.");
        page.put("source", "frontend/src/features/public-entry/PublicEntryPages.tsx");
        page.put("surfaces", Arrays.asList(
                surface("signin-find-id-result-card", "아이디 찾기 결과 카드", "[data-help-id=\"signin-find-id-result-card\"]", "SigninFindIdResultCard", "content",
                        Arrays.asList("signin-find-id-result-load"), "조회된 마스킹 아이디를 보여줍니다."),
                surface("signin-find-id-result-actions", "아이디 찾기 결과 액션", "[data-help-id=\"signin-find-id-result-actions\"]", "SigninFindIdResultActions", "actions",
                        Arrays.asList("signin-find-id-result-reset"), "비밀번호 재설정 또는 로그인 이동을 제공합니다.")
        ));
        page.put("events", Arrays.asList(
                event("signin-find-id-result-load", "아이디 결과 조회", "load", "useAsyncValue", "[data-help-id=\"signin-find-id-result-card\"]",
                        Arrays.asList("signin.find-id.result"), "이름과 이메일 기준 마스킹 아이디를 조회합니다."),
                event("signin-find-id-result-reset", "비밀번호 재설정 이동", "click", "navigate", "[data-help-id=\"signin-find-id-result-actions\"] a",
                        Arrays.asList("route.signin.find-password"), "비밀번호 재설정 화면으로 이동합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("signin.find-id.result", "아이디 찾기 결과 조회", "GET", "/signin/api/findId/result",
                        "PublicEntryApiController.findIdResult", "PublicEntryService.findIdResult",
                        "User lookup", Arrays.asList("COMVNUSERMASTER"), Arrays.asList("signin-find-id-result-schema"),
                        "아이디 찾기 결과 조회에 사용됩니다."),
                routeApi("route.signin.find-password", "비밀번호 재설정 이동", "/signin/findPassword", "HMENU_SIGNIN_FIND_PASSWORD")
        ));
        page.put("schemas", Arrays.asList(
                schema("signin-find-id-result-schema", "아이디 찾기 결과 스키마", "COMVNUSERMASTER",
                        Arrays.asList("USER_ID", "USER_NM", "EMAIL_ADRES"), Arrays.asList("SELECT"),
                        "마스킹된 아이디 조회 결과를 구성합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("PUBLIC_TAB", "공용 탭 구분", Arrays.asList("domestic", "overseas"), "국내/해외 결과 분기입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildSigninFindPasswordResultPage() {
        Map<String, Object> page = pageOption("signin-find-password-result", "비밀번호 찾기 완료", "/signin/findPassword/result", "HMENU_SIGNIN_FINDPW_RESULT", "home");
        page.put("summary", "비밀번호 재설정 완료 메시지와 로그인 복귀를 제공하는 결과 화면입니다.");
        page.put("source", "frontend/src/features/public-entry/PublicEntryPages.tsx");
        page.put("surfaces", Arrays.asList(
                surface("signin-find-password-result-card", "비밀번호 재설정 완료 카드", "[data-help-id=\"signin-find-password-result-card\"]", "SigninFindPasswordResultCard", "content",
                        Collections.emptyList(), "비밀번호 재설정 성공 메시지를 보여줍니다."),
                surface("signin-find-password-result-action", "로그인 복귀 액션", "[data-help-id=\"signin-find-password-result-action\"]", "SigninFindPasswordResultAction", "actions",
                        Arrays.asList("signin-find-password-result-login"), "로그인 화면으로 복귀합니다.")
        ));
        page.put("events", Arrays.asList(
                event("signin-find-password-result-login", "로그인 복귀", "click", "navigate", "[data-help-id=\"signin-find-password-result-action\"]",
                        Arrays.asList("route.signin.login"), "로그인 화면으로 이동합니다.")
        ));
        page.put("apis", Arrays.asList(
                routeApi("route.signin.login", "로그인 이동", "/signin/loginView", "HMENU_SIGNIN_LOGIN")
        ));
        page.put("schemas", Collections.emptyList());
        page.put("commonCodeGroups", Collections.emptyList());
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildJoinCompanyRegisterPage() {
        Map<String, Object> page = pageOption("join-company-register", "회원사 등록", "/join/companyRegister", "HMENU_JOIN_COMPANY_REGISTER", "join");
        page.put("summary", "소속 기관 검색 실패 시 신규 회원사를 등록하고 증빙 파일을 제출하는 공개 가입 화면입니다.");
        page.put("source", "frontend/src/features/join-company-register/JoinCompanyRegisterMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("join-company-register-contact", "담당자 정보 입력", "#main-content .grid", "JoinCompanyContactForm", "content",
                        Arrays.asList("join-company-register-submit"), "담당자 성명, 이메일, 연락처를 입력합니다."),
                surface("join-company-register-business", "사업자 정보 입력", "#main-content form", "JoinCompanyBusinessForm", "content",
                        Arrays.asList("join-company-register-duplicate-check", "join-company-register-address-search"), "기관명, 대표자명, 사업자번호, 주소를 입력합니다."),
                surface("join-company-register-files", "증빙 업로드", "#main-content form .join-upload-row", "JoinCompanyFileUpload", "content",
                        Arrays.asList("join-company-register-file-add", "join-company-register-file-remove"), "증빙 파일을 추가하거나 제거합니다.")
        ));
        page.put("events", Arrays.asList(
                event("join-company-register-duplicate-check", "기관명 중복 확인", "click", "handleDuplicateCheck", "#main-content form button",
                        Arrays.asList("join.company-register.duplicate-check"), "기관명 중복 여부를 확인합니다."),
                event("join-company-register-address-search", "주소 검색", "click", "openAddressSearch", "#main-content form button",
                        Collections.emptyList(), "주소 검색 위젯을 열어 주소를 채웁니다."),
                event("join-company-register-file-add", "파일 행 추가", "click", "addFileRow", "#main-content form .join-upload-add-btn",
                        Collections.emptyList(), "증빙 파일 행을 추가합니다."),
                event("join-company-register-file-remove", "파일 행 제거", "click", "removeFileRow", "#main-content form .join-upload-remove-btn",
                        Collections.emptyList(), "증빙 파일 행을 제거합니다."),
                event("join-company-register-submit", "회원사 등록 신청", "submit", "handleSubmit", "#main-content form",
                        Arrays.asList("join.company-register.page", "join.company-register.submit", "route.join.company-register-complete"), "입력값과 첨부 파일을 검증한 뒤 회원사 등록을 제출합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("join.company-register.page", "회원사 등록 초기 조회", "GET", "/join/api/company-register/page",
                        "JoinCompanyController.getCompanyRegisterPage", "JoinCompanyService.getCompanyRegisterPage",
                        "Session / init payload", Arrays.asList("HTTP_SESSION"), Arrays.asList("join-company-register-schema"),
                        "회원 유형과 초기 화면 데이터를 조회합니다."),
                api("join.company-register.duplicate-check", "기관명 중복 확인", "GET", "/join/checkCompanyNameDplct",
                        "JoinCompanyController.checkCompanyNameDuplicate", "JoinCompanyService.checkCompanyNameDuplicate",
                        "Institution lookup", Arrays.asList("COMTNINSTTINFO"), Arrays.asList("join-company-register-schema"),
                        "기관명 중복 여부를 확인합니다."),
                api("join.company-register.submit", "회원사 등록 제출", "POST", "/join/api/company-register",
                        "JoinCompanyController.submitCompanyRegister", "JoinCompanyService.submitJoinCompanyRegister",
                        "Company join submit", Arrays.asList("COMTNINSTTINFO", "COMTNINSTTFILE", "AUDIT_EVENT"), Arrays.asList("join-company-register-schema", "join-company-file-schema", "audit-event-schema"),
                        "회원사 등록 신청과 첨부 파일을 저장합니다."),
                routeApi("route.join.company-register-complete", "회원사 등록 완료 이동", "/join/companyRegisterComplete", "HMENU_JOIN_COMPANY_REGISTER_COMPLETE")
        ));
        page.put("schemas", Arrays.asList(
                schema("join-company-register-schema", "회원사 등록 스키마", "COMTNINSTTINFO",
                        Arrays.asList("INSTT_NM", "BIZRNO", "REPRSNT_NM", "ZIP", "ADRES", "DETAIL_ADRES", "CHARGER_NM", "CHARGER_EMAIL", "CHARGER_TEL"), Arrays.asList("SELECT", "INSERT"),
                        "회원사 등록 신청 본문을 저장합니다."),
                schema("join-company-file-schema", "회원사 등록 첨부 스키마", "COMTNINSTTFILE",
                        Arrays.asList("ATCH_FILE_ID", "FILE_SN", "ORIGNL_FILE_NM", "FILE_STRE_COURS"), Arrays.asList("INSERT"),
                        "회원사 등록 증빙 파일을 저장합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("JOIN_COMPANY_MEMBERSHIP", "회원사 유형", Arrays.asList("EMITTER", "INSTITUTION", "SUPPLIER"), "회원사 등록 유형 분기입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildJoinCompanyRegisterCompletePage() {
        Map<String, Object> page = pageOption("join-company-register-complete", "회원사 등록 완료", "/join/companyRegisterComplete", "HMENU_JOIN_COMP_REG_DONE", "join");
        page.put("summary", "회원사 등록 신청 완료 안내와 신청 내역 요약을 보여주는 결과 화면입니다.");
        page.put("source", "frontend/src/features/join-company-register/JoinCompanyRegisterCompleteMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("join-company-register-complete-summary", "등록 완료 요약", "#main-content .text-center", "JoinCompanyRegisterCompleteSummary", "content",
                        Collections.emptyList(), "등록 완료 메시지와 요약 정보를 보여줍니다."),
                surface("join-company-register-complete-actions", "등록 완료 액션", "#main-content .flex.flex-col.items-center", "JoinCompanyRegisterCompleteActions", "actions",
                        Arrays.asList("join-company-register-complete-home", "join-company-register-complete-status"), "홈 이동과 현황 조회 안내로 이동합니다.")
        ));
        page.put("events", Arrays.asList(
                event("join-company-register-complete-home", "완료 후 홈 이동", "click", "handleHome", "#main-content button",
                        Arrays.asList("join.session.reset", "route.home"), "가입 세션을 초기화하고 홈으로 이동합니다."),
                event("join-company-register-complete-status", "현황 안내 이동", "click", "handleStatus", "#main-content button",
                        Arrays.asList("route.join.company-status-guide"), "가입 현황 안내 페이지로 이동합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("join.session.reset", "가입 세션 초기화", "POST", "/join/api/reset",
                        "JoinSessionController.resetJoinSession", "JoinSessionService.resetJoinSession",
                        "Session-backed", Arrays.asList("HTTP_SESSION"), Arrays.asList("join-session-schema"),
                        "완료 후 가입 세션을 정리합니다."),
                routeApi("route.home", "홈 이동", "/home", "HMENU_HOME"),
                routeApi("route.join.company-status-guide", "가입 현황 안내 이동", "/join/companyJoinStatusGuide", "HMENU_JOIN_COMP_STAT_GUIDE")
        ));
        page.put("schemas", Arrays.asList(
                schema("join-company-register-complete-schema", "회원사 등록 완료 요약 모델", "SESSION_STORAGE / QUERY_STRING",
                        Arrays.asList("insttNm", "bizrno", "regDate"), Arrays.asList("READ"),
                        "등록 완료 요약 표시값을 구성합니다.")
        ));
        page.put("commonCodeGroups", Collections.emptyList());
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildJoinCompanyStatusPage() {
        Map<String, Object> page = pageOption("join-company-status", "회원사 가입 현황 조회", "/join/companyJoinStatusSearch", "HMENU_JOIN_COMPANY_STATUS", "join");
        page.put("summary", "사업자등록번호 또는 신청번호 기준으로 회원사 가입 현황을 조회하는 검색 화면입니다.");
        page.put("source", "frontend/src/features/join-company-status/JoinCompanyStatusMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("join-company-status-search", "가입 현황 조회 폼", "#main-content", "JoinCompanyStatusSearchForm", "content",
                        Arrays.asList("join-company-status-mode-change", "join-company-status-search"), "조회 방식과 입력값을 선택합니다.")
        ));
        page.put("events", Arrays.asList(
                event("join-company-status-mode-change", "조회 방식 전환", "click", "setMode", "#main-content button",
                        Collections.emptyList(), "사업자번호 조회와 신청번호 조회 모드를 전환합니다."),
                event("join-company-status-search", "가입 현황 상세 이동", "click", "handleSearch", "#main-content button",
                        Arrays.asList("route.join.company-status-detail"), "입력값 검증 후 상세 현황 화면으로 이동합니다.")
        ));
        page.put("apis", Arrays.asList(
                routeApi("route.join.company-status-detail", "가입 현황 상세 이동", "/join/companyJoinStatusDetail", "HMENU_JOIN_COMPANY_STATUS_DETAIL")
        ));
        page.put("schemas", Collections.emptyList());
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("COMPANY_STATUS_SEARCH_MODE", "회원사 현황 조회 방식", Arrays.asList("biz", "app"), "사업자번호/신청번호 조회 분기입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildJoinCompanyStatusGuidePage() {
        Map<String, Object> page = pageOption("join-company-status-guide", "회원사 가입 현황 안내", "/join/companyJoinStatusGuide", "HMENU_JOIN_COMP_STAT_GUIDE", "join");
        page.put("summary", "회원사 가입 현황 조회 절차와 본인확인 안내를 보여주는 가이드 화면입니다.");
        page.put("source", "frontend/src/features/join-company-status/JoinCompanyStatusMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("join-company-status-guide", "가입 현황 조회 안내", "#main-content", "JoinCompanyStatusGuide", "content",
                        Arrays.asList("join-company-status-guide-start"), "조회 전 본인확인 및 조회 조건 안내를 제공합니다.")
        ));
        page.put("events", Arrays.asList(
                event("join-company-status-guide-start", "현황 조회 시작", "click", "goSearchPage", "#main-content button",
                        Arrays.asList("route.join.company-status"), "가입 현황 검색 페이지로 이동합니다.")
        ));
        page.put("apis", Arrays.asList(
                routeApi("route.join.company-status", "가입 현황 조회 이동", "/join/companyJoinStatusSearch", "HMENU_JOIN_COMPANY_STATUS")
        ));
        page.put("schemas", Collections.emptyList());
        page.put("commonCodeGroups", Collections.emptyList());
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildJoinCompanyStatusDetailPage() {
        Map<String, Object> page = pageOption("join-company-status-detail", "회원사 가입 현황 상세", "/join/companyJoinStatusDetail", "HMENU_JOIN_COMP_STAT_DETAIL", "join");
        page.put("summary", "회원사 가입 신청 상세 상태, 첨부 파일, 반려 사유와 재신청 진입을 제공하는 상세 조회 화면입니다.");
        page.put("source", "frontend/src/features/join-company-status/JoinCompanyStatusMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("join-company-status-detail-summary", "가입 현황 요약 카드", "#main-content .bg-white.border.border-gray-200.rounded-xl.shadow-sm.overflow-hidden", "JoinCompanyStatusDetailSummary", "content",
                        Arrays.asList("join-company-status-detail-load"), "기관명, 사업자번호, 대표자명, 신청일, 신청번호를 보여줍니다."),
                surface("join-company-status-detail-timeline", "상태 타임라인", "#main-content .bg-white.border.border-gray-200.rounded-xl.shadow-sm.p-10", "JoinCompanyStatusTimeline", "content",
                        Collections.emptyList(), "신청 완료, 검토, 승인/반려 상태를 시각화합니다."),
                surface("join-company-status-detail-files", "첨부 파일 목록", "#main-content ul.divide-y.divide-gray-100", "JoinCompanyStatusFiles", "content",
                        Arrays.asList("join-company-status-file-download"), "첨부 파일 목록과 다운로드 액션을 제공합니다."),
                surface("join-company-status-detail-actions", "상세 하단 액션", "#main-content .flex.items-center.justify-center.gap-4", "JoinCompanyStatusActions", "actions",
                        Arrays.asList("join-company-status-back", "join-company-status-reapply", "join-company-status-home"), "뒤로가기, 재신청, 홈 이동 액션을 제공합니다.")
        ));
        page.put("events", Arrays.asList(
                event("join-company-status-detail-load", "가입 현황 상세 조회", "load", "fetchJoinCompanyStatusDetail", "#main-content",
                        Arrays.asList("join.company-status.detail"), "조회 조건 기준 상세 상태와 첨부 목록을 불러옵니다."),
                event("join-company-status-file-download", "첨부 파일 다운로드", "click", "navigate", "#main-content ul button",
                        Arrays.asList("route.join.company-status.file-download"), "기관 첨부 파일 다운로드 경로로 이동합니다."),
                event("join-company-status-back", "상세 뒤로가기", "click", "window.history.back", "#main-content button",
                        Collections.emptyList(), "이전 화면으로 돌아갑니다."),
                event("join-company-status-reapply", "반려 재신청 이동", "click", "navigate", "#main-content button",
                        Arrays.asList("route.join.company-reapply"), "반려된 신청을 재신청 화면으로 넘깁니다."),
                event("join-company-status-home", "상세 홈 이동", "click", "goHome", "#main-content button",
                        Arrays.asList("route.home"), "홈 화면으로 이동합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("join.company-status.detail", "회원사 가입 현황 상세 조회", "GET", "/join/api/company-status/detail",
                        "JoinCompanyController.fetchJoinCompanyStatusDetail", "JoinCompanyService.fetchJoinCompanyStatusDetail",
                        "Institution join status lookup", Arrays.asList("COMTNINSTTINFO", "COMTNINSTTFILE"), Arrays.asList("join-company-status-schema", "join-company-file-schema"),
                        "회원사 가입 상태와 첨부 파일 목록을 조회합니다."),
                routeApi("route.join.company-status.file-download", "가입 첨부 파일 다운로드", "/join/downloadInsttFile", "FILE_DOWNLOAD"),
                routeApi("route.join.company-reapply", "반려 재신청 이동", "/join/companyReapply", "HMENU_JOIN_COMPANY_REAPPLY"),
                routeApi("route.home", "홈 이동", "/home", "HMENU_HOME")
        ));
        page.put("schemas", Arrays.asList(
                schema("join-company-status-schema", "회원사 가입 상태 스키마", "COMTNINSTTINFO",
                        Arrays.asList("INSTT_ID", "INSTT_NM", "BIZRNO", "REPRSNT_NM", "INSTT_STTUS", "RJCT_RSN", "LAST_UPDT_PNTTM"), Arrays.asList("SELECT"),
                        "회원사 가입 상세 상태와 반려 사유를 조회합니다."),
                schema("join-company-file-schema", "회원사 첨부 스키마", "COMTNINSTTFILE",
                        Arrays.asList("FILE_ID", "ORIGNL_FILE_NM", "STRE_FILE_NM"), Arrays.asList("SELECT"),
                        "상세 상태 화면의 첨부 파일 목록을 구성합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("JOIN_STATUS", "회원사 가입 상태", Arrays.asList("A", "P", "R", "X"), "검토중, 승인, 반려, 차단 상태 코드입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildJoinCompanyReapplyPage() {
        Map<String, Object> page = pageOption("join-company-reapply", "회원사 재신청", "/join/companyReapply", "HMENU_JOIN_COMPANY_REAPPLY", "join");
        page.put("summary", "반려된 회원사 신청 정보를 불러와 수정 후 재신청하는 화면입니다.");
        page.put("source", "frontend/src/features/join-company-reapply/JoinCompanyReapplyMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("join-company-reapply-lookup", "재신청 대상 조회", "#lookup-bizNo", "JoinCompanyReapplyLookup", "actions",
                        Arrays.asList("join-company-reapply-load"), "사업자등록번호와 대표자명으로 기존 신청을 조회합니다."),
                surface("join-company-reapply-form", "재신청 수정 폼", "#main-content .space-y-12", "JoinCompanyReapplyForm", "content",
                        Arrays.asList("join-company-reapply-address-search", "join-company-reapply-submit"), "기존 신청 정보를 수정합니다."),
                surface("join-company-reapply-files", "재신청 첨부 업로드", "#main-content .join-upload-row", "JoinCompanyReapplyFiles", "content",
                        Arrays.asList("join-company-reapply-file-add", "join-company-reapply-file-remove"), "증빙 파일을 다시 업로드합니다.")
        ));
        page.put("events", Arrays.asList(
                event("join-company-reapply-load", "재신청 대상 조회", "click", "handleLookup", "#main-content button",
                        Arrays.asList("join.company-reapply.page"), "기존 반려 신청을 불러옵니다."),
                event("join-company-reapply-address-search", "주소 검색", "click", "openAddressSearch", "#main-content button",
                        Collections.emptyList(), "주소 검색 위젯을 실행합니다."),
                event("join-company-reapply-file-add", "파일 행 추가", "click", "addFileRow", "#main-content .join-upload-add-btn",
                        Collections.emptyList(), "재신청 첨부 행을 추가합니다."),
                event("join-company-reapply-file-remove", "파일 행 제거", "click", "removeFileRow", "#main-content .join-upload-remove-btn",
                        Collections.emptyList(), "재신청 첨부 행을 제거합니다."),
                event("join-company-reapply-submit", "재신청 제출", "click", "handleSubmit", "#main-content button",
                        Arrays.asList("join.company-reapply.submit"), "수정된 정보와 첨부 파일로 재신청을 제출합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("join.company-reapply.page", "회원사 재신청 조회", "GET", "/join/api/company-reapply/page",
                        "JoinCompanyController.getCompanyReapplyPage", "JoinCompanyService.fetchJoinCompanyReapplyPage",
                        "Institution lookup", Arrays.asList("COMTNINSTTINFO", "COMTNINSTTFILE"), Arrays.asList("join-company-register-schema", "join-company-file-schema"),
                        "반려된 회원사 신청 정보와 기존 첨부를 조회합니다."),
                api("join.company-reapply.submit", "회원사 재신청 제출", "POST", "/join/api/company-reapply",
                        "JoinCompanyController.submitCompanyReapply", "JoinCompanyService.submitJoinCompanyReapply",
                        "Company join resubmit", Arrays.asList("COMTNINSTTINFO", "COMTNINSTTFILE", "AUDIT_EVENT"), Arrays.asList("join-company-register-schema", "join-company-file-schema", "audit-event-schema"),
                        "수정된 정보와 새 첨부 파일로 재신청을 저장합니다.")
        ));
        page.put("schemas", Arrays.asList(
                schema("join-company-register-schema", "회원사 등록 스키마", "COMTNINSTTINFO",
                        Arrays.asList("INSTT_ID", "INSTT_NM", "BIZRNO", "REPRSNT_NM", "ZIP", "ADRES", "DETAIL_ADRES", "CHARGER_NM", "CHARGER_EMAIL", "CHARGER_TEL"), Arrays.asList("SELECT", "UPDATE"),
                        "반려된 회원사 정보를 수정 저장합니다."),
                schema("join-company-file-schema", "회원사 첨부 스키마", "COMTNINSTTFILE",
                        Arrays.asList("ATCH_FILE_ID", "FILE_SN", "ORIGNL_FILE_NM", "FILE_STRE_COURS"), Arrays.asList("SELECT", "INSERT", "DELETE"),
                        "재신청 첨부 파일을 다시 관리합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("JOIN_STATUS", "회원사 가입 상태", Arrays.asList("A", "P", "R", "X"), "가입 현황 및 재신청 상태 코드입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildJoinTermsPage() {
        Map<String, Object> page = pageOption("join-terms", "약관 동의", "/join/step2", "HMENU_JOIN_STEP2", "join");
        page.put("summary", "필수 약관과 마케팅 동의를 저장하고 다음 단계로 이동하는 가입 2단계 화면입니다.");
        page.put("source", "frontend/src/features/join-wizard/JoinTermsMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("join-step2-all-agree", "전체 동의 박스", "[data-help-id=\"join-step2-all-agree\"]", "JoinTermsAllAgree", "content",
                        Arrays.asList("join-terms-toggle-all"), "필수 약관 전체 동의를 제어합니다."),
                surface("join-step2-required-terms", "필수 약관 목록", "[data-help-id=\"join-step2-required-terms\"]", "JoinRequiredTerms", "content",
                        Arrays.asList("join-terms-submit"), "필수 약관 동의 항목을 보여줍니다."),
                surface("join-step2-marketing", "마케팅 동의", "[data-help-id=\"join-step2-marketing\"]", "JoinMarketingConsent", "content",
                        Arrays.asList("join-terms-marketing-save"), "선택 마케팅 수신 여부를 저장합니다.")
        ));
        page.put("events", Arrays.asList(
                event("join-terms-toggle-all", "전체 약관 동의", "change", "setAgreeTerms / setAgreePrivacy", "[data-help-id=\"join-step2-all-agree\"] input",
                        Collections.emptyList(), "전체 약관 체크 상태를 변경합니다."),
                event("join-terms-marketing-save", "마케팅 동의 저장", "change", "handleMarketingChange", "[data-help-id=\"join-step2-marketing\"] input",
                        Arrays.asList("join.step2.save"), "마케팅 동의 상태를 저장합니다."),
                event("join-terms-submit", "약관 동의 다음 단계", "submit", "handleNext", "[data-help-id=\"join-step2-required-terms\"] form",
                        Arrays.asList("join.step2.save", "route.join.step3"), "필수 약관 동의를 검증하고 다음 단계로 이동합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("join.step2.save", "가입 2단계 저장", "POST", "/join/api/step2",
                        "JoinSessionController.saveStep2", "JoinSessionService.saveStep2",
                        "Session-backed", Arrays.asList("HTTP_SESSION"), Arrays.asList("join-session-schema"),
                        "마케팅 동의와 단계 상태를 세션에 저장합니다."),
                routeApi("route.join.step3", "가입 3단계 이동", "/join/step3", "HMENU_JOIN_STEP3")
        ));
        page.put("schemas", Arrays.asList(
                schema("join-session-schema", "가입 세션 모델", "HTTP_SESSION",
                        Arrays.asList("marketingYn", "step", "joinVO"), Arrays.asList("SESSION_WRITE"),
                        "가입 2단계 상태를 세션에 저장합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("JOIN_STEP", "가입 단계", Arrays.asList("STEP2", "STEP3"), "가입 단계 진행 코드입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildJoinAuthPage() {
        Map<String, Object> page = pageOption("join-auth", "본인 확인", "/join/step3", "HMENU_JOIN_STEP3", "join");
        page.put("summary", "본인인증 수단을 선택하고 가입 4단계로 진입하는 사용자 가입 3단계 화면입니다.");
        page.put("source", "frontend/src/features/join-wizard/JoinAuthMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("join-step3-methods", "본인확인 수단 선택", "[data-help-id=\"join-step3-methods\"]", "JoinAuthMethodGrid", "content",
                        Arrays.asList("join-auth-select-method"), "원패스, 공동인증서, 금융인증서, 간편인증, 이메일 인증 수단을 선택합니다.")
        ));
        page.put("events", Arrays.asList(
                event("join-auth-select-method", "본인확인 수단 선택", "click", "handleAuth", "[data-help-id=\"join-step3-methods\"] button",
                        Arrays.asList("join.step3.save", "route.join.step4"), "선택한 본인확인 수단을 저장하고 다음 단계로 이동합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("join.step3.save", "가입 3단계 저장", "POST", "/join/api/step3",
                        "JoinSessionController.saveStep3", "JoinSessionService.saveStep3",
                        "Session-backed", Arrays.asList("HTTP_SESSION"), Arrays.asList("join-session-schema"),
                        "선택한 본인확인 수단을 세션에 저장합니다."),
                routeApi("route.join.step4", "가입 4단계 이동", "/join/step4", "HMENU_JOIN_STEP4")
        ));
        page.put("schemas", Arrays.asList(
                schema("join-session-schema", "가입 세션 모델", "HTTP_SESSION",
                        Arrays.asList("verifiedIdentity", "authMethod", "step"), Arrays.asList("SESSION_WRITE"),
                        "가입 본인확인 상태를 세션에 저장합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("JOIN_AUTH_METHOD", "가입 본인확인 수단", Arrays.asList("ONEPASS", "JOINT", "FINANCIAL", "SIMPLE", "EMAIL"), "가입 3단계 인증 수단 코드입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildJoinCompletePage() {
        Map<String, Object> page = pageOption("join-complete", "가입 완료", "/join/step5", "HMENU_JOIN_STEP5", "join");
        page.put("summary", "가입 완료 결과와 신청자 정보를 보여주고 홈으로 이동시키는 최종 단계 화면입니다.");
        page.put("source", "frontend/src/features/join-wizard/JoinCompleteMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("join-step5-summary", "가입 완료 요약", "[data-help-id=\"join-step5-summary\"]", "JoinCompleteSummary", "content",
                        Collections.emptyList(), "신청 완료 메시지와 신청자 정보를 보여줍니다."),
                surface("join-step5-actions", "가입 완료 액션", "[data-help-id=\"join-step5-actions\"]", "JoinCompleteActions", "actions",
                        Arrays.asList("join-complete-home"), "홈으로 이동 액션을 제공합니다.")
        ));
        page.put("events", Arrays.asList(
                event("join-complete-home", "가입 완료 후 홈 이동", "click", "handleHome", "[data-help-id=\"join-step5-actions\"] button",
                        Arrays.asList("join.session.reset", "route.home"), "가입 세션을 정리하고 홈으로 이동합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("join.session.reset", "가입 세션 초기화", "POST", "/join/api/reset",
                        "JoinSessionController.resetJoinSession", "JoinSessionService.resetJoinSession",
                        "Session-backed", Arrays.asList("HTTP_SESSION"), Arrays.asList("join-session-schema"),
                        "가입 완료 후 세션 상태를 초기화합니다."),
                routeApi("route.home", "홈 이동", "/home", "HMENU_HOME")
        ));
        page.put("schemas", Arrays.asList(
                schema("join-session-schema", "가입 완료 세션 모델", "HTTP_SESSION",
                        Arrays.asList("mberId", "mberNm", "insttNm"), Arrays.asList("SESSION_READ", "SESSION_DELETE"),
                        "가입 완료 표시용 사용자 정보를 읽고 세션을 정리합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("JOIN_RESULT", "가입 결과", Arrays.asList("SUBMITTED", "APPROVED"), "가입 완료 상태 구분입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildJoinInfoPage() {
        Map<String, Object> page = pageOption("join-info", "정보 입력", "/join/step4", "HMENU_JOIN_STEP4", "join");
        page.put("summary", "사용자 정보, 기관 정보, 증빙 파일을 입력하고 가입 신청을 완료하는 가입 4단계 화면입니다.");
        page.put("source", "frontend/src/features/join-wizard/JoinInfoMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("join-step4-user", "사용자 정보 입력", "[data-help-id=\"join-step4-user\"]", "JoinUserInfoForm", "content",
                        Arrays.asList("join-info-id-check", "join-info-email-check", "join-info-address-search"), "아이디, 비밀번호, 연락처, 이메일, 주소를 입력합니다."),
                surface("join-step4-org", "기관 정보 입력", "[data-help-id=\"join-step4-org\"]", "JoinOrganizationForm", "content",
                        Arrays.asList("join-info-company-search-open"), "기관명, 사업자번호, 대표자, 부서 정보를 입력합니다."),
                surface("join-step4-files", "증빙 파일 업로드", "[data-help-id=\"join-step4-files\"]", "JoinFileUploadSection", "content",
                        Arrays.asList("join-info-file-add", "join-info-file-remove"), "증빙 첨부를 추가하거나 삭제합니다.")
        ));
        page.put("events", Arrays.asList(
                event("join-info-id-check", "아이디 중복 확인", "click", "handleCheckId", "[data-help-id=\"join-step4-user\"] button",
                        Arrays.asList("join.step4.check-id"), "입력한 가입 아이디의 중복 여부를 확인합니다."),
                event("join-info-email-check", "이메일 중복 확인", "click", "handleCheckEmail", "[data-help-id=\"join-step4-user\"] button",
                        Arrays.asList("join.step4.check-email"), "입력한 이메일 주소의 중복 여부를 확인합니다."),
                event("join-info-address-search", "주소 검색", "click", "openAddressSearch", "[data-help-id=\"join-step4-user\"] button",
                        Collections.emptyList(), "외부 주소 검색 위젯을 열어 우편번호와 주소를 채웁니다."),
                event("join-info-company-search-open", "기관 검색 모달 열기", "click", "handleOpenCompanySearch", "[data-help-id=\"join-step4-org\"] button",
                        Arrays.asList("join.step4.company-search"), "기관 검색 모달을 열고 기관 후보를 조회합니다."),
                event("join-info-file-add", "증빙 파일 행 추가", "click", "addFileRow", "[data-help-id=\"join-step4-files\"] .join-upload-add-btn",
                        Collections.emptyList(), "추가 업로드 행을 생성합니다."),
                event("join-info-file-remove", "증빙 파일 행 제거", "click", "removeFileRow", "[data-help-id=\"join-step4-files\"] .join-upload-remove-btn",
                        Collections.emptyList(), "선택한 업로드 행을 제거합니다."),
                event("join-info-submit", "가입 신청 제출", "submit", "handleSubmit", ".join-step4-screen form",
                        Arrays.asList("join.step4.submit", "route.join.step5"), "입력값과 첨부 파일을 검증한 뒤 가입 신청을 완료합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("join.step4.check-id", "가입 아이디 중복 확인", "GET", "/join/api/check-id",
                        "JoinSessionController.checkJoinMemberId", "JoinSessionService.checkJoinMemberId",
                        "Member lookup", Arrays.asList("COMVNUSERMASTER"), Arrays.asList("join-member-check-schema"),
                        "가입 아이디 중복 여부를 조회합니다."),
                api("join.step4.check-email", "가입 이메일 중복 확인", "GET", "/join/api/check-email",
                        "JoinSessionController.checkJoinEmail", "JoinSessionService.checkJoinEmail",
                        "Member lookup", Arrays.asList("COMVNUSERMASTER"), Arrays.asList("join-member-check-schema"),
                        "가입 이메일 주소 중복 여부를 조회합니다."),
                api("join.step4.company-search", "기관 검색", "GET", "/join/api/companies",
                        "JoinSessionController.searchJoinCompanies", "JoinSessionService.searchJoinCompanies",
                        "Institution lookup", Arrays.asList("COMTNINSTTINFO"), Arrays.asList("join-company-search-schema"),
                        "기관명 또는 사업자번호로 가입 대상 기관을 검색합니다."),
                api("join.step4.submit", "가입 4단계 제출", "POST", "/join/api/step4",
                        "JoinSessionController.submitJoinStep4", "JoinSessionService.submitJoinStep4",
                        "Join submit", Arrays.asList("COMVNUSERMASTER", "COMTNINSTTINFO", "COMTNFILE", "AUDIT_EVENT"), Arrays.asList("join-step4-schema", "join-file-schema", "audit-event-schema"),
                        "가입 신청 정보와 첨부 파일을 저장하고 완료 단계 데이터로 넘깁니다."),
                routeApi("route.join.step5", "가입 완료 이동", "/join/step5", "HMENU_JOIN_STEP5")
        ));
        page.put("schemas", Arrays.asList(
                schema("join-member-check-schema", "가입 중복 확인 스키마", "COMVNUSERMASTER",
                        Arrays.asList("USER_ID", "EMAIL_ADRES"), Arrays.asList("SELECT"),
                        "가입 아이디와 이메일 중복 확인에 사용됩니다."),
                schema("join-company-search-schema", "가입 기관 검색 스키마", "COMTNINSTTINFO",
                        Arrays.asList("INSTT_ID", "INSTT_NM", "BIZRNO", "CXFC"), Arrays.asList("SELECT"),
                        "기관 검색 모달 결과를 구성합니다."),
                schema("join-step4-schema", "가입 신청 스키마", "COMVNUSERMASTER / COMTNINSTTINFO",
                        Arrays.asList("MBER_ID", "MBER_NM", "PASSWORD", "INSTT_ID", "DEPT_NM", "EMAIL_ADRES", "MOBLPHON_NO"), Arrays.asList("INSERT", "UPDATE"),
                        "가입 신청 사용자와 기관 연계 정보를 저장합니다."),
                schema("join-file-schema", "가입 첨부 스키마", "COMTNFILE",
                        Arrays.asList("ATCH_FILE_ID", "FILE_SN", "ORIGNL_FILE_NM", "FILE_STRE_COURS"), Arrays.asList("INSERT"),
                        "가입 증빙 파일 업로드 메타데이터를 저장합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("JOIN_UPLOAD_TYPE", "가입 첨부 분류", Arrays.asList("BUSINESS_CERT", "EMPLOYMENT_CERT"), "가입 첨부 분류 코드입니다."),
                codeGroup("JOIN_STEP", "가입 단계", Arrays.asList("STEP4", "STEP5"), "가입 정보 입력과 완료 단계 구분입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildMypagePage() {
        Map<String, Object> page = pageOption("mypage", "마이페이지", "/mypage", "HMENU_MYPAGE", "home");
        page.put("summary", "기본 정보, 기관 정보, 인증 연동 상태를 조회/수정하는 사용자 마이페이지 화면입니다.");
        page.put("source", "frontend/src/features/mypage/MypageMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("mypage-basic-info", "기본 정보 폼", "[data-help-id=\"mypage-basic-info\"]", "MypageBasicInfoForm", "content",
                        Arrays.asList("mypage-email-verify", "mypage-save"), "이름, 이메일, 연락처를 수정합니다."),
                surface("mypage-org-info", "기관 정보", "[data-help-id=\"mypage-org-info\"]", "MypageOrgInfoForm", "content",
                        Arrays.asList("mypage-save"), "기관명, 사업자번호, 직책을 보여줍니다."),
                surface("mypage-actions", "마이페이지 저장 액션", "[data-help-id=\"mypage-actions\"]", "MypageActions", "actions",
                        Arrays.asList("mypage-cancel", "mypage-save"), "취소와 저장 액션을 제공합니다.")
        ));
        page.put("events", Arrays.asList(
                event("mypage-email-verify", "이메일 변경 인증", "click", "handleEmailVerify", "[data-help-id=\"mypage-basic-info\"] button",
                        Arrays.asList("mypage.email.verify"), "이메일 변경 인증을 요청합니다."),
                event("mypage-cancel", "마이페이지 수정 취소", "click", "handleCancel", "[data-help-id=\"mypage-actions\"] .secondary",
                        Collections.emptyList(), "입력값을 초기 상태로 되돌립니다."),
                event("mypage-save", "마이페이지 저장", "submit", "handleSubmit", "[data-help-id=\"mypage-actions\"] .primary",
                        Arrays.asList("mypage.save"), "수정된 사용자 정보를 저장합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("mypage.email.verify", "이메일 변경 인증", "POST", "/api/mypage/email-verify",
                        "HomePageController.verifyEmailChange", "MypageService.verifyEmailChange",
                        "Mail verify flow", Arrays.asList("COMVNUSERMASTER"), Arrays.asList("mypage-schema"),
                        "이메일 변경 인증 절차를 시작합니다."),
                api("mypage.save", "마이페이지 저장", "POST", "/api/mypage/save",
                        "HomePageController.saveMypage", "MypageService.saveMypage",
                        "MypageMapper.updateUserInfo", Arrays.asList("COMVNUSERMASTER", "AUDIT_EVENT"), Arrays.asList("mypage-schema", "audit-event-schema"),
                        "사용자 마이페이지 수정 내용을 저장합니다.")
        ));
        page.put("schemas", Arrays.asList(
                schema("mypage-schema", "마이페이지 사용자 스키마", "COMVNUSERMASTER",
                        Arrays.asList("USER_ID", "USER_NM", "EMAIL_ADRES", "AREA_NO", "MIDDLE_TELNO", "END_TELNO", "OFCPS_NM"),
                        Arrays.asList("SELECT", "UPDATE"), "마이페이지 기본/기관 정보 저장에 사용됩니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("MYPAGE_AUTH_STATUS", "마이페이지 인증 연동 상태", Arrays.asList("CONNECTED", "DISCONNECTED"), "인증 연동 배지 상태입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildAuthChangePage() {
        Map<String, Object> page = pageOption("auth-change", "권한 변경", "/admin/member/auth-change", "AMENU_AUTH_CHANGE", "admin");
        page.put("summary", "관리자별 권한 그룹을 행 단위로 변경하는 운영 화면입니다.");
        page.put("source", "frontend/src/features/auth-change/AuthChangeMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("auth-change-summary", "권한 변경 요약", "[data-help-id=\"auth-change-summary\"]", "AuthChangeSummary", "actions",
                        Collections.emptyList(), "현재 로그인 사용자와 변경 대상 수를 보여줍니다."),
                surface("auth-change-table", "권한 변경 테이블", "[data-help-id=\"auth-change-table\"]", "AuthChangeTable", "content",
                        Arrays.asList("auth-change-page-load", "auth-change-save"), "행별 권한 그룹 선택과 저장을 제공합니다.")
        ));
        page.put("events", Arrays.asList(
                event("auth-change-page-load", "권한 변경 화면 조회", "load", "fetchAuthChangePage", "[data-help-id=\"auth-change-table\"]",
                        Arrays.asList("admin.auth-change.page"), "관리자 권한 변경 대상 목록과 권한 그룹 목록을 조회합니다."),
                event("auth-change-save", "권한 변경 저장", "click", "handleSave", "[data-help-id=\"auth-change-table\"] .primary-button",
                        Arrays.asList("admin.auth-change.save"), "선택한 관리자 권한 그룹을 저장합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.auth-change.page", "권한 변경 화면 조회", "GET", "/api/admin/auth-change/page",
                        "AdminMainController.getAuthChangePage", "AuthGroupManageService.selectAdminAuthorityAssignments",
                        "AuthGroupManageMapper.selectAdminAuthorityAssignments / selectAuthorList",
                        Arrays.asList("COMTNEMPLYRSCRTYESTBS", "COMTNAUTHORINFO"), Arrays.asList("admin-auth-change-schema", "author-group-schema"),
                        "관리자별 현재 권한과 선택 가능한 권한 그룹을 함께 조회합니다."),
                api("admin.auth-change.save", "권한 변경 저장", "POST", "/api/admin/auth-change/save",
                        "AdminMainController.saveAuthChange", "AuthGroupManageService.saveAdminAuthorityAssignment",
                        "AuthGroupManageMapper.upsertAdminAuthorityAssignment",
                        Arrays.asList("COMTNEMPLYRSCRTYESTBS", "AUDIT_EVENT"), Arrays.asList("admin-auth-change-schema", "audit-event-schema"),
                        "관리자별 권한 그룹을 저장합니다.")
        ));
        page.put("schemas", Arrays.asList(
                schema("admin-auth-change-schema", "관리자 권한 변경 스키마", "COMTNEMPLYRSCRTYESTBS",
                        Arrays.asList("EMPLYR_ID", "AUTHOR_CODE"), Arrays.asList("SELECT", "INSERT", "UPDATE"),
                        "관리자 계정별 권한 그룹 매핑을 저장합니다."),
                schema("author-group-schema", "권한 그룹 스키마", "COMTNAUTHORINFO",
                        Arrays.asList("AUTHOR_CODE", "AUTHOR_NM"), Arrays.asList("SELECT"), "권한 그룹 선택 목록입니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("EMP_STATUS", "관리자 상태", Arrays.asList("P", "D", "X"), "관리자 상태 표시값입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildDeptRolePage() {
        Map<String, Object> page = pageOption("dept-role", "부서 권한 맵핑", "/admin/member/dept-role-mapping", "AMENU_DEPT_ROLE", "admin");
        page.put("summary", "회사별 부서 기본 권한과 회원 권한을 함께 관리하는 운영 화면입니다.");
        page.put("source", "frontend/src/features/dept-role-mapping/DeptRoleMappingMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("dept-role-company", "회사 선택", "[data-help-id=\"dept-role-company\"]", "DeptRoleCompanySelector", "actions",
                        Arrays.asList("dept-role-page-load"), "대상 회사 범위를 선택합니다."),
                surface("dept-role-departments", "부서 권한 목록", "[data-help-id=\"dept-role-departments\"]", "DeptRoleDepartmentTable", "content",
                        Arrays.asList("dept-role-dept-save"), "부서별 기본 권한 그룹을 저장합니다."),
                surface("dept-role-members", "회원 권한 목록", "[data-help-id=\"dept-role-members\"]", "DeptRoleMemberTable", "content",
                        Arrays.asList("dept-role-member-save"), "회사 소속 회원의 권한 그룹을 저장합니다."),
                surface("dept-role-role-profile", "권한 그룹 프로필 미리보기", "[data-help-id=\"dept-role-role-profile\"]", "DeptRoleRoleProfilePreview", "content",
                        Collections.emptyList(), "선택된 권한 그룹이 회원 수정 화면에서 어떤 업무 역할과 우선 제공 업무로 보일지 미리 확인합니다.")
        ));
        page.put("events", Arrays.asList(
                event("dept-role-page-load", "부서 권한 화면 조회", "change", "fetchDeptRolePage", "[data-help-id=\"dept-role-company\"] select",
                        Arrays.asList("admin.dept-role.page"), "선택 회사 기준 부서/회원 권한 목록을 조회합니다."),
                event("dept-role-dept-save", "부서 권한 저장", "click", "handleDeptSave", "[data-help-id=\"dept-role-departments\"] .primary-button",
                        Arrays.asList("admin.dept-role.save"), "부서 기본 권한 그룹을 저장합니다."),
                event("dept-role-member-save", "회원 권한 저장", "click", "handleMemberSave", "[data-help-id=\"dept-role-members\"] .primary-button",
                        Arrays.asList("admin.dept-role.member-save"), "회사 소속 회원 권한 그룹을 저장합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.dept-role.page", "부서 권한 화면 조회", "GET", "/api/admin/dept-role-mapping/page",
                        "AdminMainController.getDeptRoleMappingPage", "AuthGroupManageService.selectDepartmentRolePage",
                        "AuthGroupManageMapper.selectDepartmentMappings / selectCompanyMembers / selectAuthorList",
                        Arrays.asList("COMTNDEPTAUTHORRELATE", "COMTNENTRPRSMBER", "COMTNAUTHORINFO"), Arrays.asList("dept-role-schema", "member-author-schema"),
                        "회사 범위별 부서/회원 권한 현황을 조회합니다."),
                api("admin.dept-role.save", "부서 권한 저장", "POST", "/api/admin/dept-role-mapping/save",
                        "AdminMainController.saveDeptRoleMapping", "AuthGroupManageService.saveDepartmentRoleMapping",
                        "AuthGroupManageMapper.upsertDepartmentRoleMapping",
                        Arrays.asList("COMTNDEPTAUTHORRELATE", "AUDIT_EVENT"), Arrays.asList("dept-role-schema", "audit-event-schema"),
                        "부서 기본 권한 그룹을 저장합니다."),
                api("admin.dept-role.member-save", "회원 권한 저장", "POST", "/api/admin/dept-role-mapping/member-save",
                        "AdminMainController.saveDeptRoleMember", "AuthGroupManageService.saveEnterpriseMemberRole",
                        "AuthGroupManageMapper.upsertEnterpriseMemberRole",
                        Arrays.asList("COMTNENTRPRSMBERAUTHORRELATE", "AUDIT_EVENT"), Arrays.asList("member-author-schema", "audit-event-schema"),
                        "회사 회원 권한 그룹을 저장합니다.")
        ));
        page.put("schemas", Arrays.asList(
                schema("dept-role-schema", "부서 권한 스키마", "COMTNDEPTAUTHORRELATE",
                        Arrays.asList("INSTT_ID", "DEPT_NM", "AUTHOR_CODE"), Arrays.asList("SELECT", "INSERT", "UPDATE"),
                        "회사별 부서 기본 권한 그룹을 저장합니다."),
                schema("member-author-schema", "회원 권한 스키마", "COMTNENTRPRSMBERAUTHORRELATE",
                        Arrays.asList("ENTRPRS_MBER_ID", "AUTHOR_CODE", "INSTT_ID"), Arrays.asList("SELECT", "INSERT", "UPDATE"),
                        "회사 회원 권한 그룹을 저장합니다."),
                schema("author-role-profile-schema", "권한 그룹 프로필 스키마", "data/author-role-profiles/profiles.json",
                        Arrays.asList("authorCode", "displayTitle", "priorityWorks", "description", "memberEditVisibleYn", "updatedAt"),
                        Arrays.asList("SELECT"),
                        "권한 그룹 프로필 미리보기 데이터에 사용됩니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("COMPANY_SCOPE", "회사 관리 범위", Arrays.asList("ALL", "OWN"), "전체 회사 또는 자기 회사 관리 범위입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildAdminListPage() {
        Map<String, Object> page = pageOption("admin-list", "관리자 목록", "/admin/member/admin_list", "AMENU_ADMIN_LIST", "admin");
        page.put("summary", "관리자 계정 검색, 상세/수정 이동, 엑셀 다운로드를 제공하는 운영 목록 화면입니다.");
        page.put("source", "frontend/src/features/admin-list/AdminListMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("admin-list-search", "관리자 검색", "[data-help-id=\"admin-list-search\"]", "AdminListSearchForm", "actions",
                        Arrays.asList("admin-list-search-submit"), "상태와 검색어로 관리자 계정을 조회합니다."),
                surface("admin-list-table", "관리자 목록 테이블", "[data-help-id=\"admin-list-table\"]", "AdminListTable", "content",
                        Arrays.asList("admin-list-page-load", "admin-list-move-permission"), "목록 페이징과 수정/상세 이동을 제공합니다.")
        ));
        page.put("events", Arrays.asList(
                event("admin-list-search-submit", "관리자 목록 조회", "submit", "load", "[data-help-id=\"admin-list-search\"] form",
                        Arrays.asList("admin.member.admin-list.page"), "검색 조건으로 관리자 목록을 조회합니다."),
                event("admin-list-page-load", "관리자 목록 페이지 이동", "click", "load", "[data-help-id=\"admin-list-table\"] nav button",
                        Arrays.asList("admin.member.admin-list.page"), "페이지 번호와 검색 조건으로 목록을 다시 조회합니다."),
                event("admin-list-move-permission", "관리자 권한 상세 이동", "click", "navigate", "[data-help-id=\"admin-list-table\"] a",
                        Arrays.asList("route.admin.member.admin-permission"), "관리자 권한 상세/수정 화면으로 이동합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.member.admin-list.page", "관리자 목록 조회", "GET", "/api/admin/member/admin-list/page",
                        "AdminMainController.adminListPageApi", "AdminMainController.populateAdminList",
                        "AdminMainMapper.selectAdminList / selectAdminListTotCnt",
                        Arrays.asList("COMTNEMPLYRINFO"), Arrays.asList("admin-list-schema"),
                        "검색 조건과 페이지 번호로 관리자 목록을 조회합니다."),
                routeApi("route.admin.member.admin-permission", "관리자 권한 상세/수정 이동", "/admin/member/admin_account/permissions", "AMENU_ADMIN_PERMISSION")
        ));
        page.put("schemas", Arrays.asList(
                schema("admin-list-schema", "관리자 목록 스키마", "COMTNEMPLYRINFO",
                        Arrays.asList("EMPLYR_ID", "USER_NM", "ORGNZT_ID", "EMAIL_ADRES", "EMPLYR_STTUS_CODE"),
                        Arrays.asList("SELECT"), "관리자 계정 목록 조회에 사용됩니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("ADMIN_STATUS", "관리자 상태", Arrays.asList("P", "A", "R", "D", "X"), "관리자 목록 상태 배지에 사용됩니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildMemberListPage() {
        Map<String, Object> page = pageOption("member-list", "회원 목록", "/admin/member/list", "AMENU_MEMBER_LIST", "admin");
        page.put("summary", "회원 목록 검색, 상태 필터, 상세 이동, 승인 연계가 집중되는 관리자 목록 화면입니다.");
        page.put("source", "frontend/src/features/member-list/MemberListMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("member-search-form", "검색 폼", "[data-help-id=\"member-search-form\"]", "MemberSearchForm", "actions",
                        Arrays.asList("member-search-submit", "member-search-reset"), "검색어, 회원유형, 상태 필터를 조합합니다."),
                surface("member-table", "회원 목록 테이블", "[data-help-id=\"member-table\"]", "MemberTable", "content",
                        Arrays.asList("member-row-detail", "member-row-approve"), "행 단위 상세 진입과 승인 화면 연결을 제공합니다.")
        ));
        page.put("events", Arrays.asList(
                event("member-search-submit", "목록 조회", "submit", "handleSearch", "[data-help-id=\"member-list-search\"]",
                        Arrays.asList("admin.member.list.page"), "검색 조건으로 회원 목록을 다시 조회합니다."),
                event("member-search-reset", "검색 초기화", "click", "handleResetFilters", "[data-help-id=\"member-list-search\"] button[type=\"reset\"]",
                        Collections.emptyList(), "입력값을 초기화한 뒤 기본 조건으로 복귀합니다."),
                event("member-row-detail", "상세 보기", "click", "handleMoveDetail", "[data-help-id=\"member-table\"] [data-action=\"detail\"]",
                        Arrays.asList("route.admin.member.detail"), "선택한 회원 상세 화면으로 이동합니다."),
                event("member-row-approve", "승인 화면 이동", "click", "handleMoveApprove", "[data-help-id=\"member-table\"] [data-action=\"approve\"]",
                        Arrays.asList("route.admin.member.approve"), "회원 승인/반려 흐름으로 이어집니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.member.list.page", "회원 목록 조회", "GET", "/api/admin/member/list/page",
                        "AdminMainController.memberListPageApi / AdminMainController.populateMemberList",
                        "EnterpriseMemberService.selectEntrprsMberListTotCnt / EnterpriseMemberService.selectEntrprsMberList",
                        "EntrprsManageMapper.selectEntrprsMberList / selectEntrprsMberListTotCnt",
                        Arrays.asList("COMTNENTRPRSMBER"), Arrays.asList("member-list-query"),
                        "검색조건에 따라 관리자 목록을 조회합니다."),
                routeApi("route.admin.member.detail", "회원 상세 화면 이동", "/admin/member/detail", "AMENU_MEMBER_DETAIL"),
                routeApi("route.admin.member.approve", "회원 승인 화면 이동", "/admin/member/approve", "AMENU_MEMBER_APPROVE")
        ));
        page.put("schemas", Arrays.asList(
                schema("member-list-query", "회원 목록 조회 모델", "COMTNENTRPRSMBER",
                        Arrays.asList("ENTRPRS_MBER_ID", "APPLCNT_NM", "SBSCRB_STTUS", "MBER_TY_CODE", "CMPNY_NM"),
                        Arrays.asList("SELECT"), "회원 상태/유형/기업명 조회에 사용됩니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("AMENU1", "관리자 메뉴 코드", Arrays.asList("AMENU_MEMBER_LIST", "AMENU_MEMBER_DETAIL", "AMENU_MEMBER_APPROVE"),
                        "메뉴/페이지 기능 권한 연결에 사용됩니다."),
                codeGroup("MEMBER_STATUS", "회원 상태", Arrays.asList("신청", "승인", "반려", "재신청"),
                        "목록 필터와 상태 배지에 반영됩니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildCompanyListPage() {
        Map<String, Object> page = pageOption("company-list", "회원사 목록", "/admin/member/company_list", "AMENU_COMPANY_LIST", "admin");
        page.put("summary", "회원사 목록 검색, 상태 필터, 상세 이동이 집중되는 관리자 회원사 목록 화면입니다.");
        page.put("source", "frontend/src/features/company-list/CompanyListMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("company-list-search-form", "회원사 검색 폼", "[data-help-id=\"company-list-search\"]", "CompanyListSearchForm", "actions",
                        Collections.singletonList("company-list-search-submit"), "검색어와 상태 필터로 회원사 목록을 조회합니다."),
                surface("company-list-table", "회원사 목록 테이블", "[data-help-id=\"company-list-table\"]", "CompanyListTable", "content",
                        Arrays.asList("company-list-row-detail", "company-list-export"), "행 단위 상세 이동과 엑셀 내보내기를 제공합니다.")
        ));
        page.put("events", Arrays.asList(
                event("company-list-search-submit", "회원사 목록 조회", "submit", "handleSearch", "[data-help-id=\"company-list-search\"] form",
                        Arrays.asList("admin.member.company-list.page"), "검색 조건으로 회원사 목록을 다시 조회합니다."),
                event("company-list-row-detail", "회원사 상세 이동", "click", "handleMoveDetail", "[data-help-id=\"company-list-table\"] [data-action=\"detail\"]",
                        Arrays.asList("route.admin.member.company-detail"), "선택한 회원사 상세 화면으로 이동합니다."),
                event("company-list-export", "회원사 엑셀 다운로드", "click", "handleExportExcel", "[data-help-id=\"company-list-search\"] a[href*=\"company_list/excel\"]",
                        Arrays.asList("route.admin.member.company-list-excel"), "현재 조건으로 회원사 목록 엑셀을 내려받습니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.member.company-list.page", "회원사 목록 조회", "GET", "/api/admin/member/company-list/page",
                        "AdminMainController.companyListPageApi", "AdminMainController.populateCompanyList",
                        "EntrprsManageService.searchCompanyListPaged",
                        Arrays.asList("COMTNINSTTINFO"), Arrays.asList("company-list-query"),
                        "검색조건에 따라 회원사 목록을 조회합니다."),
                routeApi("route.admin.member.company-detail", "회원사 상세 화면 이동", "/admin/member/company_detail", "AMENU_COMPANY_DETAIL"),
                routeApi("route.admin.member.company-list-excel", "회원사 엑셀 다운로드", "/admin/member/company_list/excel", "AMENU_COMPANY_LIST")
        ));
        page.put("schemas", Arrays.asList(
                schema("company-list-query", "회원사 목록 조회 모델", "COMTNINSTTINFO",
                        Arrays.asList("INSTT_ID", "CMPNY_NM", "BIZRNO", "RPRSNTV_NM", "SBSCRB_STTUS"),
                        Arrays.asList("SELECT"), "회원사 상태/기관명/대표자 조회에 사용됩니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("AMENU1", "관리자 메뉴 코드", Arrays.asList("AMENU_COMPANY_LIST", "AMENU_COMPANY_DETAIL"),
                        "회원사 목록/상세 메뉴 권한 연결에 사용됩니다."),
                codeGroup("COMPANY_STATUS", "회원사 상태", Arrays.asList("P", "A", "R", "D", "X"),
                        "회원사 목록 상태 필터와 상태 배지에 사용됩니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildMemberDetailPage() {
        Map<String, Object> page = pageOption("member-detail", "회원 상세", "/admin/member/detail", "AMENU_MEMBER_DETAIL", "admin");
        page.put("summary", "회원 기본정보, 상태, 비밀번호 초기화 이력, 수정 화면 연결을 관리하는 상세 화면입니다.");
        page.put("source", "frontend/src/features/member-detail/MemberDetailMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("member-detail-lookup", "회원 조회", "[data-help-id=\"member-detail-lookup\"]", "MemberLookup", "actions",
                        Arrays.asList("member-detail-load"), "회원 ID를 기준으로 상세를 조회합니다."),
                surface("member-detail-summary", "회원 요약 카드", "[data-help-id=\"member-detail-summary\"]", "MemberProfileCard", "content",
                        Arrays.asList("member-detail-edit"), "상태, 유형, 연락처와 수정 진입점을 제공합니다."),
                surface("member-detail-history", "비밀번호 초기화 이력", "[data-help-id=\"member-detail-history\"]", "PasswordResetHistory", "content",
                        Arrays.asList("member-detail-reset-history"), "최근 비밀번호 초기화 이력을 노출합니다.")
        ));
        page.put("events", Arrays.asList(
                event("member-detail-load", "상세 조회", "submit", "handleLookupMember", "[data-help-id=\"member-detail-lookup\"] form",
                        Arrays.asList("admin.member.detail.page"), "회원 상세 payload를 다시 불러옵니다."),
                event("member-detail-edit", "회원 수정 이동", "click", "handleMoveEdit", "[data-help-id=\"member-detail-summary\"] [data-action=\"edit\"]",
                        Arrays.asList("route.admin.member.edit"), "수정 화면으로 이동합니다."),
                event("member-detail-reset-history", "초기화 이력 조회", "load", "loadPasswordResetHistory", "[data-help-id=\"member-detail-history\"]",
                        Arrays.asList("admin.member.detail.page"), "상세 payload 내 초기화 이력을 함께 조회합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.member.detail.page", "회원 상세 조회", "GET", "/api/admin/member/detail/page",
                        "AdminMainController.memberDetailPageApi", "EntrprsManageService.selectEntrprsMber",
                        "EntrprsManageMapper.selectEntrprsMber / selectPasswordResetHistory",
                        Arrays.asList("COMTNENTRPRSMBER"), Arrays.asList("member-detail-schema"),
                        "회원 기본정보와 초기화 이력을 함께 조회합니다."),
                routeApi("route.admin.member.edit", "회원 수정 화면 이동", "/admin/member/edit", "AMENU_MEMBER_EDIT")
        ));
        page.put("schemas", Arrays.asList(
                schema("member-detail-schema", "회원 상세 모델", "COMTNENTRPRSMBER",
                        Arrays.asList("ENTRPRS_MBER_ID", "APPLCNT_NM", "EMAIL_ADRES", "MBER_TY_CODE", "SBSCRB_STTUS"),
                        Arrays.asList("SELECT", "UPDATE"), "상세/수정/권한 변경 흐름이 함께 참조합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("MEMBER_TYPE", "회원 유형", Arrays.asList("개인", "기업", "기관"), "회원 유형 라벨과 액션 노출에 사용됩니다."),
                codeGroup("MEMBER_STATUS", "회원 상태", Arrays.asList("신청", "승인", "반려", "휴면"), "상태 배지/버튼 활성화 조건에 사용됩니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildCompanyApprovePage() {
        Map<String, Object> page = pageOption("company-approve", "회원사 승인", "/admin/member/company-approve", "AMENU_COMPANY_APPROVE", "admin");
        page.put("summary", "회원사 승인 검색, 일괄 처리, 행 단위 승인과 반려를 관리하는 관리자 화면입니다.");
        page.put("source", "frontend/src/features/company-approve/CompanyApproveMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("company-approve-search", "승인 대상 검색", "[data-help-id=\"company-approve-search\"]", "CompanyApprovalFilter", "actions",
                        Arrays.asList("company-approve-search-submit"), "상태와 검색어 기준으로 승인 대상을 조회합니다."),
                surface("company-approve-batch-actions", "일괄 승인/반려", "[data-help-id=\"company-approve-batch-actions\"]", "CompanyApprovalBatchActions", "actions",
                        Arrays.asList("company-approve-batch-approve", "company-approve-batch-reject"), "선택한 기관을 일괄 승인 또는 반려합니다."),
                surface("company-approve-table", "회원사 승인 목록", "[data-help-id=\"company-approve-table\"]", "CompanyApprovalTable", "content",
                        Arrays.asList("company-approve-row-review", "company-approve-row-approve", "company-approve-row-reject"), "기관 기본정보와 첨부 서류를 검토하고 개별 처리합니다.")
        ));
        page.put("events", Arrays.asList(
                event("company-approve-search-submit", "회원사 승인 목록 조회", "click", "applyFilters", "[data-help-id=\"company-approve-search\"] button",
                        Arrays.asList("admin.member.company-approve.page"), "검색 조건으로 회원사 승인 목록을 다시 조회합니다."),
                event("company-approve-batch-approve", "선택 회원사 승인", "click", "handleAction", "[data-help-id=\"company-approve-batch-actions\"] button",
                        Arrays.asList("admin.member.company-approve.action"), "선택한 회원사를 일괄 승인합니다."),
                event("company-approve-batch-reject", "선택 회원사 반려", "click", "handleAction", "[data-help-id=\"company-approve-batch-actions\"] button",
                        Arrays.asList("admin.member.company-approve.action"), "선택한 회원사를 일괄 반려합니다."),
                event("company-approve-row-review", "회원사 상세 검토", "click", "setReviewInsttId", "[data-help-id=\"company-approve-table\"] button",
                        Collections.emptyList(), "선택한 회원사 행의 상세 검토 패널을 엽니다."),
                event("company-approve-row-approve", "회원사 개별 승인", "click", "handleAction", "[data-help-id=\"company-approve-table\"] button",
                        Arrays.asList("admin.member.company-approve.action"), "개별 회원사 승인 상태를 저장합니다."),
                event("company-approve-row-reject", "회원사 개별 반려", "click", "handleAction", "[data-help-id=\"company-approve-table\"] button",
                        Arrays.asList("admin.member.company-approve.action"), "개별 회원사 반려 상태를 저장합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.member.company-approve.page", "회원사 승인 목록 조회", "GET", "/api/admin/member/company-approve/page",
                        "AdminMainController.companyApprovePageApi", "AdminMainController.populateCompanyApprovePage",
                        "EntrprsManageMapper.selectInsttApprovalList / selectInsttApprovalListTotCnt",
                        Arrays.asList("COMTNINSTTINFO", "COMTNINSTTFILE"), Arrays.asList("company-approve-schema"),
                        "기관 상태와 첨부 서류 요약을 포함한 승인 대상 목록을 조회합니다."),
                api("admin.member.company-approve.action", "회원사 승인/반려 처리", "POST", "/api/admin/member/company-approve/action",
                        "AdminMainController.companyApproveActionApi", "EntrprsManageService.updateInsttApprovalStatus",
                        "EntrprsManageMapper.updateInsttApprovalStatus / insertAuditEvent",
                        Arrays.asList("COMTNINSTTINFO", "AUDIT_EVENT"), Arrays.asList("company-approve-schema", "audit-event-schema"),
                        "개별 또는 일괄 회원사 승인/반려 결과를 저장합니다."),
                routeApi("route.admin.member.company-account", "회원사 정보 수정 화면 이동", "/admin/member/company_account", "AMENU_COMPANY_ACCOUNT")
        ));
        page.put("schemas", Arrays.asList(
                schema("company-approve-schema", "회원사 승인 모델", "COMTNINSTTINFO / COMTNINSTTFILE",
                        Arrays.asList("INSTT_ID", "INSTT_NM", "BIZRNO", "REPRSNT_NM", "INSTT_STTUS"),
                        Arrays.asList("SELECT", "UPDATE"), "회원사 가입 승인 상태와 제출 서류를 함께 관리합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("INSTT_STATUS", "회원사 상태", Arrays.asList("A", "P", "R", "X"), "회원사 승인 상태 필터와 배지에 사용됩니다."),
                codeGroup("AMENU1", "관리자 메뉴 코드", Arrays.asList("AMENU_COMPANY_APPROVE", "AMENU_COMPANY_ACCOUNT"), "회원사 승인과 수정 화면 연결에 사용됩니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildCompanyDetailPage() {
        Map<String, Object> page = pageOption("company-detail", "기관 상세", "/admin/member/company_detail", "AMENU_COMPANY_DETAIL", "admin");
        page.put("summary", "기관 정보, 상태, 첨부파일, 담당자 정보를 함께 보는 상세 화면입니다.");
        page.put("source", "frontend/src/features/company-detail/CompanyDetailMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("company-detail-lookup", "기관 조회", "[data-help-id=\"company-detail-lookup\"]", "CompanyLookup", "actions",
                        Arrays.asList("company-detail-load"), "기관 ID 또는 사업자번호 기준으로 조회합니다."),
                surface("company-detail-summary", "기관 요약", "[data-help-id=\"company-detail-summary\"]", "CompanySummaryCard", "content",
                        Arrays.asList("company-detail-edit"), "기관 상태, 대표자, 담당자, 주소를 보여줍니다."),
                surface("company-detail-files", "첨부 파일 목록", "[data-help-id=\"company-detail-files\"]", "CompanyFilesTable", "content",
                        Arrays.asList("company-file-download"), "기관 증빙 첨부 목록을 제공합니다.")
        ));
        page.put("events", Arrays.asList(
                event("company-detail-load", "기관 상세 조회", "submit", "handleLookupCompany", "[data-help-id=\"company-detail-lookup\"] form",
                        Arrays.asList("admin.member.company-detail.page"), "기관 정보와 첨부 목록을 조회합니다."),
                event("company-detail-edit", "기관 수정 이동", "click", "handleMoveCompanyEdit", "[data-help-id=\"company-detail-summary\"] [data-action=\"edit\"]",
                        Arrays.asList("route.admin.member.company-account"), "기관 계정/정보 수정 화면으로 이동합니다."),
                event("company-file-download", "첨부 다운로드", "click", "handleDownloadAttachment", "[data-help-id=\"company-detail-files\"] [data-action=\"download\"]",
                        Arrays.asList("route.file.download"), "등록 첨부 파일을 다운로드합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.member.company-detail.page", "기관 상세 조회", "GET", "/api/admin/member/company-detail/page",
                        "AdminMainController.companyDetailPageApi", "EntrprsManageService.selectInsttInfoForStatus",
                        "EntrprsManageMapper.selectInsttInfoForStatus / selectInsttFiles",
                        Arrays.asList("COMTNINSTTINFO", "COMTNINSTTFILE"), Arrays.asList("company-detail-schema", "company-file-schema"),
                        "기관 상태와 첨부 목록을 함께 조회합니다."),
                routeApi("route.admin.member.company-account", "기관 수정 화면 이동", "/admin/member/company_account", "AMENU_COMPANY_ACCOUNT"),
                routeApi("route.file.download", "파일 다운로드", "/cmm/fms/FileDown.do", "FILE_DOWNLOAD")
        ));
        page.put("schemas", Arrays.asList(
                schema("company-detail-schema", "기관 상세 모델", "COMTNINSTTINFO",
                        Arrays.asList("INSTT_ID", "INSTT_NM", "BIZRNO", "SBSCRB_STTUS", "CHARGER_EMAIL"),
                        Arrays.asList("SELECT", "UPDATE"), "기관 요약, 상태 조회, 관리자 수정에 사용됩니다."),
                schema("company-file-schema", "기관 첨부 모델", "COMTNINSTTFILE",
                        Arrays.asList("ATCH_FILE_ID", "FILE_SN", "ORIGNL_FILE_NM", "FILE_STRE_COURS"),
                        Arrays.asList("SELECT", "INSERT", "DELETE"), "기관 증빙 첨부 관리를 담당합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("JOIN_STATUS", "기관 가입 상태", Arrays.asList("신청", "검토중", "승인", "반려"), "기관 상태 배지와 버튼 노출 기준입니다."),
                codeGroup("FILE_CATEGORY", "첨부 분류", Arrays.asList("사업자등록증", "기관증빙", "기타"), "기관 첨부 라벨 및 검증 규칙입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildMemberEditPage() {
        Map<String, Object> page = pageOption("member-edit", "회원 수정", "/admin/member/edit", "AMENU_MEMBER_EDIT", "admin");
        page.put("summary", "회원 기본 정보, 권한 롤/기능, 주소, 증빙 문서를 함께 수정하는 관리자 편집 화면입니다.");
        page.put("source", "frontend/src/features/member-edit/MemberEditMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("member-edit-summary", "회원 수정 요약", "[data-help-id=\"member-edit-summary\"]", "MemberEditSummaryCard", "content",
                        Arrays.asList("member-edit-page-load"), "회원 식별자, 상태, 업무 역할 요약을 보여줍니다."),
                surface("member-edit-role-profile", "권한 그룹 프로필 요약", "[data-help-id=\"member-edit-role-profile\"]", "MemberEditRoleProfileSummary", "content",
                        Arrays.asList("member-edit-page-load"), "기준 권한 그룹에 연결된 업무 역할과 우선 제공 업무 메타데이터를 보여줍니다."),
                surface("member-edit-form", "회원 기본 정보 폼", "[data-help-id=\"member-edit-form\"]", "MemberEditForm", "content",
                        Arrays.asList("member-edit-save"), "이름, 이메일, 연락처, 상태를 수정합니다."),
                surface("member-edit-permissions", "회원 권한 편집", "[data-help-id=\"member-edit-permissions\"]", "MemberEditPermissionMatrix", "content",
                        Arrays.asList("member-edit-feature-toggle", "member-edit-save"), "기준 롤과 개별 기능 추가/제외를 조정합니다."),
                surface("member-edit-address", "회원 주소 편집", "[data-help-id=\"member-edit-address\"]", "MemberEditAddressForm", "content",
                        Arrays.asList("member-edit-save"), "우편번호와 제출 주소를 수정합니다."),
                surface("member-edit-evidence", "회원 증빙 문서", "[data-help-id=\"member-edit-evidence\"]", "MemberEditEvidenceList", "content",
                        Collections.emptyList(), "회원 제출 증빙 문서 목록과 다운로드 링크를 제공합니다."),
                surface("member-edit-actions", "회원 수정 액션", "[data-help-id=\"member-edit-actions\"]", "MemberEditActions", "actions",
                        Arrays.asList("member-edit-open-detail", "member-edit-save"), "상세 화면 이동과 저장을 제공합니다.")
        ));
        page.put("events", Arrays.asList(
                event("member-edit-page-load", "회원 수정 화면 조회", "load", "fetchMemberEditPage", "[data-help-id=\"member-edit-page\"]",
                        Arrays.asList("admin.member.edit.page"), "회원 ID 기준 수정 payload를 조회합니다."),
                event("member-edit-feature-toggle", "회원 기능 권한 토글", "change", "toggleFeature", "[data-help-id=\"member-edit-permissions\"] input[type=\"checkbox\"]",
                        Collections.emptyList(), "회원별 추가/제외 기능을 토글합니다."),
                event("member-edit-open-detail", "회원 상세 이동", "click", "navigate", "[data-help-id=\"member-edit-actions\"] [data-action=\"detail\"]",
                        Arrays.asList("route.admin.member.detail"), "현재 회원의 상세 화면으로 이동합니다."),
                event("member-edit-save", "회원 수정 저장", "click", "handleSave", "[data-help-id=\"member-edit-actions\"] [data-action=\"save\"]",
                        Arrays.asList("admin.member.edit.save"), "회원 기본정보, 권한, 주소 정보를 저장합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.member.edit.page", "회원 수정 화면 조회", "GET", "/api/admin/member/edit",
                        "AdminMainController.memberEditApi", "AdminMainController.populateMemberEditModel",
                        "EntrprsManageMapper.selectEntrprsmberByMberId / selectPasswordResetHistory / selectAuthorList",
                        Arrays.asList("COMTNENTRPRSMBER", "COMTNAUTHORINFO", "COMTNAUTHORFUNCTIONRELATE", "COMTNMENUFUNCTIONINFO"),
                        Arrays.asList("member-edit-schema", "member-permission-schema"),
                        "회원 수정에 필요한 기본정보, 권한 롤, 기능 목록, 증빙 목록을 함께 조회합니다."),
                api("admin.member.edit.save", "회원 수정 저장", "POST", "/api/admin/member/edit",
                        "AdminMainController.memberEditSubmitApi", "AdminMainController.updateEntrprsmber / saveMemberFeatureOverrides",
                        "EntrprsManageMapper.updateEntrprsmber / deleteUserFeatureOverrides / insertUserFeatureOverride",
                        Arrays.asList("COMTNENTRPRSMBER", "COMTNUSERFEATUREOVERRIDE", "AUDIT_EVENT"),
                        Arrays.asList("member-edit-schema", "member-permission-schema", "audit-event-schema"),
                        "회원 기본정보와 개별 기능 권한 변경을 저장합니다."),
                routeApi("route.admin.member.detail", "회원 상세 화면 이동", "/admin/member/detail", "AMENU_MEMBER_DETAIL")
        ));
        page.put("schemas", Arrays.asList(
                schema("member-edit-schema", "회원 수정 스키마", "COMTNENTRPRSMBER",
                        Arrays.asList("ENTRPRS_MBER_ID", "APPLCNT_NM", "APPLCNT_EMAIL_ADRES", "MBER_TY_CODE", "SBSCRB_STTUS", "DEPT_NM", "ZIP", "ADRES", "DETAIL_ADRES", "MARKETING_YN"),
                        Arrays.asList("SELECT", "UPDATE"), "회원 기본 정보와 상태, 주소를 수정합니다."),
                schema("member-permission-schema", "회원 개별 권한 스키마", "COMTNUSERFEATUREOVERRIDE / COMTNAUTHORFUNCTIONRELATE",
                        Arrays.asList("ENTRPRS_MBER_ID", "AUTHOR_CODE", "FEATURE_CODE", "OVERRIDE_TYPE"),
                        Arrays.asList("SELECT", "INSERT", "DELETE"), "기준 롤과 회원별 기능 추가/제외 권한을 관리합니다."),
                schema("author-role-profile-schema", "권한 그룹 프로필 스키마", "data/author-role-profiles/profiles.json",
                        Arrays.asList("authorCode", "displayTitle", "priorityWorks", "description", "memberEditVisibleYn", "updatedAt"),
                        Arrays.asList("SELECT"),
                        "기준 권한 그룹의 업무 역할과 우선 제공 업무 표시에 사용됩니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("MEMBER_STATUS", "회원 상태", Arrays.asList("신청", "승인", "반려", "휴면"), "회원 상태 드롭다운과 배지에 사용됩니다."),
                codeGroup("MEMBER_TYPE", "회원 유형", Arrays.asList("E", "P", "C", "G"), "회원 유형 선택과 업무 역할 계산에 사용됩니다.")
        ));
        page.put("changeTargets", Arrays.asList(
                changeTarget("member-profile", "회원 기본 정보", Arrays.asList("applcntNm", "applcntEmailAdres", "phoneNumber", "deptNm", "entrprsSeCode", "entrprsMberSttus", "marketingYn"), "회원 프로필과 상태를 수정합니다."),
                changeTarget("member-permissions", "회원 권한", Arrays.asList("authorCode", "featureCodes"), "기준 권한 롤과 기능 override를 조정합니다."),
                changeTarget("member-address", "회원 주소", Arrays.asList("zip", "adres", "detailAdres"), "연락 및 제출 주소를 수정합니다.")
        ));
        return page;
    }

    private Map<String, Object> buildCompanyAccountPage() {
        Map<String, Object> page = pageOption("company-account", "회원사 수정", "/admin/member/company_account", "AMENU_COMPANY_ACCOUNT", "admin");
        page.put("summary", "기관 ID 조회 후 회원사 기본정보, 담당자 정보, 첨부파일을 편집하는 관리자 화면입니다.");
        page.put("source", "frontend/src/features/company-account/CompanyAccountMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("company-account-lookup", "회원사 조회", "[data-help-id=\"company-account-lookup\"]", "CompanyAccountLookup", "actions",
                        Arrays.asList("company-account-load"), "기관 ID를 기준으로 회원사 편집 payload를 조회합니다."),
                surface("company-account-membership", "회원 유형 선택", "[data-help-id=\"company-account-membership\"]", "CompanyAccountMembershipCards", "content",
                        Arrays.asList("company-account-save"), "회원사 유형 카드를 선택합니다."),
                surface("company-account-business", "사업자 정보 편집", "[data-help-id=\"company-account-business\"]", "CompanyAccountBusinessForm", "content",
                        Arrays.asList("company-account-save"), "기관명, 대표자명, 사업자등록번호, 주소를 편집합니다."),
                surface("company-account-contact", "담당자 정보 편집", "[data-help-id=\"company-account-contact\"]", "CompanyAccountContactForm", "content",
                        Arrays.asList("company-account-save"), "담당자 이름, 이메일, 연락처를 편집합니다."),
                surface("company-account-files", "증빙 파일 업로드", "[data-help-id=\"company-account-files\"]", "CompanyAccountFileUpload", "content",
                        Arrays.asList("company-account-file-select", "company-account-save"), "신규 증빙 파일을 선택합니다."),
                surface("company-account-file-table", "첨부 파일 목록", "[data-help-id=\"company-account-file-table\"]", "CompanyAccountFileTable", "content",
                        Collections.emptyList(), "저장된 기관 첨부 파일을 확인합니다."),
                surface("company-account-actions", "회원사 저장 액션", "[data-help-id=\"company-account-actions\"]", "CompanyAccountActions", "actions",
                        Arrays.asList("company-account-save"), "목록 복귀 또는 회원사 저장을 실행합니다.")
        ));
        page.put("events", Arrays.asList(
                event("company-account-load", "회원사 수정 화면 조회", "click", "handleLoad", "[data-help-id=\"company-account-lookup\"] [data-action=\"load\"]",
                        Arrays.asList("admin.member.company-account.page"), "기관 ID 기준 회원사 편집 payload를 조회합니다."),
                event("company-account-file-select", "회원사 첨부 선택", "change", "handleFileChange", "[data-help-id=\"company-account-files\"] input[type=\"file\"]",
                        Collections.emptyList(), "업로드 예정 파일 목록을 갱신합니다."),
                event("company-account-save", "회원사 저장", "click", "handleSave", "[data-help-id=\"company-account-actions\"] [data-action=\"save\"]",
                        Arrays.asList("admin.member.company-account.save"), "회원사 기본정보와 첨부 파일을 저장합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.member.company-account.page", "회원사 수정 화면 조회", "GET", "/api/admin/member/company-account/page",
                        "AdminMainController.companyAccountPageApi", "AdminMainController.populateCompanyAccountModel",
                        "EntrprsManageMapper.selectInsttInfoForStatus / selectInsttFiles",
                        Arrays.asList("COMTNINSTTINFO", "COMTNINSTTFILE"),
                        Arrays.asList("company-account-schema", "company-file-schema"),
                        "기관 정보와 첨부 파일 목록을 회원사 편집 화면에 제공합니다."),
                api("admin.member.company-account.save", "회원사 저장", "POST", "/api/admin/member/company-account",
                        "AdminMainController.companyAccountSubmitApi", "AdminMainController.saveOrUpdateCompanyAccount",
                        "EntrprsManageMapper.insertInsttInfo / updateInsttInfo / insertInsttFile",
                        Arrays.asList("COMTNINSTTINFO", "COMTNINSTTFILE", "AUDIT_EVENT"),
                        Arrays.asList("company-account-schema", "company-file-schema", "audit-event-schema"),
                        "회원사 기본정보와 신규 첨부 파일을 저장합니다.")
        ));
        page.put("schemas", Arrays.asList(
                schema("company-account-schema", "회원사 수정 스키마", "COMTNINSTTINFO",
                        Arrays.asList("INSTT_ID", "ENTRPRS_SE_CODE", "INSTT_NM", "REPRSNT_NM", "BIZRNO", "ZIP", "ADRES", "DETAIL_ADRES", "CHARGER_NM", "CHARGER_EMAIL", "CHARGER_TEL"),
                        Arrays.asList("SELECT", "INSERT", "UPDATE"), "회원사 기본정보와 담당자 정보를 저장합니다."),
                schema("company-file-schema", "회원사 첨부 스키마", "COMTNINSTTFILE",
                        Arrays.asList("ATCH_FILE_ID", "FILE_SN", "ORIGNL_FILE_NM", "FILE_EXTSN", "FILE_MG"),
                        Arrays.asList("SELECT", "INSERT"), "회원사 증빙 첨부와 목록 조회를 담당합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("MEMBERSHIP_TYPE", "회원사 유형", Arrays.asList("E", "P", "C", "G"), "회원사 유형 카드와 저장 payload에 사용됩니다."),
                codeGroup("FILE_CATEGORY", "회원사 증빙 분류", Arrays.asList("사업자등록증", "법인 검증 서류"), "회원사 증빙 업로드 정책 분류입니다.")
        ));
        page.put("changeTargets", Arrays.asList(
                changeTarget("company-profile", "회원사 기본 정보", Arrays.asList("membershipType", "agencyName", "representativeName", "bizRegistrationNumber", "zipCode", "companyAddress", "companyAddressDetail"), "회원사 기본정보와 주소를 수정합니다."),
                changeTarget("company-contact", "회원사 담당자", Arrays.asList("chargerName", "chargerEmail", "chargerTel"), "회원사 담당자 정보를 수정합니다."),
                changeTarget("company-files", "회원사 증빙 파일", Arrays.asList("fileUploads"), "신규 증빙 파일을 업로드합니다.")
        ));
        return page;
    }

    private Map<String, Object> buildJoinWizardPage() {
        Map<String, Object> page = pageOption("join-wizard", "가입 단계", "/join/step1", "HMENU_JOIN_STEP1", "join");
        page.put("summary", "가입 유형 선택부터 단계별 입력, 세션 유지, 재신청 흐름까지 이어지는 사용자 가입 시작 화면입니다.");
        page.put("source", "frontend/src/features/join-wizard/JoinTermsMigrationPage.tsx, JoinInfoMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("join-hero", "가입 안내 영역", "[data-help-id=\"join-step-header\"]", "JoinHero", "header",
                        Collections.emptyList(), "가입 목적과 단계 안내를 제공합니다."),
                surface("membership-type-card-group", "회원유형 선택", "[data-help-id=\"join-membership-type\"]", "MembershipTypeCardGroup", "content",
                        Arrays.asList("join-membership-select"), "개인/기업/기관 유형을 세션에 반영합니다."),
                surface("join-wizard-actions", "다음 단계 액션", "[data-help-id=\"join-step-actions\"]", "JoinWizardActions", "actions",
                        Arrays.asList("join-next-step"), "현재 선택값 기준으로 다음 단계로 이동합니다.")
        ));
        page.put("events", Arrays.asList(
                event("join-membership-select", "회원유형 선택", "click", "handleSelectMembershipType", "[data-help-id=\"join-membership-type\"] button",
                        Arrays.asList("join.session.page"), "선택한 회원유형을 세션 및 화면 상태에 반영합니다."),
                event("join-next-step", "다음 단계 이동", "click", "handleMoveNextStep", "[data-help-id=\"join-step-actions\"] [data-action=\"next\"]",
                        Arrays.asList("route.join.step2"), "세션 필수값이 준비된 경우 다음 단계로 이동합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("join.session.page", "가입 세션 조회", "GET", "/join/api/session",
                        "JoinSessionController.getJoinSession", "JoinSessionService.getJoinSession",
                        "Session-backed", Arrays.asList("JOIN_SESSION"), Arrays.asList("join-session-schema"),
                        "회원유형, 본인확인, 단계 진행상태를 세션에서 조회합니다."),
                routeApi("route.join.step2", "가입 2단계 이동", "/join/step2", "HMENU_JOIN_STEP2")
        ));
        page.put("schemas", Arrays.asList(
                schema("join-session-schema", "가입 세션 모델", "HTTP_SESSION",
                        Arrays.asList("membershipType", "verifiedIdentity", "step", "joinVO"),
                        Arrays.asList("SESSION_READ", "SESSION_WRITE"), "가입 단계 이동과 재신청 복구에 사용됩니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("HMENU1", "홈 메뉴 코드", Arrays.asList("HMENU_JOIN_STEP1", "HMENU_JOIN_STEP2"), "가입 단계 URL과 메뉴 노출에 사용됩니다."),
                codeGroup("MEMBERSHIP_TYPE", "가입 회원 유형", Arrays.asList("INDIVIDUAL", "COMPANY", "INSTITUTION"), "가입 흐름 분기에 사용됩니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildObservabilityPage() {
        Map<String, Object> page = pageOption("observability", "감사 로그", "/admin/system/observability", "A0060303", "admin");
        page.put("summary", "감사 로그와 trace 이벤트를 같은 페이지에서 조회하는 운영 화면입니다.");
        page.put("source", "frontend/src/features/observability/ObservabilityMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("observability-search-panel", "검색 패널", "[data-help-id=\"observability-filters\"]", "ObservabilitySearchPanel", "actions",
                        Arrays.asList("observability-search-audit", "observability-search-trace"), "traceId, actorId, actionCode, apiId 조건을 조합합니다."),
                surface("audit-event-table", "감사 로그 테이블", "[data-help-id=\"observability-audit-table\"]", "AuditEventTable", "content",
                        Arrays.asList("observability-move-trace"), "감사 이벤트에서 trace로 drill-down 합니다."),
                surface("trace-event-table", "추적 이벤트 테이블", "[data-help-id=\"observability-trace-table\"]", "TraceEventTable", "content",
                        Collections.emptyList(), "API/결과코드 기준으로 trace를 조회합니다.")
        ));
        page.put("events", Arrays.asList(
                event("observability-search-audit", "감사 로그 조회", "click", "loadAudit", "[data-help-id=\"observability-filters\"] button",
                        Arrays.asList("admin.observability.audit-events.search"), "감사 테이블을 갱신합니다."),
                event("observability-search-trace", "추적 이벤트 조회", "click", "loadTrace", "[data-help-id=\"observability-filters\"] button",
                        Arrays.asList("admin.observability.trace-events.search"), "추적 테이블을 갱신합니다."),
                event("observability-move-trace", "감사 -> trace 이동", "click", "moveToTrace", "[data-help-id=\"observability-audit-table\"] .text-button",
                        Arrays.asList("admin.observability.trace-events.search"), "선택한 traceId로 탭 전환 후 상세 조회합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.observability.audit-events.search", "감사 이벤트 조회", "GET", "/api/admin/observability/audit-events",
                        "AdminObservabilityController.searchAuditEvents", "ObservabilityQueryService.selectAuditEventList",
                        "ObservabilityMapper.selectAuditEventList / selectAuditEventCount",
                        Arrays.asList("AUDIT_EVENT"), Arrays.asList("audit-event-schema"),
                        "감사 로그와 검색 조건을 함께 조회합니다."),
                api("admin.observability.trace-events.search", "추적 이벤트 조회", "GET", "/api/admin/observability/trace-events",
                        "AdminObservabilityController.searchTraceEvents", "ObservabilityQueryService.selectTraceEventList",
                        "ObservabilityMapper.selectTraceEventList / selectTraceEventCount",
                        Arrays.asList("TRACE_EVENT"), Arrays.asList("trace-event-schema"),
                        "traceId, apiId, resultCode 기준으로 이벤트를 조회합니다.")
        ));
        page.put("schemas", Arrays.asList(
                schema("audit-event-schema", "감사 이벤트 스키마", "AUDIT_EVENT",
                        Arrays.asList("AUDIT_ID", "TRACE_ID", "ACTOR_ID", "ACTION_CODE", "PAGE_ID", "RESULT_STATUS"),
                        Arrays.asList("SELECT", "INSERT"), "운영 감사 로그 기록/조회 테이블입니다."),
                schema("trace-event-schema", "추적 이벤트 스키마", "TRACE_EVENT",
                        Arrays.asList("EVENT_ID", "TRACE_ID", "API_ID", "EVENT_TYPE", "RESULT_CODE", "DURATION_MS"),
                        Arrays.asList("SELECT", "INSERT"), "프론트/백엔드 추적 이벤트 조회 테이블입니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("TRACE_EVENT_TYPE", "추적 이벤트 유형", Arrays.asList("PAGE_LOAD", "API_CALL", "DB_QUERY"), "trace 분류 기준입니다."),
                codeGroup("RESULT_STATUS", "결과 코드", Arrays.asList("SUCCESS", "ERROR"), "감사/추적 결과 배지에 사용됩니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildErrorLogPage() {
        Map<String, Object> page = pageOption("error-log", "에러 로그", "/admin/system/error-log", "A0060302", "admin");
        page.put("summary", "백엔드 오류, 페이지 격리 오류, 프런트 오류 리포트를 영구 추적으로 조회하는 관리자 화면입니다.");
        page.put("source", "frontend/src/features/error-log/ErrorLogMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("error-log-search", "에러 로그 검색", "[data-help-id=\"error-log-search\"]", "ErrorLogSearch", "actions",
                        Arrays.asList("error-log-search-submit"), "회사, 소스 유형, 오류 유형과 검색어를 조합합니다."),
                surface("error-log-table", "에러 로그 테이블", "[data-help-id=\"error-log-table\"]", "ErrorLogTable", "content",
                        Collections.emptyList(), "영구 저장된 에러 로그를 시간 역순으로 조회합니다.")
        ));
        page.put("events", Arrays.asList(
                event("error-log-search-submit", "에러 로그 조회", "submit", "fetchErrorLogPage", "[data-help-id=\"error-log-search\"] form",
                        Arrays.asList("admin.error-log.page"), "에러 로그 테이블을 갱신합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.error-log.page", "에러 로그 페이지 조회", "GET", "/admin/system/error-log/page-data",
                        "AdminMainController.errorLogPageApi", "AdminMainController.buildErrorLogPagePayload",
                        "ObservabilityMapper.selectErrorEventList / selectErrorEventCount",
                        Arrays.asList("ERROR_EVENT", "COMTNENTRPRSMBER", "COMTNEMPLYRINFO"),
                        Arrays.asList("error-event-schema"), "회사 범위와 검색 조건 기준으로 에러 로그를 조회합니다.")
        ));
        page.put("schemas", Arrays.asList(
                schema("error-event-schema", "에러 이벤트 스키마", "ERROR_EVENT",
                        Arrays.asList("ERROR_ID", "TRACE_ID", "PAGE_ID", "API_ID", "SOURCE_TYPE", "ERROR_TYPE", "ACTOR_ID", "ACTOR_INSTT_ID", "REQUEST_URI", "MESSAGE", "RESULT_STATUS", "CREATED_AT"),
                        Arrays.asList("SELECT", "INSERT"), "영구 에러 로그 조회 테이블입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildFullStackManagementPage() {
        Map<String, Object> page = pageOption("full-stack-management", "풀스택 관리", "/admin/system/full-stack-management", "AMENU_SYSTEM_FULL_STACK_MANAGEMENT", "admin");
        page.put("summary", "메뉴를 기준으로 화면 요소, 이벤트, 함수, 파라미터, 결과값, API, 스키마, 테이블, 컬럼, 권한, 공통코드를 함께 추적하는 관리자 화면입니다.");
        page.put("source", "frontend/src/features/menu-management/FullStackManagementMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("full-stack-menu-scope", "관리 범위 선택", "[data-help-id=\"full-stack-management-scope\"]", "FullStackMenuScope", "actions",
                        Arrays.asList("full-stack-page-load"), "관리자/홈 메뉴 트리 범위와 등록 상태를 선택합니다."),
                surface("full-stack-menu-tree", "메뉴 트리와 메뉴 생성", "[data-help-id=\"full-stack-management-tree\"]", "FullStackMenuTree", "content",
                        Arrays.asList("full-stack-menu-create", "full-stack-menu-order-save"), "메뉴 생성, 정렬 변경, 대상 메뉴 선택을 수행합니다."),
                surface("full-stack-governance", "풀스택 거버넌스 패널", "[data-help-id=\"menu-management-governance-panel\"]", "FullStackGovernancePanel", "content",
                        Arrays.asList("full-stack-command-load", "full-stack-registry-save"), "선택한 메뉴 기준 화면/이벤트/API/스키마/권한 연결을 탐색합니다.")
        ));
        page.put("events", Arrays.asList(
                event("full-stack-page-load", "풀스택 관리 화면 로드", "change", "fetchFullStackManagementPage", "[data-help-id=\"full-stack-management-scope\"] select",
                        Arrays.asList("admin.full-stack-management.page"), "관리 대상 메뉴 범위와 트리를 다시 조회합니다."),
                event("full-stack-menu-create", "페이지 메뉴 생성", "click", "createPageMenu", "[data-help-id=\"full-stack-management-tree\"] .primary-button",
                        Arrays.asList("admin.menu-management.create-page"), "새 메뉴, 기본 VIEW 기능, 초기 정렬 정보를 함께 생성합니다."),
                event("full-stack-menu-order-save", "메뉴 순서 저장", "click", "saveOrder", "[data-help-id=\"full-stack-management-tree\"] .gov-btn-primary",
                        Arrays.asList("admin.menu-management.order-save"), "선택한 범위의 메뉴 순서를 저장합니다."),
                event("full-stack-command-load", "메뉴 연결 메타데이터 로드", "click", "loadCommandPage", "[data-help-id=\"menu-management-governance-select\"]",
                        Arrays.asList("admin.help-management.screen-command.page"), "선택한 페이지 메뉴 기준 화면 요소, 함수, API, 스키마 메타데이터를 조회합니다."),
                event("full-stack-registry-save", "풀스택 레지스트리 저장", "click", "saveRegistry", "[data-help-id=\"menu-management-governance-panel\"] .gov-btn-primary",
                        Arrays.asList("admin.full-stack-management.registry-save"), "메뉴별 프론트/백엔드/API/DB 컬럼 메타데이터를 저장합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.full-stack-management.page", "풀스택 관리 화면 조회", "GET", "/admin/system/full-stack-management/page-data",
                        "AdminSystemCodeController.fullStackManagementPageApi", "AdminSystemCodeController.populateMenuManagementModel",
                        "MenuInfoMapper.selectMenuTreeList / MenuFeatureManageMapper.selectMenuFeatureList",
                        Arrays.asList("COMTCCMMNDETAILCODE", "COMTNMENUINFO", "COMTNMENUORDER", "COMTNMENUFUNCTIONINFO"),
                        Arrays.asList("menu-tree-schema", "menu-feature-schema"),
                        "메뉴 트리, 그룹 메뉴 선택지, 아이콘, 사용 여부 목록을 조회합니다."),
                api("admin.menu-management.create-page", "메뉴 기준 페이지 생성", "POST", "/admin/system/menu-management/create-page",
                        "AdminSystemCodeController.createMenuManagedPageApi", "AdminCodeManageService.insertPageManagement + MenuFeatureManageService.insertMenuFeature",
                        "AdminCodeManageMapper.insertPageManagementDetail / insertPageManagementMenu / MenuInfoMapper.insertMenuOrder / MenuFeatureManageMapper.insertMenuFeature",
                        Arrays.asList("COMTCCMMNDETAILCODE", "COMTNMENUINFO", "COMTNMENUORDER", "COMTNMENUFUNCTIONINFO", "AUDIT_EVENT"),
                        Arrays.asList("menu-tree-schema", "menu-feature-schema"),
                        "새 8자리 페이지 메뉴와 기본 VIEW 기능을 생성합니다."),
                api("admin.menu-management.order-save", "메뉴 순서 저장", "POST", "/admin/system/menu-management/order",
                        "AdminSystemCodeController.saveMenuManagementOrder", "MenuInfoService.saveMenuOrder",
                        "MenuInfoMapper.insertMenuOrder / updateMenuOrder",
                        Arrays.asList("COMTNMENUORDER", "AUDIT_EVENT"), Arrays.asList("menu-order-schema"),
                        "현재 메뉴 트리 정렬 순서를 저장합니다."),
                api("admin.help-management.screen-command.page", "화면 command 메타데이터 조회", "GET", "/api/admin/help-management/screen-command/page",
                        "AdminHelpManagementController.getScreenCommandPage", "ScreenCommandCenterService.getScreenCommandPage",
                        "Metadata-only", Arrays.asList("COMTNMENUINFO", "COMTNMENUFUNCTIONINFO", "COMTNAUTHORFUNCTIONRELATE"),
                        Arrays.asList("menu-feature-schema"), "선택한 페이지 메뉴와 연결된 화면 메타데이터를 조회합니다."),
                api("admin.full-stack-management.registry-save", "풀스택 거버넌스 레지스트리 저장", "POST", "/api/admin/full-stack-management/registry",
                        "AdminFullStackManagementApiController.saveRegistry", "FullStackGovernanceRegistryService.saveEntry",
                        "File registry write", Arrays.asList("FULL_STACK_GOVERNANCE_REGISTRY", "AUDIT_EVENT"),
                        Arrays.asList("menu-feature-schema"), "메뉴 기준 프론트/백엔드/API/스키마/테이블/컬럼 메타데이터를 저장합니다.")
        ));
        page.put("schemas", Arrays.asList(
                schema("menu-tree-schema", "메뉴 트리 스키마", "COMTCCMMNDETAILCODE / COMTNMENUINFO",
                        Arrays.asList("CODE_ID", "CODE", "CODE_NM", "CODE_DC", "MENU_URL", "MENU_ICON", "USE_AT"),
                        Arrays.asList("SELECT", "INSERT", "UPDATE"), "메뉴 계층과 페이지 URL 메타데이터를 보관합니다."),
                schema("menu-order-schema", "메뉴 순서 스키마", "COMTNMENUORDER",
                        Arrays.asList("MENU_CODE", "SORT_ORDR", "FRST_REGIST_PNTTM", "LAST_UPDT_PNTTM"),
                        Arrays.asList("SELECT", "INSERT", "UPDATE"), "메뉴 표시 순서를 관리합니다."),
                schema("menu-feature-schema", "메뉴 기능 권한 스키마", "COMTNMENUFUNCTIONINFO / COMTNAUTHORFUNCTIONRELATE / COMTNUSERFEATUREOVERRIDE",
                        Arrays.asList("MENU_CODE", "FEATURE_CODE", "AUTHOR_CODE", "SCRTY_DTRMN_TRGET_ID", "USE_AT"),
                        Arrays.asList("SELECT", "INSERT", "UPDATE", "DELETE"), "페이지 VIEW 기능과 역할/사용자 권한 연결을 관리합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("AMENU1", "관리자 메뉴 코드", Arrays.asList("AMENU_SYSTEM_FULL_STACK_MANAGEMENT", "A1900101", "A0060303"), "시스템 운영 메뉴 코드군입니다."),
                codeGroup("CHANGE_LAYER", "수정 레이어", Arrays.asList("UI", "EVENT", "FUNCTION", "API", "SERVICE", "MAPPER", "SCHEMA", "DB_COLUMN", "MENU_AUTH"), "풀스택 관리 시 선택하는 변경 레이어입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildEnvironmentManagementPage() {
        Map<String, Object> page = pageOption("environment-management", "메뉴 통합 관리", "/admin/system/environment-management", "A0060118", "admin");
        page.put("summary", "메뉴 검색, 메뉴 등록, 기본 권한 생성, 기능 추가를 한 화면에서 처리하는 관리자 화면입니다.");
        page.put("source", "frontend/src/features/environment-management/EnvironmentManagementHubPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("environment-management-summary", "환경 관리 요약", "[data-help-id=\"environment-management-summary\"]", "EnvironmentManagementSummary", "actions",
                        Collections.singletonList("environment-tool-open"), "선택한 환경 관리 도구의 메뉴코드, feature, 경로를 요약합니다."),
                surface("environment-management-engines", "거버넌스 엔진 안내", "[data-help-id=\"environment-management-engines\"]", "EnvironmentManagementEngines", "content",
                        Collections.singletonList("environment-tool-open"), "ALL 허용, 회원 타입, 회사 스코프, 감사 진단 엔진을 운영 기준으로 정리합니다."),
                surface("environment-management-cards", "환경 관리 카드", "[data-help-id=\"environment-management-cards\"]", "EnvironmentManagementCards", "content",
                        Collections.singletonList("environment-tool-open"), "공통코드, 페이지, 기능, 메뉴 관리 화면으로 이동합니다.")
        ));
        page.put("events", Collections.singletonList(
                event("environment-tool-open", "환경 관리 화면 이동", "click", "navigate", "[data-help-id=\"environment-management-cards\"] button",
                        Collections.emptyList(), "선택한 관리 도구 화면으로 이동합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("AMENU1", "관리자 메뉴 코드", Arrays.asList("A0060118", "AMENU_SYSTEM_CODE", "AMENU_SYSTEM_PAGE_MANAGEMENT", "AMENU_SYSTEM_FUNCTION_MANAGEMENT", "AMENU_SYSTEM_MENU_MANAGEMENT"),
                        "메뉴 통합 관리 화면과 하위 관리 기능의 메뉴 코드 연결입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildBackupConfigPage() {
        Map<String, Object> page = pageOption("backup-config", "백업 설정", "/admin/system/backup_config", "A0060401", "admin");
        page.put("summary", "애플리케이션 JAR, 데이터베이스 덤프, 원격 아카이브까지 백업 정책과 최근 실행 상태를 점검하는 화면입니다.");
        page.put("source", "frontend/src/features/backup-config/BackupConfigMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("backup-config-summary", "백업 설정 요약", "[data-help-id=\"backup-config-summary\"]", "BackupConfigSummary", "actions",
                        Collections.emptyList(), "백업 프로파일, 보관 주기, 검증 상태, 원격 동기화 현황을 요약합니다."),
                surface("backup-config-profiles", "백업 프로파일", "[data-help-id=\"backup-config-profiles\"]", "BackupConfigProfiles", "content",
                        Collections.emptyList(), "일간/주간/아카이브 백업 스케줄과 상태를 확인합니다."),
                surface("backup-config-storage", "백업 저장 대상", "[data-help-id=\"backup-config-storage\"]", "BackupConfigStorage", "content",
                        Collections.emptyList(), "로컬 런타임, DB 덤프, 원격 아카이브 위치를 관리합니다."),
                surface("backup-config-executions", "백업 실행 이력", "[data-help-id=\"backup-config-executions\"]", "BackupConfigExecutions", "content",
                        Collections.emptyList(), "최근 실행 결과와 검토 필요 항목을 확인합니다."),
                surface("backup-config-playbooks", "복구 플레이북", "[data-help-id=\"backup-config-playbooks\"]", "BackupConfigPlaybooks", "content",
                        Collections.emptyList(), "애플리케이션 롤백, DB 복구, 원격지 복구 절차를 안내합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("AMENU1", "관리자 메뉴 코드", Arrays.asList("A0060122"), "백업 설정 화면에 연결되는 관리자 메뉴 코드입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildBackupSubPage(String pageId, String label, String routePath, String menuCode, String mode) {
        Map<String, Object> page = pageOption(pageId, label, routePath, menuCode, "admin");
        page.put("summary", "백업 설정 화면과 같은 데이터 계약을 사용하면서 현재 선택한 백업 운영 모드에 맞는 관점으로 표시하는 화면입니다.");
        page.put("source", "frontend/src/features/backup-config/BackupConfigMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("backup-config-summary", "백업 설정 요약", "[data-help-id=\"backup-config-summary\"]", "BackupConfigSummary", "actions",
                        Collections.emptyList(), "현재 선택한 " + label + " 메뉴 기준의 요약 카드입니다."),
                surface("backup-config-profiles", "백업 프로파일", "[data-help-id=\"backup-config-profiles\"]", "BackupConfigProfiles", "content",
                        Collections.emptyList(), "백업/복구/버전 관리에 공통으로 사용되는 프로파일을 확인합니다."),
                surface("backup-config-storage", "백업 저장 대상", "[data-help-id=\"backup-config-storage\"]", "BackupConfigStorage", "content",
                        Collections.emptyList(), "저장 대상과 운영 위치를 확인합니다."),
                surface("backup-config-executions", "백업 실행 이력", "[data-help-id=\"backup-config-executions\"]", "BackupConfigExecutions", "content",
                        Collections.emptyList(), "최근 실행과 검토 항목을 확인합니다."),
                surface("backup-config-playbooks", "복구 플레이북", "[data-help-id=\"backup-config-playbooks\"]", "BackupConfigPlaybooks", "content",
                        Collections.emptyList(), "운영 절차와 복구 순서를 확인합니다."))
        );
        page.put("mode", mode);
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("AMENU1", "관리자 메뉴 코드", Arrays.asList(menuCode), label + " 화면에 연결되는 관리자 메뉴 코드입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildPlatformStudioPage(String pageId, String label, String routePath, String menuCode, String focus) {
        Map<String, Object> page = pageOption(pageId, label, routePath, menuCode, "admin");
        page.put("summary", "기존 풀스택 관리와 SR 워크벤치를 통합해 메뉴 생성, 자원 편집, 작업 지시까지 한 콘솔에서 수행하는 화면입니다.");
        page.put("source", "frontend/src/features/platform-studio/PlatformStudioMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("platform-studio-tabs", "포커스 탭", ".gov-card .gov-btn", "PlatformStudioTabs", "actions",
                        Collections.singletonList("platform-studio-focus-change"), "선택한 관리 포커스에 따라 같은 registry를 다른 시각으로 편집합니다."),
                surface("platform-studio-menus", "관리 대상 메뉴 목록", ".gov-card aside", "PlatformStudioMenuList", "content",
                        Collections.singletonList("platform-studio-menu-select"), "메뉴별 coverage와 연결 상태를 보며 관리 대상을 선택합니다."),
                surface("platform-studio-registry", "자원 레지스트리 편집", ".gov-card .gov-textarea", "PlatformStudioRegistry", "content",
                        Arrays.asList("platform-studio-registry-save", "platform-studio-visibility-toggle"), "메뉴, 이벤트, 함수, API, DB 자원을 한 페이지에서 저장합니다."),
                surface("platform-studio-automation", "자동화 작업 지시", ".gov-card .gov-input", "PlatformStudioAutomation", "content",
                        Collections.singletonList("platform-studio-ticket-create"), "선택 자원 기준으로 SR 티켓과 AI 작업 지시문을 생성합니다.")
        ));
        page.put("events", Arrays.asList(
                event("platform-studio-focus-change", "포커스 탭 변경", "click", "setFocus", ".gov-card .gov-btn",
                        Collections.singletonList("admin.full-stack-management.page"), "탭별 초점만 바꾸고 동일한 registry source를 유지합니다."),
                event("platform-studio-menu-select", "메뉴 선택", "click", "setSelectedMenuCode", ".gov-card aside button",
                        Arrays.asList("admin.full-stack-management.page", "admin.help-management.screen-command.page"), "선택 메뉴의 screen command와 registry를 함께 불러옵니다."),
                event("platform-studio-registry-save", "레지스트리 저장", "click", "saveRegistry", ".gov-card .gov-btn-primary",
                        Arrays.asList("admin.full-stack-management.registry-save"), "한 페이지에서 편집한 자원 레지스트리를 저장합니다."),
                event("platform-studio-visibility-toggle", "메뉴 숨김/보이기", "click", "toggleVisibility", ".gov-card .gov-btn-outline",
                        Arrays.asList("admin.full-stack-management.visibility"), "선택한 페이지 메뉴를 hide/show 처리합니다."),
                event("platform-studio-ticket-create", "AI 작업 티켓 생성", "click", "createAutomationTicket", ".gov-card .gov-btn-primary",
                        Arrays.asList("admin.sr-workbench.ticket.create"), "현재 선택된 자원 기준으로 SR 티켓과 실행 지시를 생성합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.full-stack-management.visibility", "메뉴 표시 상태 변경", "POST", "/admin/system/full-stack-management/menu-visibility",
                        "AdminSystemCodeController.updateFullStackMenuVisibility", "AdminCodeManageService.updatePageManagement",
                        "AdminCodeManageMapper.updatePageManagementUseAt / MenuFeatureManageMapper.updateMenuFeature",
                        Arrays.asList("COMTCCMMNDETAILCODE", "COMTNMENUINFO", "COMTNMENUFUNCTIONINFO", "AUDIT_EVENT"),
                        Arrays.asList("menu-tree-schema", "menu-feature-schema"), "선택한 페이지 메뉴를 숨김 또는 재노출합니다.")
        ));
        page.put("schemas", Arrays.asList(
                schema("platform-studio-registry-schema", "플랫폼 스튜디오 레지스트리", "FULL_STACK_GOVERNANCE_REGISTRY",
                        Arrays.asList("MENU_CODE", "PAGE_ID", "EVENT_IDS", "FUNCTION_IDS", "API_IDS", "TABLE_NAMES", "COLUMN_NAMES"),
                        Arrays.asList("SELECT", "INSERT", "UPDATE"), "메뉴 중심 자원 연결 registry입니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("AMENU1", "관리자 메뉴 코드", Arrays.asList(menuCode, "AMENU_SYSTEM_FULL_STACK_MANAGEMENT", "AMENU_SYSTEM_SR_WORKBENCH"),
                        "플랫폼 스튜디오 계열 운영 메뉴를 묶습니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        page.put("focus", focus);
        return page;
    }

    private Map<String, Object> buildHelpManagementPage() {
        Map<String, Object> page = pageOption("help-management", "도움말 운영", "/admin/system/help-management", "A1900101", "admin");
        page.put("summary", "화면별 도움말과 수정 디렉션 메타데이터를 함께 운영하는 관리자 시스템 화면입니다.");
        page.put("source", "frontend/src/features/help-management/HelpManagementMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("help-page-selector", "대상 페이지 선택", "[data-help-id=\"help-management-select\"]", "HelpPageSelector", "actions",
                        Arrays.asList("help-page-load", "help-command-page-load"), "도움말 대상 화면과 수정 디렉션 대상 화면을 선택합니다."),
                surface("help-metadata-form", "도움말 메타데이터", "[data-help-id=\"help-management-page-form\"]", "HelpMetadataForm", "content",
                        Arrays.asList("help-save"), "도움말 제목, 버전, 요약을 관리합니다."),
                surface("help-items-editor", "도움말 단계 편집", "[data-help-id=\"help-management-items\"]", "HelpItemsEditor", "content",
                        Arrays.asList("help-item-add", "help-item-remove"), "overlay 단계별 안내를 편집합니다."),
                surface("screen-command-center", "수정 디렉션 탭", "[data-help-id=\"help-management-command-center\"]", "ScreenCommandCenterPanel", "content",
                        Arrays.asList("help-command-page-load", "help-command-direction-generate"), "요소, 이벤트, API, 컨트롤러, 스키마 연결을 탐색합니다.")
        ));
        page.put("events", Arrays.asList(
                event("help-page-load", "도움말 불러오기", "click", "handleLoad", "[data-help-id=\"help-management-select\"] button",
                        Arrays.asList("admin.help-management.page"), "선택한 페이지 도움말을 불러옵니다."),
                event("help-save", "도움말 저장", "click", "handleSave", "[data-help-id=\"help-management-select\"] .primary-button",
                        Arrays.asList("admin.help-management.save"), "도움말 메타데이터와 단계를 저장합니다."),
                event("help-item-add", "도움말 단계 추가", "click", "addItem", "[data-help-id=\"help-management-items\"] .secondary-button",
                        Collections.emptyList(), "신규 도움말 단계를 편집 리스트에 추가합니다."),
                event("help-item-remove", "도움말 단계 삭제", "click", "removeItem", "[data-help-id=\"help-management-items\"] .secondary-button",
                        Collections.emptyList(), "기존 단계의 순서를 재정렬합니다."),
                event("help-command-page-load", "수정 디렉션 대상 로드", "change", "loadCommandPage", "[data-help-id=\"help-management-command-center\"] select",
                        Arrays.asList("admin.help-management.screen-command.page"), "선택한 화면의 연결 메타데이터를 조회합니다."),
                event("help-command-direction-generate", "수정 디렉션 생성", "click", "buildDirectionPreview", "[data-help-id=\"help-management-command-center\"] [data-action=\"generate\"]",
                        Collections.emptyList(), "선택한 레이어/이벤트/API 기준으로 작업 지시 초안을 만듭니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.help-management.page", "도움말 페이지 조회", "GET", "/api/admin/help-management/page",
                        "AdminHelpManagementController.getHelpPage", "HelpContentService.getPageHelpForAdmin",
                        "HelpContentMapper.selectPage / selectItems",
                        Arrays.asList("UI_HELP_PAGE", "UI_HELP_ITEM"), Arrays.asList("ui-help-page-schema"),
                        "도움말 기본 정보와 step 항목을 함께 조회합니다."),
                api("admin.help-management.save", "도움말 저장", "POST", "/api/admin/help-management/save",
                        "AdminHelpManagementController.saveHelpPage", "HelpContentService.savePageHelp",
                        "HelpContentMapper.upsertPage / replaceItems",
                        Arrays.asList("UI_HELP_PAGE", "UI_HELP_ITEM", "AUDIT_EVENT"), Arrays.asList("ui-help-page-schema", "audit-event-schema"),
                        "도움말 저장 후 감사 로그를 남깁니다."),
                api("admin.help-management.screen-command.page", "수정 디렉션 메타데이터 조회", "GET", "/api/admin/help-management/screen-command/page",
                        "AdminHelpManagementController.getScreenCommandPage", "ScreenCommandCenterService.getScreenCommandPage",
                        "Metadata-only", Arrays.asList("COMTNMENUINFO", "COMTNMENUFUNCTIONINFO", "COMTNAUTHORFUNCTIONRELATE"),
                        Arrays.asList("menu-feature-schema"), "화면-요소-이벤트-API-권한 연결 메타데이터를 조회합니다.")
        ));
        page.put("schemas", Arrays.asList(
                schema("ui-help-page-schema", "도움말 운영 스키마", "UI_HELP_PAGE / UI_HELP_ITEM",
                        Arrays.asList("PAGE_ID", "TITLE", "SUMMARY", "ITEM_ID", "ANCHOR_SELECTOR", "DISPLAY_ORDER"),
                        Arrays.asList("SELECT", "INSERT", "UPDATE", "DELETE"), "화면 도움말 overlay 데이터 저장소입니다."),
                schema("menu-feature-schema", "메뉴/기능 권한 스키마", "COMTNMENUINFO / COMTNMENUFUNCTIONINFO / COMTNAUTHORFUNCTIONRELATE",
                        Arrays.asList("MENU_CODE", "MENU_URL", "FEATURE_CODE", "AUTHOR_CODE"),
                        Arrays.asList("SELECT"), "페이지 기능 권한과 메뉴 연결을 해석합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("AMENU1", "관리자 메뉴 코드", Arrays.asList("A1900101", "A1900102", "A1900103", "A1900104"), "관리자 AI 운영 메뉴 분류입니다."),
                codeGroup("CHANGE_LAYER", "수정 레이어", Arrays.asList("UI", "CSS", "EVENT", "API", "CONTROLLER", "SERVICE", "MAPPER", "SCHEMA", "MENU_AUTH"),
                        "수정 지시 생성 시 선택하는 레이어 그룹입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildCodexRequestPage() {
        Map<String, Object> page = pageOption("codex-request", "Codex 실행 콘솔", "/admin/system/codex-request", "A1900103", "admin");
        page.put("summary", "SR 티켓 기반 중앙 실행 큐에서 runtime config, plan/build 결과, 레거시 provision 프록시를 함께 운영하는 AI 실행 콘솔입니다.");
        page.put("source", "frontend/src/features/codex-provision/CodexProvisionMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("codex-request-runtime", "런타임 설정", "[data-help-id=\"codex-request-runtime\"]", "CodexRuntimeConfigPanel", "actions",
                        Arrays.asList("codex-ticket-refresh"), "현재 Codex/runner 설정과 command 구성을 확인합니다."),
                surface("codex-history-table", "SR 실행 큐", "[data-help-id=\"codex-history-table\"]", "CodexQueueTable", "content",
                        Arrays.asList("codex-ticket-select", "codex-ticket-prepare", "codex-ticket-plan", "codex-ticket-build", "codex-ticket-delete"), "SR 티켓을 준비, 계획 수립, 빌드 실행, 삭제합니다."),
                surface("codex-request-ticket-detail", "선택 티켓 상세", "[data-help-id=\"codex-request-ticket-detail\"]", "CodexTicketDetailPanel", "content",
                        Arrays.asList("codex-ticket-detail-load"), "선택한 티켓의 상태, 지시문, artifact path를 확인합니다."),
                surface("codex-request-plan-result", "Plan 결과", "[data-help-id=\"codex-request-plan-result\"]", "CodexPlanArtifactPanel", "content",
                        Arrays.asList("codex-ticket-artifact-plan"), "선택 티켓의 plan result 또는 plan stdout 아티팩트를 미리봅니다."),
                surface("codex-request-build-result", "Build 결과", "[data-help-id=\"codex-request-build-result\"]", "CodexBuildArtifactPanel", "content",
                        Arrays.asList("codex-ticket-artifact-build"), "선택 티켓의 build stdout, diff, changed files를 미리봅니다."),
                surface("codex-request-setup", "레거시 Provision 프록시", "#payload", "CodexRequestSetup", "actions",
                        Arrays.asList("codex-login-check", "codex-run-provision", "codex-format-payload"), "기존 payload 기반 등록 프록시를 필요 시 함께 사용합니다."),
                surface("codex-response-panel", "Codex 응답 결과", ".gov-card", "CodexResponsePanel", "content",
                        Collections.emptyList(), "HTTP 상태와 created/existing/skipped 결과를 확인합니다."),
                surface("codex-request-history-review", "Codex 실행 이력", "table", "CodexHistoryTable", "content",
                        Arrays.asList("codex-history-refresh", "codex-history-inspect", "codex-history-remediate"), "최근 실행 이력과 조치 결과를 다시 확인합니다.")
        ));
        page.put("events", Arrays.asList(
                event("codex-ticket-refresh", "티켓 큐 새로고침", "load", "fetchCodexProvisionPage", "[data-help-id=\"codex-request-runtime\"]",
                        Arrays.asList("admin.codex-request.tickets"), "SR 실행 큐와 runtime config를 다시 불러옵니다."),
                event("codex-ticket-select", "SR 티켓 선택", "click", "setSelectedTicketId", "[data-help-id=\"codex-history-table\"] tr",
                        Arrays.asList("admin.codex-request.ticket-detail", "admin.codex-request.ticket-artifact"), "선택한 티켓의 상세와 아티팩트를 조회합니다."),
                event("codex-ticket-detail-load", "선택 티켓 상세 조회", "load", "fetchCodexSrTicketDetail", "[data-help-id=\"codex-request-ticket-detail\"]",
                        Arrays.asList("admin.codex-request.ticket-detail"), "선택 티켓의 요약, instruction, runner comment를 조회합니다."),
                event("codex-ticket-artifact-plan", "Plan 아티팩트 조회", "load", "fetchCodexSrTicketArtifact", "[data-help-id=\"codex-request-plan-result\"]",
                        Arrays.asList("admin.codex-request.ticket-artifact"), "plan result 또는 plan stdout 파일을 미리 조회합니다."),
                event("codex-ticket-artifact-build", "Build 아티팩트 조회", "load", "fetchCodexSrTicketArtifact", "[data-help-id=\"codex-request-build-result\"]",
                        Arrays.asList("admin.codex-request.ticket-artifact"), "build stdout, diff, changed files를 미리 조회합니다."),
                event("codex-ticket-prepare", "SR 티켓 준비", "click", "prepareCodexSrTicket", "[data-help-id=\"codex-history-table\"] .gov-btn-outline",
                        Arrays.asList("admin.codex-request.ticket-prepare"), "선택 티켓을 READY_FOR_CODEX 상태로 전환합니다."),
                event("codex-ticket-plan", "SR 티켓 계획 수립", "click", "planCodexSrTicket", "[data-help-id=\"codex-history-table\"] .gov-btn-outline",
                        Arrays.asList("admin.codex-request.ticket-plan"), "선택 티켓에 대해 read-only Codex plan 을 실행합니다."),
                event("codex-ticket-build", "SR 티켓 빌드 실행", "click", "executeCodexSrTicket", "[data-help-id=\"codex-history-table\"] .gov-btn-primary",
                        Arrays.asList("admin.codex-request.ticket-build"), "PLAN_COMPLETED 티켓에 대해 build 실행을 시작합니다."),
                event("codex-ticket-delete", "SR 티켓 삭제", "click", "deleteCodexSrTicket", "[data-help-id=\"codex-history-table\"] .gov-btn-outline",
                        Arrays.asList("admin.codex-request.ticket-delete"), "중앙 실행 큐에서 SR 티켓을 제거합니다."),
                event("codex-login-check", "Codex 인증 확인", "click", "runCodexLoginCheck", ".gov-btn",
                        Arrays.asList("admin.codex-request.login"), "내부 프록시와 API 키 구성을 확인합니다."),
                event("codex-run-provision", "Codex 등록 실행", "click", "executeCodexProvision", ".gov-btn",
                        Arrays.asList("admin.codex-request.execute"), "입력한 payload로 메뉴/기능/권한 등록을 실행합니다."),
                event("codex-format-payload", "Payload 정렬", "click", "JSON.parse", ".gov-btn",
                        Collections.emptyList(), "JSON payload를 보기 좋은 형태로 정렬합니다."),
                event("codex-history-refresh", "이력 새로고침", "click", "historyState.reload", ".gov-btn",
                        Arrays.asList("admin.codex-request.history"), "최근 실행 이력을 다시 불러옵니다."),
                event("codex-history-inspect", "실행 이력 재점검", "click", "inspectCodexHistory", "table .gov-btn-outline",
                        Arrays.asList("admin.codex-request.inspect"), "선택한 요청의 회사/페이지/메뉴/기능 매핑 상태를 재점검합니다."),
                event("codex-history-remediate", "실행 이력 조치", "click", "remediateCodexHistory", "table .gov-btn-primary",
                        Arrays.asList("admin.codex-request.remediate"), "선택한 요청을 기준으로 다시 조치 실행합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.codex-request.login", "Codex 인증 확인", "POST", "/admin/system/codex-request/login",
                        "CodexProvisionAdminController.login", "CodexExecutionAdminService.validateInternalAvailability",
                        "Metadata-only", Arrays.asList("CODEX_API_CONFIG"), Arrays.asList("codex-request-schema"),
                        "Codex API 활성화와 내부 프록시 가능 여부를 확인합니다."),
                api("admin.codex-request.execute", "Codex 등록 실행", "POST", "/admin/system/codex-request/execute",
                        "CodexProvisionAdminController.execute", "CodexExecutionAdminService.execute",
                        "CodexExecutionLogMapper.insert / CodexProvisioningService.provision", Arrays.asList("COMTNMENUINFO", "COMTNMENUFUNCTIONINFO", "COMTNAUTHORFUNCTIONRELATE", "COMTNDETAILCODE", "COMTCCMMNDETAILCODE"),
                        Arrays.asList("codex-request-schema", "menu-feature-schema"), "메뉴/기능/권한 등록을 실행하고 로그를 남깁니다."),
                api("admin.codex-request.history", "Codex 실행 이력", "GET", "/admin/system/codex-request/history",
                        "CodexProvisionAdminController.history", "CodexExecutionAdminService.getRecentHistory",
                        "CodexExecutionLogMapper.selectRecentHistory", Arrays.asList("CODEX_EXECUTION_LOG"), Arrays.asList("codex-request-schema"),
                        "최근 실행 이력을 조회합니다."),
                api("admin.codex-request.tickets", "SR 실행 큐 조회", "GET", "/admin/system/codex-request/tickets",
                        "CodexProvisionAdminController.tickets", "SrTicketWorkbenchService.getPage",
                        "security.codex.sr-ticket-file JSONL", Arrays.asList("SR_TICKET_JSONL"), Arrays.asList("sr-ticket-runner-schema"),
                        "SR 기반 중앙 실행 큐와 상태를 조회합니다."),
                api("admin.codex-request.ticket-detail", "SR 티켓 상세 조회", "GET", "/admin/system/codex-request/tickets/{ticketId}",
                        "CodexProvisionAdminController.ticketDetail", "SrTicketWorkbenchService.getTicketDetail",
                        "security.codex.sr-ticket-file JSONL", Arrays.asList("SR_TICKET_JSONL"), Arrays.asList("sr-ticket-runner-schema"),
                        "선택한 SR 티켓의 상세와 조회 가능한 artifact 목록을 확인합니다."),
                api("admin.codex-request.ticket-artifact", "SR 티켓 아티팩트 조회", "GET", "/admin/system/codex-request/tickets/{ticketId}/artifacts/{artifactType}",
                        "CodexProvisionAdminController.ticketArtifact", "SrTicketWorkbenchService.getTicketArtifact",
                        "runner artifact files", Arrays.asList("SR_RUNNER_ARTIFACTS"), Arrays.asList("sr-ticket-runner-schema"),
                        "선택한 SR 티켓의 plan/build artifact 내용을 미리 조회합니다."),
                api("admin.codex-request.ticket-prepare", "SR 티켓 준비", "POST", "/admin/system/codex-request/tickets/{ticketId}/prepare",
                        "CodexProvisionAdminController.prepareTicket", "SrTicketWorkbenchService.prepareExecution",
                        "security.codex.sr-ticket-file JSONL", Arrays.asList("SR_TICKET_JSONL"), Arrays.asList("sr-ticket-runner-schema"),
                        "승인된 티켓을 Codex 실행 준비 상태로 전환합니다."),
                api("admin.codex-request.ticket-plan", "SR 티켓 계획 수립", "POST", "/admin/system/codex-request/tickets/{ticketId}/plan",
                        "CodexProvisionAdminController.planTicket", "SrTicketWorkbenchService.planTicket",
                        "SR runner workspace + history", Arrays.asList("SR_TICKET_JSONL", "SR_RUNNER_ARTIFACTS"), Arrays.asList("sr-ticket-runner-schema"),
                        "선택 티켓에 대해 read-only plan 실행과 artifact 생성을 수행합니다."),
                api("admin.codex-request.ticket-build", "SR 티켓 빌드 실행", "POST", "/admin/system/codex-request/tickets/{ticketId}/execute",
                        "CodexProvisionAdminController.executeTicket", "SrTicketWorkbenchService.executeTicket",
                        "SR runner workspace + history", Arrays.asList("SR_TICKET_JSONL", "SR_RUNNER_ARTIFACTS"), Arrays.asList("sr-ticket-runner-schema"),
                        "PLAN_COMPLETED 티켓에 대해 build 실행과 verify를 수행합니다."),
                api("admin.codex-request.ticket-delete", "SR 티켓 삭제", "POST", "/admin/system/codex-request/tickets/{ticketId}/delete",
                        "CodexProvisionAdminController.deleteTicket", "SrTicketWorkbenchService.deleteTicket",
                        "security.codex.sr-ticket-file JSONL", Arrays.asList("SR_TICKET_JSONL"), Arrays.asList("sr-ticket-runner-schema"),
                        "중앙 실행 큐에서 선택한 SR 티켓을 제거합니다."),
                api("admin.codex-request.inspect", "Codex 실행 이력 점검", "POST", "/admin/system/codex-request/history/{logId}/inspect",
                        "CodexProvisionAdminController.inspect", "CodexExecutionAdminService.inspect",
                        "CodexExecutionLogMapper.select / Menu-feature inspection", Arrays.asList("CODEX_EXECUTION_LOG", "COMTNMENUINFO", "COMTNMENUFUNCTIONINFO"),
                        Arrays.asList("codex-request-schema", "menu-feature-schema"), "실행 이력의 매핑 상태를 재점검합니다."),
                api("admin.codex-request.remediate", "Codex 실행 이력 조치", "POST", "/admin/system/codex-request/history/{logId}/remediate",
                        "CodexProvisionAdminController.remediate", "CodexExecutionAdminService.remediate",
                        "CodexExecutionLogMapper.select / CodexProvisioningService.provision", Arrays.asList("CODEX_EXECUTION_LOG", "COMTNMENUINFO", "COMTNMENUFUNCTIONINFO", "COMTNAUTHORFUNCTIONRELATE"),
                        Arrays.asList("codex-request-schema", "menu-feature-schema"), "실행 이력을 바탕으로 다시 조치 실행합니다.")
        ));
        page.put("schemas", Arrays.asList(
                schema("codex-request-schema", "Codex 요청/이력 모델", "CODEX_EXECUTION_LOG / requestJson",
                        Arrays.asList("requestId", "targetApiPath", "companyId", "actorUserId", "executionStatus", "httpStatus", "issueSummary"),
                        Arrays.asList("SELECT", "INSERT", "UPDATE"), "Codex 요청 원문과 실행 이력 저장 모델입니다."),
                schema("sr-ticket-runner-schema", "SR 티켓 실행 모델", "security.codex.sr-ticket-file / security.codex.runner.history-file",
                        Arrays.asList("ticketId", "executionStatus", "planRunId", "planResultPath", "executionRunId", "executionLogPath", "executionDiffPath"),
                        Arrays.asList("SELECT", "INSERT", "UPDATE", "DELETE"), "SR 티켓 상태와 runner artifact 경로를 기록하는 임시 JSONL 기반 실행 모델입니다."),
                schema("menu-feature-schema", "메뉴/기능 권한 스키마", "COMTNMENUINFO / COMTNMENUFUNCTIONINFO / COMTNAUTHORFUNCTIONRELATE",
                        Arrays.asList("MENU_CODE", "MENU_URL", "FEATURE_CODE", "AUTHOR_CODE"),
                        Arrays.asList("SELECT", "INSERT", "UPDATE"), "Codex 요청 대상 메뉴와 기능/권한 상태를 해석합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("AMENU1", "관리자 메뉴 코드", Arrays.asList("A1900101", "A1900102", "A1900103", "A1900104"), "관리자 AI 운영 메뉴 분류입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildSrWorkbenchPage() {
        Map<String, Object> page = pageOption("sr-workbench", "SR 워크벤치", "/admin/system/sr-workbench", "A1900102", "admin");
        page.put("summary", "화면 메타데이터 기준 SR 티켓을 발행하고 승인 및 Codex 실행 준비 상태를 관리하는 관리자 화면입니다.");
        page.put("source", "frontend/src/features/sr-workbench/SrWorkbenchMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("sr-ticket-draft", "SR 초안 작성", "[data-help-id=\"sr-ticket-draft\"]", "SrTicketDraftForm", "actions",
                        Arrays.asList("sr-page-load", "sr-direction-generate", "sr-ticket-create"), "화면, 요소, 이벤트, 수정 레이어와 지시문을 선택합니다."),
                surface("sr-direction-preview", "해결 지시 미리보기", "[data-help-id=\"sr-direction-preview\"]", "SrDirectionPreview", "content",
                        Collections.emptyList(), "Direction과 Codex prompt를 검토합니다."),
                surface("sr-ticket-table", "SR 티켓 테이블", "[data-help-id=\"sr-ticket-table\"]", "SrTicketTable", "content",
                        Arrays.asList("sr-ticket-approve", "sr-ticket-reject", "sr-ticket-prepare-execution"), "승인, 반려, 실행 준비 상태를 제어합니다.")
        ));
        page.put("events", Arrays.asList(
                event("sr-page-load", "워크벤치 화면 로드", "click", "load", "[data-help-id=\"sr-ticket-draft\"] .primary-button",
                        Arrays.asList("admin.sr-workbench.page", "admin.help-management.screen-command.page"), "선택한 화면 기준 워크벤치와 연결 메타데이터를 불러옵니다."),
                event("sr-direction-generate", "해결 지시 생성", "click", "handleGenerate", "[data-help-id=\"sr-ticket-draft\"] .secondary-button",
                        Collections.emptyList(), "선택한 메타데이터를 바탕으로 SR 해결 direction을 생성합니다."),
                event("sr-ticket-create", "SR 티켓 발행", "click", "handleCreateTicket", "[data-help-id=\"sr-ticket-draft\"] .primary-button",
                        Arrays.asList("admin.sr-workbench.ticket.create"), "현재 direction을 기준으로 티켓을 저장합니다."),
                event("sr-ticket-approve", "SR 승인", "click", "handleApprove", "[data-help-id=\"sr-ticket-table\"] .secondary-button",
                        Arrays.asList("admin.sr-workbench.ticket.approve"), "티켓을 승인 상태로 바꿉니다."),
                event("sr-ticket-reject", "SR 반려", "click", "handleApprove", "[data-help-id=\"sr-ticket-table\"] .secondary-button",
                        Arrays.asList("admin.sr-workbench.ticket.approve"), "티켓을 반려 상태로 바꿉니다."),
                event("sr-ticket-prepare-execution", "실행 준비", "click", "handlePrepareExecution", "[data-help-id=\"sr-ticket-table\"] .primary-button",
                        Arrays.asList("admin.sr-workbench.ticket.prepare-execution"), "승인된 티켓을 Codex 실행 준비 상태로 전환합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.sr-workbench.page", "SR 워크벤치 조회", "GET", "/api/admin/sr-workbench/page",
                        "AdminSrWorkbenchController.getPage", "SrTicketWorkbenchService.getPage",
                        "File-backed read", Arrays.asList("SR_TICKET_JSONL", "COMTNMENUINFO", "COMTNMENUFUNCTIONINFO", "COMTNAUTHORFUNCTIONRELATE"),
                        Arrays.asList("sr-ticket-schema", "menu-feature-schema"), "워크벤치 화면 데이터와 최근 티켓 목록을 조회합니다."),
                api("admin.sr-workbench.ticket.create", "SR 티켓 발행", "POST", "/api/admin/sr-workbench/tickets",
                        "AdminSrWorkbenchController.createTicket", "SrTicketWorkbenchService.createTicket",
                        "File-backed append", Arrays.asList("SR_TICKET_JSONL"), Arrays.asList("sr-ticket-schema"),
                        "SR 티켓을 신규 발행합니다."),
                api("admin.sr-workbench.ticket.approve", "SR 승인/반려", "POST", "/api/admin/sr-workbench/tickets/{ticketId}/approve",
                        "AdminSrWorkbenchController.approveTicket", "SrTicketWorkbenchService.updateApproval",
                        "File-backed rewrite", Arrays.asList("SR_TICKET_JSONL"), Arrays.asList("sr-ticket-schema"),
                        "SR 티켓 상태를 승인 또는 반려로 전환합니다."),
                api("admin.sr-workbench.ticket.prepare-execution", "SR 실행 준비", "POST", "/api/admin/sr-workbench/tickets/{ticketId}/prepare-execution",
                        "AdminSrWorkbenchController.prepareExecution", "SrTicketWorkbenchService.prepareExecution",
                        "File-backed rewrite", Arrays.asList("SR_TICKET_JSONL"), Arrays.asList("sr-ticket-schema"),
                        "승인된 티켓을 Codex 실행 준비 상태로 전환합니다.")
        ));
        page.put("schemas", Arrays.asList(
                schema("sr-ticket-schema", "SR 티켓 저장 모델", "SR_TICKET_JSONL",
                        Arrays.asList("ticketId", "status", "pageId", "surfaceId", "eventId", "targetId", "generatedDirection", "commandPrompt"),
                        Arrays.asList("INSERT", "UPDATE"), "파일 기반 SR 티켓 저장소입니다."),
                schema("menu-feature-schema", "메뉴/기능 권한 스키마", "COMTNMENUINFO / COMTNMENUFUNCTIONINFO / COMTNAUTHORFUNCTIONRELATE",
                        Arrays.asList("MENU_CODE", "MENU_URL", "FEATURE_CODE", "AUTHOR_CODE"),
                        Arrays.asList("SELECT"), "워크벤치 자체의 메뉴/권한 연결을 해석합니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("SR_TICKET_STATUS", "SR 티켓 상태", Arrays.asList("OPEN", "APPROVED", "REJECTED", "READY_FOR_CODEX"), "티켓 상태 전이에 사용됩니다."),
                codeGroup("CHANGE_LAYER", "수정 레이어", Arrays.asList("UI", "CSS", "EVENT", "API", "CONTROLLER", "SERVICE", "MAPPER", "SCHEMA", "MENU_AUTH"),
                        "SR 지시 생성 시 선택하는 레이어 그룹입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildWbsManagementPage() {
        Map<String, Object> page = pageOption("wbs-management", "WBS 관리", "/admin/system/wbs-management", "A1900104", "admin");
        page.put("summary", "메뉴별 예상일정과 실적일정, 담당자, 진행률, Codex 작업 지시문을 함께 운영하는 관리자 화면입니다.");
        page.put("source", "frontend/src/features/wbs-management/WbsManagementMigrationPage.tsx");
        page.put("surfaces", Arrays.asList(
                surface("wbs-summary-cards", "WBS 요약 카드", "[data-help-id=\"wbs-summary-cards\"]", "WbsSummaryCards", "actions",
                        Collections.emptyList(), "범위, 진행 메뉴 수, 지연 건수, 평균 편차를 한 번에 보여줍니다."),
                surface("wbs-menu-tree", "메뉴 트리", "[data-help-id=\"wbs-menu-tree\"]", "WbsMenuTree", "content",
                        Arrays.asList("wbs-menu-scope-change", "wbs-menu-select"), "HOME/ADMIN 트리에서 대상 메뉴를 선택합니다."),
                surface("wbs-execution-table", "실행용 WBS 표", "[data-help-id=\"wbs-execution-table\"]", "WbsExecutionTable", "content",
                        Arrays.asList("wbs-row-select", "wbs-excel-download"), "예상/실적 일정과 상태, 편차를 표로 비교합니다."),
                surface("wbs-editor-panel", "선택 메뉴 계획 편집", "[data-help-id=\"wbs-editor-panel\"]", "WbsEditorPanel", "content",
                        Arrays.asList("wbs-entry-save"), "선택 메뉴의 일정, 담당자, 메모, 추가 지시를 저장합니다."),
                surface("wbs-codex-prompt", "Codex 작업 지시문", "[data-help-id=\"wbs-codex-prompt\"]", "WbsCodexPrompt", "content",
                        Collections.singletonList("wbs-open-codex-request"), "저장된 계획을 기준으로 Codex 지시문을 복사하고 Codex 요청 화면으로 이동합니다.")
        ));
        page.put("events", Arrays.asList(
                event("wbs-menu-scope-change", "WBS 범위 전환", "click", "setMenuType", "[data-help-id=\"wbs-menu-tree\"] .gov-btn",
                        Arrays.asList("admin.wbs-management.page"), "HOME/ADMIN 범위를 바꿔 해당 메뉴 집합을 다시 불러옵니다."),
                event("wbs-menu-select", "WBS 메뉴 선택", "click", "setSelectedMenuCode", "[data-help-id=\"wbs-menu-tree\"] button",
                        Collections.emptyList(), "선택한 메뉴 기준으로 계획 편집기와 Codex 지시문을 동기화합니다."),
                event("wbs-row-select", "WBS 실행 행 선택", "click", "setSelectedMenuCode", "[data-help-id=\"wbs-execution-table\"] tr",
                        Collections.emptyList(), "실행 표에서 메뉴 행을 클릭해 상세 계획을 편집합니다."),
                event("wbs-excel-download", "WBS 엑셀 다운로드", "click", "excelDownloadHref", "[data-help-id=\"wbs-execution-table\"] a",
                        Arrays.asList("admin.wbs-management.excel"), "현재 범위와 필터 기준으로 WBS 엑셀을 내려받습니다."),
                event("wbs-entry-save", "WBS 항목 저장", "click", "handleSave", "[data-help-id=\"wbs-editor-panel\"] .gov-btn-primary",
                        Arrays.asList("admin.wbs-management.entry-save"), "선택 메뉴의 일정/담당/메모/Codex 지시를 저장합니다."),
                event("wbs-open-codex-request", "Codex 요청 화면 열기", "click", "buildLocalizedPath", "[data-help-id=\"wbs-codex-prompt\"] a",
                        Collections.emptyList(), "현재 작성한 지시문을 이어서 Codex 요청 화면에서 실행합니다.")
        ));
        page.put("apis", Arrays.asList(
                api("admin.wbs-management.page", "WBS 화면 데이터", "GET", "/admin/system/wbs-management/page-data",
                        "AdminSystemCodeController.getWbsManagementPageData", "WbsManagementService.getPageData",
                        "File-backed read", Arrays.asList("COMTNMENUINFO", "data/wbs-management/entries.json"), Arrays.asList("wbs-management-schema"),
                        "메뉴 트리, WBS 행, 요약 카드, 일정표 데이터를 조회합니다."),
                api("admin.wbs-management.entry-save", "WBS 항목 저장", "POST", "/api/admin/wbs-management/entry",
                        "AdminWbsManagementApiController.saveEntry", "WbsManagementService.saveEntry",
                        "File-backed upsert", Arrays.asList("data/wbs-management/entries.json"), Arrays.asList("wbs-management-schema"),
                        "선택 메뉴의 일정, 상태, 메모, Codex 추가 지시를 저장합니다."),
                api("admin.wbs-management.excel", "WBS 엑셀 다운로드", "GET", "/api/admin/wbs-management/excel",
                        "AdminWbsManagementApiController.downloadExcel", "WbsManagementService.buildExcel",
                        "Workbook export", Arrays.asList("data/wbs-management/entries.json", "COMTNMENUINFO"), Arrays.asList("wbs-management-schema"),
                        "현재 범위와 필터 기준 WBS 엑셀 파일을 생성합니다.")
        ));
        page.put("schemas", Arrays.asList(
                schema("wbs-management-schema", "WBS 관리 모델", "data/wbs-management/entries.json / COMTNMENUINFO",
                        Arrays.asList("menuCode", "owner", "status", "progress", "plannedStartDate", "plannedEndDate", "actualStartDate", "actualEndDate", "codexInstruction"),
                        Arrays.asList("SELECT", "UPSERT", "EXPORT"), "메뉴별 일정 계획과 실행 메모, Codex 지시문 저장소입니다.")
        ));
        page.put("commonCodeGroups", Arrays.asList(
                codeGroup("AMENU1", "관리자 메뉴 코드", Arrays.asList("A1900104"), "WBS 관리 메뉴 분류입니다."),
                codeGroup("WBS_STATUS", "WBS 상태", Arrays.asList("NOT_STARTED", "IN_PROGRESS", "DONE", "BLOCKED"), "WBS 진행 상태 분류입니다.")
        ));
        page.put("changeTargets", defaultChangeTargets());
        return page;
    }

    private Map<String, Object> buildMenuPermission(String menuCode, String menuLookupUrl, String routePath) throws Exception {
        String resolvedMenuCode = firstNonBlank(menuCode, safeSelectMenuCode(menuLookupUrl), safeSelectMenuCode(routePath));
        String requiredViewFeatureCode = firstNonBlank(
                safeSelectRequiredViewFeatureCode(menuLookupUrl),
                safeSelectRequiredViewFeatureCode(routePath)
        );
        List<String> featureCodes = resolvedMenuCode.isEmpty()
                ? Collections.emptyList()
                : safeList(authGroupManageService.selectFeatureCodesByMenuCode(resolvedMenuCode));

        Set<String> featureCodeSet = new LinkedHashSet<>(featureCodes);
        if (!requiredViewFeatureCode.isEmpty()) {
            featureCodeSet.add(requiredViewFeatureCode);
        }

        List<Map<String, Object>> featureRows = new ArrayList<>();
        for (FeatureCatalogItemVO item : safeFeatureCatalog()) {
            if (item == null) {
                continue;
            }
            if (!resolvedMenuCode.isEmpty() && resolvedMenuCode.equalsIgnoreCase(stringValue(item.getMenuCode()))) {
                featureRows.add(featureRow(item));
                continue;
            }
            if (!requiredViewFeatureCode.isEmpty() && requiredViewFeatureCode.equalsIgnoreCase(stringValue(item.getFeatureCode()))) {
                featureRows.add(featureRow(item));
            }
        }

        Map<String, Object> permission = new LinkedHashMap<>();
        permission.put("menuCode", resolvedMenuCode);
        permission.put("menuLookupUrl", menuLookupUrl);
        permission.put("routePath", routePath);
        permission.put("requiredViewFeatureCode", requiredViewFeatureCode);
        permission.put("featureCodes", new ArrayList<>(featureCodeSet));
        permission.put("featureRows", featureRows);
        permission.put("relationTables", Arrays.asList("COMTNMENUINFO", "COMTNMENUFUNCTIONINFO", "COMTNAUTHORFUNCTIONRELATE"));
        permission.put("resolverNotes", Arrays.asList(
                "메뉴 URL은 COMTNMENUINFO.MENU_URL 기준으로 해석합니다.",
                "VIEW 권한은 AuthGroupManageService.selectRequiredViewFeatureCodeByMenuUrl 로 조회합니다.",
                "실제 요청 차단은 AdminMainAuthInterceptor 의 메뉴/기능코드 판정 흐름과 연결됩니다."
        ));
        return permission;
    }

    private List<Map<String, Object>> defaultChangeTargets() {
        return Arrays.asList(
                changeTarget("ui", "UI 요소 수정", Arrays.asList("selector", "layoutZone", "label", "visibleCondition"),
                        "화면 요소 구조, 라벨, 렌더링 조건을 조정합니다."),
                changeTarget("css", "CSS 매핑 수정", Arrays.asList("className", "spacing", "stateStyle"),
                        "class, spacing token, 상태별 표현을 수정합니다."),
                changeTarget("event", "이벤트 연결 수정", Arrays.asList("eventType", "handler", "triggerSelector"),
                        "클릭/submit/change 이벤트와 프론트 핸들러를 바꿉니다."),
                changeTarget("api", "API 연결 수정", Arrays.asList("method", "endpoint", "payload", "response"),
                        "프론트 API 호출과 DTO 연결을 수정합니다."),
                changeTarget("backend", "컨트롤러/서비스/매퍼 수정", Arrays.asList("controller", "service", "mapperQuery"),
                        "백엔드 호출 체인과 조회/저장 경로를 정리합니다."),
                changeTarget("schema", "스키마/테이블 수정", Arrays.asList("table", "column", "writeType", "audit"),
                        "관련 테이블, 컬럼, 쓰기 유형을 점검합니다."),
                changeTarget("menu-auth", "메뉴/기능권한 수정", Arrays.asList("menuCode", "featureCode", "authorRelation"),
                        "페이지 메뉴 코드, 기능 코드, 권한 연결을 조정합니다."),
                changeTarget("common-code", "공통코드 수정", Arrays.asList("codeId", "code", "label"),
                        "상태코드, 메뉴코드, 분류코드 라벨과 값을 정리합니다.")
        );
    }

    private Map<String, Object> pageOption(String pageId, String label, String routePath, String menuCode, String domainCode) {
        Map<String, Object> page = new LinkedHashMap<>();
        page.put("pageId", pageId);
        page.put("label", label);
        page.put("routePath", routePath);
        page.put("menuCode", menuCode);
        page.put("domainCode", domainCode);
        return page;
    }

    private Map<String, Object> surface(String surfaceId, String label, String selector, String componentId, String layoutZone,
                                        List<String> eventIds, String notes) {
        Map<String, Object> surface = new LinkedHashMap<>();
        surface.put("surfaceId", surfaceId);
        surface.put("label", label);
        surface.put("selector", selector);
        surface.put("componentId", componentId);
        surface.put("layoutZone", layoutZone);
        surface.put("eventIds", eventIds);
        surface.put("notes", notes);
        return surface;
    }

    private Map<String, Object> event(String eventId, String label, String eventType, String frontendFunction,
                                      String triggerSelector, List<String> apiIds, String notes) {
        Map<String, Object> event = new LinkedHashMap<>();
        event.put("eventId", eventId);
        event.put("label", label);
        event.put("eventType", eventType);
        event.put("frontendFunction", frontendFunction);
        event.put("triggerSelector", triggerSelector);
        event.put("apiIds", apiIds);
        event.put("notes", notes);
        event.put("functionInputs", Collections.emptyList());
        event.put("functionOutputs", Collections.emptyList());
        event.put("guardConditions", Collections.emptyList());
        event.put("sideEffects", Collections.emptyList());
        return event;
    }

    private Map<String, Object> api(String apiId, String label, String method, String endpoint,
                                    String controllerAction, String serviceMethod, String mapperQuery,
                                    List<String> relatedTables, List<String> schemaIds, String notes) {
        return api(apiId, label, method, endpoint,
                splitChainValues(controllerAction),
                splitChainValues(serviceMethod),
                splitChainValues(mapperQuery),
                relatedTables, schemaIds, notes);
    }

    private Map<String, Object> api(String apiId, String label, String method, String endpoint,
                                    List<String> controllerActions, List<String> serviceMethods, List<String> mapperQueries,
                                    List<String> relatedTables, List<String> schemaIds, String notes) {
        Map<String, Object> api = new LinkedHashMap<>();
        api.put("apiId", apiId);
        api.put("label", label);
        api.put("method", method);
        api.put("endpoint", endpoint);
        api.put("controllerAction", joinChainValues(controllerActions));
        api.put("serviceMethod", joinChainValues(serviceMethods));
        api.put("mapperQuery", joinChainValues(mapperQueries));
        api.put("controllerActions", controllerActions);
        api.put("serviceMethods", serviceMethods);
        api.put("mapperQueries", mapperQueries);
        api.put("relatedTables", relatedTables);
        api.put("schemaIds", schemaIds);
        api.put("notes", notes);
        api.put("requestFields", Collections.emptyList());
        api.put("responseFields", Collections.emptyList());
        api.put("maskingRules", Collections.emptyList());
        return api;
    }

    private Map<String, Object> routeApi(String apiId, String label, String endpoint, String menuCode) {
        return api(apiId, label, "GET", endpoint,
                Collections.singletonList("RouteForward"),
                Collections.singletonList("React router / server forward"),
                Collections.singletonList("N/A"),
                Collections.singletonList(menuCode), Collections.emptyList(), "화면 이동 경로입니다.");
    }

    private List<String> splitChainValues(String value) {
        if (value == null) {
            return Collections.emptyList();
        }
        List<String> items = new ArrayList<>();
        for (String token : value.split("\\r?\\n|\\s+/\\s+")) {
            String normalized = normalize(token);
            if (!normalized.isEmpty()) {
                items.add(normalized);
            }
        }
        return items;
    }

    private String joinChainValues(List<String> values) {
        return String.join(" / ", values == null ? Collections.emptyList() : values);
    }

    private Map<String, Object> schema(String schemaId, String label, String tableName, List<String> columns,
                                       List<String> writePatterns, String notes) {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("schemaId", schemaId);
        schema.put("label", label);
        schema.put("tableName", tableName);
        schema.put("columns", columns);
        schema.put("writePatterns", writePatterns);
        schema.put("notes", notes);
        return schema;
    }

    private Map<String, Object> codeGroup(String codeGroupId, String label, List<String> values, String notes) {
        Map<String, Object> group = new LinkedHashMap<>();
        group.put("codeGroupId", codeGroupId);
        group.put("label", label);
        group.put("values", values);
        group.put("notes", notes);
        return group;
    }

    private Map<String, Object> changeTarget(String targetId, String label, List<String> editableFields, String notes) {
        Map<String, Object> target = new LinkedHashMap<>();
        target.put("targetId", targetId);
        target.put("label", label);
        target.put("editableFields", editableFields);
        target.put("notes", notes);
        return target;
    }

    private Map<String, Object> featureRow(FeatureCatalogItemVO item) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("menuCode", stringValue(item.getMenuCode()));
        row.put("menuNm", stringValue(item.getMenuNm()));
        row.put("menuNmEn", stringValue(item.getMenuNmEn()));
        row.put("menuUrl", stringValue(item.getMenuUrl()));
        row.put("featureCode", stringValue(item.getFeatureCode()));
        row.put("featureNm", stringValue(item.getFeatureNm()));
        row.put("featureNmEn", stringValue(item.getFeatureNmEn()));
        row.put("featureDc", stringValue(item.getFeatureDc()));
        row.put("useAt", stringValue(item.getUseAt()));
        return row;
    }

    private void decoratePageMetadata(String pageId, Map<String, Object> page) {
        List<Map<String, Object>> events = safeMapList(page.get("events"));
        List<Map<String, Object>> apis = safeMapList(page.get("apis"));
        switch (pageId) {
            case "signin-login":
                enrichEvent(events, "signin-login-submit",
                        Arrays.asList(
                                field("userId", "string", true, "form.username", "로그인 아이디"),
                                field("userPw", "password", true, "form.password", "사용자 비밀번호"),
                                field("saveId", "boolean", false, "form.checkbox", "아이디 저장 여부"),
                                field("autoLogin", "boolean", false, "form.checkbox", "자동 로그인 여부")
                        ),
                        Arrays.asList(
                                field("status", "string", true, "json", "로그인 결과 상태"),
                                field("userId", "string", true, "json", "인증된 사용자 아이디"),
                                field("userSe", "string", true, "json", "회원 구분"),
                                field("certified", "boolean", true, "json", "추가 본인인증 필요 여부")
                        ),
                        Arrays.asList("userId 공백 금지", "userPw 공백 금지"),
                        Arrays.asList("로그인 세션 생성", "remember-id/auto-login 쿠키 갱신", "홈 또는 인증선택 화면 이동")
                );
                enrichApi(apis, "signin.login.submit",
                        Arrays.asList(
                                field("userId", "string", true, "body", "로그인 아이디"),
                                field("userPw", "password", true, "body", "로그인 비밀번호"),
                                field("userSe", "string", true, "body", "회원 구분"),
                                field("autoLogin", "boolean", false, "body", "자동 로그인 여부")
                        ),
                        Arrays.asList(
                                field("status", "string", true, "json", "loginSuccess/loginFailure"),
                                field("userId", "string", false, "json", "로그인 성공 사용자 아이디"),
                                field("userSe", "string", false, "json", "회원 구분"),
                                field("certified", "boolean", false, "json", "추가 인증 필요 여부"),
                                field("errors", "string", false, "json", "실패 메시지")
                        ),
                        Arrays.asList(
                                mask("userPw", "drop", "원문 비밀번호 저장 금지"),
                                mask("autoLogin", "allow", "기술 플래그만 저장")
                        )
                );
                break;
            case "signin-find-id":
                enrichEvent(events, "signin-find-id-submit",
                        Arrays.asList(
                                field("applcntNm", "string", true, "form", "신청자 이름"),
                                field("email", "string", true, "form", "이메일 주소"),
                                field("tab", "string", true, "route", "국내/해외 탭"),
                                field("verificationCode", "string", false, "form", "이메일 인증번호")
                        ),
                        Arrays.asList(
                                field("nextRoute", "string", true, "route", "결과 화면 경로")
                        ),
                        Arrays.asList("이름 필수", "이메일 필수"),
                        Arrays.asList("결과 화면으로 query string 이동")
                );
                enrichApi(apis, "signin.find-id.result",
                        Arrays.asList(
                                field("applcntNm", "string", true, "query", "신청자 이름"),
                                field("email", "string", true, "query", "이메일 주소"),
                                field("tab", "string", false, "query", "국내/해외 탭")
                        ),
                        Arrays.asList(
                                field("found", "boolean", true, "json", "조회 성공 여부"),
                                field("maskedId", "string", true, "json", "마스킹된 사용자 아이디"),
                                field("passwordResetUrl", "string", true, "json", "비밀번호 재설정 경로"),
                                field("tab", "string", true, "json", "탭 상태")
                        ),
                        Arrays.asList(
                                mask("maskedId", "partial-mask", "사용자 아이디 일부만 노출"),
                                mask("email", "hash-or-drop", "검색용 이메일 원문 재노출 금지")
                        )
                );
                break;
            case "signin-find-id-result":
                enrichEvent(events, "signin-find-id-result-load",
                        Arrays.asList(
                                field("applcntNm", "string", true, "query", "신청자 이름"),
                                field("email", "string", true, "query", "이메일 주소"),
                                field("tab", "string", false, "query", "국내/해외 탭")
                        ),
                        Arrays.asList(
                                field("found", "boolean", true, "state", "조회 성공 여부"),
                                field("maskedId", "string", true, "state", "마스킹 아이디")
                        ),
                        Collections.emptyList(),
                        Arrays.asList("조회 결과 카드 렌더링")
                );
                break;
            case "signin-find-password":
                enrichEvent(events, "signin-find-password-verify",
                        Arrays.asList(
                                field("userId", "string", true, "form", "사용자 아이디"),
                                field("email", "string", false, "form", "이메일 주소"),
                                field("verificationCode", "string", false, "form", "이메일 인증번호"),
                                field("authMethod", "string", false, "form", "인증 수단")
                        ),
                        Arrays.asList(
                                field("verified", "boolean", true, "state", "본인확인 완료 상태")
                        ),
                        Arrays.asList("userId 필수"),
                        Arrays.asList("재설정 폼 활성화")
                );
                enrichEvent(events, "signin-find-password-reset-submit",
                        Arrays.asList(
                                field("userId", "string", true, "state", "확인 완료된 사용자"),
                                field("password", "password", true, "form", "새 비밀번호"),
                                field("passwordConfirm", "password", true, "form", "비밀번호 확인")
                        ),
                        Arrays.asList(
                                field("nextRoute", "string", true, "route", "완료 화면 경로")
                        ),
                        Arrays.asList("verified 상태여야 함", "password와 passwordConfirm 일치"),
                        Arrays.asList("비밀번호 변경", "완료 화면 이동")
                );
                enrichApi(apis, "signin.find-password.reset",
                        Arrays.asList(
                                field("userId", "string", true, "body", "비밀번호 재설정 대상"),
                                field("password", "password", true, "body", "새 비밀번호"),
                                field("passwordConfirm", "password", true, "body", "새 비밀번호 확인")
                        ),
                        Arrays.asList(
                                field("success", "boolean", true, "json", "재설정 성공 여부"),
                                field("message", "string", false, "json", "응답 메시지")
                        ),
                        Arrays.asList(
                                mask("password", "drop", "비밀번호 저장 금지"),
                                mask("passwordConfirm", "drop", "비밀번호 확인값 저장 금지")
                        )
                );
                break;
            case "member-edit":
                enrichEvent(events, "member-edit-page-load",
                        Arrays.asList(
                                field("memberId", "string", true, "query", "조회 대상 회원 ID")
                        ),
                        Arrays.asList(
                                field("member", "object", true, "state", "회원 기본 정보"),
                                field("permissionFeatureSections", "array", true, "state", "권한 메뉴/기능 섹션"),
                                field("memberEvidenceFiles", "array", false, "state", "회원 증빙 파일 목록")
                        ),
                        Arrays.asList("memberId 공백 금지"),
                        Arrays.asList("회원 수정 화면 초기 상태 구성")
                );
                enrichEvent(events, "member-edit-feature-toggle",
                        Arrays.asList(
                                field("featureCode", "string", true, "checkbox", "토글 대상 기능 코드")
                        ),
                        Arrays.asList(
                                field("featureCodes", "string[]", true, "state", "현재 선택된 기능 코드 목록")
                        ),
                        Collections.emptyList(),
                        Arrays.asList("회원 개별 권한 선택 상태 갱신")
                );
                enrichEvent(events, "member-edit-save",
                        Arrays.asList(
                                field("memberId", "string", true, "state", "수정 대상 회원 ID"),
                                field("applcntNm", "string", true, "form", "회원명"),
                                field("applcntEmailAdres", "string", true, "form", "이메일"),
                                field("phoneNumber", "string", true, "form", "연락처"),
                                field("entrprsSeCode", "string", true, "form", "회원 유형"),
                                field("entrprsMberSttus", "string", true, "form", "회원 상태"),
                                field("authorCode", "string", false, "form", "기준 권한 롤"),
                                field("featureCodes", "string[]", false, "state", "회원 개별 권한"),
                                field("zip", "string", false, "form", "우편번호"),
                                field("adres", "string", false, "form", "기본주소"),
                                field("detailAdres", "string", false, "form", "상세주소"),
                                field("marketingYn", "string", false, "form", "마케팅 동의"),
                                field("deptNm", "string", false, "form", "부서명")
                        ),
                        Arrays.asList(
                                field("success", "boolean", true, "json", "저장 성공 여부"),
                                field("memberId", "string", true, "json", "저장 완료 회원 ID")
                        ),
                        Arrays.asList("memberId 필수", "이름 필수", "이메일 필수"),
                        Arrays.asList("회원 기본정보 저장", "회원 권한 override 저장", "성공 메시지 갱신")
                );
                enrichApi(apis, "admin.member.edit.page",
                        Arrays.asList(
                                field("memberId", "string", true, "query", "조회 대상 회원 ID"),
                                field("updated", "string", false, "query", "저장 완료 플래그")
                        ),
                        Arrays.asList(
                                field("member", "object", true, "json", "회원 기본 정보"),
                                field("memberTypeOptions", "array", true, "json", "회원 유형 드롭다운"),
                                field("memberStatusOptions", "array", true, "json", "회원 상태 드롭다운"),
                                field("permissionAuthorGroups", "array", true, "json", "권한 롤 목록"),
                                field("permissionFeatureSections", "array", true, "json", "기능 섹션"),
                                field("memberEvidenceFiles", "array", false, "json", "회원 증빙 파일 목록"),
                                field("canViewMemberEdit", "boolean", true, "json", "조회 권한"),
                                field("canUseMemberSave", "boolean", true, "json", "저장 권한")
                        ),
                        Arrays.asList(
                                mask("applcntEmailAdres", "partial-mask", "관리 화면에는 전체 표시 가능하지만 trace에는 요약 저장"),
                                mask("phoneNumber", "partial-mask", "연락처 원문 저장 최소화")
                        )
                );
                enrichApi(apis, "admin.member.edit.save",
                        Arrays.asList(
                                field("memberId", "string", true, "body", "수정 대상 회원 ID"),
                                field("applcntNm", "string", true, "body", "회원명"),
                                field("applcntEmailAdres", "string", true, "body", "이메일"),
                                field("phoneNumber", "string", true, "body", "연락처"),
                                field("entrprsSeCode", "string", true, "body", "회원 유형"),
                                field("entrprsMberSttus", "string", true, "body", "회원 상태"),
                                field("authorCode", "string", false, "body", "기준 권한 롤"),
                                field("featureCodes", "string[]", false, "body", "개별 기능 권한"),
                                field("zip", "string", false, "body", "우편번호"),
                                field("adres", "string", false, "body", "기본주소"),
                                field("detailAdres", "string", false, "body", "상세주소"),
                                field("marketingYn", "string", false, "body", "마케팅 동의"),
                                field("deptNm", "string", false, "body", "부서명")
                        ),
                        Arrays.asList(
                                field("success", "boolean", true, "json", "저장 성공 여부"),
                                field("memberId", "string", true, "json", "저장 완료 회원 ID"),
                                field("message", "string", false, "json", "실패 또는 성공 메시지")
                        ),
                        Arrays.asList(
                                mask("applcntEmailAdres", "partial-mask", "이메일 원문 trace 최소화"),
                                mask("phoneNumber", "partial-mask", "전화번호 원문 trace 최소화"),
                                mask("adres", "metadata-only", "상세 주소 전체 원문 저장 금지"),
                                mask("detailAdres", "metadata-only", "상세 주소 전체 원문 저장 금지")
                        )
                );
                break;
            case "company-account":
                enrichEvent(events, "company-account-load",
                        Arrays.asList(
                                field("insttId", "string", false, "form", "조회 대상 기관 ID")
                        ),
                        Arrays.asList(
                                field("companyAccountForm", "object", true, "state", "회원사 수정 기본정보"),
                                field("companyAccountFiles", "array", false, "state", "첨부 파일 목록")
                        ),
                        Collections.emptyList(),
                        Arrays.asList("회원사 수정 payload 재조회")
                );
                enrichEvent(events, "company-account-file-select",
                        Arrays.asList(
                                field("fileUploads", "file[]", false, "file-input", "선택한 신규 첨부 파일")
                        ),
                        Arrays.asList(
                                field("files", "file[]", true, "state", "업로드 예정 파일 목록")
                        ),
                        Arrays.asList("파일당 10MB 이하", "pdf/jpg/jpeg/png만 허용"),
                        Arrays.asList("업로드 예정 파일 목록 갱신")
                );
                enrichEvent(events, "company-account-save",
                        Arrays.asList(
                                field("insttId", "string", false, "state", "수정 대상 기관 ID"),
                                field("membershipType", "string", true, "form", "회원사 유형"),
                                field("agencyName", "string", true, "form", "기관/기업명"),
                                field("representativeName", "string", true, "form", "대표자명"),
                                field("bizRegistrationNumber", "string", true, "form", "사업자등록번호"),
                                field("zipCode", "string", true, "form", "우편번호"),
                                field("companyAddress", "string", true, "form", "기본주소"),
                                field("companyAddressDetail", "string", false, "form", "상세주소"),
                                field("chargerName", "string", true, "form", "담당자명"),
                                field("chargerEmail", "string", true, "form", "담당자 이메일"),
                                field("chargerTel", "string", true, "form", "담당자 연락처"),
                                field("fileUploads", "file[]", false, "state", "신규 첨부 파일")
                        ),
                        Arrays.asList(
                                field("success", "boolean", true, "json", "저장 성공 여부"),
                                field("insttId", "string", true, "json", "저장 완료 기관 ID")
                        ),
                        Arrays.asList("membershipType 필수", "agencyName 필수", "bizRegistrationNumber 필수"),
                        Arrays.asList("회원사 기본정보 저장", "첨부 파일 저장", "조회 키 갱신")
                );
                enrichApi(apis, "admin.member.company-account.page",
                        Arrays.asList(
                                field("insttId", "string", false, "query", "조회 대상 기관 ID"),
                                field("saved", "string", false, "query", "저장 완료 플래그")
                        ),
                        Arrays.asList(
                                field("companyAccountForm", "object", true, "json", "회원사 수정 기본정보"),
                                field("companyAccountFiles", "array", false, "json", "저장 첨부 목록"),
                                field("canViewCompanyAccount", "boolean", true, "json", "조회 권한"),
                                field("canUseCompanyAccountSave", "boolean", true, "json", "저장 권한"),
                                field("isEditMode", "boolean", true, "json", "수정 모드 여부")
                        ),
                        Arrays.asList(
                                mask("bizrno", "partial-mask", "사업자번호 전체 원문 trace 금지"),
                                mask("chargerEmail", "partial-mask", "담당자 이메일 trace 최소화"),
                                mask("chargerTel", "partial-mask", "담당자 연락처 trace 최소화")
                        )
                );
                enrichApi(apis, "admin.member.company-account.save",
                        Arrays.asList(
                                field("insttId", "string", false, "multipart", "수정 대상 기관 ID"),
                                field("membershipType", "string", true, "multipart", "회원사 유형"),
                                field("agencyName", "string", true, "multipart", "기관/기업명"),
                                field("representativeName", "string", true, "multipart", "대표자명"),
                                field("bizRegistrationNumber", "string", true, "multipart", "사업자등록번호"),
                                field("zipCode", "string", true, "multipart", "우편번호"),
                                field("companyAddress", "string", true, "multipart", "기본주소"),
                                field("companyAddressDetail", "string", false, "multipart", "상세주소"),
                                field("chargerName", "string", true, "multipart", "담당자명"),
                                field("chargerEmail", "string", true, "multipart", "담당자 이메일"),
                                field("chargerTel", "string", true, "multipart", "담당자 연락처"),
                                field("fileUploads", "file[]", false, "multipart", "신규 첨부 파일")
                        ),
                        Arrays.asList(
                                field("success", "boolean", true, "json", "저장 성공 여부"),
                                field("insttId", "string", true, "json", "저장 완료 기관 ID"),
                                field("message", "string", false, "json", "실패 또는 성공 메시지")
                        ),
                        Arrays.asList(
                                mask("bizRegistrationNumber", "partial-mask", "사업자번호 원문 저장 최소화"),
                                mask("chargerEmail", "partial-mask", "담당자 이메일 trace 최소화"),
                                mask("chargerTel", "partial-mask", "담당자 연락처 trace 최소화"),
                                mask("fileUploads", "metadata-only", "파일 바이트 저장 금지")
                        )
                );
                break;
            case "join-terms":
                enrichEvent(events, "join-terms-submit",
                        Arrays.asList(
                                field("agreeTerms", "boolean", true, "state", "필수 약관 동의"),
                                field("agreePrivacy", "boolean", true, "state", "개인정보 동의"),
                                field("marketingYn", "string", false, "state", "마케팅 동의")
                        ),
                        Arrays.asList(
                                field("step", "string", true, "session", "다음 가입 단계")
                        ),
                        Arrays.asList("필수 약관 2종 동의 필요"),
                        Arrays.asList("가입 step2 세션 저장", "step3 이동")
                );
                enrichApi(apis, "join.step2.save",
                        Arrays.asList(
                                field("marketing_yn", "string", true, "form", "Y/N 마케팅 동의")
                        ),
                        Arrays.asList(
                                field("success", "boolean", true, "json", "저장 성공 여부"),
                                field("step", "string", false, "json", "현재 단계")
                        ),
                        Collections.emptyList()
                );
                break;
            case "join-auth":
                enrichEvent(events, "join-auth-select-method",
                        Arrays.asList(
                                field("authMethod", "string", true, "click", "선택한 본인확인 수단")
                        ),
                        Arrays.asList(
                                field("step", "string", true, "session", "다음 가입 단계")
                        ),
                        Arrays.asList("동시에 하나의 인증 수단만 처리"),
                        Arrays.asList("가입 step3 세션 저장", "step4 이동")
                );
                enrichApi(apis, "join.step3.save",
                        Arrays.asList(
                                field("auth_method", "string", true, "form", "선택한 인증 수단")
                        ),
                        Arrays.asList(
                                field("success", "boolean", true, "json", "저장 성공 여부"),
                                field("authMethod", "string", false, "json", "세션 반영 인증 수단")
                        ),
                        Collections.emptyList()
                );
                break;
            case "join-info":
                enrichEvent(events, "join-info-submit",
                        Arrays.asList(
                                field("mberId", "string", true, "form", "가입 아이디"),
                                field("password", "password", true, "form", "가입 비밀번호"),
                                field("mberNm", "string", true, "form", "사용자 이름"),
                                field("insttId", "string", true, "form", "소속 기관 ID"),
                                field("applcntEmailAdres", "string", true, "form", "이메일"),
                                field("fileUploads", "file[]", true, "form", "증빙 파일")
                        ),
                        Arrays.asList(
                                field("mberId", "string", true, "sessionStorage", "완료 화면 표시용 아이디"),
                                field("nextRoute", "string", true, "route", "가입 완료 경로")
                        ),
                        Arrays.asList("아이디 중복 확인 완료", "이메일 중복 확인 완료", "증빙 파일 1건 이상"),
                        Arrays.asList("가입 정보 저장", "첨부 업로드", "step5 이동")
                );
                enrichApi(apis, "join.step4.submit",
                        Arrays.asList(
                                field("mberId", "string", true, "multipart", "가입 아이디"),
                                field("password", "password", true, "multipart", "가입 비밀번호"),
                                field("mberNm", "string", true, "multipart", "신청자명"),
                                field("insttId", "string", true, "multipart", "기관 ID"),
                                field("bizrno", "string", true, "multipart", "사업자등록번호"),
                                field("applcntEmailAdres", "string", true, "multipart", "이메일"),
                                field("fileUploads", "file[]", true, "multipart", "첨부 파일 배열")
                        ),
                        Arrays.asList(
                                field("success", "boolean", true, "json", "제출 성공 여부"),
                                field("mberId", "string", true, "json", "저장된 사용자 아이디"),
                                field("mberNm", "string", true, "json", "저장된 사용자 이름"),
                                field("insttNm", "string", true, "json", "저장된 기관명")
                        ),
                        Arrays.asList(
                                mask("password", "drop", "비밀번호 저장 금지"),
                                mask("applcntEmailAdres", "partial-mask", "응답/로그 노출 최소화")
                        )
                );
                break;
            case "join-company-register":
                enrichApi(apis, "join.company-register.submit",
                        Arrays.asList(
                                field("membershipType", "string", true, "multipart", "회원사 유형"),
                                field("agencyName", "string", true, "multipart", "기관/기업명"),
                                field("representativeName", "string", true, "multipart", "대표자명"),
                                field("bizRegistrationNumber", "string", true, "multipart", "사업자등록번호"),
                                field("chargerEmail", "string", true, "multipart", "담당자 이메일"),
                                field("fileUploads", "file[]", true, "multipart", "증빙 첨부")
                        ),
                        Arrays.asList(
                                field("success", "boolean", true, "json", "등록 성공 여부"),
                                field("insttNm", "string", true, "json", "등록 기관명"),
                                field("bizrno", "string", true, "json", "사업자번호"),
                                field("regDate", "string", true, "json", "접수 일시")
                        ),
                        Arrays.asList(
                                mask("chargerEmail", "partial-mask", "운영 조회 외 최소 노출"),
                                mask("fileUploads", "metadata-only", "첨부 원문은 파일 저장소에서만 관리")
                        )
                );
                break;
            case "join-company-status-detail":
                enrichEvent(events, "join-company-status-detail-load",
                        Arrays.asList(
                                field("bizNo", "string", false, "query", "사업자등록번호"),
                                field("appNo", "string", false, "query", "신청번호"),
                                field("repName", "string", true, "query", "대표자명")
                        ),
                        Arrays.asList(
                                field("result", "object", true, "state", "가입 상태 상세"),
                                field("insttFiles", "array", true, "state", "첨부 목록")
                        ),
                        Arrays.asList("bizNo 또는 appNo 중 하나 필요", "repName 필수"),
                        Arrays.asList("상태 타임라인 렌더링", "첨부 다운로드/재신청 액션 노출")
                );
                enrichApi(apis, "join.company-status.detail",
                        Arrays.asList(
                                field("bizNo", "string", false, "query", "사업자등록번호"),
                                field("appNo", "string", false, "query", "신청번호"),
                                field("repName", "string", true, "query", "대표자명")
                        ),
                        Arrays.asList(
                                field("success", "boolean", true, "json", "조회 성공 여부"),
                                field("result.insttSttus", "string", true, "json", "가입 상태"),
                                field("result.rjctRsn", "string", false, "json", "반려 사유"),
                                field("insttFiles", "array", true, "json", "첨부 목록")
                        ),
                        Arrays.asList(
                                mask("repName", "partial-mask", "검색 입력값 최소 보존"),
                                mask("result.rjctRsn", "allow", "운영 판단 사유로 관리자/본인 조회 허용")
                        )
                );
                break;
            case "join-company-reapply":
                enrichApi(apis, "join.company-reapply.submit",
                        Arrays.asList(
                                field("insttId", "string", true, "multipart", "기관 ID"),
                                field("agencyName", "string", true, "multipart", "기관명"),
                                field("representativeName", "string", true, "multipart", "대표자명"),
                                field("chargerEmail", "string", true, "multipart", "담당자 이메일"),
                                field("fileUploads", "file[]", true, "multipart", "보완 첨부")
                        ),
                        Arrays.asList(
                                field("success", "boolean", true, "json", "재신청 성공 여부"),
                                field("insttNm", "string", true, "json", "재신청 기관명")
                        ),
                        Arrays.asList(
                                mask("chargerEmail", "partial-mask", "개인정보 최소 노출"),
                                mask("fileUploads", "metadata-only", "첨부는 메타데이터만 추적")
                        )
                );
                break;
            case "mypage":
                enrichEvent(events, "mypage-save",
                        Arrays.asList(
                                field("fullName", "string", true, "form", "사용자 이름"),
                                field("email", "string", true, "form", "이메일"),
                                field("phone", "string", true, "form", "연락처"),
                                field("jobTitle", "string", false, "form", "직책")
                        ),
                        Arrays.asList(
                                field("success", "boolean", true, "state", "저장 성공 여부"),
                                field("message", "string", false, "state", "저장 결과 메시지")
                        ),
                        Arrays.asList("인증된 사용자만 가능"),
                        Arrays.asList("프로필 정보 갱신", "감사 로그 기록")
                );
                enrichApi(apis, "mypage.save",
                        Arrays.asList(
                                field("fullName", "string", true, "body", "사용자 이름"),
                                field("email", "string", true, "body", "이메일"),
                                field("areaNo", "string", true, "body", "전화 지역번호"),
                                field("middleTelno", "string", true, "body", "전화 중간번호"),
                                field("endTelno", "string", true, "body", "전화 끝번호"),
                                field("jobTitle", "string", false, "body", "직책")
                        ),
                        Arrays.asList(
                                field("success", "boolean", true, "json", "저장 성공 여부"),
                                field("page", "object", false, "json", "갱신된 페이지 데이터")
                        ),
                        Arrays.asList(
                                mask("email", "partial-mask", "개인정보 최소 노출"),
                                mask("middleTelno", "partial-mask", "연락처 일부 마스킹")
                        )
                );
                break;
            default:
                break;
        }
    }

    private void enrichEvent(List<Map<String, Object>> events, String eventId, List<Map<String, Object>> functionInputs,
                             List<Map<String, Object>> functionOutputs, List<String> guardConditions, List<String> sideEffects) {
        for (Map<String, Object> event : events) {
            if (eventId.equals(stringValue(event.get("eventId")))) {
                event.put("functionInputs", functionInputs);
                event.put("functionOutputs", functionOutputs);
                event.put("guardConditions", guardConditions);
                event.put("sideEffects", sideEffects);
                return;
            }
        }
    }

    private void enrichApi(List<Map<String, Object>> apis, String apiId, List<Map<String, Object>> requestFields,
                           List<Map<String, Object>> responseFields, List<Map<String, Object>> maskingRules) {
        for (Map<String, Object> api : apis) {
            if (apiId.equals(stringValue(api.get("apiId")))) {
                api.put("requestFields", requestFields);
                api.put("responseFields", responseFields);
                api.put("maskingRules", maskingRules);
                return;
            }
        }
    }

    private Map<String, Object> field(String fieldId, String type, boolean required, String source, String notes) {
        Map<String, Object> field = new LinkedHashMap<>();
        field.put("fieldId", fieldId);
        field.put("type", type);
        field.put("required", required);
        field.put("source", source);
        field.put("notes", notes);
        return field;
    }

    private Map<String, Object> mask(String fieldId, String strategy, String notes) {
        Map<String, Object> mask = new LinkedHashMap<>();
        mask.put("fieldId", fieldId);
        mask.put("strategy", strategy);
        mask.put("notes", notes);
        return mask;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> safeMapList(Object value) {
        if (!(value instanceof List)) {
            return Collections.emptyList();
        }
        List<?> source = (List<?>) value;
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object item : source) {
            if (item instanceof Map) {
                result.add((Map<String, Object>) item);
            }
        }
        return result;
    }

    private String resolveMenuLookupUrl(String pageId, String routePath) {
        if (routePath.startsWith("/admin/")) {
            return routePath;
        }
        if (routePath.startsWith("/en/admin/")) {
            return routePath;
        }
        return routePath;
    }

    private List<FeatureCatalogItemVO> safeFeatureCatalog() throws Exception {
        List<FeatureCatalogItemVO> items = authGroupManageService.selectFeatureCatalog();
        return items == null ? Collections.emptyList() : items;
    }

    private List<String> safeList(List<String> values) {
        return values == null ? Collections.emptyList() : values;
    }

    private String safeSelectMenuCode(String menuUrl) throws Exception {
        if (normalize(menuUrl).isEmpty()) {
            return "";
        }
        try {
            return stringValue(authGroupManageService.selectMenuCodeByMenuUrl(menuUrl));
        } catch (Exception ignored) {
            return "";
        }
    }

    private String safeSelectRequiredViewFeatureCode(String menuUrl) throws Exception {
        if (normalize(menuUrl).isEmpty()) {
            return "";
        }
        try {
            return stringValue(authGroupManageService.selectRequiredViewFeatureCodeByMenuUrl(menuUrl));
        } catch (Exception ignored) {
            return "";
        }
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            String normalized = normalize(value);
            if (!normalized.isEmpty()) {
                return normalized;
            }
        }
        return "";
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
