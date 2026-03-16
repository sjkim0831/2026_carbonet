export const MEMBER_TYPE_OPTIONS = [
  { value: "", label: "전체" },
  { value: "EMITTER", label: "CO2 배출 및 포집 기업" },
  { value: "PERFORMER", label: "CCUS 사업 수행 기업" },
  { value: "CENTER", label: "CCUS 진흥센터" },
  { value: "GOV", label: "주무관청 / 행정기관" }
];

export const MEMBER_STATUS_OPTIONS = [
  { value: "", label: "전체" },
  { value: "P", label: "활성" },
  { value: "A", label: "승인 대기" },
  { value: "R", label: "반려" },
  { value: "D", label: "삭제" },
  { value: "X", label: "차단" }
];

export const MEMBER_APPROVAL_STATUS_OPTIONS = [
  { value: "A", label: "승인 대기" },
  { value: "P", label: "활성" },
  { value: "R", label: "반려" },
  { value: "X", label: "차단" }
];

export function resolveMembershipTypeLabel(rawValue: unknown) {
  switch (String(rawValue || "").trim().toUpperCase()) {
    case "E":
    case "EMITTER":
      return "CO2 배출 및 포집 기업";
    case "P":
    case "PERFORMER":
      return "CCUS 사업 수행 기업";
    case "C":
    case "CENTER":
      return "CCUS 진흥센터";
    case "G":
    case "GOV":
      return "주무관청 / 행정기관";
    default:
      return String(rawValue || "기타");
  }
}

export function resolveMemberStatusBadgeClass(rawValue: unknown) {
  switch (String(rawValue || "").trim().toUpperCase()) {
    case "P":
      return "bg-emerald-100 text-emerald-700";
    case "A":
      return "bg-blue-100 text-blue-700";
    case "R":
      return "bg-amber-100 text-amber-700";
    case "D":
      return "bg-slate-200 text-slate-700";
    case "X":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function resolveMemberStatusLabel(rawValue: unknown) {
  switch (String(rawValue || "").trim().toUpperCase()) {
    case "P":
      return "활성";
    case "A":
      return "승인 대기";
    case "R":
      return "반려";
    case "D":
      return "삭제";
    case "X":
      return "차단";
    default:
      return String(rawValue || "기타");
  }
}
