package egovframework.com.common.mapper;

import egovframework.com.common.audit.AuditEvent;
import egovframework.com.common.audit.AuditEventRecordVO;
import egovframework.com.common.audit.AuditEventSearchVO;
import egovframework.com.common.error.ErrorEventRecordVO;
import egovframework.com.common.error.ErrorEventSearchVO;
import egovframework.com.common.logging.AccessEventRecordVO;
import egovframework.com.common.logging.AccessEventSearchVO;
import egovframework.com.common.mapper.support.BaseMapperSupport;
import egovframework.com.common.trace.TraceEventRecordVO;
import egovframework.com.common.trace.TraceEventSearchVO;
import egovframework.com.common.trace.UiComponentRegistryVO;
import egovframework.com.common.trace.UiComponentUsageVO;
import egovframework.com.common.trace.UiPageComponentDetailVO;
import egovframework.com.common.trace.UiPageComponentMapVO;
import egovframework.com.common.trace.UiPageManifestVO;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository("observabilityMapper")
public class ObservabilityMapper extends BaseMapperSupport {

    public void insertAuditEvent(AuditEvent auditEvent) {
        insert("ObservabilityMapper.insertAuditEvent", auditEvent);
    }

    public int selectAuditEventCount(AuditEventSearchVO searchVO) {
        Integer count = selectOne("ObservabilityMapper.selectAuditEventCount", searchVO);
        return count == null ? 0 : count;
    }

    public List<AuditEventRecordVO> selectAuditEventList(AuditEventSearchVO searchVO) {
        return selectList("ObservabilityMapper.selectAuditEventList", searchVO);
    }

    public void insertTraceEvent(TraceEventRecordVO traceEventRecordVO) {
        insert("ObservabilityMapper.insertTraceEvent", traceEventRecordVO);
    }

    public void insertAccessEvent(AccessEventRecordVO accessEventRecordVO) {
        insert("ObservabilityMapper.insertAccessEvent", accessEventRecordVO);
    }

    public int selectAccessEventCount(AccessEventSearchVO searchVO) {
        Integer count = selectOne("ObservabilityMapper.selectAccessEventCount", searchVO);
        return count == null ? 0 : count;
    }

    public List<AccessEventRecordVO> selectAccessEventList(AccessEventSearchVO searchVO) {
        return selectList("ObservabilityMapper.selectAccessEventList", searchVO);
    }

    public void insertErrorEvent(ErrorEventRecordVO errorEventRecordVO) {
        insert("ObservabilityMapper.insertErrorEvent", errorEventRecordVO);
    }

    public int selectErrorEventCount(ErrorEventSearchVO searchVO) {
        Integer count = selectOne("ObservabilityMapper.selectErrorEventCount", searchVO);
        return count == null ? 0 : count;
    }

    public List<ErrorEventRecordVO> selectErrorEventList(ErrorEventSearchVO searchVO) {
        return selectList("ObservabilityMapper.selectErrorEventList", searchVO);
    }

    public int selectTraceEventCount(TraceEventSearchVO searchVO) {
        Integer count = selectOne("ObservabilityMapper.selectTraceEventCount", searchVO);
        return count == null ? 0 : count;
    }

    public List<TraceEventRecordVO> selectTraceEventList(TraceEventSearchVO searchVO) {
        return selectList("ObservabilityMapper.selectTraceEventList", searchVO);
    }

    public int countUiPageManifest(String pageId) {
        Integer count = selectOne("ObservabilityMapper.countUiPageManifest", pageId);
        return count == null ? 0 : count;
    }

    public UiPageManifestVO selectUiPageManifest(String pageId) {
        return selectOne("ObservabilityMapper.selectUiPageManifest", pageId);
    }

    public List<UiPageManifestVO> selectUiPageManifestList() {
        return selectList("ObservabilityMapper.selectUiPageManifestList");
    }

    public void insertUiPageManifest(UiPageManifestVO manifest) {
        insert("ObservabilityMapper.insertUiPageManifest", manifest);
    }

    public void updateUiPageManifest(UiPageManifestVO manifest) {
        update("ObservabilityMapper.updateUiPageManifest", manifest);
    }

    public int countUiComponentRegistry(String componentId) {
        Integer count = selectOne("ObservabilityMapper.countUiComponentRegistry", componentId);
        return count == null ? 0 : count;
    }

    public void insertUiComponentRegistry(UiComponentRegistryVO component) {
        insert("ObservabilityMapper.insertUiComponentRegistry", component);
    }

    public void updateUiComponentRegistry(UiComponentRegistryVO component) {
        update("ObservabilityMapper.updateUiComponentRegistry", component);
    }

    public UiComponentRegistryVO selectUiComponentRegistry(String componentId) {
        return selectOne("ObservabilityMapper.selectUiComponentRegistry", componentId);
    }

    public List<UiComponentRegistryVO> selectUiComponentRegistryList() {
        return selectList("ObservabilityMapper.selectUiComponentRegistryList");
    }

    public void deleteUiComponentRegistry(String componentId) {
        delete("ObservabilityMapper.deleteUiComponentRegistry", componentId);
    }

    public List<UiComponentUsageVO> selectUiComponentUsageList(String componentId) {
        return selectList("ObservabilityMapper.selectUiComponentUsageList", componentId);
    }

    public void updateUiPageComponentMapComponentId(Map<String, String> payload) {
        update("ObservabilityMapper.updateUiPageComponentMapComponentId", payload);
    }

    public void deleteUiPageComponentMaps(String pageId) {
        delete("ObservabilityMapper.deleteUiPageComponentMaps", pageId);
    }

    public void insertUiPageComponentMap(UiPageComponentMapVO map) {
        insert("ObservabilityMapper.insertUiPageComponentMap", map);
    }

    public List<UiPageComponentDetailVO> selectUiPageComponentDetails(String pageId) {
        return selectList("ObservabilityMapper.selectUiPageComponentDetails", pageId);
    }
}
