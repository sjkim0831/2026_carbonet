package egovframework.com.common.audit;

import egovframework.com.common.mapper.ObservabilityMapper;
import org.springframework.stereotype.Component;

@Component
public class PersistingAuditEventWriter implements AuditEventWriter {

    private final ObservabilityMapper observabilityMapper;

    public PersistingAuditEventWriter(ObservabilityMapper observabilityMapper) {
        this.observabilityMapper = observabilityMapper;
    }

    @Override
    public void write(AuditEvent auditEvent) {
        observabilityMapper.insertAuditEvent(auditEvent);
    }
}
