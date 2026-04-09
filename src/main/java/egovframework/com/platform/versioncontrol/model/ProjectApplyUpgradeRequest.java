package egovframework.com.platform.versioncontrol.model;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class ProjectApplyUpgradeRequest {

    private String projectId;
    private String operator;
    private List<Map<String, Object>> targetArtifactSet;
    private String approvalNote;
}
