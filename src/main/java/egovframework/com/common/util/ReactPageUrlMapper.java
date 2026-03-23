package egovframework.com.common.util;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

public final class ReactPageUrlMapper {

    private static final Map<String, String> ADMIN_PATH_TO_ROUTE;
    private static final Map<String, String> ADMIN_ROUTE_TO_PATH;
    private static final Map<String, String> HOME_PATH_TO_ROUTE;
    private static final Map<String, String> HOME_ROUTE_TO_PATH;
    private static final Map<String, String> HOME_LOCALIZED_PATHS;

    static {
        Map<String, String> adminPathToRoute = new LinkedHashMap<>();
        Map<String, String> adminRouteToPath = new LinkedHashMap<>();
        Map<String, String> homePathToRoute = new LinkedHashMap<>();
        Map<String, String> homeRouteToPath = new LinkedHashMap<>();
        Map<String, String> homeLocalizedPaths = new LinkedHashMap<>();

        registerAdmin(adminPathToRoute, adminRouteToPath, "admin_home", "/admin/", "/admin", "/admin/");
        registerAdmin(adminPathToRoute, adminRouteToPath, "admin_login", "/admin/login/loginView", "/admin/login/loginView");
        registerAdmin(adminPathToRoute, adminRouteToPath, "member_approve", "/admin/member/approve", "/admin/member/approve");
        registerAdmin(adminPathToRoute, adminRouteToPath, "company_approve", "/admin/member/company-approve", "/admin/member/company-approve");
        registerAdmin(adminPathToRoute, adminRouteToPath, "member_edit", "/admin/member/edit", "/admin/member/edit");
        registerAdmin(adminPathToRoute, adminRouteToPath, "member_detail", "/admin/member/detail", "/admin/member/detail");
        registerAdmin(adminPathToRoute, adminRouteToPath, "password_reset", "/admin/member/reset_password", "/admin/member/reset_password");
        registerAdmin(adminPathToRoute, adminRouteToPath, "member_list", "/admin/member/list", "/admin/member/list");
        registerAdmin(adminPathToRoute, adminRouteToPath, "member_withdrawn", "/admin/member/withdrawn", "/admin/member/withdrawn");
        registerAdmin(adminPathToRoute, adminRouteToPath, "member_activate", "/admin/member/activate", "/admin/member/activate");
        registerAdmin(adminPathToRoute, adminRouteToPath, "admin_list", "/admin/member/admin_list", "/admin/member/admin_list", "/admin/member/admin-list");
        registerAdmin(adminPathToRoute, adminRouteToPath, "company_list", "/admin/member/company_list", "/admin/member/company_list");
        registerAdmin(adminPathToRoute, adminRouteToPath, "company_detail", "/admin/member/company_detail", "/admin/member/company_detail");
        registerAdmin(adminPathToRoute, adminRouteToPath, "company_account", "/admin/member/company_account", "/admin/member/company_account");
        registerAdmin(adminPathToRoute, adminRouteToPath, "admin_create", "/admin/member/admin_account", "/admin/member/admin_account");
        registerAdmin(adminPathToRoute, adminRouteToPath, "admin_permission", "/admin/member/admin_account/permissions", "/admin/member/admin_account/permissions");
        registerAdmin(adminPathToRoute, adminRouteToPath, "member_stats", "/admin/member/stats", "/admin/member/stats");
        registerAdmin(adminPathToRoute, adminRouteToPath, "member_register", "/admin/member/register", "/admin/member/register");
        registerAdmin(adminPathToRoute, adminRouteToPath, "auth_group", "/admin/auth/group", "/admin/auth/group", "/admin/member/auth-group", "/admin/system/role");
        registerAdmin(adminPathToRoute, adminRouteToPath, "auth_change", "/admin/member/auth-change", "/admin/member/auth-change", "/admin/system/auth-change");
        registerAdmin(adminPathToRoute, adminRouteToPath, "dept_role", "/admin/member/dept-role-mapping", "/admin/member/dept-role-mapping", "/admin/system/dept-role-mapping");
        registerAdmin(adminPathToRoute, adminRouteToPath, "emission_result_list", "/admin/emission/result_list", "/admin/emission/result_list");
        registerAdmin(adminPathToRoute, adminRouteToPath, "system_code", "/admin/system/code", "/admin/system/code");
        registerAdmin(adminPathToRoute, adminRouteToPath, "page_management", "/admin/system/page-management", "/admin/system/page-management");
        registerAdmin(adminPathToRoute, adminRouteToPath, "function_management", "/admin/system/feature-management", "/admin/system/feature-management");
        registerAdmin(adminPathToRoute, adminRouteToPath, "menu_management", "/admin/system/menu-management", "/admin/system/menu-management");
        registerAdmin(adminPathToRoute, adminRouteToPath, "ip_whitelist", "/admin/system/ip_whitelist", "/admin/system/ip_whitelist");
        registerAdmin(adminPathToRoute, adminRouteToPath, "access_history", "/admin/system/access_history", "/admin/system/access_history");
        registerAdmin(adminPathToRoute, adminRouteToPath, "login_history", "/admin/member/login_history", "/admin/member/login_history");
        registerAdmin(adminPathToRoute, adminRouteToPath, "security_history", "/admin/system/security", "/admin/system/security");
        registerAdmin(adminPathToRoute, adminRouteToPath, "security_policy", "/admin/system/security-policy", "/admin/system/security-policy");
        registerAdmin(adminPathToRoute, adminRouteToPath, "security_monitoring", "/admin/system/security-monitoring", "/admin/system/security-monitoring");
        registerAdmin(adminPathToRoute, adminRouteToPath, "blocklist", "/admin/system/blocklist", "/admin/system/blocklist");
        registerAdmin(adminPathToRoute, adminRouteToPath, "security_audit", "/admin/system/security-audit", "/admin/system/security-audit");
        registerAdmin(adminPathToRoute, adminRouteToPath, "scheduler_management", "/admin/system/scheduler", "/admin/system/scheduler");
        registerAdmin(adminPathToRoute, adminRouteToPath, "codex_request", "/admin/system/codex-request", "/admin/system/codex-request");
        registerAdmin(adminPathToRoute, adminRouteToPath, "observability", "/admin/system/observability", "/admin/system/observability");
        registerAdmin(adminPathToRoute, adminRouteToPath, "help_management", "/admin/system/help-management", "/admin/system/help-management");
        registerAdmin(adminPathToRoute, adminRouteToPath, "full_stack_management", "/admin/system/full-stack-management", "/admin/system/full-stack-management");
        registerAdmin(adminPathToRoute, adminRouteToPath, "platform_studio", "/admin/system/platform-studio", "/admin/system/platform-studio");
        registerAdmin(adminPathToRoute, adminRouteToPath, "screen_elements_management", "/admin/system/screen-elements-management", "/admin/system/screen-elements-management");
        registerAdmin(adminPathToRoute, adminRouteToPath, "event_management_console", "/admin/system/event-management-console", "/admin/system/event-management-console");
        registerAdmin(adminPathToRoute, adminRouteToPath, "function_management_console", "/admin/system/function-management-console", "/admin/system/function-management-console");
        registerAdmin(adminPathToRoute, adminRouteToPath, "api_management_console", "/admin/system/api-management-console", "/admin/system/api-management-console");
        registerAdmin(adminPathToRoute, adminRouteToPath, "controller_management_console", "/admin/system/controller-management-console", "/admin/system/controller-management-console");
        registerAdmin(adminPathToRoute, adminRouteToPath, "db_table_management", "/admin/system/db-table-management", "/admin/system/db-table-management");
        registerAdmin(adminPathToRoute, adminRouteToPath, "column_management_console", "/admin/system/column-management-console", "/admin/system/column-management-console");
        registerAdmin(adminPathToRoute, adminRouteToPath, "automation_studio", "/admin/system/automation-studio", "/admin/system/automation-studio");
        registerAdmin(adminPathToRoute, adminRouteToPath, "environment_management", "/admin/system/environment-management", "/admin/system/environment-management");
        registerAdmin(adminPathToRoute, adminRouteToPath, "wbs_management", "/admin/system/wbs-management", "/admin/system/wbs-management");
        registerAdmin(adminPathToRoute, adminRouteToPath, "sr_workbench", "/admin/system/sr-workbench", "/admin/system/sr-workbench");
        registerAdmin(adminPathToRoute, adminRouteToPath, "error_log", "/admin/system/error-log", "/admin/system/error-log");

        registerHome(homePathToRoute, homeRouteToPath, homeLocalizedPaths, "mypage", "/mypage", "/en/mypage", "/mypage");
        registerHome(homePathToRoute, homeRouteToPath, homeLocalizedPaths, "join_wizard", "/join/step1", "/join/en/step1", "/join/step1", "/join/overseas/step1");
        registerHome(homePathToRoute, homeRouteToPath, homeLocalizedPaths, "join_terms", "/join/step2", "/join/en/step2", "/join/step2");
        registerHome(homePathToRoute, homeRouteToPath, homeLocalizedPaths, "join_auth", "/join/step3", "/join/en/step3", "/join/step3");
        registerHome(homePathToRoute, homeRouteToPath, homeLocalizedPaths, "join_info", "/join/step4", "/join/en/step4", "/join/step4");
        registerHome(homePathToRoute, homeRouteToPath, homeLocalizedPaths, "join_company_register", "/join/companyRegister", "/join/en/companyRegister", "/join/companyRegister");
        registerHome(homePathToRoute, homeRouteToPath, homeLocalizedPaths, "join_company_register_complete", "/join/companyRegisterComplete", "/join/en/companyRegisterComplete", "/join/companyRegisterComplete");
        registerHome(homePathToRoute, homeRouteToPath, homeLocalizedPaths, "join_company_status", "/join/companyJoinStatusSearch", "/join/en/companyJoinStatusSearch", "/join/companyJoinStatusSearch", "/join/companyJoinStatusDetail");
        registerHome(homePathToRoute, homeRouteToPath, homeLocalizedPaths, "join_company_status_guide", "/join/companyJoinStatusGuide", "/join/en/companyJoinStatusGuide", "/join/companyJoinStatusGuide");
        registerHome(homePathToRoute, homeRouteToPath, homeLocalizedPaths, "join_company_reapply", "/join/companyReapply", "/join/en/companyReapply", "/join/companyReapply");

        ADMIN_PATH_TO_ROUTE = Collections.unmodifiableMap(adminPathToRoute);
        ADMIN_ROUTE_TO_PATH = Collections.unmodifiableMap(adminRouteToPath);
        HOME_PATH_TO_ROUTE = Collections.unmodifiableMap(homePathToRoute);
        HOME_ROUTE_TO_PATH = Collections.unmodifiableMap(homeRouteToPath);
        HOME_LOCALIZED_PATHS = Collections.unmodifiableMap(homeLocalizedPaths);
    }

