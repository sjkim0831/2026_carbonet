package egovframework.com.common.logging;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AccessEventRecordVO {

    private String eventId;
    private String traceId;
    private String requestId;
    private String pageId;
    private String apiId;
    private String requestUri;
    private String httpMethod;
    private String featureType;
    private String actorId;
    private String actorType;
    private String actorRole;
    private String actorInsttId;
    private String companyContextId;
    private String targetCompanyContextId;
    private String remoteAddr;
    private Integer responseStatus;
    private Integer durationMs;
    private String requestContentType;
    private String queryString;
    private String parameterSummary;
    private String errorMessage;
    private String companyScopeDecision;
    private String companyScopeReason;
    private String createdAt;
}
