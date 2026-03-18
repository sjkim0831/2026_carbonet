# Carbonet DB Menu Work Order WBS

기준일: 2026-03-17

기준 소스:

- DB `MenuInfoService.selectMenuTreeList("HMENU1")`
- DB `MenuInfoService.selectMenuTreeList("AMENU1")`

## 1. DB 메뉴 인벤토리 요약

- HOME 전체 메뉴 행: 99개
- ADMIN 전체 메뉴 행: 142개
- HOME 페이지 메뉴(8자리): 72개
- ADMIN 페이지 메뉴(8자리): 107개

## 2. HOME 메뉴 전체 목록

| Scope | 코드 | 단계 | 메뉴명 | 영문명 | URL | 사용 | 정렬 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| HOME | `H001` | TOP | 탄소배출 | Carbon Emissions | `emission/index` | Y |  |
| HOME | `H00101` | GROUP | 배출량 산정 | Emissions Calculation | `emission/index` | Y |  |
| HOME | `H0010101` | PAGE | 배출량 관리 | Emissions Management | `emission/project_list` | Y |  |
| HOME | `H0010102` | PAGE | 데이터 입력 | Data Input | `emission/data_input` | Y |  |
| HOME | `H0010103` | PAGE | 산정/검증 | Calculation & Verification | `emission/validate` | Y |  |
| HOME | `H0010104` | PAGE | 보고서 제출 | Report Submission | `emission/report_submit` | Y |  |
| HOME | `H00102` | GROUP | 분석 | Analysis | `emission/index` | Y |  |
| HOME | `H0010201` | PAGE | LCA 분석 | LCA Analysis | `emission/lca` | Y |  |
| HOME | `H0010202` | PAGE | LCI DB 조회 | LCI DB Lookup | `emission/lci` | Y |  |
| HOME | `H0010203` | PAGE | 감축 시나리오 | Reduction Scenarios | `emission/reduction` | Y |  |
| HOME | `H0010204` | PAGE | 시뮬레이션 | Simulation | `emission/simulate` | Y |  |
| HOME | `H002` | TOP | 보고서·인증서 | Reports & Certificates | `certificate/index` | Y |  |
| HOME | `H00201` | GROUP | 보고서 | Reports | `certificate/index` | Y |  |
| HOME | `H0020101` | PAGE | 보고서 목록 | Report List | `certificate/report_list` | Y |  |
| HOME | `H0020102` | PAGE | 보고서 작성 | Report Creation | `certificate/report_form` | Y |  |
| HOME | `H0020103` | PAGE | 수정/재제출 | Edit & Resubmit | `certificate/report_edit` | Y |  |
| HOME | `H0020104` | PAGE | 처리 상태 | Processing Status | `certificate/index` | Y |  |
| HOME | `H00202` | GROUP | 인증서 | Certificates | `certificate/index` | Y |  |
| HOME | `H0020201` | PAGE | 인증서 신청 | Certificate Application | `certificate/apply` | Y |  |
| HOME | `H0020202` | PAGE | 인증서 목록 | Certificate List | `certificate/list` | Y |  |
| HOME | `H0020203` | PAGE | 재발급 | Reissue | `certificate/reissue` | Y |  |
| HOME | `H0020204` | PAGE | 인증서 검증 | Certificate Verification | `certificate/verify` | Y |  |
| HOME | `H003` | TOP | 탄소정보 | Carbon Information | `co2/index` | Y |  |
| HOME | `H00301` | GROUP | CO2 정보 | CO2 Information | `co2/index` | Y |  |
| HOME | `H0030101` | PAGE | 생산 정보 | Production Information | `co2/production_list` | Y |  |
| HOME | `H0030102` | PAGE | 수요 정보 | Demand Information | `co2/demand_list` | Y |  |
| HOME | `H0030103` | PAGE | 무결성 추적 | Integrity Tracking | `co2/integrity` | Y |  |
| HOME | `H0030104` | PAGE | 크레딧 조회 | Credit Lookup | `co2/credits` | Y |  |
| HOME | `H00302` | GROUP | 연계 | Integrations | `co2/index` | Y |  |
| HOME | `H0030201` | PAGE | 플랫폼 매칭 | Platform Matching | `trade/matching` | Y |  |
| HOME | `H0030202` | PAGE | 품질지표 | Quality Metrics | `co2/analysis` | Y |  |
| HOME | `H0030203` | PAGE | MRV 정보 | MRV Information | `co2/search` | Y |  |
| HOME | `H0030204` | PAGE | 추적 리포트 | Traceability Report | `monitoring/track` | Y |  |
| HOME | `H004` | TOP | 거래 | Trading | `trade/index` | Y |  |
| HOME | `H00401` | GROUP | 주문/체결 | Orders & Fills | `trade/index` | Y |  |
| HOME | `H0040101` | PAGE | 거래 목록 | Trade List | `trade/list` | Y |  |
| HOME | `H0040102` | PAGE | 구매 요청 | Purchase Requests | `trade/buy_request` | Y |  |
| HOME | `H0040103` | PAGE | 판매 등록 | Sales Listing | `trade/sell` | Y |  |
| HOME | `H0040104` | PAGE | 체결 현황 | Execution Status | `trade/complete` | Y |  |
| HOME | `H00402` | GROUP | 시장 | Market | `trade/index` | Y |  |
| HOME | `H0040201` | PAGE | 시장 동향 | Market Trends | `trade/market` | Y |  |
| HOME | `H0040202` | PAGE | 가격 알림 | Price Alerts | `trade/price_alert` | Y |  |
| HOME | `H0040203` | PAGE | 자동 매칭 | Auto Matching | `trade/auto_order` | Y |  |
| HOME | `H0040204` | PAGE | 거래 리포트 | Trade Reports | `trade/report` | Y |  |
| HOME | `H005` | TOP | 모니터링 | Monitoring | `monitoring/index` | Y |  |
| HOME | `H00501` | GROUP | 대시보드 | Dashboard | `monitoring/index` | Y |  |
| HOME | `H0050101` | PAGE | 통합 대시보드 | Unified Dashboard | `monitoring/dashboard` | Y |  |
| HOME | `H0050102` | PAGE | 실시간 모니터링 | Real-time Monitoring | `monitoring/realtime` | Y |  |
| HOME | `H0050103` | PAGE | 성과 추이 | Performance Trends | `monitoring/reduction_trend` | Y |  |
| HOME | `H0050104` | PAGE | 경보 현황 | Alert Status | `monitoring/alerts` | Y |  |
| HOME | `H00502` | GROUP | 분석 리포트 | Analytics Reports | `monitoring/index` | Y |  |
| HOME | `H0050201` | PAGE | 통계 자료 | Statistics | `monitoring/statistics` | Y |  |
| HOME | `H0050202` | PAGE | ESG 보고서 | ESG Reports | `monitoring/esg` | Y |  |
| HOME | `H0050203` | PAGE | 이해관계자 공유 | Stakeholder Sharing | `monitoring/share` | Y |  |
| HOME | `H0050204` | PAGE | 내보내기 | Export | `monitoring/export` | Y |  |
| HOME | `H006` | TOP | 결제 | Payments | `payment/index` | Y |  |
| HOME | `H00601` | GROUP | 결제 | Payments | `payment/index` | Y |  |
| HOME | `H0060101` | PAGE | 결제 내역 | Payment History | `payment/history` | Y |  |
| HOME | `H0060102` | PAGE | 결제 요청 | Payment Requests | `payment/pay` | Y |  |
| HOME | `H0060103` | PAGE | 가상계좌 | Virtual Accounts | `payment/virtual_account` | Y |  |
| HOME | `H0060104` | PAGE | 영수증 | Receipts | `payment/receipt` | Y |  |
| HOME | `H00602` | GROUP | 환불/정산 | Refunds & Settlement | `payment/index` | Y |  |
| HOME | `H0060201` | PAGE | 환불 요청 | Refund Requests | `payment/refund` | Y |  |
| HOME | `H0060202` | PAGE | 환불 계좌 | Refund Accounts | `payment/refund_account` | Y |  |
| HOME | `H0060203` | PAGE | 정산 내역 | Settlement History | `payment/detail` | Y |  |
| HOME | `H0060204` | PAGE | 세금계산서 | Tax Invoices | `payment/notify` | Y |  |
| HOME | `H007` | TOP | 교육 | Training | `edu/index` | Y |  |
| HOME | `H00701` | GROUP | 과정 | Courses | `edu/index` | Y |  |
| HOME | `H0070101` | PAGE | 교육 과정 목록 | Course List | `edu/course_list` | Y |  |
| HOME | `H0070102` | PAGE | 과정 상세 | Course Details | `edu/course_detail` | Y |  |
| HOME | `H0070103` | PAGE | 교육 신청 | Course Enrollment | `edu/apply` | Y |  |
| HOME | `H0070104` | PAGE | 나의 교육 | My Courses | `edu/my_course` | Y |  |
| HOME | `H00702` | GROUP | 이수 | Completion | `edu/index` | Y |  |
| HOME | `H0070201` | PAGE | 진도 관리 | Progress Tracking | `edu/progress` | Y |  |
| HOME | `H0070202` | PAGE | 설문 | Surveys | `edu/survey` | Y |  |
| HOME | `H0070203` | PAGE | 수료증 | Completion Certificate | `edu/certificate` | Y |  |
| HOME | `H0070204` | PAGE | 자격 연계 | Qualification Integration | `edu/content` | Y |  |
| HOME | `H008` | TOP | 마이페이지 | My Page | `mypage/index` | Y |  |
| HOME | `H00801` | GROUP | 회원 정보 | Member Info | `mypage/index` | Y |  |
| HOME | `H0080101` | PAGE | 내 정보 | My Info | `mypage/profile` | Y |  |
| HOME | `H0080102` | PAGE | 기업 정보 | Company Info | `mypage/company` | Y |  |
| HOME | `H0080103` | PAGE | 담당자 관리 | Contact Management | `mypage/staff` | Y |  |
| HOME | `H0080104` | PAGE | 알림 설정 | Notification Settings | `mypage/notification` | Y |  |
| HOME | `H00802` | GROUP | 계정 관리 | Account Management | `mypage/index` | Y |  |
| HOME | `H0080201` | PAGE | 비밀번호 변경 | Change Password | `mypage/password` | Y |  |
| HOME | `H0080202` | PAGE | 이메일/전화 변경 | Update Email/Phone | `mypage/email` | Y |  |
| HOME | `H0080203` | PAGE | 보안 설정 | Security Settings | `mypage/index` | Y |  |
| HOME | `H0080204` | PAGE | 마케팅 수신 | Marketing Preferences | `mypage/marketing` | Y |  |
| HOME | `H009` | TOP | 고객지원 | Customer Support | `support/index` | Y |  |
| HOME | `H00901` | GROUP | 고객센터 | Support Center | `support/index` | Y |  |
| HOME | `H0090101` | PAGE | 공지사항 | Notices | `support/notice_list` | Y |  |
| HOME | `H0090102` | PAGE | FAQ | FAQ | `support/faq` | Y |  |
| HOME | `H0090103` | PAGE | Q&A | Q&A | `support/qna_list` | Y |  |
| HOME | `H0090104` | PAGE | 자료실 | Resources | `support/download_list` | Y |  |
| HOME | `H00902` | GROUP | 문의 | Inquiries | `support/index` | Y |  |
| HOME | `H0090201` | PAGE | 1:1 문의 | 1:1 Inquiry | `support/inquiry` | Y |  |
| HOME | `H0090202` | PAGE | 나의 문의 내역 | My Inquiries | `mtn/my_inquiry` | Y |  |
| HOME | `H0090203` | PAGE | 서비스 상태 | Service Status | `mtn/status` | Y |  |
| HOME | `H0090204` | PAGE | 버전 정보 | Version Information | `mtn/version` | Y |  |