    private ReactPageUrlMapper() {
    }

    public static String toRuntimeUrl(String menuUrl, boolean english) {
        String normalized = normalize(menuUrl);
        if (normalized.isEmpty()) {
            return "";
        }
        if (normalized.startsWith("http://") || normalized.startsWith("https://") || "#".equals(normalized)) {
            return "";
        }

        String querySuffix = "";
        int queryIndex = normalized.indexOf('?');
        if (queryIndex >= 0) {
            querySuffix = normalized.substring(queryIndex + 1).trim();
            normalized = normalized.substring(0, queryIndex);
        }
        String path = stripEnglishPrefix(normalized);

        String route = ADMIN_PATH_TO_ROUTE.get(path);
        if (route != null) {
            String localizedPath = english ? localizeAdminPath(ADMIN_ROUTE_TO_PATH.get(route)) : ADMIN_ROUTE_TO_PATH.get(route);
            if (localizedPath.isEmpty()) {
                return "";
            }
            return querySuffix.isEmpty() ? localizedPath : localizedPath + "?" + querySuffix;
        }

        route = resolveHomeRoute(path);
        if (!route.isEmpty()) {
            String localizedPath = english ? localizeHomePath(HOME_ROUTE_TO_PATH.get(route)) : HOME_ROUTE_TO_PATH.get(route);
            if (localizedPath == null || localizedPath.isEmpty()) {
                return "";
            }
            return querySuffix.isEmpty() ? localizedPath : localizedPath + "?" + querySuffix;
        }

        return "";
    }

