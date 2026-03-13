import { ReactNode } from "react";
import { buildLocalizedPath, isEnglish } from "../../lib/runtime";

export function AdminLoginFrame({ children }: { children: ReactNode }) {
  const en = isEnglish();

  return (
    <div className="gov-page gov-page-admin">
      <div className="gov-topbar">
        <div className="gov-inner gov-topbar-inner">
          <div className="gov-mark">대한민국 정부 공식 서비스</div>
        </div>
      </div>
      <header className="gov-header">
        <div className="gov-inner gov-header-inner">
          <a className="gov-brand" href={buildLocalizedPath("/", "/en/home")}>
            <span className="gov-brand-icon">shield</span>
            <span>
              <strong>CCUS 통합관리 포털</strong>
              <small>Carbon Capture, Utilization and Storage System</small>
            </span>
          </a>
          <div className="gov-header-actions">
            <div className="gov-header-badge">보안 세션 활성화됨</div>
            <div className="gov-lang-switch">
              <a className={!en ? "active" : ""} href="/admin/login/loginView">KO</a>
              <a className={en ? "active" : ""} href="/en/admin/login/loginView">EN</a>
            </div>
          </div>
        </div>
      </header>
      <main className="gov-main gov-main-centered" id="main-content">
        <div className="gov-inner gov-entry-wrap">{children}</div>
      </main>
    </div>
  );
}

export function AdminHomeShell({ children }: { children: ReactNode }) {
  return (
    <div className="gov-page gov-page-admin">
      <div className="gov-admin-shell">
        <aside className="gov-admin-sidebar">
          <div className="gov-admin-sidebar-head">
            <h2>Operation Tools</h2>
          </div>
          <a className="active" href={buildLocalizedPath("/admin/", "/en/admin/")}>운영 대시보드</a>
          <a href={buildLocalizedPath("/admin/auth/group", "/en/admin/auth/group")}>권한 그룹</a>
          <a href={buildLocalizedPath("/admin/member/list", "/en/admin/member/list")}>회원 목록</a>
          <a href={buildLocalizedPath("/admin/member/company_list", "/en/admin/member/company_list")}>회원사 목록</a>
          <div className="gov-admin-side-status">
            <strong>시스템 상태: 정상</strong>
            <p>2025.08 가이드라인 적용</p>
          </div>
        </aside>
        <main className="gov-admin-content">{children}</main>
      </div>
    </div>
  );
}
