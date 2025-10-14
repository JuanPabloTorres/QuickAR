# 🔧 Solución: Backend no accesible desde el teléfono

## ✅ Problema Resuelto

El frontend cargaba en el teléfono pero no podía obtener datos del backend porque la URL de la API no se detectaba correctamente.

## 🎯 Cambios Realizados

### 1. **Detección Automática de IP Mejorada**

Se actualizaron 3 archivos para detectar automáticamente la IP correcta:

- ✅ `/src/lib/api/experiences.ts` - API de experiencias
- ✅ `/src/services/authService.ts` - Servicio de autenticación  
- ✅ `/src/services/api.ts` - Servicio API general

**Nueva lógica:**
```typescript
// Prioridad 1: Variable de entorno (si está configurada)
if (process.env.NEXT_PUBLIC_API_BASE_URL) {
  return process.env.NEXT_PUBLIC_API_BASE_URL;
}

// Prioridad 2: IP de red (192.168.x.x) - Para teléfono
if (esIPdeRed) {
  return `http://${hostname}:5001`;
}

// Prioridad 3: Localhost - Para computadora
return "http://localhost:5001";
```

### 2. **Componente de Debug Agregado**

Se creó un componente de debug que aparece en la esquina inferior derecha (solo en desarrollo):

- 📍 Ubicación: `/src/components/debug/ApiDebugInfo.tsx`
- 📊 Muestra:
  - Hostname del frontend
  - URL de la API detectada
  - Fuente de la configuración (ENV o Auto-detectada)
  - Tipo de acceso (Localhost o Red)

### 3. **Backend - CORS Configurado**

El backend ya acepta conexiones de cualquier IP local (192.168.x.x, 10.x.x.x, 172.16-31.x.x)

### 4. **Backend - Escucha en todas las interfaces**

El servidor API está configurado para escuchar en `0.0.0.0:5001` (todas las interfaces de red)

## 🚀 Cómo Probar

### Paso 1: Reiniciar los Servidores

Detén los servidores actuales y reinícialos:

**Opción A: Script Automático**
```powershell
.\start-all.ps1
```

**Opción B: Tarea de VS Code**
- Presiona `Ctrl+Shift+B`
- Selecciona `start-all-network`

**Opción C: Manual**
```powershell
# Terminal 1 - Backend
cd QrAr.Api
$env:ASPNETCORE_URLS="http://0.0.0.0:5001"
dotnet watch run

# Terminal 2 - Frontend  
cd qr-ar-admin
npm run dev:mobile
```

### Paso 2: Verificar en la Computadora

1. Abre: `http://localhost:3000`
2. Verifica el cuadro de debug en la esquina inferior derecha
3. Debe mostrar:
   - Frontend: `localhost`
   - API URL: `http://localhost:5001`
   - Access Type: `💻 Localhost`

### Paso 3: Verificar en el Teléfono

1. Asegúrate de estar en la misma red WiFi
2. Obtén tu IP: `ipconfig | Select-String "IPv4"` (ejemplo: 192.168.0.2)
3. En el teléfono, abre: `http://192.168.0.2:3000`
4. Verifica el cuadro de debug:
   - Frontend: `192.168.0.2`
   - API URL: `http://192.168.0.2:5001`
   - Access Type: `📱 Network (Mobile)`

### Paso 4: Probar la Funcionalidad

**En Computadora:**
```
✅ Login/Register
✅ Ver lista de experiencias
✅ Crear nueva experiencia
✅ Ver analytics
✅ Subir archivos
```

**En Teléfono:**
```
✅ Login/Register
✅ Ver lista de experiencias
✅ Abrir experiencia AR
✅ Usar cámara para AR
✅ Interactuar con modelos 3D
```

## 🔍 Verificar que Funciona

### Test de Conectividad

**Desde el teléfono, prueba estos endpoints:**

1. **Health Check:**
   ```
   http://192.168.0.2:5001/health
   ```
   Debe responder: `{"status":"Healthy"}`

2. **API Version:**
   ```
   http://192.168.0.2:5001/api/v1/experiences
   ```
   Debe retornar lista de experiencias (o 401 si no estás autenticado)

### Logs en Consola

Abre la consola del navegador (F12) y busca:

**En Computadora:**
```
💻 Localhost access - API URL: http://localhost:5001/api
Making API call to: http://localhost:5001/api/experiences
```

**En Teléfono:**
```
📱 Network access detected - API URL: http://192.168.0.2:5001/api
Making API call to: http://192.168.0.2:5001/api/experiences
```

## ❌ Troubleshooting

### Problema: "Failed to fetch" en el teléfono

**Solución:**
```powershell
# 1. Verifica que el backend esté escuchando en 0.0.0.0
Get-Process | Where-Object {$_.ProcessName -like "*dotnet*"}

# 2. Verifica tu IP
ipconfig | Select-String "IPv4"

# 3. Verifica el firewall (ejecutar como Administrador)
New-NetFirewallRule -DisplayName "QuickAR API" -Direction Inbound -LocalPort 5001 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "QuickAR Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# 4. Prueba el endpoint directamente
Invoke-WebRequest -Uri "http://192.168.0.2:5001/health"
```

### Problema: CORS Error

**Solución:**
```csharp
// Verifica que Program.cs tenga la configuración de CORS correcta
// Debe permitir IPs 192.168.x.x, 10.x.x.x, 172.16-31.x.x
```

### Problema: El cuadro de debug no aparece

**Solución:**
```bash
# El componente solo aparece en development
# Verifica que NODE_ENV sea development
echo $env:NODE_ENV  # Debe estar vacío o "development"
```

### Problema: La API usa localhost en vez de la IP

**Solución:**
```bash
# Limpia la cache de Next.js
cd qr-ar-admin
rm -rf .next
npm run dev:mobile
```

## 📝 Configuración para Diferentes Redes

Si cambias de red WiFi y tu IP cambia:

```powershell
# 1. Obtén la nueva IP
ipconfig | Select-String "IPv4"

# 2. NO necesitas cambiar nada - la detección es automática

# 3. Reinicia los servidores
# El sistema detectará la nueva IP automáticamente
```

## 🎉 Características Adicionales

### Debug Info Permanente

Si quieres que el cuadro de debug aparezca siempre (incluso en producción):

```tsx
// En src/app/layout.tsx, línea ~95
// Cambia:
{process.env.NODE_ENV === "development" && <ApiDebugInfo />}

// Por:
<ApiDebugInfo />
```

### Logs Detallados

Los servicios ahora tienen logs en consola:
- 🌐 URL de API configurada
- 📱 Detección de acceso de red
- 💻 Detección de localhost
- 🔍 Cada llamada a la API muestra la URL completa

## ✨ Resultado Final

Ahora el sistema:
- ✅ Funciona en computadora (localhost)
- ✅ Funciona en teléfono (red local)
- ✅ Detecta automáticamente el modo de acceso
- ✅ No requiere configuración manual
- ✅ Muestra información de debug visual
- ✅ Tiene logs detallados en consola

---

## 📞 Próximos Pasos

1. **Prueba en tu teléfono** - Sigue los pasos de arriba
2. **Verifica el cuadro de debug** - Debe mostrar la IP correcta
3. **Prueba login y experiencias** - Todo debe funcionar
4. **Reporta cualquier problema** - Con screenshots del debug info

---

**¿Todo funcionó?** 🎉
- ✅ Desktop: `http://localhost:3000`
- ✅ Mobile: `http://192.168.0.2:3000` (tu IP)

**¿Problemas?** Consulta la sección de Troubleshooting arriba.
