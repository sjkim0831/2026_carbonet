package egovframework.com.feature.admin.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminBackupConfigSaveRequestDTO {

    private String backupRootPath;
    private String retentionDays;
    private String cronExpression;
    private String offsiteSyncEnabled;

    private String gitEnabled;
    private String gitRepositoryPath;
    private String gitRemoteName;
    private String gitRemoteUrl;
    private String gitUsername;
    private String gitAuthToken;
    private String gitBranchPattern;
    private String gitBundlePrefix;
    private String gitBackupMode;
    private String gitRestoreBranchPrefix;
    private String gitTagPrefix;

    private String dbEnabled;
    private String dbHost;
    private String dbPort;
    private String dbName;
    private String dbUser;
    private String dbDumpCommand;
    private String dbSchemaScope;
    private String versionMemo;
}
