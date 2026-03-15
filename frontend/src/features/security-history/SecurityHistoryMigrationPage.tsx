import { fetchSecurityHistoryPage } from "../../lib/api/client";
import { LoginHistorySharedPage } from "./LoginHistorySharedPage";

export function SecurityHistoryMigrationPage() {
  return (
    <LoginHistorySharedPage
      titleKo="접근 차단 이력"
      titleEn="Access Block History"
      subtitleKo="계정 잠금, IP 거부 등 접근 차단으로 기록된 이력만 조회합니다."
      subtitleEn="Review only blocked access records such as account lock and IP denial."
      breadcrumbsKo={["홈", "시스템", "접근 차단 이력"]}
      breadcrumbsEn={["Home", "System", "Access Block History"]}
      fetchPage={async (params) => fetchSecurityHistoryPage(params)}
      fixedLoginResult="FAIL"
    />
  );
}