## 3. ADMIN 메뉴 전체 목록

| Scope | 코드 | 단계 | 메뉴명 | 영문명 | URL | 사용 | 정렬 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ADMIN | `A001` | TOP | 회원관리 | Member Management | `#` | Y | 1 |
| ADMIN | `A00101` | GROUP | 회원 | Members | `#` | Y | 1 |
| ADMIN | `A0010101` | PAGE | 회원 목록 | Member List | `/admin/member/list` | Y | 1 |
| ADMIN | `A0010201` | PAGE | 회원사 목록 | Member Company List | `/admin/member/company_list` | Y | 1 |
| ADMIN | `A0010301` | PAGE | 회원 목록 | Member List | `/admin/member/admin_list` | Y | 1 |
| ADMIN | `A0010401` | PAGE | 권한 그룹 | Permission Groups | `/admin/auth/group` | Y | 1 |
| ADMIN | `A0010501` | PAGE | 로그인 이력 | Login History | `/admin/member/login_history` | Y | 1 |
| ADMIN | `A00201` | GROUP | 배출 | Emissions | `#` | Y | 1 |
| ADMIN | `A0020101` | PAGE | 산정 결과 목록 | Calculation Result List | `/admin/emission/result_list` | Y | 1 |
| ADMIN | `A0020201` | PAGE | 발급 검토 | Issuance Review | `/admin/certificate/review` | Y | 1 |
| ADMIN | `A0020301` | PAGE | 감사 로그 | Audit Log | `/admin/certificate/audit-log` | Y | 1 |
| ADMIN | `A00301` | GROUP | 거래 | Trading | `#` | Y | 1 |
| ADMIN | `A0030101` | PAGE | 거래 목록 | Trade List | `/admin/trade/list` | Y | 1 |
| ADMIN | `A0030201` | PAGE | 수수료 설정 | Fee Settings | `/admin/payment/commission` | Y | 1 |
| ADMIN | `A0030301` | PAGE | 환불 요청 목록 | Refund Request List | `/admin/payment/refund_list` | Y | 1 |
| ADMIN | `A00401` | GROUP | 게시판 | Boards | `#` | Y | 1 |
| ADMIN | `A0040101` | PAGE | 게시판 관리 | Board Management | `/admin/content/board_list` | Y | 1 |
| ADMIN | `A0040201` | PAGE | 배너 목록 | Banner List | `/admin/content/banner_list` | Y | 1 |
| ADMIN | `A0040301` | PAGE | FAQ 관리 | FAQ Management | `/admin/content/faq_list` | Y | 1 |
| ADMIN | `A00501` | GROUP | 연계 | Integrations | `#` | Y | 1 |
| ADMIN | `A0050101` | PAGE | 연계 목록 | Integration List | `/admin/external/connection_list` | Y | 1 |
| ADMIN | `A0050201` | PAGE | API 키 | API Keys | `/admin/external/keys` | Y | 1 |
| ADMIN | `A0050301` | PAGE | 연계 모니터링 | Integration Monitoring | `/admin/external/monitoring` | Y | 1 |
| ADMIN | `A00601` | GROUP | 환경 | Environment | `#` | Y | 1 |
| ADMIN | `A0060101` | PAGE | 환경설정 | Settings | `/admin/system/config` | Y | 1 |
| ADMIN | `A0060201` | PAGE | 보안 정책 관리 | Security Policy Management | `/admin/system/security-policy` | Y | 1 |
| ADMIN | `A0060301` | PAGE | 접속 로그 | Access Logs | `/admin/system/access_history` | Y | 1 |
| ADMIN | `A0060401` | PAGE | 백업 설정 | Backup Settings | `/admin/system/backup_config` | Y | 1 |
| ADMIN | `A00701` | GROUP | 대시보드 | Dashboard | `#` | Y | 1 |
| ADMIN | `A0070101` | PAGE | 통합 대시보드 | Unified Dashboard | `/admin/monitoring/index` | Y | 1 |
| ADMIN | `A0070201` | PAGE | 센서 목록 | Sensor List | `/admin/monitoring/sensor_list` | Y | 1 |
| ADMIN | `A0070301` | PAGE | 응답속도 | Response Time | `/admin/system/performance` | Y | 1 |
| ADMIN | `A10102` | GROUP | Codex 관리 | Codex Management |  | Y | 1 |
| ADMIN | `A1010201` | PAGE | Codex 요청 관리 | Codex Request Management | `/admin/system/codex-request` | Y | 1 |
| ADMIN | `A19001` | GROUP | AI 작업센터 | AI Workbench |  | Y | 1 |
| ADMIN | `A1900101` | PAGE | 화면 도움말 운영 | Help Management | `/admin/system/help-management` | Y | 1 |
| ADMIN | `A0010102` | PAGE | 신규 회원 등록 | New Member Registration | `/admin/member/company_account` | Y | 2 |
| ADMIN | `A00102` | GROUP | 회원사 | Member Companies | `#` | Y | 2 |
| ADMIN | `A0010203` | PAGE | 회원사 추가 | Add Company | `/admin/member/company_account` | Y | 2 |
| ADMIN | `A0010302` | PAGE | 관리자 계정 생성 | Admin Account Create | `/admin/member/admin_account` | Y | 2 |
| ADMIN | `A0010402` | PAGE | 권한 변경 | Permission Changes | `/admin/member/auth-change` | Y | 2 |
| ADMIN | `A0010502` | PAGE | 접근 차단 이력 | Access Block History | `/admin/system/security` | Y | 2 |
| ADMIN | `A002` | TOP | 배출/인증 | Emissions & Certification | `#` | Y | 2 |
| ADMIN | `A0020102` | PAGE | 결과 상세 | Result Detail | `/admin/emission/result_detail` | Y | 2 |
| ADMIN | `A00202` | GROUP | 인증 | Certification | `#` | Y | 2 |
| ADMIN | `A0020202` | PAGE | 이의신청 처리 | Objection Handling | `/admin/certificate/objection_list` | Y | 2 |
| ADMIN | `A0020302` | PAGE | 승인자 이력 | Approver History | `/admin/certificate/pending_list` | Y | 2 |
| ADMIN | `A0030102` | PAGE | 거래 승인 | Trade Approval | `/admin/trade/approve` | Y | 2 |
| ADMIN | `A00302` | GROUP | 정산 | Settlement | `#` | Y | 2 |
| ADMIN | `A0030202` | PAGE | 정산 리포트 | Settlement Reports | `/admin/trade/statistics` | Y | 2 |
| ADMIN | `A0030302` | PAGE | 환불 처리 | Refund Processing | `/admin/payment/refund_process` | Y | 2 |
| ADMIN | `A0040102` | PAGE | 게시글 목록 | Post List | `/admin/content/post_list` | Y | 2 |
| ADMIN | `A00402` | GROUP | 가시요소 | Visual Elements | `#` | Y | 2 |
| ADMIN | `A0040202` | PAGE | 배너 편집 | Banner Edit | `/admin/content/banner_edit` | Y | 2 |
| ADMIN | `A0040302` | PAGE | Q&A 분류 | Q&A Categories | `/admin/content/qna` | Y | 2 |
| ADMIN | `A0050102` | PAGE | 연계 등록 | Integration Registration | `/admin/external/connection_add` | Y | 2 |
| ADMIN | `A00502` | GROUP | API | API | `#` | Y | 2 |
| ADMIN | `A0050202` | PAGE | API 사용량 | API Usage | `/admin/external/usage` | Y | 2 |
| ADMIN | `A0050302` | PAGE | 실패 재처리 | Retry Failures | `/admin/external/retry` | Y | 2 |
| ADMIN | `A0060102` | PAGE | 코드 관리 | Code Management | `/admin/system/code` | Y | 2 |
| ADMIN | `A0060202` | PAGE | 실시간 공격 현황 | Real-time Attack Monitoring | `/admin/system/security-monitoring` | Y | 2 |
| ADMIN | `A00603` | GROUP | 로그 | Logs | `#` | Y | 2 |
| ADMIN | `A0060302` | PAGE | 감사 로그 | Audit Logs | `/admin/system/audit-log` | Y | 2 |
| ADMIN | `A0060402` | PAGE | 백업 실행 | Run Backup | `/admin/system/backup` | Y | 2 |
| ADMIN | `A0070102` | PAGE | 운영센터 | Operations Center | `/admin/monitoring/center` | Y | 2 |
| ADMIN | `A00702` | GROUP | 센서 | Sensors | `#` | Y | 2 |
| ADMIN | `A0070202` | PAGE | 센서 등록 | Sensor Registration | `/admin/monitoring/sensor_add` | Y | 2 |
| ADMIN | `A0070302` | PAGE | 배치 성능 | Batch Performance | `/admin/system/batch` | Y | 2 |
| ADMIN | `A1900102` | PAGE | SR 워크벤치 | SR Workbench | `/admin/system/sr-workbench` | Y | 2 |
| ADMIN | `A0010103` | PAGE | 가입 승인 | Sign-up Approval | `/admin/member/approve` | Y | 3 |
| ADMIN | `A0010202` | PAGE | 가입 승인 | Sign-up Approval | `/admin/member/company-approve` | Y | 3 |
| ADMIN | `A00103` | GROUP | 관리자 | Admin Users | `#` | Y | 3 |
| ADMIN | `A0010403` | PAGE | 부서 권한 맵핑 | Department Permission Mapping | `/admin/member/dept-role-mapping` | Y | 3 |
| ADMIN | `A0010503` | PAGE | 비밀번호 초기화 이력 | Password Reset History | `/admin/member/reset_password` | Y | 3 |
| ADMIN | `A0020103` | PAGE | 데이터 변경 이력 | Data Change History | `/admin/emission/data_history` | Y | 3 |
| ADMIN | `A0020203` | PAGE | 인증서 통계 | Certificate Statistics | `/admin/certificate/statistics` | Y | 3 |
| ADMIN | `A00203` | GROUP | 감사 | Audit | `#` | Y | 3 |
| ADMIN | `A0020303` | PAGE | 반려 사유 관리 | Rejection Reason Management | `/admin/certificate/approve` | Y | 3 |
| ADMIN | `A003` | TOP | 거래/정산 | Trading & Settlement | `#` | Y | 3 |
| ADMIN | `A0030103` | PAGE | 거래 거절 | Trade Rejection | `/admin/trade/reject` | Y | 3 |
| ADMIN | `A0030203` | PAGE | 정산 캘린더 | Settlement Calendar | `/admin/payment/settlement` | Y | 3 |
| ADMIN | `A00303` | GROUP | 환불 | Refunds | `#` | Y | 3 |
| ADMIN | `A0030303` | PAGE | 환불 계좌 검수 | Refund Account Review | `/admin/payment/virtual_issue` | Y | 3 |
| ADMIN | `A0040103` | PAGE | 공지 배포 | Notice Distribution | `/admin/content/board_add` | Y | 3 |
| ADMIN | `A0040203` | PAGE | 팝업 목록 | Popup List | `/admin/content/popup_list` | Y | 3 |
| ADMIN | `A00403` | GROUP | 지원 | Support | `#` | Y | 3 |
| ADMIN | `A0040303` | PAGE | 태그 관리 | Tag Management | `/admin/content/tag` | Y | 3 |
| ADMIN | `A0050103` | PAGE | 연계 수정 | Integration Edit | `/admin/external/connection_edit` | Y | 3 |
| ADMIN | `A0050203` | PAGE | 웹훅 설정 | Webhook Settings | `/admin/external/webhooks` | Y | 3 |
| ADMIN | `A00503` | GROUP | 운영 | Operations | `#` | Y | 3 |
| ADMIN | `A0050303` | PAGE | 연계 로그 | Integration Logs | `/admin/external/logs` | Y | 3 |
| ADMIN | `A0060118` | PAGE | 메뉴 통합 관리 | Menu Unified Management | `/admin/system/environment-management` | Y | 3 |
| ADMIN | `A0060203` | PAGE | 차단 대상 관리 | Blocklist Management | `/admin/system/blocklist` | Y | 3 |
| ADMIN | `A0060303` | PAGE | 에러 로그 | Error Logs | `/admin/system/error_log` | Y | 3 |
| ADMIN | `A00604` | GROUP | 백업 | Backup | `#` | Y | 3 |
| ADMIN | `A0060403` | PAGE | 복구 실행 | Run Restore | `/admin/system/restore` | Y | 3 |
| ADMIN | `A0070103` | PAGE | 알림센터 | Alert Center | `/admin/system/notification` | Y | 3 |
| ADMIN | `A0070203` | PAGE | 센서 설정 | Sensor Settings | `/admin/monitoring/sensor_edit` | Y | 3 |
| ADMIN | `A00703` | GROUP | 성능 | Performance | `#` | Y | 3 |
| ADMIN | `A0070303` | PAGE | 리소스 사용량 | Resource Usage | `/admin/system/infra` | Y | 3 |
| ADMIN | `A0010104` | PAGE | 회원 수정 | Member Edit | `/admin/member/edit` | Y | 4 |
| ADMIN | `A00104` | GROUP | 권한 | Permissions | `#` | Y | 4 |
| ADMIN | `A0020104` | PAGE | 검증 관리 | Verification Management | `/admin/emission/validate` | Y | 4 |
| ADMIN | `A0020204` | PAGE | REC 중복 확인 | REC Duplicate Check | `/admin/certificate/rec_check` | Y | 4 |
| ADMIN | `A0030104` | PAGE | 이상거래 점검 | Abnormal Trade Review | `/admin/trade/duplicate` | Y | 4 |
| ADMIN | `A004` | TOP | 콘텐츠 | Content | `#` | Y | 4 |
| ADMIN | `A0040104` | PAGE | 첨부파일 관리 | Attachment Management | `/admin/content/file` | Y | 4 |
| ADMIN | `A0040204` | PAGE | 팝업 스케줄 | Popup Schedule | `/admin/content/popup_edit` | Y | 4 |
| ADMIN | `A0040304` | PAGE | 메뉴 관리 | Menu Management | `/admin/content/menu` | Y | 4 |
| ADMIN | `A0050104` | PAGE | 동기화 실행 | Run Synchronization | `/admin/external/sync` | Y | 4 |
| ADMIN | `A0050204` | PAGE | 스키마 맵핑 | Schema Mapping | `/admin/external/schema` | Y | 4 |
| ADMIN | `A0050304` | PAGE | 점검 모드 | Maintenance Mode | `/admin/external/maintenance` | Y | 4 |
| ADMIN | `A0060107` | PAGE | 메뉴 관리 | Menu Management | `/admin/system/menu-management` | Y | 4 |
| ADMIN | `A00602` | GROUP | 보안운영 | Security Operations | `#` | Y | 4 |
| ADMIN | `A0060204` | PAGE | IP 화이트리스트 | IP Whitelist | `/admin/system/ip_whitelist` | Y | 4 |
| ADMIN | `A0060304` | PAGE | 통합 로그 | Unified Logs | `/admin/system/unified_log` | Y | 4 |
| ADMIN | `A0060404` | PAGE | 버전 관리 | Version Management | `/admin/system/version` | Y | 4 |
| ADMIN | `A0010105` | PAGE | 회원 상세 | Member Detail | `/admin/member/detail` | Y | 5 |
| ADMIN | `A00105` | GROUP | 이력 | History | `#` | Y | 5 |
| ADMIN | `A005` | TOP | 외부연계 | Integrations | `#` | Y | 5 |
| ADMIN | `A0060105` | PAGE | 페이지 관리 | Page Management | `/admin/system/page-management` | Y | 5 |
| ADMIN | `A0060205` | PAGE | 접근 차단 이력 | Access Block History | `/admin/system/security` | Y | 5 |
| ADMIN | `A0010106` | PAGE | 탈퇴 회원 | Withdrawn Members | `/admin/member/withdrawn` | Y | 6 |
| ADMIN | `A006` | TOP | 시스템 | System | `#` | Y | 6 |
| ADMIN | `A0060106` | PAGE | 기능 관리 | Feature Management | `/admin/system/feature-management` | Y | 6 |
| ADMIN | `A0060206` | PAGE | 보안 감사 로그 | Security Audit Log | `/admin/system/security-audit` | Y | 6 |
| ADMIN | `A0010107` | PAGE | 휴면 계정 | Dormant Accounts | `/admin/member/activate` | Y | 7 |
| ADMIN | `A0060103` | PAGE | 모듈 관리 | Module Management | `/admin/system/module` | Y | 7 |
| ADMIN | `A007` | TOP | 모니터링 | Monitoring | `#` | Y | 7 |
| ADMIN | `A0060104` | PAGE | 테마 관리 | Theme Management | `/admin/system/theme` | Y | 8 |
| ADMIN | `A101` | TOP | 시스템관리 | System Management |  | Y | 8 |
| ADMIN | `A0060108` | PAGE | 풀스택 관리 | Full-Stack Management | `/admin/system/full-stack-management` | Y | 9 |
| ADMIN | `A190` | TOP | AI 운영 | AI Operations |  | Y | 9 |
| ADMIN | `A0060109` | PAGE | 플랫폼 스튜디오 | Platform Studio | `/admin/system/platform-studio` | Y | 10 |
| ADMIN | `A0060110` | PAGE | 화면 요소 관리 | Screen Elements Management | `/admin/system/screen-elements-management` | Y | 11 |
| ADMIN | `A0060111` | PAGE | 이벤트 관리 | Event Management | `/admin/system/event-management-console` | Y | 12 |
| ADMIN | `A0060112` | PAGE | 함수 콘솔 | Function Console | `/admin/system/function-management-console` | Y | 13 |
| ADMIN | `A0060113` | PAGE | API 관리 | API Management | `/admin/system/api-management-console` | Y | 14 |
| ADMIN | `A0060114` | PAGE | 컨트롤러 관리 | Controller Management | `/admin/system/controller-management-console` | Y | 15 |
| ADMIN | `A0060115` | PAGE | DB 테이블 관리 | DB Table Management | `/admin/system/db-table-management` | Y | 16 |
| ADMIN | `A0060116` | PAGE | 컬럼 관리 | Column Management | `/admin/system/column-management-console` | Y | 17 |
| ADMIN | `A0060117` | PAGE | 자동화 스튜디오 | Automation Studio | `/admin/system/automation-studio` | Y | 18 |

