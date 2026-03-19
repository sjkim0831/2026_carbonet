package egovframework.com.feature.admin.model;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ScreenBuilderSaveRequestVO {

    private String pageId;
    private String menuCode;
    private String menuTitle;
    private String menuUrl;
    private String templateType;
    private List<ScreenBuilderNodeVO> nodes = new ArrayList<>();
    private List<ScreenBuilderEventBindingVO> events = new ArrayList<>();
}
