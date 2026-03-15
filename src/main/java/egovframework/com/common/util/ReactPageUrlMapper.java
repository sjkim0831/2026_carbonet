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

    private static String resolveAdminRoute(String path) {
        if ("/admin/member/approve".equals(path)) {
            return "member-approve";
        }
        if ("/admin/member/company-approve".equals(path)) {
            return "company-approve";
        }
        if ("/admin/member/edit".equals(path)) {
            return "member-edit";
        }
        if ("/admin/member/detail".equals(path)) {
            return "member-detail";
        }
        if ("/admin/member/reset_password".equals(path)) {
            return "password-reset";
        }
        if ("/admin/member/list".equals(path)) {
            return "member-list";
        }
        if ("/admin/member/admin_list".equals(path) || "/admin/member/admin-list".equals(path)) {
            return "admin-list";
        }
        if ("/admin/member/company_list".equals(path)) {
            return "company-list";
        }
        if ("/admin/member/company_detail".equals(path)) {
            return "company-detail";
        }
        if ("/admin/member/company_account".equals(path)) {
            return "company-account";
        }
        if ("/admin/member/admin_account".equals(path)) {
            return "admin-create";
        }
        if ("/admin/member/admin_account/permissions".equals(path)) {
            return "admin-permission";
        }
        if ("/admin/auth/group".equals(path) || "/admin/member/auth-group".equals(path) || "/admin/system/role".equals(path)) {
            return "auth-group";
        }
        if ("/admin/member/auth-change".equals(path) || "/admin/system/auth-change".equals(path)) {
            return "auth-change";
        }
        if ("/admin/member/dept-role-mapping".equals(path) || "/admin/system/dept-role-mapping".equals(path)) {
            return "dept-role";
        }
        if ("/admin/system/observability".equals(path)) {
            return "observability";
        }
        if ("/admin/system/help-management".equals(path)) {
            return "help-management";
        }
        if ("/admin/system/full-stack-management".equals(path)) {
            return "full-stack-management";
        }
        if ("/admin/system/platform-studio".equals(path)) {
            return "platform-studio";
        }
        if ("/admin/system/screen-elements-management".equals(path)) {
            return "screen-elements-management";
        }
        if ("/admin/system/event-management-console".equals(path)) {
            return "event-management-console";
        }
        if ("/admin/system/function-management-console".equals(path)) {
            return "function-management-console";
        }
        if ("/admin/system/api-management-console".equals(path)) {
            return "api-management-console";
        }
        if ("/admin/system/controller-management-console".equals(path)) {
            return "controller-management-console";
        }
        if ("/admin/system/db-table-management".equals(path)) {
            return "db-table-management";
        }
        if ("/admin/system/column-management-console".equals(path)) {
            return "column-management-console";
        }
        if ("/admin/system/automation-studio".equals(path)) {
            return "automation-studio";
        }
        if ("/admin/system/sr-workbench".equals(path)) {
            return "sr-workbench";
        }
        return "";
    }

    private static String resolveAdminPath(String route) {
        if ("member-approve".equals(route)) {
            return "/admin/member/approve";
        }
        if ("company-approve".equals(route)) {
            return "/admin/member/company-approve";
        }
        if ("member-edit".equals(route)) {
            return "/admin/member/edit";
        }
        if ("member-detail".equals(route)) {
            return "/admin/member/detail";
        }
        if ("password-reset".equals(route)) {
            return "/admin/member/reset_password";
        }
        if ("member-list".equals(route)) {
            return "/admin/member/list";
        }
        if ("admin-list".equals(route)) {
            return "/admin/member/admin_list";
        }
        if ("company-list".equals(route)) {
            return "/admin/member/company_list";
        }
        if ("company-detail".equals(route)) {
            return "/admin/member/company_detail";
        }
        if ("company-account".equals(route)) {
            return "/admin/member/company_account";
        }
        if ("admin-create".equals(route)) {
            return "/admin/member/admin_account";
        }
        if ("admin-permission".equals(route)) {
            return "/admin/member/admin_account/permissions";
        }
        if ("auth-group".equals(route)) {
            return "/admin/auth/group";
        }
        if ("auth-change".equals(route)) {
            return "/admin/member/auth-change";
        }
        if ("dept-role".equals(route)) {
            return "/admin/member/dept-role-mapping";
        }
        if ("observability".equals(route)) {
            return "/admin/system/observability";
        }
        if ("help-management".equals(route)) {
            return "/admin/system/help-management";
        }
        if ("full-stack-management".equals(route)) {
            return "/admin/system/full-stack-management";
        }
        if ("platform-studio".equals(route)) {
            return "/admin/system/platform-studio";
        }
        if ("screen-elements-management".equals(route)) {
            return "/admin/system/screen-elements-management";
        }
        if ("event-management-console".equals(route)) {
            return "/admin/system/event-management-console";
        }
        if ("function-management-console".equals(route)) {
            return "/admin/system/function-management-console";
        }
        if ("api-management-console".equals(route)) {
            return "/admin/system/api-management-console";
        }
        if ("controller-management-console".equals(route)) {
            return "/admin/system/controller-management-console";
        }
        if ("db-table-management".equals(route)) {
            return "/admin/system/db-table-management";
        }
        if ("column-management-console".equals(route)) {
            return "/admin/system/column-management-console";
        }
        if ("automation-studio".equals(route)) {
            return "/admin/system/automation-studio";
        }
        if ("sr-workbench".equals(route)) {
            return "/admin/system/sr-workbench";
        }
        return "";
    }

    private static String resolveHomeRoute(String path) {
        if ("/mypage".equals(path) || path.startsWith("/mypage/")) {
            return "mypage";
        }
        if ("/join/step1".equals(path) || "/join/overseas/step1".equals(path)) {
            return "join-wizard";
        }
        if ("/join/step2".equals(path)) {
            return "join-terms";
        }
        if ("/join/step3".equals(path)) {
            return "join-auth";
        }
        if ("/join/step4".equals(path)) {
            return "join-info";
        }
        if ("/join/companyRegister".equals(path)) {
            return "join-company-register";
        }
        if ("/join/companyRegisterComplete".equals(path)) {
            return "join-company-register-complete";
        }
        if ("/join/companyJoinStatusSearch".equals(path) || "/join/companyJoinStatusDetail".equals(path)) {
            return "join-company-status";
        }
        if ("/join/companyJoinStatusGuide".equals(path)) {
            return "join-company-status-guide";
        }
        if ("/join/companyReapply".equals(path)) {
            return "join-company-reapply";
        }
        return "";
    }

    private static String resolveHomePath(String route) {
        if ("mypage".equals(route)) {
            return "/mypage";
        }
        if ("join-wizard".equals(route)) {
            return "/join/step1";
        }
        if ("join-terms".equals(route)) {
            return "/join/step2";
        }
        if ("join-auth".equals(route)) {
            return "/join/step3";
        }
        if ("join-info".equals(route)) {
            return "/join/step4";
        }
        if ("join-company-register".equals(route)) {
            return "/join/companyRegister";
        }
        if ("join-company-register-complete".equals(route)) {
            return "/join/companyRegisterComplete";
        }
        if ("join-company-status".equals(route)) {
            return "/join/companyJoinStatusSearch";
        }
        if ("join-company-status-guide".equals(route)) {
            return "/join/companyJoinStatusGuide";
        }
        if ("join-company-reapply".equals(route)) {
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
                return pair.substring(6).trim();
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
