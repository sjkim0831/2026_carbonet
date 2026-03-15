package egovframework.com.common.audit;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuditEvent {

    private final String auditId;
    private final String traceId;
    private final String requestId;
    private final String actorId;
    private final String actorRole;
    private final String menuCode;
    private final String pageId;
    private final String actionCode;
    private final String entityType;
    private final String entityId;
    private final String resultStatus;
    private final String reasonSummary;
    private final String beforeSummaryJson;
    private final String afterSummaryJson;
    private final String requestUri;
    private final String httpMethod;
    private final String ipAddress;
    private final String userAgent;
}
