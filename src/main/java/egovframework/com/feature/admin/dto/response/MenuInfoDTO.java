package egovframework.com.feature.admin.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MenuInfoDTO {

    private String menuCode;
    private String menuUrl;
    private String code;
    private String codeNm;
    private String codeDc;
    private String menuIcon;
    private String useAt;
    private String expsrAt;
    private Integer sortOrdr;
}
