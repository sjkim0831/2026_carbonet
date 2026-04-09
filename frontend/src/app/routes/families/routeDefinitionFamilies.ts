import type { AdminMemberRouteId } from "./adminMemberRouteDefinitions";
import type { AdminSystemRouteId } from "./adminSystemRouteDefinitions";
import type { AppOwnedRouteId } from "./appOwnedRouteDefinitions";
import type { ContentSupportRouteId } from "./contentSupportRouteDefinitions";
import type { EmissionMonitoringRouteId } from "./emissionMonitoringRouteDefinitions";
import type { HomeExperienceRouteId } from "./homeExperienceRouteDefinitions";
import type { TradePaymentRouteId } from "./tradePaymentRouteDefinitions";
import { ADMIN_MEMBER_ROUTE_DEFINITIONS } from "./adminMemberRouteDefinitions";
import { ADMIN_SYSTEM_ROUTE_DEFINITIONS } from "./adminSystemRouteDefinitions";
import { APP_OWNED_ROUTE_DEFINITIONS } from "./appOwnedRouteDefinitions";
import { CONTENT_SUPPORT_ROUTE_DEFINITIONS } from "./contentSupportRouteDefinitions";
import { EMISSION_MONITORING_ROUTE_DEFINITIONS } from "./emissionMonitoringRouteDefinitions";
import { HOME_EXPERIENCE_ROUTE_DEFINITIONS } from "./homeExperienceRouteDefinitions";
import { TRADE_PAYMENT_ROUTE_DEFINITIONS } from "./tradePaymentRouteDefinitions";

export type AppRouteFamilyId =
  | AppOwnedRouteId
  | AdminMemberRouteId
  | TradePaymentRouteId
  | EmissionMonitoringRouteId
  | AdminSystemRouteId
  | ContentSupportRouteId
  | HomeExperienceRouteId;

export const APP_ROUTE_DEFINITION_FAMILIES = [
  APP_OWNED_ROUTE_DEFINITIONS,
  ADMIN_MEMBER_ROUTE_DEFINITIONS,
  TRADE_PAYMENT_ROUTE_DEFINITIONS,
  EMISSION_MONITORING_ROUTE_DEFINITIONS,
  ADMIN_SYSTEM_ROUTE_DEFINITIONS,
  CONTENT_SUPPORT_ROUTE_DEFINITIONS,
  HOME_EXPERIENCE_ROUTE_DEFINITIONS
] as const;
