package egovframework.com.common.util;

public final class ReactPageUrlMapper {

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

        String route = resolveAdminRoute(path);
        if (!route.isEmpty()) {
            String localizedPath = english ? localizeAdminPath(resolveAdminPath(route)) : resolveAdminPath(route);
            if (localizedPath.isEmpty()) {
                return "";
            }
            if (querySuffix == null || querySuffix.isEmpty()) {
                return localizedPath;
            }
            return localizedPath + "?" + querySuffix;
        }

        route = resolveHomeRoute(path);
        if (!route.isEmpty()) {
            String localizedPath = english ? localizeHomePath(resolveHomePath(route)) : resolveHomePath(route);
            if (localizedPath.isEmpty()) {
                return "";
            }
            if (querySuffix == null || querySuffix.isEmpty()) {
                return localizedPath;
            }
            return localizedPath + "?" + querySuffix;
        }

        return "";
    }

    public static String toCanonicalMenuUrl(String requestUrl) {
        String normalized = normalize(requestUrl);
        if (normalized.isEmpty()) {
            return "";
        }
        String path = stripEnglishPrefix(normalized);
        if (path.startsWith("/admin/react-migration")) {
            String mapped = resolveAdminPath(extractRoute(path));
            return mapped.isEmpty() ? stripQuery(path) : mapped;
        }
        if (path.startsWith("/react-migration")) {
            String mapped = resolveHomePath(extractRoute(path));
            return mapped.isEmpty() ? stripQuery(path) : mapped;
        }
        return path;
    }

    private static String buildRuntimeUrl(String base, String route, String querySuffix) {
        if (route.isEmpty()) {
            return "";
        }
        if (querySuffix == null || querySuffix.isEmpty()) {
            return base + route;
        }
        return base + route + "&" + querySuffix;
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

    private static String resolveAdminRoute(String path) {
        if ("/admin".equals(path) || "/admin/".equals(path)) {
            return "admin_home";
        }
        if ("/admin/login/loginView".equals(path)) {
            return "admin_login";
        }
        if ("/admin/member/approve".equals(path)) {
            return "member_approve";
        }
        if ("/admin/member/company-approve".equals(path)) {
            return "company_approve";
        }
        if ("/admin/member/edit".equals(path)) {
            return "member_edit";
        }
        if ("/admin/member/detail".equals(path)) {
            return "member_detail";
        }
        if ("/admin/member/reset_password".equals(path)) {
            return "password_reset";
        }
        if ("/admin/member/list".equals(path)) {
            return "member_list";
        }
        if ("/admin/member/admin_list".equals(path) || "/admin/member/admin-list".equals(path)) {
            return "admin_list";
        }
        if ("/admin/member/company_list".equals(path)) {
            return "company_list";
        }
        if ("/admin/member/company_detail".equals(path)) {
            return "company_detail";
        }
        if ("/admin/member/company_account".equals(path)) {
            return "company_account";
        }
        if ("/admin/member/admin_account".equals(path)) {
            return "admin_create";
        }
        if ("/admin/member/admin_account/permissions".equals(path)) {
            return "admin_permission";
        }
        if ("/admin/member/stats".equals(path)) {
            return "member_stats";
        }
        if ("/admin/member/register".equals(path)) {
            return "member_register";
        }
        if ("/admin/auth/group".equals(path) || "/admin/member/auth-group".equals(path) || "/admin/system/role".equals(path)) {
            return "auth_group";
        }
        if ("/admin/member/auth-change".equals(path) || "/admin/system/auth-change".equals(path)) {
            return "auth_change";
        }
        if ("/admin/member/dept-role-mapping".equals(path) || "/admin/system/dept-role-mapping".equals(path)) {
            return "dept_role";
        }
        if ("/admin/emission/result_list".equals(path)) {
            return "emission_result_list";
        }
        if ("/admin/system/code".equals(path)) {
            return "system_code";
        }
        if ("/admin/system/page-management".equals(path)) {
            return "page_management";
        }
        if ("/admin/system/feature-management".equals(path)) {
            return "function_management";
        }
        if ("/admin/system/menu-management".equals(path)) {
            return "menu_management";
        }
        if ("/admin/system/ip_whitelist".equals(path)) {
            return "ip_whitelist";
        }
        if ("/admin/member/login_history".equals(path)) {
            return "login_history";
        }
        if ("/admin/system/security".equals(path)) {
            return "security_history";
        }
        if ("/admin/system/security-policy".equals(path)) {
            return "security_policy";
        }
        if ("/admin/system/security-monitoring".equals(path)) {
            return "security_monitoring";
        }
        if ("/admin/system/blocklist".equals(path)) {
            return "blocklist";
        }
        if ("/admin/system/security-audit".equals(path)) {
            return "security_audit";
        }
        if ("/admin/system/scheduler".equals(path)) {
            return "scheduler_management";
        }
        if ("/admin/system/codex-request".equals(path)) {
            return "codex_request";
        }
        if ("/admin/system/observability".equals(path)) {
            return "observability";
        }
        if ("/admin/system/help-management".equals(path)) {
            return "help_management";
        }
        if ("/admin/system/full-stack-management".equals(path)) {
            return "full_stack_management";
        }
        if ("/admin/system/platform-studio".equals(path)) {
            return "platform_studio";
        }
        if ("/admin/system/screen-elements-management".equals(path)) {
            return "screen_elements_management";
        }
        if ("/admin/system/event-management-console".equals(path)) {
            return "event_management_console";
        }
        if ("/admin/system/function-management-console".equals(path)) {
            return "function_management_console";
        }
        if ("/admin/system/api-management-console".equals(path)) {
            return "api_management_console";
        }
        if ("/admin/system/controller-management-console".equals(path)) {
            return "controller_management_console";
        }
        if ("/admin/system/db-table-management".equals(path)) {
            return "db_table_management";
        }
        if ("/admin/system/column-management-console".equals(path)) {
            return "column_management_console";
        }
        if ("/admin/system/automation-studio".equals(path)) {
            return "automation_studio";
        }
        if ("/admin/system/environment-management".equals(path)) {
            return "environment_management";
        }
        if ("/admin/system/sr-workbench".equals(path)) {
            return "sr_workbench";
        }
        return "";
    }

    private static String resolveAdminPath(String route) {
        String normalizedRoute = normalizeRouteToken(route);
        if ("admin_home".equals(normalizedRoute)) {
            return "/admin/";
        }
        if ("admin_login".equals(normalizedRoute)) {
            return "/admin/login/loginView";
        }
        if ("member_approve".equals(normalizedRoute)) {
            return "/admin/member/approve";
        }
        if ("company_approve".equals(normalizedRoute)) {
            return "/admin/member/company-approve";
        }
        if ("member_edit".equals(normalizedRoute)) {
            return "/admin/member/edit";
        }
        if ("member_detail".equals(normalizedRoute)) {
            return "/admin/member/detail";
        }
        if ("password_reset".equals(normalizedRoute)) {
            return "/admin/member/reset_password";
        }
        if ("member_list".equals(normalizedRoute)) {
            return "/admin/member/list";
        }
        if ("admin_list".equals(normalizedRoute)) {
            return "/admin/member/admin_list";
        }
        if ("company_list".equals(normalizedRoute)) {
            return "/admin/member/company_list";
        }
        if ("company_detail".equals(normalizedRoute)) {
            return "/admin/member/company_detail";
        }
        if ("company_account".equals(normalizedRoute)) {
            return "/admin/member/company_account";
        }
        if ("admin_create".equals(normalizedRoute)) {
            return "/admin/member/admin_account";
        }
        if ("admin_permission".equals(normalizedRoute)) {
            return "/admin/member/admin_account/permissions";
        }
        if ("member_stats".equals(normalizedRoute)) {
            return "/admin/member/stats";
        }
        if ("member_register".equals(normalizedRoute)) {
            return "/admin/member/register";
        }
        if ("auth_group".equals(normalizedRoute)) {
            return "/admin/auth/group";
        }
        if ("auth_change".equals(normalizedRoute)) {
            return "/admin/member/auth-change";
        }
        if ("dept_role".equals(normalizedRoute)) {
            return "/admin/member/dept-role-mapping";
        }
        if ("emission_result_list".equals(normalizedRoute)) {
            return "/admin/emission/result_list";
        }
        if ("system_code".equals(normalizedRoute)) {
            return "/admin/system/code";
        }
        if ("page_management".equals(normalizedRoute)) {
            return "/admin/system/page-management";
        }
        if ("function_management".equals(normalizedRoute)) {
            return "/admin/system/feature-management";
        }
        if ("menu_management".equals(normalizedRoute)) {
            return "/admin/system/menu-management";
        }
        if ("ip_whitelist".equals(normalizedRoute)) {
            return "/admin/system/ip_whitelist";
        }
        if ("login_history".equals(normalizedRoute)) {
            return "/admin/member/login_history";
        }
        if ("security_history".equals(normalizedRoute)) {
            return "/admin/system/security";
        }
        if ("security_policy".equals(normalizedRoute)) {
            return "/admin/system/security-policy";
        }
        if ("security_monitoring".equals(normalizedRoute)) {
            return "/admin/system/security-monitoring";
        }
        if ("blocklist".equals(normalizedRoute)) {
            return "/admin/system/blocklist";
        }
        if ("security_audit".equals(normalizedRoute)) {
            return "/admin/system/security-audit";
        }
        if ("scheduler_management".equals(normalizedRoute)) {
            return "/admin/system/scheduler";
        }
        if ("codex_request".equals(normalizedRoute)) {
            return "/admin/system/codex-request";
        }
        if ("observability".equals(normalizedRoute)) {
            return "/admin/system/observability";
        }
        if ("help_management".equals(normalizedRoute)) {
            return "/admin/system/help-management";
        }
        if ("full_stack_management".equals(normalizedRoute)) {
            return "/admin/system/full-stack-management";
        }
        if ("platform_studio".equals(normalizedRoute)) {
            return "/admin/system/platform-studio";
        }
        if ("screen_elements_management".equals(normalizedRoute)) {
            return "/admin/system/screen-elements-management";
        }
        if ("event_management_console".equals(normalizedRoute)) {
            return "/admin/system/event-management-console";
        }
        if ("function_management_console".equals(normalizedRoute)) {
            return "/admin/system/function-management-console";
        }
        if ("api_management_console".equals(normalizedRoute)) {
            return "/admin/system/api-management-console";
        }
        if ("controller_management_console".equals(normalizedRoute)) {
            return "/admin/system/controller-management-console";
        }
        if ("db_table_management".equals(normalizedRoute)) {
            return "/admin/system/db-table-management";
        }
        if ("column_management_console".equals(normalizedRoute)) {
            return "/admin/system/column-management-console";
        }
        if ("automation_studio".equals(normalizedRoute)) {
            return "/admin/system/automation-studio";
        }
        if ("environment_management".equals(normalizedRoute)) {
            return "/admin/system/environment-management";
        }
        if ("sr_workbench".equals(normalizedRoute)) {
            return "/admin/system/sr-workbench";
        }
        return "";
    }

    private static String resolveHomeRoute(String path) {
        if ("/mypage".equals(path) || path.startsWith("/mypage/")) {
            return "mypage";
        }
        if ("/join/step1".equals(path) || "/join/overseas/step1".equals(path)) {
            return "join_wizard";
        }
        if ("/join/step2".equals(path)) {
            return "join_terms";
        }
        if ("/join/step3".equals(path)) {
            return "join_auth";
        }
        if ("/join/step4".equals(path)) {
            return "join_info";
        }
        if ("/join/companyRegister".equals(path)) {
            return "join_company_register";
        }
        if ("/join/companyRegisterComplete".equals(path)) {
            return "join_company_register_complete";
        }
        if ("/join/companyJoinStatusSearch".equals(path) || "/join/companyJoinStatusDetail".equals(path)) {
            return "join_company_status";
        }
        if ("/join/companyJoinStatusGuide".equals(path)) {
            return "join_company_status_guide";
        }
        if ("/join/companyReapply".equals(path)) {
            return "join_company_reapply";
        }
        return "";
    }

    private static String resolveHomePath(String route) {
        String normalizedRoute = normalizeRouteToken(route);
        if ("mypage".equals(normalizedRoute)) {
            return "/mypage";
        }
        if ("join_wizard".equals(normalizedRoute)) {
            return "/join/step1";
        }
        if ("join_terms".equals(normalizedRoute)) {
            return "/join/step2";
        }
        if ("join_auth".equals(normalizedRoute)) {
            return "/join/step3";
        }
        if ("join_info".equals(normalizedRoute)) {
            return "/join/step4";
        }
        if ("join_company_register".equals(normalizedRoute)) {
            return "/join/companyRegister";
        }
        if ("join_company_register_complete".equals(normalizedRoute)) {
            return "/join/companyRegisterComplete";
        }
        if ("join_company_status".equals(normalizedRoute)) {
            return "/join/companyJoinStatusSearch";
        }
        if ("join_company_status_guide".equals(normalizedRoute)) {
            return "/join/companyJoinStatusGuide";
        }
        if ("join_company_reapply".equals(normalizedRoute)) {
            return "/join/companyReapply";
        }
        return "";
    }

    private static String localizeHomePath(String path) {
        if (path == null || path.isEmpty()) {
            return "";
        }
        if ("/mypage".equals(path) || path.startsWith("/mypage/")) {
            return "/en" + path;
        }
        if ("/join/step1".equals(path)) {
            return "/join/en/step1";
        }
        if ("/join/step2".equals(path)) {
            return "/join/en/step2";
        }
        if ("/join/step3".equals(path)) {
            return "/join/en/step3";
        }
        if ("/join/step4".equals(path)) {
            return "/join/en/step4";
        }
        if ("/join/companyRegister".equals(path)) {
            return "/join/en/companyRegister";
        }
        if ("/join/companyRegisterComplete".equals(path)) {
            return "/join/en/companyRegisterComplete";
        }
        if ("/join/companyJoinStatusSearch".equals(path)) {
            return "/join/en/companyJoinStatusSearch";
        }
        if ("/join/companyJoinStatusGuide".equals(path)) {
            return "/join/en/companyJoinStatusGuide";
        }
        if ("/join/companyReapply".equals(path)) {
            return "/join/en/companyReapply";
        }
        return path;
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
}
