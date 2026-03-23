package egovframework.com.feature.admin.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RepairApplyRequest {

    private String repairSessionId;
    private String projectId;
    private String releaseUnitId;
    private String guidedStateId;
    private String screenFamilyRuleId;
    private String ownerLane;
    private String selectedScreenId;
    private List<String> selectedElementSet;
    private String compareBaseline;
    private List<String> updatedAssetSet;
    private List<String> updatedBindingSet;
    private List<String> updatedThemeOrLayoutSet;
    private List<String> sqlDraftSet;
    private String publishMode;
    private String requestedBy;
    private String requestedByType;
    private String changeSummary;
}
