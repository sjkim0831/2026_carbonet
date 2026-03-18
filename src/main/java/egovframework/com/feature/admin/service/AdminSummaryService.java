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

    List<Map<String, String>> getBlocklistSummary(boolean isEn);

    SecurityAuditSnapshot loadSecurityAuditSnapshot();

    List<Map<String, String>> getSecurityAuditSummary(SecurityAuditSnapshot auditSnapshot, boolean isEn);

    List<Map<String, String>> buildSecurityAuditRows(List<RequestExecutionLogVO> auditLogs, boolean isEn);

    List<Map<String, String>> getSchedulerSummary(boolean isEn);
}
