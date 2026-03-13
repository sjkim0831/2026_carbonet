package egovframework.com.feature.admin.model.vo;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class FeatureCatalogSectionVO {

    private String menuCode;
    private String menuNm;
    private String menuNmEn;
    private String menuUrl;
    private List<FeatureCatalogItemVO> features = new ArrayList<>();
}
