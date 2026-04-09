package egovframework.com.feature.admin.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AdminPaymentBootstrapReadService {

    public Map<String, Object> buildSettlementCalendarPageData(
            String pageIndexParam,
            String selectedMonth,
            String searchKeyword,
            String settlementStatus,
            String riskLevel,
            boolean isEn) {
        int pageIndex = parsePageIndex(pageIndexParam);
        String normalizedMonth = safeString(selectedMonth).isEmpty() ? "2026-04" : safeString(selectedMonth);
        String normalizedKeyword = safeString(searchKeyword).toLowerCase(Locale.ROOT);
        String normalizedStatus = safeString(settlementStatus).toUpperCase(Locale.ROOT);
        String normalizedRisk = safeString(riskLevel).toUpperCase(Locale.ROOT);

        List<Map<String, String>> allRows = buildSettlementCalendarRows(isEn);
        List<Map<String, String>> filteredRows = new ArrayList<>();
        for (Map<String, String> row : allRows) {
            String searchable = String.join(" ",
                    safeString(row.get("settlementId")),
                    safeString(row.get("settlementTitle")),
                    safeString(row.get("institutionName")),
                    safeString(row.get("ownerName")),
                    safeString(row.get("blockerReason"))).toLowerCase(Locale.ROOT);
            boolean matchesMonth = normalizedMonth.equals(safeString(row.get("settlementMonth")));
            boolean matchesKeyword = normalizedKeyword.isEmpty() || searchable.contains(normalizedKeyword);
            boolean matchesStatus = normalizedStatus.isEmpty() || normalizedStatus.equals(safeString(row.get("statusCode")).toUpperCase(Locale.ROOT));
            boolean matchesRisk = normalizedRisk.isEmpty() || normalizedRisk.equals(safeString(row.get("riskLevelCode")).toUpperCase(Locale.ROOT));
            if (matchesMonth && matchesKeyword && matchesStatus && matchesRisk) {
                filteredRows.add(row);
            }
        }

        int pageSize = 10;
        int totalCount = filteredRows.size();
        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
        int currentPage = Math.max(1, Math.min(pageIndex, totalPages));
        int fromIndex = Math.min((currentPage - 1) * pageSize, totalCount);
        int toIndex = Math.min(fromIndex + pageSize, totalCount);
        List<Map<String, String>> pageRows = filteredRows.subList(fromIndex, toIndex);

        long dueTodayCount = filteredRows.stream()
                .filter(row -> "2026-04-01".equals(safeString(row.get("dueDate"))))
                .count();
        long highRiskCount = filteredRows.stream()
                .filter(row -> "HIGH".equalsIgnoreCase(safeString(row.get("riskLevelCode"))))
                .count();
        long completedCount = filteredRows.stream()
                .filter(row -> "COMPLETED".equalsIgnoreCase(safeString(row.get("statusCode"))))
                .count();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("selectedMonth", normalizedMonth);
        response.put("searchKeyword", safeString(searchKeyword));
        response.put("settlementStatus", normalizedStatus);
        response.put("riskLevel", normalizedRisk);
        response.put("settlementRows", pageRows);
        response.put("calendarDays", buildSettlementCalendarDays(normalizedMonth, isEn));
        response.put("totalCount", totalCount);
        response.put("dueTodayCount", dueTodayCount);
        response.put("highRiskCount", highRiskCount);
        response.put("completedCount", completedCount);
        response.put("pageIndex", currentPage);
        response.put("pageSize", pageSize);
        response.put("totalPages", totalPages);
        response.put("monthOptions", List.of(
                option("2026-04", isEn ? "April 2026" : "2026년 4월"),
                option("2026-05", isEn ? "May 2026" : "2026년 5월"),
                option("2026-06", isEn ? "June 2026" : "2026년 6월")));
        response.put("settlementStatusOptions", List.of(
                option("", isEn ? "All" : "전체"),
                option("PENDING", isEn ? "Pending" : "대기"),
                option("READY", isEn ? "Ready" : "준비 완료"),
                option("BLOCKED", isEn ? "Blocked" : "차단"),
                option("COMPLETED", isEn ? "Completed" : "완료")));
        response.put("riskLevelOptions", List.of(
                option("", isEn ? "All" : "전체"),
                option("HIGH", isEn ? "High" : "높음"),
                option("MEDIUM", isEn ? "Medium" : "보통"),
                option("LOW", isEn ? "Low" : "낮음")));
        response.put("settlementAlerts", List.of(
                mapOf(
                        "title", isEn ? "Treasury handoff cut-off" : "재무 이관 마감",
                        "detail", isEn ? "Ready schedules on April 3 should be handed off before the 15:00 treasury close."
                                : "4월 3일 마감 준비 완료 건은 15시 재무 마감 전에 이관해야 합니다.",
                        "badgeLabel", isEn ? "Watch" : "주의",
                        "badgeClassName", "bg-amber-100 text-amber-700",
                        "actionLabel", isEn ? "Open refund queue" : "환불 큐 열기",
                        "actionUrl", buildAdminPath(isEn, "/payment/refund_list"))));
        return response;
    }

    public Map<String, Object> buildRefundListPageData(
            String pageIndexParam,
            String searchKeyword,
            String status,
            String riskLevel,
            boolean isEn) {
        int pageIndex = parsePageIndex(pageIndexParam);
        String keyword = safeString(searchKeyword).toLowerCase(Locale.ROOT);
        String normalizedStatus = safeString(status).toUpperCase(Locale.ROOT);
        String normalizedRiskLevel = safeString(riskLevel).toUpperCase(Locale.ROOT);

        List<Map<String, String>> allRows = buildRefundListRows(isEn);
        List<Map<String, String>> filteredRows = new ArrayList<>();
        for (Map<String, String> row : allRows) {
            String searchable = String.join(" ",
                    safeString(row.get("refundId")),
                    safeString(row.get("companyName")),
                    safeString(row.get("applicantName")),
                    safeString(row.get("paymentMethodLabel")),
                    safeString(row.get("reasonSummary")),
                    safeString(row.get("accountMasked"))).toLowerCase(Locale.ROOT);
            String rowStatus = safeString(row.get("statusCode")).toUpperCase(Locale.ROOT);
            String rowRiskLevel = safeString(row.get("riskLevelCode")).toUpperCase(Locale.ROOT);
            boolean matchesKeyword = keyword.isEmpty() || searchable.contains(keyword);
            boolean matchesStatus = normalizedStatus.isEmpty() || normalizedStatus.equals(rowStatus);
            boolean matchesRiskLevel = normalizedRiskLevel.isEmpty() || normalizedRiskLevel.equals(rowRiskLevel);
            if (matchesKeyword && matchesStatus && matchesRiskLevel) {
                filteredRows.add(row);
            }
        }

        int pageSize = 8;
        int totalCount = filteredRows.size();
        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
        int currentPage = Math.max(1, Math.min(pageIndex, totalPages));
        int fromIndex = Math.min((currentPage - 1) * pageSize, totalCount);
        int toIndex = Math.min(fromIndex + pageSize, totalCount);
        List<Map<String, String>> pageRows = filteredRows.subList(fromIndex, toIndex);

        long pendingCount = allRows.stream()
                .filter(row -> "RECEIVED".equalsIgnoreCase(safeString(row.get("statusCode"))) || "ACCOUNT_REVIEW".equalsIgnoreCase(safeString(row.get("statusCode"))))
                .count();
        long inReviewCount = allRows.stream()
                .filter(row -> "IN_REVIEW".equalsIgnoreCase(safeString(row.get("statusCode"))))
                .count();
        long transferScheduledCount = allRows.stream()
                .filter(row -> "TRANSFER_SCHEDULED".equalsIgnoreCase(safeString(row.get("statusCode"))))
                .count();
        long completedCount = allRows.stream()
                .filter(row -> "COMPLETED".equalsIgnoreCase(safeString(row.get("statusCode"))))
                .count();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("refundRows", pageRows);
        response.put("totalCount", totalCount);
        response.put("pendingCount", pendingCount);
        response.put("inReviewCount", inReviewCount);
        response.put("transferScheduledCount", transferScheduledCount);
        response.put("completedCount", completedCount);
        response.put("pageIndex", currentPage);
        response.put("pageSize", pageSize);
        response.put("totalPages", totalPages);
        response.put("searchKeyword", safeString(searchKeyword));
        response.put("status", normalizedStatus);
        response.put("riskLevel", normalizedRiskLevel);
        response.put("statusOptions", List.of(
                option("", isEn ? "All" : "전체"),
                option("RECEIVED", isEn ? "Received" : "접수"),
                option("ACCOUNT_REVIEW", isEn ? "Account Review" : "계좌 검수"),
                option("IN_REVIEW", isEn ? "In Review" : "검토중"),
                option("APPROVED", isEn ? "Approved" : "승인"),
                option("TRANSFER_SCHEDULED", isEn ? "Transfer Scheduled" : "이체 예정"),
                option("COMPLETED", isEn ? "Completed" : "처리 완료"),
                option("REJECTED", isEn ? "Rejected" : "반려")));
        response.put("riskLevelOptions", List.of(
                option("", isEn ? "All" : "전체"),
                option("HIGH", isEn ? "High" : "높음"),
                option("MEDIUM", isEn ? "Medium" : "보통"),
                option("LOW", isEn ? "Low" : "낮음")));
        response.put("refundAlerts", List.of(
                mapOf(
                        "title", isEn ? "Same-day transfer cut-off" : "당일 이체 마감 확인",
                        "detail", isEn ? "Approved refunds after 16:00 move to the next business-day transfer batch."
                                : "16시 이후 승인된 환불은 다음 영업일 이체 배치로 이월됩니다.",
                        "tone", "warning"),
                mapOf(
                        "title", isEn ? "Account verification backlog" : "환불 계좌 검수 적체",
                        "detail", isEn ? "Requests missing account-owner validation should stay blocked before approval."
                                : "예금주 검증이 끝나지 않은 요청은 승인 전에 계속 보류해야 합니다.",
                        "tone", "info")));
        return response;
    }

    private int parsePageIndex(String pageIndexParam) {
        if (safeString(pageIndexParam).isEmpty()) {
            return 1;
        }
        try {
            return Integer.parseInt(pageIndexParam.trim());
        } catch (NumberFormatException ignored) {
            return 1;
        }
    }

    private List<Map<String, String>> buildSettlementCalendarRows(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(settlementScheduleRow("SET-202604-001", "2026-04", isEn ? "March offset close" : "3월 상쇄 정산", isEn ? "Hanul Steel" : "한울제철",
                isEn ? "Lee Minji" : "이민지", "2026-04-01", "KRW 418,000,000", "PENDING", isEn ? "Pending" : "대기",
                "HIGH", isEn ? "High" : "높음", isEn ? "Counterparty evidence not signed" : "상대 기관 증빙 미서명"));
        rows.add(settlementScheduleRow("SET-202604-002", "2026-04", isEn ? "REC hedge settlement" : "REC 헤지 정산", isEn ? "Green Grid" : "그린그리드",
                isEn ? "Park Jiwon" : "박지원", "2026-04-01", "KRW 192,000,000", "READY", isEn ? "Ready" : "준비 완료",
                "MEDIUM", isEn ? "Medium" : "보통", isEn ? "Treasury confirmation pending" : "재무 확인 대기"));
        rows.add(settlementScheduleRow("SET-202604-003", "2026-04", isEn ? "Biochar partner payout" : "바이오차 파트너 정산", isEn ? "Eco Farm" : "에코팜",
                isEn ? "Choi Yuna" : "최유나", "2026-04-02", "KRW 87,500,000", "BLOCKED", isEn ? "Blocked" : "차단",
                "HIGH", isEn ? "High" : "높음", isEn ? "Tax invoice mismatch" : "세금계산서 금액 불일치"));
        rows.add(settlementScheduleRow("SET-202604-004", "2026-04", isEn ? "Balancing lot treasury release" : "밸런싱 물량 자금 집행", isEn ? "East Port" : "이스트포트",
                isEn ? "Han Jaeho" : "한재호", "2026-04-02", "KRW 522,400,000", "READY", isEn ? "Ready" : "준비 완료",
                "LOW", isEn ? "Low" : "낮음", isEn ? "Treasury batch assigned" : "재무 배치 편성 완료"));
        rows.add(settlementScheduleRow("SET-202604-005", "2026-04", isEn ? "Data center reserve settlement" : "데이터센터 예비물량 정산", isEn ? "Sun Network" : "선네트워크",
                isEn ? "Jeong Haein" : "정해인", "2026-04-03", "KRW 154,000,000", "PENDING", isEn ? "Pending" : "대기",
                "MEDIUM", isEn ? "Medium" : "보통", isEn ? "Operator note update required" : "운영 메모 보완 필요"));
        rows.add(settlementScheduleRow("SET-202604-006", "2026-04", isEn ? "Capture storage close" : "포집 저장 블록 정산", isEn ? "CCUS Plant A" : "CCUS 플랜트 A",
                isEn ? "Kim Sujin" : "김수진", "2026-04-03", "KRW 301,000,000", "COMPLETED", isEn ? "Completed" : "완료",
                "LOW", isEn ? "Low" : "낮음", isEn ? "Transferred to treasury archive" : "재무 이관 완료"));
        rows.add(settlementScheduleRow("SET-202604-007", "2026-04", isEn ? "Seasonal hedge settlement" : "계절성 헤지 정산", isEn ? "Nova Chemical" : "노바케미칼",
                isEn ? "Seo Dahye" : "서다혜", "2026-04-04", "KRW 333,600,000", "PENDING", isEn ? "Pending" : "대기",
                "MEDIUM", isEn ? "Medium" : "보통", isEn ? "Need buyer confirmation" : "매수 기관 확인 필요"));
        rows.add(settlementScheduleRow("SET-202604-008", "2026-04", isEn ? "Cold-chain settlement run" : "콜드체인 정산 실행", isEn ? "Wind Core" : "윈드코어",
                isEn ? "Yun Ara" : "윤아라", "2026-04-05", "KRW 71,000,000", "COMPLETED", isEn ? "Completed" : "완료",
                "LOW", isEn ? "Low" : "낮음", isEn ? "Month-end payout completed" : "월말 지급 완료"));
        rows.add(settlementScheduleRow("SET-202605-001", "2026-05", isEn ? "Afforestation offset close" : "조림 상쇄 정산", isEn ? "Forest Link" : "포레스트링크",
                isEn ? "Lee Minji" : "이민지", "2026-05-02", "KRW 126,000,000", "PENDING", isEn ? "Pending" : "대기",
                "MEDIUM", isEn ? "Medium" : "보통", isEn ? "Awaiting evidence bundle" : "증빙 묶음 수신 대기"));
        rows.add(settlementScheduleRow("SET-202605-002", "2026-05", isEn ? "Compliance fill settlement" : "의무량 보전 정산", isEn ? "River Cement" : "리버시멘트",
                isEn ? "Han Jaeho" : "한재호", "2026-05-03", "KRW 257,000,000", "READY", isEn ? "Ready" : "준비 완료",
                "LOW", isEn ? "Low" : "낮음", isEn ? "Queued for treasury handoff" : "재무 이관 대기열 편성"));
        rows.add(settlementScheduleRow("SET-202606-001", "2026-06", isEn ? "Heat network mix settlement" : "열공급 믹스 정산", isEn ? "North Solar" : "노스솔라",
                isEn ? "Park Jiwon" : "박지원", "2026-06-01", "KRW 59,400,000", "PENDING", isEn ? "Pending" : "대기",
                "LOW", isEn ? "Low" : "낮음", isEn ? "Next month open queue" : "차월 오픈 큐"));
        rows.add(settlementScheduleRow("SET-202606-002", "2026-06", isEn ? "Agriculture offset pool" : "농업 상쇄 풀 정산", isEn ? "Eco Farm" : "에코팜",
                isEn ? "Choi Yuna" : "최유나", "2026-06-02", "KRW 143,500,000", "BLOCKED", isEn ? "Blocked" : "차단",
                "HIGH", isEn ? "High" : "높음", isEn ? "Rejection memo not closed" : "반려 메모 미종결"));
        return rows;
    }

    private Map<String, String> settlementScheduleRow(
            String settlementId,
            String settlementMonth,
            String settlementTitle,
            String institutionName,
            String ownerName,
            String dueDate,
            String amount,
            String statusCode,
            String statusLabel,
            String riskLevelCode,
            String riskLevelLabel,
            String blockerReason) {
        return mapOf(
                "settlementId", settlementId,
                "settlementMonth", settlementMonth,
                "settlementTitle", settlementTitle,
                "institutionName", institutionName,
                "ownerName", ownerName,
                "dueDate", dueDate,
                "amount", amount,
                "statusCode", statusCode,
                "statusLabel", statusLabel,
                "riskLevelCode", riskLevelCode,
                "riskLevelLabel", riskLevelLabel,
                "blockerReason", blockerReason);
    }

    private List<Map<String, String>> buildSettlementCalendarDays(String selectedMonth, boolean isEn) {
        if ("2026-05".equals(selectedMonth)) {
            return List.of(
                    settlementCalendarDay("2026-05-02", isEn ? "Fri" : "금", "02", "6", "1", isEn ? "Lee Minji" : "이민지", "MEDIUM", isEn ? "Medium" : "보통",
                            isEn ? "Offset proof packet deadline" : "상쇄 증빙 패킷 마감"),
                    settlementCalendarDay("2026-05-03", isEn ? "Sat" : "토", "03", "4", "0", isEn ? "Han Jaeho" : "한재호", "LOW", isEn ? "Low" : "낮음",
                            isEn ? "Treasury handoff slots open" : "재무 이관 슬롯 오픈"));
        }
        if ("2026-06".equals(selectedMonth)) {
            return List.of(
                    settlementCalendarDay("2026-06-01", isEn ? "Mon" : "월", "01", "3", "0", isEn ? "Park Jiwon" : "박지원", "LOW", isEn ? "Low" : "낮음",
                            isEn ? "Open next-cycle settlement queue" : "차기 정산 큐 개시"),
                    settlementCalendarDay("2026-06-02", isEn ? "Tue" : "화", "02", "2", "1", isEn ? "Choi Yuna" : "최유나", "HIGH", isEn ? "High" : "높음",
                            isEn ? "Blocked memo needs closure" : "차단 메모 종결 필요"));
        }
        return List.of(
                settlementCalendarDay("2026-04-01", isEn ? "Wed" : "수", "01", "5", "1", isEn ? "Lee Minji" : "이민지", "HIGH", isEn ? "High" : "높음",
                        isEn ? "Daily close and counterparty confirmation overlap." : "일 마감과 상대 기관 확인 일정이 겹칩니다."),
                settlementCalendarDay("2026-04-02", isEn ? "Thu" : "목", "02", "4", "1", isEn ? "Han Jaeho" : "한재호", "MEDIUM", isEn ? "Medium" : "보통",
                        isEn ? "Tax invoice mismatch should be resolved before treasury release." : "재무 집행 전에 세금계산서 불일치를 정리해야 합니다."),
                settlementCalendarDay("2026-04-03", isEn ? "Fri" : "금", "03", "3", "0", isEn ? "Kim Sujin" : "김수진", "MEDIUM", isEn ? "Medium" : "보통",
                        isEn ? "15:00 treasury cut-off for ready schedules." : "준비 완료 건은 15시 재무 마감 전에 넘겨야 합니다."),
                settlementCalendarDay("2026-04-04", isEn ? "Sat" : "토", "04", "2", "0", isEn ? "Seo Dahye" : "서다혜", "LOW", isEn ? "Low" : "낮음",
                        isEn ? "Buyer confirmation follow-up window." : "매수 기관 확인 추적 구간입니다."),
                settlementCalendarDay("2026-04-05", isEn ? "Sun" : "일", "05", "1", "0", isEn ? "Yun Ara" : "윤아라", "LOW", isEn ? "Low" : "낮음",
                        isEn ? "Archive completed payouts and close notes." : "지급 완료 건 아카이브와 마감 메모 정리를 진행합니다."));
    }

    private Map<String, String> settlementCalendarDay(
            String date,
            String weekdayLabel,
            String dayLabel,
            String scheduledCount,
            String exceptionCount,
            String ownerName,
            String riskLevelCode,
            String riskLevelLabel,
            String focusNote) {
        return mapOf(
                "date", date,
                "weekdayLabel", weekdayLabel,
                "dayLabel", dayLabel,
                "scheduledCount", scheduledCount,
                "exceptionCount", exceptionCount,
                "ownerName", ownerName,
                "riskLevelCode", riskLevelCode,
                "riskLevelLabel", riskLevelLabel,
                "focusNote", focusNote);
    }

    private List<Map<String, String>> buildRefundListRows(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(refundRow("RFD-202603-031", isEn ? "Hanul Steel" : "한울제철", isEn ? "Kim Minseo" : "김민서",
                isEn ? "Card Refund" : "카드 취소", "Shinhan 123-45****-88", "KRW 1,280,000", "KRW 1,280,000",
                "2026-03-31 15:10", "RECEIVED", isEn ? "Received" : "접수", "HIGH", isEn ? "High" : "높음",
                isEn ? "Duplicate payment detected during invoice closing." : "세금계산서 마감 중 이중 결제가 확인되었습니다.",
                isEn ? "Verify duplicate transaction evidence" : "중복 결제 증빙 확인"));
        rows.add(refundRow("RFD-202603-030", isEn ? "Blue Energy" : "블루에너지", isEn ? "Park Jiwon" : "박지원",
                isEn ? "Bank Transfer" : "계좌 이체", "KB 991-20****-11", "KRW 860,000", "KRW 860,000",
                "2026-03-31 13:42", "ACCOUNT_REVIEW", isEn ? "Account Review" : "계좌 검수", "MEDIUM", isEn ? "Medium" : "보통",
                isEn ? "Refund account was changed after submission." : "신청 후 환불 계좌가 변경되었습니다.",
                isEn ? "Confirm account ownership" : "예금주 확인"));
        rows.add(refundRow("RFD-202603-029", isEn ? "Metro Heat" : "메트로히트", isEn ? "Lee Seojun" : "이서준",
                isEn ? "Card Refund" : "카드 취소", "Hyundai 883-10****-04", "KRW 540,000", "KRW 540,000",
                "2026-03-31 11:05", "IN_REVIEW", isEn ? "In Review" : "검토중", "LOW", isEn ? "Low" : "낮음",
                isEn ? "Service package downgrade before activation." : "서비스 개시 전 상품 등급 하향 요청입니다.",
                isEn ? "Review downgrade effective date" : "등급 변경 적용일 검토"));
        rows.add(refundRow("RFD-202603-028", isEn ? "Green Grid" : "그린그리드", isEn ? "Choi Yena" : "최예나",
                isEn ? "Bank Transfer" : "계좌 이체", "NH 118-77****-90", "KRW 2,140,000", "KRW 1,920,000",
                "2026-03-30 17:26", "APPROVED", isEn ? "Approved" : "승인", "MEDIUM", isEn ? "Medium" : "보통",
                isEn ? "Partial refund after monthly settlement offset." : "월 정산 상계 후 부분 환불 승인 건입니다.",
                isEn ? "Queue next transfer batch" : "다음 이체 배치 편성"));
        rows.add(refundRow("RFD-202603-027", isEn ? "River Cement" : "리버시멘트", isEn ? "Han Jaeho" : "한재호",
                isEn ? "Bank Transfer" : "계좌 이체", "Woori 227-00****-53", "KRW 3,400,000", "KRW 3,400,000",
                "2026-03-30 15:11", "TRANSFER_SCHEDULED", isEn ? "Transfer Scheduled" : "이체 예정", "LOW", isEn ? "Low" : "낮음",
                isEn ? "Approved full refund awaiting treasury batch." : "전액 환불 승인 후 자금 배치 대기 중입니다.",
                isEn ? "Monitor transfer completion" : "이체 완료 모니터링"));
        rows.add(refundRow("RFD-202603-026", isEn ? "Sun Network" : "선네트워크", isEn ? "Jeong Haein" : "정해인",
                isEn ? "Card Refund" : "카드 취소", "Samsung 771-30****-61", "KRW 420,000", "KRW 420,000",
                "2026-03-29 18:08", "COMPLETED", isEn ? "Completed" : "처리 완료", "LOW", isEn ? "Low" : "낮음",
                isEn ? "Cancellation completed with card acquirer." : "카드 매입사 취소 처리가 완료되었습니다.",
                isEn ? "Complete" : "완료"));
        rows.add(refundRow("RFD-202603-025", isEn ? "Carbon Labs" : "카본랩스", isEn ? "Yun Ara" : "윤아라",
                isEn ? "Bank Transfer" : "계좌 이체", "IBK 004-18****-32", "KRW 1,100,000", "KRW 0",
                "2026-03-29 12:14", "REJECTED", isEn ? "Rejected" : "반려", "HIGH", isEn ? "High" : "높음",
                isEn ? "Requested period already consumed by issued certificate." : "발급 완료된 인증서 사용 기간과 중복되어 반려되었습니다.",
                isEn ? "Notify rejection reason" : "반려 사유 안내"));
        rows.add(refundRow("RFD-202603-024", isEn ? "Seoul Mobility" : "서울모빌리티", isEn ? "Kang Doyun" : "강도윤",
                isEn ? "Bank Transfer" : "계좌 이체", "KakaoBank 333-22****-71", "KRW 780,000", "KRW 780,000",
                "2026-03-28 10:22", "IN_REVIEW", isEn ? "In Review" : "검토중", "MEDIUM", isEn ? "Medium" : "보통",
                isEn ? "Support escalation attached for service outage credit." : "서비스 장애 보상 사유로 고객지원 이관 메모가 첨부되었습니다.",
                isEn ? "Validate outage compensation rule" : "장애 보상 기준 확인"));
        rows.add(refundRow("RFD-202603-023", isEn ? "Nova Chemical" : "노바케미칼", isEn ? "Seo Dahye" : "서다혜",
                isEn ? "Card Refund" : "카드 취소", "Lotte 441-90****-15", "KRW 690,000", "KRW 690,000",
                "2026-03-27 16:35", "TRANSFER_SCHEDULED", isEn ? "Transfer Scheduled" : "이체 예정", "LOW", isEn ? "Low" : "낮음",
                isEn ? "Treasury approved same-week refund batch." : "재무팀이 주간 환불 배치를 승인했습니다.",
                isEn ? "Await batch completion" : "배치 완료 대기"));
        return rows;
    }

    private Map<String, String> refundRow(
            String refundId,
            String companyName,
            String applicantName,
            String paymentMethodLabel,
            String accountMasked,
            String requestedAmount,
            String refundableAmount,
            String requestedAt,
            String statusCode,
            String statusLabel,
            String riskLevelCode,
            String riskLevelLabel,
            String reasonSummary,
            String nextActionLabel) {
        return mapOf(
                "refundId", refundId,
                "companyName", companyName,
                "applicantName", applicantName,
                "paymentMethodLabel", paymentMethodLabel,
                "accountMasked", accountMasked,
                "requestedAmount", requestedAmount,
                "refundableAmount", refundableAmount,
                "requestedAt", requestedAt,
                "statusCode", statusCode,
                "statusLabel", statusLabel,
                "riskLevelCode", riskLevelCode,
                "riskLevelLabel", riskLevelLabel,
                "reasonSummary", reasonSummary,
                "nextActionLabel", nextActionLabel);
    }

    private Map<String, String> option(String code, String label) {
        return mapOf("code", code, "label", label);
    }

    private Map<String, String> mapOf(String... values) {
        Map<String, String> row = new LinkedHashMap<>();
        for (int index = 0; index + 1 < values.length; index += 2) {
            row.put(values[index], values[index + 1]);
        }
        return row;
    }

    private String buildAdminPath(boolean isEn, String path) {
        return isEn ? "/en/admin" + path : "/admin" + path;
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }
}
