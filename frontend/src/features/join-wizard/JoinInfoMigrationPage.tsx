import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { useJoinSession } from "../../app/hooks/useJoinSession";
import {
  UserGovernmentBar,
  UserPortalHeader
} from "../../components/user-shell/UserPortalChrome";
import {
  checkJoinEmail,
  checkJoinMemberId,
  resetJoinSession,
  searchJoinCompanies,
  submitJoinStep4
} from "../../lib/api/client";
import { buildLocalizedPath, isEnglish, navigate } from "../../lib/navigation/runtime";

type JoinFormState = {
  mberId: string;
  password: string;
  passwordConfirm: string;
  mberNm: string;
  moblphonNo1: string;
  moblphonNo2: string;
  moblphonNo3: string;
  applcntEmailAdres: string;
  zip: string;
  adres: string;
  detailAdres: string;
  insttId: string;
  insttNm: string;
  bizrno: string;
  representativeName: string;
  deptNm: string;
};

type UploadRow = {
  id: number;
  file: File | null;
};

const COPY = {
  ko: {
    title: "회원가입",
    subtitle: "정확한 정보를 입력해 주세요.",
    steps: ["회원유형", "약관 동의", "본인 확인", "정보 입력", "가입 완료"],
    userSection: "사용자 정보",
    orgSection: "소속 정보",
    userId: "아이디",
    duplicateCheck: "중복확인",
    idPlaceholder: "6~16자 영문, 숫자",
    name: "이름",
    password: "비밀번호",
    passwordPlaceholder: "영문, 숫자, 특수문자 조합 8자 이상",
    passwordConfirm: "비밀번호 확인",
    passwordConfirmPlaceholder: "비밀번호를 다시 입력하세요",
    phone: "연락처",
    email: "이메일",
    emailPlaceholder: "example@email.com",
    address: "주소",
    zipPlaceholder: "우편번호",
    searchAddress: "주소 검색",
    addressPlaceholder: "기본 주소를 입력하세요",
    detailAddressPlaceholder: "상세 주소를 입력하세요",
    companyName: "기관/기업명",
    companyPlaceholder: "기관명 또는 기업명을 검색하세요",
    bizno: "사업자등록번호",
    biznoPlaceholder: "기관 검색 시 자동 입력",
    representative: "대표자명",
    representativePlaceholder: "기관 검색 시 자동 입력",
    department: "부서명",
    departmentPlaceholder: "소속 부서를 입력하세요",
    fileTitle: "증빙 서류 업로드",
    fileDesc: "사업자등록증 또는 재직증명서",
    addFile: "파일 추가",
    emptyFile: "파일을 선택해 주세요.",
    fileGuide: "PDF, JPG, PNG 파일만 업로드 가능하며, 최대 용량은 10MB입니다.",
    prev: "이전 단계",
    submit: "회원가입 완료",
    footer: "입력하신 정보는 회원가입 승인 절차를 위해 사용되며, 관리자의 승인 후 정식 서비스를 이용하실 수 있습니다.",
    footer2: "승인 결과는 입력하신 연락처(휴대폰/이메일)로 안내됩니다.",
    companyModalTitle: "기관/기업 검색",
    companyModalLabel: "검색어 입력",
    companyModalPlaceholder: "기관명 또는 사업자등록번호를 입력하세요",
    search: "검색",
    cancel: "취소",
    no: "No",
    select: "선택",
    noResults: "검색 결과가 없습니다.",
    loading: "검색 중...",
    searchError: "검색 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    newCompanyHelp: "찾으시는 정보가 없는 경우",
    newCompanyLink: "[신규 회원사 등록]",
    newCompanyTail: "을 진행해 주세요.",
    idShort: "아이디를 5자 이상 입력해 주세요.",
    idDuplicated: "이미 사용 중인 아이디입니다.",
    idAvailable: "사용 가능한 아이디입니다.",
    emailInvalid: "유효한 이메일 주소를 입력해 주세요.",
    emailDuplicated: "이미 사용 중인 이메일입니다.",
    emailAvailable: "사용 가능한 이메일입니다.",
    pwMatch: "비밀번호가 일치합니다.",
    pwMismatch: "비밀번호가 일치하지 않습니다.",
    needIdCheck: "아이디 중복 확인을 진행해 주세요.",
    needEmailCheck: "이메일 중복 확인을 진행해 주세요.",
    badPassword: "비밀번호는 특수문자를 포함하여 9자리 이상이어야 합니다.",
    needFile: "증빙 서류 파일을 1개 이상 업로드해 주세요.",
    fileTypeError: "PDF, JPG, PNG 파일만 업로드 가능합니다.",
    fileSizeError: "파일 크기는 10MB 이하만 가능합니다."
  },
  en: {
    title: "Registration",
    subtitle: "Please enter your information accurately.",
    steps: ["Member Type", "Terms", "Verification", "Information", "Complete"],
    userSection: "User Information",
    orgSection: "Organization Information",
    userId: "User ID",
    duplicateCheck: "Check",
    idPlaceholder: "6–16 alphanumeric characters",
    name: "Name",
    password: "Password",
    passwordPlaceholder: "8+ characters: letters, numbers, symbols",
    passwordConfirm: "Confirm Password",
    passwordConfirmPlaceholder: "Re-enter your password",
    phone: "Phone Number",
    email: "Email Address",
    emailPlaceholder: "example@email.com",
    address: "Address",
    zipPlaceholder: "Zip Code",
    searchAddress: "Find Address",
    addressPlaceholder: "Address will be auto-filled",
    detailAddressPlaceholder: "Enter detailed address",
    companyName: "Organization / Company Name",
    companyPlaceholder: "Search for institution or company name",
    bizno: "Business Registration Number",
    biznoPlaceholder: "Auto-filled after organization search",
    representative: "Representative Name",
    representativePlaceholder: "Auto-filled after organization search",
    department: "Department",
    departmentPlaceholder: "Enter your department",
    fileTitle: "Supporting Documents",
    fileDesc: "Business registration certificate or employment certificate",
    addFile: "Add File",
    emptyFile: "Please select a file.",
    fileGuide: "Only PDF, JPG, and PNG files are allowed, up to 10MB.",
    prev: "Previous",
    submit: "Complete Registration",
    footer: "The information you enter will be used for the membership approval process. Full service access will be available after administrator approval.",
    footer2: "Approval results will be sent to the contact information (phone/email) you provided.",
    companyModalTitle: "Company/Institution Search",
    companyModalLabel: "Enter search term",
    companyModalPlaceholder: "Enter company/institution name or business registration number",
    search: "Search",
    cancel: "Cancel",
    no: "No",
    select: "Select",
    noResults: "No search results found.",
    loading: "Searching...",
    searchError: "An error occurred during the search. Please try again later.",
    newCompanyHelp: "If you cannot find the information, proceed with",
    newCompanyLink: "[New Company Registration]",
    newCompanyTail: ".",
    idShort: "Please enter at least 5 characters for the ID.",
    idDuplicated: "This ID is already in use.",
    idAvailable: "This ID is available.",
    emailInvalid: "Please enter a valid email address.",
    emailDuplicated: "This email is already in use.",
    emailAvailable: "This email is available.",
    pwMatch: "Passwords match.",
    pwMismatch: "Passwords do not match.",
    needIdCheck: "Please complete the ID duplication check.",
    needEmailCheck: "Please complete the email duplication check.",
    badPassword: "Password must be at least 9 characters and include a special character.",
    needFile: "Please upload at least one supporting document.",
    fileTypeError: "Only PDF, JPG, and PNG files can be uploaded.",
    fileSizeError: "File size must be 10MB or less."
  }
} as const;

