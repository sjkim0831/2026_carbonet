package egovframework.com.feature.admin.service;

import egovframework.com.common.logging.RequestExecutionLogVO;
import egovframework.com.feature.admin.model.vo.EmissionResultFilterSnapshot;
import egovframework.com.feature.admin.model.vo.FeatureCatalogSectionVO;
import egovframework.com.feature.admin.model.vo.FeatureCatalogSummarySnapshot;
import egovframework.com.feature.admin.model.vo.SecurityAuditSnapshot;

import java.util.List;
import java.util.Map;

public interface AdminSummaryService {

    EmissionResultFilterSnapshot buildEmissionResultFilterSnapshot(boolean isEn,
            String keyword,
            String normalizedResultStatus,
            String normalizedVerificationStatus);

    FeatureCatalogSummarySnapshot summarizeFeatureCatalog(List<FeatureCatalogSectionVO> featureSections);

    List<Map<String, String>> getIpWhitelistSummary(boolean isEn);

    List<Map<String, String>> getSecurityPolicySummary(boolean isEn);

    List<Map<String, String>> getSecurityMonitoringCards(boolean isEn);

    List<Map<String, String>> getSecurityMonitoringTargets(boolean isEn);

    List<Map<String, String>> getSecurityMonitoringIps(boolean isEn);

    List<Map<String, String>> getSecurityMonitoringEvents(boolean isEn);

    List<Map<String, String>> mergeSecurityMonitoringEventState(List<Map<String, String>> rows, boolean isEn);

    List<Map<String, String>> getSecurityMonitoringActivityRows(boolean isEn);

    List<Map<String, String>> getSecurityMonitoringBlockCandidateRows(boolean isEn);

    List<Map<String, String>> getSecurityHistoryActionRows(boolean isEn);

    List<Map<String, String>> getBlocklistSummary(boolean isEn);

    List<Map<String, String>> getBlocklistRows(boolean isEn);

    List<Map<String, String>> getBlocklistReleaseQueue(boolean isEn);

    List<Map<String, String>> getBlocklistReleaseHistory(boolean isEn);

    SecurityAuditSnapshot loadSecurityAuditSnapshot();

    List<Map<String, String>> getSecurityAuditSummary(SecurityAuditSnapshot auditSnapshot, boolean isEn);

    List<Map<String, String>> buildSecurityAuditRows(List<RequestExecutionLogVO> auditLogs, boolean isEn);

    List<Map<String, String>> getSchedulerSummary(boolean isEn);

    Map<String, Object> buildMenuPermissionDiagnosticSummary(boolean isEn);

    Map<String, Object> runMenuPermissionAutoCleanup(String actorUserId, boolean isEn, List<String> targetMenuUrls);

    Map<String, Object> updateSecurityInsightState(String actorUserId, boolean isEn, Map<String, Object> payload);

    Map<String, Object> updateSecurityMonitoringState(String actorUserId, boolean isEn, Map<String, Object> payload);

    Map<String, Object> registerSecurityMonitoringBlockCandidate(String actorUserId, boolean isEn, Map<String, Object> payload);

    Map<String, Object> updateSecurityMonitoringBlockCandidate(String actorUserId, boolean isEn, Map<String, Object> payload);

    Map<String, Object> dispatchSecurityMonitoringNotification(String actorUserId, boolean isEn, Map<String, Object> payload);

    Map<String, Object> executeSecurityHistoryAction(String actorUserId, boolean isEn, Map<String, Object> payload);

    Map<String, Object> clearSecurityInsightSuppressions(String actorUserId, boolean isEn);

    Map<String, Object> runSecurityInsightAutoFix(String actorUserId, boolean isEn, Map<String, Object> payload);

    Map<String, Object> runSecurityInsightBulkAutoFix(String actorUserId, boolean isEn, List<Map<String, Object>> findings);

    Map<String, Object> saveSecurityInsightNotificationConfig(String actorUserId, boolean isEn, Map<String, Object> payload);

    Map<String, Object> runSecurityInsightRollback(String actorUserId, boolean isEn, Map<String, Object> payload);

    Map<String, Object> dispatchSecurityInsightNotifications(String actorUserId, boolean isEn, Map<String, Object> payload);

    Map<String, Object> expireSecurityInsightSuppressions(boolean isEn);

    Map<String, Object> runScheduledSecurityInsightDigest(boolean isEn);
}
