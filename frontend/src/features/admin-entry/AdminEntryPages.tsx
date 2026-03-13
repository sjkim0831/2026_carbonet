import { FormEvent, useState } from "react";
import { fetchFrontendSession } from "../../lib/api";
import { buildLocalizedPath, navigate } from "../../lib/runtime";
import { AdminHomeShell, AdminLoginFrame } from "./adminEntryShared";

export function AdminLoginPage() {
  const en = window.location.pathname.startsWith("/en/");
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!userId.trim()) {
      window.alert(en ? "Enter administrator ID." : "관리자 아이디를 입력하세요.");
      return;
    }
    if (!userPw) {
      window.alert(en ? "Enter password." : "비밀번호를 입력하세요.");
      return;
    }
    setSubmitting(true);
    try {
      const session = await fetchFrontendSession();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session.csrfHeaderName && session.csrfToken) {
        headers[session.csrfHeaderName] = session.csrfToken;
      }
      const response = await fetch(buildLocalizedPath("/admin/login/actionLogin", "/en/admin/login/actionLogin"), {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ userId: userId.trim(), userPw, userSe: "USR" })
      });
      const body = await response.json() as { status?: string; errors?: string };
      if (body.status === "loginFailure") {
        window.alert(body.errors || (en ? "Login failed." : "로그인에 실패했습니다."));
        return;
      }
      navigate(buildLocalizedPath("/admin/", "/en/admin/"));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : (en ? "An error occurred during administrator login." : "관리자 로그인 중 오류가 발생했습니다."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminLoginFrame>
      <section className="gov-danger-banner">
        <strong>{en ? "Warning: Administrator-Only System" : "경고: 관리 전용 시스템"}</strong>
        <p>{en ? "This system is accessible only to authorized administrators, and unauthorized access may be punished under applicable laws." : "본 시스템은 인가된 관리자만 접근 가능하며, 비인가자의 무단 접근 시 관련 법령에 따라 처벌받을 수 있습니다."}</p>
      </section>
      <section className="gov-entry-card gov-login-card admin">
        <div className="gov-page-head compact">
          <h1>{en ? "Administrator Integrated Login" : "관리자 통합 로그인"}</h1>
          <p>{en ? "Please complete administrator account login and second-factor authentication." : "관리자 계정 및 2단계 인증을 완료하십시오."}</p>
        </div>
        <form className="gov-form-stack" onSubmit={handleSubmit}>
          <label className="gov-field">
            <span>{en ? "Administrator ID" : "관리자 아이디"}</span>
            <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder={en ? "Enter administrator ID" : "관리자 ID를 입력하세요"} />
          </label>
          <label className="gov-field">
            <span>{en ? "Password" : "비밀번호"}</span>
            <input type="password" value={userPw} onChange={(event) => setUserPw(event.target.value)} placeholder={en ? "Enter password" : "비밀번호를 입력하세요"} />
          </label>
          <div className="gov-check-row">
            <label><input type="checkbox" /> {en ? "Remember ID in secure environment" : "보안 환경에서 아이디 저장"}</label>
            <a href="#">{en ? "Reset Password (MFA required)" : "비밀번호 재설정 (MFA 인증 필요)"}</a>
          </div>
          <button className="gov-primary-button gov-large-button" disabled={submitting} type="submit">
            {submitting ? (en ? "Signing in..." : "로그인 중...") : (en ? "Log In" : "로그인")}
          </button>
          <div className="gov-divider"><span>2nd Factor Authentication (MFA)</span></div>
          <div className="gov-login-methods">
            <button className="gov-method-button main" type="button">{en ? "Joint Certificate (Corporate/Government)" : "공동인증서 (법인/공무원)"}</button>
            <div className="gov-method-row">
              <button className="gov-method-button" type="button">{en ? "OTP Verification" : "OTP 인증"}</button>
              <button className="gov-method-button" type="button">{en ? "Mobile ID" : "모바일 신분증"}</button>
            </div>
          </div>
        </form>
      </section>
      <p className="gov-entry-help small">{en ? "If exposure or theft of administrator information is suspected, report it to the security officer immediately." : "관리자 정보 노출 또는 도용 의심 시 즉시 보안담당자에게 신고하여 주시기 바랍니다."}</p>
    </AdminLoginFrame>
  );
}

export function AdminHomePage() {
  const en = window.location.pathname.startsWith("/en/");
  const cards = [
    [en ? "Total Active Members" : "전체 활성 회원", "1,422", en ? "Users" : "명"],
    [en ? "Monthly Emission Calculation Statistics" : "이달의 배출량 산정 통계", "85,240", "tCO2e"],
    [en ? "Certification Review Status" : "인증 심사 현황", "12 / 28 / 154", en ? "Pending / Reviewing / Done" : "대기 / 검토중 / 완료"]
  ];

  return (
    <AdminHomeShell>
      <header className="gov-admin-top">
        <h1>{en ? "Operations Dashboard" : "운영 관리 대시보드"}</h1>
        <p>{en ? "Monitor the real-time operating status of the carbon capture, utilization, and storage system." : "실시간 탄소 포집·활용·저장 시스템 운영 현황을 모니터링합니다."}</p>
      </header>

      <section className="gov-admin-card-grid">
        {cards.map(([title, value, unit]) => (
          <article className="gov-card gov-stat-card" key={title}>
            <strong>{title}</strong>
            <span>{value}</span>
            <small>{unit}</small>
          </article>
        ))}
      </section>

      <section className="gov-admin-split">
        <article className="gov-card">
          <div className="gov-card-head">
            <h2>{en ? "Pending Membership Approvals" : "회원가입 승인 대기"}</h2>
          </div>
          <table className="gov-mini-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>{en ? "Type" : "유형"}</th>
                <th>{en ? "Applied On" : "신청일"}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>홍길동</td><td>{en ? "General Enterprise" : "일반기업"}</td><td>2025.08.14</td></tr>
              <tr><td>성춘향</td><td>{en ? "Verification Agency" : "검증기관"}</td><td>2025.08.14</td></tr>
              <tr><td>이몽룡</td><td>{en ? "Research Institute" : "연구소"}</td><td>2025.08.13</td></tr>
            </tbody>
          </table>
        </article>

        <article className="gov-card">
          <div className="gov-card-head">
            <h2>{en ? "Review Progress Status" : "심사 진행 현황"}</h2>
          </div>
          <div className="gov-progress-list">
            <div><span>{en ? "Step 1: Application / Receipt" : "1단계: 신청/접수"}</span><strong>45</strong><i style={{ width: "85%" }} /></div>
            <div><span>{en ? "Step 2: Technical Verification" : "2단계: 기술 검증"}</span><strong>28</strong><i style={{ width: "55%" }} /></div>
            <div><span>{en ? "Step 3: Committee Review" : "3단계: 위원회 심의"}</span><strong>12</strong><i style={{ width: "25%" }} /></div>
            <div><span>{en ? "Step 4: Final Approval" : "4단계: 최종 승인"}</span><strong>8</strong><i style={{ width: "18%" }} /></div>
          </div>
        </article>
      </section>
    </AdminHomeShell>
  );
}
