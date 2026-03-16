package egovframework.com.feature.admin.service;

import egovframework.com.feature.admin.model.vo.SrTicketRecordVO;

import java.util.Map;

public interface SrSelfHealingService {

    Map<String, Object> analyzeErrorPattern(String fingerprint, String errorType, String errorMessage);
    
    boolean shouldAutoHeal(String fingerprint, String errorType);
    
    Map<String, Object> triggerSelfHealing(String fingerprint, String errorDetails, String actorId);
    
    Map<String, Object> getSelfHealingStatus(String fingerprint);
    
    boolean validateAutoExecutionPolicy(String policyId);
}
