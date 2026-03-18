import { FormEvent, SyntheticEvent, useState } from "react";
import { fetchFrontendSession } from "../../lib/api/client";
import { buildLocalizedPath, navigate } from "../../lib/navigation/runtime";
import { AdminPageShell } from "./AdminPageShell";
import { AdminLoginFrame } from "./adminEntryShared";

const GOV_SYMBOL = "/img/egovframework/kr_gov_symbol.png";
const GOV_SYMBOL_FALLBACK = "/img/egovframework/kr_gov_symbol.svg";
const ADMIN_SESSION_STORAGE_KEY = "adminSessionExpireAt";
const ADMIN_SESSION_DURATION_MS = 60 * 60 * 1000;

function handleGovSymbolError(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === "1") {
    image.style.display = "none";
    return;
  }
  image.dataset.fallbackApplied = "1";
  image.src = GOV_SYMBOL_FALLBACK;
}

function sanitizeEnglishPassword(value: string) {
  return value.replace(/[^A-Za-z0-9`~!@#$%^&*()\-_=+\[\]{}\\|;:'",.<>/?]/g, "");
}

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
      window.sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, String(Date.now() + ADMIN_SESSION_DURATION_MS));
      navigate(buildLocalizedPath("/admin/", "/en/admin/"));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : (en ? "An error occurred during administrator login." : "관리자 로그인 중 오류가 발생했습니다."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminLoginFrame>
      <div className="w-full max-w-[520px] mb-8" data-help-id="admin-login-warning">
        <div className="bg-red-50 border-2 border-red-200 p-5 rounded-[var(--kr-gov-radius)] flex gap-4">
          <span className="material-symbols-outlined text-red-700 font-bold shrink-0">gavel</span>
          <div className="text-sm text-red-900 leading-relaxed">
            <p className="font-black mb-1 text-[15px]">{en ? "Warning: Administrator-Only System" : "경고: 관리 전용 시스템"}</p>
            <p className="font-medium">
              {en
                ? "This system is accessible only to authorized administrators, and unauthorized access may be punished under applicable laws. All access records are logged for security audits."
                : "본 시스템은 인가된 관리자만 접근 가능하며, 비인가자의 무단 접근 시 관련 법령에 따라 처벌받을 수 있습니다. 모든 접속 기록은 보안 감사 목적으로 기록되고 있습니다."}
            </p>
          </div>
        </div>
      </div>
      <section className="w-full max-w-[520px] bg-white border border-[var(--kr-gov-border-light)] rounded-lg shadow-xl overflow-hidden" data-help-id="admin-login-form">
        <div className="p-8 lg:p-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-[var(--kr-gov-text-primary)] mb-2">{en ? "Administrator Integrated Login" : "관리자 통합 로그인"}</h2>
            <p className="text-[var(--kr-gov-text-secondary)] font-medium">{en ? "Please complete administrator account login and second-factor authentication." : "관리자 계정 및 2단계 인증을 완료하십시오."}</p>
          </div>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-bold text-[var(--kr-gov-text-secondary)] mb-1.5" htmlFor="admin-id">{en ? "Administrator ID" : "관리자 아이디"}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                    <span className="material-symbols-outlined">person</span>
                  </span>
                  <input
                    className="w-full h-14 pl-12 pr-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] focus:ring-2 focus:ring-[var(--kr-gov-focus)] focus:border-transparent transition-all"
                    id="admin-id"
                    placeholder={en ? "Enter administrator ID" : "관리자 ID를 입력하세요"}
                    value={userId}
                    onChange={(event) => setUserId(event.target.value)}
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-bold text-[var(--kr-gov-text-secondary)] mb-1.5" htmlFor="password">{en ? "Password" : "비밀번호"}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                    <span className="material-symbols-outlined">lock_open</span>
                  </span>
                  <input
                    className="w-full h-14 pl-12 pr-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] focus:ring-2 focus:ring-[var(--kr-gov-focus)] focus:border-transparent transition-all"
                    autoCapitalize="off"
                    autoCorrect="off"
                    id="password"
                    inputMode="text"
                    lang="en"
                    placeholder={en ? "Enter password" : "비밀번호를 입력하세요"}
                    type="password"
                    value={userPw}
                    onChange={(event) => setUserPw(sanitizeEnglishPassword(event.target.value))}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center cursor-pointer">
                <input className="w-5 h-5 rounded border-[var(--kr-gov-border-light)] text-[var(--kr-gov-blue)] focus:ring-[var(--kr-gov-focus)]" type="checkbox" />
                <span className="ml-2 text-sm text-[var(--kr-gov-text-secondary)] font-bold">{en ? "Remember ID in secure environment" : "보안 환경에서 아이디 저장"}</span>
              </label>
              <a className="text-sm font-bold text-[var(--kr-gov-blue)] hover:underline" href="#">
                {en ? "Reset Password (MFA required)" : "비밀번호 재설정 (MFA 인증 필요)"}
              </a>
            </div>
            <button className="w-full h-14 bg-[var(--kr-gov-blue)] text-white text-lg font-black rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)] transition-all shadow-md flex items-center justify-center gap-2" disabled={submitting} type="submit">
              {en ? "Log In" : "로그인"}
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-[13px]">
                <span className="px-4 bg-white text-slate-500 font-black uppercase tracking-widest">2nd Factor Authentication (MFA)</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4" data-help-id="admin-login-mfa">
              <button className="w-full h-14 flex items-center justify-between px-6 border-2 border-slate-200 rounded-[var(--kr-gov-radius)] hover:border-[var(--kr-gov-blue)] hover:bg-slate-50 transition-all group" type="button">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">badge</span>
                  <span className="font-black text-sm text-slate-700">{en ? "Joint Certificate (Corporate/Government)" : "공동인증서 (법인/공무원)"}</span>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-[var(--kr-gov-blue)]">arrow_forward</span>
              </button>
              <div className="grid grid-cols-2 gap-4">
                <button className="h-14 flex items-center justify-center gap-2 border-2 border-slate-200 rounded-[var(--kr-gov-radius)] hover:border-[var(--kr-gov-blue)] hover:bg-slate-50 transition-all" type="button">
                  <span className="material-symbols-outlined text-slate-600">vibration</span>
                  <span className="font-black text-sm text-slate-700">{en ? "OTP Verification" : "OTP 인증"}</span>
                </button>
                <button className="h-14 flex items-center justify-center gap-2 border-2 border-slate-200 rounded-[var(--kr-gov-radius)] hover:border-[var(--kr-gov-blue)] hover:bg-slate-50 transition-all" type="button">
                  <span className="material-symbols-outlined text-slate-600">phonelink_lock</span>
                  <span className="font-black text-sm text-slate-700">{en ? "Mobile ID" : "모바일 신분증"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
      <div className="mt-8 text-center max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-2 text-slate-500">
          <span className="material-symbols-outlined text-sm">info</span>
          <span className="text-xs font-bold">
            {en ? "Last access: 2025-08-16 14:22:05 (IP: 10.12.***.***)" : "마지막 접속: 2025-08-16 14:22:05 (IP: 10.12.***.***)"}
          </span>
        </div>
        <p className="text-xs text-[var(--kr-gov-text-secondary)] leading-relaxed">
          {en ? "If exposure or theft of administrator information is suspected, report it to the security officer immediately." : "관리자 정보 노출 또는 도용 의심 시 즉시 보안담당자에게 신고하여 주시기 바랍니다."}
          <br />
          {en ? "(Extension: 8822 / Email: security@ccus.go.kr)" : "(내선번호: 8822 / 이메일: security@ccus.go.kr)"}
        </p>
      </div>
      <footer className="bg-white border-t border-[var(--kr-gov-border-light)] w-full mt-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img alt={en ? "Government Symbol of the Republic of Korea" : "대한민국 정부 상징"} className="h-8 grayscale" data-fallback-applied="0" onError={handleGovSymbolError} src={GOV_SYMBOL} />
                <span className="text-xl font-black text-[var(--kr-gov-text-primary)]">{en ? "Net Zero CCUS Integrated Management HQ" : "탄소중립 CCUS 통합관리본부"}</span>
              </div>
              <address className="not-italic text-sm text-[var(--kr-gov-text-secondary)] leading-relaxed">
                {en ? "(04551) 110 Sejong-daero, Jung-gu, Seoul | Admin Team: 02-1234-5678" : "(04551) 서울특별시 중구 세종대로 110 | 관리팀: 02-1234-5678"}
                <br />
                © 2025 CCUS Integration Management Portal. Admin Security System.
              </address>
            </div>
            <div className="flex flex-col items-end gap-4">
              <div className="flex flex-wrap gap-6 text-sm font-bold">
                <a className="text-[var(--kr-gov-blue)] hover:underline" href="#">{en ? "Privacy Policy" : "개인정보처리방침"}</a>
                <a className="text-[var(--kr-gov-text-primary)] hover:underline" href="#">{en ? "Information Security Guideline" : "정보보안지침"}</a>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-[var(--kr-gov-bg-gray)] rounded-[var(--kr-gov-radius)] text-[11px] font-bold text-[var(--kr-gov-text-secondary)]">
                  {en ? "Security Update: " : "보안 업데이트: "}<time dateTime="2025-08-14">2025.08.14</time>
                </div>
                <img alt={en ? "Web accessibility certification mark" : "웹 접근성 품질인증 마크"} className="h-10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzkKwREcbsB7LV3B2b7fBK7y2M_9Exa0vlGVzxNy2qM0n1LFMRlBCIa_XiIBeCfvv3DkMb9Z0D05Y-RMuAytisqlCS8QTpbtebgKnMnWoefEx5uJOgRW5H_8Pw9jmaRvkiW6sVRrifgIhrWc5hi2PRUGHgXn-q8-veHvu9wSwDhtcvbHKYyokgnP-hqdR10ahEAdBe4vFFkR88N_By8pjpp34KH9TwHOouRLBwdfVCsRGmDCS6wnvQZDwf6s4HyScSMXyJJGQjl8Y" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </AdminLoginFrame>
  );
}

export function AdminHomePage() {
  const en = window.location.pathname.startsWith("/en/");
  const reviewSteps = [
    [en ? "Step 1: Application / Receipt" : "1단계: 신청/접수", "45", "85%", "bg-blue-400"],
    [en ? "Step 2: Technical Verification" : "2단계: 기술 검증", "28", "55%", "bg-blue-500"],
    [en ? "Step 3: Committee Review" : "3단계: 위원회 심의", "12", "25%", "bg-blue-700"],
    [en ? "Step 4: Final Approval" : "4단계: 최종 승인", "8", "15%", "bg-[var(--kr-gov-green)]"]
  ] as const;
  const integrationStatuses = [
    ["electric_bolt", "KEPCO 한국전력공사", "Latency 14ms", "bg-gray-50 border-gray-100", "text-gray-400", "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]", "text-gray-500"],
    ["currency_exchange", "Carbon Exchange 탄소거래소", "Latency 42ms", "bg-gray-50 border-gray-100", "text-gray-400", "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]", "text-gray-500"],
    ["fingerprint", "G-PIN 공공인증 서비스", "TIMEOUT", "bg-red-50 border-red-100", "text-red-500", "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]", "text-red-500 font-bold"]
  ] as const;
  const systemLogs = [
    ["CRITICAL", "bg-red-100 text-red-700", en ? "No response from G-PIN integration module - automatic retry in progress" : "G-PIN 연계 모듈 응답 없음 - 자동 재시도 중", "2025.08.14 14:42:10"],
    ["INFO", "bg-blue-100 text-blue-700", en ? "Applied new carbon emission calculation logic (v2.4)" : "신규 탄소 배출권 산정 로직(v2.4) 적용 완료", "2025.08.14 13:05:00"],
    ["WARNING", "bg-orange-100 text-orange-700", en ? "Detected abnormal access attempt for administrator 'Hong Gil-dong' (IP: 192.168.0.42)" : "관리자 '홍길동' 비정상 접근 시도 탐지 (IP: 192.168.0.42)", "2025.08.14 12:45:22"]
  ] as const;

  return (
    <AdminPageShell
      actions={(
        <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] text-[13px] font-bold hover:bg-gray-50" type="button">
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          {en ? "Refresh" : "새로고침"}
        </button>
      )}
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "Operations Dashboard" : "운영 대시보드" }
      ]}
      sidebarVariant="dashboard"
      subtitle={en ? "Monitor the real-time operating status of the carbon capture, utilization, and storage system." : "실시간 탄소 포집·활용·저장 시스템 운영 현황을 모니터링합니다."}
      title={en ? "Operations Dashboard" : "운영 관리 대시보드"}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" data-help-id="admin-home-cards">
        <article className="gov-card border-l-4 border-l-[var(--kr-gov-blue)]">
          <div className="flex justify-between items-start">
            <p className="font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Total Active Members" : "전체 활성 회원"}</p>
            <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">group</span>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-4xl font-black tracking-tight">1,422</span>
            <span className="text-sm font-bold text-gray-400">{en ? "Users" : "명"}</span>
          </div>
          <div className="mt-4 flex gap-2">
            <span className="px-2 py-0.5 bg-blue-50 text-[var(--kr-gov-blue)] text-[11px] font-bold rounded border border-blue-100">
              {en ? "Enterprise 1,120" : "기업 1,120"}
            </span>
            <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-[11px] font-bold rounded border border-gray-100">
              {en ? "Individual 302" : "개인 302"}
            </span>
          </div>
        </article>

        <article className="gov-card border-l-4 border-l-[var(--kr-gov-green)]">
          <div className="flex justify-between items-start">
            <p className="font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Monthly Emission Calculation Statistics" : "이달의 배출량 산정 통계"}</p>
            <span className="material-symbols-outlined text-[var(--kr-gov-green)]">monitoring</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight">85,240</span>
            <span className="text-sm font-bold text-gray-400">tCO2e</span>
          </div>
          <p className="text-[12px] text-emerald-600 font-bold mt-4 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            {en ? "Up 12.4% from previous month" : "전월 대비 12.4% 증가"}
          </p>
        </article>

        <article className="gov-card border-l-4 border-l-orange-400">
          <div className="flex justify-between items-start">
            <p className="font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Certification Review Status" : "인증 심사 현황"}</p>
            <span className="material-symbols-outlined text-orange-400">verified</span>
          </div>
          <div className="mt-4 flex justify-between items-center bg-gray-50 p-3 rounded-[var(--kr-gov-radius)]">
            <div className="text-center px-2">
              <p className="text-[11px] text-gray-500 font-bold mb-1">{en ? "Pending" : "대기"}</p>
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[12px] font-black rounded-full">12</span>
            </div>
            <div className="text-center px-2">
              <p className="text-[11px] text-gray-500 font-bold mb-1">{en ? "Reviewing" : "검토중"}</p>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[12px] font-black rounded-full">28</span>
            </div>
            <div className="text-center px-2">
              <p className="text-[11px] text-gray-500 font-bold mb-1">{en ? "Completed" : "완료"}</p>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[12px] font-black rounded-full">154</span>
            </div>
          </div>
        </article>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <article className="gov-card" data-help-id="admin-home-approvals">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">person_add</span>
              {en ? "Pending Membership Approvals" : "회원가입 승인 대기"}
            </h3>
            <a className="text-xs font-bold text-[var(--kr-gov-blue)] hover:underline flex items-center gap-1" href={buildLocalizedPath("/admin/member/approve", "/en/admin/member/approve")}>
              {en ? "View All" : "전체보기"} <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-y border-[var(--kr-gov-border-light)]">
                <tr>
                  <th className="px-4 py-3 font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Name" : "이름"}</th>
                  <th className="px-4 py-3 font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Type" : "유형"}</th>
                  <th className="px-4 py-3 font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Applied On" : "신청일"}</th>
                  <th className="px-4 py-3 font-bold text-center text-[var(--kr-gov-text-secondary)]">{en ? "Manage" : "관리"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["홍길동", en ? "General Enterprise" : "일반기업", "2025.08.14"],
                  ["성춘향", en ? "Verification Agency" : "검증기관", "2025.08.14"],
                  ["이몽룡", en ? "Research Institute" : "연구소", "2025.08.13"]
                ].map(([name, type, date]) => (
                  <tr className="hover:bg-gray-50/50 transition-colors" key={name}>
                    <td className="px-4 py-4 font-medium">{name}</td>
                    <td className="px-4 py-4 text-gray-600 text-xs">{type}</td>
                    <td className="px-4 py-4 text-gray-500 text-xs">{date}</td>
                    <td className="px-4 py-4 text-center space-x-1">
                      <button className="px-3 py-1.5 bg-[var(--kr-gov-blue)] text-white text-[11px] font-bold rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)]" type="button">
                        {en ? "Approve" : "Approve"}
                      </button>
                      <button className="px-3 py-1.5 border border-[var(--kr-gov-border-light)] text-gray-600 text-[11px] font-bold rounded-[var(--kr-gov-radius)] hover:bg-gray-100" type="button">
                        {en ? "Detail" : "Detail"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="gov-card" data-help-id="admin-home-progress">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--kr-gov-green)]">bar_chart</span>
              {en ? "Review Progress Status" : "심사 진행 현황"}
            </h3>
            <span className="text-[11px] font-bold text-gray-400 uppercase">Unit: Project Counts</span>
          </div>
          <div aria-label={en ? "Bar chart by review stage" : "심사 진행 단계별 막대 그래프"} className="space-y-5">
            {reviewSteps.map(([label, value, width, barClass]) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[13px] font-bold text-[var(--kr-gov-text-secondary)]">{label}</span>
                  <span className="text-[13px] font-black text-[var(--kr-gov-blue)]">{value}</span>
                </div>
                <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${barClass}`} style={{ width }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <article className="gov-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500">hub</span>
              {en ? "Real-Time System Integration Status" : "실시간 시스템 연계 상태"}
            </h3>
          </div>
          <div className="space-y-3">
            {integrationStatuses.map(([icon, label, meta, boxClass, iconClass, dotClass, metaClass]) => (
              <div className={`flex items-center justify-between p-4 rounded-[var(--kr-gov-radius)] border ${boxClass}`} key={label}>
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${iconClass}`}>{icon}</span>
                  <span className={`text-sm font-bold ${label.includes("G-PIN") ? "text-red-700" : ""}`}>{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-medium ${metaClass}`}>{meta}</span>
                  <span className={`status-dot ${dotClass}`}></span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="gov-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500">history_edu</span>
              {en ? "Recent System Logs" : "최근 시스템 로그"}
            </h3>
            <button className="text-xs font-bold text-gray-400 hover:text-[var(--kr-gov-blue)]" type="button">
              {en ? "Analyze All Logs" : "로그 전체 분석"}
            </button>
          </div>
          <div className="space-y-4">
            {systemLogs.map(([level, chipClass, message, timestamp], index) => (
              <div className={`flex gap-4 items-start ${index < systemLogs.length - 1 ? "pb-3 border-b border-gray-100" : "pb-1"}`} key={`${level}-${timestamp}`}>
                <span className={`px-2 py-0.5 text-[10px] font-black rounded ${chipClass}`}>{level}</span>
                <div className="flex-1">
                  <p className="text-[13px] font-medium">{message}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AdminPageShell>
  );
}
