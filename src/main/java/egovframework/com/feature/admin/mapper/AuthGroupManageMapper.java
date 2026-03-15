package egovframework.com.feature.admin.mapper;

import egovframework.com.common.mapper.support.BaseMapperSupport;
import egovframework.com.feature.admin.model.vo.AdminRoleAssignmentVO;
import egovframework.com.feature.admin.model.vo.AuthorInfoVO;
import egovframework.com.feature.admin.model.vo.DepartmentRoleMappingVO;
import egovframework.com.feature.admin.model.vo.FeatureAssignmentStatVO;
import egovframework.com.feature.admin.model.vo.FeatureCatalogItemVO;
import egovframework.com.feature.admin.model.vo.FeatureReferenceCountVO;
import egovframework.com.feature.admin.model.vo.UserAuthorityTargetVO;
import egovframework.com.feature.admin.model.vo.UserFeatureOverrideVO;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository("authGroupManageMapper")
public class AuthGroupManageMapper extends BaseMapperSupport {

    public List<AuthorInfoVO> selectAuthorList() {
        return selectList("AuthGroupManageMapper.selectAuthorList");
    }

    public List<FeatureCatalogItemVO> selectFeatureCatalog() {
        return selectList("AuthGroupManageMapper.selectFeatureCatalog");
    }

    public List<FeatureAssignmentStatVO> selectFeatureAssignmentStats() {
        return selectList("AuthGroupManageMapper.selectFeatureAssignmentStats");
    }

    public List<String> selectAuthorFeatureCodes(String authorCode) {
        return selectList("AuthGroupManageMapper.selectAuthorFeatureCodes", authorCode);
    }

    public int countAuthorCode(String authorCode) {
        Integer count = selectOne("AuthGroupManageMapper.countAuthorCode", authorCode);
        return count == null ? 0 : count;
    }

    public void insertAuthor(AuthorInfoVO authorInfoVO) {
        insert("AuthGroupManageMapper.insertAuthor", authorInfoVO);
    }

    public void deleteAuthorFeatureRelations(String authorCode) {
        delete("AuthGroupManageMapper.deleteAuthorFeatureRelations", authorCode);
    }

    public void insertAuthorFeatureRelation(Map<String, String> params) {
        insert("AuthGroupManageMapper.insertAuthorFeatureRelation", params);
    }

    public String selectAuthorCodeByUserId(String userId) {
        return selectOne("AuthGroupManageMapper.selectAuthorCodeByUserId", userId);
    }

    public String selectRequiredViewFeatureCodeByMenuUrl(String menuUrl) {
        return selectOne("AuthGroupManageMapper.selectRequiredViewFeatureCodeByMenuUrl", menuUrl);
    }

    public String selectMenuCodeByMenuUrl(String menuUrl) {
        return selectOne("AuthGroupManageMapper.selectMenuCodeByMenuUrl", menuUrl);
    }

    public List<String> selectFeatureCodesByMenuCode(String menuCode) {
        return selectList("AuthGroupManageMapper.selectFeatureCodesByMenuCode", menuCode);
    }

    public int countAuthorFeaturePermission(String authorCode, String featureCode) {
        Map<String, String> params = new java.util.HashMap<>();
        params.put("authorCode", authorCode);
        params.put("featureCode", featureCode);
        Integer count = selectOne("AuthGroupManageMapper.countAuthorFeaturePermission", params);
        return count == null ? 0 : count;
    }

    public int countAuthorFeatureRelationsByFeatureCode(String featureCode) {
        Integer count = selectOne("AuthGroupManageMapper.countAuthorFeatureRelationsByFeatureCode", featureCode);
        return count == null ? 0 : count;
    }

    public int countUserFeatureOverridesByFeatureCode(String featureCode) {
        Integer count = selectOne("AuthGroupManageMapper.countUserFeatureOverridesByFeatureCode", featureCode);
        return count == null ? 0 : count;
    }

    public List<FeatureReferenceCountVO> selectAuthorFeatureRelationCounts(List<String> featureCodes) {
        return selectList("AuthGroupManageMapper.selectAuthorFeatureRelationCounts", featureCodes);
    }

