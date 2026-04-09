type MypageContext = {
  insttId?: string;
};

type PortalSession = {
  csrfHeaderName?: string;
  csrfToken?: string;
  insttId?: string;
};

type MypagePayload = Record<string, unknown> & {
  authenticated?: boolean;
  redirectUrl?: string;
  pageType?: string;
  userId?: string;
  companyName?: string;
  pendingStatus?: string;
  submittedAt?: string;
  rejectionReason?: string;
  rejectionProcessedAt?: string;
  member?: Record<string, unknown>;
};

type MypageSectionItem = {
  label: string;
  value: string;
};

type MypageSectionPayload = MypagePayload & {
  section?: string;
  sectionTitle?: string;
  canViewSection?: boolean;
  canUseSection?: boolean;
  sectionReason?: string;
  items?: MypageSectionItem[];
  passwordHistory?: Array<Record<string, string>>;
  saved?: boolean;
  message?: string;
};

let mypageContextCache: MypageContext | null = null;
let mypageContextPromise: Promise<MypageContext> | null = null;

export function invalidatePortalContextCache() {
  mypageContextCache = null;
  mypageContextPromise = null;
}

async function fetchMypageContext(en = false): Promise<MypageContext> {
  if (mypageContextCache) {
    return mypageContextCache;
  }

  if (!mypageContextPromise) {
    mypageContextPromise = fetch(en ? "/api/en/mypage/context" : "/api/mypage/context", {
      credentials: "include"
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load mypage context: ${response.status}`);
        }
        return response.json() as Promise<MypageContext>;
      })
      .then((context) => {
        mypageContextCache = context;
        return context;
      })
      .finally(() => {
        mypageContextPromise = null;
      });
  }

  if (!mypageContextPromise) {
    throw new Error("Mypage context promise was not initialized");
  }

  return mypageContextPromise;
}

function appendInsttId(search: URLSearchParams, insttId?: string) {
  const normalizedInsttId = String(insttId || "").trim();
  if (normalizedInsttId) {
    search.set("instt_id", normalizedInsttId);
  }
  return search;
}

async function buildMypageUrl(path: string) {
  const context = await fetchMypageContext(path.startsWith("/api/en/")).catch(() => null);
  const search = appendInsttId(new URLSearchParams(), context?.insttId);
  return search.toString() ? `${path}?${search.toString()}` : path;
}

function buildPortalHeaders(session: PortalSession): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Requested-With": "XMLHttpRequest"
  };
  if (session.csrfHeaderName && session.csrfToken) {
    headers[session.csrfHeaderName] = session.csrfToken;
  }
  return headers;
}

export async function fetchMypage(en = false) {
  const response = await fetch(await buildMypageUrl(en ? "/api/en/mypage" : "/api/mypage"), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(`Failed to load mypage: ${response.status}`);
  }
  return body as MypagePayload;
}

export async function fetchMypageSection(section: string, en = false) {
  const response = await fetch(await buildMypageUrl(en ? `/api/en/mypage/section/${encodeURIComponent(section)}` : `/api/mypage/section/${encodeURIComponent(section)}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(`Failed to load mypage section: ${response.status}`);
  }
  return body as MypageSectionPayload;
}

export async function saveMypageMarketing(session: PortalSession, marketingYn: string, en = false, insttId?: string) {
  const response = await fetch(en ? "/api/en/mypage/marketing" : "/api/mypage/marketing", {
    method: "POST",
    credentials: "include",
    headers: buildPortalHeaders(session),
    body: appendInsttId(new URLSearchParams({ marketingYn }), insttId || session.insttId).toString()
  });
  const body = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(body.message || `Failed to save marketing setting: ${response.status}`);
  }
  return body as MypageSectionPayload;
}

export async function saveMypageProfile(
  session: PortalSession,
  payload: { zip: string; address: string; detailAddress: string },
  en = false,
  insttId?: string
) {
  const response = await fetch(en ? "/api/en/mypage/profile" : "/api/mypage/profile", {
    method: "POST",
    credentials: "include",
    headers: buildPortalHeaders(session),
    body: appendInsttId(new URLSearchParams(payload), insttId || session.insttId).toString()
  });
  const body = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(body.message || `Failed to save profile setting: ${response.status}`);
  }
  return body as MypageSectionPayload;
}

export async function saveMypageCompany(
  session: PortalSession,
  payload: { companyName: string; representativeName: string; zip: string; address: string; detailAddress: string },
  en = false,
  insttId?: string
) {
  const response = await fetch(en ? "/api/en/mypage/company" : "/api/mypage/company", {
    method: "POST",
    credentials: "include",
    headers: buildPortalHeaders(session),
    body: appendInsttId(new URLSearchParams(payload), insttId || session.insttId).toString()
  });
  const body = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(body.message || `Failed to save company setting: ${response.status}`);
  }
  return body as MypageSectionPayload;
}

export async function saveMypageStaff(
  session: PortalSession,
  payload: { staffName: string; deptNm: string; areaNo: string; middleTelno: string; endTelno: string },
  en = false,
  insttId?: string
) {
  const response = await fetch(en ? "/api/en/mypage/staff" : "/api/mypage/staff", {
    method: "POST",
    credentials: "include",
    headers: buildPortalHeaders(session),
    body: appendInsttId(new URLSearchParams(payload), insttId || session.insttId).toString()
  });
  const body = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(body.message || `Failed to save staff setting: ${response.status}`);
  }
  return body as MypageSectionPayload;
}

export async function saveMypageEmail(session: PortalSession, email: string, en = false, insttId?: string) {
  const response = await fetch(en ? "/api/en/mypage/email" : "/api/mypage/email", {
    method: "POST",
    credentials: "include",
    headers: buildPortalHeaders(session),
    body: appendInsttId(new URLSearchParams({ email }), insttId || session.insttId).toString()
  });
  const body = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(body.message || `Failed to save email setting: ${response.status}`);
  }
  return body as MypageSectionPayload;
}

export async function saveMypagePassword(session: PortalSession, currentPassword: string, newPassword: string, en = false, insttId?: string) {
  const response = await fetch(en ? "/api/en/mypage/password" : "/api/mypage/password", {
    method: "POST",
    credentials: "include",
    headers: buildPortalHeaders(session),
    body: appendInsttId(new URLSearchParams({ currentPassword, newPassword }), insttId || session.insttId).toString()
  });
  const body = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(body.message || `Failed to save password setting: ${response.status}`);
  }
  return body as MypageSectionPayload;
}
