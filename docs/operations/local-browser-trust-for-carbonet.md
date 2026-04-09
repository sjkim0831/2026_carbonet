# Carbonet Local Browser Trust

로컬 `https://carbonet2026.duckdns.org` 에서 브라우저가 `주의 요함` 또는 인증서 경고를 띄우는 이유는 브라우저가 로컬 루트 CA 를 아직 신뢰하지 않기 때문이다.

같은 루트 CA 를 사용하면 `https://localhost:18000/home` 경고도 없앨 수 있다.

## 기준 파일

- 루트 CA: [carbonet-local-root-ca.pem](/opt/projects/carbonet/var/nginx-duckdns-local/ca/carbonet-local-root-ca.pem)
- 서버 인증서 체인: [fullchain.pem](/opt/projects/carbonet/var/nginx-duckdns-local/certs/carbonet2026.duckdns.org/fullchain.pem)
- 생성 스크립트: [generate-local-browser-trusted-cert.sh](/opt/projects/carbonet/ops/scripts/generate-local-browser-trusted-cert.sh)
- `localhost:18000` PKCS12 생성 스크립트: [generate-localhost-https-cert.sh](/opt/projects/carbonet/ops/scripts/generate-localhost-https-cert.sh)

## 재생성

```bash
bash /opt/projects/carbonet/ops/scripts/generate-local-browser-trusted-cert.sh
bash /opt/projects/carbonet/ops/scripts/generate-localhost-https-cert.sh
bash /opt/projects/carbonet/ops/scripts/run-local-duckdns-nginx.sh
```

`localhost:18000` 경고까지 없애려면 인증서 재발급 후 `:18000` 런타임도 재시작해야 한다.

## Windows 신뢰 저장소 등록

1. `certmgr.msc` 실행
2. `신뢰할 수 있는 루트 인증 기관` 선택
3. `인증서` 우클릭 후 `모든 작업 > 가져오기`
4. [carbonet-local-root-ca.pem](/opt/projects/carbonet/var/nginx-duckdns-local/ca/carbonet-local-root-ca.pem) 선택
5. 가져오기 완료 후 브라우저 재시작

## 확인

신뢰 등록 후 아래 주소를 다시 연다.

- `https://carbonet2026.duckdns.org/home`
- `https://localhost:18000/home`

브라우저가 아직 경고를 띄우면:

- 기존 탭 전부 종료 후 브라우저 재시작
- 인증서 캐시 삭제
- 실제 접속 호스트가 `carbonet2026.duckdns.org` 인지 확인
- 로컬 hosts 매핑이 필요한지 확인

## 주의

- 루트 CA 파일을 신뢰 저장소에 넣어야 한다
- `fullchain.pem` 을 루트 저장소에 넣는 방식보다 루트 CA 등록이 더 정확하다
- `https://localhost:18000/home` 은 Nginx 앞단이 아니라 Spring `:18000` 이 직접 내보내는 인증서를 사용한다
- 다른 PC 에서도 경고를 없애려면 그 PC 에도 같은 루트 CA 를 등록해야 한다
