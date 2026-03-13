# Codex Provision API

## 목적
- Codex가 Carbonet에 기능 생성/수정 요청을 보낼 때 필요한 메타데이터를 선반영한다.
- 페이지, 메뉴 URL, 기능 코드, 공통코드, 권한 그룹/기능 맵핑이 없으면 자동 등록한다.

## 인증 방식
- 엔드포인트: `POST /signin/codex/login`
- 헤더: `X-CODEX-API-KEY: <configured-key>`
- 설정:
  - `SECURITY_CODEX_ENABLED=true`
  - `SECURITY_CODEX_API_KEY=<secret>`

## 실제 등록 엔드포인트
- `POST /signin/codex/provision`
- 동일하게 `X-CODEX-API-KEY` 헤더가 필요하다.

## 요청 예시
```json
{
  "requestId": "REQ-20260313-001",
  "actorId": "CODEX",
  "menuType": "ADMIN",
  "reloadSecurityMetadata": true,
  "page": {
    "domainCode": "A101",
    "domainName": "시스템관리",
    "domainNameEn": "System Management",
    "groupCode": "A10102",
    "groupName": "Codex 관리",
    "groupNameEn": "Codex Management",
    "code": "A1010201",
    "codeNm": "Codex 요청 관리",
    "codeDc": "Codex Request Management",
    "menuUrl": "/admin/system/codex-request",
    "menuIcon": "smart_toy",
    "useAt": "Y"
  },
  "features": [
    {
      "menuCode": "A1010201",
      "featureCode": "A1010201_VIEW",
      "featureNm": "Codex 요청 조회",
      "featureNmEn": "View Codex Requests",
      "featureDc": "Codex request list view",
      "useAt": "Y"
    },
    {
      "menuCode": "A1010201",
      "featureCode": "A1010201_CREATE",
      "featureNm": "Codex 요청 등록",
      "featureNmEn": "Create Codex Requests",
      "featureDc": "Codex request creation",
      "useAt": "Y"
    }
  ],
  "authors": [
    {
      "authorCode": "ROLE_CODEX_ADMIN",
      "authorNm": "Codex 관리자",
      "authorDc": "Codex automation administrator",
      "featureCodes": [
        "A1010201_VIEW",
        "A1010201_CREATE"
      ]
    }
  ],
  "commonCodeGroups": [
    {
      "classCode": "CODX",
      "classCodeNm": "Codex",
      "classCodeDc": "Codex",
      "codeId": "CODEX_STATUS",
      "codeIdNm": "Codex 요청 상태",
      "codeIdDc": "Codex Request Status",
      "useAt": "Y",
      "details": [
        {
          "code": "READY",
          "codeNm": "대기",
          "codeDc": "Ready",
          "useAt": "Y"
        },
        {
          "code": "DONE",
          "codeNm": "완료",
          "codeDc": "Done",
          "useAt": "Y"
        }
      ]
    }
  ]
}
```

## 동작 원칙
- 이미 존재하는 항목은 건드리지 않고 `EXISTING`으로 응답한다.
- 없는 항목만 `CREATED`로 응답한다.
- `page.code`는 8자리 메뉴 코드여야 한다.
- 상위 4자리/6자리 메뉴 detail code가 없으면 함께 생성한다.
- `reloadSecurityMetadata=true` 이면 등록 후 보안 메타데이터를 다시 읽는다.

## 응답 개요
- `status`
- `requestId`
- `actorId`
- `securityMetadataReloaded`
- `createdCount`
- `existingCount`
- `skippedCount`
- `results[]`

## 주의
- 현재 구현은 `자동 등록` 중심이다. 기존 메타데이터를 덮어쓰지 않는다.
- 운영 환경에서는 API 키를 환경변수로만 주입하고 코드/설정 파일에 직접 넣지 않는다.

## API 키 발급 방식
- `SECURITY_CODEX_API_KEY`는 외부 서비스에서 발급받는 키가 아니다.
- Carbonet 운영자가 직접 생성해서 관리하는 `내부 공유 비밀키`다.
- 즉, OpenAI API Key와는 별개다.

구분:
- `OpenAI API Key`
  - Codex 또는 OpenAI API를 호출할 때 사용하는 외부 서비스 키
- `SECURITY_CODEX_API_KEY`
  - Carbonet의 `/signin/codex/login`, `/signin/codex/provision`을 보호하는 내부 시스템 키

## 안전한 키 생성 방법
운영 서버나 관리자 PC에서 아래 중 하나로 생성한다.

```bash
openssl rand -hex 32
```

```bash
openssl rand -base64 48
```

