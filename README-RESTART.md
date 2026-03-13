# Carbonet Stable Restart Guide

`/opt/projects/carbonet` 앱(carbonet)을 `18000` 포트에서 안정적으로 재기동/자동복구하기 위한 운영 가이드입니다.

## 1) 권장 방식: systemd 서비스 등록

서비스로 등록하면 서버 재부팅 후 자동 기동, 비정상 종료 시 자동 재시작이 됩니다.

### 1. 서비스 파일 생성

아래 내용을 `/etc/systemd/system/carbonet.service` 로 저장:

```ini
[Unit]
Description=Carbonet carbonet
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=imaneya
WorkingDirectory=/opt/projects/carbonet
Environment="JAVA_OPTS="
Environment="SECURITY_CODEX_ENABLED=true"
Environment="SECURITY_CODEX_API_KEY=CHANGE_THIS_TO_A_RANDOM_SECRET"
ExecStartPre=/bin/bash -lc 'for i in {1..30}; do ss -lnt | grep -q ":33000 " && exit 0; sleep 2; done; exit 1'
ExecStart=/bin/bash -lc 'exec java $JAVA_OPTS -jar /opt/projects/carbonet/target/carbonet.jar --server.port=18000 --spring.datasource.url=jdbc:cubrid:127.0.0.1:33000:carbonet:::?charset=UTF-8'
Restart=always
RestartSec=5
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```

### 2. 적용

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now carbonet
```

### 3. 확인

```bash
sudo systemctl status carbonet
ss -lnt | grep ':18000 '
curl -I http://127.0.0.1:18000/
```

Codex Provision API를 함께 쓸 경우 랜덤 키 생성 예시:

```bash
openssl rand -hex 32
```

## 2) 수동 재기동(임시)

서비스 등록 전 임시로 사용할 수 있는 명령입니다.

```bash
cd /opt/projects/carbonet
pkill -f "carbonet.jar --server.port=18000" || true
setsid sh -c 'nohup java -jar target/carbonet.jar --server.port=18000 --spring.datasource.url=jdbc:cubrid:127.0.0.1:33000:carbonet:::?charset=UTF-8 >> logs/carbonet-18000.log 2>&1 < /dev/null &'
```

확인:

```bash
ps -ef | grep "carbonet.jar --server.port=18000" | grep -v grep
ss -lnt | grep ':18000 '
```

## 3) 트러블슈팅 포인트

- 증상: 기동 직후 종료
  - 로그에 `Cannot connect to a broker ... localhost:33000` 가 보이면 DB 접속 실패입니다.
- 점검:
  - `ss -lnt | grep ':33000 '` 로 CUBRID broker 리슨 여부 확인
  - 실행 인자에 `--spring.datasource.url=jdbc:cubrid:127.0.0.1:33000:carbonet:::?charset=UTF-8` 사용
- 로그:
  - `/opt/projects/carbonet/logs/carbonet-18000.log`

## 4) 현재 라우팅 정책 참고

- `/` 접속 시 `/home` 으로 리다이렉트
- `/home3` 경로는 제거됨(404)
