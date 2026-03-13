package egovframework.com.feature.admin.model.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginHistorySearchVO {

    private int firstIndex;
    private int recordCountPerPage;
    private String searchKeyword;
    private String userSe;
    private String loginResult;
    private String blockedOnly;
}