## 4. 추천 작업 순서

### HOME

- Wave 5. 공개 기타: `H0010101`, `H0010102`, `H0010103`, `H0010104`, `H0010201`, `H0010202`, `H0010203`, `H0010204`, `H0020101`, `H0020102`, `H0020103`, `H0020104`, `H0020201`, `H0020202`, `H0020203`, `H0020204`, `H0030101`, `H0030102`, `H0030103`, `H0030104`, `H0030201`, `H0030202`, `H0030203`, `H0030204`, `H0040101`, `H0040102`, `H0040103`, `H0040104`, `H0040201`, `H0040202`, `H0040203`, `H0040204`, `H0050101`, `H0050102`, `H0050103`, `H0050104`, `H0050201`, `H0050202`, `H0050203`, `H0050204`, `H0060101`, `H0060102`, `H0060103`, `H0060104`, `H0060201`, `H0060202`, `H0060203`, `H0060204`, `H0070101`, `H0070102`, `H0070103`, `H0070104`, `H0070201`, `H0070202`, `H0070203`, `H0070204`, `H0080101`, `H0080102`, `H0080103`, `H0080104`, `H0080201`, `H0080202`, `H0080203`, `H0080204`, `H0090101`, `H0090102`, `H0090103`, `H0090104`, `H0090201`, `H0090202`, `H0090203`, `H0090204`

