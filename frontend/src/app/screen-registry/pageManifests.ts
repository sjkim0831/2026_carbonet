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
      { componentId: "DeptRoleDepartmentTable", instanceKey: "dept-role-departments", layoutZone: "content", propsSummary: ["departmentMappings", "departmentAuthorGroups"] },
      { componentId: "DeptRoleMemberTable", instanceKey: "dept-role-members", layoutZone: "content", propsSummary: ["companyMembers", "memberAssignableAuthorGroups"] }
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
      { componentId: "MemberEditForm", instanceKey: "member-edit-form", layoutZone: "content", propsSummary: ["applcntNm", "applcntEmailAdres", "phoneNumber", "deptNm", "entrprsSeCode", "entrprsMberSttus"] },
      { componentId: "MemberEditPermissionMatrix", instanceKey: "member-edit-permissions", layoutZone: "content", propsSummary: ["authorCode", "featureCodes", "permissionFeatureCount", "permissionPageCount"] },
      { componentId: "MemberEditAddressForm", instanceKey: "member-edit-address", layoutZone: "content", propsSummary: ["zip", "adres", "detailAdres"] },
      { componentId: "MemberEditEvidenceList", instanceKey: "member-edit-evidence", layoutZone: "content", propsSummary: ["memberEvidenceFiles"] },
      { componentId: "MemberEditActions", instanceKey: "member-edit-actions", layoutZone: "actions", propsSummary: ["memberId", "canUseMemberSave"] }
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
  "observability": {
    pageId: "observability",
    routePath: "/admin/system/observability",
    menuCode: "AMENU_SYSTEM_OBSERVABILITY",
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
      { componentId: "PlatformStudioMetadataTable", instanceKey: "platform-studio-controllers", layoutZone: "content", propsSummary: ["controllerAction", "serviceMethod", "mapperQuery"] }
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
  "environment-management": {
    pageId: "environment-management",
    routePath: "/admin/system/environment-management",
    menuCode: "A0060118",
    domainCode: "admin",
    layoutVersion: "v1",
    designTokenVersion: "krds-current",
    components: [
      { componentId: "EnvironmentManagementSummary", instanceKey: "environment-management-summary", layoutZone: "actions", propsSummary: ["menuCode", "featureCode"] },
      { componentId: "EnvironmentManagementCards", instanceKey: "environment-management-cards", layoutZone: "content", propsSummary: ["system-code", "page-management", "function-management", "menu-management"] }
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
