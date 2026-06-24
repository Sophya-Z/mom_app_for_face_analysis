$ip = (
  Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object {
    $_.InterfaceAlias -notmatch 'Loopback' -and
    $_.IPAddress -notmatch '^169\.' -and
    $_.IPAddress -notlike '192.168.56.*' -and
    $_.IPAddress -notlike '172.*'
  } |
  Select-Object -First 1 -ExpandProperty IPAddress
)
if (-not $ip) {
  Write-Error 'LAN IP not found. Connect Wi-Fi and retry.'
  exit 1
}

$htmlPath = Join-Path $PSScriptRoot 'expo-qr.html'
$html = Get-Content -Raw -Path $htmlPath -Encoding UTF8
$html = $html -replace "const host = '[^']*';", "const host = '$ip';"
$outPath = Join-Path $env:TEMP 'vkr-expo-qr.html'
[System.IO.File]::WriteAllText($outPath, $html, [System.Text.UTF8Encoding]::new($false))
Write-Host "Expo URL: exp://${ip}:8081"
Write-Host "QR page: $outPath"
Start-Process $outPath
