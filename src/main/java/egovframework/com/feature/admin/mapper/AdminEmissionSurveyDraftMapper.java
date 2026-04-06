package egovframework.com.feature.admin.mapper;

import egovframework.com.common.mapper.support.BaseMapperSupport;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository("adminEmissionSurveyDraftMapper")
public class AdminEmissionSurveyDraftMapper extends BaseMapperSupport {

    public int countCaseTable() {
        Integer count = selectOne("AdminEmissionSurveyDraftMapper.countCaseTable");
        return count == null ? 0 : count;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> selectCaseHeaders() {
        return (List<Map<String, Object>>) (List<?>) selectList("AdminEmissionSurveyDraftMapper.selectCaseHeaders");
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> selectCaseRows(String caseId) {
        return (List<Map<String, Object>>) (List<?>) selectList("AdminEmissionSurveyDraftMapper.selectCaseRows", caseId);
    }

    public void insertCaseHeader(Map<String, Object> params) {
        insert("AdminEmissionSurveyDraftMapper.insertCaseHeader", params);
    }

    public int updateCaseHeader(Map<String, Object> params) {
        return update("AdminEmissionSurveyDraftMapper.updateCaseHeader", params);
    }

    public void deleteCaseRows(String caseId) {
        delete("AdminEmissionSurveyDraftMapper.deleteCaseRows", caseId);
    }

    public void deleteCaseHeader(String caseId) {
        delete("AdminEmissionSurveyDraftMapper.deleteCaseHeader", caseId);
    }

    public void insertCaseRow(Map<String, Object> params) {
        insert("AdminEmissionSurveyDraftMapper.insertCaseRow", params);
    }
}
