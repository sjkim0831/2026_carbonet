package egovframework.com.feature.admin.web;

import egovframework.com.common.util.ReactPageUrlMapper;
import egovframework.com.feature.admin.dto.response.MenuInfoDTO;
import egovframework.com.feature.admin.dto.response.AdminMenuDomainDTO;
import egovframework.com.feature.admin.dto.response.AdminMenuGroupDTO;
import egovframework.com.feature.admin.dto.response.AdminMenuLinkDTO;
import egovframework.com.feature.admin.service.AuthGroupManageService;
import egovframework.com.feature.admin.service.MenuInfoService;
import egovframework.com.feature.auth.util.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.Comparator;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.List;

@Controller
@RequestMapping({"/admin/system", "/en/admin/system"})
@RequiredArgsConstructor
public class AdminMenuController {

    private static final Logger log = LoggerFactory.getLogger(AdminMenuController.class);
    private static final String ROLE_SYSTEM_MASTER = "ROLE_SYSTEM_MASTER";
    private static final String ROLE_SYSTEM_ADMIN = "ROLE_SYSTEM_ADMIN";
    private static final String ROLE_ADMIN = "ROLE_ADMIN";
    private static final String ROLE_OPERATION_ADMIN = "ROLE_OPERATION_ADMIN";

    private final MenuInfoService menuInfoService;
    private final AuthGroupManageService authGroupManageService;
    private final JwtTokenProvider jwtTokenProvider;

    @RequestMapping(value = "/menu-data", method = RequestMethod.GET)
    @ResponseBody
    public Map<String, AdminMenuDomainDTO> adminMenuData(HttpServletRequest request, Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        return buildAdminMenuTree(isEn, resolveAuthorCode(request));
    }

    private Map<String, AdminMenuDomainDTO> buildAdminMenuTree(boolean isEn, String authorCode) {
        List<MenuInfoDTO> rows;
        try {
            rows = menuInfoService.selectMenuTreeList("AMENU1");
        } catch (Exception e) {
            log.error("Failed to load admin menu detail codes.", e);
            rows = Collections.emptyList();
        }
        Map<String, AdminMenuDomainDTO> domains = new LinkedHashMap<>();
        Map<String, AdminMenuDomainDTO> domainByCode = new LinkedHashMap<>();
        Map<String, AdminMenuGroupDTO> groupByCode = new LinkedHashMap<>();
        Map<String, Integer> sortOrderMap = new LinkedHashMap<>();

        for (MenuInfoDTO row : rows) {
            String code = safeString(row.getCode());
            if (code.isEmpty()) {
                continue;
            }
            if (!"Y".equalsIgnoreCase(safeString(row.getUseAt()))) {
                continue;
            }
            sortOrderMap.put(code, row.getSortOrdr());
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
            } else if (code.length() == 6) {
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
            } else if (code.length() == 8) {
                String menuUrl = normalizeMenuUrl(row.getMenuUrl());
                if (!shouldExposeMenu(authorCode, menuUrl)) {
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
                link.setText(labelKo);
                link.setTEn(labelEn);
                link.setU(exposedMenuUrl.isEmpty() ? "#" : exposedMenuUrl);
                if (!menuIcon.isEmpty()) {
                    link.setIcon(menuIcon);
                }
                links.add(link);
            }
        }
        final List<MenuInfoDTO> menuRows = rows;
        Comparator<AdminMenuGroupDTO> groupComparator = Comparator
                .comparingInt((AdminMenuGroupDTO group) -> effectiveSort(resolveCodeByTitle(groupByCode, group), sortOrderMap))
                .thenComparing(group -> safeString(group.getTitle()));
        Comparator<AdminMenuLinkDTO> linkComparator = Comparator
                .comparingInt((AdminMenuLinkDTO link) -> effectiveSort(resolveCodeByUrl(menuRows, link.getU()), sortOrderMap))
                .thenComparing(link -> safeString(link.getText()));

        List<Map.Entry<String, AdminMenuDomainDTO>> orderedDomainEntries = new java.util.ArrayList<>(domainByCode.entrySet());
        orderedDomainEntries.sort(Comparator
                .comparingInt((Map.Entry<String, AdminMenuDomainDTO> entry) -> effectiveSort(entry.getKey(), sortOrderMap))
                .thenComparing(Map.Entry::getKey));

        for (Map.Entry<String, AdminMenuDomainDTO> entry : orderedDomainEntries) {
            AdminMenuDomainDTO domain = entry.getValue();
            domain.getGroups().sort(groupComparator);
            for (AdminMenuGroupDTO group : domain.getGroups()) {
                group.getLinks().sort(linkComparator);
            }
        }
        Map<String, AdminMenuDomainDTO> orderedDomains = new LinkedHashMap<>();
        for (Map.Entry<String, AdminMenuDomainDTO> entry : orderedDomainEntries) {
            String domainCode = entry.getKey();
            AdminMenuDomainDTO domain = entry.getValue();
            String domainKey = safeString(domain.getLabel()).isEmpty() ? domainCode : safeString(domain.getLabel());
            orderedDomains.put(domainKey, domain);
        }
        return orderedDomains;
    }

