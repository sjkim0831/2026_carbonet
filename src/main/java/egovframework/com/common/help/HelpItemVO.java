package egovframework.com.common.help;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HelpItemVO {

    private String itemId;
    private String pageId;
    private String title;
    private String body;
    private String anchorSelector;
    private Integer displayOrder;
    private String activeYn;
    private String placement;
    private String imageUrl;
    private String iconName;
    private String highlightStyle;
    private String ctaLabel;
    private String ctaUrl;
}
