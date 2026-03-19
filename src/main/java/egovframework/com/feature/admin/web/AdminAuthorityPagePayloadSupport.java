package egovframework.com.feature.admin.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.common.audit.AuditEventRecordVO;
import egovframework.com.common.audit.AuditEventSearchVO;
import egovframework.com.common.service.ObservabilityQueryService;
import egovframework.com.common.util.FeatureCodeBitmap;
import egovframework.com.common.util.ReactPageUrlMapper;
import egovframework.com.feature.admin.model.vo.UserFeatureOverrideVO;
import egovframework.com.feature.admin.model.vo.AdminRoleAssignmentVO;
import egovframework.com.feature.admin.model.vo.AuthorInfoVO;
import egovframework.com.feature.admin.model.vo.DepartmentRoleMappingVO;
import egovframework.com.feature.admin.model.vo.FeatureAssignmentStatVO;
import egovframework.com.feature.admin.model.vo.FeatureCatalogItemVO;
import egovframework.com.feature.admin.model.vo.FeatureCatalogSectionVO;
import egovframework.com.feature.admin.model.vo.UserAuthorityTargetVO;
import egovframework.com.feature.admin.service.AuthGroupManageService;
import egovframework.com.feature.auth.domain.entity.EmplyrInfo;
import egovframework.com.feature.auth.domain.repository.EmployeeMemberRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import java.util.ArrayList;
import java.util.BitSet;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminAuthorityPagePayloadSupport {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthorityPagePayloadSupport.class);
    private static final String AUTH_GROUP_GENERAL_VIEW_FEATURE_CODE = "AUTH_GROUP_GENERAL_VIEW";
    private static final String ROLE_SYSTEM_MASTER = "ROLE_SYSTEM_MASTER";
    private static final String ROLE_SYSTEM_ADMIN = "ROLE_SYSTEM_ADMIN";
    private static final String ROLE_ADMIN = "ROLE_ADMIN";
    private static final String ROLE_OPERATION_ADMIN = "ROLE_OPERATION_ADMIN";

    private final AuthGroupManageService authGroupManageService;
    private final EmployeeMemberRepository employMemberRepository;
    private final ObservabilityQueryService observabilityQueryService;
    private final ObjectMapper objectMapper;

    public List<FeatureCatalogSectionVO> buildFeatureCatalogSections(List<FeatureCatalogItemVO> featureRows, boolean isEn) {
        Map<String, FeatureCatalogSectionVO> sectionMap = new LinkedHashMap<>();
        for (FeatureCatalogItemVO row : featureRows) {
            String mappedMenuUrl = ReactPageUrlMapper.toRuntimeUrl(row.getMenuUrl(), isEn);
            row.setMenuUrl(mappedMenuUrl.isEmpty() ? row.getMenuUrl() : mappedMenuUrl);
            FeatureCatalogSectionVO section = sectionMap.computeIfAbsent(row.getMenuCode(), key -> {
                FeatureCatalogSectionVO value = new FeatureCatalogSectionVO();
                value.setMenuCode(row.getMenuCode());
                value.setMenuNm(row.getMenuNm());
                value.setMenuNmEn(row.getMenuNmEn());
                value.setMenuUrl(row.getMenuUrl());
                return value;
            });
            section.getFeatures().add(row);
        }
        return new ArrayList<>(sectionMap.values());
    }

    public List<FeatureCatalogItemVO> applyFeatureAssignmentStats(
            List<FeatureCatalogItemVO> featureRows,
            Map<String, Integer> featureAssignmentCounts) {
        if (featureRows == null || featureRows.isEmpty()) {
            return Collections.emptyList();
        }
        for (FeatureCatalogItemVO row : featureRows) {
            String featureCode = safeString(row.getFeatureCode()).toUpperCase(Locale.ROOT);
            int assignedRoleCount = featureAssignmentCounts.getOrDefault(featureCode, 0);
            row.setAssignedRoleCount(assignedRoleCount);
            row.setUnassignedToRole(assignedRoleCount == 0);
        }
        return featureRows;
    }

    public Map<String, Integer> toFeatureAssignmentCountMap(List<FeatureAssignmentStatVO> stats) {
        if (stats == null || stats.isEmpty()) {
            return Collections.emptyMap();
        }
        Map<String, Integer> result = new LinkedHashMap<>();
        for (FeatureAssignmentStatVO stat : stats) {
            String featureCode = safeString(stat.getFeatureCode()).toUpperCase(Locale.ROOT);
            if (!featureCode.isEmpty()) {
                result.put(featureCode, stat.getAssignedRoleCount());
            }
        }
        return result;
    }

    public String resolveSelectedAuthorCode(String authorCode, List<AuthorInfoVO> authorGroups) {
        String normalized = safeString(authorCode).toUpperCase(Locale.ROOT);
        if (!normalized.isEmpty()) {
            return normalized;
        }
        if (authorGroups == null || authorGroups.isEmpty()) {
            return "";
        }
        return safeString(authorGroups.get(0).getAuthorCode()).toUpperCase(Locale.ROOT);
    }

    public String resolveSelectedAuthorName(String authorCode, List<AuthorInfoVO> authorGroups) {
        String normalized = safeString(authorCode).toUpperCase(Locale.ROOT);
        if (normalized.isEmpty() || authorGroups == null || authorGroups.isEmpty()) {
            return "";
        }
        return authorGroups.stream()
                .filter(group -> normalized.equalsIgnoreCase(safeString(group.getAuthorCode())))
                .map(AuthorInfoVO::getAuthorNm)
                .filter(name -> !safeString(name).isEmpty())
                .findFirst()
                .orElse("");
    }

    public int countSelectedPageCount(List<FeatureCatalogSectionVO> featureSections, List<String> selectedFeatureCodes) {
        if (featureSections == null || featureSections.isEmpty() || selectedFeatureCodes == null || selectedFeatureCodes.isEmpty()) {
            return 0;
        }
        FeatureCodeBitmap.Index featureBitmapIndex = buildFeatureBitmapIndex(featureSections, selectedFeatureCodes);
        return countSelectedPageCount(featureSections, featureBitmapIndex, featureBitmapIndex.encode(selectedFeatureCodes));
    }

    public int countSelectedPageCount(
            List<FeatureCatalogSectionVO> featureSections,
            FeatureCodeBitmap.Index featureBitmapIndex,
            BitSet selectedFeatureBitmap) {
        if (featureSections == null || featureSections.isEmpty() || featureBitmapIndex == null
                || selectedFeatureBitmap == null || selectedFeatureBitmap.isEmpty()) {
            return 0;
        }
        int selectedPageCount = 0;
        for (FeatureCatalogSectionVO section : featureSections) {
            BitSet sectionFeatureBitmap = featureBitmapIndex.encode(extractSectionFeatureCodes(section));
            if (featureBitmapIndex.intersects(sectionFeatureBitmap, selectedFeatureBitmap)) {
                selectedPageCount++;
            }
        }
        return selectedPageCount;
    }

    public String resolveCurrentUserAuthorCode(String currentUserId) {
        if (isWebmaster(currentUserId)) {
            return ROLE_SYSTEM_MASTER;
        }
        try {
            return safeString(authGroupManageService.selectAuthorCodeByUserId(currentUserId)).toUpperCase(Locale.ROOT);
        } catch (Exception e) {
            log.error("Failed to resolve current admin role. userId={}", safeString(currentUserId), e);
            return "";
        }
    }

    public String resolveCurrentUserInsttId(String currentUserId) {
        String normalizedUserId = safeString(currentUserId);
        if (normalizedUserId.isEmpty() || isWebmaster(normalizedUserId)) {
            return "";
        }
        try {
            return employMemberRepository.findById(normalizedUserId)
                    .map(EmplyrInfo::getInsttId)
                    .map(this::safeString)
                    .orElse("");
        } catch (Exception e) {
            log.error("Failed to resolve current admin institution. userId={}", normalizedUserId, e);
            return "";
        }
    }

    public boolean hasGlobalDeptRoleAccess(String currentUserId, String authorCode) {
        if (isWebmaster(currentUserId)) {
            return true;
        }
        String normalizedAuthorCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        return ROLE_SYSTEM_MASTER.equals(normalizedAuthorCode)
                || ROLE_SYSTEM_ADMIN.equals(normalizedAuthorCode)
                || ROLE_ADMIN.equals(normalizedAuthorCode);
    }

    public boolean hasOwnCompanyDeptRoleAccess(String currentUserId, String authorCode) {
        if (hasGlobalDeptRoleAccess(currentUserId, authorCode)) {
            return true;
        }
        return ROLE_OPERATION_ADMIN.equals(safeString(authorCode).toUpperCase(Locale.ROOT));
    }

    public boolean requiresOwnCompanyAccess(String currentUserId, String authorCode) {
        return !hasGlobalDeptRoleAccess(currentUserId, authorCode) && hasOwnCompanyDeptRoleAccess(currentUserId, authorCode);
    }

    public Set<String> resolveGrantableFeatureCodeSet(String currentUserId, boolean webmaster) throws Exception {
        if (webmaster) {
            return null;
        }
        Set<String> grantable = new LinkedHashSet<>();
        String currentAuthorCode = resolveCurrentUserAuthorCode(currentUserId);
        if (!currentAuthorCode.isEmpty()) {
            grantable.addAll(normalizeFeatureCodes(authGroupManageService.selectAuthorFeatureCodes(currentAuthorCode)));
        }
        String actorEsntlId = safeString(authGroupManageService.selectAdminEssentialIdByUserId(currentUserId));
        if (!actorEsntlId.isEmpty()) {
            applyUserFeatureOverrides(grantable, authGroupManageService.selectUserFeatureOverrides(actorEsntlId));
        }
        return grantable;
    }

    public List<FeatureCatalogSectionVO> filterFeatureCatalogSectionsByGrantable(
            List<FeatureCatalogSectionVO> featureSections,
            Set<String> grantableFeatureCodes) {
        if (grantableFeatureCodes == null) {
            return featureSections == null ? Collections.emptyList() : featureSections;
        }
        if (featureSections == null || featureSections.isEmpty() || grantableFeatureCodes.isEmpty()) {
            return Collections.emptyList();
        }
        List<FeatureCatalogSectionVO> filteredSections = new ArrayList<>();
        for (FeatureCatalogSectionVO section : featureSections) {
            List<FeatureCatalogItemVO> filteredFeatures = section.getFeatures().stream()
                    .filter(feature -> grantableFeatureCodes.contains(safeString(feature.getFeatureCode()).toUpperCase(Locale.ROOT)))
                    .collect(Collectors.toList());
            if (filteredFeatures.isEmpty()) {
                continue;
            }
            FeatureCatalogSectionVO filteredSection = new FeatureCatalogSectionVO();
            filteredSection.setMenuCode(section.getMenuCode());
            filteredSection.setMenuNm(section.getMenuNm());
            filteredSection.setMenuNmEn(section.getMenuNmEn());
            filteredSection.setMenuUrl(section.getMenuUrl());
            filteredSection.setFeatures(filteredFeatures);
            filteredSections.add(filteredSection);
        }
        return filteredSections;
    }

    public List<String> filterFeatureCodesByGrantable(List<String> featureCodes, Set<String> grantableFeatureCodes) {
        if (grantableFeatureCodes == null) {
            return normalizeFeatureCodes(featureCodes);
        }
        if (featureCodes == null || featureCodes.isEmpty() || grantableFeatureCodes.isEmpty()) {
            return Collections.emptyList();
        }
        return normalizeFeatureCodes(featureCodes).stream()
                .filter(grantableFeatureCodes::contains)
                .collect(Collectors.toList());
    }

    public Map<String, String> resolveAdminRoleSummary(String emplyrId) {
        String normalizedEmplyrId = safeString(emplyrId);
        if (normalizedEmplyrId.isEmpty()) {
            return buildAuthorSummary("");
        }
        try {
            return authGroupManageService.selectAdminRoleAssignments().stream()
                    .filter(item -> normalizedEmplyrId.equalsIgnoreCase(safeString(item.getEmplyrId())))
                    .findFirst()
                    .map(item -> {
                        Map<String, String> summary = new LinkedHashMap<>();
                        summary.put("authorCode", safeString(item.getAuthorCode()));
                        summary.put("authorNm", safeString(item.getAuthorNm()));
                        return summary;
                    })
                    .orElseGet(() -> buildAuthorSummary(""));
        } catch (Exception e) {
            log.warn("Failed to resolve current admin role summary. emplyrId={}", normalizedEmplyrId, e);
            return buildAuthorSummary("");
        }
    }

    public Map<String, String> buildAuthorSummary(String authorCode) {
        String normalizedAuthorCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        Map<String, String> summary = new LinkedHashMap<>();
        summary.put("authorCode", normalizedAuthorCode);
        summary.put("authorNm", "");
        if (normalizedAuthorCode.isEmpty()) {
            return summary;
        }
        try {
            authGroupManageService.selectAuthorList().stream()
                    .filter(item -> normalizedAuthorCode.equalsIgnoreCase(safeString(item.getAuthorCode())))
                    .findFirst()
                    .ifPresent(item -> summary.put("authorNm", safeString(item.getAuthorNm())));
        } catch (Exception e) {
            log.warn("Failed to resolve author summary. authorCode={}", normalizedAuthorCode, e);
        }
        return summary;
    }

    public List<Map<String, String>> buildRecentAdminRoleChangeHistory(boolean isEn) {
        AuditEventSearchVO searchVO = new AuditEventSearchVO();
        searchVO.setFirstIndex(0);
        searchVO.setRecordCountPerPage(10);
        searchVO.setPageId("auth-change");
        searchVO.setActionCode("ADMIN_ROLE_ASSIGNMENT_SAVE");
        List<AuditEventRecordVO> items;
        try {
            items = observabilityQueryService.selectAuditEventList(searchVO);
        } catch (Exception e) {
            log.warn("Failed to load recent admin role change history.", e);
            return Collections.emptyList();
        }
        return items.stream()
                .map(item -> buildAdminRoleChangeHistoryRow(item, isEn))
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> buildRecommendedRoleSections(List<AuthorInfoVO> authorGroups, boolean isEn) {
        Set<String> existingCodes = authorGroups.stream()
                .map(AuthorInfoVO::getAuthorCode)
                .filter(code -> !ObjectUtils.isEmpty(code))
                .collect(Collectors.toSet());

        List<Map<String, Object>> sections = new ArrayList<>();

        List<Map<String, String>> generalRoles = new ArrayList<>();
        generalRoles.add(recommendedRole("ROLE_ADMIN",
                isEn ? "Administrator" : "관리자",
                isEn ? "Baseline administrator role assigned to privileged user accounts." : "운영 관리자 계정에 기본 부여하는 기준 관리자 Role입니다.",
                existingCodes));
        generalRoles.add(recommendedRole("ROLE_USER",
                isEn ? "General User" : "일반 사용자",
                isEn ? "Baseline end-user role assigned to standard accounts." : "일반 사용자 계정에 기본 부여하는 기준 사용자 Role입니다.",
                existingCodes));
        generalRoles.add(recommendedRole("ROLE_SYSTEM_MASTER",
                isEn ? "System Master" : "시스템 마스터",
                isEn ? "Full access for webmaster only" : "webmaster 전용 전체 권한",
                existingCodes));
        generalRoles.add(recommendedRole("ROLE_SYSTEM_ADMIN",
                isEn ? "System Admin" : "시스템 관리자",
                isEn ? "Code, page, feature and role administration" : "코드/페이지/기능/권한 운영 관리",
                existingCodes));
        generalRoles.add(recommendedRole("ROLE_OPERATION_ADMIN",
                isEn ? "Operation Admin" : "운영 관리자",
                isEn ? "Operational processing across service domains" : "서비스 운영 전반 처리 권한",
                existingCodes));
        generalRoles.add(recommendedRole("ROLE_COMPANY_ADMIN",
                isEn ? "Company Admin" : "회원사 관리자",
                isEn ? "Company-scoped authority management for one institution" : "단일 회원사 범위의 권한/회원 운영 기준 롤",
                existingCodes));
        generalRoles.add(recommendedRole("ROLE_CS_ADMIN",
                isEn ? "CS Admin" : "CS 관리자",
                isEn ? "Customer support and member response authority" : "고객 지원 및 회원 응대 권한",
                existingCodes));
        sections.add(recommendedRoleSection(
                "GENERAL",
                isEn ? "General authority groups" : "일반 권한 그룹",
                isEn ? "Baseline authority groups used as common execution roles across the system." : "시스템 전반에서 기준 권한으로 사용하는 공통 실행 Role입니다.",
                generalRoles
        ));

        List<Map<String, String>> departmentRoles = new ArrayList<>();
        departmentRoles.add(recommendedRole("ROLE_DEPT_OPERATION",
                isEn ? "Department Operation" : "부서 운영 기본권한",
                isEn ? "Default department-level operational baseline" : "운영부서 기본 권한 베이스라인",
                existingCodes));
        departmentRoles.add(recommendedRole("ROLE_DEPT_CS",
                isEn ? "Department CS" : "부서 CS 기본권한",
                isEn ? "Default department-level customer support baseline" : "CS부서 기본 권한 베이스라인",
                existingCodes));
        departmentRoles.add(recommendedRole("ROLE_DEPT_SUSTAINABILITY",
                isEn ? "Department Sustainability" : "부서 탄소/ESG 기본권한",
                isEn ? "Baseline role for carbon, ESG, and sustainability departments" : "탄소/ESG/지속가능경영 부서 기준 권한",
                existingCodes));
        departmentRoles.add(recommendedRole("ROLE_DEPT_PRODUCTION",
                isEn ? "Department Production" : "부서 생산 기본권한",
                isEn ? "Baseline role for production and manufacturing departments" : "생산/공정 부서 기준 권한",
                existingCodes));
        departmentRoles.add(recommendedRole("ROLE_DEPT_PROCUREMENT",
                isEn ? "Department Procurement" : "부서 구매 기본권한",
                isEn ? "Baseline role for procurement and SCM departments" : "구매/SCM 부서 기준 권한",
                existingCodes));
        departmentRoles.add(recommendedRole("ROLE_DEPT_QUALITY",
                isEn ? "Department Quality" : "부서 품질 기본권한",
                isEn ? "Baseline role for quality, certification, and audit departments" : "품질/인증/심사 부서 기준 권한",
                existingCodes));
        departmentRoles.add(recommendedRole("ROLE_DEPT_SALES",
                isEn ? "Department Sales" : "부서 영업 기본권한",
                isEn ? "Baseline role for sales and account management departments" : "영업/고객사 관리 부서 기준 권한",
                existingCodes));
        sections.add(recommendedRoleSection(
                "DEPARTMENT",
                isEn ? "Department authority groups" : "부서 권한 그룹",
                isEn ? "Baseline roles assigned automatically by department." : "부서 기준으로 기본 부여하는 베이스라인 Role입니다.",
                departmentRoles
        ));

        sections.add(recommendedRoleSection(
                "USER",
                isEn ? "User authority groups" : "사용자 권한 그룹",
                isEn ? "No user-specific role groups have been prepared yet. Add these later for direct assignment exceptions." : "아직 별도로 준비된 사용자 전용 Role은 없습니다. 직접 부여 예외가 필요할 때 추가합니다.",
                new ArrayList<>()
        ));

        return sections;
    }

    public List<Map<String, Object>> filterRecommendedRoleSections(List<Map<String, Object>> sections, String selectedRoleCategory) {
        return sections.stream()
                .filter(section -> selectedRoleCategory.equals(section.get("category")))
                .collect(Collectors.toList());
    }

    public List<AuthorInfoVO> filterAuthorGroups(List<AuthorInfoVO> authorGroups, String selectedRoleCategory) {
        return authorGroups.stream()
                .filter(group -> matchesRoleCategory(group.getAuthorCode(), selectedRoleCategory))
                .collect(Collectors.toList());
    }

    public List<AuthorInfoVO> filterAuthorGroupsByScope(
            List<AuthorInfoVO> authorGroups,
            String selectedRoleCategory,
            String insttId,
            boolean globalAccess) {
        return authorGroups.stream()
                .filter(group -> matchesRoleCategory(group.getAuthorCode(), selectedRoleCategory))
                .filter(group -> globalAccess || isVisibleScopedAuthorCode(group.getAuthorCode(), selectedRoleCategory, insttId))
                .collect(Collectors.toList());
    }

    public List<AuthorInfoVO> buildDeptMemberAssignableGroups(List<AuthorInfoVO> authorGroups, String insttId, boolean globalAccess) {
        return authorGroups.stream()
                .filter(group -> {
                    String normalizedCode = safeString(group.getAuthorCode()).toUpperCase(Locale.ROOT);
                    return "ROLE_USER".equals(normalizedCode)
                            || normalizedCode.startsWith("ROLE_DEPT_")
                            || normalizedCode.startsWith("ROLE_USER_")
                            || normalizedCode.startsWith("ROLE_MEMBER_")
                            || normalizedCode.startsWith("ROLE_ACCOUNT_");
                })
                .filter(group -> globalAccess
                        || isVisibleScopedAuthorCode(group.getAuthorCode(), "DEPARTMENT", insttId)
                        || isVisibleScopedAuthorCode(group.getAuthorCode(), "USER", insttId))
                .collect(Collectors.toList());
    }

    public String resolveRoleCategory(String roleCategory) {
        String normalized = safeString(roleCategory).toUpperCase(Locale.ROOT);
        if ("GENERAL".equals(normalized) || "DEPARTMENT".equals(normalized) || "USER".equals(normalized)) {
            return normalized;
        }
        return "GENERAL";
    }

    public List<Map<String, String>> buildRoleCategoryOptions(boolean isEn, boolean canViewGeneralAuthorityGroups) {
        List<Map<String, String>> rows = new ArrayList<>();
        if (canViewGeneralAuthorityGroups) {
            rows.add(roleCategoryOption("GENERAL", isEn ? "General groups" : "일반 권한 그룹"));
        }
        rows.add(roleCategoryOption("DEPARTMENT", isEn ? "Department groups" : "부서 권한 그룹"));
        rows.add(roleCategoryOption("USER", isEn ? "User groups" : "사용자 권한 그룹"));
        return rows;
    }

    public boolean hasGeneralAuthorityGroupAccess(String currentUserId, boolean webmaster) throws Exception {
        if (webmaster) {
            return true;
        }
        String authorCode = safeString(authGroupManageService.selectAuthorCodeByUserId(currentUserId));
        if (authorCode.isEmpty()) {
            return false;
        }
        return authGroupManageService.hasAuthorFeaturePermission(authorCode, AUTH_GROUP_GENERAL_VIEW_FEATURE_CODE);
    }

    public List<Map<String, String>> buildDepartmentRoleRows(List<DepartmentRoleMappingVO> mappings, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        for (DepartmentRoleMappingVO mapping : mappings) {
            Map<String, String> row = new LinkedHashMap<>();
            String deptName = safeString(mapping.getDeptNm());
            String mappedAuthorCode = safeString(mapping.getAuthorCode());
            String companyName = safeString(mapping.getCmpnyNm());
            String insttId = safeString(mapping.getInsttId());
            row.put("cmpnyNm", companyName);
            row.put("insttId", insttId);
            row.put("deptNm", deptName.isEmpty() ? (isEn ? "Unassigned" : "미지정") : deptName);
            row.put("memberCount", String.valueOf(mapping.getMemberCount()));
            String recommendedRoleCode = mappedAuthorCode.isEmpty()
                    ? resolveDepartmentRoleCode(insttId, companyName, deptName)
                    : mappedAuthorCode;
            row.put("recommendedRoleCode", recommendedRoleCode);
            row.put("recommendedRoleName",
                    safeString(mapping.getAuthorNm()).isEmpty()
                            ? resolveDepartmentRoleName(recommendedRoleCode, isEn)
                            : safeString(mapping.getAuthorNm()));
            row.put("status",
                    mappedAuthorCode.isEmpty()
                            ? (isUnknownDepartmentRole(recommendedRoleCode) ? "review" : "ready")
                            : "mapped");
            rows.add(row);
        }
        return rows;
    }

    public List<Map<String, String>> buildDepartmentCompanyOptions(List<Map<String, String>> departmentRows) {
        Map<String, String> dedup = new LinkedHashMap<>();
        for (Map<String, String> row : departmentRows) {
            String insttId = safeString(row.get("insttId"));
            if (insttId.isEmpty() || dedup.containsKey(insttId)) {
                continue;
            }
            dedup.put(insttId, safeString(row.get("cmpnyNm")));
        }
        List<Map<String, String>> options = new ArrayList<>();
        for (Map.Entry<String, String> entry : dedup.entrySet()) {
            Map<String, String> option = new LinkedHashMap<>();
            option.put("insttId", entry.getKey());
            option.put("cmpnyNm", entry.getValue());
            options.add(option);
        }
        return options;
    }

    public List<AuthorInfoVO> filterScopedDepartmentAuthorGroups(List<AuthorInfoVO> authorGroups, List<Map<String, String>> departmentRows) {
        if (departmentRows == null || departmentRows.isEmpty()) {
            return Collections.emptyList();
        }
        Set<String> allowedCodes = departmentRows.stream()
                .map(row -> safeString(row.get("recommendedRoleCode")).toUpperCase(Locale.ROOT))
                .filter(code -> !code.isEmpty())
                .collect(Collectors.toCollection(LinkedHashSet::new));
        return authorGroups.stream()
                .filter(group -> allowedCodes.contains(safeString(group.getAuthorCode()).toUpperCase(Locale.ROOT)))
                .collect(Collectors.toList());
    }

    public String resolveSelectedInsttId(String insttId, List<Map<String, String>> companyOptions) {
        return resolveSelectedInsttId(insttId, companyOptions, false);
    }

    public String resolveSelectedInsttId(String insttId, List<Map<String, String>> companyOptions, boolean allowEmptySelection) {
        String normalized = safeString(insttId);
        if (allowEmptySelection && normalized.isEmpty()) {
            return "";
        }
        if (normalized.isEmpty()) {
            return companyOptions.isEmpty() ? "" : safeString(companyOptions.get(0).get("insttId"));
        }
        boolean exists = companyOptions.stream()
                .anyMatch(option -> normalized.equals(option.get("insttId")));
        return exists ? normalized : (companyOptions.isEmpty() ? "" : safeString(companyOptions.get(0).get("insttId")));
    }

    public AuthGroupScopeContext buildAuthGroupScopeContext(
            String insttId,
            String userSearchKeyword,
            String selectedRoleCategory,
            String currentUserInsttId,
            boolean webmaster,
            boolean globalAccess,
            List<AuthorInfoVO> authorGroups,
            boolean isEn) {
        AuthGroupScopeContext context = AuthGroupScopeContext.empty();
        context.setUserSearchKeyword(safeString(userSearchKeyword));
        context.setReferenceAuthorGroups(filterAuthorGroups(authorGroups, selectedRoleCategory));
        if (!"DEPARTMENT".equals(selectedRoleCategory) && !"USER".equals(selectedRoleCategory)) {
            return context;
        }
        try {
            List<Map<String, String>> departmentRows = buildDepartmentRoleRows(authGroupManageService.selectDepartmentRoleMappings(), isEn);
            List<Map<String, String>> companyOptions = buildDepartmentCompanyOptions(departmentRows);
            if (!webmaster) {
                companyOptions = companyOptions.stream()
                        .filter(option -> currentUserInsttId.equals(option.get("insttId")))
                        .collect(Collectors.toList());
            }
            String selectedInsttId = resolveSelectedInsttId(webmaster ? insttId : currentUserInsttId, companyOptions, webmaster);
            context.setCompanyOptions(companyOptions);
            context.setSelectedInsttId(selectedInsttId);

            if ("DEPARTMENT".equals(selectedRoleCategory)) {
                List<Map<String, String>> filteredRows = departmentRows;
                if (!selectedInsttId.isEmpty()) {
                    filteredRows = departmentRows.stream()
                            .filter(row -> selectedInsttId.equals(row.get("insttId")))
                            .collect(Collectors.toList());
                }
                context.setDepartmentRows(filteredRows);
                context.setDepartmentRoleSummaries(buildDepartmentRoleSummaries(filteredRows, isEn));
                context.setReferenceAuthorGroups(filterScopedDepartmentAuthorGroups(
                        filterAuthorGroupsByScope(authorGroups, "DEPARTMENT", selectedInsttId, globalAccess), filteredRows));
                return context;
            }

            if ("USER".equals(selectedRoleCategory) && !selectedInsttId.isEmpty()) {
                context.setReferenceAuthorGroups(filterAuthorGroupsByScope(authorGroups, "USER", selectedInsttId, globalAccess));
                context.setUserAuthorityTargets(authGroupManageService.selectUserAuthorityTargets(selectedInsttId, userSearchKeyword));
            }
        } catch (Exception e) {
            log.error("Failed to load scoped authority targets. roleCategory={}, insttId={}", selectedRoleCategory, insttId, e);
            context.setErrorMessage(isEn
                    ? "Failed to load company-specific authority data."
                    : "회사별 권한 데이터를 불러오지 못했습니다.");
        }
        return context;
    }

    public List<Map<String, String>> buildAssignmentAuthorities(boolean isEn) {
        List<Map<String, String>> items = new ArrayList<>();
        items.add(assignmentAuthority(
                isEn ? "Role assignment authority" : "권한 할당 권한",
                isEn ? "Controls which role groups the current administrator can assign on the member edit page." : "회원 수정 화면에서 현재 관리자가 어떤 Role을 부여할 수 있는지 제어합니다."
        ));
        items.add(assignmentAuthority(
                isEn ? "Grant authority" : "권한 부여 권한",
                isEn ? "Separates execution authority from authority to delegate that execution authority to others." : "실행 권한과 타인에게 그 권한을 위임할 수 있는 권한을 분리합니다."
        ));
        items.add(assignmentAuthority(
                isEn ? "Department baseline authority" : "부서 기본 권한",
                isEn ? "Provides default roles by department, then merges them with user-specific roles." : "부서별 기본 Role을 부여하고 사용자별 직접 권한과 합산합니다."
        ));
        return items;
    }

    public List<Map<String, String>> buildRoleCategories(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(roleCategory(
                isEn ? "General authority list" : "일반 권한 목록",
                isEn ? "Master feature catalog. All VIEW and action permissions are defined here." : "기능 마스터 카탈로그입니다. 모든 VIEW 및 액션 권한의 원본입니다."
        ));
        rows.add(roleCategory(
                isEn ? "Department authority list" : "부서 권한 목록",
                isEn ? "Department-level baseline roles for operation, CS, audit and similar teams." : "운영, CS, 감사 등 부서 단위 기본 Role 목록입니다."
        ));
        rows.add(roleCategory(
                isEn ? "User authority list" : "사용자 권한 목록",
                isEn ? "Direct user-specific role assignments and exceptions managed from member edit." : "회원 수정 화면에서 관리하는 사용자 직접 Role 및 예외 권한입니다."
        ));
        return rows;
    }

    public String resolveDeptRoleMessage(String error, boolean isEn) {
        String normalized = safeString(error).toLowerCase(Locale.ROOT);
        if (normalized.isEmpty()) {
            return "";
        }
        if ("save_failed".equals(normalized)) {
            return isEn ? "Failed to save the department role mapping." : "부서 권한 맵핑 저장에 실패했습니다.";
        }
        return isEn ? "Failed to process the department role mapping." : "부서 권한 맵핑 처리에 실패했습니다.";
    }

    private List<String> extractSectionFeatureCodes(FeatureCatalogSectionVO section) {
        if (section == null || section.getFeatures() == null || section.getFeatures().isEmpty()) {
            return Collections.emptyList();
        }
        List<String> featureCodes = new ArrayList<>(section.getFeatures().size());
        for (FeatureCatalogItemVO feature : section.getFeatures()) {
            String featureCode = safeString(feature == null ? null : feature.getFeatureCode()).toUpperCase(Locale.ROOT);
            if (!featureCode.isEmpty()) {
                featureCodes.add(featureCode);
            }
        }
        return featureCodes;
    }

    private List<String> normalizeFeatureCodes(List<String> featureCodes) {
        if (featureCodes == null || featureCodes.isEmpty()) {
            return Collections.emptyList();
        }
        LinkedHashSet<String> normalized = new LinkedHashSet<>();
        for (String featureCode : featureCodes) {
            String value = safeString(featureCode).toUpperCase(Locale.ROOT);
            if (!value.isEmpty()) {
                normalized.add(value);
            }
        }
        return new ArrayList<>(normalized);
    }

    private void applyUserFeatureOverrides(Set<String> featureCodes, List<UserFeatureOverrideVO> overrides) {
        if (featureCodes == null || overrides == null || overrides.isEmpty()) {
            return;
        }
        for (UserFeatureOverrideVO override : overrides) {
            String featureCode = safeString(override.getFeatureCode()).toUpperCase(Locale.ROOT);
            if (featureCode.isEmpty()) {
                continue;
            }
            if ("D".equalsIgnoreCase(safeString(override.getOverrideType()))) {
                featureCodes.remove(featureCode);
            } else {
                featureCodes.add(featureCode);
            }
        }
    }

    @SafeVarargs
    private final FeatureCodeBitmap.Index buildFeatureBitmapIndex(
            List<FeatureCatalogSectionVO> featureSections,
            Collection<String>... extraFeatureCollections) {
        Set<String> indexedFeatureCodes = new LinkedHashSet<>();
        if (featureSections != null) {
            for (FeatureCatalogSectionVO section : featureSections) {
                indexedFeatureCodes.addAll(extractSectionFeatureCodes(section));
            }
        }
        if (extraFeatureCollections != null) {
            for (Collection<String> featureCollection : extraFeatureCollections) {
                if (featureCollection == null) {
                    continue;
                }
                for (String featureCode : featureCollection) {
                    String normalizedFeatureCode = safeString(featureCode).toUpperCase(Locale.ROOT);
                    if (!normalizedFeatureCode.isEmpty()) {
                        indexedFeatureCodes.add(normalizedFeatureCode);
                    }
                }
            }
        }
        return FeatureCodeBitmap.index(indexedFeatureCodes);
    }

    private Map<String, String> recommendedRole(String code, String name, String description, Set<String> existingCodes) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("code", code);
        row.put("name", name);
        row.put("description", description);
        row.put("status", existingCodes.contains(code) ? "existing" : "missing");
        return row;
    }

    private Map<String, Object> recommendedRoleSection(String category, String title, String description, List<Map<String, String>> roles) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("category", category);
        row.put("title", title);
        row.put("description", description);
        row.put("roles", roles);
        return row;
    }

    private boolean matchesRoleCategory(String authorCode, String selectedRoleCategory) {
        String normalizedCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        if ("DEPARTMENT".equals(selectedRoleCategory)) {
            return normalizedCode.startsWith("ROLE_DEPT_");
        }
        if ("USER".equals(selectedRoleCategory)) {
            return normalizedCode.startsWith("ROLE_USER_")
                    || normalizedCode.startsWith("ROLE_MEMBER_")
                    || normalizedCode.startsWith("ROLE_ACCOUNT_");
        }
        return !normalizedCode.startsWith("ROLE_DEPT_")
                && !normalizedCode.startsWith("ROLE_USER_")
                && !normalizedCode.startsWith("ROLE_MEMBER_")
                && !normalizedCode.startsWith("ROLE_ACCOUNT_");
    }

    private Map<String, String> roleCategoryOption(String code, String name) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("code", code);
        row.put("name", name);
        return row;
    }

    private List<Map<String, String>> buildDepartmentRoleSummaries(List<Map<String, String>> departmentRows, boolean isEn) {
        Map<String, Map<String, String>> dedup = new LinkedHashMap<>();
        for (Map<String, String> row : departmentRows) {
            String roleCode = safeString(row.get("recommendedRoleCode"));
            if (roleCode.isEmpty() || dedup.containsKey(roleCode)) {
                continue;
            }
            Map<String, String> summary = new LinkedHashMap<>();
            summary.put("code", roleCode);
            summary.put("name", safeString(row.get("recommendedRoleName")));
            summary.put("description", resolveDepartmentRoleDescription(roleCode, isEn));
            summary.put("status", isUnknownDepartmentRole(roleCode) ? "missing" : "existing");
            dedup.put(roleCode, summary);
        }
        return new ArrayList<>(dedup.values());
    }

    private boolean isVisibleScopedAuthorCode(String authorCode, String roleCategory, String insttId) {
        String normalizedCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        if (normalizedCode.isEmpty()) {
            return false;
        }
        String scopedPrefix = buildScopedAuthorPrefix(roleCategory, insttId);
        if (scopedPrefix.isEmpty()) {
            return !isCompanyScopedAuthorCode(normalizedCode, roleCategory);
        }
        return !isCompanyScopedAuthorCode(normalizedCode, roleCategory) || normalizedCode.startsWith(scopedPrefix);
    }

    private boolean isCompanyScopedAuthorCode(String authorCode, String roleCategory) {
        String normalizedCode = safeString(authorCode).toUpperCase(Locale.ROOT);
        if ("DEPARTMENT".equals(roleCategory)) {
            return normalizedCode.startsWith("ROLE_DEPT_I");
        }
        if ("USER".equals(roleCategory)) {
            return normalizedCode.startsWith("ROLE_USER_I");
        }
        return false;
    }

    private String buildScopedAuthorPrefix(String roleCategory, String insttId) {
        String token = normalizeInsttScopeToken(insttId);
        if (token.isEmpty()) {
            return "";
        }
        if ("DEPARTMENT".equals(roleCategory)) {
            return "ROLE_DEPT_I" + shortenInsttScopeToken(token) + "_";
        }
        if ("USER".equals(roleCategory)) {
            return "ROLE_USER_I" + shortenInsttScopeToken(token) + "_";
        }
        return "";
    }

    private String normalizeInsttScopeToken(String insttId) {
        return safeString(insttId).toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9]", "");
    }

    private String shortenInsttScopeToken(String normalizedToken) {
        String token = safeString(normalizedToken);
        if (token.length() <= 8) {
            return token;
        }
        return token.substring(token.length() - 8);
    }

    private String resolveDepartmentRoleCode(String insttId, String companyName, String deptName) {
        String departmentRoleType = resolveDepartmentRoleTypeFromDeptName(companyName, deptName);
        if ("UNKNOWN".equals(departmentRoleType)) {
            return "ROLE_DEPT_UNKNOWN";
        }
        String scopedPrefix = buildScopedAuthorPrefix("DEPARTMENT", insttId);
        if (!scopedPrefix.isEmpty()) {
            return scopedPrefix + departmentRoleType;
        }
        return "ROLE_DEPT_" + departmentRoleType;
    }

    private String resolveDepartmentRoleName(String roleCode, boolean isEn) {
        String roleType = resolveDepartmentRoleType(roleCode);
        if ("CS".equals(roleType)) return isEn ? "Department CS baseline" : "부서 CS 기본권한";
        if ("OPS".equals(roleType) || "OPERATION".equals(roleType)) return isEn ? "Department operation baseline" : "부서 운영 기본권한";
        if ("ESG".equals(roleType) || "SUSTAINABILITY".equals(roleType)) return isEn ? "Department sustainability baseline" : "부서 탄소/ESG 기본권한";
        if ("PROD".equals(roleType) || "PRODUCTION".equals(roleType)) return isEn ? "Department production baseline" : "부서 생산 기본권한";
        if ("PROC".equals(roleType) || "PROCUREMENT".equals(roleType)) return isEn ? "Department procurement baseline" : "부서 구매 기본권한";
        if ("QUAL".equals(roleType) || "QUALITY".equals(roleType)) return isEn ? "Department quality baseline" : "부서 품질 기본권한";
        if ("SALE".equals(roleType) || "SALES".equals(roleType)) return isEn ? "Department sales baseline" : "부서 영업 기본권한";
        if ("MGMT".equals(roleType) || "MANAGEMENT".equals(roleType)) return isEn ? "Department management baseline" : "부서 경영지원 기본권한";
        return isEn ? "Needs review" : "검토 필요";
    }

    private String resolveDepartmentRoleDescription(String roleCode, boolean isEn) {
        String roleType = resolveDepartmentRoleType(roleCode);
        if ("CS".equals(roleType)) return isEn ? "Baseline authority for customer support departments." : "CS부서 기본 권한 베이스라인";
        if ("OPS".equals(roleType) || "OPERATION".equals(roleType)) return isEn ? "Baseline authority for operations and technical departments." : "운영/기술 부서 기본 권한 베이스라인";
        if ("ESG".equals(roleType) || "SUSTAINABILITY".equals(roleType)) return isEn ? "Baseline authority for carbon, ESG, and sustainability departments." : "탄소/ESG/지속가능경영 부서 기본 권한 베이스라인";
        if ("PROD".equals(roleType) || "PRODUCTION".equals(roleType)) return isEn ? "Baseline authority for production and manufacturing departments." : "생산/공정 부서 기본 권한 베이스라인";
        if ("PROC".equals(roleType) || "PROCUREMENT".equals(roleType)) return isEn ? "Baseline authority for procurement and SCM departments." : "구매/SCM 부서 기본 권한 베이스라인";
        if ("QUAL".equals(roleType) || "QUALITY".equals(roleType)) return isEn ? "Baseline authority for quality, certification, and audit departments." : "품질/인증/심사 부서 기본 권한 베이스라인";
        if ("SALE".equals(roleType) || "SALES".equals(roleType)) return isEn ? "Baseline authority for sales and account management departments." : "영업/고객사 관리 부서 기본 권한 베이스라인";
        if ("MGMT".equals(roleType) || "MANAGEMENT".equals(roleType)) return isEn ? "Baseline authority for management support, finance, and HR departments." : "경영지원/재무/인사 부서 기본 권한 베이스라인";
        return isEn ? "Department role needs review." : "회사/부서 기준 검토가 필요한 권한입니다.";
    }

    private String resolveDepartmentRoleTypeFromDeptName(String companyName, String deptName) {
        String searchText = (safeString(companyName) + " " + safeString(deptName)).toUpperCase(Locale.ROOT);
        if (containsAny(searchText, "탄소", "ESG", "환경", "지속가능", "NETZERO", "SUSTAIN")) return "ESG";
        if (containsAny(searchText, "생산", "제조", "공정", "설비", "PLANT", "PRODUCTION", "MANUFACTUR", "FACTORY")) return "PROD";
        if (containsAny(searchText, "구매", "자재", "조달", "SCM", "PROCUREMENT", "PURCHASE", "MATERIAL")) return "PROC";
        if (containsAny(searchText, "품질", "QA", "QC", "인증", "심사", "QUALITY", "AUDIT", "CERT")) return "QUAL";
        if (containsAny(searchText, "영업", "마케팅", "사업", "SALES", "ACCOUNT", "BIZDEV", "BUSINESS")) return "SALE";
        if (containsAny(searchText, "고객", "문의", "CS", "VOC", "SUPPORT", "HELPDESK")) return "CS";
        if (containsAny(searchText, "운영", "기술", "개발", "IT", "시스템", "플랫폼", "INFRA", "DEVOPS", "ENGINEER")) return "OPS";
        if (containsAny(searchText, "경영", "지원", "재무", "회계", "인사", "총무", "HR", "FINANCE", "ACCOUNTING", "MANAGEMENT")) return "MGMT";
        return "UNKNOWN";
    }

    private String resolveDepartmentRoleType(String roleCode) {
        String normalizedRoleCode = safeString(roleCode).toUpperCase(Locale.ROOT);
        if (normalizedRoleCode.startsWith("ROLE_DEPT_I")) {
            int lastUnderscore = normalizedRoleCode.lastIndexOf('_');
            if (lastUnderscore > "ROLE_DEPT_I".length()) {
                return normalizedRoleCode.substring(lastUnderscore + 1);
            }
        }
        if (normalizedRoleCode.startsWith("ROLE_DEPT_")) {
            return normalizedRoleCode.substring("ROLE_DEPT_".length());
        }
        return "UNKNOWN";
    }

    private boolean isUnknownDepartmentRole(String roleCode) {
        return "UNKNOWN".equals(resolveDepartmentRoleType(roleCode));
    }

    private boolean containsAny(String source, String... keywords) {
        if (source == null || source.isEmpty() || keywords == null) {
            return false;
        }
        for (String keyword : keywords) {
            String normalizedKeyword = safeString(keyword).toUpperCase(Locale.ROOT);
            if (!normalizedKeyword.isEmpty() && source.contains(normalizedKeyword)) {
                return true;
            }
        }
        return false;
    }

    private Map<String, String> assignmentAuthority(String title, String description) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("title", title);
        row.put("description", description);
        return row;
    }

    private Map<String, String> roleCategory(String title, String description) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("title", title);
        row.put("description", description);
        return row;
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }

    private boolean isWebmaster(String userId) {
        return "webmaster".equalsIgnoreCase(safeString(userId));
    }

    private Map<String, String> buildAdminRoleChangeHistoryRow(AuditEventRecordVO item, boolean isEn) {
        Map<String, Object> beforeMap = parseAuditJson(item.getBeforeSummaryJson());
        Map<String, Object> afterMap = parseAuditJson(item.getAfterSummaryJson());
        Map<String, String> row = new LinkedHashMap<>();
        row.put("changedAt", safeString(item.getCreatedAt()));
        row.put("changedBy", safeString(item.getActorId()));
        row.put("targetUserId", firstNonEmpty(
                safeString((String) afterMap.get("emplyrId")),
                safeString((String) beforeMap.get("emplyrId")),
                safeString(item.getEntityId())));
        row.put("beforeAuthorCode", safeString((String) beforeMap.get("beforeAuthorCode")));
        row.put("beforeAuthorName", safeString((String) beforeMap.get("beforeAuthorName")));
        row.put("afterAuthorCode", safeString((String) afterMap.get("afterAuthorCode")));
        row.put("afterAuthorName", safeString((String) afterMap.get("afterAuthorName")));
        row.put("resultStatus", safeString(item.getResultStatus()).isEmpty()
                ? (isEn ? "SUCCESS" : "성공")
                : safeString(item.getResultStatus()));
        return row;
    }

    private Map<String, Object> parseAuditJson(String json) {
        String normalized = safeString(json);
        if (normalized.isEmpty()) {
            return Collections.emptyMap();
        }
        try {
            return objectMapper.readValue(normalized, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse audit summary json.", e);
            return Collections.emptyMap();
        }
    }

    private String firstNonEmpty(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            String normalized = safeString(value);
            if (!normalized.isEmpty()) {
                return normalized;
            }
        }
        return "";
    }

    public static final class AuthGroupScopeContext {
        private List<Map<String, String>> companyOptions = Collections.emptyList();
        private String selectedInsttId = "";
        private List<Map<String, String>> departmentRows = Collections.emptyList();
        private List<Map<String, String>> departmentRoleSummaries = Collections.emptyList();
        private List<UserAuthorityTargetVO> userAuthorityTargets = Collections.emptyList();
        private List<AuthorInfoVO> referenceAuthorGroups = Collections.emptyList();
        private String userSearchKeyword = "";
        private String errorMessage = "";

        static AuthGroupScopeContext empty() {
            return new AuthGroupScopeContext();
        }

        public List<Map<String, String>> getCompanyOptions() { return companyOptions; }
        void setCompanyOptions(List<Map<String, String>> companyOptions) { this.companyOptions = companyOptions == null ? Collections.emptyList() : companyOptions; }
        public String getSelectedInsttId() { return selectedInsttId; }
        void setSelectedInsttId(String selectedInsttId) { this.selectedInsttId = selectedInsttId == null ? "" : selectedInsttId; }
        public List<Map<String, String>> getDepartmentRows() { return departmentRows; }
        void setDepartmentRows(List<Map<String, String>> departmentRows) { this.departmentRows = departmentRows == null ? Collections.emptyList() : departmentRows; }
        public List<Map<String, String>> getDepartmentRoleSummaries() { return departmentRoleSummaries; }
        void setDepartmentRoleSummaries(List<Map<String, String>> departmentRoleSummaries) { this.departmentRoleSummaries = departmentRoleSummaries == null ? Collections.emptyList() : departmentRoleSummaries; }
        public List<UserAuthorityTargetVO> getUserAuthorityTargets() { return userAuthorityTargets; }
        void setUserAuthorityTargets(List<UserAuthorityTargetVO> userAuthorityTargets) { this.userAuthorityTargets = userAuthorityTargets == null ? Collections.emptyList() : userAuthorityTargets; }
        public List<AuthorInfoVO> getReferenceAuthorGroups() { return referenceAuthorGroups; }
        void setReferenceAuthorGroups(List<AuthorInfoVO> referenceAuthorGroups) { this.referenceAuthorGroups = referenceAuthorGroups == null ? Collections.emptyList() : referenceAuthorGroups; }
        public String getUserSearchKeyword() { return userSearchKeyword; }
        void setUserSearchKeyword(String userSearchKeyword) { this.userSearchKeyword = userSearchKeyword == null ? "" : userSearchKeyword; }
        public String getErrorMessage() { return errorMessage; }
        void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage == null ? "" : errorMessage; }
    }
}
