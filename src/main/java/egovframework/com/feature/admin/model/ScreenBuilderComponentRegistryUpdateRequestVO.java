package egovframework.com.feature.admin.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ScreenBuilderComponentRegistryUpdateRequestVO {

    private String componentId;
    private String status;
    private String replacementComponentId;
    private String menuCode;
}
