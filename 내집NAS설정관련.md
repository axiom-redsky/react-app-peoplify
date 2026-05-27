# 집 NAS 설정관련 (https://hyun0238.tw6.quickconnect.to/)

## 1. SSH 활성화 여부 체크
* NAS의 SSH 활성화: 제어판 → 터미널 및 SNMP → SSH 서비스 활성화 체크 → 포트 4169로 활성화 되어있음.

## 2. SSH 접속
* windows PowerShell 또는 터미널창에서 다음 실행 (NAS IP 확인방법 : DSM → 제어판 → 네트워크 → 네트워크 인터페이스) (192.168.45.150)
```sh
ssh -p 4169 hyun0238@NAS_IP 일단 내부 ip로 작업해도 됨.
```

## docker 설치 확인
```sh
docker --version

docker compose version
```
* compose 버전이 구버전이면 다음 명령어로 compose 실행
```
docker-compose --version
```

## 폴더 생성 & git clone
```sh
# 1. 폴더 생성
sudo mkdir -p /volume1/docker/peoplify

# 2. 폴더로 이동
cd /volume1/docker/peoplify

# 3. git 설치 확인
git --version
```
* git 없으면 설치
  - DSM → 패키지센터 → git 검색 → Git Server설치
```
# 다시 실행해보고 버전이 나오면 성공
git --version 
```

## github 소스 clone
* 마지막에 . (점) 꼭 붙여주세요 — 현재 폴더에 바로 받는 옵션입니다.
```sh
git clone https://github.com/axiom-redsky/react-app-peoplify .
```

## docker-compose.yml 수정
* 사실 docker-compose.yml을 수정하기 보다는 집NAS용 yml을 따로 만들었다.
* docker-compose-nas.yml 생성
```sh
version: '3'

services:
  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: peoplify
      POSTGRES_DB: peoplify
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 10

  server:
    build: ./server
    restart: always
    depends_on:
      db:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - PORT=4000
      - DATABASE_URL=postgresql://postgres:peoplify@db:5432/peoplify
      - JWT_SECRET=peoplify-redsky-2026-nas-secret
      - JWT_EXPIRES_IN=7d
      - ALLOWED_ORIGIN=http://192.168.45.150

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - server
    restart: always

volumes:
  pgdata:
```
