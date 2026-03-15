package egovframework.com.common.help;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class HelpManagementSaveRequest {

    private String pageId;
    private String title;
    private String summary;
    private String helpVersion;
    private String activeYn;
    private List<HelpManagementItemRequest> items = new ArrayList<>();
}
