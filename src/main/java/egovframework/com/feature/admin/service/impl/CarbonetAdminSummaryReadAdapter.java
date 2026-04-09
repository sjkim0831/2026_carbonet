package egovframework.com.feature.admin.service.impl;

import egovframework.com.common.logging.RequestExecutionLogVO;
import egovframework.com.feature.admin.model.vo.EmissionResultFilterSnapshot;
import egovframework.com.feature.admin.model.vo.FeatureCatalogSectionVO;
import egovframework.com.feature.admin.model.vo.FeatureCatalogSummarySnapshot;
import egovframework.com.feature.admin.model.vo.SecurityAuditSnapshot;
import egovframework.com.platform.read.AdminSummaryReadPort;

import java.util.List;
import java.util.Map;

public class CarbonetAdminSummaryReadAdapter implements AdminSummaryReadPort {

    private final AdminSummaryReadPort adminSummaryReadPort;

    public CarbonetAdminSummaryReadAdapter(AdminSummaryReadPort adminSummaryReadPort) {
        this.adminSummaryReadPort = adminSummaryReadPort;
    }

    @Override
    public FeatureCatalogSummarySnapshot summarizeFeatureCatalog(List<FeatureCatalogSectionVO> featureSections) {
        return adminSummaryReadPort.summarizeFeatureCatalog(featureSections);
    }

    @Override
    public EmissionResultFilterSnapshot buildEmissionResultFilterSnapshot(boolean isEn, String keyword, String normalizedResultStatus, String normalizedVerificationStatus) {
        return adminSummaryReadPort.buildEmissionResultFilterSnapshot(isEn, keyword, normalizedResultStatus, normalizedVerificationStatus);
    }

    @Override
    public List<Map<String, String>> getIpWhitelistSummary(boolean isEn) {
        return adminSummaryReadPort.getIpWhitelistSummary(isEn);
    }

    @Override
    public List<Map<String, String>> getSecurityPolicySummary(boolean isEn) {
        return adminSummaryReadPort.getSecurityPolicySummary(isEn);
    }

    @Override
    public List<Map<String, String>> getSecurityMonitoringCards(boolean isEn) {
        return adminSummaryReadPort.getSecurityMonitoringCards(isEn);
    }

    @Override
    public List<Map<String, String>> getSecurityMonitoringTargets(boolean isEn) {
        return adminSummaryReadPort.getSecurityMonitoringTargets(isEn);
    }

    @Override
    public List<Map<String, String>> getSecurityMonitoringIps(boolean isEn) {
        return adminSummaryReadPort.getSecurityMonitoringIps(isEn);
    }

    @Override
    public List<Map<String, String>> getSecurityMonitoringEvents(boolean isEn) {
        return adminSummaryReadPort.getSecurityMonitoringEvents(isEn);
    }

    @Override
    public List<Map<String, String>> mergeSecurityMonitoringEventState(List<Map<String, String>> rows, boolean isEn) {
        return adminSummaryReadPort.mergeSecurityMonitoringEventState(rows, isEn);
    }

    @Override
    public List<Map<String, String>> getSecurityMonitoringActivityRows(boolean isEn) {
        return adminSummaryReadPort.getSecurityMonitoringActivityRows(isEn);
    }

    @Override
    public List<Map<String, String>> getSecurityMonitoringBlockCandidateRows(boolean isEn) {
        return adminSummaryReadPort.getSecurityMonitoringBlockCandidateRows(isEn);
    }

    @Override
    public List<Map<String, String>> getSecurityHistoryActionRows(boolean isEn) {
        return adminSummaryReadPort.getSecurityHistoryActionRows(isEn);
    }

    @Override
    public List<Map<String, String>> getBlocklistSummary(boolean isEn) {
        return adminSummaryReadPort.getBlocklistSummary(isEn);
    }

    @Override
    public List<Map<String, String>> getBlocklistRows(boolean isEn) {
        return adminSummaryReadPort.getBlocklistRows(isEn);
    }

    @Override
    public List<Map<String, String>> getBlocklistReleaseQueue(boolean isEn) {
        return adminSummaryReadPort.getBlocklistReleaseQueue(isEn);
    }

    @Override
    public List<Map<String, String>> getBlocklistReleaseHistory(boolean isEn) {
        return adminSummaryReadPort.getBlocklistReleaseHistory(isEn);
    }

    @Override
    public SecurityAuditSnapshot loadSecurityAuditSnapshot() {
        return adminSummaryReadPort.loadSecurityAuditSnapshot();
    }

    @Override
    public List<Map<String, String>> getSecurityAuditSummary(SecurityAuditSnapshot auditSnapshot, boolean isEn) {
        return adminSummaryReadPort.getSecurityAuditSummary(auditSnapshot, isEn);
    }

    @Override
    public List<Map<String, String>> buildSecurityAuditRows(List<RequestExecutionLogVO> auditLogs, boolean isEn) {
        return adminSummaryReadPort.buildSecurityAuditRows(auditLogs, isEn);
    }

    @Override
    public List<Map<String, String>> getSchedulerSummary(boolean isEn) {
        return adminSummaryReadPort.getSchedulerSummary(isEn);
    }

    @Override
    public Map<String, Object> buildMenuPermissionDiagnosticSummary(boolean isEn) {
        return adminSummaryReadPort.buildMenuPermissionDiagnosticSummary(isEn);
    }
}
