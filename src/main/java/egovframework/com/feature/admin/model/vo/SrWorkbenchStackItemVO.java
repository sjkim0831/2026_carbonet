package egovframework.com.feature.admin.model.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SrWorkbenchStackItemVO {

    private String stackItemId;
    private String createdAt;
    private String updatedAt;
    private String createdBy;
    private String pageId;
    private String pageLabel;
    private String routePath;
    private String menuCode;
    private String menuLookupUrl;
    private String surfaceId;
    private String surfaceLabel;
    private String selector;
    private String componentId;
    private String eventId;
    private String eventLabel;
    private String targetId;
    private String targetLabel;
    private String summary;
    private String instruction;
    private String technicalContext;
    private String traceId;
    private String requestId;
}
