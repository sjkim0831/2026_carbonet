package egovframework.com.feature.admin.service;

import egovframework.com.feature.admin.model.vo.LoginHistorySearchVO;
import egovframework.com.feature.admin.model.vo.LoginHistoryVO;

import java.util.List;

public interface AdminLoginHistoryService {

    void insertLoginHistory(String userId, String userNm, String userSe, String loginResult, String loginIp, String loginMessage) throws Exception;

    int selectLoginHistoryListTotCnt(LoginHistorySearchVO searchVO) throws Exception;

    List<LoginHistoryVO> selectLoginHistoryList(LoginHistorySearchVO searchVO) throws Exception;
}
