
# Vultr 서버정보

## 접속url
* http://141.164.35.124

서버 vultr 에서 파일 수정 시 push하는 방법
git add Dockerfile nginx.conf server/Dockerfile docker-compose.yml .env.production
git commit -m "feat: Add Docker deployment files"
git push origin main


push 토큰 적용방법
git remote set-url origin https://ghp_새토큰@github.com/axiom-redsky/react-app-peoplify.git


## vultr ssh 키
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACCUzW/nTCZDXMuB+xGhMxt38WGCuRPShWnT2x3cect9dwAAAJAT5ZnwE+WZ
8AAAAAtzc2gtZWQyNTUxOQAAACCUzW/nTCZDXMuB+xGhMxt38WGCuRPShWnT2x3cect9dw
AAAEA6OLSoRJXZRw2jAUoYi/2LSaHYVZILrjLgJIqgakcp5pTNb+dMJkNcy4H7EaEzG3fx
YYK5E9KFadPbHdx5y313AAAABmRlcGxveQECAwQFBgc=
-----END OPENSSH PRIVATE KEY-----


## github actions로 자동배포설정함.
* /.github/workflows/deploy.yml 파일 추가함.
* 혹시 git push 가 안될 때 레포지토리 토큰설정부분에 workflows 체크를 확인해야함.
	- GitHub → Settings → Developer settings → Personal access tokens → 기존 토큰 클릭 → Edit
workflow 체크박스 추가로 체크 → Update token
* git push하면 자동 배포됨.
* GitHub → Actions 탭 에서 배포 상태를 확인할 수 있음.
