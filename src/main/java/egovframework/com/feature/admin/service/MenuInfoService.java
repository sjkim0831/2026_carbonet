package egovframework.com.feature.admin.service;

import egovframework.com.feature.admin.dto.response.MenuInfoDTO;

import java.util.List;

public interface MenuInfoService {

    List<MenuInfoDTO> selectMenuUrlListByPrefix(String prefix) throws Exception;

    List<MenuInfoDTO> selectAdminMenuDetailList(String codeId) throws Exception;

    List<MenuInfoDTO> selectMenuTreeList(String codeId) throws Exception;

    MenuInfoDTO selectMenuDetailByUrl(String menuUrl) throws Exception;

    void saveMenuOrder(String menuCode, int sortOrdr) throws Exception;
}
