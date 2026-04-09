package egovframework.com.platform.versioncontrol.service;

import egovframework.com.platform.versioncontrol.model.ProjectApplyUpgradeRequest;
import egovframework.com.platform.versioncontrol.model.ProjectRollbackRequest;
import egovframework.com.platform.versioncontrol.model.ProjectUpgradeImpactRequest;

import java.util.Map;

public interface ProjectVersionManagementService {

    Map<String, Object> getOverview(String projectId) throws Exception;

    Map<String, Object> getAdapterHistory(String projectId, int page, int pageSize) throws Exception;

    Map<String, Object> getReleaseUnits(String projectId, int page, int pageSize) throws Exception;

    Map<String, Object> getServerDeployState(String projectId) throws Exception;

    Map<String, Object> getCandidateArtifacts(String projectId, int page, int pageSize) throws Exception;

    Map<String, Object> analyzeUpgradeImpact(ProjectUpgradeImpactRequest request) throws Exception;

    Map<String, Object> applyUpgrade(ProjectApplyUpgradeRequest request) throws Exception;

    Map<String, Object> rollbackProject(ProjectRollbackRequest request) throws Exception;
}
