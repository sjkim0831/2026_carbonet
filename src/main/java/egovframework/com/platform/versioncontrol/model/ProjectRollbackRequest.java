package egovframework.com.platform.versioncontrol.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectRollbackRequest {

    private String projectId;
    private String operator;
    private String targetReleaseUnitId;
    private String reason;
}