    public static String toCanonicalMenuUrl(String requestUrl) {
        String normalized = normalize(requestUrl);
        if (normalized.isEmpty()) {
            return "";
        }
        String path = stripEnglishPrefix(normalized);
        if (path.startsWith("/admin/app")) {
            String mapped = ADMIN_ROUTE_TO_PATH.get(extractRoute(path));
            return mapped == null || mapped.isEmpty() ? stripQuery(path) : mapped;
        }
        if (path.startsWith("/app")) {
            String mapped = HOME_ROUTE_TO_PATH.get(extractRoute(path));
            return mapped == null || mapped.isEmpty() ? stripQuery(path) : mapped;
        }
        String querySuffix = extractQuerySuffix(path);
        String basePath = stripQuery(path);

        String adminRoute = ADMIN_PATH_TO_ROUTE.get(basePath);
        if (adminRoute != null && !adminRoute.isEmpty()) {
            String canonical = ADMIN_ROUTE_TO_PATH.get(adminRoute);
            if (canonical != null && !canonical.isEmpty()) {
                return querySuffix.isEmpty() ? canonical : canonical + "?" + querySuffix;
            }
        }

        String homeRoute = HOME_PATH_TO_ROUTE.get(basePath);
        if (homeRoute != null && !homeRoute.isEmpty()) {
            String canonical = HOME_ROUTE_TO_PATH.get(homeRoute);
            if (canonical != null && !canonical.isEmpty()) {
                return querySuffix.isEmpty() ? canonical : canonical + "?" + querySuffix;
            }
        }

        return path;
    }

