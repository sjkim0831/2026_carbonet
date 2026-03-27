package egovframework.com.feature.admin.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.common.audit.AuditTrailService;
import egovframework.com.feature.admin.model.ScreenBuilderComponentRegistryItemVO;
import egovframework.com.feature.admin.model.ScreenBuilderComponentRegistrySaveRequestVO;
import egovframework.com.feature.admin.model.ScreenBuilderComponentRegistryUpdateRequestVO;
import egovframework.com.feature.admin.model.ScreenBuilderDraftDocumentVO;
import egovframework.com.feature.admin.model.ScreenBuilderSaveRequestVO;
import egovframework.com.feature.admin.model.ScreenBuilderVersionSummaryVO;
import egovframework.com.feature.admin.service.ScreenBuilderDraftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Controller
@RequestMapping({"/admin", "/en/admin"})
@RequiredArgsConstructor
public class AdminScreenBuilderController {

    private final ScreenBuilderDraftService screenBuilderDraftService;
    private final AuditTrailService auditTrailService;
    private final ObjectMapper objectMapper;

    @RequestMapping(value = "/system/screen-builder", method = RequestMethod.GET)
    public String screenBuilderPage(HttpServletRequest request, Locale locale) {
        return forwardToAdminReactRoute("screen-builder", request, locale);
    }

    @RequestMapping(value = "/system/screen-runtime", method = RequestMethod.GET)
    public String screenRuntimePage(HttpServletRequest request, Locale locale) {
        return forwardToAdminReactRoute("screen-runtime", request, locale);
    }

    private String forwardToAdminReactRoute(String route, HttpServletRequest request, Locale locale) {
        StringBuilder builder = new StringBuilder("forward:");
        builder.append(isEnglishRequest(request, locale) ? "/en/admin/app?route=" : "/admin/app?route=");
        builder.append(route);
        String query = request == null ? "" : safe(request.getQueryString());
        if (!query.isEmpty()) {
            builder.append("&").append(query);
        }
        return builder.toString();
    }

    @GetMapping("/api/admin/screen-builder/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getScreenBuilderPage(
            @RequestParam(value = "menuCode", required = false) String menuCode,
            @RequestParam(value = "pageId", required = false) String pageId,
            @RequestParam(value = "menuTitle", required = false) String menuTitle,
            @RequestParam(value = "menuUrl", required = false) String menuUrl,
            HttpServletRequest request,
            Locale locale) throws Exception {
        return ResponseEntity.ok(screenBuilderDraftService.getPagePayload(menuCode, pageId, menuTitle, menuUrl, isEnglishRequest(request, locale)));
    }

    @GetMapping("/api/admin/screen-builder/status-summary")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getScreenBuilderStatusSummary(
            @RequestParam(value = "menuCode", required = false) List<String> menuCodes,
            HttpServletRequest request,
            Locale locale) throws Exception {
        return ResponseEntity.ok(screenBuilderDraftService.getStatusSummary(menuCodes, isEnglishRequest(request, locale)));
    }

    @PostMapping("/api/admin/screen-builder/status-summary/rebuild")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> rebuildScreenBuilderStatusSummary(
            @RequestParam(value = "menuCode", required = false) List<String> menuCodes,
            HttpServletRequest request,
            Locale locale) throws Exception {
        return ResponseEntity.ok(screenBuilderDraftService.rebuildStatusSummary(menuCodes, isEnglishRequest(request, locale)));
    }

