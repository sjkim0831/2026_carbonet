package egovframework.com.feature.admin.service.impl;

import egovframework.com.feature.admin.dto.response.MenuInfoDTO;
import egovframework.com.feature.admin.service.MenuInfoService;
import egovframework.com.platform.read.MenuInfoReadPort;

import java.util.List;

public class CarbonetMenuInfoReadAdapter implements MenuInfoReadPort {

    private final MenuInfoService menuInfoService;

    public CarbonetMenuInfoReadAdapter(MenuInfoService menuInfoService) {
        this.menuInfoService = menuInfoService;
    }

    @Override
    public List<MenuInfoDTO> selectMenuUrlListByPrefix(String prefix) throws Exception {
        return menuInfoService.selectMenuUrlListByPrefix(prefix);
    }

    @Override
    public List<MenuInfoDTO> selectAdminMenuDetailList(String codeId) throws Exception {
        return menuInfoService.selectAdminMenuDetailList(codeId);
    }

    @Override
    public List<MenuInfoDTO> selectMenuTreeList(String codeId) throws Exception {
        return menuInfoService.selectMenuTreeList(codeId);
    }

    @Override
    public MenuInfoDTO selectMenuDetailByUrl(String menuUrl) throws Exception {
        return menuInfoService.selectMenuDetailByUrl(menuUrl);
    }

    @Override
    public long getMenuTreeVersion() {
        return menuInfoService.getMenuTreeVersion();
    }
}
