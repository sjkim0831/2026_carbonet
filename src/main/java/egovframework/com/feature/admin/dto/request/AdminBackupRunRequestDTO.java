package egovframework.com.feature.admin.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminBackupRunRequestDTO {

    private String executionType;
    private String gitRestoreCommit;
    private String dbRestoreType;
    private String dbRestoreTarget;
    private String dbRestorePointInTime;
    private String sudoPassword;
}
