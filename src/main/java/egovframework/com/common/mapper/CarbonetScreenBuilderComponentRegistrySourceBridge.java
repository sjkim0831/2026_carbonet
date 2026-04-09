package egovframework.com.common.mapper;

import egovframework.com.common.trace.UiComponentRegistryVO;
import egovframework.com.common.trace.UiComponentUsageVO;
import egovframework.com.platform.screenbuilder.support.ScreenBuilderComponentRegistryPort;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class CarbonetScreenBuilderComponentRegistrySourceBridge implements ScreenBuilderComponentRegistryPort {

    private final UiObservabilityRegistryMapper uiObservabilityRegistryMapper;

    public CarbonetScreenBuilderComponentRegistrySourceBridge(UiObservabilityRegistryMapper uiObservabilityRegistryMapper) {
        this.uiObservabilityRegistryMapper = uiObservabilityRegistryMapper;
    }

    @Override
    public List<UiComponentUsageVO> selectComponentUsageList(String componentId) throws Exception {
        return uiObservabilityRegistryMapper.selectUiComponentUsageList(componentId);
    }

    @Override
    public void remapComponentUsage(String fromComponentId, String toComponentId) throws Exception {
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("fromComponentId", fromComponentId);
        payload.put("toComponentId", toComponentId);
        uiObservabilityRegistryMapper.updateUiPageComponentMapComponentId(payload);
    }

    @Override
    public void deleteComponentRegistry(String componentId) throws Exception {
        uiObservabilityRegistryMapper.deleteUiComponentRegistry(componentId);
    }

    @Override
    public List<UiComponentRegistryVO> selectComponentRegistryList() throws Exception {
        return uiObservabilityRegistryMapper.selectUiComponentRegistryList();
    }

    @Override
    public int countComponentRegistry(String componentId) throws Exception {
        return uiObservabilityRegistryMapper.countUiComponentRegistry(componentId);
    }

    @Override
    public void upsertComponentRegistry(UiComponentRegistryVO row) throws Exception {
        if (countComponentRegistry(row == null ? null : row.getComponentId()) > 0) {
            uiObservabilityRegistryMapper.updateUiComponentRegistry(row);
            return;
        }
        uiObservabilityRegistryMapper.insertUiComponentRegistry(row);
    }
}
