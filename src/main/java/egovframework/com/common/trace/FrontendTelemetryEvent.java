package egovframework.com.common.trace;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class FrontendTelemetryEvent {

    private String traceId;
    private String requestId;
    private String pageId;
    private String locale;
    private String type;
    private String actionId;
    private String functionId;
    private String apiId;
    private String componentId;
    private String result;
    private Integer durationMs;
    private String occurredAt;
    private Map<String, Object> payloadSummary;
}
