# 🔧 Solución Completa: Mobile + Mensajes de Error

## ✅ Problemas Resueltos

### 1. Backend no accesible desde móvil
- ✅ Detección automática mejorada de IP
- ✅ Test de conectividad en tiempo real
- ✅ Componente de debug con estado de conexión

### 2. Mensajes de error de login mejorados
- ✅ Errores específicos según código HTTP
- ✅ Detalles adicionales mostrados al usuario
- ✅ Logs detallados en consola
- ✅ Mejor manejo de errores de red

## 📝 Cambios Realizados

### Archivo 1: `ApiDebugInfo.tsx`
**Mejora:** Agregado test de conectividad en tiempo real

```typescript
// Ahora muestra:
- ✅ Conectado (verde)
- ❌ No conecta (rojo)
- Status code del servidor
```

**Ubicación:** Esquina inferior derecha (solo en desarrollo)

### Archivo 2: `authService.ts`
**Mejora:** Mensajes de error específicos

```typescript
// Códigos HTTP manejados:
- 401: Credenciales inválidas
- 404: Usuario no encontrado
- 400: Datos inválidos
- 500+: Error del servidor
- Network: No se pudo conectar
```

### Archivo 3: `login/page.tsx`
**Mejora:** UI de error mejorada

```tsx
// Ahora muestra:
- Mensaje principal del error
- Lista de detalles adicionales
- Icono de alerta
- Formato más legible
```

### Archivo 4: `AuthContext.tsx`
**Mejora:** Propagación de errores

```typescript
// Ahora lanza excepciones con:
- message: Mensaje principal
- errors: Array de detalles
```

## 🚀 Cómo Probar

### Test 1: Verificar Conectividad en Móvil

1. **Inicia los servidores:**
   ```powershell
   .\start-all.ps1
   ```

2. **En tu teléfono:**
   - Abre: `http://192.168.0.2:3000`
   - Mira la esquina inferior derecha
   - Debe mostrar:
     ```
     🌐 API Debug Info
     Frontend: 192.168.0.2
     API URL: http://192.168.0.2:5001
     Access Type: 📱 Network (Mobile)
     Status: ✅ Conectado
     ```

3. **Si dice "❌ No conecta":**
   - Verifica que el backend esté corriendo en `0.0.0.0:5001`
   - Revisa el firewall de Windows
   - Prueba directamente: `http://192.168.0.2:5001/health`

### Test 2: Probar Mensajes de Error

#### Caso 1: Contraseña Incorrecta

1. Ve a `/login`
2. Ingresa email válido: `test@example.com`
3. Ingresa contraseña incorrecta: `wrongpassword`
4. Click "Iniciar Sesión"

**Debe mostrar:**
```
🛑 Credenciales inválidas. Verifica tu email y contraseña.
• Usuario o contraseña incorrectos
```

#### Caso 2: Usuario No Existe

1. Ve a `/login`
2. Ingresa email inválido: `noexiste@example.com`
3. Ingresa cualquier contraseña
4. Click "Iniciar Sesión"

**Debe mostrar:**
```
🛑 Usuario no encontrado
• El usuario no existe en el sistema
```

#### Caso 3: Backend Apagado

1. Detén el backend (Ctrl+C en terminal API)
2. Ve a `/login`
3. Intenta iniciar sesión

**Debe mostrar:**
```
🛑 No se pudo conectar al servidor
• Verifica tu conexión a internet
• Asegúrate de que el backend esté ejecutándose
• URL intentada: http://localhost:5001/api/v1/auth/login
```

**Y el debug info mostrará:**
```
Status: ❌ No conecta
```

### Test 3: Logs en Consola

Abre la consola del navegador (F12) y observa:

**Login Exitoso:**
```
🔐 Making auth request to: http://localhost:5001/api/v1/auth/login
✅ Auth request successful
✅ Login successful in AuthContext
🔐 Attempting login for: user@example.com
✅ Login successful, redirecting...
```

**Login Fallido:**
```
🔐 Making auth request to: http://localhost:5001/api/v1/auth/login
API request failed: {status: 401, statusText: 'Unauthorized', data: {...}}
❌ Login failed in AuthContext: Credenciales inválidas...
❌ Login error: Error: Credenciales inválidas...
```

**Error de Red:**
```
Network error: TypeError: Failed to fetch
❌ Login error in AuthContext: Error: No se pudo conectar al servidor
```

## 📱 Prueba Completa en Móvil

### Paso 1: Configuración

```powershell
# En tu PC, verifica tu IP
ipconfig | Select-String "IPv4"

# Inicia ambos servidores
.\start-all.ps1

# Verifica que el backend responda
Invoke-WebRequest -Uri "http://192.168.0.2:5001/health"
```

### Paso 2: Acceso desde el Teléfono

