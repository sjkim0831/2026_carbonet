package egovframework.com.common.service;

import egovframework.com.common.audit.AuditEventRecordVO;
import egovframework.com.common.audit.AuditEventSearchVO;
import egovframework.com.common.trace.TraceEventRecordVO;
import egovframework.com.common.trace.TraceEventSearchVO;

import java.util.List;

public interface ObservabilityQueryService {

    int selectAuditEventCount(AuditEventSearchVO searchVO);

    List<AuditEventRecordVO> selectAuditEventList(AuditEventSearchVO searchVO);

    int selectTraceEventCount(TraceEventSearchVO searchVO);

    List<TraceEventRecordVO> selectTraceEventList(TraceEventSearchVO searchVO);
}
