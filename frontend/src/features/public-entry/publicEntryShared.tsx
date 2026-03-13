import { ReactNode } from "react";
import { buildLocalizedPath, isEnglish } from "../../lib/runtime";

export type LoginResponse = {
  status: string;
  errors?: string;
  certified?: boolean;
  userId?: string;
  userSe?: string;
};

export function PublicFrame(props: {
  title: string;
  subtitle?: string;
  languagePathKo: string;
  languagePathEn: string;
  headerBadge?: string;
  children: ReactNode;
}) {
  const en = isEnglish();

  return (
    <div className="gov-page gov-page-public">
      <a className="gov-skip-link" href="#main-content">
        {en ? "Skip to content" : "본문 바로가기"}
      </a>
      <div className="gov-topbar">
        <div className="gov-inner gov-topbar-inner">
          <div className="gov-mark">
            <span>{en ? "대한민국 정부 공식 서비스" : "대한민국 정부 공식 서비스"}</span>
          </div>
        </div>
      </div>
      <header className="gov-header">
        <div className="gov-inner gov-header-inner">
          <a className="gov-brand" href={buildLocalizedPath("/home", "/en/home")}>
            <span className="gov-brand-icon">eco</span>
            <span>
              <strong>{en ? "CCUS Integrated Portal" : "CCUS 통합관리 포털"}</strong>
              <small>Carbon Capture, Utilization and Storage</small>
            </span>
          </a>
          <div className="gov-header-actions">
            {props.headerBadge ? <div className="gov-header-badge">{props.headerBadge}</div> : null}
            <div className="gov-lang-switch">
              <a className={!en ? "active" : ""} href={props.languagePathKo}>KO</a>
              <a className={en ? "active" : ""} href={props.languagePathEn}>EN</a>
            </div>
          </div>
        </div>
      </header>
      <main className="gov-main gov-main-centered" id="main-content">
        <div className="gov-inner gov-entry-wrap">
          <section className="gov-page-head">
            <h1>{props.title}</h1>
            {props.subtitle ? <p>{props.subtitle}</p> : null}
          </section>
          {props.children}
        </div>
      </main>
      <footer className="gov-footer">
        <div className="gov-inner gov-footer-inner">
          <div>
            <strong>{en ? "탄소중립 CCUS 통합관리본부" : "탄소중립 CCUS 통합관리본부"}</strong>
            <p>(04551) 서울특별시 중구 세종대로 110 | 대표전화: 02-1234-5678</p>
            <p>© 2025 CCUS Integration Management Portal. All rights reserved.</p>
          </div>
          <div className="gov-footer-links">
            <a href="#">{en ? "Privacy Policy" : "개인정보처리방침"}</a>
            <a href="#">{en ? "Terms of Use" : "이용약관"}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
