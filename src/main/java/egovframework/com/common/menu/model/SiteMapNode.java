package egovframework.com.common.menu.model;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class SiteMapNode {

    private String code;
    private String label;
    private String url;
    private String icon;
    private List<SiteMapNode> children = new ArrayList<>();
}
