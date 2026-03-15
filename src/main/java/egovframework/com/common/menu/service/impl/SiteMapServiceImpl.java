package egovframework.com.common.menu.service.impl;

import egovframework.com.common.menu.model.SiteMapNode;
import egovframework.com.common.menu.service.SiteMapService;
import egovframework.com.common.util.ReactPageUrlMapper;
import egovframework.com.feature.admin.dto.response.MenuInfoDTO;
import egovframework.com.feature.admin.service.AuthGroupManageService;
import egovframework.com.feature.admin.service.MenuInfoService;
import egovframework.com.feature.auth.util.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SiteMapServiceImpl implements SiteMapService {

    private static final String ROLE_SYSTEM_MASTER = "ROLE_SYSTEM_MASTER";
    private static final String ROLE_OPERATION_ADMIN = "ROLE_OPERATION_ADMIN";
    private static final int PUBLIC_ENTRY_SORT = 5;
    private static final int PUBLIC_SIGNIN_SORT = 10;
    private static final int PUBLIC_JOIN_SORT = 20;
    private static final int PUBLIC_COMPANY_SORT = 30;
    private static final int PUBLIC_MYPAGE_SORT = 40;

    private final MenuInfoService menuInfoService;
    private final AuthGroupManageService authGroupManageService;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public List<SiteMapNode> getUserSiteMap(boolean isEn) {
        return appendUserPublicFlows(buildSiteMap("HMENU1", isEn, false, ""));
    }

    @Override
    public List<SiteMapNode> getAdminSiteMap(boolean isEn, HttpServletRequest request) {
        return buildSiteMap("AMENU1", isEn, true, resolveAuthorCode(request));
    }

    private List<SiteMapNode> buildSiteMap(String codeId, boolean isEn, boolean admin, String authorCode) {
        List<MenuInfoDTO> rows = loadMenuTreeRows(codeId);
        if (rows.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, Integer> sortOrderMap = new LinkedHashMap<>();
        Map<String, SiteMapNode> topMap = new LinkedHashMap<>();
        Map<String, SiteMapNode> midMap = new LinkedHashMap<>();

        for (MenuInfoDTO row : rows) {
            String code = safeString(row.getCode()).toUpperCase(Locale.ROOT);
            if (code.isEmpty() || !"Y".equalsIgnoreCase(safeString(row.getUseAt()))) {
                continue;
            }
            sortOrderMap.put(code, row.getSortOrdr());
            String label = resolveLabel(row, isEn);
            String rawUrl = normalizeMenuUrl(row.getMenuUrl());
            String url = mapMenuUrl(rawUrl, isEn);
            String icon = safeString(row.getMenuIcon());

            if (code.length() == 4) {
                SiteMapNode top = topMap.computeIfAbsent(code, key -> createNode(key, label, url, icon));
                top.setLabel(label);
                top.setUrl(url);
                if (!icon.isEmpty()) {
                    top.setIcon(icon);
                }
            } else if (code.length() == 6) {
                String parentCode = code.substring(0, 4);
                SiteMapNode top = topMap.computeIfAbsent(parentCode, key -> createNode(key, parentCode, "#", ""));
                SiteMapNode mid = createNode(code, label, url, icon);
                top.getChildren().add(mid);
                midMap.put(code, mid);
            } else if (code.length() == 8) {
                if (admin && !shouldExposeAdminMenu(authorCode, rawUrl)) {
                    continue;
                }
                String parentCode = code.substring(0, 6);
                SiteMapNode mid = midMap.get(parentCode);
                if (mid == null) {
                    String topCode = code.substring(0, 4);
                    SiteMapNode top = topMap.computeIfAbsent(topCode, key -> createNode(key, topCode, "#", ""));
                    mid = createNode(parentCode, parentCode, "#", "");
                    top.getChildren().add(mid);
                    midMap.put(parentCode, mid);
                }
                mid.getChildren().add(createNode(code, label, url, icon));
            }
        }

        List<SiteMapNode> topNodes = new ArrayList<>(topMap.values());
        sortNodes(topNodes, sortOrderMap);
        return pruneEmptyNodes(topNodes);
    }

    private List<SiteMapNode> pruneEmptyNodes(List<SiteMapNode> topNodes) {
        List<SiteMapNode> result = new ArrayList<>();
        for (SiteMapNode top : topNodes) {
            List<SiteMapNode> sections = new ArrayList<>();
            for (SiteMapNode section : top.getChildren()) {
                if (!section.getChildren().isEmpty()) {
                    sections.add(section);
                }
            }
            top.setChildren(sections);
            if (!top.getChildren().isEmpty()) {
                result.add(top);
            }
        }
        return result;
    }

    private List<SiteMapNode> appendUserPublicFlows(List<SiteMapNode> topNodes) {
        List<SiteMapNode> result = new ArrayList<>();
        result.add(buildUserPublicFlowNode(false));
        result.addAll(topNodes);
        return result;
    }

    private SiteMapNode buildUserPublicFlowNode(boolean unused) {
        SiteMapNode top = createNode("H000", unused ? "Start" : "시작하기", "#", "travel_explore");

        SiteMapNode signin = createNode("H00010", unused ? "Sign In" : "로그인·계정찾기", "#", "login");
        signin.getChildren().add(createNode("H0001001", unused ? "Login" : "로그인", mapMenuUrl("/signin/loginView", unused), ""));
        signin.getChildren().add(createNode("H0001002", unused ? "Choose Authentication" : "인증방식 선택", mapMenuUrl("/signin/authChoice", unused), ""));
        signin.getChildren().add(createNode("H0001003", unused ? "Find ID" : "아이디 찾기", mapMenuUrl("/signin/findId", unused), ""));
        signin.getChildren().add(createNode("H0001004", unused ? "Find ID Result" : "아이디 찾기 결과", mapMenuUrl("/signin/findId/result", unused), ""));
        signin.getChildren().add(createNode("H0001005", unused ? "Reset Password" : "비밀번호 찾기", mapMenuUrl("/signin/findPassword", unused), ""));
        signin.getChildren().add(createNode("H0001006", unused ? "Reset Password Result" : "비밀번호 찾기 결과", mapMenuUrl("/signin/findPassword/result", unused), ""));

        SiteMapNode join = createNode("H00020", unused ? "Join" : "회원가입", "#", "how_to_reg");
        join.getChildren().add(createNode("H0002001", unused ? "Step 1. Member Type" : "1단계. 회원유형 선택", mapMenuUrl("/join/step1", unused), ""));
        join.getChildren().add(createNode("H0002002", unused ? "Step 2. Terms Agreement" : "2단계. 약관 동의", mapMenuUrl("/join/step2", unused), ""));
        join.getChildren().add(createNode("H0002003", unused ? "Step 3. Identity Verification" : "3단계. 본인인증", mapMenuUrl("/join/step3", unused), ""));
        join.getChildren().add(createNode("H0002004", unused ? "Step 4. Member Information" : "4단계. 회원정보 입력", mapMenuUrl("/join/step4", unused), ""));
        join.getChildren().add(createNode("H0002005", unused ? "Step 5. Complete" : "5단계. 가입 완료", mapMenuUrl("/join/step5", unused), ""));

        SiteMapNode company = createNode("H00030", unused ? "Company Membership" : "회원사 가입", "#", "domain_add");
        company.getChildren().add(createNode("H0003001", unused ? "Company Registration" : "회원사 가입 신청", mapMenuUrl("/join/companyRegister", unused), ""));
        company.getChildren().add(createNode("H0003002", unused ? "Registration Complete" : "회원사 가입 신청 완료", mapMenuUrl("/join/companyRegisterComplete", unused), ""));
        company.getChildren().add(createNode("H0003003", unused ? "Status Search" : "가입현황 조회", mapMenuUrl("/join/companyJoinStatusSearch", unused), ""));
        company.getChildren().add(createNode("H0003004", unused ? "Status Guide" : "가입현황 안내", mapMenuUrl("/join/companyJoinStatusGuide", unused), ""));
        company.getChildren().add(createNode("H0003005", unused ? "Status Detail" : "가입현황 상세", mapMenuUrl("/join/companyJoinStatusDetail", unused), ""));
        company.getChildren().add(createNode("H0003006", unused ? "Reapply" : "재신청", mapMenuUrl("/join/companyReapply", unused), ""));

        SiteMapNode mypage = createNode("H00040", unused ? "My Page" : "마이페이지", "#", "person");
        mypage.getChildren().add(createNode("H0004001", unused ? "My Page" : "마이페이지", mapMenuUrl("/mypage", unused), ""));
        mypage.getChildren().add(createNode("H0004002", unused ? "Membership Status Overview" : "회원 가입현황", mapMenuUrl("/mypage", unused), ""));

        top.getChildren().add(signin);
        top.getChildren().add(join);
        top.getChildren().add(company);
        top.getChildren().add(mypage);
        return top;
    }

    private void sortNodes(List<SiteMapNode> nodes, Map<String, Integer> sortOrderMap) {
        nodes.sort(Comparator
                .comparingInt((SiteMapNode node) -> effectiveSort(node.getCode(), sortOrderMap))
                .thenComparing(SiteMapNode::getCode, Comparator.nullsLast(String::compareTo)));
        for (SiteMapNode node : nodes) {
            sortNodes(node.getChildren(), sortOrderMap);
            if ("#".equals(safeString(node.getUrl()))) {
                String firstChildUrl = firstChildUrl(node.getChildren());
                if (!firstChildUrl.isEmpty()) {
                    node.setUrl(firstChildUrl);
                }
            }
        }
    }

    private String firstChildUrl(List<SiteMapNode> children) {
        for (SiteMapNode child : children) {
            String url = safeString(child.getUrl());
            if (!url.isEmpty() && !"#".equals(url)) {
                return url;
            }
            String nestedUrl = firstChildUrl(child.getChildren());
            if (!nestedUrl.isEmpty()) {
                return nestedUrl;
            }
        }
        return "";
    }

    private SiteMapNode createNode(String code, String label, String url, String icon) {
        SiteMapNode node = new SiteMapNode();
        node.setCode(code);
        node.setLabel(label);
        node.setUrl(url.isEmpty() ? "#" : url);
        node.setIcon(icon);
        return node;
    }

    private String resolveLabel(MenuInfoDTO row, boolean isEn) {
        String primary = isEn ? safeString(row.getCodeDc()) : safeString(row.getCodeNm());
        String fallback = isEn ? safeString(row.getCodeNm()) : safeString(row.getCodeDc());
        return primary.isEmpty() ? (fallback.isEmpty() ? safeString(row.getCode()) : fallback) : primary;
    }

    private List<MenuInfoDTO> loadMenuTreeRows(String codeId) {
        try {
            return new ArrayList<>(menuInfoService.selectMenuTreeList(codeId));
        } catch (Exception e) {
            log.error("Failed to load sitemap menu tree. codeId={}", codeId, e);
            return Collections.emptyList();
        }
    }

    private String mapMenuUrl(String value, boolean isEn) {
        String url = normalizeMenuUrl(value);
        if (url.isEmpty()) {
            return "#";
        }
        String mapped = ReactPageUrlMapper.toRuntimeUrl(url, isEn);
        if (!mapped.isEmpty()) {
            return mapped;
        }
        if (isEn && !url.startsWith("/en/")) {
            return "/en" + url;
        }
        return url;
    }

    private String normalizeMenuUrl(String value) {
        String url = safeString(value);
        if (url.isEmpty() || "#".equals(url)) {
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

    private boolean shouldExposeAdminMenu(String authorCode, String menuUrl) {
        String normalizedAuthorCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        String normalizedMenuUrl = ReactPageUrlMapper.toCanonicalMenuUrl(normalizeMenuUrl(menuUrl));
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
            log.warn("Failed to evaluate sitemap menu permission. authorCode={}, menuUrl={}",
                    normalizedAuthorCode, normalizedMenuUrl, e);
            return false;
        }
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
            log.warn("Failed to resolve author code for sitemap.", e);
            return "";
        }
    }

    private int effectiveSort(String code, Map<String, Integer> sortOrderMap) {
        Integer saved = sortOrderMap.get(safeString(code).toUpperCase(Locale.ROOT));
        if (saved != null) {
            return saved;
        }
        return fallbackCodeSort(code);
    }

    private int fallbackCodeSort(String code) {
        String normalized = safeString(code);
        if ("H000".equals(normalized)) {
            return PUBLIC_ENTRY_SORT;
        }
        if ("H00010".equals(normalized)) {
            return PUBLIC_SIGNIN_SORT;
        }
        if ("H00020".equals(normalized)) {
            return PUBLIC_JOIN_SORT;
        }
        if ("H00030".equals(normalized)) {
            return PUBLIC_COMPANY_SORT;
        }
        if ("H00040".equals(normalized)) {
            return PUBLIC_MYPAGE_SORT;
        }
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

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }
}
