# Vultr DB SSH 터널
# 실행: .\ssh-tunnel-vultr.ps1
# 종료: Ctrl+C

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$VULTR_HOST = "141.164.35.124"
$VULTR_USER = "root"   # SSH 계정명 (다르면 수정)
$LOCAL_PORT  = 5432
$REMOTE_PORT = 5432

Write-Host "Vultr DB SSH 터널 시작..."
Write-Host "  $LOCAL_PORT (local) → ${VULTR_HOST}:${REMOTE_PORT} (Vultr Docker DB)"
Write-Host "종료하려면 Ctrl+C"
Write-Host ""

ssh -L "${LOCAL_PORT}:localhost:${REMOTE_PORT}" "${VULTR_USER}@${VULTR_HOST}" -N
