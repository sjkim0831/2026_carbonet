package egovframework.com.feature.admin.model.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthorInfoVO {

    private String authorCode;
    private String authorNm;
    private String authorDc;
    private String authorCreatDe;

    public String getAuthorCode() {
        return authorCode;
    }
}