    private String resolveAuthorCode(HttpServletRequest request) {
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

    private boolean shouldExposeMenu(String authorCode, String menuUrl) {
        String normalizedAuthorCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        String normalizedMenuUrl = normalizeRuntimeMenuUrl(menuUrl);
        if (normalizedMenuUrl.isEmpty() || "#".equals(normalizedMenuUrl)) {
            return false;
        }
        if (ROLE_SYSTEM_MASTER.equals(normalizedAuthorCode)) {
            return true;
        }
        if (ROLE_OPERATION_ADMIN.equals(normalizedAuthorCode) && isGlobalOnlyRoute(normalizedMenuUrl)) {
            return false;
        }
        try {
            String featureCode = safeString(authGroupManageService.selectRequiredViewFeatureCodeByMenuUrl(normalizedMenuUrl))
                    .toUpperCase(Locale.ROOT);
            if (featureCode.isEmpty()) {
                return !normalizedAuthorCode.isEmpty();
            }
            return authGroupManageService.hasAuthorFeaturePermission(normalizedAuthorCode, featureCode);
        } catch (Exception e) {
            log.warn("Failed to evaluate admin menu permission. authorCode={}, menuUrl={}",
                    normalizedAuthorCode, normalizedMenuUrl, e);
            return false;
        }
    }

    private String normalizeRuntimeMenuUrl(String value) {
        return ReactPageUrlMapper.toCanonicalMenuUrl(normalizeMenuUrl(value));
    }

    private boolean isGlobalOnlyRoute(String normalizedUri) {
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

    private boolean isEnglishRequest(HttpServletRequest request, Locale locale) {
        if (request != null) {
            String path = request.getRequestURI();
            if (path != null && path.startsWith("/en/")) {
                return true;
            }
            String param = request.getParameter("language");
            if ("en".equalsIgnoreCase(param)) {
                return true;
            }
        }
        return locale != null && locale.getLanguage().toLowerCase(Locale.ROOT).startsWith("en");
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

    private String mapReactAdminMenuUrl(String value, boolean isEn) {
        String url = normalizeMenuUrl(value);
        if (url.isEmpty() || "#".equals(url)) {
            return url;
        }
        String canonical = ReactPageUrlMapper.toCanonicalMenuUrl(url);
        if (!canonical.isEmpty()) {
            url = canonical;
        }
        if (isEn && !url.startsWith("/en/")) {
            return "/en" + url;
        }
        return url;
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }

    private int normalizeSort(Integer sortOrdr) {
        return sortOrdr == null ? Integer.MAX_VALUE : sortOrdr;
    }

    private int effectiveSort(String code, Map<String, Integer> sortOrderMap) {
        Integer saved = sortOrderMap.get(code);
        if (saved != null) {
            return saved;
        }
        return fallbackCodeSort(code);
    }

    private int fallbackCodeSort(String code) {
        String normalized = safeString(code);
        if (normalized.length() == 4) {
            return parseSort(normalized.substring(1));
        }
        if (normalized.length() >= 6) {
            return parseSort(normalized.substring(normalized.length() - 2));
        }
        return Integer.MAX_VALUE;
    }

    private int parseSort(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return Integer.MAX_VALUE;
        }
    }

    private String resolveCodeByTitle(Map<String, AdminMenuGroupDTO> groupByCode, AdminMenuGroupDTO target) {
        for (Map.Entry<String, AdminMenuGroupDTO> entry : groupByCode.entrySet()) {
            if (entry.getValue() == target) {
                return entry.getKey();
            }
        }
        return "";
    }

    private String resolveCodeByUrl(List<MenuInfoDTO> rows, String menuUrl) {
        String normalizedUrl = ReactPageUrlMapper.toCanonicalMenuUrl(normalizeMenuUrl(menuUrl));
        for (MenuInfoDTO row : rows) {
            String rowUrl = ReactPageUrlMapper.toCanonicalMenuUrl(normalizeMenuUrl(row.getMenuUrl()));
            if (rowUrl.equals(normalizedUrl)) {
                return safeString(row.getCode());
            }
        }
        return "";
    }
}
