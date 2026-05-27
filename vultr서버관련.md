
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