1. **Abre el navegador** en tu teléfono
2. **Ve a**: `http://192.168.0.2:3000` (usa tu IP)
3. **Verifica el debug info** en esquina inferior derecha:
   - Debe decir "📱 Network (Mobile)"
   - Status debe ser "✅ Conectado"

### Paso 3: Prueba de Login

1. **Intenta login incorrecto:**
   - Email: `test@test.com`
   - Password: `wrong`
   - Debe mostrar error específico

2. **Intenta login correcto:**
   - Usa credenciales válidas
   - Debe redirigir a `/experiences`

3. **Verifica navegación:**
   - Ve a "Experiencias"
   - Crea una experiencia AR
   - Ábrela en tu teléfono
   - Debe funcionar con la cámara

## 🔍 Diagnóstico de Problemas

### Problema: El móvil no conecta al backend

**Verificación:**
```powershell
# 1. Verifica que el backend escuche en 0.0.0.0
Get-NetTCPConnection -LocalPort 5001 | Select-Object LocalAddress, State

# Debe mostrar: 0.0.0.0:5001 Listen

# 2. Verifica firewall
Get-NetFirewallRule -DisplayName "*QuickAR*"

# 3. Si no existe, créalo
New-NetFirewallRule -DisplayName "QuickAR API" -Direction Inbound -LocalPort 5001 -Protocol TCP -Action Allow
```

**Desde el teléfono:**
- Abre: `http://192.168.0.2:5001/health`
- Debe responder: `{"status":"Healthy"}`

### Problema: Los errores no se muestran

**Verificación:**
1. Abre consola del navegador (F12)
2. Ve a la pestaña Console
3. Busca mensajes con `🔐`, `✅`, o `❌`
4. Los errores deben aparecer en rojo

**Si no ves logs:**
```typescript
// Verifica que console.log esté habilitado
// En DevTools → Console → Settings → "Log level" debe incluir "Info"
```

### Problema: El debug info no aparece

**Verificación:**
1. Verifica que estés en modo desarrollo
2. El componente solo aparece si `NODE_ENV === "development"`
3. En producción, debes cambiar la condición en `layout.tsx`

```tsx
// Para mostrar siempre (incluso en producción):
// En layout.tsx, línea ~95, cambia:
{process.env.NODE_ENV === "development" && <ApiDebugInfo />}

// Por:
<ApiDebugInfo />
```

## ✨ Características Nuevas

### 1. Test de Conectividad Automático

El componente de debug hace un GET a `/health` al cargar:
- ✅ Verde = Conectado
- ❌ Rojo = No conecta
- 🟡 Amarillo = Verificando...

### 2. Mensajes de Error Contextuales

Los errores ahora incluyen:
- **Título principal**: Resumen del problema
- **Detalles**: Lista de posibles causas/soluciones
- **Código de estado**: Para debugging

### 3. Logs Estructurados

Todos los logs ahora usan emojis:
- 🔐 = Intentando autenticación
- ✅ = Operación exitosa
- ❌ = Error/fallo
- 🌐 = Configuración de API
- 📱 = Acceso móvil
- 💻 = Acceso desktop

## 📊 Tabla de Errores

| Código | Mensaje Principal | Detalles |
|--------|------------------|----------|
| 401 | Credenciales inválidas | Usuario o contraseña incorrectos |
| 404 | Usuario no encontrado | El usuario no existe en el sistema |
| 400 | Datos inválidos | Verifica los datos ingresados |
| 500+ | Error del servidor | El servidor encontró un problema |
| Network | No se pudo conectar | Verifica conexión y backend |

## 🎯 Próximos Pasos

1. **Prueba en tu teléfono**
   - Sigue los pasos de "Prueba Completa en Móvil"
   - Verifica que el debug info muestre "✅ Conectado"

2. **Prueba los mensajes de error**
   - Intenta login con datos incorrectos
   - Verifica que los mensajes sean claros

3. **Prueba con backend apagado**
   - Detén el backend
   - Verifica que el error sea descriptivo

4. **Reporta resultados**
   - Envía screenshot del debug info desde móvil
   - Indica si los mensajes de error se muestran correctamente

## 📸 Screenshots Esperados

### Desktop (Localhost)
```
🌐 API Debug Info
Frontend: localhost
API URL: http://localhost:5001
Source: Auto-detected
Access Type: 💻 Localhost
Status: ✅ Conectado
```

### Mobile (Red)
```
🌐 API Debug Info
Frontend: 192.168.0.2
API URL: http://192.168.0.2:5001
Source: Auto-detected
Access Type: 📱 Network (Mobile)
Status: ✅ Conectado
```

### Error de Login
```
🛑 Credenciales inválidas. Verifica tu email y contraseña.
• Usuario o contraseña incorrectos
```

---

**¿Todo funciona?** ✅
- Desktop conecta al backend
- Mobile conecta al backend
- Errores se muestran claramente
- Logs aparecen en consola

**¿Problemas?** Consulta la sección "Diagnóstico de Problemas"
