import { ADMIN_MEMBER_PAGE_UNITS } from "./adminMemberPageUnits";
import { ADMIN_SYSTEM_PAGE_UNITS } from "./adminSystemPageUnits";
import { APP_OWNED_PAGE_UNITS } from "./appOwnedPageUnits";
import { CONTENT_SUPPORT_PAGE_UNITS } from "./contentSupportPageUnits";
import { EMISSION_MONITORING_PAGE_UNITS } from "./emissionMonitoringPageUnits";
import { HOME_EXPERIENCE_PAGE_UNITS } from "./homeExperiencePageUnits";
import { TRADE_PAYMENT_PAGE_UNITS } from "./tradePaymentPageUnits";

export const APP_ROUTE_PAGE_UNIT_FAMILIES = [
  APP_OWNED_PAGE_UNITS,
  ADMIN_MEMBER_PAGE_UNITS,
  TRADE_PAYMENT_PAGE_UNITS,
  EMISSION_MONITORING_PAGE_UNITS,
  ADMIN_SYSTEM_PAGE_UNITS,
  CONTENT_SUPPORT_PAGE_UNITS,
  HOME_EXPERIENCE_PAGE_UNITS
] as const;
