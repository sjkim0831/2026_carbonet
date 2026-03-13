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
            return buildRuntimeUrl(english ? "/en/admin/react-migration?route=" : "/admin/react-migration?route=", route,
                    querySuffix);
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
        if ("/join/companyJoinStatusSearch".equals(path) || "/join/companyJoinStatusDetail".equals(path)) {
            return "join-company-status";
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
        if ("join-company-status".equals(route)) {
            return "/join/companyJoinStatusSearch";
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
        if ("/join/companyJoinStatusSearch".equals(path)) {
            return "/join/en/companyJoinStatusSearch";
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
