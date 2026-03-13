import { FormEvent, useEffect, useState } from "react";
import {
  fetchFrontendSession,
  fetchMypage,
  FrontendSession,
  MypagePayload,
  saveMypageEmail,
  saveMypageStaff
} from "../../lib/api";
import { buildLocalizedPath, isEnglish, navigate } from "../../lib/runtime";

type MypageMember = Record<string, unknown> & {
  entrprsmberId?: string;
  applcntNm?: string;
  applcntEmailAdres?: string;
  cmpnyNm?: string;
  bizrno?: string;
  deptNm?: string;
  areaNo?: string;
  entrprsMiddleTelno?: string;
  entrprsEndTelno?: string;
};

type CopySet = {
  skip: string;
  government: string;
  guideline: string;
  homePath: string;
  title: string;
  subTitle: string;
  mypage: string;
  menuItems: string[];
  sectionBasic: string;
  sectionOrg: string;
  sectionAuth: string;
  fullName: string;
  userId: string;
  email: string;
  phone: string;
  companyName: string;
  businessNo: string;
  jobTitle: string;
  readonlyId: string;
  verifyChange: string;
  phoneVerified: string;
  auth1Title: string;
  auth1Desc: string;
  auth2Title: string;
  auth2Desc: string;
  connected: string;
  disconnect: string;
  connect: string;
  cancel: string;
  submit: string;
  logout: string;
  footerOrg: string;
  footerAddress: string;
  footerLinks: string[];
  footerCopyright: string;
  footerLastModifiedLabel: string;
  footerWaAlt: string;
  loginRequired: string;
  loginMove: string;
  pendingTitle: string;
  pendingDescription: string;
  rejectionTitle: string;
  companyLabel: string;
  submittedLabel: string;
  statusLabel: string;
  saveSuccess: string;
  emailSaved: string;
  saveUnavailable: string;
  homeNavItems: string[];
};

