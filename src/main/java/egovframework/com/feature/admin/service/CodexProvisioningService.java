package egovframework.com.feature.admin.service;

import egovframework.com.feature.admin.dto.request.CodexProvisionRequest;
import egovframework.com.feature.admin.dto.response.CodexProvisionResponse;

public interface CodexProvisioningService {

    CodexProvisionResponse provision(CodexProvisionRequest request) throws Exception;
}
