package egovframework.com.feature.admin.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ModuleSelectionApplyRequest {

    private String projectId;
    private String scenarioId;
    private String guidedStateId;
    private String templateLineId;
    private String screenFamilyRuleId;
    private List<String> selectedModuleSet;
    private String selectionMode;
    private String operator;
}
