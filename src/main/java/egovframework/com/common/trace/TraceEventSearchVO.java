package egovframework.com.common.trace;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TraceEventSearchVO {

    private int firstIndex;
    private int recordCountPerPage;
    private String traceId;
    private String pageId;
    private String componentId;
    private String functionId;
    private String apiId;
    private String eventType;
    private String resultCode;
    private String searchKeyword;
}
