package egovframework.com.feature.admin.service.impl;

import egovframework.com.common.util.ReactPageUrlMapper;
import egovframework.com.feature.admin.mapper.MenuInfoMapper;
import egovframework.com.feature.admin.dto.response.MenuInfoDTO;
import egovframework.com.feature.admin.service.MenuInfoService;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("menuInfoService")
public class MenuInfoServiceImpl extends EgovAbstractServiceImpl implements MenuInfoService {

    private final MenuInfoMapper menuInfoMapper;

    public MenuInfoServiceImpl(MenuInfoMapper menuInfoMapper) {
        this.menuInfoMapper = menuInfoMapper;
    }

    @Override
    public List<MenuInfoDTO> selectMenuUrlListByPrefix(String prefix) {
        return menuInfoMapper.selectMenuUrlListByPrefix(prefix);
    }

    @Override
    public List<MenuInfoDTO> selectAdminMenuDetailList(String codeId) {
        return menuInfoMapper.selectAdminMenuDetailList(codeId);
    }

    @Override
    public List<MenuInfoDTO> selectMenuTreeList(String codeId) {
        return menuInfoMapper.selectMenuTreeList(codeId);
    }

    @Override
    public MenuInfoDTO selectMenuDetailByUrl(String menuUrl) {
        String normalized = ReactPageUrlMapper.toCanonicalMenuUrl(menuUrl);
        return menuInfoMapper.selectMenuDetailByUrl(normalized.isEmpty() ? menuUrl : normalized);
    }

    @Override
    public void saveMenuOrder(String menuCode, int sortOrdr) {
        if (menuInfoMapper.countMenuOrder(menuCode) > 0) {
            menuInfoMapper.updateMenuOrder(menuCode, sortOrdr);
            return;
        }
        menuInfoMapper.insertMenuOrder(menuCode, sortOrdr);
    }
}
