package egovframework.com.feature.admin.service.impl;

import egovframework.com.feature.admin.mapper.AuthGroupManageMapper;
import egovframework.com.feature.admin.model.vo.AdminRoleAssignmentVO;
import egovframework.com.feature.admin.model.vo.AuthorInfoVO;
import egovframework.com.feature.admin.model.vo.DepartmentRoleMappingVO;
import egovframework.com.feature.admin.model.vo.FeatureCatalogItemVO;
import egovframework.com.feature.admin.model.vo.UserAuthorityTargetVO;
import egovframework.com.feature.admin.model.vo.UserFeatureOverrideVO;
import egovframework.com.feature.admin.service.AuthGroupManageService;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service("authGroupManageService")
public class AuthGroupManageServiceImpl extends EgovAbstractServiceImpl implements AuthGroupManageService {

    private final AuthGroupManageMapper authGroupManageMapper;

    public AuthGroupManageServiceImpl(AuthGroupManageMapper authGroupManageMapper) {
        this.authGroupManageMapper = authGroupManageMapper;
    }

    @Override
    public List<AuthorInfoVO> selectAuthorList() {
        return authGroupManageMapper.selectAuthorList();
    }

    @Override
    public List<FeatureCatalogItemVO> selectFeatureCatalog() {
        return authGroupManageMapper.selectFeatureCatalog();
    }

    @Override
    public List<String> selectAuthorFeatureCodes(String authorCode) {
        return authGroupManageMapper.selectAuthorFeatureCodes(authorCode);
    }

    @Override
    public int countAuthorCode(String authorCode) {
        return authGroupManageMapper.countAuthorCode(authorCode);
    }

    @Override
    public void insertAuthor(String authorCode, String authorNm, String authorDc) {
        AuthorInfoVO vo = new AuthorInfoVO();
        vo.setAuthorCode(authorCode == null ? "" : authorCode.trim().toUpperCase(Locale.ROOT));
        vo.setAuthorNm(authorNm == null ? "" : authorNm.trim());
        vo.setAuthorDc(authorDc == null ? "" : authorDc.trim());
        vo.setAuthorCreatDe(LocalDate.now().format(DateTimeFormatter.ofPattern("MM/dd/yyyy")));
        authGroupManageMapper.insertAuthor(vo);
    }

    @Override
    public void saveAuthorFeatureRelations(String authorCode, List<String> featureCodes) {
        authGroupManageMapper.deleteAuthorFeatureRelations(authorCode);
        if (featureCodes == null || featureCodes.isEmpty()) {
            return;
        }
        for (String featureCode : featureCodes) {
            Map<String, String> params = new HashMap<>();
            params.put("authorCode", authorCode);
            params.put("featureCode", featureCode);
            authGroupManageMapper.insertAuthorFeatureRelation(params);
        }
    }

    @Override
    public String selectAuthorCodeByUserId(String userId) {
        return authGroupManageMapper.selectAuthorCodeByUserId(userId);
    }

    @Override
    public String selectRequiredViewFeatureCodeByMenuUrl(String menuUrl) {
        return authGroupManageMapper.selectRequiredViewFeatureCodeByMenuUrl(menuUrl);
    }

    @Override
    public String selectMenuCodeByMenuUrl(String menuUrl) {
        return authGroupManageMapper.selectMenuCodeByMenuUrl(menuUrl);
    }

    @Override
    public List<String> selectFeatureCodesByMenuCode(String menuCode) {
        return authGroupManageMapper.selectFeatureCodesByMenuCode(menuCode);
    }

    @Override
    public boolean hasAuthorFeaturePermission(String authorCode, String featureCode) {
        return authGroupManageMapper.countAuthorFeaturePermission(authorCode, featureCode) > 0;
    }

    @Override
    public List<UserFeatureOverrideVO> selectUserFeatureOverrides(String scrtyDtrmnTrgetId) {
        return authGroupManageMapper.selectUserFeatureOverrides(scrtyDtrmnTrgetId);
    }

    @Override
    public List<AdminRoleAssignmentVO> selectAdminRoleAssignments() {
        return authGroupManageMapper.selectAdminRoleAssignments();
    }

    @Override
    public List<DepartmentRoleMappingVO> selectDepartmentRoleMappings() {
        return authGroupManageMapper.selectDepartmentRoleMappings();
    }

    @Override
    public List<UserAuthorityTargetVO> selectUserAuthorityTargets(String insttId, String searchKeyword) {
        Map<String, String> params = new HashMap<>();
        params.put("insttId", insttId == null ? "" : insttId.trim());
        params.put("searchKeyword", searchKeyword == null ? "" : searchKeyword.trim());
        return authGroupManageMapper.selectUserAuthorityTargets(params);
    }

    @Override
    public void updateAdminRoleAssignment(String emplyrId, String authorCode) {
        String normalizedEmplyrId = emplyrId == null ? "" : emplyrId.trim();
        String normalizedAuthorCode = authorCode == null ? "" : authorCode.trim().toUpperCase(Locale.ROOT);
        if (normalizedEmplyrId.isEmpty() || normalizedAuthorCode.isEmpty()) {
            throw new IllegalArgumentException("Employee ID and author code are required.");
        }

        String esntlId = authGroupManageMapper.selectEssentialIdByEmplyrId(normalizedEmplyrId);
        if (esntlId == null || esntlId.trim().isEmpty()) {
            throw new IllegalArgumentException("Employee not found.");
        }

        Map<String, String> params = new HashMap<>();
        params.put("esntlId", esntlId.trim());
        params.put("authorCode", normalizedAuthorCode);

        if (authGroupManageMapper.countEmployrSecurityMapping(esntlId.trim()) > 0) {
            authGroupManageMapper.updateEmployrSecurityAuthorCode(params);
            return;
        }

        authGroupManageMapper.insertEmployrSecurityMapping(params);
    }

