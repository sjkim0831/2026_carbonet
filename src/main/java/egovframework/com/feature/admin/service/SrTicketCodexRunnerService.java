package egovframework.com.feature.admin.service;

import egovframework.com.feature.admin.model.vo.SrTicketRecordVO;
import egovframework.com.feature.admin.model.vo.SrTicketRunnerExecutionVO;

public interface SrTicketCodexRunnerService {

    SrTicketRunnerExecutionVO prepareExecution(SrTicketRecordVO ticket, String actorId, String executionMode) throws Exception;

    SrTicketRunnerExecutionVO execute(SrTicketRecordVO ticket, String actorId, String approvalToken, String executionMode) throws Exception;

    SrTicketRunnerExecutionVO executePrepared(SrTicketRecordVO ticket, String actorId, String approvalToken, SrTicketRunnerExecutionVO execution) throws Exception;
}
