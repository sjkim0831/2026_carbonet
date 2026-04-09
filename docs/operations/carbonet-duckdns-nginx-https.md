# Carbonet DuckDNS HTTPS Nginx

`carbonet.duckdns.org` 외부 진입점은 `https://carbonet.duckdns.org/home` 를 기본 기준 URL로 둔다.

## 목표

- `http://carbonet.duckdns.org/...` 는 모두 HTTPS로 올린다
- `https://carbonet.duckdns.org/` 는 `https://carbonet.duckdns.org/home` 로 보낸다
- `/home` 및 그 외 애플리케이션 경로는 기존 `carbonet_app` upstream 으로 전달한다

## 저장소 기준 파일

- nginx 템플릿: [carbonet-duckdns.org.conf.example](/opt/projects/carbonet/ops/config/nginx/carbonet-duckdns.org.conf.example)
- 설치 스크립트: [install-carbonet-duckdns-nginx.sh](/opt/projects/carbonet/ops/scripts/install-carbonet-duckdns-nginx.sh)

## 운영 서버 반영

운영 서버에서 수동으로 적용하려면 root 권한으로 아래를 실행한다.

```bash
bash /opt/projects/carbonet/ops/scripts/install-carbonet-duckdns-nginx.sh
```

기본 반영 경로는 `/etc/nginx/sites-enabled/carbonet` 이다.

## 항상 반영 규칙

다음 배포 스크립트는 nginx 기준 파일을 운영 서버에 함께 올리고 설치 스크립트를 실행한다.

- [jenkins-deploy-carbonet.sh](/opt/projects/carbonet/ops/scripts/jenkins-deploy-carbonet.sh)
- [deploy-193-to-221.sh](/opt/projects/carbonet/ops/scripts/deploy-193-to-221.sh)

기본값은 `NGINX_SITE_SYNC_ENABLED=true` 이다.

즉, 이후 배포에서는 다음이 같이 보장된다.

- `carbonet.duckdns.org` nginx 설정 파일 업로드
- `/etc/nginx/sites-enabled/carbonet` 재설치
- `nginx -t`
- `nginx reload`

## 핵심 규칙

- `location = /` 는 반드시 `https://carbonet.duckdns.org/home` 로 `301` 리다이렉트한다
- `location = /home` 는 upstream 으로 직접 전달한다
- `location /` 는 나머지 Carbonet 경로를 upstream 으로 전달한다
- upstream 은 `/etc/nginx/carbonet/carbonet-main-upstream.inc`, `/etc/nginx/carbonet/carbonet-idle-upstream.inc` 를 그대로 사용한다
- `server_name` 에 운영 IP(`136.117.100.221`)나 `_` 를 섞지 않는다
- HTTPS 서버는 HSTS와 `upgrade-insecure-requests` 헤더를 내려 브라우저가 혼합 콘텐츠를 HTTPS로 승격하도록 한다

## 참고

이 저장소에는 실제 운영 서버의 `/etc/nginx` 실파일이 포함되지 않는다.
그래서 저장소에서는 기준 템플릿과 설치 스크립트를 관리하고, 실제 적용은 운영 서버에서 수행한다.
