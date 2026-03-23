package egovframework.com.feature.admin.mapper;

import egovframework.com.feature.admin.dto.request.AdminCodeCommandDTO;
import egovframework.com.feature.admin.dto.response.MenuInfoDTO;

import java.util.List;

import org.springframework.stereotype.Repository;

import egovframework.com.common.mapper.support.BaseMapperSupport;

@Repository("menuInfoMapper")
public class MenuInfoMapper extends BaseMapperSupport {

    public List<MenuInfoDTO> selectMenuUrlListByPrefix(String prefix) {
        return selectList("MenuInfoMapper.selectMenuUrlListByPrefix", prefix);
    }

    public List<MenuInfoDTO> selectAdminMenuDetailList(String codeId) {
        return selectList("MenuInfoMapper.selectAdminMenuDetailList", codeId);
    }

    public List<MenuInfoDTO> selectMenuTreeList(String codeId) {
        return selectList("MenuInfoMapper.selectMenuTreeList", codeId);
    }

    public MenuInfoDTO selectMenuDetailByUrl(String menuUrl) {
        return selectOne("MenuInfoMapper.selectMenuDetailByUrl", menuUrl);
    }

    public int countMenuInfoByCode(String menuCode) {
        Integer count = selectOne("MenuInfoMapper.countMenuInfoByCode", menuCode);
        return count == null ? 0 : count;
    }

    public int countMenuOrder(String menuCode) {
        Integer count = selectOne("MenuInfoMapper.countMenuOrder", menuCode);
        return count == null ? 0 : count;
    }

    public void insertMenuOrder(String menuCode, int sortOrdr) {
        AdminCodeCommandDTO params = new AdminCodeCommandDTO();
        params.setCode(menuCode);
        params.setSortOrdr(sortOrdr);
        insert("MenuInfoMapper.insertMenuOrder", params);
    }

    public void updateMenuOrder(String menuCode, int sortOrdr) {
        AdminCodeCommandDTO params = new AdminCodeCommandDTO();
        params.setCode(menuCode);
        params.setSortOrdr(sortOrdr);
        update("MenuInfoMapper.updateMenuOrder", params);
    }

    public void updateMenuExposure(String menuCode, String expsrAt) {
        AdminCodeCommandDTO params = new AdminCodeCommandDTO();
        params.setCode(menuCode);
        params.setExpsrAt(expsrAt);
        update("MenuInfoMapper.updateMenuExposure", params);
    }
}
