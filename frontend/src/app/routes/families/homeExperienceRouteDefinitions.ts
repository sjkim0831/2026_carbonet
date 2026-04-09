import type { RouteUnitDefinition } from "../../../framework/routes/pageUnitTypes";

export const HOME_EXPERIENCE_ROUTE_DEFINITIONS = [
  { id: "join-company-register", label: "공개 회원사 등록", group: "join", koPath: "/join/companyRegister", enPath: "/join/en/companyRegister" },
  { id: "join-company-register-complete", label: "회원사 등록 완료", group: "join", koPath: "/join/companyRegisterComplete", enPath: "/join/en/companyRegisterComplete" },
  { id: "join-company-reapply", label: "반려 재신청", group: "join", koPath: "/join/companyReapply", enPath: "/join/en/companyReapply" },
  { id: "edu-course-list", label: "교육과정 목록", group: "home", koPath: "/edu/course_list", enPath: "/en/edu/course_list" },
  { id: "edu-my-course", label: "나의 교육", group: "home", koPath: "/edu/my_course", enPath: "/en/edu/my_course" },
  { id: "edu-progress", label: "진도 관리", group: "home", koPath: "/edu/progress", enPath: "/en/edu/progress" },
  { id: "edu-content", label: "자격 연계", group: "home", koPath: "/edu/content", enPath: "/en/edu/content" },
  { id: "edu-course-detail", label: "과정 상세", group: "home", koPath: "/edu/course_detail", enPath: "/en/edu/course_detail" },
  { id: "edu-apply", label: "교육 신청", group: "home", koPath: "/edu/apply", enPath: "/en/edu/apply" },
  { id: "edu-survey", label: "설문조사", group: "home", koPath: "/edu/survey", enPath: "/en/edu/survey" },
  { id: "edu-certificate", label: "수료증", group: "home", koPath: "/edu/certificate", enPath: "/en/edu/certificate" },
  { id: "join-wizard", label: "회원가입 위저드", group: "join", koPath: "/join/step1", enPath: "/join/en/step1" },
  { id: "join-terms", label: "회원가입 약관", group: "join", koPath: "/join/step2", enPath: "/join/en/step2" },
  { id: "join-auth", label: "회원가입 본인확인", group: "join", koPath: "/join/step3", enPath: "/join/en/step3" },
  { id: "join-info", label: "회원가입 정보입력", group: "join", koPath: "/join/step4", enPath: "/join/en/step4" },
  { id: "join-complete", label: "회원가입 완료", group: "join", koPath: "/join/step5", enPath: "/join/en/step5" },
  { id: "my-inquiry", label: "1:1 문의", group: "home", koPath: "/mtn/my_inquiry", enPath: "/en/mtn/my_inquiry" },
  { id: "mtn-status", label: "서비스 상태", group: "home", koPath: "/mtn/status", enPath: "/en/mtn/status" },
  { id: "mtn-version", label: "버전 관리", group: "home", koPath: "/mtn/version", enPath: "/en/mtn/version" },
  { id: "support-faq", label: "FAQ", group: "home", koPath: "/support/faq", enPath: "/en/support/faq" },
  { id: "support-inquiry", label: "문의 내역", group: "home", koPath: "/support/inquiry", enPath: "/en/support/inquiry" },
  { id: "mypage", label: "마이페이지", group: "home", koPath: "/mypage/profile", enPath: "/en/mypage/profile" },
  { id: "mypage-email", label: "이메일/전화 변경", group: "home", koPath: "/mypage/email", enPath: "/en/mypage/email" },
  { id: "mypage-notification", label: "알림 설정", group: "home", koPath: "/mypage/notification", enPath: "/en/mypage/notification" },
  { id: "mypage-marketing", label: "마케팅 수신", group: "home", koPath: "/mypage/marketing", enPath: "/en/mypage/marketing" },
  { id: "mypage-company", label: "기업 정보", group: "home", koPath: "/mypage/company", enPath: "/en/mypage/company" },
  { id: "mypage-password", label: "비밀번호 변경", group: "home", koPath: "/mypage/password", enPath: "/en/mypage/password" },
  { id: "mypage-staff", label: "담당자 관리", group: "home", koPath: "/mypage/staff", enPath: "/en/mypage/staff" }
] as const satisfies ReadonlyArray<RouteUnitDefinition>;

export type HomeExperienceRouteId = (typeof HOME_EXPERIENCE_ROUTE_DEFINITIONS)[number]["id"];
