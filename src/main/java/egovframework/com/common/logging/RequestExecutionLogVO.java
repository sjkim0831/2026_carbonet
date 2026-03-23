package egovframework.com.common.logging;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestExecutionLogVO {

    private String logId;
    private String executedAt;
    private String requestUri;
    private String httpMethod;
    private String featureType;
    private String actorUserId;
    private String actorType;
    private String actorAuthorCode;
    private String actorInsttId;
    private String remoteAddr;
    private String companyContextId;
    private String targetCompanyContextId;
    private boolean companyContextRequired;
    private boolean companyContextIncluded;
    private boolean companyContextExplicit;
    private String companyScopeDecision;
    private String companyScopeReason;
    private int responseStatus;
    private long durationMs;
    private String requestContentType;
    private String queryString;
    private String parameterSummary;
    private String errorMessage;
}
