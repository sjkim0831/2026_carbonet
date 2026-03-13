package egovframework.com.feature.home.service.impl;

import egovframework.com.common.util.ReactPageUrlMapper;
import egovframework.com.feature.admin.dto.response.MenuInfoDTO;
import egovframework.com.feature.admin.service.MenuInfoService;
import egovframework.com.feature.home.model.vo.HomeMenuNode;
import egovframework.com.feature.home.service.HomeMenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service("homeMenuService")
@RequiredArgsConstructor
public class HomeMenuServiceImpl implements HomeMenuService {

    private final MenuInfoService menuInfoService;

    @Override
    public List<HomeMenuNode> getHomeMenu(boolean isEn) {
        try {
            return buildHomeMenu(isEn);
        } catch (Exception e) {
            log.error("Failed to build home menu. isEn={}", isEn, e);
            return Collections.emptyList();
        }
    }

    private List<HomeMenuNode> buildHomeMenu(boolean isEn) {
        List<MenuInfoDTO> rows = loadMenuTreeRows("HMENU1");
        if (rows.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, Integer> sortOrderMap = new LinkedHashMap<>();
        for (MenuInfoDTO row : rows) {
            sortOrderMap.put(safeString(row.getCode()).toUpperCase(Locale.ROOT), row.getSortOrdr());
        }
        Map<String, HomeMenuNode> topMap = new LinkedHashMap<>();
        Map<String, HomeMenuNode> midMap = new LinkedHashMap<>();

        for (MenuInfoDTO row : rows) {
            if (!"Y".equalsIgnoreCase(safeString(row.getUseAt()))) {
                continue;
            }
            String value = safeString(row.getCode()).toUpperCase(Locale.ROOT);
            if (value.isEmpty()) {
                continue;
            }
            String label = resolveHomeMenuLabel(row, isEn);
            String url = resolveMenuUrl(value, row.getMenuUrl(), isEn);
            if (value.length() == 4) {
                HomeMenuNode top = topMap.computeIfAbsent(value,
                        key -> createMenuNode(key, label, url));
                top.setLabel(label);
                top.setUrl(url);
            } else if (value.length() == 6) {
                String parent = value.substring(0, 4);
                HomeMenuNode top = topMap.computeIfAbsent(parent,
                        key -> createMenuNode(key, key, "#"));
                HomeMenuNode mid = createMenuNode(value, label, url);
                top.getSections().add(mid);
                midMap.put(value, mid);
            } else if (value.length() == 8) {
                String parent = value.substring(0, 6);
                HomeMenuNode mid = midMap.get(parent);
                if (mid == null) {
                    String topKey = value.substring(0, 4);
                    HomeMenuNode top = topMap.computeIfAbsent(topKey,
                            key -> createMenuNode(key, key, "#"));
                    mid = createMenuNode(parent, parent, "#");
                    top.getSections().add(mid);
                    midMap.put(parent, mid);
                }
                mid.getItems().add(createMenuNode(value, label, url));
            }
        }

        List<HomeMenuNode> result = new ArrayList<>(topMap.values());
        result.sort(menuNodeComparator(sortOrderMap));
        for (HomeMenuNode top : result) {
            top.getSections().sort(menuNodeComparator(sortOrderMap));
            for (HomeMenuNode section : top.getSections()) {
                section.getItems().sort(menuNodeComparator(sortOrderMap));
            }
        }
        for (HomeMenuNode top : result) {
            String url = safeString(top.getUrl());
            if (!url.isEmpty() && !"#".equals(url)) {
                continue;
            }
            String resolved = firstChildUrl(top.getSections());
            if (!resolved.isEmpty()) {
                top.setUrl(resolved);
            }
        }
        return result;
    }

    private HomeMenuNode createMenuNode(String code, String label, String url) {
        HomeMenuNode node = new HomeMenuNode();
        node.setCode(code);
        node.setLabel(label);
        node.setUrl(url);
        return node;
    }

    private String resolveMenuUrl(String code, String rawUrl, boolean isEn) {
        String mapped = safeString(rawUrl);
        if (!mapped.isEmpty()) {
            return normalizeHomeMenuUrl(mapped, isEn);
        }
        if ("H008".equals(code) || "H0080101".equals(code)) {
            return isEn ? "/en/mypage" : "/mypage";
        }
        return "#";
    }

    private String firstChildUrl(List<HomeMenuNode> sections) {
        if (sections == null) {
            return "";
        }
        for (HomeMenuNode section : sections) {
            if (section.getItems() == null) {
                continue;
            }
            for (HomeMenuNode item : section.getItems()) {
                String url = safeString(item.getUrl());
                if (!url.isEmpty() && !"#".equals(url)) {
                    return url;
                }
            }
        }
        return "";
    }

    private String resolveHomeMenuLabel(MenuInfoDTO code, boolean isEn) {
        String label = isEn ? safeString(code.getCodeDc()) : safeString(code.getCodeNm());
        if (label.isEmpty()) {
            label = isEn ? safeString(code.getCodeNm()) : safeString(code.getCodeDc());
        }
        return label.isEmpty() ? safeString(code.getCode()) : label;
    }

    private List<MenuInfoDTO> loadMenuTreeRows(String codeId) {
        try {
            return menuInfoService.selectMenuTreeList(codeId);
        } catch (Exception e) {
            log.error("Failed to load menu tree rows. codeId={}", codeId, e);
            return Collections.emptyList();
        }
    }

    private String normalizeHomeMenuUrl(String value, boolean isEn) {
        String url = safeString(value);
        if (url.isEmpty()) {
            return "#";
        }
        if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("#")) {
            return url;
        }
        if (!url.startsWith("/")) {
            url = "/" + url;
        }
        String reactMapped = mapReactMigrationUrl(url, isEn);
        if (!reactMapped.isEmpty()) {
            return reactMapped;
        }
        if (isEn && !url.startsWith("/en/")) {
            url = "/en" + url;
        }
        return url;
    }

    private String mapReactMigrationUrl(String url, boolean isEn) {
        return ReactPageUrlMapper.toRuntimeUrl(url, isEn);
    }

    private Comparator<HomeMenuNode> menuNodeComparator(Map<String, Integer> sortOrderMap) {
        return Comparator
                .comparingInt((HomeMenuNode node) -> effectiveSort(node.getCode(), sortOrderMap))
                .thenComparing(HomeMenuNode::getCode, Comparator.nullsLast(String::compareTo));
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

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }
}
