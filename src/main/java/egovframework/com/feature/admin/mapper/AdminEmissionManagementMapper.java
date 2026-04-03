package egovframework.com.feature.admin.mapper;

import egovframework.com.common.mapper.support.BaseMapperSupport;
import egovframework.com.feature.admin.model.vo.EmissionCategoryVO;
import egovframework.com.feature.admin.model.vo.EmissionFactorVO;
import egovframework.com.feature.admin.model.vo.EmissionVariableDefinitionVO;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository("adminEmissionManagementMapper")
public class AdminEmissionManagementMapper extends BaseMapperSupport {

    public List<EmissionCategoryVO> selectEmissionCategories(String searchKeyword) {
        return selectList("AdminEmissionManagementMapper.selectEmissionCategories", searchKeyword);
    }

    public EmissionCategoryVO selectEmissionCategory(Long categoryId) {
        return selectOne("AdminEmissionManagementMapper.selectEmissionCategory", categoryId);
    }

    public List<Integer> selectEmissionTierList(Long categoryId) {
        return selectList("AdminEmissionManagementMapper.selectEmissionTierList", categoryId);
    }

    public List<EmissionVariableDefinitionVO> selectEmissionVariableDefinitions(Map<String, Object> params) {
        return selectList("AdminEmissionManagementMapper.selectEmissionVariableDefinitions", params);
    }

    public List<EmissionFactorVO> selectEmissionFactors(Map<String, Object> params) {
        return selectList("AdminEmissionManagementMapper.selectEmissionFactors", params);
    }

    public void insertEmissionInputSession(Map<String, Object> params) {
        insert("AdminEmissionManagementMapper.insertEmissionInputSession", params);
    }

    public void insertEmissionInputValue(Map<String, Object> params) {
        insert("AdminEmissionManagementMapper.insertEmissionInputValue", params);
    }

    public Map<String, Object> selectEmissionInputSession(Long sessionId) {
        return selectOne("AdminEmissionManagementMapper.selectEmissionInputSession", sessionId);
    }

    public List<Map<String, Object>> selectEmissionInputValues(Long sessionId) {
        return selectList("AdminEmissionManagementMapper.selectEmissionInputValues", sessionId);
    }

    public void insertEmissionCalcResult(Map<String, Object> params) {
        insert("AdminEmissionManagementMapper.insertEmissionCalcResult", params);
    }

    public Map<String, Object> selectLatestEmissionCalcResult(Long sessionId) {
        return selectOne("AdminEmissionManagementMapper.selectLatestEmissionCalcResult", sessionId);
    }

    public List<Map<String, Object>> selectLatestEmissionCalcResultsByScope() {
        return selectList("AdminEmissionManagementMapper.selectLatestEmissionCalcResultsByScope");
    }
}
