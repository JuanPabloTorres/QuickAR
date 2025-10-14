# Script para obtener la IP local y ejecutar el frontend
# Este script detecta automáticamente tu IP de red local

Write-Host "🔍 Detectando IP local..." -ForegroundColor Cyan

# Obtener la IP de la red WiFi/Ethernet (192.168.x.x)
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object { $_.IPAddress -like "192.168.*" -and $_.PrefixOrigin -eq "Dhcp" } | 
    Select-Object -First 1).IPAddress

if (-not $localIP) {
    # Si no encuentra 192.168, busca otras IPs privadas
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | 
        Where-Object { 
            ($_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*") -and 
            $_.PrefixOrigin -eq "Dhcp" 
        } | 
        Select-Object -First 1).IPAddress
}

if (-not $localIP) {
    # Fallback a localhost
    $localIP = "localhost"
    Write-Host "⚠️  No se detectó IP de red, usando localhost" -ForegroundColor Yellow
} else {
    Write-Host "✅ IP detectada: $localIP" -ForegroundColor Green
}

# Configurar variables de entorno
$env:API_INTERNAL_BASE_URL = "http://${localIP}:5001"
$env:NEXT_PUBLIC_API_BASE_URL = "http://${localIP}:5001"
$env:HOSTNAME = "0.0.0.0"
$env:PORT = "3000"

Write-Host ""
Write-Host "🚀 Iniciando frontend..." -ForegroundColor Cyan
Write-Host "   Frontend: http://$localIP:3000" -ForegroundColor Green
Write-Host "   API: http://$localIP:5001" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Accede desde tu teléfono a:" -ForegroundColor Cyan
Write-Host "   http://$localIP:3000" -ForegroundColor Yellow
Write-Host ""

# Ejecutar Next.js
Set-Location -Path "$PSScriptRoot\qr-ar-admin"
npm run dev:mobile
