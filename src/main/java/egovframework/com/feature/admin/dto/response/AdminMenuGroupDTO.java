package egovframework.com.feature.admin.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class AdminMenuGroupDTO {
    private String title;
    private String titleEn;
    private String icon;
    private List<AdminMenuLinkDTO> links = new ArrayList<>();
}
