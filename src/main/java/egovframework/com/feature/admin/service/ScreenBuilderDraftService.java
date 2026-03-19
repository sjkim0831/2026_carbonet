package egovframework.com.feature.admin.service;

import egovframework.com.feature.admin.model.ScreenBuilderDraftDocumentVO;
import egovframework.com.feature.admin.model.ScreenBuilderComponentRegistryItemVO;
import egovframework.com.feature.admin.model.ScreenBuilderComponentRegistrySaveRequestVO;
import egovframework.com.feature.admin.model.ScreenBuilderComponentRegistryUpdateRequestVO;
import egovframework.com.feature.admin.model.ScreenBuilderComponentUsageVO;
import egovframework.com.feature.admin.model.ScreenBuilderSaveRequestVO;
import egovframework.com.feature.admin.model.ScreenBuilderVersionSummaryVO;

import java.util.List;
import java.util.Map;

public interface ScreenBuilderDraftService {

    Map<String, Object> getPagePayload(String menuCode, String pageId, String menuTitle, String menuUrl, boolean isEn) throws Exception;

    Map<String, Object> saveDraft(ScreenBuilderSaveRequestVO request, boolean isEn) throws Exception;

    ScreenBuilderDraftDocumentVO getDraft(String menuCode, String pageId, String menuTitle, String menuUrl) throws Exception;

    List<ScreenBuilderVersionSummaryVO> getVersionHistory(String menuCode) throws Exception;

    Map<String, Object> restoreDraftVersion(String menuCode, String versionId, boolean isEn) throws Exception;

    Map<String, Object> publishDraft(String menuCode, boolean isEn) throws Exception;

    ScreenBuilderDraftDocumentVO getLatestPublishedDraft(String menuCode) throws Exception;

    List<ScreenBuilderComponentRegistryItemVO> getComponentRegistry(boolean isEn) throws Exception;

    ScreenBuilderComponentRegistryItemVO registerComponent(ScreenBuilderComponentRegistrySaveRequestVO request, boolean isEn) throws Exception;

    ScreenBuilderComponentRegistryItemVO updateComponentRegistryItem(ScreenBuilderComponentRegistryUpdateRequestVO request, boolean isEn) throws Exception;

    List<ScreenBuilderComponentUsageVO> getComponentRegistryUsage(String componentId, boolean isEn) throws Exception;

    Map<String, Object> replaceComponentRegistryUsage(String fromComponentId, String toComponentId, boolean isEn) throws Exception;

    Map<String, Object> deleteComponentRegistryItem(String componentId, boolean isEn) throws Exception;

    Map<String, Object> autoReplaceDeprecatedComponents(String menuCode, boolean isEn) throws Exception;

    Map<String, Object> previewAutoReplaceDeprecatedComponents(String menuCode, boolean isEn) throws Exception;

    Map<String, Object> scanAllDraftRegistryDiagnostics(boolean isEn) throws Exception;

    Map<String, Object> addNodeFromComponent(String menuCode, String componentId, String parentNodeId, Map<String, Object> propsOverride, boolean isEn) throws Exception;

    Map<String, Object> addNodeTreeFromComponents(String menuCode, List<Map<String, Object>> items, boolean isEn) throws Exception;

    Map<String, Object> getRegistryDiagnostics(ScreenBuilderDraftDocumentVO draft, boolean isEn) throws Exception;
}
