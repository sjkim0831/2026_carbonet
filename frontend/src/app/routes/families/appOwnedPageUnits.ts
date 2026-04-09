import type { LazyPageUnit } from "../../../framework/routes/pageUnitTypes";

const sharedAdminEntryLoader = () => import("../../../features/admin-entry/AdminEntryPages");
const sharedPublicEntryLoader = () => import("../../../features/public-entry/PublicEntryPages");
const sharedJoinCompanyStatusLoader = () => import("../../../features/join-company-status/JoinCompanyStatusMigrationPage");

export const APP_OWNED_PAGE_UNITS: LazyPageUnit[] = [
  { id: "home", exportName: "HomeLandingPage", loader: () => import("../../../features/home-entry/HomeEntryPages") },
  { id: "admin-home", exportName: "AdminHomePage", loader: sharedAdminEntryLoader },
  { id: "signin-login", exportName: "PublicLoginPage", loader: sharedPublicEntryLoader },
  { id: "admin-login", exportName: "AdminLoginPage", loader: sharedAdminEntryLoader },
  { id: "signin-auth-choice", exportName: "AuthChoicePage", loader: sharedPublicEntryLoader },
  { id: "signin-find-id", exportName: "FindIdPage", loader: sharedPublicEntryLoader },
  { id: "signin-find-id-result", exportName: "FindIdResultPage", loader: sharedPublicEntryLoader },
  { id: "signin-find-password", exportName: "FindPasswordPage", loader: sharedPublicEntryLoader },
  { id: "signin-find-password-result", exportName: "FindPasswordCompletePage", loader: sharedPublicEntryLoader },
  { id: "signin-forbidden", exportName: "ForbiddenPage", loader: sharedPublicEntryLoader },
  { id: "join-company-status", exportName: "JoinCompanyStatusMigrationPage", loader: sharedJoinCompanyStatusLoader },
  { id: "join-company-status-guide", exportName: "JoinCompanyStatusMigrationPage", loader: sharedJoinCompanyStatusLoader },
  { id: "join-company-status-detail", exportName: "JoinCompanyStatusMigrationPage", loader: sharedJoinCompanyStatusLoader }
];