const INITIAL_FORM: JoinFormState = {
  mberId: "",
  password: "",
  passwordConfirm: "",
  mberNm: "",
  moblphonNo1: "010",
  moblphonNo2: "",
  moblphonNo3: "",
  applcntEmailAdres: "",
  zip: "",
  adres: "",
  detailAdres: "",
  insttId: "",
  insttNm: "",
  bizrno: "",
  representativeName: "",
  deptNm: ""
};

export function JoinInfoMigrationPage() {
  const en = isEnglish();
  const copy = COPY[en ? "en" : "ko"];
  const [form, setForm] = useState<JoinFormState>(INITIAL_FORM);
  const [uploadRows, setUploadRows] = useState<UploadRow[]>([{ id: 1, file: null }]);
  const [actionError, setActionError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [idChecked, setIdChecked] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [idMessage, setIdMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [draftSearchKeyword, setDraftSearchKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const sessionState = useJoinSession({
    onSuccess(payload) {
      const joinVO = (payload.joinVO || {}) as Record<string, unknown>;
      setForm((current) => ({
        ...current,
        mberNm: String(joinVO.applcntNm || ""),
        applcntEmailAdres: String(joinVO.authEmail || ""),
        deptNm: String(joinVO.deptNm || "")
      }));
    }
  });
  const session = sessionState.value;
  const searchState = useAsyncValue(
    () => searchJoinCompanies({
      keyword: searchKeyword,
      page: searchPage,
      size: 5,
      status: "P",
      membershipType: session?.membershipType
    }),
    [modalOpen, searchKeyword, searchPage, session?.membershipType],
    {
      enabled: modalOpen,
      initialValue: { list: [], totalCnt: 0, page: 1, size: 5, totalPages: 0 },
      onError: () => undefined
    }
  );
  const searchResult = searchState.value;
  const searchLoading = searchState.loading;
  const error = actionError || sessionState.error || (searchState.error ? copy.searchError : "");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  const passwordMessage = useMemo(() => {
    if (!form.password || !form.passwordConfirm) return "";
    return form.password === form.passwordConfirm ? copy.pwMatch : copy.pwMismatch;
  }, [copy.pwMatch, copy.pwMismatch, form.password, form.passwordConfirm]);

  function updateField<K extends keyof JoinFormState>(key: K, value: JoinFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === "mberId") {
      setIdChecked(false);
      setIdMessage("");
    }
    if (key === "applcntEmailAdres") {
      setEmailChecked(false);
      setEmailMessage("");
    }
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const units = ["Bytes", "KB", "MB", "GB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / 1024 ** index).toFixed(2))} ${units[index]}`;
  }

  async function handleCheckId() {
    if (!form.mberId || form.mberId.length < 5) {
      setIdMessage(copy.idShort);
      setIdChecked(false);
      return;
    }
    try {
      const result = await checkJoinMemberId(form.mberId);
      if (result.isDuplicated) {
        setIdMessage(copy.idDuplicated);
        setIdChecked(false);
      } else {
        setIdMessage(copy.idAvailable);
        setIdChecked(true);
      }
    } catch {
      setIdMessage(copy.searchError);
      setIdChecked(false);
    }
  }

  async function handleCheckEmail() {
    if (!form.applcntEmailAdres || !form.applcntEmailAdres.includes("@")) {
      setEmailMessage(copy.emailInvalid);
      setEmailChecked(false);
      return;
    }
    try {
      const result = await checkJoinEmail(form.applcntEmailAdres);
      if (result.isDuplicated) {
        setEmailMessage(copy.emailDuplicated);
        setEmailChecked(false);
      } else {
        setEmailMessage(copy.emailAvailable);
        setEmailChecked(true);
      }
    } catch {
      setEmailMessage(copy.searchError);
      setEmailChecked(false);
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
      window.alert(copy.fileTypeError);
      event.target.value = "";
      return;
    }
    if (nextFile.size > 10 * 1024 * 1024) {
      window.alert(copy.fileSizeError);
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
    setUploadRows((current) => [
      ...current,
      { id: current.length === 0 ? 1 : Math.max(...current.map((row) => row.id)) + 1, file: null }
    ]);
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
        setForm((current) => ({ ...current, zip: data.zonecode, adres: address }));
      }
    }).open();
  }

  async function handleSubmit() {
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>+=\-_`~]).{9,}$/;
    if (!idChecked) {
      window.alert(copy.needIdCheck);
      return;
    }
    if (!emailChecked) {
      window.alert(copy.needEmailCheck);
      return;
    }
    if (!passwordRegex.test(form.password)) {
      window.alert(copy.badPassword);
      return;
    }
    if (form.password !== form.passwordConfirm) {
      window.alert(copy.pwMismatch);
      return;
    }
    const uploadedFiles = uploadRows
      .map((row) => row.file)
      .filter((file): file is File => Boolean(file && file.size > 0));
    if (uploadedFiles.length === 0) {
      window.alert(copy.needFile);
      return;
    }

    setSubmitting(true);
    setActionError("");
    try {
      const result = await submitJoinStep4({
        membershipType: session?.membershipType,
        mberId: form.mberId,
        password: form.password,
        mberNm: form.mberNm,
        insttNm: form.insttNm,
        insttId: form.insttId,
        representativeName: form.representativeName,
        bizrno: form.bizrno,
        zip: form.zip,
        adres: form.adres,
        detailAdres: form.detailAdres,
        deptNm: form.deptNm,
        moblphonNo1: form.moblphonNo1,
        moblphonNo2: form.moblphonNo2,
        moblphonNo3: form.moblphonNo3,
        applcntEmailAdres: form.applcntEmailAdres,
        fileUploads: uploadedFiles
      });
      window.sessionStorage.setItem("carbonet.join.step5", JSON.stringify({
        mberId: String(result.mberId || form.mberId),
        mberNm: String(result.mberNm || form.mberNm),
        insttNm: String(result.insttNm || form.insttNm)
      }));
      navigate(buildLocalizedPath("/join/step5", "/join/en/step5"));
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Failed to submit join step4");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleHome() {
    await resetJoinSession();
    navigate(buildLocalizedPath("/home", "/en/home"));
  }

  async function handleOpenCompanySearch() {
    setActionError("");
    if (!await sessionState.reload()) {
      setActionError(copy.searchError);
      return;
    }
    setDraftSearchKeyword("");
    setSearchKeyword("");
    setSearchPage(1);
    setModalOpen(true);
  }

  function closeCompanySearch() {
    setModalOpen(false);
  }

  function runCompanySearch(page = 1) {
    setSearchKeyword(draftSearchKeyword.trim());
    setSearchPage(page);
  }

  function selectCompany(row: { insttId: string; cmpnyNm: string; bizrno: string; cxfc: string }) {
    setForm((current) => ({
      ...current,
      insttId: row.insttId,
      insttNm: row.cmpnyNm,
      bizrno: row.bizrno,
      representativeName: row.cxfc
    }));
    setModalOpen(false);
  }

  return (
    <div className="join-step4-screen bg-[var(--kr-gov-bg-gray)] text-[var(--kr-gov-text-primary)] min-h-screen flex flex-col">
      <a className="skip-link" href="#main-content">{en ? "Skip to content" : "본문 바로가기"}</a>

      <UserGovernmentBar governmentText={en ? "Official Government Service of the Republic of Korea" : "대한민국 정부 공식 서비스"} />
      <UserPortalHeader
        brandSubtitle="Carbon Capture, Utilization and Storage"
        brandTitle={en ? "CCUS Integrated Management Portal" : "CCUS 통합관리 포털"}
        onHomeClick={() => { void handleHome(); }}
      />

      <main className="flex-grow py-12 px-4" id="main-content">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[var(--kr-gov-text-primary)] mb-2">{copy.title}</h2>
            <p className="text-[var(--kr-gov-text-secondary)]">{copy.subtitle}</p>
          </div>

          <div className="max-w-5xl mx-auto mb-12">
            <div className="flex justify-between relative">
              {copy.steps.map((label, index) => (
                <div className={`step-item ${index < 3 ? "step-completed" : index === 3 ? "step-active" : "step-inactive"}`} key={label}>
                  {index < 4 ? <div className="step-line"></div> : null}
                  <div className="step-circle">{index < 3 ? <span className="material-symbols-outlined !text-[20px]">check</span> : `0${index + 1}`}</div>
                  <span className={`mt-3 text-sm ${index === 3 ? "font-bold text-[var(--kr-gov-blue)]" : "font-medium text-[var(--kr-gov-text-secondary)]"}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {error ? <div className="mb-6 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-error)]/30 bg-[var(--kr-gov-error)]/5 px-4 py-3 text-sm text-[var(--kr-gov-error)]">{error}</div> : null}

          <div className="bg-white border border-[var(--kr-gov-border-light)] rounded-lg shadow-sm overflow-hidden p-8 md:p-12">
            <form className="space-y-10" onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }}>
              <section data-help-id="join-step4-user">
                <h3 className="section-title">
                  <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">person</span>
                  {copy.userSection}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="form-label" htmlFor="user-id">{copy.userId} <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <input className="form-input" id="user-id" onChange={(event) => updateField("mberId", event.target.value)} placeholder={copy.idPlaceholder} required spellCheck={false} type="text" value={form.mberId} />
                      <button className="px-4 bg-gray-800 text-white text-sm font-bold rounded-[var(--kr-gov-radius)] whitespace-nowrap" onClick={() => void handleCheckId()} type="button">{copy.duplicateCheck}</button>
                    </div>
                    {idMessage ? <div className={`mt-1 text-[12px] ${idChecked ? "text-green-600 font-bold" : "text-red-500"}`}>{idMessage}</div> : null}
                  </div>
                  <div className="space-y-1">
                    <label className="form-label" htmlFor="user-name">{copy.name} <span className="text-red-500">*</span></label>
                    <input className="form-input" id="user-name" onChange={(event) => updateField("mberNm", event.target.value)} required type="text" value={form.mberNm} />
                  </div>
                  <div className="space-y-1">
                    <label className="form-label" htmlFor="password">{copy.password} <span className="text-red-500">*</span></label>
                    <input className="form-input" id="password" onChange={(event) => updateField("password", event.target.value)} placeholder={copy.passwordPlaceholder} required type="password" value={form.password} />
                  </div>
                  <div className="space-y-1">
                    <label className="form-label" htmlFor="password-confirm">{copy.passwordConfirm} <span className="text-red-500">*</span></label>
                    <input className="form-input" id="password-confirm" onChange={(event) => updateField("passwordConfirm", event.target.value)} placeholder={copy.passwordConfirmPlaceholder} required type="password" value={form.passwordConfirm} />
                    {passwordMessage ? <div className={`mt-1 text-[12px] ${form.password === form.passwordConfirm ? "text-green-600 font-bold" : "text-red-500"}`}>{passwordMessage}</div> : null}
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="form-label">{copy.phone} <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <select className="w-24 form-input" onChange={(event) => updateField("moblphonNo1", event.target.value)} value={form.moblphonNo1}>
                        <option>010</option><option>011</option><option>02</option>
                      </select>
                      <span className="flex items-center">-</span>
                      <input className="flex-1 form-input" onChange={(event) => updateField("moblphonNo2", event.target.value)} required type="text" value={form.moblphonNo2} />
                      <span className="flex items-center">-</span>
                      <input className="flex-1 form-input" onChange={(event) => updateField("moblphonNo3", event.target.value)} required type="text" value={form.moblphonNo3} />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="form-label" htmlFor="email">{copy.email} <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <input className="form-input" id="email" inputMode="email" onChange={(event) => updateField("applcntEmailAdres", event.target.value)} placeholder={copy.emailPlaceholder} required type="text" value={form.applcntEmailAdres} />
                      <button className="px-4 bg-gray-800 text-white text-sm font-bold rounded-[var(--kr-gov-radius)] whitespace-nowrap" onClick={() => void handleCheckEmail()} type="button">{copy.duplicateCheck}</button>
                    </div>
                    {emailMessage ? <div className={`mt-1 text-[12px] ${emailChecked ? "text-green-600 font-bold" : "text-red-500"}`}>{emailMessage}</div> : null}
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="form-label" htmlFor="user-address">{copy.address} <span className="text-red-500">*</span></label>
                    <div className="flex gap-2 mb-2">
                      <input className="form-input w-32 bg-gray-50 cursor-pointer" id="zip-code" onClick={openAddressSearch} placeholder={copy.zipPlaceholder} readOnly required type="text" value={form.zip} />
                      <button className="px-5 border border-[var(--kr-gov-blue)] text-[var(--kr-gov-blue)] text-sm font-bold rounded-[var(--kr-gov-radius)] hover:bg-blue-50 transition-colors" onClick={openAddressSearch} type="button">{copy.searchAddress}</button>
                    </div>
                    <input className="form-input mb-2 bg-gray-50 cursor-pointer" id="user-address" onClick={openAddressSearch} placeholder={copy.addressPlaceholder} readOnly required type="text" value={form.adres} />
                    <input className="form-input" id="user-address-detail" onChange={(event) => updateField("detailAdres", event.target.value)} placeholder={copy.detailAddressPlaceholder} type="text" value={form.detailAdres} />
                  </div>
                </div>
              </section>

              <section data-help-id="join-step4-org">
                <h3 className="section-title">
                  <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">corporate_fare</span>
                  {copy.orgSection}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-1">
                    <label className="form-label" htmlFor="company-search">{copy.companyName} <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input className={`form-input pr-24${en ? " bg-gray-50" : ""}`} id="company-search" placeholder={copy.companyPlaceholder} readOnly required type="text" value={form.insttNm} />
                      <button className="absolute right-2 top-2 bottom-2 px-4 bg-[var(--kr-gov-blue)] text-white text-sm font-bold rounded-[var(--kr-gov-radius)] flex items-center gap-1" onClick={() => void handleOpenCompanySearch()} type="button">
                        <span className="material-symbols-outlined text-sm">search</span> {copy.search}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="form-label" htmlFor="biz-number">{copy.bizno} <span className="text-red-500">*</span></label>
                    <input className="form-input bg-gray-50" id="biz-number" placeholder={copy.biznoPlaceholder} readOnly required type="text" value={form.bizrno} />
                  </div>
                  <div className="space-y-1">
                    <label className="form-label" htmlFor="representative-name">{copy.representative} <span className="text-red-500">*</span></label>
                    <input className="form-input bg-gray-50" id="representative-name" placeholder={copy.representativePlaceholder} readOnly required type="text" value={form.representativeName} />
                  </div>
                  <div className="space-y-1">
                    <label className="form-label" htmlFor="department">{copy.department}</label>
                    <input className="form-input" id="department" onChange={(event) => updateField("deptNm", event.target.value)} placeholder={copy.departmentPlaceholder} type="text" value={form.deptNm} />
                  </div>
                  <div className="md:col-span-2 space-y-1" data-help-id="join-step4-files">
                    <label className="form-label">{copy.fileTitle} <span className="text-red-500">*</span></label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-[var(--kr-gov-text-secondary)]">{copy.fileDesc}</p>
                        <button className="join-upload-add-btn" onClick={addFileRow} type="button">
                          <span className="material-symbols-outlined text-[18px]">add</span>{copy.addFile}
                        </button>
                      </div>
                      <div className="space-y-2">
                        {uploadRows.map((row, index) => (
                          <div className={`join-upload-row ${row.file && row.file.size > 0 ? "is-selected" : ""}`} key={row.id}>
                            <span className="material-symbols-outlined join-upload-icon">attach_file</span>
                            <div className="flex-grow min-w-0">
                              <input accept=".pdf,.jpg,.jpeg,.png" className="hidden" id={`file-input-${row.id}`} onChange={(event) => handleFileChange(index, event)} type="file" />
                              <label className="join-upload-label" htmlFor={`file-input-${row.id}`}>
                                <div className="flex items-center justify-between">
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
                      <p className="text-xs text-gray-500">{copy.fileGuide}</p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row gap-4">
                <button className="flex-1 h-14 border border-[var(--kr-gov-border-light)] text-[var(--kr-gov-text-primary)] text-lg font-bold rounded-[var(--kr-gov-radius)] hover:bg-gray-50 transition-colors" onClick={() => navigate(buildLocalizedPath("/join/step3", "/join/en/step3"))} type="button">{copy.prev}</button>
                <button className="flex-[2] h-14 bg-[var(--kr-gov-blue)] text-white text-lg font-bold rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)] transition-colors shadow-lg" disabled={submitting || !session?.canViewStep4} type="submit">{submitting ? "..." : copy.submit}</button>
              </div>
            </form>
          </div>

          <p className="mt-10 text-sm text-[var(--kr-gov-text-secondary)] text-center max-w-2xl mx-auto leading-relaxed">
            {copy.footer}<br />{copy.footer2}
          </p>
        </div>
      </main>

      <div aria-labelledby="modal-title" aria-modal="true" className={`modal-overlay ${modalOpen ? "" : "hidden"}`} role="dialog">
        <div className="modal-container">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[var(--kr-gov-text-primary)] flex items-center gap-2" id="modal-title">
              <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">corporate_fare</span>{copy.companyModalTitle}
            </h2>
            <button className="text-gray-400 hover:text-gray-600 rounded-full p-1" onClick={closeCompanySearch} type="button"><span className="material-symbols-outlined">close</span></button>
          </div>
          <div className="p-6 overflow-y-auto">
            <div className="mb-8">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[var(--kr-gov-text-secondary)]" htmlFor="modal-search">{copy.companyModalLabel}</label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input
                      className="form-input pl-11"
                      id="modal-search"
                      onChange={(event) => setDraftSearchKeyword(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          runCompanySearch(1);
                        }
                      }}
                      placeholder={copy.companyModalPlaceholder}
                      type="text"
                      value={draftSearchKeyword}
                    />
                  </div>
                  <button className="px-8 bg-[var(--kr-gov-blue)] text-white font-bold rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)] transition-colors" onClick={() => runCompanySearch(1)} type="button">{copy.search}</button>
                </div>
              </div>
            </div>
            <div className="border border-[var(--kr-gov-border-light)] rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#f8f9fa] border-b border-[var(--kr-gov-border-light)] text-[var(--kr-gov-text-primary)]">
                  <tr>
                    <th className="px-4 py-3 font-bold text-center w-12" scope="col">{copy.no}</th>
                    <th className="px-4 py-3 font-bold" scope="col">{copy.companyName}</th>
                    <th className="px-4 py-3 font-bold" scope="col">{copy.bizno}</th>
                    <th className="px-4 py-3 font-bold" scope="col">{copy.representative}</th>
                    <th className="px-4 py-3 font-bold text-center" scope="col">{copy.select}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {searchLoading ? (
                    <tr><td className="px-4 py-8 text-center text-gray-500" colSpan={5}>{copy.loading}</td></tr>
                  ) : searchResult && searchResult.list.length > 0 ? searchResult.list.map((row, index) => (
                    <tr className="hover:bg-blue-50/50 transition-colors" key={row.insttId}>
                      <td className="px-4 py-4 text-center text-gray-500">{(searchPage - 1) * 5 + index + 1}</td>
                      <td className="px-4 py-4 font-medium">{row.cmpnyNm}</td>
                      <td className="px-4 py-4 text-gray-600">{row.bizrno}</td>
                      <td className="px-4 py-4 text-gray-600">{row.cxfc}</td>
                      <td className="px-4 py-4 text-center">
                        <button className="px-3 py-1.5 border border-[var(--kr-gov-blue)] text-[var(--kr-gov-blue)] text-xs font-bold rounded-md hover:bg-[var(--kr-gov-blue)] hover:text-white transition-all" onClick={() => selectCompany(row)} type="button">{copy.select}</button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td className="px-4 py-8 text-center text-gray-500" colSpan={5}>{copy.noResults}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 border-t border-b border-gray-200 p-4 rounded-md">
              <p className="text-[13px] text-[var(--kr-gov-text-secondary)] flex items-center gap-1.5 leading-relaxed">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">info</span>
                {copy.newCompanyHelp}
                <span className="font-bold text-[var(--kr-gov-blue)] text-sm cursor-pointer hover:underline" onClick={() => navigate(buildLocalizedPath("/join/companyRegister", "/join/en/companyRegister"))}>{copy.newCompanyLink}</span>
                {copy.newCompanyTail}
              </p>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-100 flex justify-end gap-2">
            <button className="px-6 py-2.5 bg-white border border-[var(--kr-gov-border-light)] text-[var(--kr-gov-text-primary)] font-bold rounded-[var(--kr-gov-radius)] hover:bg-gray-50" onClick={closeCompanySearch} type="button">{copy.cancel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
