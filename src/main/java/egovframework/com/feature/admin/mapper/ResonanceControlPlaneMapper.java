package egovframework.com.feature.admin.mapper;

import egovframework.com.common.mapper.support.BaseMapperSupport;
import org.springframework.stereotype.Repository;

import java.util.Map;

@Repository("resonanceControlPlaneMapper")
public class ResonanceControlPlaneMapper extends BaseMapperSupport {

    public void insertModuleBindingPreview(Map<String, Object> params) {
        insert("ResonanceControlPlaneMapper.insertModuleBindingPreview", params);
    }

    public void insertParityCompareRun(Map<String, Object> params) {
        insert("ResonanceControlPlaneMapper.insertParityCompareRun", params);
    }

    public void insertModuleBindingResult(Map<String, Object> params) {
        insert("ResonanceControlPlaneMapper.insertModuleBindingResult", params);
    }

    public Map<String, Object> selectModuleBindingResultByPreviewId(String moduleBindingPreviewId) {
        return selectOne("ResonanceControlPlaneMapper.selectModuleBindingResultByPreviewId", moduleBindingPreviewId);
    }

    public Map<String, Object> selectModuleBindingPreviewById(String moduleBindingPreviewId) {
        return selectOne("ResonanceControlPlaneMapper.selectModuleBindingPreviewById", moduleBindingPreviewId);
    }

    public void insertRepairSession(Map<String, Object> params) {
        insert("ResonanceControlPlaneMapper.insertRepairSession", params);
    }

    public void insertRepairApplyRun(Map<String, Object> params) {
        insert("ResonanceControlPlaneMapper.insertRepairApplyRun", params);
    }

    public void insertVerificationRun(Map<String, Object> params) {
        insert("ResonanceControlPlaneMapper.insertVerificationRun", params);
    }
}
