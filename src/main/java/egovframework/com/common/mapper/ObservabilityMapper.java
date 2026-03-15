package egovframework.com.common.mapper;

import egovframework.com.common.audit.AuditEvent;
import egovframework.com.common.audit.AuditEventRecordVO;
import egovframework.com.common.audit.AuditEventSearchVO;
import egovframework.com.common.mapper.support.BaseMapperSupport;
import egovframework.com.common.trace.TraceEventRecordVO;
import egovframework.com.common.trace.TraceEventSearchVO;
import egovframework.com.common.trace.UiComponentRegistryVO;
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
