# Project Paths

프로젝트 폴더명을 바꾸거나 저장소 위치를 옮길 때 먼저 이 문서와 [project-paths.sh](/opt/projects/carbonet-react-migration/ops/project-paths.sh)를 확인합니다.

공통 표기:

- `<PROJECT_ROOT>`

가장 먼저 바꿀 값:

- `PROJECT_ROOT`

현재 기준값:

- `/opt/projects/carbonet-react-migration`

운영 스크립트 원칙:

- cron 관련 스크립트는 가능한 한 [project-paths.sh](/opt/projects/carbonet-react-migration/ops/project-paths.sh)를 통해 경로를 공유합니다.
- 문서 예시 경로도 현재 프로젝트 루트를 기준으로 맞춥니다.
- 로그 기본 경로는 `<PROJECT_ROOT>/var/logs` 입니다.
- 파일 저장 기본 경로는 `<PROJECT_ROOT>/var/file` 입니다.

수정 확인 대상:

1. `README.md`
2. `STRUCTURE.md`
3. `docs/operations/`
4. `ops/project-paths.sh`
5. `ops/cron/`
6. `ops/scripts/`
7. `var/`

문서 작성 원칙:

- 가능한 한 절대경로를 반복하지 말고 `<PROJECT_ROOT>`로 표기합니다.
- 실제 기본값이 필요할 때만 `/opt/projects/carbonet-react-migration`를 예시로 적습니다.