### ADMIN

- Wave 3. 회원/회원사 운영: `A0010101`, `A0010201`, `A0010301`, `A0010501`, `A0020101`, `A0010102`, `A0010203`, `A0020102`, `A0010103`, `A0010202`, `A0010503`, `A0020103`, `A0010104`, `A0020104`, `A0010105`, `A0010106`, `A0010107`
- Wave 6. 기타 관리자: `A0010401`, `A0020201`, `A0020301`, `A0030101`, `A0030201`, `A0030301`, `A0040101`, `A0040201`, `A0040301`, `A0050101`, `A0050201`, `A0050301`, `A0060101`, `A0060301`, `A0060401`, `A0070101`, `A0070201`, `A0070301`, `A0020202`, `A0020302`, `A0030102`, `A0030202`, `A0030302`, `A0040102`, `A0040202`, `A0040302`, `A0050102`, `A0050202`, `A0050302`, `A0060302`, `A0060402`, `A0070102`, `A0070202`, `A0070302`, `A0020203`, `A0020303`, `A0030103`, `A0030203`, `A0030303`, `A0040103`, `A0040203`, `A0040303`, `A0050103`, `A0050203`, `A0050303`, `A0060303`, `A0060403`, `A0070103`, `A0070203`, `A0070303`, `A0020204`, `A0030104`, `A0040104`, `A0040204`, `A0040304`, `A0050104`, `A0050204`, `A0050304`, `A0060304`, `A0060404`, `A0060106`, `A0060103`, `A0060104`
- Wave 4. 시스템 운영: `A0060201`, `A1010201`, `A0010502`, `A0060102`, `A0060202`, `A0060203`, `A0060204`, `A0060205`, `A0060206`
- Wave 5. 플랫폼/거버넌스: `A1900101`, `A1900102`, `A0060118`, `A0060107`, `A0060105`, `A0060108`, `A0060109`, `A0060110`, `A0060111`, `A0060112`, `A0060113`, `A0060114`, `A0060115`, `A0060116`, `A0060117`
- Wave 2. 권한/계정: `A0010302`, `A0010402`, `A0010403`


