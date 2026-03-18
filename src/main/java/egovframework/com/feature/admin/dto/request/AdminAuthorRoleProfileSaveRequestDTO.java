package egovframework.com.feature.admin.dto.request;

import java.util.List;

public class AdminAuthorRoleProfileSaveRequestDTO {

    private String authorCode;
    private String roleCategory;
    private String displayTitle;
    private List<String> priorityWorks;
    private String description;
    private String memberEditVisibleYn;

    public String getAuthorCode() {
        return authorCode;
    }

    public void setAuthorCode(String authorCode) {
        this.authorCode = authorCode;
    }

    public String getRoleCategory() {
        return roleCategory;
    }

    public void setRoleCategory(String roleCategory) {
        this.roleCategory = roleCategory;
    }

    public String getDisplayTitle() {
        return displayTitle;
    }

    public void setDisplayTitle(String displayTitle) {
        this.displayTitle = displayTitle;
    }

    public List<String> getPriorityWorks() {
        return priorityWorks;
    }

    public void setPriorityWorks(List<String> priorityWorks) {
        this.priorityWorks = priorityWorks;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getMemberEditVisibleYn() {
        return memberEditVisibleYn;
    }

    public void setMemberEditVisibleYn(String memberEditVisibleYn) {
        this.memberEditVisibleYn = memberEditVisibleYn;
    }
}
