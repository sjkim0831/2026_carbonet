import { buildLocalizedPath } from "../navigation/runtime";
import { apiFetch } from "./core";
import type {
  CertificateStatisticsPagePayload,
  RefundListPagePayload,
  RefundProcessPagePayload,
  SettlementCalendarPagePayload,
  TradeApprovePagePayload,
  TradeDuplicatePagePayload,
  TradeListPagePayload,
  TradeRejectPagePayload,
  TradeStatisticsPagePayload
} from "./client";

async function fetchJsonPage<T>(url: string, fallbackMessage: string): Promise<T> {
  const response = await apiFetch(url, {
    credentials: "include"
  });
  const body = await response.json() as T & Record<string, unknown>;
  if (!response.ok) {
    throw new Error(String(body?.message || body?.refundProcessError || fallbackMessage.replace(":status", String(response.status))));
  }
  return body as T;
}

function buildQuery(params?: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function fetchTradeListPage(params?: { pageIndex?: number; searchKeyword?: string; tradeStatus?: string; settlementStatus?: string; }) {
  const query = buildQuery(params);
  return fetchJsonPage<TradeListPagePayload>(
    buildLocalizedPath(`/trade/list/page-data${query}`, `/en/trade/list/page-data${query}`),
    "Failed to load trade list page: :status"
  );
}

export async function fetchTradeStatisticsPage(params?: { pageIndex?: number; searchKeyword?: string; periodFilter?: string; tradeType?: string; settlementStatus?: string; }) {
  const query = buildQuery(params);
  return fetchJsonPage<TradeStatisticsPagePayload>(
    buildLocalizedPath(`/admin/trade/statistics/page-data${query}`, `/en/admin/trade/statistics/page-data${query}`),
    "Failed to load trade statistics page: :status"
  );
}

export async function fetchTradeDuplicatePage(params?: { pageIndex?: number; searchKeyword?: string; detectionType?: string; reviewStatus?: string; riskLevel?: string; }) {
  const query = buildQuery(params);
  return fetchJsonPage<TradeDuplicatePagePayload>(
    buildLocalizedPath(`/admin/trade/duplicate/page-data${query}`, `/en/admin/trade/duplicate/page-data${query}`),
    "Failed to load abnormal trade review page: :status"
  );
}

export async function fetchRefundListPage(params?: { pageIndex?: number; searchKeyword?: string; status?: string; riskLevel?: string; }) {
  const query = buildQuery(params);
  return fetchJsonPage<RefundListPagePayload>(
    buildLocalizedPath(`/admin/payment/refund_list/page-data${query}`, `/en/admin/payment/refund_list/page-data${query}`),
    "Failed to load refund list page: :status"
  );
}

export async function fetchSettlementCalendarPage(params?: { pageIndex?: number; selectedMonth?: string; searchKeyword?: string; settlementStatus?: string; riskLevel?: string; }) {
  const query = buildQuery(params);
  return fetchJsonPage<SettlementCalendarPagePayload>(
    buildLocalizedPath(`/admin/payment/settlement/page-data${query}`, `/en/admin/payment/settlement/page-data${query}`),
    "Failed to load settlement calendar page: :status"
  );
}

export async function fetchTradeApprovePage(params?: { pageIndex?: number; searchKeyword?: string; approvalStatus?: string; tradeType?: string; }) {
  const query = buildQuery(params);
  return fetchJsonPage<TradeApprovePagePayload>(
    buildLocalizedPath(`/admin/trade/approve/page-data${query}`, `/en/admin/trade/approve/page-data${query}`),
    "Failed to load trade approval page: :status"
  );
}

export async function fetchRefundProcessPage(params?: { pageIndex?: number; searchKeyword?: string; refundStatus?: string; refundChannel?: string; priority?: string; }) {
  const query = buildQuery(params);
  return fetchJsonPage<RefundProcessPagePayload>(
    buildLocalizedPath(`/admin/payment/refund_process/page-data${query}`, `/en/admin/payment/refund_process/page-data${query}`),
    "Failed to load refund processing page: :status"
  );
}

export async function fetchTradeRejectPage(params?: { tradeId?: string; returnUrl?: string; }) {
  const query = buildQuery(params);
  return fetchJsonPage<TradeRejectPagePayload>(
    buildLocalizedPath(`/admin/trade/reject/page-data${query}`, `/en/admin/trade/reject/page-data${query}`),
    "Failed to load trade reject page: :status"
  );
}

export async function fetchCertificateStatisticsPage(params?: { pageIndex?: number; searchKeyword?: string; periodFilter?: string; certificateType?: string; issuanceStatus?: string; }) {
  const query = buildQuery(params);
  return fetchJsonPage<CertificateStatisticsPagePayload>(
    buildLocalizedPath(`/admin/certificate/statistics/page-data${query}`, `/en/admin/certificate/statistics/page-data${query}`),
    "Failed to load certificate statistics page: :status"
  );
}