const COPY: Record<"ko" | "en", CopySet> = {
  ko: {
    skip: "본문 바로가기",
    government: "대한민국 정부 공식 서비스",
    guideline: "이 누리집은 2025 디지털 정부 UI/UX 가이드라인을 준수합니다.",
    homePath: "/home",
    title: "회원 정보 수정",
    subTitle: "서비스 이용을 위한 회원님의 기본 정보를 최신 상태로 관리해 주세요.",
    mypage: "마이페이지",
    menuItems: ["회원 정보 관리", "사업장 관리", "나의 신청 내역", "증명서 발급함", "1:1 문의 내역"],
    sectionBasic: "기본 정보",
    sectionOrg: "소속 기관 정보",
    sectionAuth: "인증 정보 관리",
    fullName: "성명",
    userId: "아이디",
    email: "이메일",
    phone: "연락처",
    companyName: "기관/기업명",
    businessNo: "사업자등록번호",
    jobTitle: "직함",
    readonlyId: "아이디는 변경이 불가능합니다.",
    verifyChange: "변경인증",
    phoneVerified: "휴대폰 본인인증 완료",
    auth1Title: "공동인증서 / 금융인증서",
    auth1Desc: "범용 공인인증서 또는 금융인증서를 통한 본인확인",
    auth2Title: "디지털 원패스 (Digital OnePass)",
    auth2Desc: "하나의 아이디로 여러 정부 서비스를 안전하게 이용",
    connected: "연동 완료",
    disconnect: "연동 해제",
    connect: "연동하기",
    cancel: "취소",
    submit: "정보 수정 완료",
    logout: "로그아웃",
    footerOrg: "CCUS 통합관리본부",
    footerAddress: "(04551) 서울특별시 중구 세종대로 110 | 대표전화: 02-1234-5678 (평일 09:00~18:00)",
    footerLinks: ["개인정보처리방침", "이용약관", "이메일무단수집거부"],
    footerCopyright: "© 2025 CCUS Carbon Footprint Platform. All rights reserved.",
    footerLastModifiedLabel: "최종 수정일:",
    footerWaAlt: "웹 접근성 품질인증 마크",
    loginRequired: "로그인 후 이용 가능합니다.",
    loginMove: "로그인 페이지로 이동",
    pendingTitle: "회원가입 신청이 검토 중입니다.",
    pendingDescription: "회원사 승인이 완료되면 마이페이지 수정 기능을 이용할 수 있습니다.",
    rejectionTitle: "반려 사유",
    companyLabel: "소속 기관",
    submittedLabel: "신청 일시",
    statusLabel: "진행 상태",
    saveSuccess: "회원 정보를 저장했습니다.",
    emailSaved: "이메일 주소를 저장했습니다.",
    saveUnavailable: "현재 저장할 수 없습니다.",
    homeNavItems: ["탄소배출", "보고서&인증서", "탄소정보", "거래", "모니터링", "결제", "고객지원"]
  },
  en: {
    skip: "Skip to main content",
    government: "Official Website of the Republic of Korea",
    guideline: "This website complies with the 2025 Digital Government UI/UX Guidelines.",
    homePath: "/en/home",
    title: "Edit Member Information",
    subTitle: "Please keep your basic information up to date for better service access.",
    mypage: "My Page",
    menuItems: ["Account Info Management", "Business Site Management", "My Applications", "Certificate Issuance", "1:1 Inquiries"],
    sectionBasic: "Basic Information",
    sectionOrg: "Organization Information",
    sectionAuth: "Authentication Management",
    fullName: "Full Name",
    userId: "Username (ID)",
    email: "Email Address",
    phone: "Phone Number",
    companyName: "Organization / Company Name",
    businessNo: "Business Registration Number",
    jobTitle: "Job Title",
    readonlyId: "Username cannot be changed.",
    verifyChange: "Verify Change",
    phoneVerified: "Mobile verification complete",
    auth1Title: "Joint Certificate / Financial Certificate",
    auth1Desc: "Identify yourself through general public or financial certificates",
    auth2Title: "Digital OnePass",
    auth2Desc: "Access multiple government services securely with a single ID",
    connected: "Connected",
    disconnect: "Disconnect",
    connect: "Connect",
    cancel: "Cancel",
    submit: "Update Information",
    logout: "Logout",
    footerOrg: "CCUS Integrated Management Office",
    footerAddress: "(04551) 110 Sejong-daero, Jung-gu, Seoul, Korea | Main Contact: 02-1234-5678 (Weekdays 09:00~18:00)",
    footerLinks: ["Privacy Policy", "Terms of Use", "Email Collection Refusal"],
    footerCopyright: "© 2025 CCUS Carbon Footprint Platform. All rights reserved.",
    footerLastModifiedLabel: "Last Modified:",
    footerWaAlt: "Web Accessibility Quality Mark",
    loginRequired: "Please sign in first.",
    loginMove: "Go to Sign In",
    pendingTitle: "Your membership request is under review.",
    pendingDescription: "You can edit account information after company review is completed.",
    rejectionTitle: "Rejection Reason",
    companyLabel: "Organization",
    submittedLabel: "Submitted At",
    statusLabel: "Status",
    saveSuccess: "Your account information has been saved.",
    emailSaved: "Email address updated.",
    saveUnavailable: "Saving is currently unavailable.",
    homeNavItems: ["Emission", "Report & Cert", "Carbon Info", "Trading", "Monitoring", "Payment", "Support"]
  }
};

