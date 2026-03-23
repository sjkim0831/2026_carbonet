package egovframework.com.feature.admin.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RepairOpenRequest {

    private String projectId;
    private String releaseUnitId;
    private String guidedStateId;
    private String screenFamilyRuleId;
    private String ownerLane;
    private String selectedScreenId;
    private List<String> selectedElementSet;
    private String compareBaseline;
    private String reasonCode;
    private List<String> existingAssetReuseSet;
    private String requestedBy;
    private String requestedByType;
    private String requestNote;
}
