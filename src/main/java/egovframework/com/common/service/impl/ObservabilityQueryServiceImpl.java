package egovframework.com.common.service.impl;

import egovframework.com.common.audit.AuditEventRecordVO;
import egovframework.com.common.audit.AuditEventSearchVO;
import egovframework.com.common.mapper.ObservabilityMapper;
import egovframework.com.common.service.ObservabilityQueryService;
import egovframework.com.common.trace.TraceEventRecordVO;
import egovframework.com.common.trace.TraceEventSearchVO;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("observabilityQueryService")
public class ObservabilityQueryServiceImpl extends EgovAbstractServiceImpl implements ObservabilityQueryService {

    private final ObservabilityMapper observabilityMapper;

    public ObservabilityQueryServiceImpl(ObservabilityMapper observabilityMapper) {
        this.observabilityMapper = observabilityMapper;
    }

    @Override
    public int selectAuditEventCount(AuditEventSearchVO searchVO) {
        return observabilityMapper.selectAuditEventCount(searchVO);
    }

    @Override
    public List<AuditEventRecordVO> selectAuditEventList(AuditEventSearchVO searchVO) {
        return observabilityMapper.selectAuditEventList(searchVO);
    }

    @Override
    public int selectTraceEventCount(TraceEventSearchVO searchVO) {
        return observabilityMapper.selectTraceEventCount(searchVO);
    }

    @Override
    public List<TraceEventRecordVO> selectTraceEventList(TraceEventSearchVO searchVO) {
        return observabilityMapper.selectTraceEventList(searchVO);
    }
}
