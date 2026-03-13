package egovframework.com.feature.admin.service.impl;

import egovframework.com.feature.admin.mapper.AdminLoginHistoryMapper;
import egovframework.com.feature.admin.model.vo.LoginHistorySearchVO;
import egovframework.com.feature.admin.model.vo.LoginHistoryVO;
import egovframework.com.feature.admin.service.AdminLoginHistoryService;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service("adminLoginHistoryService")
public class AdminLoginHistoryServiceImpl extends EgovAbstractServiceImpl implements AdminLoginHistoryService {

    private final AdminLoginHistoryMapper adminLoginHistoryMapper;

    public AdminLoginHistoryServiceImpl(AdminLoginHistoryMapper adminLoginHistoryMapper) {
        this.adminLoginHistoryMapper = adminLoginHistoryMapper;
    }

    @Override
    public void insertLoginHistory(String userId, String userNm, String userSe, String loginResult, String loginIp, String loginMessage) {
        LoginHistoryVO loginHistoryVO = new LoginHistoryVO();
        loginHistoryVO.setHistId(UUID.randomUUID().toString().replace("-", ""));
        loginHistoryVO.setUserId(safeString(userId));
        loginHistoryVO.setUserNm(safeString(userNm));
        loginHistoryVO.setUserSe(safeString(userSe).toUpperCase());
        loginHistoryVO.setLoginResult(safeString(loginResult).toUpperCase());
        loginHistoryVO.setLoginIp(safeString(loginIp));
        loginHistoryVO.setLoginMessage(safeString(loginMessage));
        adminLoginHistoryMapper.insertLoginHistory(loginHistoryVO);
    }

    @Override
    public int selectLoginHistoryListTotCnt(LoginHistorySearchVO searchVO) {
        return adminLoginHistoryMapper.selectLoginHistoryListTotCnt(searchVO);
    }

    @Override
    public List<LoginHistoryVO> selectLoginHistoryList(LoginHistorySearchVO searchVO) {
        return adminLoginHistoryMapper.selectLoginHistoryList(searchVO);
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }
}