권장 기준:
- 최소 32바이트 이상
- 사람이 추측 가능한 문자열 사용 금지
- 개발/검증/운영 환경별로 서로 다른 키 사용

예시:
```bash
export SECURITY_CODEX_API_KEY="$(openssl rand -hex 32)"
echo "$SECURITY_CODEX_API_KEY"
```

## 현재 Carbonet 기준 등록 위치
이 저장소는 [README-RESTART.md](/opt/projects/carbonet/README-RESTART.md) 기준으로 `systemd` 서비스 운용이 가장 적합하다.

### 1. systemd 서비스 파일에 등록
`/etc/systemd/system/carbonet.service`의 `[Service]` 구간에 아래를 추가한다.

```ini
Environment="SECURITY_CODEX_ENABLED=true"
Environment="SECURITY_CODEX_API_KEY=여기에_랜덤_키"
```

예시:
```ini
[Service]
Type=simple
User=imaneya
WorkingDirectory=/opt/projects/carbonet
Environment="JAVA_OPTS="
Environment="SECURITY_CODEX_ENABLED=true"
Environment="SECURITY_CODEX_API_KEY=1c8d6b1f3b8d0a1f2b7c4d9e6a0f1c3e4b8d9a6f7c1e2d3a4b5c6d7e8f9a0b1"
ExecStartPre=/bin/bash -lc 'for i in {1..30}; do ss -lnt | grep -q ":33000 " && exit 0; sleep 2; done; exit 1'
ExecStart=/bin/bash -lc 'exec java $JAVA_OPTS -jar /opt/projects/carbonet/target/carbonet.jar --server.port=18000 --spring.datasource.url=jdbc:cubrid:127.0.0.1:33000:carbonet:::?charset=UTF-8'
Restart=always
RestartSec=5
SuccessExitStatus=143
```

적용:
```bash
sudo systemctl daemon-reload
sudo systemctl restart carbonet
sudo systemctl status carbonet
```

### 2. 임시 수동 실행 시 등록
서비스 등록 전 임시 실행이면 현재 쉘에 넣고 실행한다.

```bash
export SECURITY_CODEX_ENABLED=true
export SECURITY_CODEX_API_KEY="$(openssl rand -hex 32)"
java -jar target/carbonet.jar
```

### 3. 배포 파이프라인/비밀관리 시스템
운영에서는 아래 위치 중 하나를 권장한다.
- CI/CD secret 변수
- 서버 비밀관리 도구
- systemd drop-in 환경파일

예: `/etc/systemd/system/carbonet.service.d/override.conf`

```ini
[Service]
Environment="SECURITY_CODEX_ENABLED=true"
Environment="SECURITY_CODEX_API_KEY=여기에_랜덤_키"
```

적용:
```bash
sudo systemctl daemon-reload
sudo systemctl restart carbonet
```

## 관리자 화면에서 키 입력 없이 호출하는 방식
현재 관리자 화면 `/admin/system/codex-provision`은 `관리자 내부 프록시` 방식으로 동작한다.

동작:
- 브라우저는 `/admin/system/codex-provision/login`, `/admin/system/codex-provision/execute`만 호출한다.
- 서버는 환경변수의 `SECURITY_CODEX_ENABLED`, `SECURITY_CODEX_API_KEY` 설정을 내부에서 확인한다.
- 실제 `CodexProvisioningService` 실행은 서버 내부에서 직접 처리한다.

권장 운영:
- 일반 운영자는 관리자 화면에서 바로 호출
- 자동화 배치나 외부 Codex 에이전트는 기존 `/signin/codex/*` 엔드포인트와 API 키 방식 사용

추가로 가능한 방식:
- 최근 호출 이력 저장
- 호출자별 감사 로그 남김
- 승인형 실행 모드 추가

## Codex 호출 절차
1. 기능 생성 또는 수정 요청을 해석한다.
2. 해당 기능에 필요한 `페이지`, `기능`, `공통코드`, `권한` 메타데이터를 먼저 추출한다.
3. `/signin/codex/provision` 으로 JSON payload를 전송한다.
4. 응답에서 `CREATED`, `EXISTING`, `SKIPPED` 결과를 확인한다.
5. 메타데이터 등록이 끝난 뒤 실제 코드 생성 또는 수정 작업을 진행한다.

## Codex 시스템 프롬프트 템플릿
아래 템플릿은 Carbonet 전용 Codex 에이전트에 넣을 수 있는 운영 프롬프트 예시다.

