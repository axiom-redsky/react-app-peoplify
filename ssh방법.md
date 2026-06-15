SSH 방식으로 가는 전체 흐름입니다. 크게 **redsky 님이 할 일**과 **상대방이 할 일**로 나뉩니다.

## 1단계 — (redsky) Write 권한으로 초대

레포 페이지에서 `Settings` → `Collaborators` → `Add people`를 누르고 상대방 GitHub 아이디를 입력합니다. 개인 레포에서 추가하면 기본이 Write라 그대로 두면 되고, 역할 선택이 보이면 **Write**를 고릅니다. 그러면 상대방에게 초대 알림/메일이 갑니다.

## 2단계 — (상대방) 초대 수락

상대방이 메일 링크나 GitHub 알림에서 **Accept invitation**을 눌러야 권한이 실제로 켜집니다. 이걸 안 하면 권한을 줘도 push가 막힙니다.

## 3단계 — (상대방) SSH 키 생성

상대방 PC 터미널에서:

```bash
ssh-keygen -t ed25519 -C "본인이메일@example.com"
```

엔터 몇 번 누르면 `~/.ssh/id_ed25519`(개인키)와 `~/.ssh/id_ed25519.pub`(공개키)가 생깁니다. 키가 이미 있으면 이 단계는 건너뛰어도 됩니다.

## 4단계 — (상대방) 공개키를 자기 GitHub 계정에 등록

여기가 핵심인데 — SSH 키는 **레포가 아니라 상대방 본인 계정**에 등록합니다. 공개키 내용을 복사하고:

```bash
cat ~/.ssh/id_ed25519.pub
```

상대방이 본인 GitHub의 `Settings` → `SSH and GPG keys` → `New SSH key`에 붙여넣고 저장합니다.

## 5단계 — (상대방) 연결 테스트

```bash
ssh -T git@github.com
```

`Hi 아이디! You've successfully authenticated...` 가 나오면 인증 성공입니다.

## 6단계 — (상대방) SSH 주소로 clone & push

HTTPS가 아니라 **SSH 주소**로 받아야 합니다:

```bash
git clone git@github.com:axiom-redsky/레포명.git
cd 레포명
# 작업 후
git push origin main
```

이미 HTTPS로 clone해 둔 폴더라면 remote만 바꾸면 됩니다:

```bash
git remote set-url origin git@github.com:axiom-redsky/레포명.git
```

---

요약하면, redsky 님 쪽은 **1·2단계(초대)** 만 신경 쓰면 끝이고, **SSH 설정(3~5단계)은 전부 상대방 본인 계정에서** 이뤄집니다. redsky 님 레포 설정에 상대방 SSH 키를 넣는 일은 없습니다 — 그건 Deploy key(키 단위 접근) 얘기고, 사람 협업에는 위 방식이 맞습니다.

상대방이 회사 폐쇄망 같은 환경이라 22번 포트가 막혀 있으면 `ssh -T` 단계에서 막힐 수 있는데, 그 경우엔 443 포트로 SSH 거는 우회법이 따로 있으니 막히면 알려주세요.