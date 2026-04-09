package egovframework.com.platform.versioncontrol.mapper;

import egovframework.com.common.mapper.support.BaseMapperSupport;
import org.springframework.stereotype.Repository;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository("projectVersionManagementMapper")
public class ProjectVersionManagementMapper extends BaseMapperSupport {

    public int countArtifactVersionRegistry() {
        Integer count = selectOne("ProjectVersionManagementMapper.countArtifactVersionRegistry");
        return count == null ? 0 : count.intValue();
    }

    public int countProjectArtifactInstall() {
        Integer count = selectOne("ProjectVersionManagementMapper.countProjectArtifactInstall");
        return count == null ? 0 : count.intValue();
    }

    public int countAdapterChangeLog() {
        Integer count = selectOne("ProjectVersionManagementMapper.countAdapterChangeLog");
        return count == null ? 0 : count.intValue();
    }

    public int countReleaseUnitRegistry() {
        Integer count = selectOne("ProjectVersionManagementMapper.countReleaseUnitRegistry");
        return count == null ? 0 : count.intValue();
    }

    public int countServerDeploymentState() {
        Integer count = selectOne("ProjectVersionManagementMapper.countServerDeploymentState");
        return count == null ? 0 : count.intValue();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> selectProjectRegistry(String projectId) {
        Map<String, Object> row = selectOne("ProjectVersionManagementMapper.selectProjectRegistry", projectId);
        return row == null ? null : new LinkedHashMap<String, Object>(row);
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> selectInstalledArtifacts(String projectId) {
        return (List<Map<String, Object>>) (List<?>) selectList("ProjectVersionManagementMapper.selectInstalledArtifacts", projectId);
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> selectAdapterHistory(String projectId) {
        return (List<Map<String, Object>>) (List<?>) selectList("ProjectVersionManagementMapper.selectAdapterHistory", projectId);
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> selectReleaseUnits(String projectId) {
        return (List<Map<String, Object>>) (List<?>) selectList("ProjectVersionManagementMapper.selectReleaseUnits", projectId);
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> selectServerDeploymentState(String projectId) {
        return (List<Map<String, Object>>) (List<?>) selectList("ProjectVersionManagementMapper.selectServerDeploymentState", projectId);
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> selectCandidateArtifacts(Map<String, Object> params) {
        return (List<Map<String, Object>>) (List<?>) selectList("ProjectVersionManagementMapper.selectCandidateArtifacts", params);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> selectReleaseUnitById(String releaseUnitId) {
        Map<String, Object> row = selectOne("ProjectVersionManagementMapper.selectReleaseUnitById", releaseUnitId);
        return row == null ? null : new LinkedHashMap<String, Object>(row);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> selectArtifactVersionByKey(Map<String, Object> params) {
        Map<String, Object> row = selectOne("ProjectVersionManagementMapper.selectArtifactVersionByKey", params);
        return row == null ? null : new LinkedHashMap<String, Object>(row);
    }

    public int deactivateProjectArtifactInstalls(String projectId) {
        return update("ProjectVersionManagementMapper.deactivateProjectArtifactInstalls", projectId);
    }

    public void insertReleaseUnitRegistry(Map<String, Object> params) {
        insert("ProjectVersionManagementMapper.insertReleaseUnitRegistry", params);
    }

    public void insertProjectArtifactInstall(Map<String, Object> params) {
        insert("ProjectVersionManagementMapper.insertProjectArtifactInstall", params);
    }

    public void insertAdapterChangeLog(Map<String, Object> params) {
        insert("ProjectVersionManagementMapper.insertAdapterChangeLog", params);
    }

    public void insertServerDeploymentState(Map<String, Object> params) {
        insert("ProjectVersionManagementMapper.insertServerDeploymentState", params);
    }
}