## 5. 실행용 WBS

| WBS | Scope | Wave | 메뉴코드 | 메뉴명 | URL | 작업유형 | 산출물 | 선행조건 | 우선순위 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A2.01 | ADMIN | Wave 2. 권한/계정 | `A0010302` | 관리자 계정 생성 | `/admin/member/admin_account` | 관리자 권한체계 | 권한/계정 저장-조회 검증표 | Wave 1 | 높음 |
| A2.02 | ADMIN | Wave 2. 권한/계정 | `A0010402` | 권한 변경 | `/admin/member/auth-change` | 관리자 권한체계 | 권한/계정 저장-조회 검증표 | Wave 1 | 높음 |
| A2.03 | ADMIN | Wave 2. 권한/계정 | `A0010403` | 부서 권한 맵핑 | `/admin/member/dept-role-mapping` | 관리자 권한체계 | 권한/계정 저장-조회 검증표 | Wave 1 | 높음 |
| A3.01 | ADMIN | Wave 3. 회원/회원사 운영 | `A0010101` | 회원 목록 | `/admin/member/list` | 회원/회원사 핵심 운영 | 목록-상세-수정-승인 흐름표 | Wave 2 | 높음 |
| A3.06 | ADMIN | Wave 3. 회원/회원사 운영 | `A0010102` | 신규 회원 등록 | `/admin/member/company_account` | 회원/회원사 핵심 운영 | 목록-상세-수정-승인 흐름표 | Wave 2 | 높음 |
| A3.09 | ADMIN | Wave 3. 회원/회원사 운영 | `A0010103` | 가입 승인 | `/admin/member/approve` | 회원/회원사 핵심 운영 | 목록-상세-수정-승인 흐름표 | Wave 2 | 높음 |
| A3.13 | ADMIN | Wave 3. 회원/회원사 운영 | `A0010104` | 회원 수정 | `/admin/member/edit` | 회원/회원사 핵심 운영 | 목록-상세-수정-승인 흐름표 | Wave 2 | 높음 |
| A3.15 | ADMIN | Wave 3. 회원/회원사 운영 | `A0010105` | 회원 상세 | `/admin/member/detail` | 회원/회원사 핵심 운영 | 목록-상세-수정-승인 흐름표 | Wave 2 | 높음 |
| A3.16 | ADMIN | Wave 3. 회원/회원사 운영 | `A0010106` | 탈퇴 회원 | `/admin/member/withdrawn` | 회원/회원사 핵심 운영 | 목록-상세-수정-승인 흐름표 | Wave 2 | 높음 |
| A3.17 | ADMIN | Wave 3. 회원/회원사 운영 | `A0010107` | 휴면 계정 | `/admin/member/activate` | 회원/회원사 핵심 운영 | 목록-상세-수정-승인 흐름표 | Wave 2 | 높음 |
| A3.02 | ADMIN | Wave 3. 회원/회원사 운영 | `A0010201` | 회원사 목록 | `/admin/member/company_list` | 회원/회원사 핵심 운영 | 목록-상세-수정-승인 흐름표 | Wave 2 | 높음 |
| A3.10 | ADMIN | Wave 3. 회원/회원사 운영 | `A0010202` | 가입 승인 | `/admin/member/company-approve` | 회원/회원사 핵심 운영 | 목록-상세-수정-승인 흐름표 | Wave 2 | 높음 |
| A3.07 | ADMIN | Wave 3. 회원/회원사 운영 | `A0010203` | 회원사 추가 | `/admin/member/company_account` | 회원/회원사 핵심 운영 | 목록-상세-수정-승인 흐름표 | Wave 2 | 높음 |
| A3.03 | ADMIN | Wave 3. 회원/회원사 운영 | `A0010301` | 회원 목록 | `/admin/member/admin_list` | 회원/회원사 핵심 운영 | 목록-상세-수정-승인 흐름표 | Wave 2 | 높음 |
| A3.04 | ADMIN | Wave 3. 회원/회원사 운영 | `A0010501` | 로그인 이력 | `/admin/member/login_history` | 회원/회원사 핵심 운영 | 목록-상세-수정-승인 흐름표 | Wave 2 | 높음 |
| A3.11 | ADMIN | Wave 3. 회원/회원사 운영 | `A0010503` | 비밀번호 초기화 이력 | `/admin/member/reset_password` | 회원/회원사 핵심 운영 | 목록-상세-수정-승인 흐름표 | Wave 2 | 높음 |
| A3.05 | ADMIN | Wave 3. 회원/회원사 운영 | `A0020101` | 산정 결과 목록 | `/admin/emission/result_list` | 회원/회원사 핵심 운영 | 목록-상세-수정-승인 흐름표 | Wave 2 | 높음 |
| A3.08 | ADMIN | Wave 3. 회원/회원사 운영 | `A0020102` | 결과 상세 | `/admin/emission/result_detail` | 회원/회원사 핵심 운영 | 목록-상세-수정-승인 흐름표 | Wave 2 | 높음 |
| A3.12 | ADMIN | Wave 3. 회원/회원사 운영 | `A0020103` | 데이터 변경 이력 | `/admin/emission/data_history` | 회원/회원사 핵심 운영 | 목록-상세-수정-승인 흐름표 | Wave 2 | 높음 |
| A3.14 | ADMIN | Wave 3. 회원/회원사 운영 | `A0020104` | 검증 관리 | `/admin/emission/validate` | 회원/회원사 핵심 운영 | 목록-상세-수정-승인 흐름표 | Wave 2 | 높음 |
| A4.03 | ADMIN | Wave 4. 시스템 운영 | `A0010502` | 접근 차단 이력 | `/admin/system/security` | 보안/운영 | 정책/감사/운영 점검표 | Wave 3 | 중간 |
| A4.04 | ADMIN | Wave 4. 시스템 운영 | `A0060102` | 코드 관리 | `/admin/system/code` | 보안/운영 | 정책/감사/운영 점검표 | Wave 3 | 중간 |
| A4.01 | ADMIN | Wave 4. 시스템 운영 | `A0060201` | 보안 정책 관리 | `/admin/system/security-policy` | 보안/운영 | 정책/감사/운영 점검표 | Wave 3 | 중간 |
| A4.05 | ADMIN | Wave 4. 시스템 운영 | `A0060202` | 실시간 공격 현황 | `/admin/system/security-monitoring` | 보안/운영 | 정책/감사/운영 점검표 | Wave 3 | 중간 |
| A4.06 | ADMIN | Wave 4. 시스템 운영 | `A0060203` | 차단 대상 관리 | `/admin/system/blocklist` | 보안/운영 | 정책/감사/운영 점검표 | Wave 3 | 중간 |
| A4.07 | ADMIN | Wave 4. 시스템 운영 | `A0060204` | IP 화이트리스트 | `/admin/system/ip_whitelist` | 보안/운영 | 정책/감사/운영 점검표 | Wave 3 | 중간 |
| A4.08 | ADMIN | Wave 4. 시스템 운영 | `A0060205` | 접근 차단 이력 | `/admin/system/security` | 보안/운영 | 정책/감사/운영 점검표 | Wave 3 | 중간 |
| A4.09 | ADMIN | Wave 4. 시스템 운영 | `A0060206` | 보안 감사 로그 | `/admin/system/security-audit` | 보안/운영 | 정책/감사/운영 점검표 | Wave 3 | 중간 |
| A4.02 | ADMIN | Wave 4. 시스템 운영 | `A1010201` | Codex 요청 관리 | `/admin/system/codex-request` | 보안/운영 | 정책/감사/운영 점검표 | Wave 3 | 중간 |
| A5.05 | ADMIN | Wave 5. 플랫폼/거버넌스 | `A0060105` | 페이지 관리 | `/admin/system/page-management` | 메타/플랫폼 관리 | 거버넌스/도구 메뉴 점검표 | Wave 4 | 중간 |
| A5.04 | ADMIN | Wave 5. 플랫폼/거버넌스 | `A0060107` | 메뉴 관리 | `/admin/system/menu-management` | 메타/플랫폼 관리 | 거버넌스/도구 메뉴 점검표 | Wave 4 | 중간 |
| A5.06 | ADMIN | Wave 5. 플랫폼/거버넌스 | `A0060108` | 풀스택 관리 | `/admin/system/full-stack-management` | 메타/플랫폼 관리 | 거버넌스/도구 메뉴 점검표 | Wave 4 | 중간 |
| A5.07 | ADMIN | Wave 5. 플랫폼/거버넌스 | `A0060109` | 플랫폼 스튜디오 | `/admin/system/platform-studio` | 메타/플랫폼 관리 | 거버넌스/도구 메뉴 점검표 | Wave 4 | 중간 |
| A5.08 | ADMIN | Wave 5. 플랫폼/거버넌스 | `A0060110` | 화면 요소 관리 | `/admin/system/screen-elements-management` | 메타/플랫폼 관리 | 거버넌스/도구 메뉴 점검표 | Wave 4 | 중간 |
| A5.09 | ADMIN | Wave 5. 플랫폼/거버넌스 | `A0060111` | 이벤트 관리 | `/admin/system/event-management-console` | 메타/플랫폼 관리 | 거버넌스/도구 메뉴 점검표 | Wave 4 | 중간 |
| A5.10 | ADMIN | Wave 5. 플랫폼/거버넌스 | `A0060112` | 함수 콘솔 | `/admin/system/function-management-console` | 메타/플랫폼 관리 | 거버넌스/도구 메뉴 점검표 | Wave 4 | 중간 |
| A5.11 | ADMIN | Wave 5. 플랫폼/거버넌스 | `A0060113` | API 관리 | `/admin/system/api-management-console` | 메타/플랫폼 관리 | 거버넌스/도구 메뉴 점검표 | Wave 4 | 중간 |
| A5.12 | ADMIN | Wave 5. 플랫폼/거버넌스 | `A0060114` | 컨트롤러 관리 | `/admin/system/controller-management-console` | 메타/플랫폼 관리 | 거버넌스/도구 메뉴 점검표 | Wave 4 | 중간 |
| A5.13 | ADMIN | Wave 5. 플랫폼/거버넌스 | `A0060115` | DB 테이블 관리 | `/admin/system/db-table-management` | 메타/플랫폼 관리 | 거버넌스/도구 메뉴 점검표 | Wave 4 | 중간 |
| A5.14 | ADMIN | Wave 5. 플랫폼/거버넌스 | `A0060116` | 컬럼 관리 | `/admin/system/column-management-console` | 메타/플랫폼 관리 | 거버넌스/도구 메뉴 점검표 | Wave 4 | 중간 |
| A5.15 | ADMIN | Wave 5. 플랫폼/거버넌스 | `A0060117` | 자동화 스튜디오 | `/admin/system/automation-studio` | 메타/플랫폼 관리 | 거버넌스/도구 메뉴 점검표 | Wave 4 | 중간 |
| A5.03 | ADMIN | Wave 5. 플랫폼/거버넌스 | `A0060118` | 메뉴 통합 관리 | `/admin/system/environment-management` | 메타/플랫폼 관리 | 거버넌스/도구 메뉴 점검표 | Wave 4 | 중간 |
| A5.01 | ADMIN | Wave 5. 플랫폼/거버넌스 | `A1900101` | 화면 도움말 운영 | `/admin/system/help-management` | 메타/플랫폼 관리 | 거버넌스/도구 메뉴 점검표 | Wave 4 | 중간 |
| A5.02 | ADMIN | Wave 5. 플랫폼/거버넌스 | `A1900102` | SR 워크벤치 | `/admin/system/sr-workbench` | 메타/플랫폼 관리 | 거버넌스/도구 메뉴 점검표 | Wave 4 | 중간 |
| H5.01 | HOME | Wave 5. 공개 기타 | `H0010101` | 배출량 관리 | `emission/project_list` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.02 | HOME | Wave 5. 공개 기타 | `H0010102` | 데이터 입력 | `emission/data_input` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.03 | HOME | Wave 5. 공개 기타 | `H0010103` | 산정/검증 | `emission/validate` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.04 | HOME | Wave 5. 공개 기타 | `H0010104` | 보고서 제출 | `emission/report_submit` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.05 | HOME | Wave 5. 공개 기타 | `H0010201` | LCA 분석 | `emission/lca` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.06 | HOME | Wave 5. 공개 기타 | `H0010202` | LCI DB 조회 | `emission/lci` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.07 | HOME | Wave 5. 공개 기타 | `H0010203` | 감축 시나리오 | `emission/reduction` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.08 | HOME | Wave 5. 공개 기타 | `H0010204` | 시뮬레이션 | `emission/simulate` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.09 | HOME | Wave 5. 공개 기타 | `H0020101` | 보고서 목록 | `certificate/report_list` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.10 | HOME | Wave 5. 공개 기타 | `H0020102` | 보고서 작성 | `certificate/report_form` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.11 | HOME | Wave 5. 공개 기타 | `H0020103` | 수정/재제출 | `certificate/report_edit` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.12 | HOME | Wave 5. 공개 기타 | `H0020104` | 처리 상태 | `certificate/index` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.13 | HOME | Wave 5. 공개 기타 | `H0020201` | 인증서 신청 | `certificate/apply` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.14 | HOME | Wave 5. 공개 기타 | `H0020202` | 인증서 목록 | `certificate/list` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.15 | HOME | Wave 5. 공개 기타 | `H0020203` | 재발급 | `certificate/reissue` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.16 | HOME | Wave 5. 공개 기타 | `H0020204` | 인증서 검증 | `certificate/verify` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.17 | HOME | Wave 5. 공개 기타 | `H0030101` | 생산 정보 | `co2/production_list` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.18 | HOME | Wave 5. 공개 기타 | `H0030102` | 수요 정보 | `co2/demand_list` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.19 | HOME | Wave 5. 공개 기타 | `H0030103` | 무결성 추적 | `co2/integrity` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.20 | HOME | Wave 5. 공개 기타 | `H0030104` | 크레딧 조회 | `co2/credits` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.21 | HOME | Wave 5. 공개 기타 | `H0030201` | 플랫폼 매칭 | `trade/matching` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.22 | HOME | Wave 5. 공개 기타 | `H0030202` | 품질지표 | `co2/analysis` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.23 | HOME | Wave 5. 공개 기타 | `H0030203` | MRV 정보 | `co2/search` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.24 | HOME | Wave 5. 공개 기타 | `H0030204` | 추적 리포트 | `monitoring/track` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.25 | HOME | Wave 5. 공개 기타 | `H0040101` | 거래 목록 | `trade/list` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.26 | HOME | Wave 5. 공개 기타 | `H0040102` | 구매 요청 | `trade/buy_request` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.27 | HOME | Wave 5. 공개 기타 | `H0040103` | 판매 등록 | `trade/sell` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.28 | HOME | Wave 5. 공개 기타 | `H0040104` | 체결 현황 | `trade/complete` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.29 | HOME | Wave 5. 공개 기타 | `H0040201` | 시장 동향 | `trade/market` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.30 | HOME | Wave 5. 공개 기타 | `H0040202` | 가격 알림 | `trade/price_alert` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.31 | HOME | Wave 5. 공개 기타 | `H0040203` | 자동 매칭 | `trade/auto_order` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.32 | HOME | Wave 5. 공개 기타 | `H0040204` | 거래 리포트 | `trade/report` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.33 | HOME | Wave 5. 공개 기타 | `H0050101` | 통합 대시보드 | `monitoring/dashboard` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.34 | HOME | Wave 5. 공개 기타 | `H0050102` | 실시간 모니터링 | `monitoring/realtime` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.35 | HOME | Wave 5. 공개 기타 | `H0050103` | 성과 추이 | `monitoring/reduction_trend` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.36 | HOME | Wave 5. 공개 기타 | `H0050104` | 경보 현황 | `monitoring/alerts` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.37 | HOME | Wave 5. 공개 기타 | `H0050201` | 통계 자료 | `monitoring/statistics` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.38 | HOME | Wave 5. 공개 기타 | `H0050202` | ESG 보고서 | `monitoring/esg` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.39 | HOME | Wave 5. 공개 기타 | `H0050203` | 이해관계자 공유 | `monitoring/share` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.40 | HOME | Wave 5. 공개 기타 | `H0050204` | 내보내기 | `monitoring/export` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.41 | HOME | Wave 5. 공개 기타 | `H0060101` | 결제 내역 | `payment/history` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.42 | HOME | Wave 5. 공개 기타 | `H0060102` | 결제 요청 | `payment/pay` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.43 | HOME | Wave 5. 공개 기타 | `H0060103` | 가상계좌 | `payment/virtual_account` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.44 | HOME | Wave 5. 공개 기타 | `H0060104` | 영수증 | `payment/receipt` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.45 | HOME | Wave 5. 공개 기타 | `H0060201` | 환불 요청 | `payment/refund` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.46 | HOME | Wave 5. 공개 기타 | `H0060202` | 환불 계좌 | `payment/refund_account` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.47 | HOME | Wave 5. 공개 기타 | `H0060203` | 정산 내역 | `payment/detail` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.48 | HOME | Wave 5. 공개 기타 | `H0060204` | 세금계산서 | `payment/notify` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.49 | HOME | Wave 5. 공개 기타 | `H0070101` | 교육 과정 목록 | `edu/course_list` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.50 | HOME | Wave 5. 공개 기타 | `H0070102` | 과정 상세 | `edu/course_detail` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.51 | HOME | Wave 5. 공개 기타 | `H0070103` | 교육 신청 | `edu/apply` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.52 | HOME | Wave 5. 공개 기타 | `H0070104` | 나의 교육 | `edu/my_course` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.53 | HOME | Wave 5. 공개 기타 | `H0070201` | 진도 관리 | `edu/progress` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.54 | HOME | Wave 5. 공개 기타 | `H0070202` | 설문 | `edu/survey` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.55 | HOME | Wave 5. 공개 기타 | `H0070203` | 수료증 | `edu/certificate` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.56 | HOME | Wave 5. 공개 기타 | `H0070204` | 자격 연계 | `edu/content` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.57 | HOME | Wave 5. 공개 기타 | `H0080101` | 내 정보 | `mypage/profile` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.58 | HOME | Wave 5. 공개 기타 | `H0080102` | 기업 정보 | `mypage/company` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.59 | HOME | Wave 5. 공개 기타 | `H0080103` | 담당자 관리 | `mypage/staff` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.60 | HOME | Wave 5. 공개 기타 | `H0080104` | 알림 설정 | `mypage/notification` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.61 | HOME | Wave 5. 공개 기타 | `H0080201` | 비밀번호 변경 | `mypage/password` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.62 | HOME | Wave 5. 공개 기타 | `H0080202` | 이메일/전화 변경 | `mypage/email` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.63 | HOME | Wave 5. 공개 기타 | `H0080203` | 보안 설정 | `mypage/index` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.64 | HOME | Wave 5. 공개 기타 | `H0080204` | 마케팅 수신 | `mypage/marketing` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.65 | HOME | Wave 5. 공개 기타 | `H0090101` | 공지사항 | `support/notice_list` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.66 | HOME | Wave 5. 공개 기타 | `H0090102` | FAQ | `support/faq` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.67 | HOME | Wave 5. 공개 기타 | `H0090103` | Q&A | `support/qna_list` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.68 | HOME | Wave 5. 공개 기타 | `H0090104` | 자료실 | `support/download_list` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.69 | HOME | Wave 5. 공개 기타 | `H0090201` | 1:1 문의 | `support/inquiry` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.70 | HOME | Wave 5. 공개 기타 | `H0090202` | 나의 문의 내역 | `mtn/my_inquiry` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.71 | HOME | Wave 5. 공개 기타 | `H0090203` | 서비스 상태 | `mtn/status` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| H5.72 | HOME | Wave 5. 공개 기타 | `H0090204` | 버전 정보 | `mtn/version` | 공개 기타 메뉴 | 메뉴별 readiness 점검표 | Wave 1 | 중간 |
| A6.01 | ADMIN | Wave 6. 기타 관리자 | `A0010401` | 권한 그룹 | `/admin/auth/group` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.02 | ADMIN | Wave 6. 기타 관리자 | `A0020201` | 발급 검토 | `/admin/certificate/review` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.19 | ADMIN | Wave 6. 기타 관리자 | `A0020202` | 이의신청 처리 | `/admin/certificate/objection_list` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.35 | ADMIN | Wave 6. 기타 관리자 | `A0020203` | 인증서 통계 | `/admin/certificate/statistics` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.51 | ADMIN | Wave 6. 기타 관리자 | `A0020204` | REC 중복 확인 | `/admin/certificate/rec_check` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.03 | ADMIN | Wave 6. 기타 관리자 | `A0020301` | 감사 로그 | `/admin/certificate/audit-log` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.20 | ADMIN | Wave 6. 기타 관리자 | `A0020302` | 승인자 이력 | `/admin/certificate/pending_list` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.36 | ADMIN | Wave 6. 기타 관리자 | `A0020303` | 반려 사유 관리 | `/admin/certificate/approve` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.04 | ADMIN | Wave 6. 기타 관리자 | `A0030101` | 거래 목록 | `/admin/trade/list` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.21 | ADMIN | Wave 6. 기타 관리자 | `A0030102` | 거래 승인 | `/admin/trade/approve` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.37 | ADMIN | Wave 6. 기타 관리자 | `A0030103` | 거래 거절 | `/admin/trade/reject` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.52 | ADMIN | Wave 6. 기타 관리자 | `A0030104` | 이상거래 점검 | `/admin/trade/duplicate` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.05 | ADMIN | Wave 6. 기타 관리자 | `A0030201` | 수수료 설정 | `/admin/payment/commission` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.22 | ADMIN | Wave 6. 기타 관리자 | `A0030202` | 정산 리포트 | `/admin/trade/statistics` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.38 | ADMIN | Wave 6. 기타 관리자 | `A0030203` | 정산 캘린더 | `/admin/payment/settlement` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.06 | ADMIN | Wave 6. 기타 관리자 | `A0030301` | 환불 요청 목록 | `/admin/payment/refund_list` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.23 | ADMIN | Wave 6. 기타 관리자 | `A0030302` | 환불 처리 | `/admin/payment/refund_process` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.39 | ADMIN | Wave 6. 기타 관리자 | `A0030303` | 환불 계좌 검수 | `/admin/payment/virtual_issue` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.07 | ADMIN | Wave 6. 기타 관리자 | `A0040101` | 게시판 관리 | `/admin/content/board_list` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.24 | ADMIN | Wave 6. 기타 관리자 | `A0040102` | 게시글 목록 | `/admin/content/post_list` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.40 | ADMIN | Wave 6. 기타 관리자 | `A0040103` | 공지 배포 | `/admin/content/board_add` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.53 | ADMIN | Wave 6. 기타 관리자 | `A0040104` | 첨부파일 관리 | `/admin/content/file` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.08 | ADMIN | Wave 6. 기타 관리자 | `A0040201` | 배너 목록 | `/admin/content/banner_list` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.25 | ADMIN | Wave 6. 기타 관리자 | `A0040202` | 배너 편집 | `/admin/content/banner_edit` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.41 | ADMIN | Wave 6. 기타 관리자 | `A0040203` | 팝업 목록 | `/admin/content/popup_list` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.54 | ADMIN | Wave 6. 기타 관리자 | `A0040204` | 팝업 스케줄 | `/admin/content/popup_edit` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.09 | ADMIN | Wave 6. 기타 관리자 | `A0040301` | FAQ 관리 | `/admin/content/faq_list` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.26 | ADMIN | Wave 6. 기타 관리자 | `A0040302` | Q&A 분류 | `/admin/content/qna` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.42 | ADMIN | Wave 6. 기타 관리자 | `A0040303` | 태그 관리 | `/admin/content/tag` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.55 | ADMIN | Wave 6. 기타 관리자 | `A0040304` | 메뉴 관리 | `/admin/content/menu` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.10 | ADMIN | Wave 6. 기타 관리자 | `A0050101` | 연계 목록 | `/admin/external/connection_list` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.27 | ADMIN | Wave 6. 기타 관리자 | `A0050102` | 연계 등록 | `/admin/external/connection_add` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.43 | ADMIN | Wave 6. 기타 관리자 | `A0050103` | 연계 수정 | `/admin/external/connection_edit` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.56 | ADMIN | Wave 6. 기타 관리자 | `A0050104` | 동기화 실행 | `/admin/external/sync` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.11 | ADMIN | Wave 6. 기타 관리자 | `A0050201` | API 키 | `/admin/external/keys` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.28 | ADMIN | Wave 6. 기타 관리자 | `A0050202` | API 사용량 | `/admin/external/usage` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.44 | ADMIN | Wave 6. 기타 관리자 | `A0050203` | 웹훅 설정 | `/admin/external/webhooks` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.57 | ADMIN | Wave 6. 기타 관리자 | `A0050204` | 스키마 맵핑 | `/admin/external/schema` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.12 | ADMIN | Wave 6. 기타 관리자 | `A0050301` | 연계 모니터링 | `/admin/external/monitoring` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.29 | ADMIN | Wave 6. 기타 관리자 | `A0050302` | 실패 재처리 | `/admin/external/retry` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.45 | ADMIN | Wave 6. 기타 관리자 | `A0050303` | 연계 로그 | `/admin/external/logs` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.58 | ADMIN | Wave 6. 기타 관리자 | `A0050304` | 점검 모드 | `/admin/external/maintenance` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.13 | ADMIN | Wave 6. 기타 관리자 | `A0060101` | 환경설정 | `/admin/system/config` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.62 | ADMIN | Wave 6. 기타 관리자 | `A0060103` | 모듈 관리 | `/admin/system/module` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.63 | ADMIN | Wave 6. 기타 관리자 | `A0060104` | 테마 관리 | `/admin/system/theme` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.61 | ADMIN | Wave 6. 기타 관리자 | `A0060106` | 기능 관리 | `/admin/system/feature-management` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.14 | ADMIN | Wave 6. 기타 관리자 | `A0060301` | 접속 로그 | `/admin/system/access_history` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.30 | ADMIN | Wave 6. 기타 관리자 | `A0060302` | 감사 로그 | `/admin/system/audit-log` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.46 | ADMIN | Wave 6. 기타 관리자 | `A0060303` | 에러 로그 | `/admin/system/error_log` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.59 | ADMIN | Wave 6. 기타 관리자 | `A0060304` | 통합 로그 | `/admin/system/unified_log` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.15 | ADMIN | Wave 6. 기타 관리자 | `A0060401` | 백업 설정 | `/admin/system/backup_config` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.31 | ADMIN | Wave 6. 기타 관리자 | `A0060402` | 백업 실행 | `/admin/system/backup` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.47 | ADMIN | Wave 6. 기타 관리자 | `A0060403` | 복구 실행 | `/admin/system/restore` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.60 | ADMIN | Wave 6. 기타 관리자 | `A0060404` | 버전 관리 | `/admin/system/version` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.16 | ADMIN | Wave 6. 기타 관리자 | `A0070101` | 통합 대시보드 | `/admin/monitoring/index` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.32 | ADMIN | Wave 6. 기타 관리자 | `A0070102` | 운영센터 | `/admin/monitoring/center` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.48 | ADMIN | Wave 6. 기타 관리자 | `A0070103` | 알림센터 | `/admin/system/notification` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.17 | ADMIN | Wave 6. 기타 관리자 | `A0070201` | 센서 목록 | `/admin/monitoring/sensor_list` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.33 | ADMIN | Wave 6. 기타 관리자 | `A0070202` | 센서 등록 | `/admin/monitoring/sensor_add` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.49 | ADMIN | Wave 6. 기타 관리자 | `A0070203` | 센서 설정 | `/admin/monitoring/sensor_edit` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.18 | ADMIN | Wave 6. 기타 관리자 | `A0070301` | 응답속도 | `/admin/system/performance` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.34 | ADMIN | Wave 6. 기타 관리자 | `A0070302` | 배치 성능 | `/admin/system/batch` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |
| A6.50 | ADMIN | Wave 6. 기타 관리자 | `A0070303` | 리소스 사용량 | `/admin/system/infra` | 기타 관리자 메뉴 | 개별 메뉴 readiness 점검표 | Wave 3 | 낮음 |

## 6. 작성 규칙

- 이 문서는 DB에서 읽은 실제 메뉴를 기준으로 작성했습니다.
- 페이지 메뉴(8자리 코드)는 모두 WBS 행으로 배정했습니다.
- 4/6자리 상위 메뉴는 인벤토리 섹션에서 빠짐없이 유지하고, 작업 순서는 하위 페이지 메뉴 기준으로 정했습니다.
- HOME/ADMIN 모두 메뉴 URL, 운영 영향도, 공통 선행조건 기준으로 wave를 배정했습니다.
