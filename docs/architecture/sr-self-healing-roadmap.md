# SR Self-Healing Roadmap

현재 구현 범위:
- 관리자 `SR 워크벤치`에서 화면/요소/이벤트/API/스키마 기준 SR 티켓 발행
- 해결 direction 생성
- 승인/반려
- `Codex CLI` 전달용 command prompt 생성
- 승인 후 `READY_FOR_CODEX` 또는 `READY_FOR_MANUAL_EXECUTION` 상태로 전환

아직 미구현:
- 런타임 에러 자동 티켓 생성
- 서버 내부에서 Codex CLI 직접 실행
- 승인 후 실제 소스 자동 수정
- 블루/그린 또는 롤링 방식의 무중단 빌드/배포

권장 4단계 업그레이드:

1. Error-to-Ticket 자동 발행
- 프론트:
  - `window.onerror`, `unhandledrejection`, 주요 API 실패, React error boundary
- 백엔드:
  - `@ControllerAdvice`, 배치 실패, 운영 경고 이벤트
- 저장:
  - 에러 fingerprint, stack summary, pageId, apiId, traceId, actorId, companyContext, recent request log
- 결과:
  - 동일 fingerprint 기준 dedupe
  - 자동 `OPEN` SR 티켓 생성

2. Approval-Gated Codex Runner
- 서버가 직접 자유 명령을 받지 않도록 allowlist 기반 runner 사용
- 허용 입력:
  - ticketId
  - repository root
  - allowed paths
  - generated direction
  - verification commands
- 필수 제약:
  - writable path allowlist
  - git diff preview
  - destructive command 금지
  - 실행 전 승인 토큰 검증

3. Safe Build and Deploy
- 수정 전:
  - feature branch 또는 worktree 생성
- 수정 후:
  - lint
  - unit/integration test
  - build artifact 생성
- 배포:
  - blue/green 또는 rolling
  - health check 성공 후 traffic switch
  - 실패 시 자동 rollback

4. Closed-Loop Self-Healing
- 조건:
  - 동일 유형 에러 반복
  - 영향 범위가 allowlist 안
  - 테스트 세트 존재
  - 승인 정책이 자동 실행 허용
- 흐름:
  - error event -> ticket
  - solution prompt 생성
  - Codex runner 실행
  - build/test
  - canary deploy
  - observability 재검증
  - 성공 시 ticket `RESOLVED`

추가로 필요한 시스템 데이터:
- 화면-요소-이벤트-API-DB 매핑 최신화
- 메뉴/기능권한 카탈로그 최신화
- 에러 fingerprint 규칙
- 승인 정책 테이블
- 배포 전략과 rollback hook

보안상 반드시 필요한 것:
- Codex runner는 OS shell 전체 권한을 가지면 안 됨
- `.env`, secrets, 운영 credential 접근 금지
- 운영 DB 직접 수정 금지
- migration script 생성 후 승인 반영
- 모든 자동 수정은 audit event와 trace event를 남겨야 함
