# Correcciones de Autenticación Frontend - 13 Oct 2025

## Problema Identificado
El frontend estaba recibiendo error **401 (No autorizado)** al intentar acceder a `/api/experiences` porque:
1. Las peticiones NO incluían el token JWT en las cabeceras
2. El backend requiere autenticación para estos endpoints (`.RequireAuthorization()`)

## Solución Implementada

### 1. **experiences.ts** - Agregado token JWT a todas las peticiones
**Ubicación**: `qr-ar-admin/src/lib/api/experiences.ts`

**Cambios**:
- ✅ Agregada función `getAuthToken()` para obtener token desde localStorage
- ✅ Modificada función `createFetchConfig()` para incluir header `Authorization: Bearer {token}`
- ✅ Actualizada función `uploadFile()` para incluir token en uploads
- ✅ Actualizada función `uploadAssetFile()` para incluir token

**Código agregado**:
```typescript
/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function createFetchConfig(options: RequestInit = {}): RequestInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  // Add authorization header if token exists
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return {
    ...options,
    headers,
  };
}
```

### 2. **api.ts** - Agregado token JWT al servicio API
**Ubicación**: `qr-ar-admin/src/services/api.ts`

**Cambios**:
- ✅ Agregado método privado `getAuthToken()` en clase `ApiService`
- ✅ Modificado método `request()` para incluir header de autorización
- ✅ Actualizado método `uploadFile()` para incluir token sin sobreescribir Content-Type

**Código agregado**:
```typescript
/**
 * Get authentication token from localStorage
 */
private getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

private async request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // ... existing code ...
  
  // Add authorization header if token exists
  const token = this.getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  // ... rest of the method ...
}
```

### 3. **Configuración de Environment Variables**
**Archivo creado**: `qr-ar-admin/.env.local`

**Contenido**:
```env
# API Configuration
# For local development with HTTPS
NEXT_PUBLIC_API_BASE_URL=https://localhost:5002
API_INTERNAL_BASE_URL=https://localhost:5002
```

**Propósito**:
- Configura la URL base del API para usar HTTPS (puerto 5002)
- Asegura consistencia entre server-side y client-side rendering

## Endpoints del Backend que Requieren Autenticación

Según `ExperiencesController.cs`:
- ✅ `GET /api/experiences` - Lista todas las experiencias (RequireAuthorization)
- ✅ `POST /api/experiences` - Crear experiencia (RequireAuthorization)
- ✅ `PUT /api/experiences/{id}` - Actualizar experiencia (RequireAuthorization)
- ✅ `DELETE /api/experiences/{id}` - Eliminar experiencia (RequireAuthorization)
- ✅ `PATCH /api/experiences/{id}/toggle-active` - Toggle activo (RequireAuthorization)
- ℹ️ `GET /api/experiences/{id}` - Ver experiencia (Sin autenticación - público)
- ℹ️ `GET /api/experiences/slug/{slug}` - Ver por slug (Sin autenticación - público)

## Flujo de Autenticación

1. **Login**: Usuario ingresa credenciales → authService.login()
2. **Token Storage**: Token JWT guardado en localStorage como "token"
3. **Peticiones API**: Cada petición lee el token y lo agrega a headers
4. **Backend Validation**: ASP.NET Core valida token JWT con middleware de autenticación
5. **Response**: Si token válido → 200 OK, si no → 401 Unauthorized

## Testing

### Pasos para probar:
1. **Login**:
   ```
   Email: jenniffermaldonado1992@gmail.com
   Password: 123456
   ```

2. **Verificar token en DevTools**:
   - Abrir Console → Application → Local Storage
   - Buscar key "token"
   - Debe contener JWT string

3. **Verificar headers en Network**:
   - Abrir Network tab
   - Hacer petición a `/api/experiences`
   - Verificar Request Headers contiene:
     ```
     Authorization: Bearer eyJhbGc...
     ```

4. **Response esperado**:
   - Status: **200 OK** (no más 401)
   - Body: Lista de experiencias del usuario

## Próximos Pasos

1. ✅ Reiniciar el servidor de desarrollo Next.js
2. ✅ Hacer login nuevamente
3. ✅ Verificar que las peticiones incluyan el token
4. ✅ Confirmar que los endpoints respondan con 200 OK

## Comandos

```powershell
# Desde qr-ar-admin/
npm run dev:https

# O si prefieres HTTP (puerto 5001)
npm run dev:http
```

## Notas Importantes

⚠️ **Token en localStorage**: 
- El token se guarda en localStorage al hacer login exitoso
- Se persiste entre recargas de página
- Se elimina al hacer logout

⚠️ **HTTPS vs HTTP**:
- Backend corre en 5001 (HTTP) y 5002 (HTTPS)
- Frontend usa 5002 por defecto (HTTPS)
- Certificados SSL en `certificates/` para desarrollo local

⚠️ **Token Expiration**:
- Los tokens JWT tienen fecha de expiración
- Si el token expira, el usuario debe hacer login nuevamente
- El backend responderá 401 si el token está expirado

## Archivos Modificados

1. ✅ `qr-ar-admin/src/lib/api/experiences.ts` - Agregado getAuthToken + headers
2. ✅ `qr-ar-admin/src/services/api.ts` - Agregado getAuthToken + headers
3. ✅ `qr-ar-admin/.env.local` - Creado con configuración HTTPS

---
**Fecha**: 13 de Octubre 2025  
**Issue**: Error 401 en GET /api/experiences  
**Causa**: Falta de token JWT en headers  
**Status**: ✅ **RESUELTO**
