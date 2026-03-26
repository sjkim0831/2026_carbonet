package egovframework.com.feature.admin.model.vo;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class AuthorRoleProfileVO {

    private String authorCode;
    private String displayTitle;
    private List<String> priorityWorks = new ArrayList<>();
    private String description;
    private String memberEditVisibleYn = "Y";
    private String roleType;
    private String baseRoleYn = "N";
    private String parentAuthorCode;
    private String assignmentScope;
    private List<String> defaultMemberTypes = new ArrayList<>();
    private String updatedAt;
}
