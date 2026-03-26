package egovframework.com.feature.admin.service.impl;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

final class AdminLogMenuBaselineCatalog {

    static final String CODE_ID = "AMENU1";
    static final String ACTOR_ID = "SYSTEM_BOOTSTRAP";

    static final List<LogMenuSnapshot> BASELINE_MENUS = Collections.unmodifiableList(Arrays.asList(
            new LogMenuSnapshot("A0060301", "접속 로그", "Access History", "/admin/system/access_history", "history", "Y"),
            new LogMenuSnapshot("A0060302", "에러 로그", "Error Log", "/admin/system/error-log", "warning", "Y"),
            new LogMenuSnapshot("A0060303", "감사 로그", "System Audit Log", "/admin/system/observability", "receipt_long", "Y"),
            new LogMenuSnapshot("A0060304", "통합 로그", "Unified Logs", "/admin/system/unified_log", "monitoring", "Y"),
            new LogMenuSnapshot("A0060305", "추적 로그", "Trace Logs", "/admin/system/unified_log/trace", "timeline", "Y"),
            new LogMenuSnapshot("A0060306", "페이지 이벤트 로그", "Page Event Logs", "/admin/system/unified_log/page-events", "pageview", "Y"),
            new LogMenuSnapshot("A0060307", "UI 액션 로그", "UI Action Logs", "/admin/system/unified_log/ui-actions", "touch_app", "Y"),
            new LogMenuSnapshot("A0060308", "API 추적 로그", "API Trace Logs", "/admin/system/unified_log/api-trace", "api", "Y"),
            new LogMenuSnapshot("A0060309", "UI 오류 로그", "UI Error Logs", "/admin/system/unified_log/ui-errors", "bug_report", "Y"),
            new LogMenuSnapshot("A0060310", "레이아웃 렌더 로그", "Layout Render Logs", "/admin/system/unified_log/layout-render", "dashboard_customize", "Y")
    ));

    private AdminLogMenuBaselineCatalog() {
    }

    static final class LogMenuSnapshot {
        private final String code;
        private final String codeNm;
        private final String codeDc;
        private final String menuUrl;
        private final String menuIcon;
        private final String useAt;

        private LogMenuSnapshot(String code,
                                String codeNm,
                                String codeDc,
                                String menuUrl,
                                String menuIcon,
                                String useAt) {
            this.code = code;
            this.codeNm = codeNm;
            this.codeDc = codeDc;
            this.menuUrl = menuUrl;
            this.menuIcon = menuIcon;
            this.useAt = useAt;
        }

        String getCode() {
            return code;
        }

        String getCodeNm() {
            return codeNm;
        }

        String getCodeDc() {
            return codeDc;
        }

        String getMenuUrl() {
            return menuUrl;
        }

        String getMenuIcon() {
            return menuIcon;
        }

        String getUseAt() {
            return useAt;
        }
    }
}
