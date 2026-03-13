package egovframework.com.feature.admin.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class AdminMenuDomainDTO {
    private String label;
    private String labelEn;
    private String summary;
    private List<AdminMenuGroupDTO> groups = new ArrayList<>();
}
