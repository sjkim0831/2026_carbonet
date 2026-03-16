package egovframework.com.feature.auth.mapper;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Repository;

import egovframework.com.common.mapper.support.BaseMapperSupport;
import egovframework.com.feature.auth.dto.response.LoginResponseDTO;

@Repository("authLoginMapper")
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
}
