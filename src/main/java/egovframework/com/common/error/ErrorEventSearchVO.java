package egovframework.com.common.error;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ErrorEventSearchVO {

    private int firstIndex;
    private int recordCountPerPage;
    private String searchKeyword;
    private String sourceType;
    private String errorType;
    private String resultStatus;
    private String actorId;
    private String insttId;
    private String pageId;
    private String apiId;
}
