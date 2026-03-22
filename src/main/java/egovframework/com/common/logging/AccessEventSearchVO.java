package egovframework.com.common.logging;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AccessEventSearchVO {

    private int firstIndex;
    private int recordCountPerPage;
    private String searchKeyword;
    private String insttId;
    private String actorId;
    private String pageId;
    private String apiId;
    private String featureType;
}
