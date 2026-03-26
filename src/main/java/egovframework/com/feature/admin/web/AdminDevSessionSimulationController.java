package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.dto.request.AdminDevSessionSimulationRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping({"/api/admin/dev", "/admin/api/admin/dev", "/en/admin/api/admin/dev"})
@RequiredArgsConstructor
public class AdminDevSessionSimulationController {

    private final AdminSessionSimulationService adminSessionSimulationService;

    @GetMapping("/session-simulator")
    public ResponseEntity<Map<String, Object>> getState(
            @RequestParam(value = "insttId", required = false) String insttId,
            HttpServletRequest request) {
        return ResponseEntity.ok(adminSessionSimulationService.buildPayload(request, insttId));
    }

    @PostMapping("/session-simulator")
    public ResponseEntity<Map<String, Object>> apply(
            @RequestBody(required = false) AdminDevSessionSimulationRequestDTO payload,
            HttpServletRequest request) {
        return ResponseEntity.ok(adminSessionSimulationService.apply(request, payload));
    }

    @DeleteMapping("/session-simulator")
    public ResponseEntity<Map<String, Object>> reset(HttpServletRequest request) {
        return ResponseEntity.ok(adminSessionSimulationService.reset(request));
    }
}
