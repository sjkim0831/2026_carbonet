package egovframework.com.feature.admin.service;

import egovframework.com.feature.admin.model.vo.EmissionResultFilterSnapshot;
import egovframework.com.feature.admin.model.vo.EmissionResultSummaryView;
import egovframework.com.feature.admin.model.vo.SecurityAuditSnapshot;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminShellBootstrapPageService {

    private final AdminSummaryService adminSummaryService;

    public Map<String, Object> buildMemberStatsPageData(boolean isEn) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("title", isEn ? "Member Statistics Dashboard" : "회원 통계 현황");
        response.put("subtitle", isEn
                ? "Analyze the registered member base by member type, monthly signups, and regional distribution."
                : "시스템에 등록된 전체 회원 정보를 유형별, 지역별로 분석합니다.");
        response.put("totalMembers", 1422);
        response.put("memberTypeStats", List.of(
                statsRow("enterprise", isEn ? "Enterprise Members" : "기업 회원", "78.7", "1120", "bg-blue-600"),
                statsRow("individual", isEn ? "Individual Members" : "개인 회원", "21.3", "302", "bg-emerald-500")));
        response.put("monthlySignupStats", List.of(
                monthlySignupRow(isEn ? "Apr" : "04월", "100", "56", false),
                monthlySignupRow(isEn ? "May" : "05월", "85", "48", false),
                monthlySignupRow(isEn ? "Jun" : "06월", "120", "63", false),
                monthlySignupRow(isEn ? "Jul" : "07월", "145", "81", false),
                monthlySignupRow(isEn ? "Aug" : "08월", "170", "96", true)));
        response.put("regionalDistribution", List.of(
                regionalDistributionRow(isEn ? "Capital Area" : "수도권", "42.5", isEn ? "774 companies" : "774개 기업"),
                regionalDistributionRow(isEn ? "Yeongnam Area" : "영남권", "28.2", isEn ? "513 companies" : "513개 기업"),
                regionalDistributionRow(isEn ? "Chungcheong Area" : "충청권", "18.4", isEn ? "335 companies" : "335개 기업"),
                regionalDistributionRow(isEn ? "Honam and Others" : "호남·기타", "10.9", isEn ? "198 companies" : "198개 기업")));
        return response;
    }

    public Map<String, Object> buildSecurityPolicyPageData(boolean isEn) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("securityPolicySummary", adminSummaryService.getSecurityPolicySummary(isEn));
        response.put("securityPolicyRows", buildSecurityPolicyRows(isEn));
        response.put("securityPolicyPlaybooks", buildSecurityPolicyPlaybooks(isEn));
        return response;
    }

    public Map<String, Object> buildSecurityMonitoringPageData(boolean isEn) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("securityMonitoringCards", adminSummaryService.getSecurityMonitoringCards(isEn));
        response.put("securityMonitoringTargets", buildSecurityMonitoringTargets(isEn));
        response.put("securityMonitoringIps", buildSecurityMonitoringIps(isEn));
        response.put("securityMonitoringEvents", buildSecurityMonitoringEvents(isEn));
        return response;
    }

    public Map<String, Object> buildSecurityAuditPageData(boolean isEn) {
        Map<String, Object> response = new LinkedHashMap<>();
        SecurityAuditSnapshot auditSnapshot = adminSummaryService.loadSecurityAuditSnapshot();
        response.put("isEn", isEn);
        response.put("securityAuditSummary", adminSummaryService.getSecurityAuditSummary(auditSnapshot, isEn));
        response.put("securityAuditRows", adminSummaryService.buildSecurityAuditRows(auditSnapshot.getAuditLogs(), isEn));
        return response;
    }

    public Map<String, Object> buildAdminHomePageData(boolean isEn) {
        Map<String, Object> response = new LinkedHashMap<>();
        SecurityAuditSnapshot auditSnapshot = adminSummaryService.loadSecurityAuditSnapshot();
        EmissionResultFilterSnapshot emissionSnapshot = adminSummaryService.buildEmissionResultFilterSnapshot(isEn, "", "", "");

        response.put("isEn", isEn);
        response.put("summaryCards", buildAdminHomeSummaryCards(isEn));
        response.put("reviewQueueRows", buildAdminHomeReviewQueueRows(emissionSnapshot.getItems(), isEn));
        response.put("reviewProgressRows", buildAdminHomeReviewProgressRows(emissionSnapshot.getItems(), isEn));
        response.put("operationalStatusRows", buildAdminHomeOperationalStatusRows(isEn));
        response.put("systemLogs", buildAdminHomeSystemLogs(auditSnapshot, isEn));
        return response;
    }

    public Map<String, Object> buildSchedulerPageData(String jobStatus, String executionType, boolean isEn) {
        Map<String, Object> response = new LinkedHashMap<>();
        String normalizedJobStatus = safeString(jobStatus).toUpperCase(Locale.ROOT);
        String normalizedExecutionType = safeString(executionType).toUpperCase(Locale.ROOT);
        List<Map<String, String>> jobRows = buildSchedulerJobRows(isEn);
        List<Map<String, String>> filteredRows = new ArrayList<>();
        for (Map<String, String> row : jobRows) {
            String rowStatus = safeString(row.get("jobStatus")).toUpperCase(Locale.ROOT);
            String rowType = safeString(row.get("executionTypeCode")).toUpperCase(Locale.ROOT);
            boolean matchesStatus = normalizedJobStatus.isEmpty() || normalizedJobStatus.equals(rowStatus);
            boolean matchesType = normalizedExecutionType.isEmpty() || normalizedExecutionType.equals(rowType);
            if (matchesStatus && matchesType) {
                filteredRows.add(row);
            }
        }
        response.put("isEn", isEn);
        response.put("jobStatus", normalizedJobStatus);
        response.put("executionType", normalizedExecutionType);
        response.put("schedulerSummary", adminSummaryService.getSchedulerSummary(isEn));
        response.put("schedulerJobRows", filteredRows);
        response.put("schedulerNodeRows", buildSchedulerNodeRows(isEn));
        response.put("schedulerExecutionRows", buildSchedulerExecutionRows(isEn));
        response.put("schedulerPlaybooks", buildSchedulerPlaybooks(isEn));
        return response;
    }

    public Map<String, Object> buildEmissionResultListPageData(
            String pageIndexParam,
            String searchKeyword,
            String resultStatus,
            String verificationStatus,
            boolean isEn) {
        int pageIndex = 1;
        if (!safeString(pageIndexParam).isEmpty()) {
            try {
                pageIndex = Integer.parseInt(pageIndexParam.trim());
            } catch (NumberFormatException ignored) {
                pageIndex = 1;
            }
        }

        String keyword = safeString(searchKeyword).toLowerCase(Locale.ROOT);
        String normalizedResultStatus = safeString(resultStatus).toUpperCase(Locale.ROOT);
        String normalizedVerificationStatus = safeString(verificationStatus).toUpperCase(Locale.ROOT);

        EmissionResultFilterSnapshot filterSnapshot = adminSummaryService.buildEmissionResultFilterSnapshot(
                isEn,
                keyword,
                normalizedResultStatus,
                normalizedVerificationStatus);
        List<EmissionResultSummaryView> filteredItems = filterSnapshot.getItems();

        int pageSize = 10;
        int totalCount = filterSnapshot.getTotalCount();
        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
        int currentPage = Math.max(1, Math.min(pageIndex, totalPages));
        int fromIndex = Math.min((currentPage - 1) * pageSize, totalCount);
        int toIndex = Math.min(fromIndex + pageSize, totalCount);
        List<EmissionResultSummaryView> pageItems = filteredItems.subList(fromIndex, toIndex);

        int startPage = Math.max(1, currentPage - 4);
        int endPage = Math.min(totalPages, startPage + 9);
        if (endPage - startPage < 9) {
            startPage = Math.max(1, endPage - 9);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("emissionResultList", pageItems);
        response.put("totalCount", totalCount);
        response.put("reviewCount", filterSnapshot.getReviewCount());
        response.put("verifiedCount", filterSnapshot.getVerifiedCount());
        response.put("pageIndex", currentPage);
        response.put("pageSize", pageSize);
        response.put("totalPages", totalPages);
        response.put("startPage", startPage);
        response.put("endPage", endPage);
        response.put("prevPage", Math.max(1, currentPage - 1));
        response.put("nextPage", Math.min(totalPages, currentPage + 1));
        response.put("searchKeyword", safeString(searchKeyword));
        response.put("resultStatus", normalizedResultStatus);
        response.put("verificationStatus", normalizedVerificationStatus);
        return response;
    }

    private Map<String, String> statsRow(String key, String label, String percentage, String count, String colorClass) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("key", key);
        row.put("label", label);
        row.put("percentage", percentage);
        row.put("count", count);
        row.put("colorClass", colorClass);
        return row;
    }

    private Map<String, String> monthlySignupRow(String month, String currentHeight, String previousHeight, boolean active) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("month", month);
        row.put("currentHeight", currentHeight);
        row.put("previousHeight", previousHeight);
        row.put("active", active ? "Y" : "N");
        return row;
    }

    private Map<String, String> regionalDistributionRow(String region, String percentage, String countLabel) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("region", region);
        row.put("percentage", percentage);
        row.put("countLabel", countLabel);
        return row;
    }

    private List<Map<String, String>> buildAdminHomeSummaryCards(boolean isEn) {
        List<Map<String, String>> monitoringCards = adminSummaryService.getSecurityMonitoringCards(isEn);
        List<Map<String, String>> schedulerCards = adminSummaryService.getSchedulerSummary(isEn);
        List<Map<String, String>> blocklistCards = adminSummaryService.getBlocklistSummary(isEn);
        return List.of(
                homeSummaryCard(
                        safeCardValue(monitoringCards, 0, "title", isEn ? "Current RPS" : "현재 RPS"),
                        safeCardValue(monitoringCards, 0, "value", "0"),
                        safeCardValue(monitoringCards, 0, "description", ""),
                        "monitoring",
                        "text-[var(--kr-gov-green)]",
                        "border-l-[var(--kr-gov-green)]"),
                homeSummaryCard(
                        safeCardValue(schedulerCards, 2, "title", isEn ? "Failed Today" : "오늘 실패"),
                        safeCardValue(schedulerCards, 2, "value", "0"),
                        safeCardValue(schedulerCards, 2, "description", ""),
                        "schedule",
                        "text-orange-400",
                        "border-l-orange-400"),
                homeSummaryCard(
                        safeCardValue(blocklistCards, 0, "title", isEn ? "Active Blocks" : "활성 차단"),
                        safeCardValue(blocklistCards, 0, "value", "0"),
                        safeCardValue(blocklistCards, 0, "description", ""),
                        "gpp_bad",
                        "text-[var(--kr-gov-blue)]",
                        "border-l-[var(--kr-gov-blue)]"));
    }

    private List<Map<String, String>> buildAdminHomeReviewQueueRows(List<EmissionResultSummaryView> items, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        if (items != null) {
            for (EmissionResultSummaryView item : items) {
                if (item == null) {
                    continue;
                }
                if (!"REVIEW".equals(safeString(item.getResultStatusCode()))) {
                    continue;
                }
                rows.add(mapOf(
                        "title", safeString(item.getProjectName()),
                        "type", safeString(item.getCompanyName()),
                        "appliedOn", safeString(item.getCalculatedAt()),
                        "detailUrl", safeString(item.getDetailUrl()),
                        "statusLabel", safeString(item.getVerificationStatusLabel())));
                if (rows.size() >= 3) {
                    break;
                }
            }
        }
        if (!rows.isEmpty()) {
            return rows;
        }
        return List.of(
                mapOf(
                        "title", isEn ? "Blue Hydrogen Process Review" : "블루수소 공정 검토",
                        "type", isEn ? "Hanbit Energy" : "한빛에너지",
                        "appliedOn", "2026-03-03",
                        "detailUrl", buildAdminPath(isEn, "/emission/result_list?resultStatus=REVIEW"),
                        "statusLabel", isEn ? "Pending" : "검증 대기"),
                mapOf(
                        "title", isEn ? "Methanol Conversion Project" : "메탄올 전환 프로젝트",
                        "type", isEn ? "Daehan Synthesis" : "대한신소재",
                        "appliedOn", "2026-02-24",
                        "detailUrl", buildAdminPath(isEn, "/emission/result_list?resultStatus=REVIEW"),
                        "statusLabel", isEn ? "Pending" : "검증 대기"));
    }

    private List<Map<String, String>> buildAdminHomeReviewProgressRows(List<EmissionResultSummaryView> items, boolean isEn) {
        int draftCount = 0;
        int reviewCount = 0;
        int completedCount = 0;
        int verifiedCount = 0;
        int totalCount = 0;
        if (items != null) {
            for (EmissionResultSummaryView item : items) {
                if (item == null) {
                    continue;
                }
                totalCount++;
                String resultStatus = safeString(item.getResultStatusCode());
                String verificationStatus = safeString(item.getVerificationStatusCode());
                if ("DRAFT".equals(resultStatus)) {
                    draftCount++;
                }
                if ("REVIEW".equals(resultStatus)) {
                    reviewCount++;
                }
                if ("COMPLETED".equals(resultStatus)) {
                    completedCount++;
                }
                if ("VERIFIED".equals(verificationStatus)) {
                    verifiedCount++;
                }
            }
        }
        int normalizedTotal = Math.max(totalCount, 1);
        return List.of(
                homeProgressRow(isEn ? "Draft" : "임시 저장", draftCount, normalizedTotal, "bg-slate-400"),
                homeProgressRow(isEn ? "Under Review" : "검토 중", reviewCount, normalizedTotal, "bg-blue-500"),
                homeProgressRow(isEn ? "Completed" : "산정 완료", completedCount, normalizedTotal, "bg-emerald-500"),
                homeProgressRow(isEn ? "Verified" : "검증 완료", verifiedCount, normalizedTotal, "bg-[var(--kr-gov-green)]"));
    }

    private List<Map<String, String>> buildAdminHomeOperationalStatusRows(boolean isEn) {
        List<Map<String, String>> policyCards = adminSummaryService.getSecurityPolicySummary(isEn);
        List<Map<String, String>> whitelistCards = adminSummaryService.getIpWhitelistSummary(isEn);
        List<Map<String, String>> blocklistCards = adminSummaryService.getBlocklistSummary(isEn);
        return List.of(
                homeOperationalStatusRow(
                        "policy",
                        isEn ? "Security Policy Engine" : "보안 정책 엔진",
                        safeCardValue(policyCards, 0, "value", "0") + " " + safeCardValue(policyCards, 0, "title", ""),
                        "HEALTHY"),
                homeOperationalStatusRow(
                        "verified_user",
                        isEn ? "IP Allowlist Guard" : "IP 허용목록 가드",
                        safeCardValue(whitelistCards, 0, "value", "0") + " " + safeCardValue(whitelistCards, 0, "title", ""),
                        "HEALTHY"),
                homeOperationalStatusRow(
                        "shield_locked",
                        isEn ? "Threat Block Queue" : "위협 차단 큐",
                        safeCardValue(blocklistCards, 0, "value", "0") + " " + safeCardValue(blocklistCards, 0, "title", ""),
                        "WARNING"));
    }

    private List<Map<String, String>> buildAdminHomeSystemLogs(SecurityAuditSnapshot auditSnapshot, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        if (auditSnapshot != null && auditSnapshot.getAuditLogs() != null) {
            adminSummaryService.buildSecurityAuditRows(auditSnapshot.getAuditLogs(), isEn).stream()
                    .limit(3)
                    .forEach(item -> rows.add(mapOf(
                            "level", safeString(item.get("action")).contains(isEn ? "Blocked" : "차단") ? "WARNING" : "INFO",
                            "message", safeString(item.get("detail")),
                            "timestamp", safeString(item.get("auditAt")))));
        }
        if (!rows.isEmpty()) {
            return rows;
        }
        return List.of(
                mapOf("level", "INFO",
                        "message", isEn ? "Admin home summary snapshot loaded successfully." : "관리자 홈 요약 스냅샷을 정상적으로 불러왔습니다.",
                        "timestamp", "2026-03-18 09:00"),
                mapOf("level", "WARNING",
                        "message", isEn ? "No recent security audit events were found." : "최근 보안 감사 이벤트가 없어 기본 로그를 사용 중입니다.",
                        "timestamp", "2026-03-18 08:58"));
    }

    private Map<String, String> homeSummaryCard(
            String title,
            String value,
            String description,
            String icon,
            String iconClass,
            String borderClass) {
        return mapOf(
                "title", title,
                "value", value,
                "description", description,
                "icon", icon,
                "iconClass", iconClass,
                "borderClass", borderClass);
    }

    private Map<String, String> homeProgressRow(String label, int value, int total, String barClass) {
        int width = Math.max(8, (int) Math.round((value * 100.0d) / Math.max(total, 1)));
        return mapOf(
                "label", label,
                "value", String.valueOf(value),
                "width", width + "%",
                "barClass", barClass);
    }

    private Map<String, String> homeOperationalStatusRow(String icon, String label, String meta, String status) {
        return mapOf(
                "icon", icon,
                "label", label,
                "meta", meta,
                "status", status);
    }

    private String safeCardValue(List<Map<String, String>> cards, int index, String key, String defaultValue) {
        if (cards == null || index < 0 || index >= cards.size() || cards.get(index) == null) {
            return defaultValue;
        }
        return safeString(cards.get(index).get(key)).isEmpty() ? defaultValue : safeString(cards.get(index).get(key));
    }

    private String buildAdminPath(boolean isEn, String path) {
        return isEn ? "/en/admin" + path : "/admin" + path;
    }

    private List<Map<String, String>> buildSecurityPolicyRows(boolean isEn) {
        return List.of(
                mapOf(
                        "policyId", "POL-001",
                        "targetUrl", "/signin/actionLogin",
                        "policyName", isEn ? "User login protection" : "사용자 로그인 보호",
                        "threshold", isEn ? "30 req/min per IP" : "IP당 분당 30회",
                        "burst", isEn ? "5 req / 10 sec" : "10초 5회 burst",
                        "action", isEn ? "Captcha -> 10 min block" : "CAPTCHA -> 10분 차단",
                        "status", "ACTIVE",
                        "updatedAt", "2026-03-12 08:20"),
                mapOf(
                        "policyId", "POL-002",
                        "targetUrl", "/admin/login/actionLogin",
                        "policyName", isEn ? "Admin login hardening" : "관리자 로그인 강화",
                        "threshold", isEn ? "10 req/min per IP" : "IP당 분당 10회",
                        "burst", isEn ? "3 req / 10 sec" : "10초 3회 burst",
                        "action", isEn ? "Immediate 30 min block" : "즉시 30분 차단",
                        "status", "ACTIVE",
                        "updatedAt", "2026-03-12 08:25"),
                mapOf(
                        "policyId", "POL-003",
                        "targetUrl", "/api/search/**",
                        "policyName", isEn ? "Search API throttle" : "검색 API 제어",
                        "threshold", isEn ? "120 req/min per token" : "토큰당 분당 120회",
                        "burst", isEn ? "20 req / 10 sec" : "10초 20회 burst",
                        "action", isEn ? "429 + alert" : "429 + 알림",
                        "status", "ACTIVE",
                        "updatedAt", "2026-03-11 18:10"));
    }

    private List<Map<String, String>> buildSecurityPolicyPlaybooks(boolean isEn) {
        return List.of(
                mapOf("title", isEn ? "Login attack playbook" : "로그인 공격 플레이북",
                        "body", isEn ? "Raise admin login threshold only after verifying WAF and captcha counters." : "WAF 및 CAPTCHA 지표 확인 후에만 관리자 로그인 임계치를 상향합니다."),
                mapOf("title", isEn ? "Search API degradation" : "검색 API 완화 전략",
                        "body", isEn ? "If 429 spikes persist for over 10 minutes, shift to token-based limits and cache prebuilt queries." : "429 급증이 10분 이상 지속되면 토큰 기준 제한과 캐시 응답으로 전환합니다."),
                mapOf("title", isEn ? "Emergency block release" : "긴급 차단 해제",
                        "body", isEn ? "Release only after verifying owner, CIDR, expiry time, and related gateway policy." : "소유 조직, CIDR, 만료 시각, 게이트웨이 정책 연동을 모두 확인한 뒤 해제합니다."));
    }

    private List<Map<String, String>> buildSecurityMonitoringTargets(boolean isEn) {
        return List.of(
                mapOf("url", "/admin/login/actionLogin", "rps", "88", "status", isEn ? "Escalated" : "경계", "rule", isEn ? "Admin login hardening" : "관리자 로그인 강화"),
                mapOf("url", "/signin/actionLogin", "rps", "240", "status", isEn ? "Protected" : "방어중", "rule", isEn ? "User login protection" : "사용자 로그인 보호"),
                mapOf("url", "/api/search/carbon-footprint", "rps", "510", "status", isEn ? "Throttled" : "제한중", "rule", isEn ? "Search API throttle" : "검색 API 제어"));
    }

    private List<Map<String, String>> buildSecurityMonitoringIps(boolean isEn) {
        return List.of(
                mapOf("ip", "198.51.100.42", "country", "US", "requestCount", "4,120", "action", isEn ? "Temp blocked" : "임시차단"),
                mapOf("ip", "203.0.113.78", "country", "KR", "requestCount", "2,844", "action", isEn ? "Captcha enforced" : "CAPTCHA 전환"),
                mapOf("ip", "45.67.22.91", "country", "DE", "requestCount", "2,337", "action", isEn ? "429 only" : "429 응답"));
    }

    private List<Map<String, String>> buildSecurityMonitoringEvents(boolean isEn) {
        return List.of(
                mapOf("detectedAt", "2026-03-12 09:18", "title", isEn ? "Burst login attack detected" : "로그인 버스트 공격 감지", "detail", isEn ? "Admin login burst exceeded threshold from 3 IPs." : "3개 IP에서 관리자 로그인 burst 임계치 초과", "severity", "HIGH"),
                mapOf("detectedAt", "2026-03-12 09:12", "title", isEn ? "Search API abuse pattern" : "검색 API 남용 패턴", "detail", isEn ? "Single token generated 429 for 6 consecutive minutes." : "단일 토큰에서 6분 연속 429 다발", "severity", "MEDIUM"));
    }

    private List<Map<String, String>> buildSchedulerJobRows(boolean isEn) {
        return List.of(
                mapOf("jobId", "SCH-001", "jobName", isEn ? "Nightly emissions aggregation" : "야간 배출량 집계",
                        "cronExpression", "0 0 2 * * ?", "executionTypeCode", "CRON", "executionType", isEn ? "CRON" : "정기",
                        "jobStatus", "ACTIVE", "lastRunAt", "2026-03-13 02:00", "nextRunAt", "2026-03-14 02:00",
                        "owner", isEn ? "Emissions Ops" : "배출 운영팀"),
                mapOf("jobId", "SCH-002", "jobName", isEn ? "Certificate expiry sync" : "인증서 만료 동기화",
                        "cronExpression", "0 */30 * * * ?", "executionTypeCode", "CRON", "executionType", isEn ? "CRON" : "정기",
                        "jobStatus", "ACTIVE", "lastRunAt", "2026-03-13 11:30", "nextRunAt", "2026-03-13 12:00",
                        "owner", isEn ? "Certificate Admin" : "인증 운영자"),
                mapOf("jobId", "SCH-003", "jobName", isEn ? "External API token refresh" : "외부연계 토큰 갱신",
                        "cronExpression", "0 0/10 * * * ?", "executionTypeCode", "CRON", "executionType", isEn ? "CRON" : "정기",
                        "jobStatus", "PAUSED", "lastRunAt", "2026-03-13 10:40", "nextRunAt", "-",
                        "owner", isEn ? "Integration Team" : "외부연계팀"),
                mapOf("jobId", "SCH-004", "jobName", isEn ? "Manual backfill for trade settlement" : "거래 정산 수동 보정",
                        "cronExpression", "-", "executionTypeCode", "MANUAL", "executionType", isEn ? "MANUAL" : "수동",
                        "jobStatus", "REVIEW", "lastRunAt", "2026-03-12 18:10",
                        "nextRunAt", isEn ? "On request" : "요청 시 실행", "owner", isEn ? "Settlement Ops" : "정산 운영팀"));
    }

    private List<Map<String, String>> buildSchedulerNodeRows(boolean isEn) {
        return List.of(
                mapOf("nodeId", "batch-node-01", "role", isEn ? "Primary scheduler" : "주 스케줄러", "status", "HEALTHY", "runningJobs", "5", "heartbeatAt", "2026-03-13 11:46:11"),
                mapOf("nodeId", "batch-node-02", "role", isEn ? "Failover worker" : "대기 워커", "status", "STANDBY", "runningJobs", "0", "heartbeatAt", "2026-03-13 11:46:04"),
                mapOf("nodeId", "batch-node-03", "role", isEn ? "Settlement queue worker" : "정산 큐 워커", "status", "DEGRADED", "runningJobs", "2", "heartbeatAt", "2026-03-13 11:45:31"));
    }

    private List<Map<String, String>> buildSchedulerExecutionRows(boolean isEn) {
        return List.of(
                mapOf("executedAt", "2026-03-13 11:30", "jobId", "SCH-002", "result", "SUCCESS", "duration", "18s", "message", isEn ? "Certificate expiration cache synchronized." : "인증서 만료 캐시 동기화 완료"),
                mapOf("executedAt", "2026-03-13 11:10", "jobId", "SCH-003", "result", "FAILED", "duration", "47s", "message", isEn ? "Token endpoint timeout. Retry queued." : "토큰 엔드포인트 타임아웃, 재시도 대기"),
                mapOf("executedAt", "2026-03-13 10:00", "jobId", "SCH-001", "result", "SUCCESS", "duration", "3m 12s", "message", isEn ? "1,284 aggregation rows persisted." : "집계 1,284건 적재 완료"),
                mapOf("executedAt", "2026-03-12 18:10", "jobId", "SCH-004", "result", "REVIEW", "duration", "9m 05s", "message", isEn ? "Manual backfill requires settlement approval." : "수동 보정 후 정산 승인 필요"));
    }

    private List<Map<String, String>> buildSchedulerPlaybooks(boolean isEn) {
        return List.of(
                mapOf("title", isEn ? "Cron expression review" : "Cron 표현식 점검",
                        "body", isEn ? "Validate time zone, duplicate trigger windows, and collision with settlement cut-off times before enabling a new job."
                                : "신규 잡 활성화 전 시간대, 중복 실행 구간, 정산 마감 시간과의 충돌 여부를 점검합니다."),
                mapOf("title", isEn ? "Failure response" : "실패 대응",
                        "body", isEn ? "Failed jobs should record retry policy, root cause, and linked operator before rerun approval."
                                : "실패 잡은 재시도 정책, 원인, 담당 운영자를 기록한 뒤 재실행 승인 절차를 거칩니다."),
                mapOf("title", isEn ? "Manual execution guardrail" : "수동 실행 가드레일",
                        "body", isEn ? "High-impact jobs such as trade settlement or certificate re-issuance should require a dual review and an execution reason."
                                : "거래 정산, 인증서 재발급처럼 영향이 큰 잡은 이중 검토와 실행 사유 기록을 요구합니다."));
    }

    private Map<String, String> mapOf(String... values) {
        Map<String, String> row = new LinkedHashMap<>();
        for (int index = 0; index + 1 < values.length; index += 2) {
            row.put(values[index], values[index + 1]);
        }
        return row;
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }
}
