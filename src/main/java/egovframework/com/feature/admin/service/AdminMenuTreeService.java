package egovframework.com.feature.admin.service;

import egovframework.com.common.util.ReactPageUrlMapper;
import egovframework.com.feature.admin.dto.response.AdminMenuDomainDTO;
import egovframework.com.feature.admin.dto.response.AdminMenuGroupDTO;
import egovframework.com.feature.admin.dto.response.AdminMenuLinkDTO;
import egovframework.com.feature.admin.dto.response.MenuInfoDTO;
import egovframework.com.feature.auth.util.JwtTokenProvider;
import egovframework.com.framework.authority.service.FrameworkAuthorityPolicyService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import javax.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminMenuTreeService {

    private static final String MEMBER_REGISTER_MENU_CODE = "A0010102";
    private static final String COMPANY_ACCOUNT_MENU_CODE = "A0010203";
    private static final String LEGACY_ACCESS_BLOCK_HISTORY_MENU_CODE = "A0010502";
    private static final String LEGACY_ACCESS_BLOCK_HISTORY_VIEW = "ADMIN_A0010502_VIEW";
    private static final String LOGIN_HISTORY_VIEW = "ADMIN_A0010501_VIEW";
    private static final String PASSWORD_RESET_HISTORY_VIEW = "ADMIN_A0010503_VIEW";

    private final MenuInfoService menuInfoService;
    private final AuthGroupManageService authGroupManageService;
    private final JwtTokenProvider jwtTokenProvider;
    private final FrameworkAuthorityPolicyService frameworkAuthorityPolicyService;
    private final Object snapshotMonitor = new Object();
    private volatile CachedMenuViewFeatureSnapshot menuViewFeatureSnapshot;
    private volatile CachedAdminMenuTreeResponses cachedAdminMenuTreeResponses;

    public Map<String, AdminMenuDomainDTO> buildAdminMenuTree(boolean isEn, HttpServletRequest request) {
        return buildAdminMenuTree(isEn, resolveAuthorCode(request));
    }

    public Map<String, AdminMenuDomainDTO> buildAdminMenuTree(boolean isEn, String authorCode) {
        long version = menuInfoService.getMenuTreeVersion();
        String normalizedAuthorCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        String cacheKey = (isEn ? "en" : "ko") + ":" + normalizedAuthorCode;
        Map<String, AdminMenuDomainDTO> cachedTree = resolveCachedAdminMenuTree(version, cacheKey);
        if (cachedTree != null) {
            return cachedTree;
        }

        List<MenuInfoDTO> rows;
        try {
            rows = menuInfoService.selectMenuTreeList("AMENU1");
        } catch (Exception e) {
            log.error("Failed to load admin menu detail codes.", e);
            rows = Collections.emptyList();
        }
        AuthorPermissionContext permissionContext = buildAuthorPermissionContext(normalizedAuthorCode);

        Map<String, AdminMenuDomainDTO> domains = new LinkedHashMap<>();
        Map<String, AdminMenuDomainDTO> domainByCode = new LinkedHashMap<>();
        Map<String, AdminMenuGroupDTO> groupByCode = new LinkedHashMap<>();

        for (MenuInfoDTO row : rows) {
            String code = safeString(row.getCode());
            if (code.isEmpty()
                    || !"Y".equalsIgnoreCase(safeString(row.getUseAt()))
                    || !"Y".equalsIgnoreCase(defaultExposure(row.getExpsrAt()))) {
                continue;
            }

            String labelKo = safeString(row.getCodeNm());
            String labelEn = safeString(row.getCodeDc());
            if (labelEn.isEmpty()) {
                labelEn = labelKo;
            }
            String menuIcon = safeString(row.getMenuIcon());

            if (code.length() == 4) {
                String domainKey = labelKo.isEmpty() ? code : labelKo;
                AdminMenuDomainDTO domain = domainByCode.get(code);
                if (domain == null) {
                    domain = new AdminMenuDomainDTO();
                    domain.setSummary("");
                    domainByCode.put(code, domain);
                }
                domain.setLabel(labelKo);
                domain.setLabelEn(labelEn);
                domains.put(domainKey, domain);
                continue;
            }

            if (code.length() == 6) {
                String domainCode = code.substring(0, 4);
                AdminMenuDomainDTO domain = domainByCode.get(domainCode);
                if (domain == null) {
                    domain = new AdminMenuDomainDTO();
                    domain.setLabel(domainCode);
                    domain.setLabelEn(domainCode);
                    domain.setSummary("");
                    domainByCode.put(domainCode, domain);
                    domains.put(domainCode, domain);
                }
                List<AdminMenuGroupDTO> groups = domain.getGroups();
                AdminMenuGroupDTO group = groupByCode.get(code);
                if (group == null) {
                    group = new AdminMenuGroupDTO();
                    groupByCode.put(code, group);
                    groups.add(group);
                }
                group.setTitle(labelKo);
                group.setTitleEn(labelEn);
                if (!menuIcon.isEmpty()) {
                    group.setIcon(menuIcon);
                }
                continue;
            }

            if (code.length() != 8) {
                continue;
            }

            String menuUrl = normalizeMenuUrl(remapKnownMenuUrl(code, row.getMenuUrl()));
            if (!shouldExposeMenu(permissionContext, code, menuUrl)) {
                continue;
            }

            String exposedMenuUrl = mapReactAdminMenuUrl(menuUrl, isEn);
            String groupCode = code.substring(0, 6);
            AdminMenuGroupDTO group = groupByCode.get(groupCode);
            if (group == null) {
                String domainCode = code.substring(0, 4);
                AdminMenuDomainDTO domain = domainByCode.get(domainCode);
                if (domain == null) {
                    domain = new AdminMenuDomainDTO();
                    domain.setLabel(domainCode);
                    domain.setLabelEn(domainCode);
                    domain.setSummary("");
                    domainByCode.put(domainCode, domain);
                    domains.put(domainCode, domain);
                }
                List<AdminMenuGroupDTO> groups = domain.getGroups();
                group = new AdminMenuGroupDTO();
                group.setTitle(groupCode);
                group.setTitleEn(groupCode);
                groupByCode.put(groupCode, group);
                groups.add(group);
            }

            List<AdminMenuLinkDTO> links = group.getLinks();
            AdminMenuLinkDTO link = new AdminMenuLinkDTO();
            link.setCode(code);
            link.setText(labelKo);
            link.setTEn(labelEn);
            link.setU(exposedMenuUrl.isEmpty() ? "#" : exposedMenuUrl);
            if (!menuIcon.isEmpty()) {
                link.setIcon(menuIcon);
            }
            links.add(link);
        }

        for (AdminMenuDomainDTO domain : domainByCode.values()) {
            domain.getGroups().removeIf(group -> group.getLinks() == null || group.getLinks().isEmpty());
        }

        Map<String, AdminMenuDomainDTO> orderedDomains = new LinkedHashMap<>();
        for (Map.Entry<String, AdminMenuDomainDTO> entry : domainByCode.entrySet()) {
            String domainCode = entry.getKey();
            AdminMenuDomainDTO domain = entry.getValue();
            if (domain.getGroups() == null || domain.getGroups().isEmpty()) {
                continue;
            }
            String domainKey = safeString(domain.getLabel()).isEmpty() ? domainCode : safeString(domain.getLabel());
            orderedDomains.put(domainKey, domain);
        }
        cacheAdminMenuTree(version, cacheKey, orderedDomains);
        return cloneMenuTree(orderedDomains);
    }

    private String resolveAuthorCode(HttpServletRequest request) {
        if (request == null) {
            return "";
        }
        try {
            String accessToken = jwtTokenProvider.getCookie(request, "accessToken");
            if (ObjectUtils.isEmpty(accessToken) || jwtTokenProvider.accessValidateToken(accessToken) != 200) {
                return "";
            }
            Claims claims = jwtTokenProvider.accessExtractClaims(accessToken);
            Object encryptedUserId = claims.get("userId");
            if (ObjectUtils.isEmpty(encryptedUserId)) {
                return "";
            }
            String userId = safeString(jwtTokenProvider.decrypt(encryptedUserId.toString()));
            if (userId.isEmpty()) {
                return "";
            }
            return safeString(authGroupManageService.selectAuthorCodeByUserId(userId)).toUpperCase(Locale.ROOT);
        } catch (Exception e) {
            log.warn("Failed to resolve author code for admin menu data.", e);
            return "";
        }
    }

    private boolean shouldExposeMenu(String authorCode, String menuCode, String menuUrl) {
        return shouldExposeMenu(buildAuthorPermissionContext(authorCode), menuCode, menuUrl);
    }

    private boolean shouldExposeMenu(AuthorPermissionContext permissionContext, String menuCode, String menuUrl) {
        String normalizedAuthorCode = permissionContext.authorCode;
        String normalizedMenuCode = safeString(menuCode).toUpperCase(Locale.ROOT);
        String normalizedMenuUrl = normalizeRuntimeMenuUrl(menuUrl);
        if (normalizedMenuUrl.isEmpty() || "#".equals(normalizedMenuUrl)) {
            return false;
        }
        if (permissionContext.systemMaster) {
            return true;
        }
        if (permissionContext.operationAdmin
                && isGlobalOnlyRoute(normalizedMenuCode, normalizedMenuUrl)) {
            return false;
        }
        if (LEGACY_ACCESS_BLOCK_HISTORY_MENU_CODE.equals(normalizedMenuCode)
                && shouldExposeLegacyAccessBlockHistory(permissionContext)) {
            return true;
        }
        List<String> featureCodes = permissionContext.menuViewFeaturesByUrl.get(normalizedMenuUrl);
        if (featureCodes == null || featureCodes.isEmpty()) {
            return !normalizedAuthorCode.isEmpty();
        }
        for (String featureCode : featureCodes) {
            if (permissionContext.authorFeatureCodes.contains(featureCode)) {
                return true;
            }
        }
        return false;
    }

    private String normalizeRuntimeMenuUrl(String value) {
        return ReactPageUrlMapper.toCanonicalMenuUrl(normalizeMenuUrl(value));
    }

    private boolean isGlobalOnlyRoute(String menuCode, String normalizedUri) {
        if (LEGACY_ACCESS_BLOCK_HISTORY_MENU_CODE.equals(menuCode)) {
            return false;
        }
        String value = safeString(normalizedUri);
        return "/admin/member/approve".equals(value)
                || "/admin/member/company-approve".equals(value)
                || "/admin/member/company_list".equals(value)
                || "/admin/member/company_detail".equals(value)
                || "/admin/member/company_account".equals(value)
                || "/admin/member/company-file".equals(value)
                || "/admin/member/admin_list".equals(value)
                || "/admin/member/admin-list".equals(value)
                || "/admin/member/admin_account".equals(value)
                || "/admin/member/admin_account/permissions".equals(value)
                || value.startsWith("/admin/system/");
    }

    private String normalizeMenuUrl(String value) {
        String url = safeString(value);
        if (url.isEmpty()) {
            return "";
        }
        if ("/admin/member/admin-list".equals(url)) {
            return "/admin/member/admin_list";
        }
        if ("/en/admin/member/admin-list".equals(url)) {
            return "/en/admin/member/admin_list";
        }
        if (!url.startsWith("/")) {
            return "/" + url;
        }
        return url;
    }

    private String remapKnownMenuUrl(String menuCode, String menuUrl) {
        String normalizedCode = safeString(menuCode).toUpperCase(Locale.ROOT);
        if (MEMBER_REGISTER_MENU_CODE.equals(normalizedCode)) {
            return "/admin/member/register";
        }
        if (COMPANY_ACCOUNT_MENU_CODE.equals(normalizedCode)) {
            return "/admin/member/company_account";
        }
        return menuUrl;
    }

    private String mapReactAdminMenuUrl(String value, boolean isEn) {
        String url = normalizeMenuUrl(value);
        if (url.isEmpty() || "#".equals(url)) {
            return url;
        }

        String runtimeUrl = ReactPageUrlMapper.toRuntimeUrl(url, isEn);
        if (!runtimeUrl.isEmpty()) {
            return runtimeUrl;
        }

        if ("/admin/member/withdrawn".equals(url)) {
            url = "/admin/member/list?sbscrbSttus=D";
        } else if ("/admin/member/activate".equals(url)) {
            url = "/admin/member/list?sbscrbSttus=X";
        }
        if (isEn && !url.startsWith("/en/") && url.startsWith("/")) {
            return "/en" + url;
        }
        return url;
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }

    private String defaultExposure(String value) {
        return "N".equalsIgnoreCase(safeString(value)) ? "N" : "Y";
    }

    private boolean shouldExposeLegacyAccessBlockHistory(AuthorPermissionContext permissionContext) {
        if (permissionContext == null || permissionContext.authorCode.isEmpty()) {
            return false;
        }
        return permissionContext.authorFeatureCodes.contains(LEGACY_ACCESS_BLOCK_HISTORY_VIEW)
                || permissionContext.authorFeatureCodes.contains(LOGIN_HISTORY_VIEW)
                || permissionContext.authorFeatureCodes.contains(PASSWORD_RESET_HISTORY_VIEW);
    }

    private Map<String, AdminMenuDomainDTO> resolveCachedAdminMenuTree(long version, String cacheKey) {
        CachedAdminMenuTreeResponses cached = cachedAdminMenuTreeResponses;
        if (cached == null || cached.version != version) {
            return null;
        }
        Map<String, AdminMenuDomainDTO> tree = cached.responsesByKey.get(cacheKey);
        return tree == null ? null : cloneMenuTree(tree);
    }

    private void cacheAdminMenuTree(long version, String cacheKey, Map<String, AdminMenuDomainDTO> tree) {
        synchronized (snapshotMonitor) {
            CachedAdminMenuTreeResponses cached = cachedAdminMenuTreeResponses;
            Map<String, Map<String, AdminMenuDomainDTO>> nextResponsesByKey;
            if (cached == null || cached.version != version) {
                nextResponsesByKey = new LinkedHashMap<>();
            } else {
                nextResponsesByKey = new LinkedHashMap<>(cached.responsesByKey);
            }
            nextResponsesByKey.put(cacheKey, cloneMenuTree(tree));
            cachedAdminMenuTreeResponses = new CachedAdminMenuTreeResponses(version, Collections.unmodifiableMap(nextResponsesByKey));
        }
    }

    private Map<String, AdminMenuDomainDTO> cloneMenuTree(Map<String, AdminMenuDomainDTO> source) {
        Map<String, AdminMenuDomainDTO> cloned = new LinkedHashMap<>();
        for (Map.Entry<String, AdminMenuDomainDTO> entry : source.entrySet()) {
            AdminMenuDomainDTO sourceDomain = entry.getValue();
            AdminMenuDomainDTO domain = new AdminMenuDomainDTO();
            domain.setLabel(sourceDomain.getLabel());
            domain.setLabelEn(sourceDomain.getLabelEn());
            domain.setSummary(sourceDomain.getSummary());

            List<AdminMenuGroupDTO> groups = domain.getGroups();
            for (AdminMenuGroupDTO sourceGroup : sourceDomain.getGroups()) {
                AdminMenuGroupDTO group = new AdminMenuGroupDTO();
                group.setTitle(sourceGroup.getTitle());
                group.setTitleEn(sourceGroup.getTitleEn());
                group.setIcon(sourceGroup.getIcon());

                List<AdminMenuLinkDTO> links = group.getLinks();
                for (AdminMenuLinkDTO sourceLink : sourceGroup.getLinks()) {
                    AdminMenuLinkDTO link = new AdminMenuLinkDTO();
                    link.setCode(sourceLink.getCode());
                    link.setText(sourceLink.getText());
                    link.setTEn(sourceLink.getTEn());
                    link.setU(sourceLink.getU());
                    link.setIcon(sourceLink.getIcon());
                    links.add(link);
                }
                groups.add(group);
            }
            cloned.put(entry.getKey(), domain);
        }
        return cloned;
    }

    private AuthorPermissionContext buildAuthorPermissionContext(String authorCode) {
        FrameworkAuthorityPolicyService.AuthorityPolicyContext policyContext;
        try {
            policyContext = frameworkAuthorityPolicyService.buildContext(authorCode);
        } catch (Exception e) {
            log.warn("Failed to load authority policy context for admin menu tree. authorCode={}", safeString(authorCode), e);
            return new AuthorPermissionContext("", Collections.emptySet(), Collections.emptyMap(), false, false);
        }
        if (policyContext.getAuthorCode().isEmpty()) {
            return new AuthorPermissionContext("", Collections.emptySet(), Collections.emptyMap(), false, false);
        }
        return new AuthorPermissionContext(
                policyContext.getAuthorCode(),
                policyContext.getFeatureCodes(),
                resolveMenuViewFeaturesByUrl(),
                policyContext.isSystemMaster(),
                policyContext.isOperationAdmin());
    }

    private Map<String, List<String>> resolveMenuViewFeaturesByUrl() {
        long version = menuInfoService.getMenuTreeVersion();
        CachedMenuViewFeatureSnapshot cached = menuViewFeatureSnapshot;
        if (cached != null && cached.version == version) {
            return cached.viewFeaturesByUrl;
        }
        synchronized (snapshotMonitor) {
            cached = menuViewFeatureSnapshot;
            if (cached != null && cached.version == version) {
                return cached.viewFeaturesByUrl;
            }
            Map<String, List<String>> nextSnapshot = loadMenuViewFeaturesByUrl();
            menuViewFeatureSnapshot = new CachedMenuViewFeatureSnapshot(version, nextSnapshot);
            return nextSnapshot;
        }
    }

    private Map<String, List<String>> loadMenuViewFeaturesByUrl() {
        Map<String, Set<String>> featuresByUrl = new LinkedHashMap<>();
        try {
            for (MenuInfoDTO menu : menuInfoService.selectMenuTreeList("AMENU1")) {
                String menuUrl = normalizeRuntimeMenuUrl(remapKnownMenuUrl(menu.getCode(), menu.getMenuUrl()));
                if (menuUrl.isEmpty()) {
                    continue;
                }
                List<String> featureCodes = authGroupManageService.selectRequiredViewFeatureCodesByMenuUrl(menuUrl);
                if (featureCodes == null || featureCodes.isEmpty()) {
                    continue;
                }
                Set<String> bucket = featuresByUrl.computeIfAbsent(menuUrl, ignored -> new LinkedHashSet<>());
                for (String featureCode : featureCodes) {
                    String normalizedFeatureCode = safeString(featureCode).toUpperCase(Locale.ROOT);
                    if (!normalizedFeatureCode.isEmpty()) {
                        bucket.add(normalizedFeatureCode);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to load admin menu view feature snapshot.", e);
            return Collections.emptyMap();
        }

        Map<String, List<String>> snapshot = new LinkedHashMap<>();
        for (Map.Entry<String, Set<String>> entry : featuresByUrl.entrySet()) {
            snapshot.put(entry.getKey(), List.copyOf(entry.getValue()));
        }
        return Collections.unmodifiableMap(snapshot);
    }

    private static final class CachedMenuViewFeatureSnapshot {
        private final long version;
        private final Map<String, List<String>> viewFeaturesByUrl;

        private CachedMenuViewFeatureSnapshot(long version, Map<String, List<String>> viewFeaturesByUrl) {
            this.version = version;
            this.viewFeaturesByUrl = viewFeaturesByUrl;
        }
    }

    private static final class CachedAdminMenuTreeResponses {
        private final long version;
        private final Map<String, Map<String, AdminMenuDomainDTO>> responsesByKey;

        private CachedAdminMenuTreeResponses(long version, Map<String, Map<String, AdminMenuDomainDTO>> responsesByKey) {
            this.version = version;
            this.responsesByKey = responsesByKey;
        }
    }

    private static final class AuthorPermissionContext {
        private final String authorCode;
        private final Set<String> authorFeatureCodes;
        private final Map<String, List<String>> menuViewFeaturesByUrl;
        private final boolean systemMaster;
        private final boolean operationAdmin;

        private AuthorPermissionContext(String authorCode,
                                        Set<String> authorFeatureCodes,
                                        Map<String, List<String>> menuViewFeaturesByUrl,
                                        boolean systemMaster,
                                        boolean operationAdmin) {
            this.authorCode = authorCode;
            this.authorFeatureCodes = authorFeatureCodes;
            this.menuViewFeaturesByUrl = menuViewFeaturesByUrl;
            this.systemMaster = systemMaster;
            this.operationAdmin = operationAdmin;
        }
    }
}
