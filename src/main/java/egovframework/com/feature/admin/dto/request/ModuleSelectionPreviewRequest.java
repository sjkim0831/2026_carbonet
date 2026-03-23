package egovframework.com.feature.admin.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ModuleSelectionPreviewRequest {

    private String projectId;
    private String scenarioId;
    private String guidedStateId;
    private String templateLineId;
    private String screenFamilyRuleId;
    private String installableModuleId;
}
