package egovframework.com.feature.admin.model.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmissionCategoryVO {

    private Long categoryId;
    private String majorCode;
    private String majorName;
    private String subCode;
    private String subName;
    private String useYn;
}
