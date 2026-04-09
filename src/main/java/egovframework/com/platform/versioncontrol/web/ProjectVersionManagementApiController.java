package egovframework.com.platform.versioncontrol.web;

import egovframework.com.platform.versioncontrol.model.ProjectApplyUpgradeRequest;
import egovframework.com.platform.versioncontrol.model.ProjectRollbackRequest;
import egovframework.com.platform.versioncontrol.model.ProjectUpgradeImpactRequest;
import egovframework.com.platform.versioncontrol.service.ProjectVersionManagementService;
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
@RequestMapping({
        "/api/platform/version-control",
        "/admin/api/platform/version-control",
        "/en/admin/api/platform/version-control"
})
@RequiredArgsConstructor
@Slf4j
public class ProjectVersionManagementApiController {

    private final ProjectVersionManagementService projectVersionManagementService;

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> overview(@ModelAttribute ProjectQuery query) {
        return execute(() -> projectVersionManagementService.getOverview(query.getProjectId()));
    }

    @GetMapping("/adapter-history")
    public ResponseEntity<Map<String, Object>> adapterHistory(@ModelAttribute PagingProjectQuery query) {
        return execute(() -> projectVersionManagementService.getAdapterHistory(query.getProjectId(), query.page(), query.pageSize()));
    }

    @GetMapping("/release-units")
    public ResponseEntity<Map<String, Object>> releaseUnits(@ModelAttribute PagingProjectQuery query) {
        return execute(() -> projectVersionManagementService.getReleaseUnits(query.getProjectId(), query.page(), query.pageSize()));
    }

    @GetMapping("/server-deploy-state")
    public ResponseEntity<Map<String, Object>> serverDeployState(@ModelAttribute ProjectQuery query) {
        return execute(() -> projectVersionManagementService.getServerDeployState(query.getProjectId()));
    }

    @GetMapping("/candidate-artifacts")
    public ResponseEntity<Map<String, Object>> candidateArtifacts(@ModelAttribute PagingProjectQuery query) {
        return execute(() -> projectVersionManagementService.getCandidateArtifacts(query.getProjectId(), query.page(), query.pageSize()));
    }

    @PostMapping("/upgrade-impact")
    public ResponseEntity<Map<String, Object>> upgradeImpact(@RequestBody ProjectUpgradeImpactRequest request) {
        return execute(() -> projectVersionManagementService.analyzeUpgradeImpact(request));
    }

    @PostMapping("/apply-upgrade")
    public ResponseEntity<Map<String, Object>> applyUpgrade(@RequestBody ProjectApplyUpgradeRequest request) {
        return execute(() -> projectVersionManagementService.applyUpgrade(request));
    }

    @PostMapping("/rollback")
    public ResponseEntity<Map<String, Object>> rollback(@RequestBody ProjectRollbackRequest request) {
        return execute(() -> projectVersionManagementService.rollbackProject(request));
    }

    private ResponseEntity<Map<String, Object>> execute(Action action) {
        try {
            return ResponseEntity.ok(action.run());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            log.error("Project version-control API failed.", e);
            return ResponseEntity.internalServerError().body(errorBody("Project version-control API failed."));
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

    public static class ProjectQuery {
        private String projectId;

        public String getProjectId() {
            return projectId;
        }

        public void setProjectId(String projectId) {
            this.projectId = projectId;
        }
    }

    public static class PagingProjectQuery extends ProjectQuery {
        private Integer page;
        private Integer pageSize;

        public Integer getPage() {
            return page;
        }

        public void setPage(Integer page) {
            this.page = page;
        }

        public Integer getPageSize() {
            return pageSize;
        }

        public void setPageSize(Integer pageSize) {
            this.pageSize = pageSize;
        }

        int page() {
            return page == null || page.intValue() < 1 ? 1 : page.intValue();
        }

        int pageSize() {
            return pageSize == null || pageSize.intValue() < 1 ? 20 : pageSize.intValue();
        }
    }
}
