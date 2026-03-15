package egovframework.com.common.help;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HelpPageVO {

    private String pageId;
    private String title;
    private String summary;
    private String helpVersion;
    private String activeYn;
}
