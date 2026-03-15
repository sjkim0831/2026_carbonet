package egovframework.com.feature.admin.model.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeatureCatalogItemVO {

    private String menuCode;
    private String menuNm;
    private String menuNmEn;
    private String menuUrl;
    private String featureCode;
    private String featureNm;
    private String featureNmEn;
    private String featureDc;
    private String useAt;
    private int assignedRoleCount;
    private boolean unassignedToRole;
}
