package egovframework.com.common.trace;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TraceEventRecordVO {

    private String eventId;
    private String traceId;
    private String spanId;
    private String parentSpanId;
    private String eventType;
    private String pageId;
    private String componentId;
    private String functionId;
    private String apiId;
    private String resultCode;
    private Integer durationMs;
    private String payloadSummaryJson;
    private String createdAt;
}
