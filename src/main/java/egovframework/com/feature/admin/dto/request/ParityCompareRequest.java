package egovframework.com.feature.admin.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

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
    private Map<String, Object> builderInput;
    private Map<String, Object> runtimeEvidence;
    private List<String> selectedElementSet;
    private String requestedBy;
    private String requestedByType;
}
