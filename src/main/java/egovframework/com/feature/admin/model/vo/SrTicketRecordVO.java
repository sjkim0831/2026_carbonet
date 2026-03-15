package egovframework.com.feature.admin.model.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SrTicketRecordVO {

    private String ticketId;
    private String status;
    private String createdAt;
    private String updatedAt;
    private String createdBy;
    private String lastActionBy;
    private String approvedBy;
    private String approvedAt;
    private String approvalComment;
    private String executionPreparedAt;
    private String executionPreparedBy;
    private String executionStatus;
    private String executionComment;
    private String pageId;
    private String pageLabel;
    private String routePath;
    private String menuCode;
    private String menuLookupUrl;
    private String surfaceId;
    private String surfaceLabel;
    private String eventId;
    private String eventLabel;
    private String targetId;
    private String targetLabel;
    private String summary;
    private String instruction;
    private String generatedDirection;
    private String commandPrompt;
    private String executionRunId;
    private String executionStartedAt;
    private String executionStartedBy;
    private String executionCompletedAt;
    private String executionCompletedBy;
    private String executionLogPath;
    private String executionDiffPath;
    private String executionChangedFiles;
    private String executionWorktreePath;
}