    public List<FeatureReferenceCountVO> selectUserFeatureOverrideCounts(List<String> featureCodes) {
        return selectList("AuthGroupManageMapper.selectUserFeatureOverrideCounts", featureCodes);
    }

    public void deleteAuthorFeatureRelationsByFeatureCode(String featureCode) {
        delete("AuthGroupManageMapper.deleteAuthorFeatureRelationsByFeatureCode", featureCode);
    }

    public void deleteAuthorFeatureRelation(String authorCode, String featureCode) {
        Map<String, String> params = new java.util.HashMap<>();
        params.put("authorCode", authorCode);
        params.put("featureCode", featureCode);
        delete("AuthGroupManageMapper.deleteAuthorFeatureRelation", params);
    }

    public void deleteUserFeatureOverridesByFeatureCode(String featureCode) {
        delete("AuthGroupManageMapper.deleteUserFeatureOverridesByFeatureCode", featureCode);
    }

    public List<UserFeatureOverrideVO> selectUserFeatureOverrides(String scrtyDtrmnTrgetId) {
        return selectList("AuthGroupManageMapper.selectUserFeatureOverrides", scrtyDtrmnTrgetId);
    }

    public List<AdminRoleAssignmentVO> selectAdminRoleAssignments() {
        return selectList("AuthGroupManageMapper.selectAdminRoleAssignments");
    }

    public List<DepartmentRoleMappingVO> selectDepartmentRoleMappings() {
        return selectList("AuthGroupManageMapper.selectDepartmentRoleMappings");
    }

    public List<UserAuthorityTargetVO> selectUserAuthorityTargets(Map<String, String> params) {
        return selectList("AuthGroupManageMapper.selectUserAuthorityTargets", params);
    }

    public String selectEssentialIdByEmplyrId(String emplyrId) {
        return selectOne("AuthGroupManageMapper.selectEssentialIdByEmplyrId", emplyrId);
    }

    public String selectEnterpriseAuthorCodeByUserId(String entrprsMberId) {
        return selectOne("AuthGroupManageMapper.selectEnterpriseAuthorCodeByUserId", entrprsMberId);
    }

    public String selectEnterpriseEssentialIdByUserId(String entrprsMberId) {
        return selectOne("AuthGroupManageMapper.selectEnterpriseEssentialIdByUserId", entrprsMberId);
    }

    public String selectEnterpriseInsttIdByUserId(String entrprsMberId) {
        return selectOne("AuthGroupManageMapper.selectEnterpriseInsttIdByUserId", entrprsMberId);
    }

    public int countEmployrSecurityMapping(String esntlId) {
        Integer count = selectOne("AuthGroupManageMapper.countEmployrSecurityMapping", esntlId);
        return count == null ? 0 : count;
    }

    public void updateEmployrSecurityAuthorCode(Map<String, String> params) {
        update("AuthGroupManageMapper.updateEmployrSecurityAuthorCode", params);
    }

    public void insertEmployrSecurityMapping(Map<String, String> params) {
        insert("AuthGroupManageMapper.insertEmployrSecurityMapping", params);
    }

    public void insertEnterpriseSecurityMapping(Map<String, String> params) {
        insert("AuthGroupManageMapper.insertEnterpriseSecurityMapping", params);
    }

    public void deleteUserFeatureOverrides(String scrtyDtrmnTrgetId) {
        delete("AuthGroupManageMapper.deleteUserFeatureOverrides", scrtyDtrmnTrgetId);
    }

    public void insertUserFeatureOverride(Map<String, String> params) {
        insert("AuthGroupManageMapper.insertUserFeatureOverride", params);
    }

    public int countDepartmentRoleMapping(Map<String, String> params) {
        Integer count = selectOne("AuthGroupManageMapper.countDepartmentRoleMapping", params);
        return count == null ? 0 : count;
    }

    public void updateDepartmentRoleMapping(Map<String, String> params) {
        update("AuthGroupManageMapper.updateDepartmentRoleMapping", params);
    }

    public void insertDepartmentRoleMapping(Map<String, String> params) {
        insert("AuthGroupManageMapper.insertDepartmentRoleMapping", params);
    }
}
