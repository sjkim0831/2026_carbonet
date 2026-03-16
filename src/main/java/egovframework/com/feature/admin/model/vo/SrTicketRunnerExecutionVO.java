package egovframework.com.feature.admin.model.vo;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class SrTicketRunnerExecutionVO {

    private String runId;
    private String ticketId;
    private String actorId;
    private String startedAt;
    private String completedAt;
    private String status;
    private String repositoryRoot;
    private String workspacePath;
    private String worktreePath;
    private String promptFilePath;
    private String stdoutLogPath;
    private String stderrLogPath;
    private String diffFilePath;
    private String changedFilesSummary;
    private boolean changedFilesAllowed;
    private Integer codexExitCode;
    private Integer backendVerifyExitCode;
    private Integer frontendVerifyExitCode;
    private Integer deployExitCode;
    private String codexCommand;
    private String backendVerifyCommand;
    private String frontendVerifyCommand;
    private String deployCommand;
    private String healthCheckStatus;
    private String rollbackStatus;
    private String errorMessage;
    private List<String> changedFiles = new ArrayList<String>();
}
