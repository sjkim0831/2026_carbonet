package egovframework.com.common.error;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ErrorEventRecordVO {

    private String errorId;
    private String traceId;
    private String requestId;
    private String pageId;
    private String apiId;
    private String sourceType;
    private String errorType;
    private String actorId;
    private String actorRole;
    private String actorInsttId;
    private String requestUri;
    private String remoteAddr;
    private String message;
    private String stackSummary;
    private String resultStatus;
    private String userAgent;
    private String createdAt;

    public String getErrorId() {
        return errorId;
    }

    public String getTraceId() {
        return traceId;
    }

    public String getRequestId() {
        return requestId;
    }

    public String getPageId() {
        return pageId;
    }

    public String getApiId() {
        return apiId;
    }

    public String getSourceType() {
        return sourceType;
    }

    public String getErrorType() {
        return errorType;
    }

    public String getActorId() {
        return actorId;
    }

    public String getActorRole() {
        return actorRole;
    }

    public String getActorInsttId() {
        return actorInsttId;
    }

    public String getRequestUri() {
        return requestUri;
    }

    public String getRemoteAddr() {
        return remoteAddr;
    }

    public String getMessage() {
        return message;
    }

    public String getStackSummary() {
        return stackSummary;
    }

    public String getResultStatus() {
        return resultStatus;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public String getCreatedAt() {
        return createdAt;
    }
}