    @GetMapping("/api/admin/screen-builder/preview")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getScreenBuilderPreview(
            @RequestParam(value = "menuCode", required = false) String menuCode,
            @RequestParam(value = "pageId", required = false) String pageId,
            @RequestParam(value = "menuTitle", required = false) String menuTitle,
            @RequestParam(value = "menuUrl", required = false) String menuUrl,
            @RequestParam(value = "versionStatus", required = false) String versionStatus,
            HttpServletRequest request,
            Locale locale) throws Exception {
        ScreenBuilderDraftDocumentVO draft = "PUBLISHED".equalsIgnoreCase(safe(versionStatus))
                ? screenBuilderDraftService.getLatestPublishedDraft(menuCode)
                : screenBuilderDraftService.getDraft(menuCode, pageId, menuTitle, menuUrl);
        if (draft == null) {
            draft = screenBuilderDraftService.getDraft(menuCode, pageId, menuTitle, menuUrl);
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEnglishRequest(request, locale));
        response.put("menuCode", safe(draft.getMenuCode()));
        response.put("pageId", safe(draft.getPageId()));
        response.put("menuTitle", safe(draft.getMenuTitle()));
        response.put("menuUrl", safe(draft.getMenuUrl()));
        response.put("templateType", safe(draft.getTemplateType()));
        response.put("versionStatus", safe(draft.getVersionStatus()));
        response.put("registryDiagnostics", screenBuilderDraftService.getRegistryDiagnostics(draft, isEnglishRequest(request, locale)));
        String releaseUnitId = resolveReleaseUnitId(draft);
        response.put("releaseUnitId", releaseUnitId);
        response.put("artifactEvidence", buildArtifactEvidence(draft, releaseUnitId));
        response.put("nodes", draft.getNodes());
        response.put("events", draft.getEvents());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/admin/screen-builder/draft")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveScreenBuilderDraft(
            @RequestBody ScreenBuilderSaveRequestVO request,
            HttpServletRequest httpServletRequest,
            Locale locale) {
        try {
            ScreenBuilderDraftDocumentVO before = screenBuilderDraftService.getDraft(
                    request == null ? "" : request.getMenuCode(),
                    request == null ? "" : request.getPageId(),
                    request == null ? "" : request.getMenuTitle(),
                    request == null ? "" : request.getMenuUrl()
            );
            Map<String, Object> response = screenBuilderDraftService.saveDraft(request, isEnglishRequest(httpServletRequest, locale));
            ScreenBuilderDraftDocumentVO after = screenBuilderDraftService.getDraft(
                    request == null ? "" : request.getMenuCode(),
                    request == null ? "" : request.getPageId(),
                    request == null ? "" : request.getMenuTitle(),
                    request == null ? "" : request.getMenuUrl()
            );
            auditTrailService.record(
                    resolveActorId(httpServletRequest),
                    resolveActorRole(httpServletRequest),
                    safe(request == null ? null : request.getMenuCode()),
                    "screen-builder",
                    "SCREEN_BUILDER_DRAFT_SAVE",
                    "SCREEN_BUILDER_DEF",
                    safe(request == null ? null : request.getMenuCode()),
                    "SUCCESS",
                    "Screen builder draft saved",
                    safeJson(before),
                    safeJson(after),
                    resolveRequestIp(httpServletRequest),
                    httpServletRequest == null ? "" : safe(httpServletRequest.getHeader("User-Agent"))
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/api/admin/screen-builder/versions")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getScreenBuilderVersions(
            @RequestParam(value = "menuCode", required = false) String menuCode) throws Exception {
        List<ScreenBuilderVersionSummaryVO> history = screenBuilderDraftService.getVersionHistory(menuCode);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("menuCode", safe(menuCode));
        response.put("versionHistory", history);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/admin/screen-builder/component-registry")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getScreenBuilderComponentRegistry(
            HttpServletRequest request,
            Locale locale) throws Exception {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("items", screenBuilderDraftService.getComponentRegistry(isEnglishRequest(request, locale)));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/admin/screen-builder/component-registry")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> registerScreenBuilderComponent(
            @RequestBody ScreenBuilderComponentRegistrySaveRequestVO request,
            HttpServletRequest httpServletRequest,
            Locale locale) {
        try {
            ScreenBuilderComponentRegistryItemVO item = screenBuilderDraftService.registerComponent(request, isEnglishRequest(httpServletRequest, locale));
            auditTrailService.record(
                    resolveActorId(httpServletRequest),
                    resolveActorRole(httpServletRequest),
                    safe(request == null ? null : request.getMenuCode()),
                    "screen-builder",
                    "SCREEN_BUILDER_COMPONENT_REGISTER",
                    "SCREEN_BUILDER_COMPONENT",
                    safe(item == null ? null : item.getComponentId()),
                    "SUCCESS",
                    "Screen builder component registered",
                    "",
                    safeJson(item),
                    resolveRequestIp(httpServletRequest),
                    httpServletRequest == null ? "" : safe(httpServletRequest.getHeader("User-Agent"))
            );
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("item", item);
            response.put("message", isEnglishRequest(httpServletRequest, locale) ? "Component registered." : "컴포넌트를 등록했습니다.");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/api/admin/screen-builder/component-registry/update")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateScreenBuilderComponentRegistry(
            @RequestBody ScreenBuilderComponentRegistryUpdateRequestVO request,
            HttpServletRequest httpServletRequest,
            Locale locale) {
        try {
            ScreenBuilderComponentRegistryItemVO item = screenBuilderDraftService.updateComponentRegistryItem(request, isEnglishRequest(httpServletRequest, locale));
            auditTrailService.record(
                    resolveActorId(httpServletRequest),
                    resolveActorRole(httpServletRequest),
                    safe(request == null ? null : request.getMenuCode()),
                    "screen-builder",
                    "SCREEN_BUILDER_COMPONENT_UPDATE",
                    "SCREEN_BUILDER_COMPONENT",
                    safe(item == null ? null : item.getComponentId()),
                    "SUCCESS",
                    "Screen builder component updated",
                    "",
                    safeJson(item),
                    resolveRequestIp(httpServletRequest),
                    httpServletRequest == null ? "" : safe(httpServletRequest.getHeader("User-Agent"))
            );
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("item", item);
            response.put("message", isEnglishRequest(httpServletRequest, locale) ? "Component updated." : "컴포넌트를 수정했습니다.");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/api/admin/screen-builder/component-registry/usage")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getScreenBuilderComponentRegistryUsage(
            @RequestParam(value = "componentId", required = false) String componentId,
            HttpServletRequest request,
            Locale locale) throws Exception {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("componentId", safe(componentId));
        response.put("items", screenBuilderDraftService.getComponentRegistryUsage(componentId, isEnglishRequest(request, locale)));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/admin/screen-builder/component-registry/delete")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteScreenBuilderComponentRegistry(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpServletRequest,
            Locale locale) {
        try {
            String componentId = safe(request == null ? null : request.get("componentId"));
            Map<String, Object> response = screenBuilderDraftService.deleteComponentRegistryItem(componentId, isEnglishRequest(httpServletRequest, locale));
            auditTrailService.record(
                    resolveActorId(httpServletRequest),
                    resolveActorRole(httpServletRequest),
                    "",
                    "screen-builder",
                    "SCREEN_BUILDER_COMPONENT_DELETE",
                    "SCREEN_BUILDER_COMPONENT",
                    componentId,
                    "SUCCESS",
                    "Screen builder component deleted",
                    "",
                    safeJson(response),
                    resolveRequestIp(httpServletRequest),
                    httpServletRequest == null ? "" : safe(httpServletRequest.getHeader("User-Agent"))
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/api/admin/screen-builder/component-registry/remap")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> remapScreenBuilderComponentRegistryUsage(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpServletRequest,
            Locale locale) {
        try {
            String fromComponentId = safe(request == null ? null : request.get("fromComponentId"));
            String toComponentId = safe(request == null ? null : request.get("toComponentId"));
            Map<String, Object> response = screenBuilderDraftService.replaceComponentRegistryUsage(fromComponentId, toComponentId, isEnglishRequest(httpServletRequest, locale));
            auditTrailService.record(
                    resolveActorId(httpServletRequest),
                    resolveActorRole(httpServletRequest),
                    "",
                    "screen-builder",
                    "SCREEN_BUILDER_COMPONENT_REMAP",
                    "SCREEN_BUILDER_COMPONENT",
                    fromComponentId,
                    "SUCCESS",
                    "Screen builder component usages remapped",
                    "",
                    safeJson(response),
                    resolveRequestIp(httpServletRequest),
                    httpServletRequest == null ? "" : safe(httpServletRequest.getHeader("User-Agent"))
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/api/admin/screen-builder/component-registry/auto-replace")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> autoReplaceDeprecatedScreenBuilderComponents(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpServletRequest,
            Locale locale) {
        try {
            String menuCode = safe(request == null ? null : request.get("menuCode"));
            Map<String, Object> response = screenBuilderDraftService.autoReplaceDeprecatedComponents(menuCode, isEnglishRequest(httpServletRequest, locale));
            auditTrailService.record(
                    resolveActorId(httpServletRequest),
                    resolveActorRole(httpServletRequest),
                    menuCode,
                    "screen-builder",
                    "SCREEN_BUILDER_COMPONENT_AUTO_REPLACE",
                    "SCREEN_BUILDER_COMPONENT",
                    menuCode,
                    "SUCCESS",
                    "Deprecated screen builder components auto replaced",
                    "",
                    safeJson(response),
                    resolveRequestIp(httpServletRequest),
                    httpServletRequest == null ? "" : safe(httpServletRequest.getHeader("User-Agent"))
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/api/admin/screen-builder/component-registry/auto-replace-preview")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> previewAutoReplaceDeprecatedScreenBuilderComponents(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpServletRequest,
            Locale locale) {
        try {
            String menuCode = safe(request == null ? null : request.get("menuCode"));
            return ResponseEntity.ok(screenBuilderDraftService.previewAutoReplaceDeprecatedComponents(menuCode, isEnglishRequest(httpServletRequest, locale)));
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/api/admin/screen-builder/component-registry/scan")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> scanScreenBuilderComponentRegistry(
            HttpServletRequest request,
            Locale locale) throws Exception {
        return ResponseEntity.ok(screenBuilderDraftService.scanAllDraftRegistryDiagnostics(isEnglishRequest(request, locale)));
    }

    @PostMapping("/api/admin/screen-builder/component-registry/add-node")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> addScreenBuilderNodeFromComponent(
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpServletRequest,
            Locale locale) {
        try {
            String menuCode = safe(request == null ? null : String.valueOf(request.getOrDefault("menuCode", "")));
            String componentId = safe(request == null ? null : String.valueOf(request.getOrDefault("componentId", "")));
            String parentNodeId = safe(request == null ? null : String.valueOf(request.getOrDefault("parentNodeId", "")));
            Map<String, Object> propsOverride = new LinkedHashMap<>();
            Object propsValue = request == null ? null : request.get("props");
            if (propsValue instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> casted = (Map<String, Object>) propsValue;
                propsOverride.putAll(casted);
            }
            Map<String, Object> response = screenBuilderDraftService.addNodeFromComponent(menuCode, componentId, parentNodeId, propsOverride, isEnglishRequest(httpServletRequest, locale));
            auditTrailService.record(
                    resolveActorId(httpServletRequest),
                    resolveActorRole(httpServletRequest),
                    menuCode,
                    "screen-builder",
                    "SCREEN_BUILDER_COMPONENT_ADD_NODE",
                    "SCREEN_BUILDER_COMPONENT",
                    componentId,
                    "SUCCESS",
                    "Screen builder node added from registered component",
                    "",
                    safeJson(response),
                    resolveRequestIp(httpServletRequest),
                    httpServletRequest == null ? "" : safe(httpServletRequest.getHeader("User-Agent"))
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/api/admin/screen-builder/component-registry/add-node-tree")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> addScreenBuilderNodeTreeFromComponents(
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpServletRequest,
            Locale locale) {
        try {
            String menuCode = safe(request == null ? null : String.valueOf(request.getOrDefault("menuCode", "")));
            List<Map<String, Object>> items = new java.util.ArrayList<>();
            Object itemsValue = request == null ? null : request.get("items");
            if (itemsValue instanceof List) {
                for (Object row : (List<?>) itemsValue) {
                    if (row instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> casted = new LinkedHashMap<>((Map<String, Object>) row);
                        items.add(casted);
                    }
                }
            }
            Map<String, Object> response = screenBuilderDraftService.addNodeTreeFromComponents(menuCode, items, isEnglishRequest(httpServletRequest, locale));
            auditTrailService.record(
                    resolveActorId(httpServletRequest),
                    resolveActorRole(httpServletRequest),
                    menuCode,
                    "screen-builder",
                    "SCREEN_BUILDER_COMPONENT_ADD_NODE_TREE",
                    "SCREEN_BUILDER_COMPONENT",
                    menuCode,
                    "SUCCESS",
                    "Screen builder node tree added from component contracts",
                    "",
                    safeJson(response),
                    resolveRequestIp(httpServletRequest),
                    httpServletRequest == null ? "" : safe(httpServletRequest.getHeader("User-Agent"))
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/api/admin/screen-builder/restore")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> restoreScreenBuilderDraft(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpServletRequest,
            Locale locale) {
        try {
            String menuCode = safe(request == null ? null : request.get("menuCode"));
            String versionId = safe(request == null ? null : request.get("versionId"));
            ScreenBuilderDraftDocumentVO before = screenBuilderDraftService.getDraft(menuCode, "", "", "");
            Map<String, Object> response = screenBuilderDraftService.restoreDraftVersion(menuCode, versionId, isEnglishRequest(httpServletRequest, locale));
            ScreenBuilderDraftDocumentVO after = screenBuilderDraftService.getDraft(menuCode, "", "", "");
            auditTrailService.record(
                    resolveActorId(httpServletRequest),
                    resolveActorRole(httpServletRequest),
                    menuCode,
                    "screen-builder",
                    "SCREEN_BUILDER_DRAFT_RESTORE",
                    "SCREEN_BUILDER_DEF",
                    menuCode,
                    "SUCCESS",
                    "Screen builder draft restored from version " + versionId,
                    safeJson(before),
                    safeJson(after),
                    resolveRequestIp(httpServletRequest),
                    httpServletRequest == null ? "" : safe(httpServletRequest.getHeader("User-Agent"))
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/api/admin/screen-builder/publish")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> publishScreenBuilderDraft(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpServletRequest,
            Locale locale) {
        try {
            String menuCode = safe(request == null ? null : request.get("menuCode"));
            ScreenBuilderDraftDocumentVO before = screenBuilderDraftService.getDraft(menuCode, "", "", "");
            Map<String, Object> response = screenBuilderDraftService.publishDraft(menuCode, isEnglishRequest(httpServletRequest, locale));
            ScreenBuilderDraftDocumentVO after = screenBuilderDraftService.getLatestPublishedDraft(menuCode);
            auditTrailService.record(
                    resolveActorId(httpServletRequest),
                    resolveActorRole(httpServletRequest),
                    menuCode,
                    "screen-builder",
                    "SCREEN_BUILDER_DRAFT_PUBLISH",
                    "SCREEN_BUILDER_DEF",
                    menuCode,
                    "SUCCESS",
                    "Screen builder draft published",
                    safeJson(before),
                    safeJson(after),
                    resolveRequestIp(httpServletRequest),
                    httpServletRequest == null ? "" : safe(httpServletRequest.getHeader("User-Agent"))
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    private String resolveActorId(HttpServletRequest request) {
        if (request == null) {
            return "";
        }
        HttpSession session = request.getSession(false);
        if (session == null) {
            return "";
        }
        Object loginVO = session.getAttribute("LoginVO");
        if (loginVO == null) {
            return "";
        }
        try {
            Object value = loginVO.getClass().getMethod("getId").invoke(loginVO);
            return value == null ? "" : value.toString();
        } catch (Exception ignored) {
            return "";
        }
    }

    private String resolveActorRole(HttpServletRequest request) {
        if (request == null) {
            return "";
        }
        HttpSession session = request.getSession(false);
        if (session == null) {
            return "";
        }
        Object loginVO = session.getAttribute("LoginVO");
        if (loginVO == null) {
            return "";
        }
        try {
            Object value = loginVO.getClass().getMethod("getAuthorCode").invoke(loginVO);
            return value == null ? "" : value.toString();
        } catch (Exception ignored) {
            return "";
        }
    }

    private String resolveRequestIp(HttpServletRequest request) {
        if (request == null) {
            return "";
        }
        String forwarded = safe(request.getHeader("X-Forwarded-For"));
        if (!forwarded.isEmpty()) {
            int commaIndex = forwarded.indexOf(',');
            return commaIndex >= 0 ? forwarded.substring(0, commaIndex).trim() : forwarded;
        }
        return safe(request.getRemoteAddr());
    }

    private String safeJson(Object value) {
        if (value == null) {
            return "";
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            return "";
        }
    }

    private boolean isEnglishRequest(HttpServletRequest request, Locale locale) {
        if (request != null && safe(request.getRequestURI()).startsWith("/en/admin")) {
            return true;
        }
        return locale != null && "en".equalsIgnoreCase(locale.getLanguage());
    }

    private String resolveReleaseUnitId(ScreenBuilderDraftDocumentVO draft) {
        if (draft == null) {
            return "";
        }
        if (!safe(draft.getVersionId()).isEmpty()) {
            return safe(draft.getVersionId());
        }
        if (!safe(draft.getPageId()).isEmpty()) {
            return safe(draft.getPageId());
        }
        return safe(draft.getMenuCode());
    }

    private Map<String, Object> buildArtifactEvidence(ScreenBuilderDraftDocumentVO draft, String releaseUnitId) {
        Map<String, Object> evidence = new LinkedHashMap<>();
        String menuCode = draft == null ? "" : safe(draft.getMenuCode()).toLowerCase();
        String pageId = draft == null ? "" : safe(draft.getPageId()).toLowerCase();
        evidence.put("artifactSourceSystem", "carbonet-ops");
        evidence.put("artifactTargetSystem", "carbonet-general");
        evidence.put("releaseUnitId", safe(releaseUnitId));
        evidence.put("runtimePackageId", "screen-builder-runtime-" + (menuCode.isEmpty() ? "menu" : menuCode) + "-" + (pageId.isEmpty() ? "page" : pageId));
        evidence.put("deployTraceId", "deploy-" + safe(releaseUnitId).toLowerCase().replaceAll("[^a-z0-9]+", "-"));
        evidence.put("publishedVersionId", draft == null ? "" : safe(draft.getVersionId()));
        evidence.put("publishedSavedAt", "");
        evidence.put("artifactKind", "screen-builder-runtime");
        evidence.put("artifactPathHint", "src/main/resources/static/react-app");
        return evidence;
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }
}
