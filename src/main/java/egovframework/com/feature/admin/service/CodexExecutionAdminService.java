package egovframework.com.feature.admin.service;

import egovframework.com.feature.admin.dto.request.CodexProvisionRequest;
import egovframework.com.feature.admin.dto.response.CodexExecutionHistoryResponse;
import egovframework.com.feature.admin.dto.response.CodexProvisionResponse;
import egovframework.com.feature.admin.model.vo.CodexAdminActorContextVO;

public interface CodexExecutionAdminService {

    CodexProvisionResponse execute(CodexProvisionRequest request, CodexAdminActorContextVO actorContext) throws Exception;

    CodexExecutionHistoryResponse getRecentHistory(int limit) throws Exception;

    CodexExecutionHistoryResponse.CodexExecutionHistoryRow inspect(String logId) throws Exception;

    CodexProvisionResponse remediate(String logId, CodexAdminActorContextVO actorContext) throws Exception;
}
