package egovframework.com.feature.auth.mapper;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

import egovframework.com.common.mapper.support.BaseMapperSupport;
import egovframework.com.feature.auth.dto.response.LoginResponseDTO;

@Component("authLoginMapper")
public class AuthLoginMapper extends BaseMapperSupport {

    public LoginResponseDTO selectGeneralLoginUser(String userId) {
        return selectOne("authLoginMapper.selectGeneralLoginUser", userId);
    }

    public LoginResponseDTO selectEnterpriseLoginUser(String userId) {
        return selectOne("authLoginMapper.selectEnterpriseLoginUser", userId);
    }

    public LoginResponseDTO selectEmployeeLoginUser(String userId) {
        return selectOne("authLoginMapper.selectEmployeeLoginUser", userId);
    }

    public LoginResponseDTO selectLoginUser(String userSe, String userId) {
        Map<String, Object> params = new HashMap<>();
        params.put("userSe", userSe);
        params.put("userId", userId);
        return selectOne("authLoginMapper.selectLoginUser", params);
    }

    public Map<String, Object> selectActiveAuthToken(String userId) {
        return selectOne("authLoginMapper.selectActiveAuthToken", userId);
    }

    public int insertAuthToken(Map<String, Object> params) {
        return insert("authLoginMapper.insertAuthToken", params);
    }

    public int deleteAuthTokenByUserId(String userId) {
        return delete("authLoginMapper.deleteAuthTokenByUserId", userId);
    }

    public int deleteAuthTokenByTokenKey(String tokenKey) {
        return delete("authLoginMapper.deleteAuthTokenByTokenKey", tokenKey);
    }

    public int touchAuthToken(String tokenKey) {
        return update("authLoginMapper.touchAuthToken", tokenKey);
    }
}
