package egovframework.com.feature.admin.model.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserAuthorityTargetVO {

    private String userId;
    private String userNm;
    private String insttId;
    private String cmpnyNm;
    private String deptNm;
    private String authorCode;
    private String authorNm;

    public String getAuthorCode() {
        return authorCode;
    }
}
