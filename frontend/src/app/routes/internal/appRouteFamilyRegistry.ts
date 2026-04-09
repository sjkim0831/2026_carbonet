import type { AdminMemberRouteId } from "../families/adminMemberRouteDefinitions";
import type { AdminSystemRouteId } from "../families/adminSystemRouteDefinitions";
import type { AppOwnedRouteId } from "../families/appOwnedRouteDefinitions";
import type { ContentSupportRouteId } from "../families/contentSupportRouteDefinitions";
import type { EmissionMonitoringRouteId } from "../families/emissionMonitoringRouteDefinitions";
import type { HomeExperienceRouteId } from "../families/homeExperienceRouteDefinitions";
import type { TradePaymentRouteId } from "../families/tradePaymentRouteDefinitions";
import { ADMIN_MEMBER_PAGE_UNITS } from "../families/adminMemberPageUnits";
import { ADMIN_MEMBER_ROUTE_DEFINITIONS } from "../families/adminMemberRouteDefinitions";
import { ADMIN_SYSTEM_PAGE_UNITS } from "../families/adminSystemPageUnits";
import { ADMIN_SYSTEM_ROUTE_DEFINITIONS } from "../families/adminSystemRouteDefinitions";
import { APP_OWNED_PAGE_UNITS } from "../families/appOwnedPageUnits";
import { APP_OWNED_ROUTE_DEFINITIONS } from "../families/appOwnedRouteDefinitions";
import { CONTENT_SUPPORT_PAGE_UNITS } from "../families/contentSupportPageUnits";
import { CONTENT_SUPPORT_ROUTE_DEFINITIONS } from "../families/contentSupportRouteDefinitions";
import { EMISSION_MONITORING_PAGE_UNITS } from "../families/emissionMonitoringPageUnits";
import { EMISSION_MONITORING_ROUTE_DEFINITIONS } from "../families/emissionMonitoringRouteDefinitions";
import { HOME_EXPERIENCE_PAGE_UNITS } from "../families/homeExperiencePageUnits";
import { HOME_EXPERIENCE_ROUTE_DEFINITIONS } from "../families/homeExperienceRouteDefinitions";
import { TRADE_PAYMENT_PAGE_UNITS } from "../families/tradePaymentPageUnits";
import { TRADE_PAYMENT_ROUTE_DEFINITIONS } from "../families/tradePaymentRouteDefinitions";

export type AppRouteFamilyId =
  | AppOwnedRouteId
  | AdminMemberRouteId
  | TradePaymentRouteId
  | EmissionMonitoringRouteId
  | AdminSystemRouteId
  | ContentSupportRouteId
  | HomeExperienceRouteId;

export const APP_ROUTE_PAGE_UNIT_FAMILIES = [
  APP_OWNED_PAGE_UNITS,
  ADMIN_MEMBER_PAGE_UNITS,
  TRADE_PAYMENT_PAGE_UNITS,
  EMISSION_MONITORING_PAGE_UNITS,
  ADMIN_SYSTEM_PAGE_UNITS,
  CONTENT_SUPPORT_PAGE_UNITS,
  HOME_EXPERIENCE_PAGE_UNITS
] as const;

export const APP_ROUTE_DEFINITION_FAMILIES = [
  APP_OWNED_ROUTE_DEFINITIONS,
  ADMIN_MEMBER_ROUTE_DEFINITIONS,
  TRADE_PAYMENT_ROUTE_DEFINITIONS,
  EMISSION_MONITORING_ROUTE_DEFINITIONS,
  ADMIN_SYSTEM_ROUTE_DEFINITIONS,
  CONTENT_SUPPORT_ROUTE_DEFINITIONS,
  HOME_EXPERIENCE_ROUTE_DEFINITIONS
] as const;
