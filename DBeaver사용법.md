# DBeaver 사용법 — Peoplify DB 연결

## 1단계 — 새 연결 만들기
	1. 상단 메뉴 파일 → 새로 만들기 또는 툴바의 플러그 모양 + 아이콘 클릭
	2. PostgreSQL 선택 → 다음
---

## 2단계 — 연결 정보 입력
* 🖥️ 로컬 Docker DB

| 항목        | 값            |
| :--------- | :------------ |
| Host       | localhost     |
| Port       | 5432          |
| Database   | peoplify      |
| Username   | postgres      |
| Password   | peoplify      |

* ☁️ 운용 서버 DB (SSH 터널 방식)
	- Main 탭:

| 항목        | 값            |
| :--------- | :------------ |
| Host    | localhost        |
| Port    | 5432             |
| Database    | peoplify     |
| Username    | postgres     |
| Password    | peoplify     |

* SSH 탭 (탭 중에 SSH 선택):

| 항목        | 값            |
| :--------- | :------------ |
| Use SSH Tunnel   |	✅ 체크      |
| Host/IP   |141.164.35.124      |
| Port	   |22      |
| User Name   |	root (또는 서버 계정)      |
| Authentication	   |Password 또는 Public Key      |
| Password	   |SSH 비밀번호 or 개인키 파일 선택      |

---

## 3단계 — 드라이버 다운로드
처음 연결 시 "드라이버 파일 다운로드" 팝업 → Download 클릭

---
## 4단계 — 테스트 및 완료
"연결 테스트" 버튼 → Connected 뜨면 성공 → 완료
---

## 연결 후 DB 탐색

```
왼쪽 패널 (Database Navigator)
└── peoplify (연결명)
    └── Databases
        └── peoplify
            └── Schemas
                └── public
                    └── Tables   ← 여기서 테이블 목록 확인
                        ├── users
                        ├── employees
                        └── ...
```
* 테이블 더블클릭 → 데이터 탭에서 내용 바로 확인
* 테이블 우클릭 → "데이터 읽기" 또는 "200행 읽기"
---

## SQL 직접 실행
	1. 상단 메뉴 SQL 편집기 → SQL 편집기 열기 (또는 F3)
	2. SQL 입력 후 Ctrl + Enter 로 실행

```
-- 사용자 목록
SELECT * FROM users;

-- 테이블 목록
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```
💡 Tip: 연결이 자동으로 끊길 때는 연결 우클릭 → 편집 → 연결 유지(Keep-Alive) 설정에서 체크하면 됩니다.