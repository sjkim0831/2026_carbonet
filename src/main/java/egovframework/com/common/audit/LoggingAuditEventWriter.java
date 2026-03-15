package egovframework.com.common.audit;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class LoggingAuditEventWriter implements AuditEventWriter {

    @Override
    public void write(AuditEvent auditEvent) {
        log.info("AUDIT traceId={} requestId={} actorId={} actionCode={} entityType={} entityId={} resultStatus={} uri={}",
                auditEvent.getTraceId(),
                auditEvent.getRequestId(),
                auditEvent.getActorId(),
                auditEvent.getActionCode(),
                auditEvent.getEntityType(),
                auditEvent.getEntityId(),
                auditEvent.getResultStatus(),
                auditEvent.getRequestUri());
    }
}
