package egovframework.com.feature.admin.service;

import egovframework.com.feature.admin.dto.request.FullStackGovernanceAutoCollectRequest;
import egovframework.com.feature.admin.dto.request.FullStackGovernanceSaveRequest;

import java.util.Map;

public interface FullStackGovernanceRegistryCommandService {

    Map<String, Object> saveEntry(FullStackGovernanceSaveRequest request);

    Map<String, Object> autoCollectEntry(FullStackGovernanceAutoCollectRequest request) throws Exception;
}
