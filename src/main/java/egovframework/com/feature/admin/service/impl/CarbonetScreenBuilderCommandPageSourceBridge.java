package egovframework.com.feature.admin.service.impl;

import egovframework.com.feature.admin.service.ScreenCommandCenterService;
import egovframework.com.feature.admin.screenbuilder.support.CarbonetScreenBuilderCommandPageSource;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class CarbonetScreenBuilderCommandPageSourceBridge implements CarbonetScreenBuilderCommandPageSource {

    private final ScreenCommandCenterService screenCommandCenterService;

    public CarbonetScreenBuilderCommandPageSourceBridge(ScreenCommandCenterService screenCommandCenterService) {
        this.screenCommandCenterService = screenCommandCenterService;
    }

    @Override
    public Map<String, Object> getScreenCommandPage(String pageId) throws Exception {
        return screenCommandCenterService.getScreenCommandPage(pageId);
    }
}
