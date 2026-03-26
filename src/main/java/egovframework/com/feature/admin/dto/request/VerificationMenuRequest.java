package egovframework.com.feature.admin.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class VerificationMenuRequest {

    private String projectId;
    private String menuId;
    private String guidedStateId;
    private String templateLineId;
    private String ownerLane;
    private String targetRuntime;
    private String releaseUnitId;
    private String screenFamilyRuleId;
    private String selectedScreenId;
    private List<String> selectedElementSet;
    private String compareBaseline;
    private Map<String, Object> builderInput;
    private Map<String, Object> runtimeEvidence;
    private Boolean verifyShellYn;
    private Boolean verifyComponentYn;
    private Boolean verifyBindingYn;
    private Boolean verifyBackendYn;
    private Boolean verifyHelpSecurityYn;
    private String requestedBy;
    private String requestedByType;
}