const GOV_MARK = "https://lh3.googleusercontent.com/aida-public/AB6AXuD8BPzqtzSLVGSrjt4mzhhVBy9SocCRDssk1F3XRVu7Xq9jHh7qzzt48wFi8qduCiJmB0LRQczPB7waPe3h0gkjn3jOEDxt6UJSJjdXNf8P-4WlM2BEZrfg2SL91uSiZrFcCk9KYrsdg-biTS9dtJ_OIghDBEVoAzMc33XcCYR_UP0QQdoYzBe840YrtH40xGyB9MSr0QH4D0foqlvOhG0jX8CDayXNlDsSKlfClVd3K2aodlwg4xSxgXHB3vnnnA0L2yNBNihQQg0";
const GOV_FOOTER_MARK = "https://lh3.googleusercontent.com/aida-public/AB6AXuBUw404pm2QFmL61j73Dpfn72GnHGEg-KXTkLQ8WVJYUJ4iekrO0IvqJK8cd0cOSNSIh9Yq1LAodkSNj7oHtVAltdnnymj25ZzOI3l167qrrWmkEoYsZGu3ztT-YGo9se-fFR3NhBG3rZ8DYfs2vna0bxSzVG8VjryTnsz40LCDS2SN3-AeqXrbaPEva2ptmrQzO8iQSwbqSGyGKddlGf7FtnhHT25Cz5a5Xhk8MTve0BF4RWxN-ULiw64ZBbrTASIHQUaURqiZXyE";

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function formatPhone(areaNo: string, middleTelno: string, endTelno: string) {
  return [areaNo, middleTelno, endTelno].filter(Boolean).join("-");
}

function parsePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 4) {
    return { areaNo: digits, middleTelno: "", endTelno: "" };
  }
  if (digits.length <= 8) {
    return { areaNo: digits.slice(0, 4), middleTelno: digits.slice(4), endTelno: "" };
  }
  return {
    areaNo: digits.slice(0, 4),
    middleTelno: digits.slice(4, 8),
    endTelno: digits.slice(8, 12)
  };
}

