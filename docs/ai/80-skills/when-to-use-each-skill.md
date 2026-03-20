# When To Use Each Skill

Suggested routing:

- Before broad Resonance architecture/doc updates, read [resonance-skill-and-doc-update-pattern.md](/opt/projects/carbonet/docs/ai/80-skills/resonance-skill-and-doc-update-pattern.md) and [resonance-design-patterns.md](/opt/projects/carbonet/docs/architecture/resonance-design-patterns.md) so repeated changes land in the right canonical layers instead of spawning duplicate docs.

- Use `carbonet-ai-session-orchestrator` first on any implementation request to decide whether the work stays in one session or should split across multiple sessions with conflict-free path ownership.
- Use `carbonet-audit-trace-architecture` when the task is about audit logging, trace correlation, page or component registry, or system-wide governance across frontend and backend.
- Use `carbonet-react-refresh-consistency` when changing React build output, shell templates, Spring static resource delivery, or any cache behavior that affects whether frontend changes appear immediately after a hard refresh.
- Use `carbonet-screen-design-workspace` when the task starts from `/home/imaneya/workspace/화면설계`, especially when the top-level `1.`, `2.`, `3.`, `4.` HTML files should drive scope, IA, or workflow interpretation.
- Use `carbonet-feature-builder` when implementing or extending a Carbonet screen, menu, service, mapper, or DB metadata.
  - Keep page-management, feature-management, and authority-chain work in the same session when they share `AdminSystemCodeController`, bilingual page templates, menu-feature metadata, or authority mappers.
  - Treat `페이지 등록 -> PAGE_CODE_VIEW 생성 -> 권한 수동 검토 -> 페이지 삭제 시 기본 VIEW 정리` as one connected implementation path, not separate independent tasks.
  - Treat `메뉴 -> 페이지 -> 기능 -> 권한그룹 -> 회원/부서 할당 -> 사용자 예외권한 -> 감사로그` as one connected permission chain.
  - For the current admin restoration track, keep `auth_group`, `auth_change`, `dept_role_mapping`, `member_edit`, `admin_account` synchronized and restore original templates before polishing migrated UI abstractions.
- Use `carbonet-join-react-migration` when the task is specifically about join, company register, status, or reapply flows in React migration.