    public static String resolveRouteIdForPath(String requestUrl) {
        String normalized = normalize(requestUrl);
        if (normalized.isEmpty()) {
            return "";
        }
        String path = stripEnglishPrefix(stripQuery(normalized));
        String adminRoute = ADMIN_PATH_TO_ROUTE.get(path);
        if (adminRoute != null && !adminRoute.isEmpty()) {
            return adminRoute;
        }
        return resolveHomeRoute(path);
    }

    private static String localizeAdminPath(String path) {
        if (path == null || path.isEmpty()) {
            return "";
        }
        if (path.startsWith("/en/")) {
            return path;
        }
        if (path.startsWith("/")) {
            return "/en" + path;
        }
        return "/en/" + path;
    }

    private static String normalizeRouteToken(String route) {
        if (route == null) {
            return "";
        }
        return route.trim().replace('-', '_');
    }

    private static String resolveHomeRoute(String path) {
        if (path == null || path.isEmpty()) {
            return "";
        }
        if ("/mypage".equals(path) || path.startsWith("/mypage/")) {
            return "mypage";
        }
        String route = HOME_PATH_TO_ROUTE.get(path);
        return route == null ? "" : route;
    }

    private static String localizeHomePath(String path) {
        if (path == null || path.isEmpty()) {
            return "";
        }
        if ("/mypage".equals(path) || path.startsWith("/mypage/")) {
            return "/en" + path;
        }
        String localized = HOME_LOCALIZED_PATHS.get(path);
        return localized == null ? path : localized;
    }

    private static String extractRoute(String value) {
        int queryIndex = value.indexOf('?');
        if (queryIndex < 0 || queryIndex == value.length() - 1) {
            return "";
        }
        String query = value.substring(queryIndex + 1);
        for (String pair : query.split("&")) {
            if (pair.startsWith("route=")) {
                return normalizeRouteToken(pair.substring(6));
            }
        }
        return "";
    }

    private static String stripQuery(String value) {
        int queryIndex = value.indexOf('?');
        return queryIndex >= 0 ? value.substring(0, queryIndex) : value;
    }

    private static String extractQuerySuffix(String value) {
        int queryIndex = value.indexOf('?');
        if (queryIndex < 0 || queryIndex == value.length() - 1) {
            return "";
        }
        return value.substring(queryIndex + 1);
    }

    private static String stripEnglishPrefix(String value) {
        return value.startsWith("/en/") ? value.substring(3) : value;
    }

    private static String normalize(String value) {
        if (value == null) {
            return "";
        }
        String normalized = value.trim();
        if (normalized.isEmpty()) {
            return "";
        }
        if (!normalized.startsWith("/") && !normalized.startsWith("http://") && !normalized.startsWith("https://")
                && !"#".equals(normalized)) {
            return "/" + normalized;
        }
        return normalized;
    }

    private static void registerAdmin(Map<String, String> pathToRoute,
                                      Map<String, String> routeToPath,
                                      String route,
                                      String canonicalPath,
                                      String... aliasPaths) {
        String normalizedRoute = normalizeRouteToken(route);
        routeToPath.put(normalizedRoute, canonicalPath);
        for (String aliasPath : aliasPaths) {
            pathToRoute.put(aliasPath, normalizedRoute);
        }
    }

    private static void registerHome(Map<String, String> pathToRoute,
                                     Map<String, String> routeToPath,
                                     Map<String, String> localizedPaths,
                                     String route,
                                     String canonicalPath,
                                     String localizedPath,
                                     String... aliasPaths) {
        String normalizedRoute = normalizeRouteToken(route);
        routeToPath.put(normalizedRoute, canonicalPath);
        localizedPaths.put(canonicalPath, localizedPath);
        for (String aliasPath : aliasPaths) {
            pathToRoute.put(aliasPath, normalizedRoute);
        }
    }
}
