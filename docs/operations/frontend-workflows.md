# Frontend Workflows

이 저장소의 React 화면은 두 가지 방식으로 확인할 수 있습니다.

## 1. 개발 모드

목적:

- `frontend/src` 수정 내용을 저장 직후 바로 확인
- Vite HMR 사용
- 재빌드 없이 화면 확인

방법:

1. 백엔드 서버를 평소처럼 실행합니다.
2. 별도 터미널에서 `./scripts/run-react-dev.sh` 실행
3. React 마이그레이션 화면 URL 뒤에 `?dev=1` 추가

예시:

- `http://localhost:18000/home?dev=1`
- `http://localhost:18000/mypage?dev=1`
- `http://localhost:18000/admin/react-migration?route=member-list&dev=1`

주의:

- 이 모드는 React 마이그레이션 셸에서만 즉시 반영됩니다.
- 서버 렌더링 Thymeleaf 화면 자체를 수정한 경우에는 백엔드 재시작이 필요할 수 있습니다.
- `/sitemap` 처럼 서버 템플릿 화면은 `?dev=1` 대상이 아닙니다.

## 2. 운영 반영 모드

목적:

- 실제 Spring 정적 산출물 기준으로 확인
- jar 배포 상태와 동일하게 검증

방법:

1. `./scripts/rebuild-react-and-restart.sh` 실행
2. 브라우저에서 일반 URL로 확인

예시:

- `http://localhost:18000/home`
- `http://localhost:18000/mypage`
- `http://localhost:18000/sitemap`

이 스크립트가 하는 일:

1. `frontend` 빌드
2. `mvn -q -DskipTests package`
3. `:18000` 기존 프로세스 종료
4. 새 jar 재기동

## 왜 바로 안 바뀌나

현재 운영 경로는 브라우저가 `frontend/src`를 직접 보는 구조가 아닙니다.

- 브라우저는 Spring이 서빙하는 `src/main/resources/static/react-migration` 산출물을 봅니다.
- `java -jar target/carbonet.jar` 실행 중이면 최종적으로는 jar 안의 정적 파일을 보게 됩니다.

따라서 운영 경로 기준으로는 보통 아래가 모두 필요합니다.

1. `frontend` 빌드
2. `mvn package`
3. 서버 재시작

## sitemap 참고

`/sitemap` 과 `/en/sitemap` 은 서버 렌더링 Thymeleaf 화면입니다.

- 이 화면은 React HMR 대상이 아닙니다.
- 링크는 주소만 바뀌는 것이 아니라 서버에서 HTML을 바로 내려줍니다.
- 현재 정상 확인 URL:
  - `http://localhost:18000/sitemap`
  - `http://localhost:18000/en/sitemap`
