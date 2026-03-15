package egovframework.com.common.trace;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TraceContext {

    private final String traceId;
    private final String requestId;
    private final String pageId;
    private final String actionId;
    private final String apiId;
    private final String requestUri;
    private final String httpMethod;
}
