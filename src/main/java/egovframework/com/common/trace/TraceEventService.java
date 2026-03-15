package egovframework.com.common.trace;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.common.mapper.ObservabilityMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class TraceEventService {

    private final ObservabilityMapper observabilityMapper;
    private final ObjectMapper objectMapper;

    public TraceEventService(ObservabilityMapper observabilityMapper, ObjectMapper objectMapper) {
        this.observabilityMapper = observabilityMapper;
        this.objectMapper = objectMapper;
    }

    public void recordRequestEvent(TraceContext traceContext, String resultCode, int durationMs, int responseStatus) {
        if (traceContext == null) {
            return;
        }
        TraceEventRecordVO traceEvent = new TraceEventRecordVO();
        traceEvent.setEventId(TraceIdGenerator.next("EVT"));
        traceEvent.setTraceId(traceContext.getTraceId());
        traceEvent.setSpanId(traceContext.getRequestId());
        traceEvent.setParentSpanId("");
        traceEvent.setEventType("REQUEST_OUT");
        traceEvent.setPageId(traceContext.getPageId());
        traceEvent.setApiId(traceContext.getApiId());
        traceEvent.setResultCode(resultCode);
        traceEvent.setDurationMs(durationMs);
        traceEvent.setPayloadSummaryJson("{\"uri\":\"" + safe(traceContext.getRequestUri())
                + "\",\"method\":\"" + safe(traceContext.getHttpMethod())
                + "\",\"status\":" + responseStatus + "}");
        try {
            observabilityMapper.insertTraceEvent(traceEvent);
        } catch (Exception e) {
            log.warn("Failed to persist trace event. uri={}, status={}", traceContext.getRequestUri(), responseStatus, e);
        }
    }

    public int recordFrontendEvents(List<FrontendTelemetryEvent> events) {
        if (events == null || events.isEmpty()) {
            return 0;
        }

        int accepted = 0;
        for (FrontendTelemetryEvent event : events) {
            if (event == null) {
                continue;
            }
            String traceId = safe(event.getTraceId());
            String eventType = normalizeEventType(event.getType());
            if (traceId.isEmpty() || eventType.isEmpty()) {
                continue;
            }

            TraceEventRecordVO traceEvent = new TraceEventRecordVO();
            traceEvent.setEventId(TraceIdGenerator.next("EVT"));
            traceEvent.setTraceId(traceId);
            traceEvent.setSpanId(safe(event.getRequestId()));
            traceEvent.setParentSpanId(safe(event.getActionId()));
            traceEvent.setEventType(eventType);
            traceEvent.setPageId(safe(event.getPageId()));
            traceEvent.setComponentId(safe(event.getComponentId()));
            traceEvent.setFunctionId(safe(event.getFunctionId()));
            traceEvent.setApiId(safe(event.getApiId()));
            traceEvent.setResultCode(safe(event.getResult()));
            traceEvent.setDurationMs(event.getDurationMs());
            traceEvent.setPayloadSummaryJson(toPayloadJson(event));
            try {
                observabilityMapper.insertTraceEvent(traceEvent);
                accepted++;
            } catch (Exception e) {
                log.warn("Failed to persist frontend trace event. traceId={}, eventType={}", traceId, eventType, e);
            }
        }
        return accepted;
    }

    private String toPayloadJson(FrontendTelemetryEvent event) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("locale", safe(event.getLocale()));
        payload.put("requestId", safe(event.getRequestId()));
        payload.put("actionId", safe(event.getActionId()));
        payload.put("occurredAt", safe(event.getOccurredAt()));
        payload.put("summary", sanitizePayload(event.getPayloadSummary()));
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            return "{\"summary\":{}}";
        }
    }

    @SuppressWarnings("unchecked")
    private Object sanitizePayload(Object value) {
        if (value == null) {
            return Collections.emptyMap();
        }
        if (value instanceof Map) {
            Map<String, Object> source = (Map<String, Object>) value;
            Map<String, Object> sanitized = new LinkedHashMap<>();
            for (Map.Entry<String, Object> entry : source.entrySet()) {
                String key = entry.getKey() == null ? "" : entry.getKey().trim();
                sanitized.put(key, isSensitiveKey(key) ? "***" : sanitizePayload(entry.getValue()));
            }
            return sanitized;
        }
        if (value instanceof List) {
            List<?> source = (List<?>) value;
            List<Object> sanitized = new ArrayList<>();
            for (Object item : source) {
                sanitized.add(sanitizePayload(item));
            }
            return sanitized;
        }
        if (value instanceof String && ((String) value).length() > 1000) {
            return ((String) value).substring(0, 1000);
        }
        return value;
    }

    private boolean isSensitiveKey(String key) {
        String normalized = key.toLowerCase();
        return normalized.contains("password")
                || normalized.contains("passwd")
                || normalized.contains("token")
                || normalized.contains("secret")
                || normalized.contains("authorization");
    }

    private String normalizeEventType(String value) {
        return safe(value).replace('-', '_').toUpperCase();
    }

    private String safe(String value) {
        return value == null ? "" : value.replace("\"", "'");
    }
}
