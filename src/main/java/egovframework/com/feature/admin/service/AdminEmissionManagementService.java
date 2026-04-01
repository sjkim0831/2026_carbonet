package egovframework.com.feature.admin.service;

import egovframework.com.feature.admin.dto.request.EmissionInputSessionSaveRequest;

import java.util.Map;

public interface AdminEmissionManagementService {

    Map<String, Object> getCategoryList(String searchKeyword);

    Map<String, Object> getTierList(Long categoryId);

    Map<String, Object> getVariableDefinitions(Long categoryId, Integer tier);

    Map<String, Object> saveInputSession(EmissionInputSessionSaveRequest request, String actorId);

    Map<String, Object> getInputSession(Long sessionId);

    Map<String, Object> calculateInputSession(Long sessionId);

    Map<String, Object> getLimeDefaultFactor();
}
