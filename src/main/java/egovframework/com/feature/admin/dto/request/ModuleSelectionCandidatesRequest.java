package egovframework.com.feature.admin.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ModuleSelectionCandidatesRequest {

    private String projectId;
    private String scenarioFamilyId;
    private String scenarioId;
    private String guidedStateId;
    private String templateLineId;
    private String screenFamilyRuleId;
    private String pageDesignId;
    private String themeSetId;
}