```text
당신은 Carbonet 유지보수 및 기능 구축을 수행하는 개발 에이전트다.

작업 시작 전 아래 원칙을 따른다.
1. 사용자의 요구사항에서 신규 또는 변경 대상 페이지, 메뉴, 기능, 공통코드, 권한 그룹을 식별한다.
2. 실제 코드 생성 또는 수정 전에 Carbonet Codex Provision API를 호출해 메타데이터 누락 여부를 먼저 보정한다.
3. Provision API 응답에서 CREATED, EXISTING, SKIPPED를 확인하고 결과를 작업 로그에 남긴다.
4. 페이지 코드는 8자리 메뉴 코드 규칙을 따른다.
5. 기능 코드는 가능하면 {PAGE_CODE}_VIEW, {PAGE_CODE}_CREATE, {PAGE_CODE}_UPDATE, {PAGE_CODE}_DELETE 같은 suffix 규칙을 따른다.
6. 기존 항목이 이미 존재하면 덮어쓰지 않는다.
7. 운영 환경에서는 API Key를 환경변수에서 읽어 사용한다.

Provision API:
- URL: POST {BASE_URL}/signin/codex/provision
- Header: X-CODEX-API-KEY: {SECURITY_CODEX_API_KEY}
- Content-Type: application/json

실행 규칙:
- 신규 관리자 화면이면 menuType=ADMIN
- 일반 사용자/홈 화면이면 menuType=USER
- 페이지가 있으면 page 객체를 채운다
- 버튼/행위 권한이 필요하면 features 배열을 채운다
- 신규 상태값/구분값이 필요하면 commonCodeGroups 배열을 채운다
- 특정 권한 그룹이 새 기능을 사용해야 하면 authors 배열을 채운다
```

## Codex 작업용 사용자 프롬프트 템플릿
아래 템플릿은 Codex에게 실제 변경 요청을 보낼 때 쓸 수 있다.

```text
Carbonet 기능 요청:
- 작업 유형: 신규 화면 추가 / 기존 기능 수정 / 운영 데이터 보정
- 업무명: {업무명}
- 메뉴 유형: ADMIN 또는 USER
- 페이지 코드: {8자리 메뉴코드}
- 페이지명(한글): {페이지명}
- 페이지명(영문): {페이지명 영문}
- URL: {페이지 URL}
- 상위 도메인 코드: {4자리 코드}
- 상위 그룹 코드: {6자리 코드}
- 필요한 기능 코드: {예: A1010201_VIEW, A1010201_CREATE}
- 필요한 공통코드: {예: CODEX_STATUS, READY, DONE}
- 권한 그룹: {예: ROLE_CODEX_ADMIN}
- 실제 해야 할 일: {구체적 수정/생성 내용}

작업 순서:
1. Provision API로 메타데이터를 먼저 등록/확인한다.
2. 그 다음 Carbonet 코드 구조에 맞게 구현한다.
3. 결과에서 생성된 메타데이터와 변경 파일을 함께 정리한다.
```

## Provision JSON 생성 규칙
- `menuType`
  - `ADMIN`: `/admin/...` 계열 화면
  - `USER`: `/home`, `/mypage`, `/join` 또는 일반 사용자 메뉴
- `page.domainCode`
  - 4자리 코드
- `page.groupCode`
  - 6자리 코드
- `page.code`
  - 8자리 코드
- `features[].menuCode`
  - 없으면 `page.code`와 같게 맞춘다
- `authors[].featureCodes`
  - 반드시 실제 `features[].featureCode`와 일치해야 한다
- `commonCodeGroups[].classCode`
  - 공통코드 분류 코드
- `commonCodeGroups[].codeId`
  - 코드 그룹 ID

## 최소 요청 템플릿
페이지와 조회 권한만 필요한 가장 단순한 요청이다.

```json
{
  "requestId": "REQ-{{timestamp}}",
  "actorId": "CODEX",
  "menuType": "ADMIN",
  "reloadSecurityMetadata": true,
  "page": {
    "domainCode": "A101",
    "domainName": "시스템관리",
    "domainNameEn": "System Management",
    "groupCode": "A10102",
    "groupName": "AI 운영",
    "groupNameEn": "AI Operations",
    "code": "A1010201",
    "codeNm": "AI 요청 이력",
    "codeDc": "AI Request History",
    "menuUrl": "/admin/system/ai-request-history",
    "menuIcon": "smart_toy",
    "useAt": "Y"
  },
  "features": [
    {
      "menuCode": "A1010201",
      "featureCode": "A1010201_VIEW",
      "featureNm": "AI 요청 이력 조회",
      "featureNmEn": "View AI Request History",
      "featureDc": "AI request history view",
      "useAt": "Y"
    }
  ]
}
```

## 전체 요청 템플릿
페이지, 기능, 공통코드, 권한을 모두 포함하는 템플릿이다.

