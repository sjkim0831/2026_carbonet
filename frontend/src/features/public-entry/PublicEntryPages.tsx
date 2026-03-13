import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { buildLocalizedPath, getSearchParam, isEnglish, navigate } from "../../lib/runtime";
import { postJsonWithSession } from "./publicEntryApi";
import { LoginResponse, PublicFrame } from "./publicEntryShared";

function isOverseasPath() {
  return window.location.pathname.includes("/overseas/");
}

export function PublicLoginPage() {
  const en = isEnglish();
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [saveId, setSaveId] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [tab, setTab] = useState<"domestic" | "overseas">("domestic");
  const [submitting, setSubmitting] = useState(false);
  const autoLoginAttemptedRef = useRef(false);

  useEffect(() => {
    const savedId = getCookie("userInputId");
    if (savedId) {
      setUserId(savedId);
      setSaveId(true);
    }
    if (getCookie("autoLoginFlag") === "true" && savedId) {
      setAutoLogin(true);
    }
  }, []);

  useEffect(() => {
    if (!autoLogin || !userId || !userPw || autoLoginAttemptedRef.current) {
      return;
    }
    autoLoginAttemptedRef.current = true;
    void submitLogin(userId, userPw, saveId, true);
  }, [autoLogin, saveId, userId, userPw]);

  const tabMeta = useMemo(() => {
    if (tab === "overseas") {
      return {
        joinPath: buildLocalizedPath("/join/step1", "/join/en/step1"),
        findIdPath: buildLocalizedPath("/signin/findId/overseas", "/en/signin/findId/overseas"),
        findPasswordPath: buildLocalizedPath("/signin/findPassword/overseas", "/en/signin/findPassword/overseas")
      };
    }
    return {
      joinPath: buildLocalizedPath("/join/step1", "/join/en/step1"),
      findIdPath: buildLocalizedPath("/signin/findId", "/en/signin/findId"),
      findPasswordPath: buildLocalizedPath("/signin/findPassword", "/en/signin/findPassword")
    };
  }, [tab]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await submitLogin(userId, userPw, saveId, autoLogin);
  }

  async function submitLogin(nextUserId: string, nextUserPw: string, nextSaveId: boolean, nextAutoLogin: boolean) {
    if (!nextUserId.trim()) {
      window.alert(en ? "Please enter your ID" : "아이디를 입력하세요");
      return;
    }
    if (!nextUserPw) {
      window.alert(en ? "Please enter your password" : "비밀번호를 입력하세요");
      return;
    }
    setSubmitting(true);
    try {
      const body = await postJsonWithSession<LoginResponse>(buildLocalizedPath("/signin/actionLogin", "/en/signin/actionLogin"), {
        userId: nextUserId.trim(),
        userPw: nextUserPw,
        userSe: "ENT",
        autoLogin: nextAutoLogin
      });
      if (body.status === "loginFailure") {
        window.alert(body.errors || (en ? "Login failed." : "로그인에 실패했습니다."));
        return;
      }

      if (nextSaveId) {
        setCookie("userInputId", nextUserId.trim(), 7);
      } else {
        deleteCookie("userInputId");
      }
      if (nextAutoLogin) {
        setCookie("autoLoginFlag", "true", 7);
      } else {
        deleteCookie("autoLoginFlag");
      }

      window.sessionStorage.setItem("loginUserId", body.userId || nextUserId.trim());
      window.sessionStorage.setItem("loginUserSe", body.userSe || "ENT");
      navigate(body.certified === false
        ? buildLocalizedPath("/signin/authChoice", "/en/signin/authChoice")
        : buildLocalizedPath("/home", "/en/home"));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "로그인 요청 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-[var(--kr-gov-bg-gray)] text-[var(--kr-gov-text-primary)] min-h-screen flex flex-col">
      <a className="absolute -top-full left-0 bg-[var(--kr-gov-blue)] text-white p-3 z-[100] transition-all focus:top-0 focus:outline-none focus:ring-2 focus:ring-white" href="#main-content">
        {en ? "Skip to main content" : "본문 바로가기"}
      </a>
      <div className="bg-white border-b border-[var(--kr-gov-border-light)]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              alt={en ? "Government of the Republic of Korea Emblem" : "대한민국 정부 상징"}
              className="h-4"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8BPzqtzSLVGSrjt4mzhhVBy9SocCRDssk1F3XRVu7Xq9jHh7qzzt48wFi8qduCiJmB0LRQczPB7waPe3h0gkjn3jOEDxt6UJSJjdXNf8P-4WlM2BEZrfg2SL91uSiZrFcCk9KYrsdg-biTS9dtJ_OIghDBEVoAzMc33XcCYR_UP0QQdoYzBe840YrtH40xGyB9MSr0QH4D0foqlvOhG0jX8CDayXNlDsSKlfClVd3K2aodlwg4xSxgXHB3vnnnA0L2yNBNihQQg0"
            />
            <span className="text-[13px] font-medium text-[var(--kr-gov-text-secondary)]">
              {en ? "Official Government Service of the Republic of Korea" : "대한민국 정부 공식 서비스"}
            </span>
          </div>
        </div>
      </div>
      <header className="bg-white border-b border-[var(--kr-gov-border-light)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <a className="flex items-center gap-2" href={buildLocalizedPath("/home", "/en/home")}>
                <span className="material-symbols-outlined text-[32px] text-[var(--kr-gov-blue)]" style={{ fontVariationSettings: "'wght' 600" }}>
                  eco
                </span>
                <div className="flex flex-col">
                  <h1 className={`text-xl font-bold tracking-tight text-[var(--kr-gov-text-primary)]${en ? " uppercase" : ""}`}>
                    {en ? "CCUS Portal" : "CCUS 통합관리 포털"}
                  </h1>
                  <p className="text-[10px] text-[var(--kr-gov-text-secondary)] font-bold uppercase tracking-wider">
                    Carbon Capture, Utilization and Storage
                  </p>
                </div>
              </a>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                {en ? "Secure SSL Communication Active" : "안전한 SSL 보안 통신 중"}
              </div>
              <div className="flex border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] overflow-hidden">
                <button
                  className={`px-3 py-1 text-xs font-bold ${en ? "bg-white text-[var(--kr-gov-text-secondary)] hover:bg-gray-100" : "bg-[var(--kr-gov-blue)] text-white"}`}
                  onClick={() => navigate("/signin/loginView")}
                  type="button"
                >
                  KO
                </button>
                <button
                  className={`px-3 py-1 text-xs font-bold border-l border-[var(--kr-gov-border-light)] ${en ? "bg-[var(--kr-gov-blue)] text-white" : "bg-white text-[var(--kr-gov-text-secondary)] hover:bg-gray-100"}`}
                  onClick={() => navigate("/en/signin/loginView")}
                  type="button"
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center py-12 px-4" id="main-content">
        <div className="w-full max-w-[480px] mb-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-[var(--kr-gov-radius)] flex gap-3">
            <span className="material-symbols-outlined text-blue-600">info</span>
            <div className="text-sm text-blue-800 leading-relaxed">
              <p className="font-bold mb-0.5">{en ? "System Maintenance Notice" : "시스템 점검 안내"}</p>
              <p>
                {en
                  ? "Regular maintenance is scheduled for 2025.08.20 (Wed) 02:00 ~ 05:00 KST to ensure stable service delivery."
                  : "2025.08.20(수) 02:00 ~ 05:00 안정적인 서비스 제공을 위한 정기 점검이 예정되어 있습니다."}
              </p>
            </div>
          </div>
        </div>
        <div className="w-full max-w-[480px] bg-white border border-[var(--kr-gov-border-light)] rounded-lg shadow-sm overflow-hidden">
          <div className="flex border-b border-[var(--kr-gov-border-light)] bg-gray-50" aria-label={en ? "Member type" : "회원 유형 선택"} role="tablist">
            <button
              aria-selected={tab === "domestic"}
              className={`flex-1 py-4 text-[16px] border-b-4 ${tab === "domestic" ? "border-[var(--kr-gov-blue)] text-[var(--kr-gov-blue)] font-bold" : "border-transparent text-[var(--kr-gov-text-secondary)] hover:text-[var(--kr-gov-text-primary)] transition-colors"}`}
              onClick={() => setTab("domestic")}
              role="tab"
              tabIndex={tab === "domestic" ? 0 : -1}
              type="button"
            >
              {en ? "Domestic Enterprise" : "국내 기업 회원"}
            </button>
            <button
              aria-selected={tab === "overseas"}
              className={`flex-1 py-4 text-[16px] border-b-4 ${tab === "overseas" ? "border-[var(--kr-gov-blue)] text-[var(--kr-gov-blue)] font-bold" : "border-transparent text-[var(--kr-gov-text-secondary)] hover:text-[var(--kr-gov-text-primary)] transition-colors"}`}
              onClick={() => setTab("overseas")}
              role="tab"
              tabIndex={tab === "overseas" ? 0 : -1}
              type="button"
            >
              {en ? "Overseas Enterprise" : "해외 기업 회원"}
            </button>
          </div>
          <div className="p-8 lg:p-10">
            <form className="space-y-6" id="loginForm" name="loginForm" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-bold text-[var(--kr-gov-text-secondary)] mb-1.5" htmlFor="userId">
                    {en ? "ID" : "아이디"}
                  </label>
                  <input
                    autoComplete="username"
                    className="w-full h-14 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] focus:ring-2 focus:ring-[var(--kr-gov-focus)] focus:border-transparent transition-all"
                    id="userId"
                    name="userId"
                    onChange={(event) => setUserId(event.target.value)}
                    placeholder={en ? "Enter your ID" : "아이디를 입력하세요"}
                    spellCheck={false}
                    type="text"
                    value={userId}
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-bold text-[var(--kr-gov-text-secondary)] mb-1.5" htmlFor="userPw">
                    {en ? "Password" : "비밀번호"}
                  </label>
                  <input
                    autoComplete="current-password"
                    className="w-full h-14 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] focus:ring-2 focus:ring-[var(--kr-gov-focus)] focus:border-transparent transition-all"
                    id="userPw"
                    name="userPw"
                    onChange={(event) => setUserPw(event.target.value)}
                    placeholder={en ? "Enter your password" : "비밀번호를 입력하세요"}
                    type="password"
                    value={userPw}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      checked={saveId}
                      className="w-5 h-5 rounded border-[var(--kr-gov-border-light)] text-[var(--kr-gov-blue)] focus:ring-[var(--kr-gov-focus)]"
                      id="saveId"
                      onChange={(event) => setSaveId(event.target.checked)}
                      type="checkbox"
                    />
                    <span className="ml-2 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Remember ID" : "아이디 저장"}</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      checked={autoLogin}
                      className="w-5 h-5 rounded border-[var(--kr-gov-border-light)] text-[var(--kr-gov-blue)] focus:ring-[var(--kr-gov-focus)]"
                      id="autoLogin"
                      onChange={(event) => setAutoLogin(event.target.checked)}
                      type="checkbox"
                    />
                    <span className="ml-2 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Auto Login" : "자동 로그인"}</span>
                  </label>
                </div>
              </div>
              <button
                className="w-full h-14 bg-[var(--kr-gov-blue)] text-white text-lg font-bold rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)] transition-colors"
                disabled={submitting}
                type="submit"
              >
                {submitting ? (en ? "Signing in..." : "로그인 중...") : (en ? "Log In" : "로그인")}
              </button>
              <div className="flex items-center justify-center gap-4 text-sm text-[var(--kr-gov-text-secondary)] font-medium pt-2">
                <a className="hover:underline" href={tabMeta.findIdPath} id="findIdLink">
                  {en ? "Find ID" : "아이디 찾기"}
                </a>
                <span className="w-px h-3 bg-[var(--kr-gov-border-light)]"></span>
                <a className="hover:underline" href={tabMeta.findPasswordPath} id="findPasswordLink">
                  {en ? "Reset Password" : "비밀번호 재설정"}
                </a>
                <span className="w-px h-3 bg-[var(--kr-gov-border-light)]"></span>
                <a className="text-[var(--kr-gov-blue)] font-bold hover:underline" href={tabMeta.joinPath} id="joinLink">
                  {en ? "Register" : "회원가입"}
                </a>
              </div>
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-400 font-bold uppercase tracking-wider">
                    {en ? "Or Simple Authentication Login" : "또는 간편인증 로그인"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button className="w-full h-12 flex items-center justify-center gap-2 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] hover:bg-gray-50 transition-colors font-bold text-sm" type="button">
                  <span className="material-symbols-outlined text-blue-700">verified_user</span>
                  {en ? "Simple Authentication (Kakao, Toss, etc.)" : "간편인증 (카카오, 토스 등)"}
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button className="h-12 flex items-center justify-center gap-2 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] hover:bg-gray-50 transition-colors font-bold text-sm" type="button">
                    <span className="material-symbols-outlined text-gray-600">badge</span>
                    {en ? "Joint Certificate" : "공동인증서"}
                  </button>
                  <button className="h-12 flex items-center justify-center gap-2 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] hover:bg-gray-50 transition-colors font-bold text-sm" type="button">
                    <span className="material-symbols-outlined text-gray-600">account_balance</span>
                    {en ? "Financial Certificate" : "금융인증서"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <p className="mt-10 text-sm text-[var(--kr-gov-text-secondary)] text-center max-w-md leading-relaxed">
          {en
            ? "This system is restricted to authorized users only."
            : "본 시스템은 인가된 사용자만 이용 가능합니다."}
          <br />
          {en
            ? "Unauthorized access attempts may be punishable by law."
            : "불법적인 접근 시 관계 법령에 의해 처벌받을 수 있습니다."}
        </p>
      </main>
      <footer className="bg-white border-t border-[var(--kr-gov-border-light)]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  alt={en ? "Government of Korea Emblem" : "대한민국 정부 상징"}
                  className="h-8 grayscale"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUw404pm2QFmL61j73Dpfn72GnHGEg-KXTkLQ8WVJYUJ4iekrO0IvqJK8cd0cOSNSIh9Yq1LAodkSNj7oHtVAltdnnymj25ZzOI3l167qrrWmkEoYsZGu3ztT-YGo9se-fFR3NhBG3rZ8DYfs2vna0bxSzVG8VjryTnsz40LCDS2SN3-AeqXrbaPEva2ptmrQzO8iQSwbqSGyGKddlGf7FtnhHT25Cz5a5Xhk8MTve0BF4RWxN-ULiw64ZBbrTASIHQUaURqiZXyE"
                />
                <span className="text-xl font-black text-[var(--kr-gov-text-primary)]">
                  {en ? "Carbon Neutral CCUS Management Headquarters" : "탄소중립 CCUS 통합관리본부"}
                </span>
              </div>
              <address className="not-italic text-sm text-[var(--kr-gov-text-secondary)] leading-relaxed">
                {en
                  ? "(04551) 110 Sejong-daero, Jung-gu, Seoul, Republic of Korea | Representative: 02-1234-5678"
                  : "(04551) 서울특별시 중구 세종대로 110 | 대표전화: 02-1234-5678"}
                <br />
                © 2025 CCUS Integration Management Portal. All rights reserved.
              </address>
            </div>
            <div className="flex flex-col items-end gap-4">
              <div className="flex flex-wrap gap-6 text-sm font-bold">
                <a className="text-[var(--kr-gov-blue)] hover:underline" href="#">{en ? "Privacy Policy" : "개인정보처리방침"}</a>
                <a className="text-[var(--kr-gov-text-primary)] hover:underline" href="#">{en ? "Terms of Use" : "이용약관"}</a>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-[var(--kr-gov-bg-gray)] rounded-[var(--kr-gov-radius)] text-[11px] font-bold text-[var(--kr-gov-text-secondary)]">
                  {en ? "Last Updated:" : "최종 수정일:"} <time dateTime="2025-08-14">2025.08.14</time>
                </div>
                <img
                  alt={en ? "Web Accessibility Quality Certification Mark" : "웹 접근성 품질인증 마크"}
                  className="h-10"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzkKwREcbsB7LV3B2b7fBK7y2M_9Exa0vlGVzxNy2qM0n1LFMRlBCIa_XiIBeCfvv3DkMb9Z0D05Y-RMuAytisqlCS8QTpbtebgKnMnWoefEx5uJOgRW5H_8Pw9jmaRvkiW6sVRrifgIhrWc5hi2PRUGHgXn-q8-veHvu9wSwDhtcvbHKYyokgnP-hqdR10ahEAdBe4vFFkR88N_By8pjpp34KH9TwHOouRLBwdfVCsRGmDCS6wnvQZDwf6s4HyScSMXyJJGQjl8Y"
                />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function getCookie(cookieName: string) {
  const prefix = `${cookieName}=`;
  const cookies = document.cookie.split(";").map((value) => value.trim());
  const matched = cookies.find((value) => value.startsWith(prefix));
  return matched ? decodeURIComponent(matched.slice(prefix.length)) : "";
}

function setCookie(cookieName: string, value: string, days: number) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  document.cookie = `${cookieName}=${encodeURIComponent(value)}; expires=${expiresAt.toUTCString()}; path=/`;
}

function deleteCookie(cookieName: string) {
  document.cookie = `${cookieName}=; expires=${new Date(0).toUTCString()}; path=/`;
}

export function AuthChoicePage() {
  const en = isEnglish();
  const [saving, setSaving] = useState("");

  async function handleAuthChoice(authTy: string) {
    setSaving(authTy);
    try {
      const storedUserId = window.sessionStorage.getItem("loginUserId") || "";
      const storedUserSe = window.sessionStorage.getItem("loginUserSe") || "ENT";
      const body = await postJsonWithSession<{ status?: string; errors?: string }>(buildLocalizedPath("/signin/updateAuthInfo", "/en/signin/updateAuthInfo"), {
        userId: storedUserId || undefined,
        userSe: storedUserSe,
        authTy,
        authDn: authTy === "JOINT" ? `cn=${storedUserId}` : null,
        authCi: authTy === "SIMPLE" ? `CI_${Date.now()}` : null,
        authDi: authTy === "SIMPLE" ? `DI_${Date.now()}` : null
      });
      if (body.status !== "success") {
        throw new Error(body.errors || "인증 정보 저장에 실패했습니다.");
      }
      navigate(buildLocalizedPath("/home", "/en/home"));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : (en ? "An error occurred while processing authentication." : "인증 처리 중 오류가 발생했습니다."));
    } finally {
      setSaving("");
    }
  }

  return (
    <PublicFrame
      title={en ? "Select Authentication Method" : "인증 수단 선택"}
      subtitle={en ? "Please select your preferred authentication method for convenient and secure access." : "편리하고 안전한 이용을 위해 원하시는 인증 수단을 선택해 주세요."}
      languagePathKo="/signin/authChoice"
      languagePathEn="/en/signin/authChoice"
    >
      <section className="gov-entry-card gov-grid-card">
        <button className="gov-choice-card" disabled={!!saving} onClick={() => handleAuthChoice("SIMPLE")} type="button">
          <strong>{en ? "Simple Authentication" : "간편인증"}</strong>
          <span>{en ? "Fast authentication via various popular mobile apps" : "카카오, 네이버, 토스 등 다양한 앱으로 빠르게 인증"}</span>
        </button>
        <button className="gov-choice-card" disabled={!!saving} onClick={() => handleAuthChoice("JOINT")} type="button">
          <strong>{en ? "Joint Certificate" : "공동인증서"}</strong>
          <span>{en ? "Secure verification based on former Accredited Certificates" : "(구) 공인인증서 기반 안전한 본인 확인"}</span>
        </button>
        <button className="gov-choice-card" disabled={!!saving} onClick={() => handleAuthChoice("FINANCIAL")} type="button">
          <strong>{en ? "Financial Certificate" : "금융인증서"}</strong>
          <span>{en ? "Cloud-based certificate for convenient browser authentication" : "금융결제원 클라우드 기반 편리한 브라우저 인증"}</span>
        </button>
      </section>
      <div className="gov-security-chip">{en ? "The security module is operating safely" : "보안 모듈이 안전하게 작동 중입니다"}</div>
    </PublicFrame>
  );
}

export function FindIdPage() {
  const en = isEnglish();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const tab = getSearchParam("tab") === "overseas" || isOverseasPath() ? "overseas" : "domestic";

  function handleSubmit() {
    if (!name.trim() || !email.trim()) {
      window.alert("성명과 이메일을 입력해 주세요.");
      return;
    }
    const search = new URLSearchParams({
      applcntNm: name.trim(),
      email: email.trim(),
      tab
    });
    navigate(`${buildLocalizedPath("/signin/findId/result", "/en/signin/findId/result")}?${search.toString()}`);
  }

  return (
    <PublicFrame
      title={en ? "Find ID" : "아이디 찾기"}
      subtitle={en ? "You can find your ID using the information provided during registration." : "회원가입 시 등록한 정보를 통해 아이디를 찾으실 수 있습니다."}
      languagePathKo={tab === "overseas" ? "/signin/findId/overseas" : "/signin/findId"}
      languagePathEn={tab === "overseas" ? "/en/signin/findId/overseas" : "/en/signin/findId"}
      headerBadge={en ? "Secure SSL Communication Active" : "안전한 SSL 보안 통신 중"}
    >
      <section className="gov-entry-card gov-wide-card">
        <div className="gov-entry-tabs">
          <a className={tab === "domestic" ? "active" : ""} href={buildLocalizedPath("/signin/findId", "/en/signin/findId")}>{en ? "Domestic User" : "국내 사용자"}</a>
          <a className={tab === "overseas" ? "active" : ""} href={buildLocalizedPath("/signin/findId/overseas", "/en/signin/findId/overseas")}>{en ? "Overseas User" : "해외 사용자"}</a>
        </div>
        <div className="gov-form-stack">
          <label className="gov-field">
            <span>{en ? "Name" : "성명"}</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder={en ? "Enter your name" : "성명을 입력하세요"} />
          </label>
          <label className="gov-field">
            <span>{en ? "Email Address" : "이메일 주소"}</span>
            <div className="gov-inline-field">
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="example@institution.go.kr" />
              <button className="gov-secondary-button compact" type="button">{en ? "Send Verification Code" : "인증번호 발송"}</button>
            </div>
          </label>
          <div className="gov-verification-grid">
            <article className="gov-verification-card">
              <strong>{en ? "Mobile Verification" : "휴대폰 본인인증"}</strong>
              <p>{en ? "Verify your identity using a mobile phone under your name" : "본인 명의의 휴대폰으로 본인인증 진행"}</p>
            </article>
            <article className="gov-verification-card">
              <strong>{en ? "Joint/Financial Certificate" : "공동인증서/금융인증서"}</strong>
              <p>{en ? "Secure identity verification using a registered certificate" : "등록된 인증서를 통해 안전하게 본인확인"}</p>
            </article>
            <article className="gov-verification-card">
              <strong>{en ? "i-PIN Verification" : "아이핀 인증"}</strong>
              <p>{en ? "Secure online identity verification through i-PIN" : "아이핀을 통해 온라인으로 안전하게 본인확인"}</p>
            </article>
            <article className="gov-verification-card">
              <strong>{en ? "Digital OnePass" : "디지털원패스"}</strong>
              <p>{en ? "Convenient and secure verification with a single account" : "하나의 계정으로 편리하고 안전하게 본인확인"}</p>
            </article>
          </div>
          <button className="gov-primary-button gov-large-button" onClick={handleSubmit} type="button">{en ? "Find ID" : "아이디 찾기"}</button>
        </div>
      </section>
      <p className="gov-entry-help">{en ? "Having trouble finding your ID? Please contact Customer Support at 02-1234-5678 or use 1:1 inquiry." : "아이디 찾기에 어려움이 있으신가요? 고객지원센터 02-1234-5678 또는 1:1 문의를 이용해 주세요."}</p>
    </PublicFrame>
  );
}

export function FindPasswordPage() {
  const en = isEnglish();
  const [userId, setUserId] = useState("");
  const [verified, setVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const tab = getSearchParam("tab") === "overseas" || isOverseasPath() ? "overseas" : "domestic";

  function verifyIdentity() {
    if (!userId.trim()) {
      window.alert("아이디를 입력하세요.");
      return;
    }
    setVerified(true);
  }

  async function handleReset() {
    if (!verified) {
      window.alert("먼저 본인 확인을 완료해 주세요.");
      return;
    }
    if (!newPassword || !confirmPassword) {
      window.alert("새 비밀번호를 입력해 주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      window.alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    setSaving(true);
    try {
      const body = await postJsonWithSession<{ status?: string; errors?: string }>(buildLocalizedPath("/signin/resetPassword", "/en/signin/resetPassword"), {
        userId: userId.trim(),
        newPassword,
        language: isEnglish() ? "en" : "ko"
      });
      if (body.status !== "success") {
        throw new Error(body.errors || "비밀번호 재설정에 실패했습니다.");
      }
      window.alert("비밀번호가 변경되었습니다.");
      navigate(buildLocalizedPath("/signin/loginView", "/en/signin/loginView"));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "비밀번호 재설정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PublicFrame
      title={en ? "Reset Password" : "비밀번호 재설정"}
      subtitle={en ? "Proceed with identity verification and password reset for secure service use." : "안전한 서비스 이용을 위해 본인 확인 및 비밀번호 변경 절차를 진행합니다."}
      languagePathKo={tab === "overseas" ? "/signin/findPassword/overseas" : "/signin/findPassword"}
      languagePathEn={tab === "overseas" ? "/en/signin/findPassword/overseas" : "/en/signin/findPassword"}
      headerBadge={en ? "Secure SSL Communication Active" : "안전한 SSL 보안 통신 중"}
    >
      <section className="gov-entry-card gov-password-card">
        <div className="gov-password-steps">
          <div className="active"><span>1</span><strong>{en ? "Identity Verification" : "본인 확인"}</strong></div>
          <div className={verified ? "active" : ""}><span>2</span><strong>{en ? "Set New Password" : "새 비밀번호 설정"}</strong></div>
        </div>
        <div className="gov-password-section">
          <h2>{en ? "STEP 1. ID and Identity Verification" : "STEP 1. 아이디 및 본인 확인"}</h2>
          <label className="gov-field">
            <span>{en ? "ID" : "아이디"}</span>
            <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder={en ? "Enter your registered ID" : "등록된 아이디를 입력하세요"} />
          </label>
          <div className="gov-auth-choice-row">
            <button className="gov-method-button" type="button">{en ? "Joint Certificate" : "공동인증서"}</button>
            <button className="gov-method-button" type="button">{en ? "OTP Verification" : "OTP 인증"}</button>
            <button className="gov-method-button" type="button">{en ? "Email Verification" : "이메일 인증"}</button>
          </div>
          <button className="gov-secondary-button" onClick={verifyIdentity} type="button">{en ? "Complete Verification" : "본인 확인 완료"}</button>
        </div>
        <div className={`gov-password-section ${verified ? "" : "disabled"}`}>
          <h2>{en ? "STEP 2. Set New Password" : "STEP 2. 새 비밀번호 설정"}</h2>
          <label className="gov-field">
            <span>{en ? "New Password" : "새 비밀번호"}</span>
            <input disabled={!verified} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder={en ? "Enter a new password" : "새 비밀번호를 입력하세요"} />
          </label>
          <label className="gov-field">
            <span>{en ? "Confirm New Password" : "새 비밀번호 확인"}</span>
            <input disabled={!verified} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder={en ? "Enter it again" : "다시 한번 입력하세요"} />
          </label>
        </div>
        <div className="gov-action-row">
          <a className="gov-secondary-button" href={buildLocalizedPath("/signin/loginView", "/en/signin/loginView")}>{en ? "Cancel" : "취소"}</a>
          <button className="gov-primary-button" disabled={!verified || saving} onClick={handleReset} type="button">
            {saving ? (en ? "Updating..." : "변경 중...") : (en ? "Complete Password Reset" : "비밀번호 변경 완료")}
          </button>
        </div>
      </section>
      <section className="gov-warning-panel">
        <strong>{en ? "Guide for Safe Password Management" : "안전한 비밀번호 관리를 위한 안내"}</strong>
        <ul>
          <li>{en ? "Use at least 9 characters combining at least 3 of uppercase/lowercase letters, numbers, and special characters." : "영문 대/소문자, 숫자, 특수문자 중 3종류 이상을 조합하여 9자리 이상으로 설정해야 합니다."}</li>
          <li>{en ? "Avoid passwords identical to your ID, sequential numbers/letters, or recently used passwords." : "아이디와 동일한 문자, 연속된 숫자/문자, 최근 사용한 비밀번호는 사용을 자제해 주세요."}</li>
        </ul>
      </section>
    </PublicFrame>
  );
}
