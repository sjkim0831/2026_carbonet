package egovframework.com.feature.admin.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CodexProvisionRequest {

    private String requestId;
    private String actorId;
    private String targetApiPath;
    private String companyId;
    private String insttId;
    private String menuType;
    private boolean reloadSecurityMetadata = true;
    private PageRequest page;
    private List<FeatureRequest> features = new ArrayList<>();
    private List<AuthorRequest> authors = new ArrayList<>();
    private List<CommonCodeGroupRequest> commonCodeGroups = new ArrayList<>();

    @Getter
    @Setter
    public static class PageRequest {
        private String domainCode;
        private String domainName;
        private String domainNameEn;
        private String groupCode;
        private String groupName;
        private String groupNameEn;
        private String code;
        private String codeNm;
        private String codeDc;
        private String menuUrl;
        private String menuIcon;
        private String useAt;
    }

    @Getter
    @Setter
    public static class FeatureRequest {
        private String menuCode;
        private String featureCode;
        private String featureNm;
        private String featureNmEn;
        private String featureDc;
        private String useAt;
    }

    @Getter
    @Setter
    public static class AuthorRequest {
        private String authorCode;
        private String authorNm;
        private String authorDc;
        private List<String> featureCodes = new ArrayList<>();
    }

    @Getter
    @Setter
    public static class CommonCodeGroupRequest {
        private String classCode;
        private String classCodeNm;
        private String classCodeDc;
        private String classUseAt;
        private String codeId;
        private String codeIdNm;
        private String codeIdDc;
        private String useAt;
        private List<CommonCodeDetailRequest> details = new ArrayList<>();
    }

    @Getter
    @Setter
    public static class CommonCodeDetailRequest {
        private String code;
        private String codeNm;
        private String codeDc;
        private String useAt;
    }
}
