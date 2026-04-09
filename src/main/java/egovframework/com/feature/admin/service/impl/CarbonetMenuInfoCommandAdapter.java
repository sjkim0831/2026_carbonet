package egovframework.com.feature.admin.service.impl;

import egovframework.com.feature.admin.service.MenuInfoCommandService;
import egovframework.com.feature.admin.service.MenuInfoService;
public class CarbonetMenuInfoCommandAdapter implements MenuInfoCommandService {

    private final MenuInfoService menuInfoService;

    public CarbonetMenuInfoCommandAdapter(MenuInfoService menuInfoService) {
        this.menuInfoService = menuInfoService;
    }

    @Override
    public void saveMenuOrder(String menuCode, int sortOrdr) throws Exception {
        menuInfoService.saveMenuOrder(menuCode, sortOrdr);
    }
}
