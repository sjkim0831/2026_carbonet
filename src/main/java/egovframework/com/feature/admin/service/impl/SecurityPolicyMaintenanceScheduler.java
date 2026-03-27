package egovframework.com.feature.admin.service.impl;

import egovframework.com.feature.admin.service.AdminSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityPolicyMaintenanceScheduler {

    private final AdminSummaryService adminSummaryService;

    @Scheduled(cron = "0 */10 * * * *")
    public void expireSuppressionsKo() {
        adminSummaryService.expireSecurityInsightSuppressions(false);
    }

    @Scheduled(cron = "30 */10 * * * *")
    public void expireSuppressionsEn() {
        adminSummaryService.expireSecurityInsightSuppressions(true);
    }

    @Scheduled(cron = "0 5-59/10 * * * *")
    public void dispatchDigestKo() {
        adminSummaryService.runScheduledSecurityInsightDigest(false);
    }

    @Scheduled(cron = "30 5-59/10 * * * *")
    public void dispatchDigestEn() {
        adminSummaryService.runScheduledSecurityInsightDigest(true);
    }
}
