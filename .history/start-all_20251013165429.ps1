# 🚀 Script de inicio completo - QuickAR
# Inicia tanto el backend (API) como el frontend en modo red

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🚀 QuickAR - Inicio Completo" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Detectar IP local
Write-Host "🔍 Detectando IP local..." -ForegroundColor Cyan

$localIP = (Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object { $_.IPAddress -like "192.168.*" -and $_.PrefixOrigin -eq "Dhcp" } | 
    Select-Object -First 1).IPAddress

if (-not $localIP) {
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | 
        Where-Object { 
            ($_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*") -and 
            $_.PrefixOrigin -eq "Dhcp" 
        } | 
        Select-Object -First 1).IPAddress
}

if (-not $localIP) {
    $localIP = "localhost"
    Write-Host "⚠️  No se detectó IP de red, usando localhost" -ForegroundColor Yellow
} else {
    Write-Host "✅ IP detectada: $localIP" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 URLs de Acceso:" -ForegroundColor Cyan
Write-Host "   💻 Computadora:" -ForegroundColor White
Write-Host "      Frontend: http://$localIP:3000" -ForegroundColor Green
Write-Host "      API: http://$localIP:5001" -ForegroundColor Green
Write-Host ""
Write-Host "   📱 Teléfono (misma red WiFi):" -ForegroundColor White
Write-Host "      http://$localIP:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Función para iniciar proceso en segundo plano
function Start-BackgroundProcess {
    param (
        [string]$Name,
        [scriptblock]$Script
    )
    
    $job = Start-Job -ScriptBlock $Script -Name $Name
    Write-Host "✅ $Name iniciado (Job ID: $($job.Id))" -ForegroundColor Green
    return $job
}

# Iniciar Backend API
Write-Host "🔧 Iniciando Backend API..." -ForegroundColor Cyan
$apiJob = Start-BackgroundProcess -Name "API-Backend" -Script {
    Set-Location -Path $using:PSScriptRoot
    Set-Location -Path "QrAr.Api"
    
    $env:ASPNETCORE_ENVIRONMENT = "Development"
    $env:ASPNETCORE_URLS = "http://0.0.0.0:5001;https://0.0.0.0:5002"
    
    dotnet watch run --project QrAr.Api.csproj
}

# Esperar un poco para que la API se inicie
Start-Sleep -Seconds 3

# Iniciar Frontend
Write-Host "🎨 Iniciando Frontend..." -ForegroundColor Cyan
$frontendJob = Start-BackgroundProcess -Name "Frontend-NextJS" -Script {
    Set-Location -Path $using:PSScriptRoot
    Set-Location -Path "qr-ar-admin"
    
    $env:API_INTERNAL_BASE_URL = "http://$using:localIP:5001"
    $env:NEXT_PUBLIC_API_BASE_URL = "http://$using:localIP:5001"
    $env:HOSTNAME = "0.0.0.0"
    $env:PORT = "3000"
    
    npm run dev:mobile
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✨ ¡Sistema iniciado correctamente!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Instrucciones:" -ForegroundColor Cyan
Write-Host "   1. Espera unos segundos a que los servidores terminen de iniciar" -ForegroundColor White
Write-Host "   2. En tu computadora, abre: http://$localIP:3000" -ForegroundColor White
Write-Host "   3. En tu teléfono (misma WiFi), abre: http://$localIP:3000" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Para detener los servidores:" -ForegroundColor Cyan
Write-Host "   Presiona Ctrl+C" -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 Ver logs:" -ForegroundColor Cyan
Write-Host "   API: Receive-Job -Id $($apiJob.Id)" -ForegroundColor White
Write-Host "   Frontend: Receive-Job -Id $($frontendJob.Id)" -ForegroundColor White
Write-Host ""

# Esperar y mostrar el output de los jobs
try {
    Write-Host "📡 Monitoreando servidores (Ctrl+C para detener)..." -ForegroundColor Cyan
    Write-Host ""
    
    while ($true) {
        # Mostrar output del API
        $apiOutput = Receive-Job -Id $apiJob.Id 2>&1
        if ($apiOutput) {
            $apiOutput | ForEach-Object { Write-Host "[API] $_" -ForegroundColor Blue }
        }
        
        # Mostrar output del Frontend
        $frontendOutput = Receive-Job -Id $frontendJob.Id 2>&1
        if ($frontendOutput) {
            $frontendOutput | ForEach-Object { Write-Host "[Frontend] $_" -ForegroundColor Magenta }
        }
        
        # Verificar si los jobs siguen corriendo
        if ((Get-Job -Id $apiJob.Id).State -eq "Failed") {
            Write-Host "❌ API falló" -ForegroundColor Red
            break
        }
        if ((Get-Job -Id $frontendJob.Id).State -eq "Failed") {
            Write-Host "❌ Frontend falló" -ForegroundColor Red
            break
        }
        
        Start-Sleep -Milliseconds 500
    }
}
finally {
    Write-Host ""
    Write-Host "🛑 Deteniendo servidores..." -ForegroundColor Yellow
    
    Stop-Job -Id $apiJob.Id -ErrorAction SilentlyContinue
    Stop-Job -Id $frontendJob.Id -ErrorAction SilentlyContinue
    
    Remove-Job -Id $apiJob.Id -Force -ErrorAction SilentlyContinue
    Remove-Job -Id $frontendJob.Id -Force -ErrorAction SilentlyContinue
    
    Write-Host "✅ Servidores detenidos" -ForegroundColor Green
    Write-Host ""
}
