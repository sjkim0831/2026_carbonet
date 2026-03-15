package egovframework.com.feature.admin.service;

import egovframework.com.feature.admin.model.vo.SrTicketRecordVO;
import egovframework.com.feature.admin.model.vo.SrTicketRunnerExecutionVO;

public interface SrTicketCodexRunnerService {

    SrTicketRunnerExecutionVO execute(SrTicketRecordVO ticket, String actorId) throws Exception;
}
