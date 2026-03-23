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
}
