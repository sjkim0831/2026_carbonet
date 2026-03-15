import { FormEvent, useEffect, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { useFrontendSession } from "../../app/hooks/useFrontendSession";
import {
  UserGovernmentBar,
  UserLanguageToggle,
  UserPortalFooter,
  UserPortalHeader
} from "../../components/user-shell/UserPortalChrome";
import {
  fetchMypage,
  MypagePayload,
  saveMypageEmail,
  saveMypageStaff
} from "../../lib/api/client";
import { isEnglish, navigate } from "../../lib/navigation/runtime";

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
  blockedTitle: string;
  blockedDescription: string;
  rejectionTitle: string;
  companyLabel: string;
  submittedLabel: string;
  statusLabel: string;
  statusCodeLabel: string;
  saveSuccess: string;
  emailSaved: string;
  saveUnavailable: string;
  homeNavItems: string[];
  footerServiceLine: string;
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
    footerLinks: ["개인정보처리방침", "이용약관", "사이트맵", "이메일무단수집거부"],
    footerCopyright: "© 2025 CCUS Carbon Footprint Platform. All rights reserved.",
    footerLastModifiedLabel: "최종 수정일:",
    footerWaAlt: "웹 접근성 품질인증 마크",
    loginRequired: "로그인 후 이용 가능합니다.",
    loginMove: "로그인 페이지로 이동",
    pendingTitle: "회원가입 신청이 검토 중입니다.",
    pendingDescription: "회원사 승인이 완료되면 마이페이지 수정 기능을 이용할 수 있습니다.",
    blockedTitle: "마이페이지 접속 제한",
    blockedDescription: "현재 회원 상태에서는 마이페이지에 접속할 수 없습니다.",
    rejectionTitle: "반려 사유",
    companyLabel: "소속 기관",
    submittedLabel: "신청 일시",
    statusLabel: "진행 상태",
    statusCodeLabel: "상태 코드",
    saveSuccess: "회원 정보를 저장했습니다.",
    emailSaved: "이메일 주소를 저장했습니다.",
    saveUnavailable: "현재 저장할 수 없습니다.",
    homeNavItems: ["탄소배출", "보고서&인증서", "탄소정보", "거래", "모니터링", "결제", "고객지원"],
    footerServiceLine: "본 서비스는 관계 법령에 의거하여 온실가스 감축 성과를 관리합니다."
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
    footerLinks: ["Privacy Policy", "Terms of Use", "Sitemap", "Email Collection Refusal"],
    footerCopyright: "© 2025 CCUS Carbon Footprint Platform. All rights reserved.",
    footerLastModifiedLabel: "Last Modified:",
    footerWaAlt: "Web Accessibility Quality Mark",
    loginRequired: "Please sign in first.",
    loginMove: "Go to Sign In",
    pendingTitle: "Your membership request is under review.",
    pendingDescription: "You can edit account information after company review is completed.",
    blockedTitle: "My Page Access Restricted",
    blockedDescription: "My Page is not available for the current membership status.",
    rejectionTitle: "Rejection Reason",
    companyLabel: "Organization",
    submittedLabel: "Submitted At",
    statusLabel: "Status",
    statusCodeLabel: "Status Code",
    saveSuccess: "Your account information has been saved.",
    emailSaved: "Email address updated.",
    saveUnavailable: "Saving is currently unavailable.",
    homeNavItems: ["Emission", "Report & Cert", "Carbon Info", "Trading", "Monitoring", "Payment", "Support"],
    footerServiceLine: "This service manages greenhouse gas reduction performance in accordance with relevant laws."
  }
};

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
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [areaNo, setAreaNo] = useState("");
  const [middleTelno, setMiddleTelno] = useState("");
  const [endTelno, setEndTelno] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pageState = useAsyncValue<MypagePayload>(
    () => fetchMypage(en),
    [en],
    {
      onSuccess: (loadedPage) => {
        const member = (loadedPage.member || {}) as MypageMember;
        setFullName(stringValue(member.applcntNm));
        setEmail(stringValue(member.applcntEmailAdres));
        setJobTitle(stringValue(member.deptNm));
        setAreaNo(stringValue(member.areaNo));
        setMiddleTelno(stringValue(member.entrprsMiddleTelno));
        setEndTelno(stringValue(member.entrprsEndTelno));
      }
    }
  );
  const page = pageState.value;
  const sessionState = useFrontendSession({ enabled: page?.authenticated !== false });

  useEffect(() => {
    setError(pageState.error);
  }, [pageState.error]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = sessionState.value;
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
      await pageState.reload();
      setMessage(copy.saveSuccess);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : copy.saveUnavailable);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEmailVerify() {
    const session = sessionState.value;
    if (!session) {
      setError(copy.saveUnavailable);
      return;
    }
    setError("");
    setMessage("");
    try {
      await saveMypageEmail(session, email, en);
      await pageState.reload();
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
        <UserGovernmentBar governmentText={copy.government} />
        <UserPortalHeader
          brandSubtitle="Carbon Capture, Utilization and Storage"
          brandTitle={en ? "CCUS Management Portal" : "CCUS 통합관리 포털"}
          homeHref={copy.homePath}
          rightContent={<UserLanguageToggle en={en} onEn={() => navigate("/en/mypage")} onKo={() => navigate("/mypage")} />}
        />
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
              <button className="min-w-[160px] h-12 flex items-center justify-center border border-[var(--kr-gov-border-light)] text-[var(--kr-gov-text-primary)] font-bold rounded-[var(--kr-gov-radius)] hover:bg-gray-50 transition-colors focus-visible" onClick={() => void sessionState.logout()} type="button">
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
        <UserPortalFooter
          addressLine={en ? "(04551) 110 Sejong-daero, Jung-gu, Seoul | Main Phone: 02-1234-5678" : "(04551) 서울특별시 중구 세종대로 110 | 대표전화: 02-1234-5678"}
          copyright={en ? "© 2025 CCUS Integrated Management Portal. All rights reserved." : "© 2025 CCUS Integrated Management Portal. All rights reserved."}
          lastModifiedLabel={en ? "Last Updated:" : "최종 수정일:"}
          orgName={en ? "Carbon Neutral CCUS Integrated Management Headquarters" : "탄소중립 CCUS 통합관리본부"}
          waAlt={copy.footerWaAlt}
        />
      </div>
    );
  }

  if (page.pageType === "blocked") {
    return (
      <div className="bg-[var(--kr-gov-bg-gray)] text-[var(--kr-gov-text-primary)] min-h-screen flex flex-col">
        <a className="skip-link" href="#main-content">{copy.skip}</a>
        <main className="flex-grow flex flex-col items-center justify-center py-12 px-4" id="main-content">
          <div className="w-full max-w-[640px] bg-white border border-[var(--kr-gov-border-light)] rounded-lg shadow-sm overflow-hidden p-8 md:p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[48px] text-[var(--kr-gov-error)]">block</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">{copy.blockedTitle}</h2>
            <p className="text-lg font-medium mb-8">{copy.blockedDescription}</p>
            <div className="bg-gray-50 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] p-6 mb-8 text-left">
              <dl className="space-y-3">
                <div className="flex border-b border-gray-200 pb-2">
                  <dt className={en ? "w-40 text-sm font-bold text-[var(--kr-gov-text-secondary)]" : "w-32 text-sm font-bold text-[var(--kr-gov-text-secondary)]"}>{en ? "User ID" : "아이디"}</dt>
                  <dd className="text-sm">{userId}</dd>
                </div>
                <div className="flex border-b border-gray-200 pb-2">
                  <dt className={en ? "w-40 text-sm font-bold text-[var(--kr-gov-text-secondary)]" : "w-32 text-sm font-bold text-[var(--kr-gov-text-secondary)]"}>{copy.companyLabel}</dt>
                  <dd className="text-sm">{stringValue(page.companyName) || "-"}</dd>
                </div>
                <div className="flex">
                  <dt className={en ? "w-40 text-sm font-bold text-[var(--kr-gov-text-secondary)]" : "w-32 text-sm font-bold text-[var(--kr-gov-text-secondary)]"}>{copy.statusCodeLabel}</dt>
                  <dd className="text-sm">{stringValue(page.memberStatus) || "-"}</dd>
                </div>
              </dl>
            </div>
            <p className="text-sm text-[var(--kr-gov-text-secondary)] mb-8">
              {en
                ? <>Access is available only after the account status is changed to <strong>normal</strong>. Please contact the administrator.</>
                : <>계정 상태가 <strong>정상</strong>으로 변경된 뒤에만 접근할 수 있습니다. 운영자에게 문의해 주세요.</>}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a className="min-w-[160px] h-12 flex items-center justify-center bg-[var(--kr-gov-blue)] text-white font-bold rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)] transition-colors" href={copy.homePath}>
                {en ? "Go to Home" : "홈으로 이동"}
              </a>
              <button className="min-w-[160px] h-12 flex items-center justify-center border border-[var(--kr-gov-border-light)] font-bold rounded-[var(--kr-gov-radius)] hover:bg-gray-50 transition-colors" onClick={() => void sessionState.logout()} type="button">
                {copy.logout}
              </button>
            </div>
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

      <UserGovernmentBar governmentText={copy.government} guidelineText={copy.guideline} />

      <UserPortalHeader
        brandSubtitle="Carbon Footprint Platform"
        brandTitle={en ? "CCUS Carbon Footprint Platform" : "CCUS 탄소발자국 플랫폼"}
        homeHref={copy.homePath}
        rightContent={
          <>
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
                <button className="text-xs text-[var(--kr-gov-text-secondary)] hover:underline" onClick={() => void sessionState.logout()} type="button">
                  {copy.logout}
                </button>
              </div>
              <a className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors" href="#" onClick={(event) => event.preventDefault()}>
                <span className="material-symbols-outlined text-gray-600">person</span>
              </a>
            </div>
          </>
        }
      />

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
              <section data-help-id="mypage-basic-info">
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
                      <input
                        className="form-input mypage-form-input"
                        id="user-email"
                        inputMode="email"
                        onChange={(event) => setEmail(event.target.value)}
                        type="text"
                        value={email}
                      />
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
                      inputMode="tel"
                      onChange={(event) => {
                        const next = parsePhone(event.target.value);
                        setAreaNo(next.areaNo);
                        setMiddleTelno(next.middleTelno);
                        setEndTelno(next.endTelno);
                      }}
                      type="text"
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

              <section data-help-id="mypage-org-info">
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

              <div className="pt-10 flex justify-center gap-3 border-t border-[var(--kr-gov-border-light)]" data-help-id="mypage-actions">
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

      <UserPortalFooter
        addressLine={copy.footerAddress}
        copyright={copy.footerCopyright}
        footerLinks={copy.footerLinks}
        lastModifiedLabel={copy.footerLastModifiedLabel}
        orgName={copy.footerOrg}
        serviceLine={copy.footerServiceLine}
        waAlt={copy.footerWaAlt}
      />
    </div>
  );
}
