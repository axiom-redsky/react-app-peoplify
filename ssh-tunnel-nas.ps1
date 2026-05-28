# NAS DB SSH 터널 (외부 개발용)
# 실행: .\ssh-tunnel-nas.ps1
# 종료: Ctrl+C

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$NAS_HOST    = "211.208.101.192"  # 집 공유기 외부 IP (확인: https://myip.com)
$NAS_USER    = "hyun0238"
$SSH_PORT    = 4169
$LOCAL_PORT  = 5433
$REMOTE_PORT = 5433

Write-Host "NAS DB SSH 터널 시작..."
Write-Host "  $LOCAL_PORT (local) → ${NAS_HOST}:${REMOTE_PORT} (NAS Docker DB)"
Write-Host "종료하려면 Ctrl+C"
Write-Host ""

ssh -L "${LOCAL_PORT}:localhost:${REMOTE_PORT}" "${NAS_USER}@${NAS_HOST}" -p $SSH_PORT -N
