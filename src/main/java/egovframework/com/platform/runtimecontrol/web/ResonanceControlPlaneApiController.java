package egovframework.com.platform.runtimecontrol.web;

import egovframework.com.feature.admin.dto.request.ModuleSelectionApplyRequest;
import egovframework.com.feature.admin.dto.request.ModuleSelectionApplyResultRequest;
import egovframework.com.feature.admin.dto.request.ModuleSelectionCandidatesRequest;
import egovframework.com.feature.admin.dto.request.ModuleSelectionPreviewRequest;
import egovframework.com.feature.admin.dto.request.ParityCompareRequest;
import egovframework.com.feature.admin.dto.request.RepairApplyRequest;
import egovframework.com.feature.admin.dto.request.RepairOpenRequest;
import egovframework.com.feature.admin.dto.request.VerificationMenuRequest;
import egovframework.com.platform.runtimecontrol.service.ResonanceControlPlaneService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping({
        "/api/admin/ops",
        "/admin/api/admin/ops",
        "/en/admin/api/admin/ops"
})
@Slf4j
public class ResonanceControlPlaneApiController {

    private final ResonanceControlPlaneService resonanceControlPlaneService;

    @GetMapping("/parity/compare")
    public ResponseEntity<?> getParityCompare(@ModelAttribute ParityCompareRequest request) {
        return execute(() -> resonanceControlPlaneService.getParityCompare(request));
    }

    @PostMapping("/module-selection/candidates")
    public ResponseEntity<?> getModuleSelectionCandidates(@RequestBody ModuleSelectionCandidatesRequest request) {
        return execute(() -> resonanceControlPlaneService.getModuleSelectionCandidates(request));
    }

    @PostMapping("/module-selection/preview")
    public ResponseEntity<?> getModuleSelectionPreview(@RequestBody ModuleSelectionPreviewRequest request) {
        return execute(() -> resonanceControlPlaneService.getModuleSelectionPreview(request));
    }

    @PostMapping("/module-selection/apply")
    public ResponseEntity<?> applyModuleSelection(@RequestBody ModuleSelectionApplyRequest request) {
        return execute(() -> resonanceControlPlaneService.applyModuleSelection(request));
    }

    @PostMapping("/module-selection/apply-result")
    public ResponseEntity<?> getModuleSelectionApplyResult(@RequestBody ModuleSelectionApplyResultRequest request) {
        return execute(() -> resonanceControlPlaneService.getModuleSelectionApplyResult(request));
    }

    @PostMapping("/repair/open")
    public ResponseEntity<?> openRepairSession(@RequestBody RepairOpenRequest request) {
        return execute(() -> resonanceControlPlaneService.openRepairSession(request));
    }

    @PostMapping("/repair/apply")
    public ResponseEntity<?> applyRepair(@RequestBody RepairApplyRequest request) {
        return execute(() -> resonanceControlPlaneService.applyRepair(request));
    }

    @PostMapping("/verification/menu-to-rendered-screen")
    public ResponseEntity<?> verifyMenuToRenderedScreen(@RequestBody VerificationMenuRequest request) {
        return execute(() -> resonanceControlPlaneService.verifyMenuToRenderedScreen(request));
    }

    private ResponseEntity<?> execute(ControlPlaneAction action) {
        try {
            return ResponseEntity.ok(action.run());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            log.error("Resonance control-plane API failed.", e);
            return ResponseEntity.internalServerError().body(errorBody("Resonance control-plane API failed."));
        }
    }

    private Map<String, Object> errorBody(String message) {
        Map<String, Object> body = new LinkedHashMap<String, Object>();
        body.put("success", false);
        body.put("message", message == null ? "" : message);
        return body;
    }

    @FunctionalInterface
    private interface ControlPlaneAction {
        Map<String, Object> run() throws Exception;
    }
}