export function MypageMigrationPage() {
  const en = isEnglish();
  const copy = COPY[en ? "en" : "ko"];
  const [page, setPage] = useState<MypagePayload | null>(null);
  const [session, setSession] = useState<FrontendSession | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [areaNo, setAreaNo] = useState("");
  const [middleTelno, setMiddleTelno] = useState("");
  const [endTelno, setEndTelno] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadPage() {
    setError("");
    const loadedPage = await fetchMypage(en);
    setPage(loadedPage);
    const member = (loadedPage.member || {}) as MypageMember;
    setFullName(stringValue(member.applcntNm));
    setEmail(stringValue(member.applcntEmailAdres));
    setJobTitle(stringValue(member.deptNm));
    setAreaNo(stringValue(member.areaNo));
    setMiddleTelno(stringValue(member.entrprsMiddleTelno));
    setEndTelno(stringValue(member.entrprsEndTelno));

    if (loadedPage.authenticated !== false) {
      const loadedSession = await fetchFrontendSession();
      setSession(loadedSession);
    } else {
      setSession(null);
    }
  }

  useEffect(() => {
    void loadPage().catch((nextError: Error) => {
      setError(nextError.message);
    });
  }, [en]);

  async function handleLogout() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (session?.csrfHeaderName && session.csrfToken) {
      headers[session.csrfHeaderName] = session.csrfToken;
    }
    await fetch(buildLocalizedPath("/signin/actionLogout", "/en/signin/actionLogout"), {
      method: "POST",
      credentials: "include",
      headers
    });
    navigate(buildLocalizedPath("/home", "/en/home"));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      setError(copy.saveUnavailable);
      return;
    }
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      await saveMypageEmail(session, email, en);
      await saveMypageStaff(
        session,
        {
          staffName: fullName,
          deptNm: jobTitle,
          areaNo,
          middleTelno,
          endTelno
        },
        en
      );
      await loadPage();
      setMessage(copy.saveSuccess);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : copy.saveUnavailable);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEmailVerify() {
    if (!session) {
      setError(copy.saveUnavailable);
      return;
    }
    setError("");
    setMessage("");
    try {
      await saveMypageEmail(session, email, en);
      await loadPage();
      setMessage(copy.emailSaved);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : copy.saveUnavailable);
    }
  }

  function handleCancel() {
    if (!page) {
      return;
    }
    const member = (page.member || {}) as MypageMember;
    setFullName(stringValue(member.applcntNm));
    setEmail(stringValue(member.applcntEmailAdres));
    setJobTitle(stringValue(member.deptNm));
    setAreaNo(stringValue(member.areaNo));
    setMiddleTelno(stringValue(member.entrprsMiddleTelno));
    setEndTelno(stringValue(member.entrprsEndTelno));
    setError("");
    setMessage("");
  }

  useEffect(() => {
    if (page?.authenticated === false && page.redirectUrl) {
      navigate(String(page.redirectUrl));
    }
  }, [page]);

  const member = ((page?.member || {}) as MypageMember);
  const userId = stringValue(page?.userId) || stringValue(member.entrprsmberId) || "-";
  const companyName = stringValue(member.cmpnyNm) || "-";
  const businessNumber = stringValue(member.bizrno) || "-";
  const phoneNumber = formatPhone(areaNo, middleTelno, endTelno);

  if (!page) {
    return (
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <p className="text-sm text-[var(--kr-gov-text-secondary)]">Loading...</p>
      </main>
    );
  }

  if (page.pageType === "pending") {
    const pendingRejected = stringValue(page.pendingStatus).toUpperCase() === "R";
    return (
      <div className="bg-[var(--kr-gov-bg-gray)] text-[var(--kr-gov-text-primary)] min-h-screen flex flex-col">
        <a className="skip-link" href="#main-content">{copy.skip}</a>
        <div className="bg-white border-b border-[var(--kr-gov-border-light)]">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img alt={copy.government} className="h-4" src={GOV_MARK} />
              <span className="text-[13px] font-medium text-[var(--kr-gov-text-secondary)]">{copy.government}</span>
            </div>
          </div>
        </div>
        <header className="bg-white border-b border-[var(--kr-gov-border-light)] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center gap-3">
                <a className="flex items-center gap-2" href={copy.homePath}>
                  <span className="material-symbols-outlined text-[32px] text-[var(--kr-gov-blue)]" style={{ fontVariationSettings: "'wght' 600" }}>eco</span>
                  <div className="flex flex-col">
                    <h1 className={`text-xl font-bold tracking-tight text-[var(--kr-gov-text-primary)] ${en ? "leading-none mb-1" : ""}`}>
                      {en ? "CCUS Management Portal" : "CCUS 통합관리 포털"}
                    </h1>
                    <p className="text-[10px] text-[var(--kr-gov-text-secondary)] font-bold uppercase tracking-wider">Carbon Capture, Utilization and Storage</p>
                  </div>
                </a>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] overflow-hidden">
                  <button className={`px-3 py-1 text-xs font-bold ${en ? "bg-white text-[var(--kr-gov-text-secondary)] hover:bg-gray-100" : "bg-[var(--kr-gov-blue)] text-white"}`} onClick={() => navigate("/mypage")} type="button">KO</button>
                  <button className={`px-3 py-1 text-xs font-bold border-l border-[var(--kr-gov-border-light)] ${en ? "bg-[var(--kr-gov-blue)] text-white" : "bg-white text-[var(--kr-gov-text-secondary)] hover:bg-gray-100"}`} onClick={() => navigate("/en/mypage")} type="button">EN</button>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-grow flex flex-col items-center justify-center py-12 px-4" id="main-content">
          <div className="w-full max-w-[640px] bg-white border border-[var(--kr-gov-border-light)] rounded-lg shadow-sm overflow-hidden p-8 md:p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${pendingRejected ? "bg-red-50" : "bg-blue-50"}`}>
                <span className={`material-symbols-outlined text-[48px] ${pendingRejected ? "text-[var(--kr-gov-error)]" : "text-[var(--kr-gov-blue)]"}`}>
                  {pendingRejected ? "error" : "pending_actions"}
                </span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[var(--kr-gov-text-primary)] mb-4">
              {pendingRejected
                ? (en ? "Registration Rejected" : "가입 반려 안내")
                : (en ? "Registration Pending Approval" : "가입 승인 대기 안내")}
            </h2>
            <p className="text-lg font-medium text-[var(--kr-gov-text-primary)] mb-8">
              {pendingRejected
                ? (en ? "Your registration request was rejected and requires corrections before resubmission." : "현재 회원가입 신청이 반려되어 보완 후 다시 진행이 필요합니다.")
                : (en ? "Your registration request has been submitted and is currently awaiting administrator approval." : "현재 회원가입 신청이 완료되어 운영자의 승인을 기다리고 있습니다.")}
            </p>
            <div className="bg-gray-50 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] p-6 mb-8 text-left">
              <h3 className="text-sm font-bold text-[var(--kr-gov-text-secondary)] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">assignment</span>
                {en ? "Application Details" : "신청 정보 확인"}
              </h3>
              <dl className="space-y-3">
                <div className="flex border-b border-gray-200 pb-2">
                  <dt className={en ? "w-40 text-sm font-bold text-[var(--kr-gov-text-secondary)]" : "w-32 text-sm font-bold text-[var(--kr-gov-text-secondary)]"}>{en ? "Submission Date" : "신청 일시"}</dt>
                  <dd className="text-sm text-[var(--kr-gov-text-primary)]">{stringValue(page.submittedAt) || "-"}</dd>
                </div>
                <div className="flex border-b border-gray-200 pb-2">
                  <dt className={en ? "w-40 text-sm font-bold text-[var(--kr-gov-text-secondary)]" : "w-32 text-sm font-bold text-[var(--kr-gov-text-secondary)]"}>{en ? "User ID" : "아이디"}</dt>
                  <dd className="text-sm text-[var(--kr-gov-text-primary)]">{userId}</dd>
                </div>
                <div className="flex border-b border-gray-200 pb-2">
                  <dt className={en ? "w-40 text-sm font-bold text-[var(--kr-gov-text-secondary)]" : "w-32 text-sm font-bold text-[var(--kr-gov-text-secondary)]"}>{en ? "Affiliation" : "소속 기관"}</dt>
                  <dd className="text-sm text-[var(--kr-gov-text-primary)]">{stringValue(page.companyName) || "-"}</dd>
                </div>
                <div className="flex">
                  <dt className={en ? "w-40 text-sm font-bold text-[var(--kr-gov-text-secondary)]" : "w-32 text-sm font-bold text-[var(--kr-gov-text-secondary)]"}>{en ? "Status" : "진행 상태"}</dt>
                  <dd className="text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${pendingRejected ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-800"}`}>
                      {pendingRejected ? (en ? "Rejected" : "반려") : (en ? "Pending Approval" : "승인 대기")}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
            <div className={`p-4 rounded-[var(--kr-gov-radius)] mb-10 ${pendingRejected ? "bg-red-50 border border-red-100" : "bg-amber-50 border border-amber-100"}`}>
              <p className={`text-[13px] leading-relaxed ${pendingRejected ? "text-red-800" : "text-amber-900"}`}>
                {pendingRejected
                  ? (en
                    ? "The submitted information or supporting documents need correction. Review the rejection reason below and proceed again based on the company rejection guidance."
                    : "입력하신 정보 또는 제출하신 서류에 보완이 필요합니다. 아래의 반려 사유를 확인하시고, 회원사 반려 화면 기준으로 보완 후 다시 진행해 주세요.")
                  : (en
                    ? "The review process may take 2 to 3 business days. Approval results will be sent to your registered email and via SMS."
                    : "운영자 검토는 영업일 기준 2~3일이 소요될 수 있으며, 승인 결과는 회원정보에 등록된 이메일과 SMS로 안내해 드립니다.")}
              </p>
            </div>
            {pendingRejected && page.rejectionReason ? (
              <div className="border border-red-200 rounded-lg overflow-hidden bg-white mt-4 mb-10">
                <div className="bg-red-50 px-6 py-3 border-b border-red-100">
                  <h5 className="text-sm font-bold text-red-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">speaker_notes</span>
                    {en ? "Detailed Rejection Reason" : "상세 반려 사유"}
                  </h5>
                </div>
                <div className="p-6 text-left">
                  <p className="text-base text-[var(--kr-gov-text-primary)] leading-relaxed">{stringValue(page.rejectionReason)}</p>
                  <p className="mt-4 text-xs text-[var(--kr-gov-text-secondary)]">
                    {en ? "Processing office: Carbon Neutral CCUS Integrated Management Headquarters" : "처리기한: 탄소중립 CCUS 통합관리본부 운영국"}
                    {page.rejectionProcessedAt ? ` (${stringValue(page.rejectionProcessedAt)})` : ""}
                  </p>
                </div>
              </div>
            ) : null}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a className="min-w-[160px] h-12 flex items-center justify-center bg-[var(--kr-gov-blue)] text-white font-bold rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)] transition-colors focus-visible" href={copy.homePath}>
                {en ? "Go to Home" : "홈으로 이동"}
              </a>
              <button className="min-w-[160px] h-12 flex items-center justify-center border border-[var(--kr-gov-border-light)] text-[var(--kr-gov-text-primary)] font-bold rounded-[var(--kr-gov-radius)] hover:bg-gray-50 transition-colors focus-visible" onClick={() => void handleLogout()} type="button">
                {copy.logout}
              </button>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-[var(--kr-gov-text-secondary)]">
              {pendingRejected
                ? (en ? "For rejection inquiries: 02-1234-5678 (System Management Team)" : "반려 관련 문의: 02-1234-5678 (시스템 관리팀)")
                : (en ? "For inquiries regarding delayed approval: 02-1234-5678 (System Management Team)" : "승인 지연 등 관련 문의: 02-1234-5678 (시스템 관리팀)")}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="mypage-screen bg-white text-[var(--kr-gov-text-primary)] min-h-screen">
      <a className="skip-link" href="#main-content">
        {copy.skip}
      </a>

      <div className="bg-[var(--kr-gov-bg-gray)] border-b border-[var(--kr-gov-border-light)]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img alt={copy.government} className="h-4" src={GOV_MARK} />
            <span className="text-[13px] font-medium text-[var(--kr-gov-text-secondary)]">{copy.government}</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs font-medium text-[var(--kr-gov-text-secondary)]">
            <p>{copy.guideline}</p>
          </div>
        </div>
      </div>

      <header className="bg-white border-b border-[var(--kr-gov-border-light)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 shrink-0">
              <a className="flex items-center gap-2 focus-visible" href={copy.homePath}>
                <span className="material-symbols-outlined text-[32px] text-[var(--kr-gov-blue)]" style={{ fontVariationSettings: "'wght' 600" }}>
                  eco
                </span>
                <div className="flex flex-col">
                  <h1 className="text-lg font-bold tracking-tight text-[var(--kr-gov-text-primary)] leading-none">
                    {en ? "CCUS Carbon Footprint Platform" : "CCUS 탄소발자국 플랫폼"}
                  </h1>
                  <p className="text-[9px] text-[var(--kr-gov-text-secondary)] font-bold uppercase tracking-wider mt-1">
                    Carbon Footprint Platform
                  </p>
                </div>
              </a>
            </div>

            <nav className="hidden xl:flex items-center space-x-1 h-full ml-8 flex-1 justify-center">
              {copy.homeNavItems.map((item) => (
                <div className="gnb-item h-full relative group" key={item}>
                  <a
                    className={`h-full flex items-center px-4 font-bold text-[var(--kr-gov-text-primary)] border-b-4 border-transparent hover:text-[var(--kr-gov-blue)] hover:border-[var(--kr-gov-blue)] transition-all focus-visible ${en ? "text-[15px]" : "text-[16px]"}`}
                    href="#"
                    onClick={(event) => event.preventDefault()}
                  >
                    {item}
                  </a>
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{en ? (fullName || userId) : `${fullName || userId} 님`}</span>
                <button className="text-xs text-[var(--kr-gov-text-secondary)] hover:underline" onClick={() => void handleLogout()} type="button">
                  {copy.logout}
                </button>
              </div>
              <a className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors" href="#" onClick={(event) => event.preventDefault()}>
                <span className="material-symbols-outlined text-gray-600">person</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-10" id="main-content">
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="w-full lg:w-64 shrink-0">
            <h2 className="text-2xl font-black mb-8">{copy.mypage}</h2>
            <nav className="space-y-1">
              {copy.menuItems.map((item, index) => (
                <a
                  className={index === 0
                    ? "flex items-center justify-between px-4 py-3 bg-[var(--kr-gov-blue)] text-white rounded-[var(--kr-gov-radius)] font-bold"
                    : "flex items-center justify-between px-4 py-3 hover:bg-gray-100 text-[var(--kr-gov-text-secondary)] font-bold transition-colors"}
                  href="#"
                  key={item}
                  onClick={(event) => event.preventDefault()}
                >
                  {item}
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </a>
              ))}
            </nav>
          </aside>

          <div className="flex-1">
            <div className="border-b-2 border-[var(--kr-gov-text-primary)] pb-4 mb-8">
              <h3 className="text-3xl font-bold">{copy.title}</h3>
              <p className="text-[var(--kr-gov-text-secondary)] mt-2 font-medium">{copy.subTitle}</p>
            </div>

            {error ? (
              <div className="mb-6 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-error)]/30 bg-[var(--kr-gov-error)]/5 px-4 py-3 text-sm text-[var(--kr-gov-error)]">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="mb-6 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-success)]/30 bg-[var(--kr-gov-success)]/5 px-4 py-3 text-sm text-[var(--kr-gov-success)]">
                {message}
              </div>
            ) : null}

            <form className="space-y-10" onSubmit={handleSubmit}>
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-1.5 h-6 bg-[var(--kr-gov-blue)]"></span>
                  <h4 className="text-xl font-bold">{copy.sectionBasic}</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <label className="form-label" htmlFor="user-name">{copy.fullName} <span className="text-[var(--kr-gov-error)]">*</span></label>
                    <input className="form-input mypage-form-input" id="user-name" onChange={(event) => setFullName(event.target.value)} type="text" value={fullName} />
                  </div>

                  <div className="space-y-2">
                    <label className="form-label" htmlFor="user-id">{copy.userId}</label>
                    <input className="form-input form-input-readonly mypage-form-input" id="user-id" readOnly type="text" value={userId} />
                    <p className="text-[11px] text-[var(--kr-gov-text-secondary)] mt-1">{copy.readonlyId}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="form-label" htmlFor="user-email">{copy.email} <span className="text-[var(--kr-gov-error)]">*</span></label>
                    <div className="flex gap-2">
                      <input className="form-input mypage-form-input" id="user-email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
                      <button
                        className="gov-btn gov-btn-secondary mypage-action-btn secondary shrink-0 px-4 text-sm"
                        onClick={() => void handleEmailVerify()}
                        type="button"
                      >
                        {copy.verifyChange}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="form-label" htmlFor="user-phone">{copy.phone} <span className="text-[var(--kr-gov-error)]">*</span></label>
                    <input
                      className="form-input mypage-form-input"
                      id="user-phone"
                      onChange={(event) => {
                        const next = parsePhone(event.target.value);
                        setAreaNo(next.areaNo);
                        setMiddleTelno(next.middleTelno);
                        setEndTelno(next.endTelno);
                      }}
                      type="tel"
                      value={phoneNumber}
                    />
                    {phoneNumber ? (
                      <p className="text-[11px] text-[var(--kr-gov-success)] mt-1 flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        {copy.phoneVerified}
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-1.5 h-6 bg-[var(--kr-gov-blue)]"></span>
                  <h4 className="text-xl font-bold">{copy.sectionOrg}</h4>
                </div>
                <div className="bg-gray-50 p-6 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <label className="form-label" htmlFor="org-name">{copy.companyName}</label>
                    <input className="form-input form-input-readonly mypage-form-input" id="org-name" readOnly type="text" value={companyName} />
                  </div>
                  <div className="space-y-2">
                    <label className="form-label" htmlFor="org-code">{copy.businessNo}</label>
                    <input className="form-input form-input-readonly mypage-form-input" id="org-code" readOnly type="text" value={businessNumber} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="form-label" htmlFor="user-title">{copy.jobTitle} <span className="text-[var(--kr-gov-error)]">*</span></label>
                    <input className="form-input mypage-form-input max-w-md" id="user-title" onChange={(event) => setJobTitle(event.target.value)} type="text" value={jobTitle} />
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-1.5 h-6 bg-[var(--kr-gov-blue)]"></span>
                  <h4 className="text-xl font-bold">{copy.sectionAuth}</h4>
                </div>
                <div className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] divide-y divide-[var(--kr-gov-border-light)]">
                  <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-[var(--kr-gov-blue)] rounded-full flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">security</span>
                      </div>
                      <div>
                        <h5 className="font-bold text-base">{copy.auth1Title}</h5>
                        <p className="text-sm text-[var(--kr-gov-text-secondary)] mt-0.5">{copy.auth1Desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-[var(--kr-gov-success)]/10 text-[var(--kr-gov-success)] text-xs font-bold rounded-full border border-[var(--kr-gov-success)]/20 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">link</span>
                        {copy.connected}
                      </span>
                      <button className="text-sm font-bold text-[var(--kr-gov-text-secondary)] hover:underline" type="button">
                        {copy.disconnect}
                      </button>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">key</span>
                      </div>
                      <div>
                        <h5 className="font-bold text-base">{copy.auth2Title}</h5>
                        <p className="text-sm text-[var(--kr-gov-text-secondary)] mt-0.5">{copy.auth2Desc}</p>
                      </div>
                    </div>
                    <button className="gov-btn gov-btn-outline-blue px-6 py-2 text-sm" type="button">
                      {copy.connect}
                    </button>
                  </div>
                </div>
              </section>

              <div className="pt-10 flex justify-center gap-3 border-t border-[var(--kr-gov-border-light)]">
                <button
                  className="gov-btn gov-btn-secondary mypage-action-btn secondary min-w-[160px]"
                  onClick={handleCancel}
                  type="button"
                >
                  {copy.cancel}
                </button>
                <button
                  className="gov-btn gov-btn-primary mypage-action-btn primary min-w-[160px]"
                  disabled={submitting}
                  type="submit"
                >
                  {submitting ? "..." : copy.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-[var(--kr-gov-border-light)] mt-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-12 pb-8">
          <div className="flex flex-col md:flex-row justify-between gap-10 pb-10 border-b border-[var(--kr-gov-border-light)]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img alt={copy.government} className="h-8 grayscale" src={GOV_FOOTER_MARK} />
                <span className="text-xl font-black text-[var(--kr-gov-text-primary)]">{copy.footerOrg}</span>
              </div>
              <address className="not-italic text-sm text-[var(--kr-gov-text-secondary)] leading-relaxed">
                {copy.footerAddress}
                <br />
                {en
                  ? "This service manages greenhouse gas reduction performance in accordance with relevant laws."
                  : "본 서비스는 관계 법령에 의거하여 온실가스 감축 성과를 관리합니다."}
              </address>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-bold">
              {copy.footerLinks.map((item, index) => (
                <a
                  className={index === 0 ? "text-[var(--kr-gov-blue)] hover:underline" : "text-[var(--kr-gov-text-primary)] hover:underline"}
                  href="#"
                  onClick={(event) => event.preventDefault()}
                  key={item}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-xs font-medium text-[var(--kr-gov-text-secondary)]">
              <p>{copy.footerCopyright}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-[var(--kr-gov-bg-gray)] rounded-[var(--kr-gov-radius)] text-xs font-bold text-[var(--kr-gov-text-secondary)]">
                <span>{copy.footerLastModifiedLabel}</span>
                <time dateTime="2025-08-14">2025.08.14</time>
              </div>
              <img alt={copy.footerWaAlt} className="h-10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzkKwREcbsB7LV3B2b7fBK7y2M_9Exa0vlGVzxNy2qM0n1LFMRlBCIa_XiIBeCfvv3DkMb9Z0D05Y-RMuAytisqlCS8QTpbtebgKnMnWoefEx5uJOgRW5H_8Pw9jmaRvkiW6sVRrifgIhrWc5hi2PRUGHgXn-q8-veHvu9wSwDhtcvbHKYyokgnP-hqdR10ahEAdBe4vFFkR88N_By8pjpp34KH9TwHOouRLBwdfVCsRGmDCS6wnvQZDwf6s4HyScSMXyJJGQjl8Y" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
