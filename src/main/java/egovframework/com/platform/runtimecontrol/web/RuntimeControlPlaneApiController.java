package egovframework.com.platform.runtimecontrol.web;

import egovframework.com.platform.runtimecontrol.model.ParityCompareRequest;
import egovframework.com.platform.runtimecontrol.model.ProjectPipelineRunRequest;
import egovframework.com.platform.runtimecontrol.model.ProjectPipelineStatusRequest;
import egovframework.com.platform.runtimecontrol.model.RepairApplyRequest;
import egovframework.com.platform.runtimecontrol.model.RepairOpenRequest;
import egovframework.com.platform.runtimecontrol.service.RuntimeControlPlaneService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping({
        "/api/platform/runtime",
        "/admin/api/platform/runtime",
        "/en/admin/api/platform/runtime",
        "/api/admin/ops",
        "/admin/api/admin/ops",
        "/en/admin/api/admin/ops"
})
@Slf4j
public class RuntimeControlPlaneApiController {

    private final RuntimeControlPlaneService runtimeControlPlaneService;

    @GetMapping("/parity/compare")
    public ResponseEntity<Map<String, Object>> getParityCompareByQuery(@ModelAttribute ParityCompareRequest request) {
        return execute(() -> runtimeControlPlaneService.getParityCompare(request));
    }

    @PostMapping("/parity/compare")
    public ResponseEntity<Map<String, Object>> getParityCompare(@RequestBody ParityCompareRequest request) {
        return execute(() -> runtimeControlPlaneService.getParityCompare(request));
    }

    @PostMapping("/repair/open")
    public ResponseEntity<Map<String, Object>> openRepairSession(@RequestBody RepairOpenRequest request) {
        return execute(() -> runtimeControlPlaneService.openRepairSession(request));
    }

    @PostMapping("/repair/apply")
    public ResponseEntity<Map<String, Object>> applyRepair(@RequestBody RepairApplyRequest request) {
        return execute(() -> runtimeControlPlaneService.applyRepair(request));
    }

    @PostMapping("/project-pipeline/run")
    public ResponseEntity<Map<String, Object>> runProjectPipeline(@RequestBody ProjectPipelineRunRequest request) {
        return execute(() -> runtimeControlPlaneService.runProjectPipeline(request));
    }

    @PostMapping("/project-pipeline/status")
    public ResponseEntity<Map<String, Object>> getProjectPipelineStatus(@RequestBody ProjectPipelineStatusRequest request) {
        return execute(() -> runtimeControlPlaneService.getProjectPipelineStatus(request));
    }

    private ResponseEntity<Map<String, Object>> execute(Action action) {
        try {
            return ResponseEntity.ok(action.run());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            log.error("Runtime control-plane API failed.", e);
            return ResponseEntity.internalServerError().body(errorBody("Runtime control-plane API failed."));
        }
    }

    private Map<String, Object> errorBody(String message) {
        Map<String, Object> body = new LinkedHashMap<String, Object>();
        body.put("message", message == null ? "" : message);
        return body;
    }

    @FunctionalInterface
    private interface Action {
        Map<String, Object> run() throws Exception;
    }
}