    @Override
    public String selectAdminEssentialIdByUserId(String emplyrId) {
        return authGroupManageMapper.selectEssentialIdByEmplyrId(emplyrId);
    }

    @Override
    public String selectEnterpriseInsttIdByUserId(String entrprsMberId) {
        return authGroupManageMapper.selectEnterpriseInsttIdByUserId(entrprsMberId);
    }

    @Override
    public String selectEnterpriseAuthorCodeByUserId(String entrprsMberId) {
        return authGroupManageMapper.selectEnterpriseAuthorCodeByUserId(entrprsMberId);
    }

    @Override
    public void updateEnterpriseUserRoleAssignment(String entrprsMberId, String authorCode) {
        String normalizedUserId = entrprsMberId == null ? "" : entrprsMberId.trim();
        String normalizedAuthorCode = authorCode == null ? "" : authorCode.trim().toUpperCase(Locale.ROOT);
        if (normalizedUserId.isEmpty() || normalizedAuthorCode.isEmpty()) {
            throw new IllegalArgumentException("Enterprise member ID and author code are required.");
        }

        String esntlId = authGroupManageMapper.selectEnterpriseEssentialIdByUserId(normalizedUserId);
        if (esntlId == null || esntlId.trim().isEmpty()) {
            throw new IllegalArgumentException("Enterprise member not found.");
        }

        Map<String, String> params = new HashMap<>();
        params.put("esntlId", esntlId.trim());
        params.put("authorCode", normalizedAuthorCode);

        if (authGroupManageMapper.countEmployrSecurityMapping(esntlId.trim()) > 0) {
            authGroupManageMapper.updateEmployrSecurityAuthorCode(params);
            return;
        }

        authGroupManageMapper.insertEnterpriseSecurityMapping(params);
    }

    @Override
    public void replaceUserFeatureOverrides(String scrtyDtrmnTrgetId, String mberTyCode, List<String> allowFeatureCodes,
                                            List<String> denyFeatureCodes, String actorId) {
        String normalizedTargetId = scrtyDtrmnTrgetId == null ? "" : scrtyDtrmnTrgetId.trim();
        String normalizedMemberType = mberTyCode == null ? "" : mberTyCode.trim().toUpperCase(Locale.ROOT);
        if (normalizedTargetId.isEmpty()) {
            throw new IllegalArgumentException("Security target ID is required.");
        }
        authGroupManageMapper.deleteUserFeatureOverrides(normalizedTargetId);
        insertFeatureOverrides(normalizedTargetId, normalizedMemberType, allowFeatureCodes, "A", actorId);
        insertFeatureOverrides(normalizedTargetId, normalizedMemberType, denyFeatureCodes, "D", actorId);
    }

    @Override
    public void saveDepartmentRoleMapping(String insttId, String cmpnyNm, String deptNm, String authorCode, String actorId) {
        String normalizedInsttId = insttId == null ? "" : insttId.trim();
        String normalizedCmpnyNm = cmpnyNm == null ? "" : cmpnyNm.trim();
        String normalizedDeptNm = deptNm == null ? "" : deptNm.trim();
        String normalizedAuthorCode = authorCode == null ? "" : authorCode.trim().toUpperCase(Locale.ROOT);
        String normalizedActorId = actorId == null ? "" : actorId.trim();

        if (normalizedInsttId.isEmpty() || normalizedDeptNm.isEmpty() || normalizedAuthorCode.isEmpty()) {
            throw new IllegalArgumentException("Company ID, department, and role are required.");
        }

        Map<String, String> params = new HashMap<>();
        params.put("insttId", normalizedInsttId);
        params.put("cmpnyNm", normalizedCmpnyNm);
        params.put("deptNm", normalizedDeptNm);
        params.put("authorCode", normalizedAuthorCode);
        params.put("actorId", normalizedActorId.isEmpty() ? "SYSTEM" : normalizedActorId);

        if (authGroupManageMapper.countDepartmentRoleMapping(params) > 0) {
            authGroupManageMapper.updateDepartmentRoleMapping(params);
            return;
        }

        authGroupManageMapper.insertDepartmentRoleMapping(params);
    }

    private void insertFeatureOverrides(String scrtyDtrmnTrgetId, String mberTyCode, List<String> featureCodes,
                                        String overrideType, String actorId) {
        if (featureCodes == null || featureCodes.isEmpty()) {
            return;
        }
        String normalizedActorId = actorId == null || actorId.trim().isEmpty() ? "SYSTEM" : actorId.trim();
        for (String featureCode : featureCodes) {
            String normalizedFeatureCode = featureCode == null ? "" : featureCode.trim().toUpperCase(Locale.ROOT);
            if (normalizedFeatureCode.isEmpty()) {
                continue;
            }
            Map<String, String> params = new HashMap<>();
            params.put("scrtyDtrmnTrgetId", scrtyDtrmnTrgetId);
            params.put("mberTyCode", mberTyCode);
            params.put("featureCode", normalizedFeatureCode);
            params.put("overrideType", overrideType);
            params.put("actorId", normalizedActorId);
            authGroupManageMapper.insertUserFeatureOverride(params);
        }
    }
}
