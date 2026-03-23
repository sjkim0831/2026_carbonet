package egovframework.com.feature.admin.model.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginHistoryVO {

    private String histId;
    private String userId;
    private String userNm;
    private String userSe;
    private String loginResult;
    private String loginIp;
    private String loginMessage;
    private String loginPnttm;
    private String insttId;
    private String companyName;
}
