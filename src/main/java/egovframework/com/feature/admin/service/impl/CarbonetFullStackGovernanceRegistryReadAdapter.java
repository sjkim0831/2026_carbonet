package egovframework.com.feature.admin.service.impl;

import egovframework.com.platform.read.FullStackGovernanceRegistryReadPort;

import java.util.Map;

public class CarbonetFullStackGovernanceRegistryReadAdapter implements FullStackGovernanceRegistryReadPort {

    private final FullStackGovernanceRegistryReadPort fullStackGovernanceRegistryReadPort;

    public CarbonetFullStackGovernanceRegistryReadAdapter(FullStackGovernanceRegistryReadPort fullStackGovernanceRegistryReadPort) {
        this.fullStackGovernanceRegistryReadPort = fullStackGovernanceRegistryReadPort;
    }

    @Override
    public Map<String, Object> getEntry(String menuCode) {
        return fullStackGovernanceRegistryReadPort.getEntry(menuCode);
    }

    @Override
    public Map<String, Map<String, Object>> getAllEntries() {
        return fullStackGovernanceRegistryReadPort.getAllEntries();
    }
}
