package egovframework.com.common.audit;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuditEventRecordVO {

    private String auditId;
    private String traceId;
    private String requestId;
    private String actorId;
    private String actorRole;
    private String menuCode;
    private String pageId;
    private String actionCode;
    private String entityType;
    private String entityId;
    private String beforeSummaryJson;
    private String afterSummaryJson;
    private String resultStatus;
    private String reasonSummary;
    private String ipAddress;
    private String userAgent;
    private String requestUri;
    private String httpMethod;
    private String createdAt;
}
