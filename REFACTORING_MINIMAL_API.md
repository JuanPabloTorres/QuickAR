# Refactorización a Minimal API con Controllers

## Resumen de Cambios

Se ha refactorizado la aplicación para mover los endpoints de Minimal API desde `Program.cs` a sus respectivos controllers, manteniendo la funcionalidad de Minimal API pero organizando mejor el código.

## Estructura Actualizada

### 1. ExperiencesController
- **Ubicación**: `Controllers/ExperiencesController.cs`
- **Método de extensión**: `MapExperienceEndpoints(IEndpointRouteBuilder app)`
- **Endpoints**:
  - `GET /api/experiences` - Obtener todas las experiencias
  - `GET /api/experiences/{id:guid}` - Obtener experiencia por ID
  - `GET /api/experiences/slug/{slug}` - Obtener experiencia por slug
  - `POST /api/experiences` - Crear nueva experiencia
  - `PUT /api/experiences/{id:guid}` - Actualizar experiencia
  - `DELETE /api/experiences/{id:guid}` - Eliminar experiencia
  - `PATCH /api/experiences/{id:guid}/toggle-active` - Alternar estado activo

### 2. FileUploadController
- **Ubicación**: `Controllers/FileUploadController.cs`
- **Método de extensión**: `MapFileUploadEndpoints(IEndpointRouteBuilder app)`
- **Endpoints**:
  - `POST /api/upload/{category}` - Subir archivo
  - `DELETE /api/upload/{category}/{fileName}` - Eliminar archivo

### 3. AnalyticsController
- **Ubicación**: `Controllers/AnalyticsController.cs`
- **Método de extensión**: `MapAnalyticsEndpoints(IEndpointRouteBuilder app)`
- **Endpoints**:
  - `POST /api/analytics/track` - Trackear evento de analytics
  - `GET /api/analytics/events` - Obtener eventos de analytics
  - `GET /api/analytics/stats/{experienceId:guid}` - Obtener estadísticas por experiencia

### 4. HealthController (Nuevo)
- **Ubicación**: `Controllers/HealthController.cs`
- **Método de extensión**: `MapHealthEndpoints(IEndpointRouteBuilder app)`
- **Endpoints**:
  - `GET /health` - Health check

## Cambios en Program.cs

Se limpiaron todos los endpoints inline y se reemplazaron con las llamadas a los métodos de extensión:

```csharp
// API Routes - Register endpoint groups from controllers
QrAr.Api.Controllers.ExperiencesController.MapExperienceEndpoints(app);
QrAr.Api.Controllers.FileUploadController.MapFileUploadEndpoints(app);
QrAr.Api.Controllers.AnalyticsController.MapAnalyticsEndpoints(app);
QrAr.Api.Controllers.HealthController.MapHealthEndpoints(app);
```

También se agregó `builder.Services.AddControllers()` para soportar los controllers tradicionales cuando sea necesario.

## Beneficios

1. **Organización**: Los endpoints están organizados en sus respectivos controllers
2. **Mantenibilidad**: Es más fácil mantener y encontrar endpoints específicos
3. **Reutilización**: Los controllers mantienen tanto endpoints tradicionales como Minimal API
4. **Escalabilidad**: Fácil agregar nuevos endpoints agrupados por funcionalidad
5. **Documentación**: Swagger/OpenAPI continúa funcionando con todas las configuraciones de Tags y Summary

## Pruebas

- La aplicación compila sin errores
- La API se ejecuta correctamente en `https://localhost:5002`
- Swagger UI está disponible en `https://localhost:5002/swagger`
- Todos los endpoints mantienen la misma funcionalidad que antes