import type { PageManifest } from "./types";

export const PAGE_MANIFESTS: Record<string, PageManifest> = {
  "home": {
    pageId: "home",
    routePath: "/home",
    menuCode: "HMENU_HOME",
    domainCode: "home",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "HomeHeroSection", instanceKey: "home-hero", layoutZone: "header" },
      { componentId: "HomeSearchSection", instanceKey: "home-search", layoutZone: "actions", propsSummary: ["searchKeyword"] },
      { componentId: "HomeServiceGrid", instanceKey: "home-services", layoutZone: "content", propsSummary: ["serviceCount"] },
      { componentId: "HomeSummarySection", instanceKey: "home-summary", layoutZone: "content", propsSummary: ["summaryCards"] }
    ]
  },
  "admin-home": {
    pageId: "admin-home",
    routePath: "/admin/",
    menuCode: "AMENU_ADMIN_HOME",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "AdminHomeCards", instanceKey: "admin-home-cards", layoutZone: "content", propsSummary: ["cardCount"] },
      { componentId: "AdminHomeApprovals", instanceKey: "admin-home-approvals", layoutZone: "content", propsSummary: ["approvalCount"] },
      { componentId: "AdminHomeProgress", instanceKey: "admin-home-progress", layoutZone: "content", propsSummary: ["reviewSteps"] }
    ]
  },
  "admin-login": {
    pageId: "admin-login",
    routePath: "/admin/login/loginView",
    menuCode: "AMENU_ADMIN_LOGIN",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "AdminLoginWarning", instanceKey: "admin-login-warning", layoutZone: "header" },
      { componentId: "AdminLoginForm", instanceKey: "admin-login-form", layoutZone: "content", propsSummary: ["userId", "rememberId"] },
      { componentId: "AdminLoginMfa", instanceKey: "admin-login-mfa", layoutZone: "content", propsSummary: ["mfaMethods"] }
    ]
  },
  "auth-group": {
    pageId: "auth-group",
    routePath: "/admin/auth/group",
    menuCode: "AMENU_AUTH_GROUP",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "AuthGroupFilters", instanceKey: "auth-group-filters", layoutZone: "actions", propsSummary: ["roleCategory", "insttId", "authorCode"] },
      { componentId: "AuthGroupCreateForm", instanceKey: "auth-group-create", layoutZone: "content", propsSummary: ["authorCode", "authorNm", "authorDc"] },
      { componentId: "AuthGroupRoleProfile", instanceKey: "auth-group-profile", layoutZone: "content", propsSummary: ["selectedAuthorProfile", "displayTitle", "priorityWorks", "memberEditVisibleYn"] },
      { componentId: "AuthGroupFeatureMatrix", instanceKey: "auth-group-features", layoutZone: "content", propsSummary: ["selectedFeatures", "featureCount"] }
    ]
  },
  "auth-change": {
    pageId: "auth-change",
    routePath: "/admin/member/auth-change",
    menuCode: "AMENU_AUTH_CHANGE",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "AuthChangeSummary", instanceKey: "auth-change-summary", layoutZone: "actions", propsSummary: ["currentUserId", "assignmentCount"] },
      { componentId: "AuthChangeTable", instanceKey: "auth-change-table", layoutZone: "content", propsSummary: ["roleAssignments", "authorGroups"] }
    ]
  },
  "dept-role": {
    pageId: "dept-role",
    routePath: "/admin/member/dept-role-mapping",
    menuCode: "AMENU_DEPT_ROLE",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "DeptRoleCompanySelector", instanceKey: "dept-role-company", layoutZone: "actions", propsSummary: ["insttId", "departmentCompanyOptions"] },
      { componentId: "DeptRoleDepartmentTable", instanceKey: "dept-role-departments", layoutZone: "content", propsSummary: ["departmentMappings", "departmentAuthorGroups", "roleProfilesByAuthorCode"] },
      { componentId: "DeptRoleMemberTable", instanceKey: "dept-role-members", layoutZone: "content", propsSummary: ["companyMembers", "memberAssignableAuthorGroups", "roleProfilesByAuthorCode"] },
      { componentId: "DeptRoleRoleProfilePreview", instanceKey: "dept-role-role-profile", layoutZone: "content", propsSummary: ["roleProfilesByAuthorCode", "selectedAuthorCode"] }
    ]
  },
  "admin-list": {
    pageId: "admin-list",
    routePath: "/admin/member/admin_list",
    menuCode: "AMENU_ADMIN_LIST",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "AdminListSearchForm", instanceKey: "admin-list-search", layoutZone: "actions", propsSummary: ["searchKeyword", "sbscrbSttus"] },
      { componentId: "AdminListTable", instanceKey: "admin-list-table", layoutZone: "content", propsSummary: ["member_list", "totalCount", "pageIndex"] }
    ]
  },
  "signin-login": {
    pageId: "signin-login",
    routePath: "/signin/loginView",
    menuCode: "HMENU_SIGNIN_LOGIN",
    domainCode: "home",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "SigninLoginNotice", instanceKey: "signin-login-notice", layoutZone: "header" },
      { componentId: "SigninLoginTabs", instanceKey: "signin-login-tabs", layoutZone: "actions", propsSummary: ["tab", "memberScope"] },
      { componentId: "SigninLoginForm", instanceKey: "signin-login-form", layoutZone: "content", propsSummary: ["userId", "saveId", "autoLogin"] },
      { componentId: "SigninSimpleAuthActions", instanceKey: "signin-login-simple-auth", layoutZone: "content", propsSummary: ["simpleAuthEnabled"] }
    ]
  },
  "signin-auth-choice": {
    pageId: "signin-auth-choice",
    routePath: "/signin/authChoice",
    menuCode: "HMENU_SIGNIN_AUTH_CHOICE",
    domainCode: "home",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "SigninAuthChoiceOptions", instanceKey: "signin-auth-choice-options", layoutZone: "content", propsSummary: ["availableMethods"] }
    ]
  },
  "signin-find-id": {
    pageId: "signin-find-id",
    routePath: "/signin/findId",
    menuCode: "HMENU_SIGNIN_FIND_ID",
    domainCode: "home",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "SigninFindIdForm", instanceKey: "signin-find-id-form", layoutZone: "content", propsSummary: ["applcntNm", "email", "code", "tab"] },
      { componentId: "SigninFindIdMethods", instanceKey: "signin-find-id-methods", layoutZone: "content", propsSummary: ["tab", "availableMethods"] },
      { componentId: "SigninFindIdResultCard", instanceKey: "signin-find-id-result-card", layoutZone: "content", propsSummary: ["maskedId", "found", "tab"] },
      { componentId: "SigninFindIdResultActions", instanceKey: "signin-find-id-result-actions", layoutZone: "actions", propsSummary: ["passwordResetUrl"] }
    ]
  },
  "signin-find-id-result": {
    pageId: "signin-find-id-result",
    routePath: "/signin/findId/result",
    menuCode: "HMENU_SIGNIN_FIND_ID_RESULT",
    domainCode: "home",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "SigninFindIdResultCard", instanceKey: "signin-find-id-result-card", layoutZone: "content", propsSummary: ["maskedId", "found", "tab"] },
      { componentId: "SigninFindIdResultActions", instanceKey: "signin-find-id-result-actions", layoutZone: "actions", propsSummary: ["passwordResetUrl"] }
    ]
  },
  "signin-find-password": {
    pageId: "signin-find-password",
    routePath: "/signin/findPassword",
    menuCode: "HMENU_SIGNIN_FIND_PASSWORD",
    domainCode: "home",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "SigninFindPasswordVerify", instanceKey: "signin-find-password-verify", layoutZone: "content", propsSummary: ["userId", "email", "verificationCode", "verified"] },
      { componentId: "SigninFindPasswordReset", instanceKey: "signin-find-password-reset", layoutZone: "content", propsSummary: ["password", "passwordConfirm"] },
      { componentId: "SigninFindPasswordActions", instanceKey: "signin-find-password-actions", layoutZone: "actions", propsSummary: ["verified", "submitting"] },
      { componentId: "SigninFindPasswordResultCard", instanceKey: "signin-find-password-result-card", layoutZone: "content", propsSummary: ["resetComplete"] },
      { componentId: "SigninFindPasswordResultAction", instanceKey: "signin-find-password-result-action", layoutZone: "actions", propsSummary: ["loginPath"] }
    ]
  },
  "signin-find-password-result": {
    pageId: "signin-find-password-result",
    routePath: "/signin/findPassword/result",
    menuCode: "HMENU_SIGNIN_FINDPW_RESULT",
    domainCode: "home",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "SigninFindPasswordResultCard", instanceKey: "signin-find-password-result-card", layoutZone: "content", propsSummary: ["resetComplete"] },
      { componentId: "SigninFindPasswordResultAction", instanceKey: "signin-find-password-result-action", layoutZone: "actions", propsSummary: ["loginPath"] }
    ]
  },
  "signin-forbidden": {
    pageId: "signin-forbidden",
    routePath: "/signin/loginForbidden",
    menuCode: "HMENU_SIGNIN_FORBIDDEN",
    domainCode: "home",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "SigninForbiddenCard", instanceKey: "signin-forbidden-card", layoutZone: "content", propsSummary: ["pathCode", "sectionLabel"] }
    ]
  },
  "member-list": {
    pageId: "member-list",
    routePath: "/admin/member/list",
    menuCode: "AMENU_MEMBER_LIST",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "MemberSearchForm", instanceKey: "member-list-search", layoutZone: "actions", propsSummary: ["searchKeyword", "membershipType", "status"] },
      { componentId: "MemberTable", instanceKey: "member-list-table", layoutZone: "content", propsSummary: ["rows", "pagination"] }
    ]
  },
  "member-withdrawn": {
    pageId: "member-withdrawn",
    routePath: "/admin/member/withdrawn",
    menuCode: "A0010106",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "MemberSearchForm", instanceKey: "member-withdrawn-search", layoutZone: "actions", propsSummary: ["searchKeyword", "membershipType", "status"] },
      { componentId: "MemberTable", instanceKey: "member-withdrawn-table", layoutZone: "content", propsSummary: ["rows", "pagination"] }
    ]
  },
  "member-activate": {
    pageId: "member-activate",
    routePath: "/admin/member/activate",
    menuCode: "A0010107",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "MemberSearchForm", instanceKey: "member-activate-search", layoutZone: "actions", propsSummary: ["searchKeyword", "membershipType", "status"] },
      { componentId: "MemberTable", instanceKey: "member-activate-table", layoutZone: "content", propsSummary: ["rows", "pagination"] }
    ]
  },
  "member-detail": {
    pageId: "member-detail",
    routePath: "/admin/member/detail",
    menuCode: "AMENU_MEMBER_DETAIL",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "MemberLookup", instanceKey: "member-detail-lookup", layoutZone: "actions", propsSummary: ["memberId"] },
      { componentId: "MemberProfileCard", instanceKey: "member-detail-summary", layoutZone: "content", propsSummary: ["memberStatus", "memberType"] },
      { componentId: "PasswordResetHistory", instanceKey: "member-detail-history", layoutZone: "content", propsSummary: ["historyRows"] }
    ]
  },
  "member-edit": {
    pageId: "member-edit",
    routePath: "/admin/member/edit",
    menuCode: "AMENU_MEMBER_EDIT",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "MemberEditSummaryCard", instanceKey: "member-edit-summary", layoutZone: "content", propsSummary: ["memberId", "membershipTypeLabel", "statusLabel", "businessRoleLabel"] },
      { componentId: "MemberEditRoleProfileSummary", instanceKey: "member-edit-role-profile", layoutZone: "content", propsSummary: ["assignedRoleProfile", "businessRoleLabel", "accessScopes"] },
      { componentId: "MemberEditForm", instanceKey: "member-edit-form", layoutZone: "content", propsSummary: ["applcntNm", "applcntEmailAdres", "phoneNumber", "deptNm", "entrprsSeCode", "entrprsMberSttus"] },
      { componentId: "MemberEditPermissionMatrix", instanceKey: "member-edit-permissions", layoutZone: "content", propsSummary: ["authorCode", "featureCodes", "permissionFeatureCount", "permissionPageCount"] },
      { componentId: "MemberEditAddressForm", instanceKey: "member-edit-address", layoutZone: "content", propsSummary: ["zip", "adres", "detailAdres"] },
      { componentId: "MemberEditEvidenceList", instanceKey: "member-edit-evidence", layoutZone: "content", propsSummary: ["memberEvidenceFiles"] },
      { componentId: "MemberEditActions", instanceKey: "member-edit-actions", layoutZone: "actions", propsSummary: ["memberId", "canUseMemberSave"] }
    ]
  },
  "external-keys": {
    pageId: "external-keys",
    routePath: "/admin/external/keys",
    menuCode: "A0050201",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "ExternalKeyFilters", instanceKey: "external-keys-filters", layoutZone: "actions", propsSummary: ["keyword", "authMethod", "rotationStatus"] },
      { componentId: "ExternalKeyInventoryTable", instanceKey: "external-keys-inventory", layoutZone: "content", propsSummary: ["externalKeyRows", "filteredRows", "refreshedAt"] },
      { componentId: "ExternalKeyRotationQueue", instanceKey: "external-keys-rotation-queue", layoutZone: "content", propsSummary: ["externalKeyRotationRows"] },
      { componentId: "ExternalKeyAuthBreakdown", instanceKey: "external-keys-auth-breakdown", layoutZone: "content", propsSummary: ["authMethodRows", "urgentRows"] },
      { componentId: "ExternalKeyQuickLinks", instanceKey: "external-keys-quick-links", layoutZone: "content", propsSummary: ["externalKeyQuickLinks"] },
      { componentId: "ExternalKeyGuidance", instanceKey: "external-keys-guidance", layoutZone: "content", propsSummary: ["externalKeyGuidance"] }
    ]
  },
  "certificate-review": {
    pageId: "certificate-review",
    routePath: "/admin/certificate/review",
    menuCode: "A0020201",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "CertificateReviewSummary", instanceKey: "certificate-review-summary", layoutZone: "content", propsSummary: ["requestedCount", "underReviewCount", "readyCount"] },
      { componentId: "CertificateReviewFilters", instanceKey: "certificate-review-search", layoutZone: "actions", propsSummary: ["searchKeyword", "status", "certificateType"] },
      { componentId: "CertificateReviewTable", instanceKey: "certificate-review-table", layoutZone: "content", propsSummary: ["rows", "pageIndex", "totalCount"] }
    ]
  },
  "external-connection-list": {
    pageId: "external-connection-list",
    routePath: "/admin/external/connection_list",
    menuCode: "A0050101",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "ExternalConnectionListFilters", instanceKey: "external-connection-list-filters", layoutZone: "actions", propsSummary: ["keyword", "status", "protocol", "source"] },
      { componentId: "ExternalConnectionListTable", instanceKey: "external-connection-list-table", layoutZone: "content", propsSummary: ["externalConnectionRows", "filteredCount", "pageNumber", "totalPages"] },
      { componentId: "ExternalConnectionIssueTable", instanceKey: "external-connection-list-issues", layoutZone: "content", propsSummary: ["externalConnectionIssueRows"] },
      { componentId: "ExternalConnectionGuidancePanel", instanceKey: "external-connection-list-guidance", layoutZone: "content", propsSummary: ["externalConnectionQuickLinks", "externalConnectionGuidance"] }
    ]
  },
  "external-connection-add": {
    pageId: "external-connection-add",
    routePath: "/admin/external/connection_add",
    menuCode: "A0050102",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "ExternalConnectionAddSummaryCards", instanceKey: "external-connection-add-summary", layoutZone: "content", propsSummary: ["completionRatio", "syncMode", "dirtyCount", "operationStatus"] },
      { componentId: "ExternalConnectionProfileForm", instanceKey: "external-connection-add-profile", layoutZone: "content", propsSummary: ["connectionName", "connectionId", "partnerName", "endpointUrl", "protocol", "authMethod"] },
      { componentId: "ExternalConnectionPolicyForm", instanceKey: "external-connection-add-sync-policy", layoutZone: "content", propsSummary: ["syncMode", "retryPolicy", "timeoutSeconds", "maintenanceWindow"] },
      { componentId: "ExternalConnectionOwnershipForm", instanceKey: "external-connection-add-ownership", layoutZone: "content", propsSummary: ["ownerName", "ownerContact", "operationStatus", "notes"] },
      { componentId: "ExternalConnectionAddActionBar", instanceKey: "external-connection-add-actions", layoutZone: "actions", propsSummary: ["saving", "mode=add"] }
    ]
  },
  "external-connection-edit": {
    pageId: "external-connection-edit",
    routePath: "/admin/external/connection_edit",
    menuCode: "A0050103",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "ExternalConnectionEditSummaryCards", instanceKey: "external-connection-edit-summary", layoutZone: "content", propsSummary: ["completionRatio", "syncMode", "dirtyCount", "operationStatus"] },
      { componentId: "ExternalConnectionProfileForm", instanceKey: "external-connection-edit-profile", layoutZone: "content", propsSummary: ["connectionName", "connectionId", "partnerName", "endpointUrl", "protocol", "authMethod"] },
      { componentId: "ExternalConnectionPolicyForm", instanceKey: "external-connection-edit-sync-policy", layoutZone: "content", propsSummary: ["syncMode", "retryPolicy", "timeoutSeconds", "maintenanceWindow"] },
      { componentId: "ExternalConnectionOwnershipForm", instanceKey: "external-connection-edit-ownership", layoutZone: "content", propsSummary: ["ownerName", "ownerContact", "operationStatus", "notes"] },
      { componentId: "ExternalConnectionEditActionBar", instanceKey: "external-connection-edit-actions", layoutZone: "actions", propsSummary: ["saving", "mode=edit", "connectionId"] }
    ]
  },
  "external-usage": {
    pageId: "external-usage",
    routePath: "/admin/external/usage",
    menuCode: "A0050108",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "ExternalUsageFilters", instanceKey: "external-usage-filters", layoutZone: "actions", propsSummary: ["keyword", "authMethod", "status"] },
      { componentId: "ExternalUsageSummaryCards", instanceKey: "external-usage-summary", layoutZone: "content", propsSummary: ["externalUsageSummary"] },
      { componentId: "ExternalUsageTable", instanceKey: "external-usage-table", layoutZone: "content", propsSummary: ["externalUsageRows", "filteredCount"] },
      { componentId: "ExternalUsageAuthBreakdown", instanceKey: "external-usage-auth", layoutZone: "content", propsSummary: ["externalUsageKeyRows"] },
      { componentId: "ExternalUsageTrendTable", instanceKey: "external-usage-trend", layoutZone: "content", propsSummary: ["externalUsageTrendRows"] },
      { componentId: "ExternalUsageQuickLinks", instanceKey: "external-usage-links", layoutZone: "content", propsSummary: ["externalUsageQuickLinks"] },
      { componentId: "ExternalUsageGuidance", instanceKey: "external-usage-guidance", layoutZone: "content", propsSummary: ["externalUsageGuidance"] }
    ]
  },
  "external-webhooks": {
    pageId: "external-webhooks",
    routePath: "/admin/external/webhooks",
    menuCode: "A0050203",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "ExternalWebhookFilters", instanceKey: "external-webhooks-filters", layoutZone: "actions", propsSummary: ["keyword", "syncMode", "status"] },
      { componentId: "ExternalWebhookSummaryCards", instanceKey: "external-webhooks-summary", layoutZone: "content", propsSummary: ["externalWebhookSummary"] },
      { componentId: "ExternalWebhookRegistryTable", instanceKey: "external-webhooks-targets", layoutZone: "content", propsSummary: ["externalWebhookRows", "refreshedAt"] },
      { componentId: "ExternalWebhookPolicyTable", instanceKey: "external-webhooks-deliveries", layoutZone: "content", propsSummary: ["externalWebhookDeliveryRows"] },
      { componentId: "ExternalWebhookQuickLinks", instanceKey: "external-webhooks-links", layoutZone: "content", propsSummary: ["externalWebhookQuickLinks"] },
      { componentId: "ExternalWebhookGuidance", instanceKey: "external-webhooks-guidance", layoutZone: "content", propsSummary: ["externalWebhookGuidance"] }
    ]
  },
  "external-sync": {
    pageId: "external-sync",
    routePath: "/admin/external/sync",
    menuCode: "A0050104",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "ExternalSyncFilters", instanceKey: "external-sync-filters", layoutZone: "actions", propsSummary: ["keyword", "syncMode", "status"] },
      { componentId: "ExternalSyncSummaryCards", instanceKey: "external-sync-summary", layoutZone: "content", propsSummary: ["externalSyncSummary"] },
      { componentId: "ExternalSyncRegistryTable", instanceKey: "external-sync-registry", layoutZone: "content", propsSummary: ["externalSyncRows", "filteredCount", "refreshedAt"] },
      { componentId: "ExternalSyncQueueTable", instanceKey: "external-sync-queue", layoutZone: "content", propsSummary: ["externalSyncQueueRows"] },
      { componentId: "ExternalSyncQuickLinks", instanceKey: "external-sync-links", layoutZone: "content", propsSummary: ["externalSyncQuickLinks"] },
      { componentId: "ExternalSyncGuidance", instanceKey: "external-sync-guidance", layoutZone: "content", propsSummary: ["externalSyncGuidance"] },
      { componentId: "ExternalSyncExecutionTable", instanceKey: "external-sync-executions", layoutZone: "content", propsSummary: ["externalSyncExecutionRows"] }
    ]
  },
  "external-logs": {
    pageId: "external-logs",
    routePath: "/admin/external/logs",
    menuCode: "A0050303",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "ExternalLogsFilters", instanceKey: "external-logs-filters", layoutZone: "actions", propsSummary: ["keyword", "logType", "severity"] },
      { componentId: "ExternalLogsSummaryCards", instanceKey: "external-logs-summary", layoutZone: "content", propsSummary: ["externalLogSummary"] },
      { componentId: "ExternalLogsTable", instanceKey: "external-logs-queue", layoutZone: "content", propsSummary: ["externalLogRows", "filteredCount"] },
      { componentId: "ExternalLogsIssueTable", instanceKey: "external-logs-issues", layoutZone: "content", propsSummary: ["externalLogIssueRows"] },
      { componentId: "ExternalLogsWatchList", instanceKey: "external-logs-watchlist", layoutZone: "content", propsSummary: ["externalLogConnectionRows"] },
      { componentId: "ExternalLogsQuickLinks", instanceKey: "external-logs-links", layoutZone: "content", propsSummary: ["externalLogQuickLinks"] },
      { componentId: "ExternalLogsGuidance", instanceKey: "external-logs-guidance", layoutZone: "content", propsSummary: ["externalLogGuidance"] }
    ]
  },
  "external-maintenance": {
    pageId: "external-maintenance",
    routePath: "/admin/external/maintenance",
    menuCode: "A0050107",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "ExternalMaintenanceFilters", instanceKey: "external-maintenance-filters", layoutZone: "actions", propsSummary: ["keyword", "syncMode", "status"] },
      { componentId: "ExternalMaintenanceSummaryCards", instanceKey: "external-maintenance-summary", layoutZone: "content", propsSummary: ["externalMaintenanceSummary"] },
      { componentId: "ExternalMaintenanceInventoryTable", instanceKey: "external-maintenance-inventory", layoutZone: "content", propsSummary: ["externalMaintenanceRows", "filteredCount", "refreshedAt"] },
      { componentId: "ExternalMaintenanceImpactTable", instanceKey: "external-maintenance-impact", layoutZone: "content", propsSummary: ["externalMaintenanceImpactRows"] },
      { componentId: "ExternalMaintenanceRunbook", instanceKey: "external-maintenance-runbook", layoutZone: "content", propsSummary: ["externalMaintenanceRunbooks"] },
      { componentId: "ExternalMaintenanceQuickLinks", instanceKey: "external-maintenance-links", layoutZone: "content", propsSummary: ["externalMaintenanceQuickLinks"] },
      { componentId: "ExternalMaintenanceGuidance", instanceKey: "external-maintenance-guidance", layoutZone: "content", propsSummary: ["externalMaintenanceGuidance"] }
    ]
  },
  "external-schema": {
    pageId: "external-schema",
    routePath: "/admin/external/schema",
    menuCode: "A0050202",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "ExternalSchemaFilters", instanceKey: "external-schema-filters", layoutZone: "actions", propsSummary: ["keyword", "domain", "status"] },
      { componentId: "ExternalSchemaSummaryCards", instanceKey: "external-schema-summary", layoutZone: "content", propsSummary: ["externalSchemaSummary"] },
      { componentId: "ExternalSchemaRegistryTable", instanceKey: "external-schema-registry", layoutZone: "content", propsSummary: ["externalSchemaRows", "filteredCount", "selectedSchemaId"] },
      { componentId: "ExternalSchemaReviewPanel", instanceKey: "external-schema-review", layoutZone: "content", propsSummary: ["activeSchemaId", "contractPreview", "reviewChecklist"] },
      { componentId: "ExternalSchemaQuickLinks", instanceKey: "external-schema-links", layoutZone: "content", propsSummary: ["externalSchemaQuickLinks"] },
      { componentId: "ExternalSchemaGuidance", instanceKey: "external-schema-guidance", layoutZone: "content", propsSummary: ["externalSchemaGuidance"] }
    ]
  },
  "external-monitoring": {
    pageId: "external-monitoring",
    routePath: "/admin/external/monitoring",
    menuCode: "A0050106",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "ExternalMonitoringFilters", instanceKey: "external-monitoring-filters", layoutZone: "actions", propsSummary: ["keyword", "healthStatus", "alertLevel"] },
      { componentId: "ExternalMonitoringSummaryCards", instanceKey: "external-monitoring-summary", layoutZone: "content", propsSummary: ["externalMonitoringSummary", "overallStatus"] },
      { componentId: "ExternalMonitoringOverviewTable", instanceKey: "external-monitoring-overview", layoutZone: "content", propsSummary: ["externalMonitoringRows", "filteredCount", "refreshedAt"] },
      { componentId: "ExternalMonitoringAlertTable", instanceKey: "external-monitoring-alerts", layoutZone: "content", propsSummary: ["externalMonitoringAlertRows"] },
      { componentId: "ExternalMonitoringTimelineTable", instanceKey: "external-monitoring-timeline", layoutZone: "content", propsSummary: ["externalMonitoringTimelineRows"] },
      { componentId: "ExternalMonitoringQuickLinks", instanceKey: "external-monitoring-links", layoutZone: "content", propsSummary: ["externalMonitoringQuickLinks"] },
      { componentId: "ExternalMonitoringGuidance", instanceKey: "external-monitoring-guidance", layoutZone: "content", propsSummary: ["externalMonitoringGuidance"] }
    ]
  },
  "company-detail": {
    pageId: "company-detail",
    routePath: "/admin/member/company_detail",
    menuCode: "AMENU_COMPANY_DETAIL",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "CompanyLookup", instanceKey: "company-detail-lookup", layoutZone: "actions", propsSummary: ["insttId"] },
      { componentId: "CompanySummaryCard", instanceKey: "company-detail-summary", layoutZone: "content", propsSummary: ["insttNm", "companyTypeLabel", "companyStatusLabel"] },
      { componentId: "CompanyFilesTable", instanceKey: "company-detail-files", layoutZone: "content", propsSummary: ["companyFiles", "fileCount"] }
    ]
  },
  "member-approve": {
    pageId: "member-approve",
    routePath: "/admin/member/approve",
    menuCode: "AMENU_MEMBER_APPROVE",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "MemberApprovalFilter", instanceKey: "member-approve-search", layoutZone: "actions", propsSummary: ["status", "membershipType", "searchKeyword"] },
      { componentId: "MemberApprovalBatchActions", instanceKey: "member-approve-batch-actions", layoutZone: "actions", propsSummary: ["selectedIds", "canUseMemberApproveAction"] },
      { componentId: "MemberApprovalTable", instanceKey: "member-approve-table", layoutZone: "content", propsSummary: ["rows", "pageIndex"] }
    ]
  },
  "company-approve": {
    pageId: "company-approve",
    routePath: "/admin/member/company-approve",
    menuCode: "AMENU_COMPANY_APPROVE",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "CompanyApprovalFilter", instanceKey: "company-approve-search", layoutZone: "actions", propsSummary: ["status", "result", "searchKeyword"] },
      { componentId: "CompanyApprovalBatchActions", instanceKey: "company-approve-batch-actions", layoutZone: "actions", propsSummary: ["selectedIds", "canUseCompanyApproveAction"] },
      { componentId: "CompanyApprovalTable", instanceKey: "company-approve-table", layoutZone: "content", propsSummary: ["rows", "pageIndex"] }
    ]
  },
  "certificate-pending": {
    pageId: "certificate-pending",
    routePath: "/admin/certificate/pending_list",
    menuCode: "AMENU_CERTIFICATE_PENDING",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "CertificatePendingSummary", instanceKey: "certificate-pending-summary", layoutZone: "actions", propsSummary: ["certificatePendingSummary"] },
      { componentId: "CertificatePendingFilter", instanceKey: "certificate-pending-search", layoutZone: "actions", propsSummary: ["certificateType", "processStatus", "searchKeyword"] },
      { componentId: "CertificatePendingTable", instanceKey: "certificate-pending-table", layoutZone: "content", propsSummary: ["certificatePendingRows", "pageIndex"] }
    ]
  },
  "company-list": {
    pageId: "company-list",
    routePath: "/admin/member/company_list",
    menuCode: "AMENU_COMPANY_LIST",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "CompanyListSearchForm", instanceKey: "company-list-search", layoutZone: "actions", propsSummary: ["searchKeyword", "sbscrbSttus", "pageIndex"] },
      { componentId: "CompanyListTable", instanceKey: "company-list-table", layoutZone: "content", propsSummary: ["company_list", "totalCount", "pageIndex"] },
      { componentId: "CompanyListPagination", instanceKey: "company-list-pagination", layoutZone: "actions", propsSummary: ["currentPage", "totalPages"] }
    ]
  },
  "company-account": {
    pageId: "company-account",
    routePath: "/admin/member/company_account",
    menuCode: "AMENU_COMPANY_ACCOUNT",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "CompanyAccountLookup", instanceKey: "company-account-lookup", layoutZone: "actions", propsSummary: ["lookupInsttId"] },
      { componentId: "CompanyAccountMembershipCards", instanceKey: "company-account-membership", layoutZone: "content", propsSummary: ["membershipType"] },
      { componentId: "CompanyAccountBusinessForm", instanceKey: "company-account-business", layoutZone: "content", propsSummary: ["agencyName", "representativeName", "bizRegistrationNumber", "zipCode", "companyAddress"] },
      { componentId: "CompanyAccountContactForm", instanceKey: "company-account-contact", layoutZone: "content", propsSummary: ["chargerName", "chargerEmail", "chargerTel"] },
      { componentId: "CompanyAccountFileUpload", instanceKey: "company-account-files", layoutZone: "content", propsSummary: ["fileUploads", "fileCount"] },
      { componentId: "CompanyAccountFileTable", instanceKey: "company-account-file-table", layoutZone: "content", propsSummary: ["companyAccountFiles"] },
      { componentId: "CompanyAccountActions", instanceKey: "company-account-actions", layoutZone: "actions", propsSummary: ["insttId", "isEditMode"] }
    ]
  },
  "join-wizard": {
    pageId: "join-wizard",
    routePath: "/join/step1",
    menuCode: "HMENU_JOIN_STEP1",
    domainCode: "join",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "JoinHero", instanceKey: "join-hero", layoutZone: "header" },
      { componentId: "MembershipTypeCardGroup", instanceKey: "membership-type-card-group", layoutZone: "content", propsSummary: ["membershipType"] },
      { componentId: "JoinWizardActions", instanceKey: "join-wizard-actions", layoutZone: "actions", propsSummary: ["nextEnabled"] }
    ]
  },
  "join-company-register": {
    pageId: "join-company-register",
    routePath: "/join/companyRegister",
    menuCode: "HMENU_JOIN_COMPANY_REGISTER",
    domainCode: "join",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "JoinCompanyContactForm", instanceKey: "join-company-register-contact", layoutZone: "content", propsSummary: ["chargerName", "chargerEmail", "chargerTel"] },
      { componentId: "JoinCompanyBusinessForm", instanceKey: "join-company-register-business", layoutZone: "content", propsSummary: ["membershipType", "agencyName", "representativeName", "bizRegistrationNumber"] },
      { componentId: "JoinCompanyFileUpload", instanceKey: "join-company-register-files", layoutZone: "content", propsSummary: ["uploadRows", "fileCount"] }
    ]
  },
  "join-company-register-complete": {
    pageId: "join-company-register-complete",
    routePath: "/join/companyRegisterComplete",
    menuCode: "HMENU_JOIN_COMP_REG_DONE",
    domainCode: "join",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "JoinCompanyRegisterCompleteSummary", instanceKey: "join-company-register-complete-summary", layoutZone: "content", propsSummary: ["insttNm", "bizrno", "regDate"] },
      { componentId: "JoinCompanyRegisterCompleteActions", instanceKey: "join-company-register-complete-actions", layoutZone: "actions", propsSummary: ["homePath", "statusGuidePath"] }
    ]
  },
  "join-company-status": {
    pageId: "join-company-status",
    routePath: "/join/companyJoinStatusSearch",
    menuCode: "HMENU_JOIN_COMPANY_STATUS",
    domainCode: "join",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "JoinCompanyStatusSearchForm", instanceKey: "join-company-status-search", layoutZone: "content", propsSummary: ["mode", "bizNo", "appNo", "repName", "agreed"] }
    ]
  },
  "join-company-status-guide": {
    pageId: "join-company-status-guide",
    routePath: "/join/companyJoinStatusGuide",
    menuCode: "HMENU_JOIN_COMP_STAT_GUIDE",
    domainCode: "join",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "JoinCompanyStatusGuide", instanceKey: "join-company-status-guide", layoutZone: "content", propsSummary: ["guideVisible"] }
    ]
  },
  "join-company-status-detail": {
    pageId: "join-company-status-detail",
    routePath: "/join/companyJoinStatusDetail",
    menuCode: "HMENU_JOIN_COMP_STAT_DETAIL",
    domainCode: "join",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "JoinCompanyStatusDetailSummary", instanceKey: "join-company-status-detail-summary", layoutZone: "content", propsSummary: ["insttId", "insttNm", "bizrno", "reprsntNm", "frstRegistPnttm"] },
      { componentId: "JoinCompanyStatusTimeline", instanceKey: "join-company-status-detail-timeline", layoutZone: "content", propsSummary: ["insttSttus", "rejectReason", "lastUpdated"] },
      { componentId: "JoinCompanyStatusFiles", instanceKey: "join-company-status-detail-files", layoutZone: "content", propsSummary: ["insttFiles", "fileCount"] },
      { componentId: "JoinCompanyStatusActions", instanceKey: "join-company-status-detail-actions", layoutZone: "actions", propsSummary: ["canReapply", "homePath"] }
    ]
  },
  "join-company-reapply": {
    pageId: "join-company-reapply",
    routePath: "/join/companyReapply",
    menuCode: "HMENU_JOIN_COMPANY_REAPPLY",
    domainCode: "join",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "JoinCompanyReapplyLookup", instanceKey: "join-company-reapply-lookup", layoutZone: "actions", propsSummary: ["bizNo", "repName"] },
      { componentId: "JoinCompanyReapplyForm", instanceKey: "join-company-reapply-form", layoutZone: "content", propsSummary: ["agencyName", "representativeName", "chargerName", "chargerEmail", "chargerTel"] },
      { componentId: "JoinCompanyReapplyFiles", instanceKey: "join-company-reapply-files", layoutZone: "content", propsSummary: ["uploadRows", "fileCount"] }
    ]
  },
  "join-terms": {
    pageId: "join-terms",
    routePath: "/join/step2",
    menuCode: "HMENU_JOIN_STEP2",
    domainCode: "join",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "JoinTermsAllAgree", instanceKey: "join-step2-all-agree", layoutZone: "content", propsSummary: ["agreeTerms", "agreePrivacy"] },
      { componentId: "JoinRequiredTerms", instanceKey: "join-step2-required-terms", layoutZone: "content", propsSummary: ["requiredTermsAccepted"] },
      { componentId: "JoinMarketingConsent", instanceKey: "join-step2-marketing", layoutZone: "content", propsSummary: ["marketingAgree"] }
    ]
  },
  "join-auth": {
    pageId: "join-auth",
    routePath: "/join/step3",
    menuCode: "HMENU_JOIN_STEP3",
    domainCode: "join",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "JoinAuthMethodGrid", instanceKey: "join-step3-methods", layoutZone: "content", propsSummary: ["authMethods", "submittingMethod"] }
    ]
  },
  "join-info": {
    pageId: "join-info",
    routePath: "/join/step4",
    menuCode: "HMENU_JOIN_STEP4",
    domainCode: "join",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "JoinUserInfoForm", instanceKey: "join-step4-user", layoutZone: "content", propsSummary: ["mberId", "mberNm", "phone", "email", "zip"] },
      { componentId: "JoinOrganizationForm", instanceKey: "join-step4-org", layoutZone: "content", propsSummary: ["insttId", "insttNm", "bizrno", "deptNm"] },
      { componentId: "JoinFileUploadSection", instanceKey: "join-step4-files", layoutZone: "content", propsSummary: ["uploadRows", "fileCount"] }
    ]
  },
  "join-complete": {
    pageId: "join-complete",
    routePath: "/join/step5",
    menuCode: "HMENU_JOIN_STEP5",
    domainCode: "join",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "JoinCompleteSummary", instanceKey: "join-step5-summary", layoutZone: "content", propsSummary: ["mberId", "mberNm", "insttNm"] },
      { componentId: "JoinCompleteActions", instanceKey: "join-step5-actions", layoutZone: "actions", propsSummary: ["homePath"] }
    ]
  },
  "mypage": {
    pageId: "mypage",
    routePath: "/mypage",
    menuCode: "HMENU_MYPAGE",
    domainCode: "home",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "MypageBasicInfoForm", instanceKey: "mypage-basic-info", layoutZone: "content", propsSummary: ["fullName", "userId", "email", "phone"] },
      { componentId: "MypageOrgInfoForm", instanceKey: "mypage-org-info", layoutZone: "content", propsSummary: ["companyName", "businessNumber", "jobTitle"] },
      { componentId: "MypageActions", instanceKey: "mypage-actions", layoutZone: "actions", propsSummary: ["submitting", "canSubmit"] }
    ]
  },
  "emission-project-list": {
    pageId: "emission-project-list",
    routePath: "/emission/project_list",
    menuCode: "H0010101",
    domainCode: "home",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "EmissionProjectHero", instanceKey: "emission-project-hero", layoutZone: "header", propsSummary: ["queueItems", "searchKeyword"] },
      { componentId: "EmissionProjectQueue", instanceKey: "emission-project-queue", layoutZone: "content", propsSummary: ["queueItems", "level", "due"] },
      { componentId: "EmissionProjectSiteCards", instanceKey: "emission-project-site-cards", layoutZone: "content", propsSummary: ["siteCards", "status", "value"] },
      { componentId: "EmissionProjectAdminLinkage", instanceKey: "emission-project-admin-linkage", layoutZone: "actions", propsSummary: ["adminSiteManagementHref", "session", "homeMenu"] }
    ]
  },
  "observability": {
    pageId: "observability",
    routePath: "/admin/system/observability",
    menuCode: "A0060303",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "ObservabilitySearchPanel", instanceKey: "observability-search-panel", layoutZone: "actions", propsSummary: ["traceId", "pageId", "actorId", "apiId"] },
      { componentId: "AuditEventTable", instanceKey: "audit-event-table", layoutZone: "content", propsSummary: ["items", "totalCount"] },
      { componentId: "TraceEventTable", instanceKey: "trace-event-table", layoutZone: "content", propsSummary: ["items", "totalCount"], conditionalRuleSummary: "Shown when trace tab is active" }
    ]
  },
  "help-management": {
    pageId: "help-management",
    routePath: "/admin/system/help-management",
    menuCode: "A1900101",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "HelpPageSelector", instanceKey: "help-management-select", layoutZone: "actions", propsSummary: ["pageId", "source", "menuCode"] },
      { componentId: "HelpMetadataForm", instanceKey: "help-management-page-form", layoutZone: "content", propsSummary: ["title", "summary", "helpVersion", "activeYn"] },
      { componentId: "HelpItemsEditor", instanceKey: "help-management-items", layoutZone: "content", propsSummary: ["items", "anchorSelector", "displayOrder"] }
    ]
  },
  "codex-request": {
    pageId: "codex-request",
    routePath: "/admin/system/codex-request",
    menuCode: "A1900103",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "CodexRuntimeConfigPanel", instanceKey: "codex-request-runtime", layoutZone: "actions", propsSummary: ["runnerEnabled", "repoRoot", "workspaceRoot", "planCommandConfigured", "buildCommandConfigured"] },
      { componentId: "CodexResponsePanel", instanceKey: "codex-response-panel", layoutZone: "actions", propsSummary: ["httpStatus", "createdCount", "existingCount", "skippedCount"] },
      { componentId: "CodexQueueTable", instanceKey: "codex-history-table", layoutZone: "content", propsSummary: ["tickets", "selectedTicketId", "ticketCount"] },
      { componentId: "CodexTicketDetailPanel", instanceKey: "codex-request-ticket-detail", layoutZone: "content", propsSummary: ["ticketId", "executionStatus", "summary", "instruction"] },
      { componentId: "CodexPlanArtifactPanel", instanceKey: "codex-request-plan-result", layoutZone: "content", propsSummary: ["artifactType", "filePath", "content"] },
      { componentId: "CodexBuildArtifactPanel", instanceKey: "codex-request-build-result", layoutZone: "content", propsSummary: ["artifactType", "filePath", "content"] },
      { componentId: "CodexRequestSetup", instanceKey: "codex-request-setup", layoutZone: "content", propsSummary: ["payload", "proxyMode"] },
      { componentId: "CodexHistoryTable", instanceKey: "codex-request-history-review", layoutZone: "content", propsSummary: ["items", "totalCount"] }
    ]
  },
  "full-stack-management": {
    pageId: "full-stack-management",
    routePath: "/admin/system/full-stack-management",
    menuCode: "A0060108",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "FullStackMenuScope", instanceKey: "full-stack-management-scope", layoutZone: "actions", propsSummary: ["menuType"] },
      { componentId: "FullStackMenuTree", instanceKey: "full-stack-management-tree", layoutZone: "content", propsSummary: ["selectedMenuCode", "menuTree"] },
      { componentId: "FullStackGovernancePanel", instanceKey: "menu-management-governance-panel", layoutZone: "content", propsSummary: ["governancePageId", "surfaceCount", "apiCount"] }
    ]
  },
  "platform-studio": {
    pageId: "platform-studio",
    routePath: "/admin/system/platform-studio",
    menuCode: "A0060109",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "PlatformStudioTabs", instanceKey: "platform-studio-tabs", layoutZone: "actions", propsSummary: ["focus"] },
      { componentId: "PlatformStudioMenuList", instanceKey: "platform-studio-menus", layoutZone: "content", propsSummary: ["selectedMenuCode", "coverageScore"] },
      { componentId: "PlatformStudioRegistry", instanceKey: "platform-studio-registry", layoutZone: "content", propsSummary: ["ownerScope", "resourceCounts"] },
      { componentId: "PlatformStudioAutomation", instanceKey: "platform-studio-automation", layoutZone: "content", propsSummary: ["summary", "instruction", "ticketCount"] }
    ]
  },
  "screen-elements-management": {
    pageId: "screen-elements-management",
    routePath: "/admin/system/screen-elements-management",
    menuCode: "A0060110",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "PlatformStudioTabs", instanceKey: "platform-studio-tabs", layoutZone: "actions", propsSummary: ["focus=surfaces"] },
      { componentId: "PlatformStudioRegistry", instanceKey: "platform-studio-registry", layoutZone: "content", propsSummary: ["componentIds", "frontendSources"] }
    ]
  },
  "event-management-console": {
    pageId: "event-management-console",
    routePath: "/admin/system/event-management-console",
    menuCode: "A0060111",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "PlatformStudioTabs", instanceKey: "platform-studio-tabs", layoutZone: "actions", propsSummary: ["focus=events"] },
      { componentId: "PlatformStudioRegistry", instanceKey: "platform-studio-registry", layoutZone: "content", propsSummary: ["eventIds"] }
    ]
  },
  "function-management-console": {
    pageId: "function-management-console",
    routePath: "/admin/system/function-management-console",
    menuCode: "A0060112",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "PlatformStudioTabs", instanceKey: "platform-studio-tabs", layoutZone: "actions", propsSummary: ["focus=functions"] },
      { componentId: "PlatformStudioRegistry", instanceKey: "platform-studio-registry", layoutZone: "content", propsSummary: ["functionIds", "parameterSpecs", "resultSpecs"] }
    ]
  },
  "api-management-console": {
    pageId: "api-management-console",
    routePath: "/admin/system/api-management-console",
    menuCode: "A0060113",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "PlatformStudioTabs", instanceKey: "platform-studio-tabs", layoutZone: "actions", propsSummary: ["focus=apis"] },
      { componentId: "PlatformStudioRegistry", instanceKey: "platform-studio-registry", layoutZone: "content", propsSummary: ["apiIds", "schemaIds"] }
    ]
  },
  "controller-management-console": {
    pageId: "controller-management-console",
    routePath: "/admin/system/controller-management-console",
    menuCode: "A0060114",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "PlatformStudioTabs", instanceKey: "platform-studio-tabs", layoutZone: "actions", propsSummary: ["focus=controllers"] },
      { componentId: "PlatformStudioMetadataTable", instanceKey: "platform-studio-controllers", layoutZone: "content", propsSummary: ["controllerActions", "serviceMethods", "mapperQueries"] }
    ]
  },
  "db-table-management": {
    pageId: "db-table-management",
    routePath: "/admin/system/db-table-management",
    menuCode: "A0060115",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "PlatformStudioTabs", instanceKey: "platform-studio-tabs", layoutZone: "actions", propsSummary: ["focus=db"] },
      { componentId: "PlatformStudioRegistry", instanceKey: "platform-studio-registry", layoutZone: "content", propsSummary: ["tableNames"] }
    ]
  },
  "column-management-console": {
    pageId: "column-management-console",
    routePath: "/admin/system/column-management-console",
    menuCode: "A0060116",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "PlatformStudioTabs", instanceKey: "platform-studio-tabs", layoutZone: "actions", propsSummary: ["focus=columns"] },
      { componentId: "PlatformStudioRegistry", instanceKey: "platform-studio-registry", layoutZone: "content", propsSummary: ["columnNames"] }
    ]
  },
  "automation-studio": {
    pageId: "automation-studio",
    routePath: "/admin/system/automation-studio",
    menuCode: "A0060117",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "PlatformStudioTabs", instanceKey: "platform-studio-tabs", layoutZone: "actions", propsSummary: ["focus=automation"] },
      { componentId: "PlatformStudioAutomation", instanceKey: "platform-studio-automation", layoutZone: "content", propsSummary: ["summary", "instruction", "ticketCount"] }
    ]
  },
  "password-reset": {
    pageId: "password-reset",
    routePath: "/admin/member/reset_password",
    menuCode: "AMENU_PASSWORD_RESET",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "PasswordResetSearch", instanceKey: "password-reset-search", layoutZone: "actions", propsSummary: ["memberId", "searchKeyword", "resetSource"] },
      { componentId: "PasswordResetHistory", instanceKey: "password-reset-history", layoutZone: "content", propsSummary: ["passwordResetHistoryList", "pageIndex"] }
    ]
  },
  "admin-permission": {
    pageId: "admin-permission",
    routePath: "/admin/member/admin_account/permissions",
    menuCode: "AMENU_ADMIN_PERMISSION",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "AdminPermissionSummary", instanceKey: "admin-permission-summary", layoutZone: "actions", propsSummary: ["emplyrId", "statusLabel"] },
      { componentId: "AdminPermissionFeatures", instanceKey: "admin-permission-features", layoutZone: "content", propsSummary: ["authorCode", "featureCodes"] }
    ]
  },
  "admin-create": {
    pageId: "admin-create",
    routePath: "/admin/member/admin_account",
    menuCode: "AMENU_ADMIN_CREATE",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "AdminCreateRolePreset", instanceKey: "admin-create-role", layoutZone: "actions", propsSummary: ["rolePreset"] },
      { componentId: "AdminCreateAccountForm", instanceKey: "admin-create-account", layoutZone: "content", propsSummary: ["adminId", "adminName", "adminEmail"] },
      { componentId: "AdminCreatePermissions", instanceKey: "admin-create-permissions", layoutZone: "content", propsSummary: ["featureCodes", "insttId"] }
    ]
  },
  "member-stats": {
    pageId: "member-stats",
    routePath: "/admin/member/stats",
    menuCode: "AMENU_MEMBER_STATS",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "MemberStatsSummary", instanceKey: "member-stats-summary", layoutZone: "actions", propsSummary: ["totalMembers", "memberTypeStats"] },
      { componentId: "MemberStatsTrend", instanceKey: "member-stats-trend", layoutZone: "content", propsSummary: ["monthlySignupStats"] },
      { componentId: "MemberStatsRegion", instanceKey: "member-stats-region", layoutZone: "content", propsSummary: ["regionalDistribution"] }
    ]
  },
  "member-register": {
    pageId: "member-register",
    routePath: "/admin/member/register",
    menuCode: "AMENU_MEMBER_REGISTER",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "MemberRegisterBasic", instanceKey: "member-register-basic", layoutZone: "content", propsSummary: ["userName", "userId", "userType"] },
      { componentId: "MemberRegisterAffiliation", instanceKey: "member-register-affiliation", layoutZone: "content", propsSummary: ["orgName", "permissions"] },
      { componentId: "MemberRegisterActions", instanceKey: "member-register-actions", layoutZone: "actions", propsSummary: ["canUseMemberRegisterSave"] },
      { componentId: "MemberRegisterOrgSearch", instanceKey: "member-register-org-search-title", layoutZone: "actions", propsSummary: ["canUseMemberRegisterOrgSearch", "insttId"] }
    ]
  },
  "trade-list": {
    pageId: "trade-list",
    routePath: "/admin/trade/list",
    menuCode: "AMENU_TRADE_LIST",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "TradeListSummary", instanceKey: "trade-list-summary", layoutZone: "actions", propsSummary: ["totalCount", "matchingCount", "settlementPendingCount", "completedCount"] },
      { componentId: "TradeListFilter", instanceKey: "trade-list-filter", layoutZone: "content", propsSummary: ["searchKeyword", "tradeStatus", "settlementStatus"] },
      { componentId: "TradeListTable", instanceKey: "trade-list-table", layoutZone: "content", propsSummary: ["tradeRows", "pageIndex", "totalPages"] }
    ]
  },
  "emission-result-list": {
    pageId: "emission-result-list",
    routePath: "/admin/emission/result_list",
    menuCode: "AMENU_EMISSION_RESULT_LIST",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "EmissionResultSummary", instanceKey: "emission-result-summary", layoutZone: "actions", propsSummary: ["totalCount", "reviewCount", "verifiedCount"] },
      { componentId: "EmissionResultSearch", instanceKey: "emission-result-search", layoutZone: "actions", propsSummary: ["searchKeyword", "resultStatus", "verificationStatus"] },
      { componentId: "EmissionResultTable", instanceKey: "emission-result-table", layoutZone: "content", propsSummary: ["emissionResultList", "pageIndex"] }
    ]
  },
  "emission-result-detail": {
    pageId: "emission-result-detail",
    routePath: "/admin/emission/result_detail",
    menuCode: "AMENU_EMISSION_RESULT_DETAIL",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "EmissionResultDetailSummary", instanceKey: "emission-result-detail-summary", layoutZone: "actions", propsSummary: ["resultId", "totalEmission", "siteCount", "evidenceCount"] },
      { componentId: "EmissionResultDetailOverview", instanceKey: "emission-result-detail-overview", layoutZone: "content", propsSummary: ["projectName", "companyName", "reportPeriod", "formulaVersion"] },
      { componentId: "EmissionResultDetailReview", instanceKey: "emission-result-detail-review", layoutZone: "content", propsSummary: ["reviewChecklist", "reviewMessage"] },
      { componentId: "EmissionResultDetailSites", instanceKey: "emission-result-detail-sites", layoutZone: "content", propsSummary: ["siteRows"] },
      { componentId: "EmissionResultDetailEvidence", instanceKey: "emission-result-detail-evidence", layoutZone: "content", propsSummary: ["evidenceRows"] },
      { componentId: "EmissionResultDetailHistory", instanceKey: "emission-result-detail-history", layoutZone: "content", propsSummary: ["historyRows"] },
      { componentId: "EmissionResultDetailActions", instanceKey: "emission-result-detail-actions", layoutZone: "actions", propsSummary: ["verificationActionUrl", "listUrl", "historyUrl"] }
    ]
  },
  "emission-validate": {
    pageId: "emission-validate",
    routePath: "/admin/emission/validate",
    menuCode: "A0020104",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "EmissionValidateContext", instanceKey: "emission-validate-context", layoutZone: "actions", propsSummary: ["resultId", "selectedResult"] },
      { componentId: "EmissionValidateSummary", instanceKey: "emission-validate-summary", layoutZone: "actions", propsSummary: ["totalCount", "pendingCount", "failedCount"] },
      { componentId: "EmissionValidateSearch", instanceKey: "emission-validate-search", layoutZone: "actions", propsSummary: ["searchKeyword", "verificationStatus", "priorityFilter"] },
      { componentId: "EmissionValidateLinks", instanceKey: "emission-validate-links", layoutZone: "content", propsSummary: ["actionLinks"] },
      { componentId: "EmissionValidateQueue", instanceKey: "emission-validate-table", layoutZone: "content", propsSummary: ["queueRows", "pageIndex"] },
      { componentId: "EmissionValidatePolicy", instanceKey: "emission-validate-policy", layoutZone: "content", propsSummary: ["priorityLegend", "policyRows"] }
    ]
  },
  "emission-data-history": {
    pageId: "emission-data-history",
    routePath: "/admin/emission/data_history",
    menuCode: "A0020106",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "EmissionDataHistorySummary", instanceKey: "emission-data-history-summary", layoutZone: "actions", propsSummary: ["totalCount", "correctionCount", "approvalCount"] },
      { componentId: "EmissionDataHistorySearch", instanceKey: "emission-data-history-search", layoutZone: "actions", propsSummary: ["searchKeyword", "changeType", "changeTarget"] },
      { componentId: "EmissionDataHistoryTable", instanceKey: "emission-data-history-table", layoutZone: "content", propsSummary: ["historyRows", "pageIndex"] }
    ]
  },
  "emission-site-management": {
    pageId: "emission-site-management",
    routePath: "/admin/emission/site-management",
    menuCode: "A0020105",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "EmissionSiteSummary", instanceKey: "emission-site-summary", layoutZone: "actions", propsSummary: ["summaryCards", "menuCode"] },
      { componentId: "EmissionSiteQuickLinks", instanceKey: "emission-site-quick-links", layoutZone: "content", propsSummary: ["quickLinks", "menuCode"] },
      { componentId: "EmissionSiteOperations", instanceKey: "emission-site-operation-cards", layoutZone: "content", propsSummary: ["operationCards", "statusLabel"] },
      { componentId: "EmissionSiteFeatureCatalog", instanceKey: "emission-site-feature-catalog", layoutZone: "content", propsSummary: ["featureRows", "featureCode", "manageUrl"] }
    ]
  },
  "system-code": {
    pageId: "system-code",
    routePath: "/admin/system/code",
    menuCode: "AMENU_SYSTEM_CODE",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "SystemCodeClass", instanceKey: "system-code-class", layoutZone: "content", propsSummary: ["clCodeList"] },
      { componentId: "SystemCodeGroup", instanceKey: "system-code-group", layoutZone: "content", propsSummary: ["codeList"] },
      { componentId: "SystemCodeDetail", instanceKey: "system-code-detail", layoutZone: "content", propsSummary: ["detailCodeList", "detailCodeId"] }
    ]
  },
  "page-management": {
    pageId: "page-management",
    routePath: "/admin/system/page-management",
    menuCode: "AMENU_PAGE_MANAGEMENT",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "PageManagementRegister", instanceKey: "page-management-register", layoutZone: "actions", propsSummary: ["domainCode", "code", "menuUrl"] },
      { componentId: "PageManagementList", instanceKey: "page-management-list", layoutZone: "content", propsSummary: ["pageRows", "searchKeyword", "searchUrl"] }
    ]
  },
  "function-management": {
    pageId: "function-management",
    routePath: "/admin/system/feature-management",
    menuCode: "AMENU_FUNCTION_MANAGEMENT",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "FunctionManagementRegister", instanceKey: "function-management-register", layoutZone: "actions", propsSummary: ["menuCode", "featureCode", "featureNm"] },
      { componentId: "FunctionManagementList", instanceKey: "function-management-list", layoutZone: "content", propsSummary: ["featureRows", "searchMenuCode", "searchKeyword"] }
    ]
  },
  "menu-management": {
    pageId: "menu-management",
    routePath: "/admin/system/menu-management",
    menuCode: "AMENU_MENU_MANAGEMENT",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "MenuManagementScope", instanceKey: "menu-management-scope", layoutZone: "actions", propsSummary: ["menuType"] },
      { componentId: "MenuManagementRegister", instanceKey: "menu-management-register", layoutZone: "content", propsSummary: ["parentCode", "menuUrl", "menuIcon"] },
      { componentId: "MenuManagementTree", instanceKey: "menu-management-tree", layoutZone: "content", propsSummary: ["treeData"] }
    ]
  },
  "ip-whitelist": {
    pageId: "ip-whitelist",
    routePath: "/admin/system/ip_whitelist",
    menuCode: "AMENU_IP_WHITELIST",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "IpWhitelistSummary", instanceKey: "ip-whitelist-summary", layoutZone: "actions", propsSummary: ["ipWhitelistSummary"] },
      { componentId: "IpWhitelistSearch", instanceKey: "ip-whitelist-search", layoutZone: "actions", propsSummary: ["searchIp", "accessScope", "status"] },
      { componentId: "IpWhitelistTable", instanceKey: "ip-whitelist-table", layoutZone: "content", propsSummary: ["ipWhitelistRows"] },
      { componentId: "IpWhitelistRequests", instanceKey: "ip-whitelist-requests", layoutZone: "content", propsSummary: ["ipWhitelistRequestRows"] }
    ]
  },
  "access-history": {
    pageId: "access-history",
    routePath: "/admin/system/access_history",
    menuCode: "A0060301",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "AccessHistorySearch", instanceKey: "access-history-search", layoutZone: "actions", propsSummary: ["searchKeyword", "insttId"] },
      { componentId: "AccessHistoryTable", instanceKey: "access-history-table", layoutZone: "content", propsSummary: ["accessHistoryList", "pageIndex"] }
    ]
  },
  "error-log": {
    pageId: "error-log",
    routePath: "/admin/system/error-log",
    menuCode: "A0060302",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "ErrorLogSearch", instanceKey: "error-log-search", layoutZone: "actions", propsSummary: ["searchKeyword", "insttId", "sourceType", "errorType"] },
      { componentId: "ErrorLogTable", instanceKey: "error-log-table", layoutZone: "content", propsSummary: ["errorLogList", "pageIndex"] }
    ]
  },
  "login-history": {
    pageId: "login-history",
    routePath: "/admin/member/login_history",
    menuCode: "AMENU_LOGIN_HISTORY",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "LoginHistorySearch", instanceKey: "login-history-search", layoutZone: "actions", propsSummary: ["searchKeyword", "userSe", "loginResult"] },
      { componentId: "LoginHistoryTable", instanceKey: "login-history-table", layoutZone: "content", propsSummary: ["loginHistoryList", "pageIndex"] }
    ]
  },
  "member-security-history": {
    pageId: "member-security-history",
    routePath: "/admin/member/security",
    menuCode: "A0010502",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "SecurityHistorySearch", instanceKey: "login-history-search", layoutZone: "actions", propsSummary: ["searchKeyword", "userSe", "loginResult=FAIL"] },
      { componentId: "SecurityHistoryTable", instanceKey: "login-history-table", layoutZone: "content", propsSummary: ["loginHistoryList", "pageIndex"] }
    ]
  },
  "security-history": {
    pageId: "security-history",
    routePath: "/admin/system/security",
    menuCode: "A0060205",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "SecurityHistorySearch", instanceKey: "login-history-search", layoutZone: "actions", propsSummary: ["searchKeyword", "userSe", "loginResult=FAIL"] },
      { componentId: "SecurityHistoryTable", instanceKey: "login-history-table", layoutZone: "content", propsSummary: ["loginHistoryList", "pageIndex"] }
    ]
  },
  "security-policy": {
    pageId: "security-policy",
    routePath: "/admin/system/security-policy",
    menuCode: "AMENU_SECURITY_POLICY",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "SecurityPolicySummary", instanceKey: "security-policy-summary", layoutZone: "actions", propsSummary: ["securityPolicySummary"] },
      { componentId: "SecurityPolicyTable", instanceKey: "security-policy-table", layoutZone: "content", propsSummary: ["securityPolicyRows"] },
      { componentId: "SecurityPolicyPlaybooks", instanceKey: "security-policy-playbooks", layoutZone: "content", propsSummary: ["securityPolicyPlaybooks"] }
    ]
  },
  "security-monitoring": {
    pageId: "security-monitoring",
    routePath: "/admin/system/security-monitoring",
    menuCode: "AMENU_SECURITY_MONITORING",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "SecurityMonitoringSummary", instanceKey: "security-monitoring-summary", layoutZone: "actions", propsSummary: ["securityMonitoringCards"] },
      { componentId: "SecurityMonitoringTargets", instanceKey: "security-monitoring-targets", layoutZone: "content", propsSummary: ["securityMonitoringTargets", "securityMonitoringIps"] },
      { componentId: "SecurityMonitoringEvents", instanceKey: "security-monitoring-events", layoutZone: "content", propsSummary: ["securityMonitoringEvents"] }
    ]
  },
  "blocklist": {
    pageId: "blocklist",
    routePath: "/admin/system/blocklist",
    menuCode: "AMENU_BLOCKLIST",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "BlocklistSearch", instanceKey: "blocklist-search", layoutZone: "actions", propsSummary: ["searchKeyword", "blockType", "status"] },
      { componentId: "BlocklistTable", instanceKey: "blocklist-table", layoutZone: "content", propsSummary: ["blocklistRows"] },
      { componentId: "BlocklistReleaseQueue", instanceKey: "blocklist-release-queue", layoutZone: "content", propsSummary: ["blocklistReleaseQueue"] }
    ]
  },
  "security-audit": {
    pageId: "security-audit",
    routePath: "/admin/system/security-audit",
    menuCode: "A0060206",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "SecurityAuditSummary", instanceKey: "security-audit-summary", layoutZone: "actions", propsSummary: ["securityAuditSummary"] },
      { componentId: "SecurityAuditTable", instanceKey: "security-audit-table", layoutZone: "content", propsSummary: ["securityAuditRows"] }
    ]
  },
  "certificate-audit-log": {
    pageId: "certificate-audit-log",
    routePath: "/admin/certificate/audit-log",
    menuCode: "AMENU_CERTIFICATE_AUDIT_LOG",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "CertificateAuditFilters", instanceKey: "certificate-audit-log-filters", layoutZone: "actions", propsSummary: ["auditType", "status", "certificateType"] },
      { componentId: "CertificateAuditSummary", instanceKey: "certificate-audit-log-summary", layoutZone: "actions", propsSummary: ["certificateAuditSummary", "certificateAuditAlerts"] },
      { componentId: "CertificateAuditTable", instanceKey: "certificate-audit-log-table", layoutZone: "content", propsSummary: ["certificateAuditRows"] }
    ]
  },
  "scheduler-management": {
    pageId: "scheduler-management",
    routePath: "/admin/system/scheduler",
    menuCode: "AMENU_SCHEDULER_MANAGEMENT",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "SchedulerManagementSearch", instanceKey: "scheduler-management-search", layoutZone: "actions", propsSummary: ["jobStatus", "executionType"] },
      { componentId: "SchedulerManagementJobs", instanceKey: "scheduler-management-jobs", layoutZone: "content", propsSummary: ["schedulerJobRows", "schedulerNodeRows"] },
      { componentId: "SchedulerManagementExecutions", instanceKey: "scheduler-management-executions", layoutZone: "content", propsSummary: ["schedulerExecutionRows"] }
    ]
  },
  "admin-sitemap": {
    pageId: "admin-sitemap",
    routePath: "/admin/content/sitemap",
    menuCode: "AMENU_ADMIN_SITEMAP",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "AdminSitemapHero", instanceKey: "admin-sitemap-hero", layoutZone: "header" },
      { componentId: "AdminSitemapTree", instanceKey: "admin-sitemap-tree", layoutZone: "content", propsSummary: ["siteMapSections"] }
    ]
  },
  "admin-menu-placeholder": {
    pageId: "admin-menu-placeholder",
    routePath: "/admin/placeholder",
    menuCode: "AMENU_ADMIN_PLACEHOLDER",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "AdminMenuPlaceholderCard", instanceKey: "admin-menu-placeholder-card", layoutZone: "content", propsSummary: ["placeholderTitle", "placeholderUrl"] }
    ]
  },
  "sitemap": {
    pageId: "sitemap",
    routePath: "/sitemap",
    menuCode: "HMENU_SITEMAP",
    domainCode: "home",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "SitemapHero", instanceKey: "sitemap-hero", layoutZone: "header" },
      { componentId: "SitemapTree", instanceKey: "sitemap-tree", layoutZone: "content", propsSummary: ["siteMapSections"] }
    ]
  },
  "home-menu-placeholder": {
    pageId: "home-menu-placeholder",
    routePath: "/placeholder",
    menuCode: "HMENU_PLACEHOLDER",
    domainCode: "home",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "HomeMenuPlaceholderCard", instanceKey: "home-menu-placeholder-card", layoutZone: "content", propsSummary: ["placeholderTitle", "placeholderUrl"] }
    ]
  },
  "environment-management": {
    pageId: "environment-management",
    routePath: "/admin/system/environment-management",
    menuCode: "A0060118",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "EnvironmentManagementSummary", instanceKey: "environment-management-summary", layoutZone: "actions", propsSummary: ["menuCode", "featureCode"] },
      { componentId: "EnvironmentManagementEngines", instanceKey: "environment-management-engines", layoutZone: "content", propsSummary: ["allowAllScope", "allowedMemberTypes", "scope-policy-engine", "audit-diagnostic-engine"] },
      { componentId: "EnvironmentManagementCards", instanceKey: "environment-management-cards", layoutZone: "content", propsSummary: ["system-code", "page-management", "function-management", "menu-management"] }
    ]
  },
  "screen-builder": {
    pageId: "screen-builder",
    routePath: "/admin/system/screen-builder",
    menuCode: "A1900106",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "ScreenBuilderSummaryCard", instanceKey: "screen-builder-summary", layoutZone: "actions", propsSummary: ["menuCode", "pageId", "templateType", "publishIssueCount"] },
      { componentId: "ScreenBuilderOverviewPanels", instanceKey: "screen-builder-overview", layoutZone: "content", propsSummary: ["publishReady", "versionHistory", "registryDiagnostics"] },
      { componentId: "ScreenBuilderEditorPanels", instanceKey: "screen-builder-editor", layoutZone: "content", propsSummary: ["selectedNodeId", "selectedTemplateType", "previewMode"] },
      { componentId: "ScreenBuilderGovernancePanels", instanceKey: "screen-builder-governance", layoutZone: "content", propsSummary: ["authorityProfile", "registryUsageRows", "registryIssueCount"] }
    ]
  },
  "screen-runtime": {
    pageId: "screen-runtime",
    routePath: "/admin/system/screen-runtime",
    menuCode: "A1900107",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "ScreenRuntimeSummaryCard", instanceKey: "screen-runtime-summary", layoutZone: "actions", propsSummary: ["menuCode", "pageId", "publishedVersionId", "snapshotCount"] },
      { componentId: "ScreenRuntimePublishAudit", instanceKey: "screen-runtime-publish-audit", layoutZone: "content", propsSummary: ["actionCode", "actorId", "createdAt"] },
      { componentId: "ScreenRuntimePreview", instanceKey: "screen-runtime-preview", layoutZone: "content", propsSummary: ["menuUrl", "templateType", "runtimeBlocked", "nodeCount"] },
      { componentId: "ScreenRuntimeBuilderActivity", instanceKey: "screen-runtime-builder-activity", layoutZone: "content", propsSummary: ["recentActivityCount", "traceId"] }
    ]
  },
  "current-runtime-compare": {
    pageId: "current-runtime-compare",
    routePath: "/admin/system/current-runtime-compare",
    menuCode: "A1900108",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "RuntimeCompareSummaryMetrics", instanceKey: "runtime-compare-metrics", layoutZone: "actions", propsSummary: ["compareRowCount", "mismatchCount", "gapCount", "recentAuditCount"] },
      { componentId: "RuntimeCompareScopePanel", instanceKey: "runtime-compare-scope", layoutZone: "content", propsSummary: ["menuCode", "pageId", "publishedVersionId", "draftVersionId"] },
      { componentId: "RuntimeCompareMatrix", instanceKey: "runtime-compare-matrix", layoutZone: "content", propsSummary: ["templateLineId", "screenFamilyRuleId", "currentNodeCount", "generatedNodeCount"] },
      { componentId: "RuntimeCompareRecentEvents", instanceKey: "runtime-compare-events", layoutZone: "content", propsSummary: ["latestPublishAt", "traceId", "actionCode"] }
    ]
  },
  "repair-workbench": {
    pageId: "repair-workbench",
    routePath: "/admin/system/repair-workbench",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "RepairWorkbenchScope", instanceKey: "repair-workbench-scope", layoutZone: "content", propsSummary: ["menuCode", "pageId", "releaseUnitId", "traceId"] },
      { componentId: "RepairWorkbenchLinkage", instanceKey: "repair-workbench-linkage", layoutZone: "content", propsSummary: ["builderId", "draftVersionId", "publishedVersionId", "selectedElementSet"] }
    ]
  },
  "screen-flow-management": {
    pageId: "screen-flow-management",
    routePath: "/admin/system/screen-flow-management",
    menuCode: "A1900109",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "ScreenFlowSummaryCards", instanceKey: "screen-flow-summary", layoutZone: "actions", propsSummary: ["registeredScreenCount", "surfaceCount", "eventCount", "apiSchemaCount"] },
      { componentId: "ScreenFlowCatalog", instanceKey: "screen-flow-catalog", layoutZone: "content", propsSummary: ["selectedPageId", "pageFilter", "filteredPageCount"] },
      { componentId: "ScreenFlowSurfaceChain", instanceKey: "screen-flow-surface-chain", layoutZone: "content", propsSummary: ["surfaceCount", "eventIds", "selector"] },
      { componentId: "ScreenFlowEventApiChain", instanceKey: "screen-flow-event-chain", layoutZone: "content", propsSummary: ["eventCount", "frontendFunction", "apiIds"] },
      { componentId: "ScreenFlowSchemaAndPermission", instanceKey: "screen-flow-schema-permission", layoutZone: "content", propsSummary: ["schemaCount", "requiredViewFeatureCode", "changeTargetCount"] }
    ]
  },
  "screen-menu-assignment-management": {
    pageId: "screen-menu-assignment-management",
    routePath: "/admin/system/screen-menu-assignment-management",
    menuCode: "A1900110",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "ScreenMenuAssignmentSummaryCards", instanceKey: "screen-menu-assignment-summary", layoutZone: "actions", propsSummary: ["pageMenuCount", "assignedCount", "unassignedCount", "orphanedScreenCount"] },
      { componentId: "ScreenMenuAssignmentCatalog", instanceKey: "screen-menu-assignment-catalog", layoutZone: "content", propsSummary: ["selectedMenuCode", "filter", "filteredAssignmentCount"] },
      { componentId: "ScreenMenuAssignmentDetail", instanceKey: "screen-menu-assignment-detail", layoutZone: "content", propsSummary: ["menuCode", "pageId", "layoutVersion", "requiredViewFeatureCode"] },
      { componentId: "ScreenMenuAssignmentOrphanPages", instanceKey: "screen-menu-assignment-orphans", layoutZone: "content", propsSummary: ["orphanPageCount", "pageId", "routePath", "menuCode"] }
    ]
  },
  "wbs-management": {
    pageId: "wbs-management",
    routePath: "/admin/system/wbs-management",
    menuCode: "A1900104",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "WbsSummaryCards", instanceKey: "wbs-summary-cards", layoutZone: "actions", propsSummary: ["scope", "totalMenus", "averageProgress"] },
      { componentId: "WbsMenuTree", instanceKey: "wbs-menu-tree", layoutZone: "content", propsSummary: ["menuType", "selectedMenuCode"] },
      { componentId: "WbsExecutionTable", instanceKey: "wbs-execution-table", layoutZone: "content", propsSummary: ["wbsRows", "waveSummary"] },
      { componentId: "WbsEditorPanel", instanceKey: "wbs-editor-panel", layoutZone: "content", propsSummary: ["owner", "status", "startDate", "endDate"] },
      { componentId: "WbsCodexPrompt", instanceKey: "wbs-codex-prompt", layoutZone: "content", propsSummary: ["codexPrompt", "codexInstruction"] }
    ]
  },
  "external-retry": {
    pageId: "external-retry",
    routePath: "/admin/external/retry",
    menuCode: "A0050105",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "ExternalRetryFilters", instanceKey: "external-retry-filters", layoutZone: "actions", propsSummary: ["keyword", "retryClass", "status"] },
      { componentId: "ExternalRetryQueue", instanceKey: "external-retry-queue", layoutZone: "content", propsSummary: ["rows", "filteredRows", "refreshedAt"] },
      { componentId: "ExternalRetryPolicy", instanceKey: "external-retry-policy", layoutZone: "content", propsSummary: ["policyRows", "ownerName", "status"] },
      { componentId: "ExternalRetryHistory", instanceKey: "external-retry-history", layoutZone: "content", propsSummary: ["executionRows", "result", "duration"] },
      { componentId: "ExternalRetryGuidance", instanceKey: "external-retry-guidance", layoutZone: "content", propsSummary: ["quickLinks", "guidance"] }
    ]
  },
  "sr-workbench": {
    pageId: "sr-workbench",
    routePath: "/admin/system/sr-workbench",
    menuCode: "A1900102",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "SrTicketDraftForm", instanceKey: "sr-ticket-draft", layoutZone: "actions", propsSummary: ["pageId", "surfaceId", "eventId", "targetId"] },
      { componentId: "SrDirectionPreview", instanceKey: "sr-direction-preview", layoutZone: "content", propsSummary: ["generatedDirection", "commandPrompt"] },
      { componentId: "SrTicketTable", instanceKey: "sr-ticket-table", layoutZone: "content", propsSummary: ["tickets", "approvalComment", "executionStatus"] }
    ]
  },
};

export function getPageManifest(pageId: string) {
  return PAGE_MANIFESTS[pageId];
}