```json
{
  "requestId": "REQ-{{timestamp}}",
  "actorId": "CODEX",
  "menuType": "ADMIN",
  "reloadSecurityMetadata": true,
  "page": {
    "domainCode": "{{domainCode}}",
    "domainName": "{{domainNameKo}}",
    "domainNameEn": "{{domainNameEn}}",
    "groupCode": "{{groupCode}}",
    "groupName": "{{groupNameKo}}",
    "groupNameEn": "{{groupNameEn}}",
    "code": "{{pageCode}}",
    "codeNm": "{{pageNameKo}}",
    "codeDc": "{{pageNameEn}}",
    "menuUrl": "{{menuUrl}}",
    "menuIcon": "{{menuIcon}}",
    "useAt": "Y"
  },
  "features": [
    {
      "menuCode": "{{pageCode}}",
      "featureCode": "{{pageCode}}_VIEW",
      "featureNm": "{{pageNameKo}} 조회",
      "featureNmEn": "View {{pageNameEn}}",
      "featureDc": "{{pageNameEn}} view",
      "useAt": "Y"
    },
    {
      "menuCode": "{{pageCode}}",
      "featureCode": "{{pageCode}}_CREATE",
      "featureNm": "{{pageNameKo}} 등록",
      "featureNmEn": "Create {{pageNameEn}}",
      "featureDc": "{{pageNameEn}} creation",
      "useAt": "Y"
    },
    {
      "menuCode": "{{pageCode}}",
      "featureCode": "{{pageCode}}_UPDATE",
      "featureNm": "{{pageNameKo}} 수정",
      "featureNmEn": "Update {{pageNameEn}}",
      "featureDc": "{{pageNameEn}} update",
      "useAt": "Y"
    },
    {
      "menuCode": "{{pageCode}}",
      "featureCode": "{{pageCode}}_DELETE",
      "featureNm": "{{pageNameKo}} 삭제",
      "featureNmEn": "Delete {{pageNameEn}}",
      "featureDc": "{{pageNameEn}} delete",
      "useAt": "Y"
    }
  ],
  "authors": [
    {
      "authorCode": "{{authorCode}}",
      "authorNm": "{{authorNameKo}}",
      "authorDc": "{{authorNameEn}}",
      "featureCodes": [
        "{{pageCode}}_VIEW",
        "{{pageCode}}_CREATE",
        "{{pageCode}}_UPDATE",
        "{{pageCode}}_DELETE"
      ]
    }
  ],
  "commonCodeGroups": [
    {
      "classCode": "{{classCode}}",
      "classCodeNm": "{{classNameKo}}",
      "classCodeDc": "{{classNameEn}}",
      "classUseAt": "Y",
      "codeId": "{{codeId}}",
      "codeIdNm": "{{codeIdNameKo}}",
      "codeIdDc": "{{codeIdNameEn}}",
      "useAt": "Y",
      "details": [
        {
          "code": "{{detailCode1}}",
          "codeNm": "{{detailName1Ko}}",
          "codeDc": "{{detailName1En}}",
          "useAt": "Y"
        },
        {
          "code": "{{detailCode2}}",
          "codeNm": "{{detailName2Ko}}",
          "codeDc": "{{detailName2En}}",
          "useAt": "Y"
        }
      ]
    }
  ]
}
```

## curl 예시
```bash
curl -X POST "http://localhost:18000/signin/codex/provision" \
  -H "Content-Type: application/json" \
  -H "X-CODEX-API-KEY: ${SECURITY_CODEX_API_KEY}" \
  -d @codex-provision-request.json
```

## 중계 스크립트
- 스크립트: [codex_provision.sh](/opt/projects/carbonet/scripts/codex_provision.sh)
- 샘플 요청: [codex-provision-request.sample.json](/opt/projects/carbonet/scripts/codex-provision-request.sample.json)

사용 예시:
```bash
export SECURITY_CODEX_ENABLED=true
export SECURITY_CODEX_API_KEY='your-secret-key'
export CODEX_BASE_URL='http://localhost:18000'

bash scripts/codex_provision.sh scripts/codex-provision-request.sample.json
```

stdin으로도 호출 가능하다:
```bash
cat scripts/codex-provision-request.sample.json | bash scripts/codex_provision.sh -
```

## 운영 권장 방식
- Codex는 먼저 `provision` 호출만 수행하고 응답을 확인한다.
- 응답이 정상일 때만 실제 코드 생성/수정 단계로 넘어간다.
- 운영계에서는 `권한`, `공통코드`, `메뉴` 자동 생성 요청을 별도 로그에 남긴다.
- 가능하면 요청마다 `requestId`를 고유값으로 넣는다.
