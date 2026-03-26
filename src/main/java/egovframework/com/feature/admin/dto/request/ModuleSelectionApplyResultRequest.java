package egovframework.com.feature.admin.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ModuleSelectionApplyResultRequest {

    private String projectId;
    private String scenarioId;
    private String guidedStateId;
    private String ownerLane;
    private String releaseUnitId;
    private String moduleBindingPreviewId;
}
