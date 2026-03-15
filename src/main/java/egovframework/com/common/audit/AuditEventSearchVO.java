package egovframework.com.common.audit;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuditEventSearchVO {

    private int firstIndex;
    private int recordCountPerPage;
    private String traceId;
    private String actorId;
    private String actionCode;
    private String menuCode;
    private String pageId;
    private String resultStatus;
    private String searchKeyword;
}
