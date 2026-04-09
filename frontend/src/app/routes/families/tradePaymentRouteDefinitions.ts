import type { RouteUnitDefinition } from "../../../framework/routes/pageUnitTypes";

export const TRADE_PAYMENT_ROUTE_DEFINITIONS = [
  { id: "trade-list", label: "거래 목록", group: "home", koPath: "/trade/list", enPath: "/en/trade/list" },
  { id: "trade-market", label: "거래 시장", group: "home", koPath: "/trade/market", enPath: "/en/trade/market" },
  { id: "trade-report", label: "거래 리포트", group: "home", koPath: "/trade/report", enPath: "/en/trade/report" },
  { id: "trade-statistics", label: "정산 리포트", group: "admin", koPath: "/admin/trade/statistics", enPath: "/en/admin/trade/statistics" },
  { id: "refund-list", label: "환불 요청 목록", group: "admin", koPath: "/admin/payment/refund_list", enPath: "/en/admin/payment/refund_list" },
  { id: "settlement-calendar", label: "정산 캘린더", group: "admin", koPath: "/admin/payment/settlement", enPath: "/en/admin/payment/settlement" },
  { id: "trade-duplicate", label: "이상거래 점검", group: "admin", koPath: "/admin/trade/duplicate", enPath: "/en/admin/trade/duplicate" },
  { id: "trade-approve", label: "거래 승인", group: "admin", koPath: "/admin/trade/approve", enPath: "/en/admin/trade/approve" },
  { id: "trade-reject", label: "거래 반려 검토", group: "admin", koPath: "/admin/trade/reject", enPath: "/en/admin/trade/reject" },
  { id: "refund-process", label: "환불 처리", group: "admin", koPath: "/admin/payment/refund_process", enPath: "/en/admin/payment/refund_process" },
  { id: "certificate-review", label: "발급 검토", group: "admin", koPath: "/admin/certificate/review", enPath: "/en/admin/certificate/review" },
  { id: "certificate-statistics", label: "인증서 통계", group: "admin", koPath: "/admin/certificate/statistics", enPath: "/en/admin/certificate/statistics" },
  { id: "trade-buy-request", label: "구매 요청", group: "home", koPath: "/trade/buy_request", enPath: "/en/trade/buy_request" },
  { id: "trade-complete", label: "체결 현황", group: "home", koPath: "/trade/complete", enPath: "/en/trade/complete" },
  { id: "trade-auto-order", label: "자동 매칭", group: "home", koPath: "/trade/auto_order", enPath: "/en/trade/auto_order" },
  { id: "trade-sell", label: "판매 등록", group: "home", koPath: "/trade/sell", enPath: "/en/trade/sell" },
  { id: "trade-price-alert", label: "가격 알림", group: "home", koPath: "/trade/price_alert", enPath: "/en/trade/price_alert" },
  { id: "payment-pay", label: "결제 요청", group: "home", koPath: "/payment/pay", enPath: "/en/payment/pay" },
  { id: "payment-virtual-account", label: "가상계좌", group: "home", koPath: "/payment/virtual_account", enPath: "/en/payment/virtual_account" },
  { id: "payment-refund", label: "결제 환불", group: "home", koPath: "/payment/refund", enPath: "/en/payment/refund" },
  { id: "payment-refund-account", label: "환불 계좌", group: "home", koPath: "/payment/refund_account", enPath: "/en/payment/refund_account" },
  { id: "payment-notify", label: "세금계산서", group: "home", koPath: "/payment/notify", enPath: "/en/payment/notify" },
  { id: "co2-credit", label: "크레딧 조회", group: "home", koPath: "/co2/credits", enPath: "/en/co2/credits" },
  { id: "certificate-list", label: "인증서 목록", group: "home", koPath: "/certificate/list", enPath: "/en/certificate/list" },
  { id: "certificate-apply", label: "인증서 신청", group: "home", koPath: "/certificate/apply", enPath: "/en/certificate/apply" },
  { id: "certificate-report-list", label: "보고서 및 인증서 목록", group: "home", koPath: "/certificate/report_list", enPath: "/en/certificate/report_list" },
  { id: "certificate-report-form", label: "보고서 작성", group: "home", koPath: "/certificate/report_form", enPath: "/en/certificate/report_form" },
  { id: "certificate-report-edit", label: "보고서 수정", group: "home", koPath: "/certificate/report_edit", enPath: "/en/certificate/report_edit" },
  { id: "payment-history", label: "결제 내역", group: "home", koPath: "/payment/history", enPath: "/en/payment/history" },
  { id: "payment-receipt", label: "영수증 관리", group: "home", koPath: "/payment/receipt", enPath: "/en/payment/receipt" }
] as const satisfies ReadonlyArray<RouteUnitDefinition>;

export type TradePaymentRouteId = (typeof TRADE_PAYMENT_ROUTE_DEFINITIONS)[number]["id"];
