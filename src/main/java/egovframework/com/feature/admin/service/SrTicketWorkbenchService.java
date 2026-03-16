package egovframework.com.feature.admin.service;

import egovframework.com.feature.admin.dto.request.SrTicketApprovalRequest;
import egovframework.com.feature.admin.dto.request.SrTicketCreateRequest;

import java.util.Map;

public interface SrTicketWorkbenchService {

    Map<String, Object> getPage(String selectedPageId) throws Exception;

    Map<String, Object> createTicket(SrTicketCreateRequest request, String actorId) throws Exception;

    Map<String, Object> updateApproval(String ticketId, SrTicketApprovalRequest request, String actorId) throws Exception;

    Map<String, Object> prepareExecution(String ticketId, String actorId) throws Exception;

    Map<String, Object> executeTicket(String ticketId, String actorId, String approvalToken) throws Exception;
}
