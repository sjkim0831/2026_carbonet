package egovframework.com.common.web;

import egovframework.com.common.error.ErrorEventService;
import egovframework.com.common.logging.AccessEventService;
import egovframework.com.common.trace.FrontendTelemetryBatchRequest;
import egovframework.com.common.trace.TraceEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/telemetry")
public class TelemetryController {

    private final TraceEventService traceEventService;
    private final ErrorEventService errorEventService;
    private final AccessEventService accessEventService;

    @PostMapping("/events")
    public ResponseEntity<Map<String, Object>> ingestEvents(@RequestBody(required = false) FrontendTelemetryBatchRequest request,
                                                            HttpServletRequest httpRequest) {
        accessEventService.recordFrontendPageViews(request == null ? null : request.getEvents(), httpRequest);
        int accepted = traceEventService.recordFrontendEvents(request == null ? null : request.getEvents());
        errorEventService.recordFrontendTelemetryErrors(request == null ? null : request.getEvents());
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("acceptedCount", accepted);
        return ResponseEntity.ok(response);
    }
}
