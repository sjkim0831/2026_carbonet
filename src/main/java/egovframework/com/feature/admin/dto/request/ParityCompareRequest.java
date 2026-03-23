package egovframework.com.feature.admin.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ParityCompareRequest {

    private String projectId;
    private String guidedStateId;
    private String templateLineId;
    private String screenFamilyRuleId;
    private String ownerLane;
    private String selectedScreenId;
    private String releaseUnitId;
    private String compareBaseline;
    private String requestedBy;
    private String requestedByType;
}
