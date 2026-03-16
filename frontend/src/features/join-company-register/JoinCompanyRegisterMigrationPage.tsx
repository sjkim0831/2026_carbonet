import { ChangeEvent, KeyboardEvent, useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { useExternalScript } from "../../app/hooks/useExternalScript";
import {
  UserGovernmentBar,
  UserLanguageToggle,
  UserPortalHeader
} from "../../components/user-shell/UserPortalChrome";
import {
  checkCompanyNameDuplicate,
  fetchJoinCompanyRegisterPage,
  resetJoinSession,
  searchJoinCompanies,
  submitJoinCompanyRegister
} from "../../lib/api/client";
import { buildLocalizedPath, getSearchParam, isEnglish, navigate } from "../../lib/navigation/runtime";
import { EN_MEMBERSHIP_CARDS, KO_MEMBERSHIP_CARDS } from "../join/shared/membershipCards";

type CompanyForm = {
  membershipType: string;
  chargerName: string;
  chargerEmail: string;
  chargerTel: string;
  agencyName: string;
  representativeName: string;
  bizRegistrationNumber: string;
  zipCode: string;
  companyAddress: string;
  companyAddressDetail: string;
};

type UploadRow = {
  id: number;
  file: File | null;
};

let uploadRowSequence = 1;

function createUploadRow(): UploadRow {
  const row = { id: uploadRowSequence, file: null };
  uploadRowSequence += 1;
  return row;
}

const COPY = {
  ko: {
    pageTitle: "회원가입",
    registerTitle: "신규 회원사 등록",
    statusLink: "가입 현황 조회",
    notification: "검색 결과 소속 정보가 없는 경우, 신규 회원사로 등록한 후 가입을 진행하실 수 있습니다. 입력하신 정보는 관리자의 승인 절차를 거치게 됩니다.",
    contactSection: "담당자 정보",
    businessSection: "사업자 정보",
    fileSection: "증빙 서류 제출",
    chargerName: "담당자 성명",
    chargerEmail: "이메일 주소",
    chargerTel: "연락처",
    agencyName: "기관/기업명",
    representativeName: "대표자명",
    bizRegistrationNumber: "사업자등록번호",
    companyAddress: "사업장 주소",
    duplicateCheck: "중복확인",
    search: "검색",
    searchAddress: "주소 검색",
    addFile: "파일 추가",
    prev: "이전",
    submit: "회원사 등록 신청",
    support: "도움이 필요하신가요?",
    supportLink: "고객지원센터(1588-1234)",
    supportTail: "로 문의해 주세요.",
    duplicateExists: "이미 등록된 기관명입니다.",
    duplicateAvailable: "사용 가능한 기관명입니다.",
    duplicateNeedName: "기관/기업명을 먼저 입력해 주세요.",
    placeholderAgency: "정식 명칭을 입력하세요 (예: (주)한국에너지기술)",
    placeholderRep: "대표자 성함을 입력하세요",
    placeholderBiz: "숫자만 입력 (10자리)",
    placeholderZip: "우편번호",
    placeholderAddress: "기본 주소를 입력하세요",
    placeholderAddressDetail: "상세 주소를 입력하세요",
    placeholderChargerName: "성함을 입력하세요",
    placeholderEmail: "example@email.com",
    placeholderTel: "010-0000-0000",
    fileDesc: "사업자등록증 또는 법인 검증 서류",
    fileGuide: "PDF, JPG, PNG 파일만 업로드 가능하며, 최대 용량은 10MB입니다.",
    emptyFile: "파일을 선택해 주세요.",
    modalTitle: "기관/기업 검색",
    modalLabel: "검색어 입력",
    modalPlaceholder: "기관명 또는 사업자등록번호를 입력하세요",
    modalCancel: "취소",
    modalNoResults: "검색 결과가 없습니다.",
    modalSearchError: "검색 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    modalLoading: "검색 중...",
    select: "선택",
    no: "No",
    newCompanyHelp: "찾으시는 정보가 없는 경우",
    newCompanyLink: "[신규 회원사 등록]",
    newCompanyTail: "을 진행해 주세요.",
    submitSuccess: "회원사 등록이 접수되었습니다.",
    invalidFileType: "PDF, JPG, PNG 파일만 업로드 가능합니다.",
    invalidFileSize: "파일 크기는 10MB 이하만 가능합니다.",
    needDuplicateCheck: "기관/기업명 중복 확인을 진행해 주세요.",
    needFile: "증빙 서류 파일을 1개 이상 업로드해 주세요.",
    searchFailed: "검색 실패",
    registerFailed: "등록 실패"
  },
  en: {
    pageTitle: "Sign Up",
    registerTitle: "Register New Company",
    statusLink: "Join Status",
    notification: "If your affiliation is not found in the search results, you can proceed by registering as a new company. The information entered will undergo an administrator approval process.",
    contactSection: "Contact Information",
    businessSection: "Company Business Information",
    fileSection: "Supporting Documents",
    chargerName: "Contact Person Name",
    chargerEmail: "Email Address",
    chargerTel: "Phone Number",
    agencyName: "Agency/Company Name",
    representativeName: "Representative Name",
    bizRegistrationNumber: "Business Registration Number",
    companyAddress: "Company Address",
    duplicateCheck: "Check",
    search: "Search",
    searchAddress: "Find Address",
    addFile: "Add File",
    prev: "Back",
    submit: "Submit Registration Request",
    support: "Need help? Please contact",
    supportLink: "Customer Support (1588-1234)",
    supportTail: ".",
    duplicateExists: "This company name is already registered.",
    duplicateAvailable: "This company name is available.",
    duplicateNeedName: "Please enter the company name first.",
    placeholderAgency: "Enter formal name (e.g., Korea Energy Technology Co., Ltd.)",
    placeholderRep: "Enter representative's name",
    placeholderBiz: "Numbers only (10 digits)",
    placeholderZip: "Zip Code",
    placeholderAddress: "Address will be auto-filled",
    placeholderAddressDetail: "Enter detailed address",
    placeholderChargerName: "Enter contact person's name",
    placeholderEmail: "example@email.com",
    placeholderTel: "010-0000-0000",
    fileDesc: "Business License or Corporate Verification Document",
    fileGuide: "Only PDF, JPG, PNG files are allowed. Max size 10MB.",
    emptyFile: "Please select a file.",
    modalTitle: "Company/Institution Search",
    modalLabel: "Enter search term",
    modalPlaceholder: "Enter name or business registration number",
    modalCancel: "Cancel",
    modalNoResults: "No search results found.",
    modalSearchError: "An error occurred during the search. Please try again later.",
    modalLoading: "Searching...",
    select: "Select",
    no: "No",
    newCompanyHelp: "If you cannot find the information, proceed with",
    newCompanyLink: "[New Company Registration]",
    newCompanyTail: ".",
    submitSuccess: "Company registration request has been submitted.",
    invalidFileType: "Only PDF, JPG, and PNG files can be uploaded.",
    invalidFileSize: "File size must be 10MB or less.",
    needDuplicateCheck: "Please complete the company name duplication check.",
    needFile: "Please upload at least one supporting document.",
    searchFailed: "Search failed",
    registerFailed: "Registration failed"
  }
} as const;

const INITIAL_FORM: CompanyForm = {
  membershipType: "EMITTER",
  chargerName: "",
  chargerEmail: "",
  chargerTel: "",
  agencyName: "",
  representativeName: "",
  bizRegistrationNumber: "",
  zipCode: "",
  companyAddress: "",
  companyAddressDetail: ""
};

export function JoinCompanyRegisterMigrationPage() {
  const en = isEnglish();
  const copy = COPY[en ? "en" : "ko"];
  const [form, setForm] = useState<CompanyForm>(INITIAL_FORM);
  const [uploadRows, setUploadRows] = useState<UploadRow[]>([createUploadRow()]);
  const [duplicateChecked, setDuplicateChecked] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState("");
  const [duplicateAvailable, setDuplicateAvailable] = useState(false);
  const [actionError, setActionError] = useState(() => getSearchParam("errorMessage"));
  const [modalOpen, setModalOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [searchTouched, setSearchTouched] = useState(false);
  const pageState = useAsyncValue(fetchJoinCompanyRegisterPage, [], {
    onSuccess(payload) {
      setForm((current) => ({
        ...current,
        membershipType: String(payload.membershipType || "EMITTER")
      }));
    }
  });
  const page = pageState.value;
  const searchState = useAsyncValue(
    () => searchJoinCompanies({ keyword: searchKeyword.trim(), page: searchPage, size: 5, membershipType: form.membershipType }),
    [searchKeyword, searchPage, form.membershipType, modalOpen, searchTouched],
    {
      enabled: modalOpen && searchTouched,
      initialValue: { list: [], totalCnt: 0, page: 1, size: 5, totalPages: 0 },
      onError: () => undefined
    }
  );
  const error = actionError || pageState.error || (searchState.error ? copy.modalSearchError : "");
  const searchRows = searchState.value?.list || [];
  const searchTotalPages = searchState.value?.totalPages || 0;
  const searchLoading = searchState.loading;

  useExternalScript("//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js");

  const pagination = useMemo(() => {
    if (searchTotalPages <= 1) return [];
    const block = 5;
    const start = Math.floor((searchPage - 1) / block) * block + 1;
    const end = Math.min(start + block - 1, searchTotalPages);
    const items: number[] = [];
    for (let pageNo = start; pageNo <= end; pageNo += 1) items.push(pageNo);
    return items;
  }, [searchPage, searchTotalPages]);

  function updateField<K extends keyof CompanyForm>(key: K, value: CompanyForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === "agencyName") {
      setDuplicateChecked(false);
      setDuplicateAvailable(false);
      setDuplicateMessage("");
    }
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const units = ["Bytes", "KB", "MB", "GB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / 1024 ** index).toFixed(2))} ${units[index]}`;
  }

  async function handleDuplicateCheck() {
    if (!form.agencyName.trim()) {
      setDuplicateMessage(copy.duplicateNeedName);
      setDuplicateAvailable(false);
      setDuplicateChecked(false);
      return;
    }
    setActionError("");
    try {
      const duplicated = await checkCompanyNameDuplicate(form.agencyName.trim());
      setDuplicateMessage(duplicated ? copy.duplicateExists : copy.duplicateAvailable);
      setDuplicateAvailable(!duplicated);
      setDuplicateChecked(true);
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : copy.searchFailed);
    }
  }

  function handleFileChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    if (!nextFile) {
      setUploadRows((current) => current.map((row, currentIndex) => (
        currentIndex === index ? { ...row, file: null } : row
      )));
      return;
    }
    const lower = nextFile.name.toLowerCase();
    const okExt = [".pdf", ".jpg", ".jpeg", ".png"].some((ext) => lower.endsWith(ext));
    if (!okExt) {
      window.alert(copy.invalidFileType);
      event.target.value = "";
      return;
    }
    if (nextFile.size > 10 * 1024 * 1024) {
      window.alert(copy.invalidFileSize);
      event.target.value = "";
      return;
    }
    setUploadRows((current) => {
      const next = [...current];
      next[index] = { ...next[index], file: nextFile };
      return next;
    });
  }

  function addFileRow() {
    setUploadRows((current) => [...current, createUploadRow()]);
  }

  function removeFileRow(index: number) {
    setUploadRows((current) => {
      if (current.length <= 1) {
        return [{ ...current[0], file: null }];
      }
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  }

  function openAddressSearch() {
    const daumPostcode = (window as Window & { daum?: { Postcode: new (options: { oncomplete: (data: { zonecode: string; roadAddress: string; jibunAddress: string; userSelectedType: string }) => void }) => { open: () => void } } }).daum;
    if (!daumPostcode?.Postcode) return;
    new daumPostcode.Postcode({
      oncomplete(data) {
        const address = data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
        setForm((current) => ({ ...current, zipCode: data.zonecode, companyAddress: address }));
      }
    }).open();
  }

  async function runCompanySearch(pageNo: number) {
    setSearchTouched(true);
    setActionError("");
    setSearchPage(pageNo);
  }

  function openCompanySearchModal() {
    setModalOpen(true);
    setSearchKeyword("");
    setSearchPage(1);
    setSearchTouched(false);
  }

  async function handleSubmit() {
    setActionError("");
    if (!duplicateChecked) {
      window.alert(copy.needDuplicateCheck);
      return;
    }
    const uploadedFiles = uploadRows
      .map((row) => row.file)
      .filter((file): file is File => Boolean(file && file.size > 0));
    if (uploadedFiles.length === 0) {
      window.alert(copy.needFile);
      return;
    }
    try {
      const result = await submitJoinCompanyRegister({
        ...form,
        lang: en ? "en" : "ko",
        fileUploads: uploadedFiles
      });
      window.sessionStorage.setItem("carbonet.join.company-register.complete", JSON.stringify({
        insttNm: String(result.insttNm || form.agencyName),
        bizrno: String(result.bizrno || form.bizRegistrationNumber),
        regDate: String(result.regDate || "")
      }));
      navigate(buildLocalizedPath("/join/companyRegisterComplete", "/join/en/companyRegisterComplete"));
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : copy.registerFailed);
    }
  }

  async function handleHome() {
    await resetJoinSession();
    navigate(buildLocalizedPath("/home", "/en/home"));
  }

  function renderJoinStatusBadge(joinStat?: string | null) {
    if (joinStat === "A") {
      return <span className="inline-block px-3 py-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full">{en ? "Pending" : "대기"}</span>;
    }
    if (joinStat === "P") {
      return <span className="inline-block px-3 py-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full">{en ? "Complete" : "완료"}</span>;
    }
    return <span className="text-gray-400">-</span>;
  }

  function handleModalSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void runCompanySearch(1);
    }
  }

  if (!page) {
    return <main className="max-w-5xl mx-auto px-4 py-16"><p>Loading...</p></main>;
  }

  return (
    <div className="bg-[#f8f9fa] text-[var(--kr-gov-text-primary)] min-h-screen flex flex-col">
      <a className="skip-link" href="#main-content">{en ? "Skip to content" : "본문 바로가기"}</a>

      <UserGovernmentBar governmentText={en ? "Official Government Service of the Republic of Korea" : "대한민국 정부 공식 서비스"} />
      <UserPortalHeader
        brandSubtitle="Carbon Footprint Platform"
        brandTitle={en ? "CCUS Carbon Footprint Platform" : "CCUS 탄소발자국 플랫폼"}
        onHomeClick={() => { void handleHome(); }}
        rightContent={<UserLanguageToggle en={en} onEn={() => navigate("/join/en/companyRegister")} onKo={() => navigate("/join/companyRegister")} />}
      />

      <main className="flex-grow py-12 px-4" id="main-content">
        <div className="max-w-[850px] mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">{copy.pageTitle}</h2>
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between relative">
                {[0, 1, 2].map((step) => (
                  <div className="step-item step-completed" key={step}>
                    <div className="step-line"></div>
                    <div className="step-circle"><span className="material-symbols-outlined !text-[20px]">check</span></div>
                    <span className="mt-3 text-sm font-medium text-[var(--kr-gov-text-secondary)]">{en ? ["Member Type", "Terms", "Verification"][step] : ["회원유형", "약관 동의", "본인 확인"][step]}</span>
                  </div>
                ))}
                <div className="step-item step-active">
                  <div className="step-line"></div>
                  <div className="step-circle">04</div>
                  <span className="mt-3 text-sm font-bold text-[var(--kr-gov-blue)]">{en ? "Information" : "정보 입력"}</span>
                </div>
                <div className="step-item step-inactive">
                  <div className="step-circle">05</div>
                  <span className="mt-3 text-sm font-medium text-[var(--kr-gov-text-secondary)]">{en ? "Complete" : "가입 완료"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[var(--kr-gov-border-light)] rounded-lg shadow-sm overflow-hidden p-8 md:p-12">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-[var(--kr-gov-text-primary)]">{copy.registerTitle}</h3>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[var(--kr-gov-blue)] text-[var(--kr-gov-blue)] text-sm font-bold rounded-[var(--kr-gov-radius)] hover:bg-blue-50 transition-colors" onClick={() => navigate(buildLocalizedPath("/join/companyJoinStatusSearch", "/join/en/companyJoinStatusSearch"))} type="button">
                <span className="material-symbols-outlined text-[20px]">search</span>{copy.statusLink}
              </button>
            </div>

            {error ? (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
                <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
                <div className="flex-grow">
                  <p className="font-bold mb-1">{en ? "An error occurred during registration." : "등록 중 오류가 발생했습니다."}</p>
                  <p>{error}</p>
                </div>
              </div>
            ) : null}

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-[var(--kr-gov-radius)] mb-8 flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600">info</span>
              <p className="text-[15px] text-blue-800 leading-relaxed">{copy.notification}</p>
            </div>
          </div>

          <form className="mt-8 space-y-8" onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }}>
            <section data-help-id="join-company-register-contact">
              <h4 className="text-lg font-bold text-[var(--kr-gov-text-primary)] flex items-center gap-2 mb-6 pb-2 border-b-2 border-gray-100">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">category</span>
                {en ? "Membership Type" : "회원사 유형"}
              </h4>
              <fieldset>
                <legend className="sr-only">{en ? "Company membership type selection" : "회원사 유형 선택"}</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(en ? EN_MEMBERSHIP_CARDS : KO_MEMBERSHIP_CARDS).map((card) => {
                    const active = form.membershipType === card.value;
                    return (
                      <label className={`type-card group${active ? " active" : ""}`} key={card.value}>
                        <input
                          checked={active}
                          className="sr-only"
                          name="membership_type"
                          onChange={() => updateField("membershipType", card.value)}
                          required
                          type="radio"
                          value={card.value}
                        />
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${card.iconWrapClass} ${card.hoverIconWrapClass}`}>
                          <span className={`material-symbols-outlined text-4xl ${card.iconClass} group-hover:text-white`}>{card.icon}</span>
                        </div>
                        <h3 className="text-lg font-bold mb-3 break-keep">{card.title}</h3>
                        <p className="text-sm text-[var(--kr-gov-text-secondary)] leading-relaxed whitespace-pre-line">{card.description}</p>
                        <div className={`check-icon absolute top-4 right-4 text-[var(--kr-gov-blue)]${active ? "" : " hidden"}`}>
                          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            check_circle
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </section>

            <section data-help-id="join-company-register-business">
              <h4 className="text-lg font-bold text-[var(--kr-gov-text-primary)] flex items-center gap-2 mb-6 pb-2 border-b-2 border-gray-100">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">person</span>{copy.contactSection}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div className="space-y-1">
                  <label className="form-label" htmlFor="charger-name">{copy.chargerName} <span className="text-red-500">*</span></label>
                  <input className="form-input" id="charger-name" onChange={(event) => updateField("chargerName", event.target.value)} placeholder={copy.placeholderChargerName} required type="text" value={form.chargerName} />
                </div>
                <div className="space-y-1">
                  <label className="form-label" htmlFor="charger-email">{copy.chargerEmail} <span className="text-red-500">*</span></label>
                  <input className="form-input" id="charger-email" inputMode="email" onChange={(event) => updateField("chargerEmail", event.target.value)} placeholder={copy.placeholderEmail} required type="text" value={form.chargerEmail} />
                </div>
                <div className="space-y-1">
                  <label className="form-label" htmlFor="charger-tel">{copy.chargerTel} <span className="text-red-500">*</span></label>
                  <input className="form-input" id="charger-tel" inputMode="tel" onChange={(event) => updateField("chargerTel", event.target.value)} placeholder={copy.placeholderTel} required type="text" value={form.chargerTel} />
                </div>
              </div>
            </section>

            <section data-help-id="join-company-register-files">
              <h4 className="text-lg font-bold text-[var(--kr-gov-text-primary)] flex items-center gap-2 mb-6 pb-2 border-b-2 border-gray-100">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">business_center</span>{copy.businessSection}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div className="md:col-span-2 space-y-1">
                  <label className="form-label" htmlFor="agency-name">{copy.agencyName} <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <input className="form-input pr-20" id="agency-name" onChange={(event) => updateField("agencyName", event.target.value)} placeholder={copy.placeholderAgency} required type="text" value={form.agencyName} />
                      <button className="absolute right-2 top-2 bottom-2 px-3 bg-[var(--kr-gov-blue)] text-white text-xs font-bold rounded-[var(--kr-gov-radius)] flex items-center gap-1" onClick={openCompanySearchModal} type="button">
                        <span className="material-symbols-outlined text-[18px]">search</span>{copy.search}
                      </button>
                    </div>
                    <button className="px-4 bg-gray-800 text-white text-sm font-bold rounded-[var(--kr-gov-radius)] whitespace-nowrap" onClick={() => void handleDuplicateCheck()} type="button">{copy.duplicateCheck}</button>
                  </div>
                  {duplicateMessage ? <p className={`mt-1 text-xs ${duplicateAvailable ? "text-green-600 font-bold" : "text-red-500"}`}>{duplicateMessage}</p> : null}
                </div>
                <div className="space-y-1">
                  <label className="form-label" htmlFor="representative-name">{copy.representativeName} <span className="text-red-500">*</span></label>
                  <input className="form-input" id="representative-name" onChange={(event) => updateField("representativeName", event.target.value)} placeholder={copy.placeholderRep} required type="text" value={form.representativeName} />
                </div>
                <div className="space-y-1">
                  <label className="form-label" htmlFor="biz-registration-number">{copy.bizRegistrationNumber} <span className="text-red-500">*</span></label>
                  <input className="form-input" id="biz-registration-number" onChange={(event) => updateField("bizRegistrationNumber", event.target.value.replace(/\D/g, ""))} placeholder={copy.placeholderBiz} required type="text" value={form.bizRegistrationNumber} />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="form-label" htmlFor="company-address">{copy.companyAddress} <span className="text-red-500">*</span></label>
                  <div className="flex gap-2 mb-2">
                    <input className="form-input w-32 bg-gray-50 cursor-pointer" id="zip-code" onClick={openAddressSearch} placeholder={copy.placeholderZip} readOnly required type="text" value={form.zipCode} />
                    <button className="px-5 border border-[var(--kr-gov-blue)] text-[var(--kr-gov-blue)] text-sm font-bold rounded-[var(--kr-gov-radius)] hover:bg-blue-50 transition-colors" onClick={openAddressSearch} type="button">{copy.searchAddress}</button>
                  </div>
                  <input className="form-input mb-2 bg-gray-50 cursor-pointer" id="company-address" onClick={openAddressSearch} placeholder={copy.placeholderAddress} readOnly required type="text" value={form.companyAddress} />
                  <input className="form-input" id="company-address-detail" onChange={(event) => updateField("companyAddressDetail", event.target.value)} placeholder={copy.placeholderAddressDetail} type="text" value={form.companyAddressDetail} />
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-lg font-bold text-[var(--kr-gov-text-primary)] flex items-center gap-2 mb-6 pb-2 border-b-2 border-gray-100">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">upload_file</span>{copy.fileSection}
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="form-label mb-0">{copy.fileDesc} <span className="text-red-500">*</span></label>
                  <button className="join-upload-add-btn" onClick={addFileRow} type="button">
                    <span className="material-symbols-outlined text-[18px]">add</span>{copy.addFile}
                  </button>
                </div>
                <div className="space-y-2">
                  {uploadRows.map((row, index) => (
                    <div className={`join-upload-row ${row.file && row.file.size > 0 ? "is-selected" : ""}`} key={row.id}>
                      <span className="material-symbols-outlined join-upload-icon">attach_file</span>
                      <div className="flex-grow min-w-0">
                        <input accept=".pdf,.jpg,.jpeg,.png" className="hidden" id={`company-file-${row.id}`} onChange={(event) => handleFileChange(index, event)} type="file" />
                        <label className="join-upload-label" htmlFor={`company-file-${row.id}`}>
                          <div className="file-info flex items-center justify-between">
                            <span className={`join-upload-name ${row.file && row.file.size > 0 ? "is-selected" : ""}`}>{row.file && row.file.size > 0 ? row.file.name : copy.emptyFile}</span>
                            <span className="join-upload-size">{row.file && row.file.size > 0 ? formatBytes(row.file.size) : ""}</span>
                          </div>
                        </label>
                      </div>
                      {uploadRows.length > 1 || (row.file && row.file.size > 0) ? (
                        <button className="join-upload-remove-btn" onClick={() => removeFileRow(index)} type="button">
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">{copy.fileGuide}</p>
              </div>
            </section>

            <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row gap-4">
              <button className="flex-1 h-14 border border-[var(--kr-gov-border-light)] text-[var(--kr-gov-text-primary)] text-lg font-bold rounded-[var(--kr-gov-radius)] hover:bg-gray-50 transition-colors" onClick={() => window.history.back()} type="button">{copy.prev}</button>
              <button className="flex-[2] h-14 bg-[var(--kr-gov-blue)] text-white text-lg font-bold rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)] transition-colors shadow-lg flex items-center justify-center gap-2" type="submit">
                {copy.submit} <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[var(--kr-gov-text-secondary)]">
              {copy.support} <a className="text-[var(--kr-gov-blue)] font-bold hover:underline" href="#">{copy.supportLink}</a>{copy.supportTail}
            </p>
          </div>
        </div>
      </main>

      <div aria-labelledby="modal-title" aria-modal="true" className={`fixed inset-0 z-50 flex items-center justify-center ${modalOpen ? "" : "hidden"}`} role="dialog">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 flex flex-col max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-xl font-bold text-[var(--kr-gov-text-primary)] flex items-center gap-2" id="modal-title">
              <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">corporate_fare</span>
              {copy.modalTitle}
            </h2>
            <button className="text-gray-400 hover:text-gray-600 rounded-full p-1" onClick={() => setModalOpen(false)} type="button">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-grow">
            <div className="mb-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[var(--kr-gov-text-secondary)]" htmlFor="modal-search">{copy.modalLabel}</label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input className="form-input pl-11" id="modal-search" onChange={(event) => setSearchKeyword(event.target.value)} onKeyDown={handleModalSearchKeyDown} placeholder={copy.modalPlaceholder} type="text" value={searchKeyword} />
                  </div>
                  <button className="px-8 bg-[var(--kr-gov-blue)] text-white font-bold rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)] transition-colors" onClick={() => void runCompanySearch(1)} type="button">{copy.search}</button>
                </div>
              </div>
            </div>
            <div className="border border-[var(--kr-gov-border-light)] rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#f8f9fa] border-b border-[var(--kr-gov-border-light)] text-[var(--kr-gov-text-primary)]">
                  <tr>
                    <th className="px-4 py-3 font-bold text-center w-12" scope="col">{copy.no}</th>
                    <th className="px-4 py-3 font-bold" scope="col">{copy.agencyName}</th>
                    <th className="px-4 py-3 font-bold" scope="col">{copy.bizRegistrationNumber}</th>
                    <th className="px-4 py-3 font-bold" scope="col">{copy.representativeName}</th>
                    <th className="px-4 py-3 font-bold text-center" scope="col">{en ? "Join Status" : "가입 상태"}</th>
                  </tr>
                </thead>
                <tbody>
                  {searchLoading ? (
                    <tr><td className="px-4 py-8 text-center text-gray-500" colSpan={5}>{copy.modalLoading}</td></tr>
                  ) : !searchTouched ? (
                    <tr>
                      <td className="px-4 py-10 text-center text-gray-400" colSpan={5}>
                        <span className="material-symbols-outlined text-4xl block mb-2 mx-auto">search</span>
                        {en ? "Enter a keyword and press the search button." : "검색어를 입력하고 검색 버튼을 눌러주세요."}
                      </td>
                    </tr>
                  ) : searchRows.length === 0 ? (
                    <tr><td className="px-4 py-8 text-center text-gray-500" colSpan={5}>{copy.modalNoResults}</td></tr>
                  ) : searchRows.map((row, index) => (
                    <tr className="hover:bg-blue-50/50 transition-colors" key={row.insttId}>
                      <td className="px-4 py-4 text-center text-gray-500">{(searchPage - 1) * 5 + index + 1}</td>
                      <td className="px-4 py-4 font-medium">{row.cmpnyNm}</td>
                      <td className="px-4 py-4 text-gray-600">{row.bizrno}</td>
                      <td className="px-4 py-4 text-gray-600">{row.cxfc}</td>
                      <td className="px-4 py-4 text-center">{renderJoinStatusBadge(row.joinStat)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.length > 0 ? (
              <nav aria-label="pagination" className="flex justify-center items-center gap-1 my-4">
                <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded text-gray-400 hover:bg-gray-50" disabled={searchPage === 1} onClick={() => void runCompanySearch(1)} type="button"><span className="material-symbols-outlined text-xl">first_page</span></button>
                <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded text-gray-400 hover:bg-gray-50" disabled={searchPage === 1} onClick={() => void runCompanySearch(Math.max(1, searchPage - 1))} type="button"><span className="material-symbols-outlined text-xl">chevron_left</span></button>
                {pagination.map((pageNo) => (
                  <button
                    className={pageNo === searchPage ? "w-9 h-9 flex items-center justify-center rounded text-white font-bold text-sm bg-[var(--kr-gov-blue)]" : "w-9 h-9 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50 font-medium text-sm"}
                    key={pageNo}
                    onClick={() => void runCompanySearch(pageNo)}
                    type="button"
                  >
                    {pageNo}
                  </button>
                ))}
                <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded text-gray-400 hover:bg-gray-50" disabled={searchPage === searchTotalPages} onClick={() => void runCompanySearch(Math.min(searchTotalPages, searchPage + 1))} type="button"><span className="material-symbols-outlined text-xl">chevron_right</span></button>
                <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded text-gray-400 hover:bg-gray-50" disabled={searchPage === searchTotalPages} onClick={() => void runCompanySearch(searchTotalPages)} type="button"><span className="material-symbols-outlined text-xl">last_page</span></button>
              </nav>
            ) : null}
            <div className="bg-gray-50 border-t border-b border-gray-200 p-4 rounded-md">
              <p className="text-[13px] text-[var(--kr-gov-text-secondary)] flex items-center gap-1.5 leading-relaxed">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">info</span>
                {copy.newCompanyHelp}
                <span className="font-bold text-gray-400 text-sm cursor-not-allowed line-through pointer-events-none">{copy.newCompanyLink}</span>
                {copy.newCompanyTail}
              </p>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-100 flex-shrink-0">
            <button className="px-6 py-2.5 bg-white border border-[var(--kr-gov-border-light)] text-[var(--kr-gov-text-primary)] font-bold rounded-[var(--kr-gov-radius)] hover:bg-gray-50" onClick={() => setModalOpen(false)} type="button">{copy.modalCancel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
