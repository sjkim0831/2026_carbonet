# Carbonet Cloudflare Tunnel

`duckDNS` 와 직접 `80/443` 공개 방식은 이 저장소 기준으로 다음 전제가 맞아야 한다.

- 외부 공인 IP 가 Carbonet 호스트로 들어와야 한다
- Fortinet 또는 다른 방화벽/리버스프록시가 `80/443` 을 가로채지 않아야 한다
- 공유기 또는 방화벽 포트포워딩이 Carbonet 호스트로 연결되어야 한다

지금처럼 도메인이 Fortinet 로그인 페이지로 가면 `duckDNS` 문제라기보다 공인 진입점 제어권 문제다.

Cloudflare Tunnel 이 잘 되는 이유는 다음과 같다.

- 로컬에서 Cloudflare 로 아웃바운드 연결만 열면 된다
- 외부에서 `80/443` 포트포워딩이 없어도 된다
- Fortinet 이 공인 IP 의 웹 포트를 선점해도 우회할 수 있다

## 저장소 기준 실행 스크립트

- [run-cloudflare-tunnel-local.sh](/opt/projects/carbonet/ops/scripts/run-cloudflare-tunnel-local.sh)

기본값:

- origin: `https://<현재 WSL IP>:18000`
- public host header: `carbonet2026.duckdns.org`
- origin server name: `localhost`
- TLS verify: 끔
- mode: quick tunnel

이 기본값은 현재 Carbonet 로컬 런타임 특성에 맞춘 것이다.

- 백엔드 `:18000` 는 HTTPS 로 뜬다
- 로컬 인증서는 self-signed 다
- 업스트림 TLS SNI 는 `localhost` 여야 한다
- 백엔드는 외부 Host 헤더가 필요한 경로가 있다

## Quick Tunnel

임시 외부 URL 만 빠르게 열고 싶을 때:

```bash
bash /opt/projects/carbonet/ops/scripts/run-cloudflare-tunnel-local.sh
```

로그는 아래에 남긴다.

- [var/cloudflare-tunnel](/opt/projects/carbonet/var/cloudflare-tunnel)

컨테이너 이름 기본값:

- `carbonet-cloudflare-tunnel`

## Token Tunnel

Cloudflare Dashboard 에서 이미 만든 named tunnel 이 있고 token 이 있으면:

```bash
QUICK_TUNNEL=false \
CF_TUNNEL_TOKEN=... \
bash /opt/projects/carbonet/ops/scripts/run-cloudflare-tunnel-local.sh
```

주의:

- token mode 는 Cloudflare 측 ingress/public hostname 설정이 먼저 맞아야 한다
- 이 스크립트는 token 을 주입해 컨테이너를 실행만 한다
- origin 세부 설정은 Cloudflare Dashboard 또는 터널 설정 기준을 따른다

## 권장 판단

외부 접속 목표가 "지금 바로 안전하게 열기" 이면 Cloudflare Tunnel 을 기본 경로로 쓴다.

`duckDNS` 는 아래 조건이 모두 맞을 때만 사용한다.

- Carbonet 서버가 공인 웹 진입점의 실제 종단이다
- Fortinet 또는 다른 장비가 같은 `80/443` 을 잡지 않는다
- 인증서와 포트포워딩을 직접 운영할 계획이 있다

## 빠른 확인 포인트

1. `docker ps` 에 `carbonet-cloudflare-tunnel` 이 떠 있어야 한다
2. 로그에 `trycloudflare.com` 또는 Cloudflare hostname 이 보여야 한다
3. 로컬 `:18000` 이 살아 있어야 한다
4. 외부 URL 접속 시 Fortinet 이 아니라 Carbonet `/home` 또는 앱 응답이 나와야 한다
