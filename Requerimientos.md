# Requerimientos del Proyecto de Control de Calidad - Nombre: NExtQA

## 1. Resumen General
Aplicación multiusuario para el departamento de control de calidad de una empresa (~500 empleados, equipo QA < 20 personas).

## 2. Flujo Principal
1. El administrativo crea un nuevo cliente.
2. A cada cliente se le asocian uno o más proyectos.
3. Cada proyecto contiene diferentes productos.
4. Por cada producto, se crean checklist de inspección.
5. Los inspectores, desde tabletas en la línea de montaje, seleccionan y rellenan los checklist, generando un reporte PDF.
6. El reporte PDF y los datos de inspección se guardan en una base de datos para métricas y consulta posterior.
7. Si se detecta un defecto grave, el sistema envía automáticamente un correo electrónico a una lista editable de destinatarios.

## 3. Pantallas y Funcionalidades
- **Panel Admin/Debug:** Gestión de usuarios (crear, modificar, eliminar, asignar permisos).
- **Login:** Acceso con usuario y contraseña.
- **Equipos:** Gestión de listas de correos por equipos de trabajo.
- **Administrativo:** Alta de cliente, proyecto, línea de producción y producto.
- **Gestión de Producto:**
  - Alta, modificación y eliminación de productos.
  - Subida y visualización de plano de fabricación (PNG/JPEG, 1980x1080 px) en canvas.
  - Tabla de criterios a evaluar (puntos de inspección).
  - Asignación automática de número a cada punto.
  - Panel izquierdo tipo tabla, panel derecho visor de plano.
  - Selección de tipo: visual o dimensional.
  - Si es dimensional: especificar tipo y dimensión requerida.
  - Si es visual: check de aprobado y comentarios.
  - Asignación de gravedad y equipo responsable.
  - Zoom automático y scroll en el visor del plano por punto de inspección (hasta 800%).
- **Inspector Operativo:**
  - Iniciar sesión, seleccionar proceso y producto.
  - Inspección punto por punto, con zoom automático en el plano.
  - Validación visual de mediciones (indica si está dentro del rango aceptable).
  - Notificación automática a equipos responsables en caso de defecto grave.
  - Guardado de resultados y PDF en la base de datos.
  - Generación de métricas KPI.
- **Panel Gerencial/Administrativo:**
  - Vista general de procesos activos y usuarios conectados.
  - Acceso a reportes históricos y PDF.
  - Gráficas de control estadístico y cantidad de defectos.
  - Sección de alertas críticas.
- **Chat Global:** Comunicación interna para evitar uso de WhatsApp.

## 4. Requerimientos Técnicos
- Priorizar funcionalidad completa y usabilidad.
- Tecnologías: HTML, CSS, JavaScript, React, Node.js, PostgreSQL (actual), Electron solo si se requiere versión de escritorio.
- Sistema fácil de usar y administrar (pensado para project manager, no programador experto).
- Correos automáticos configurables y editables desde formulario.
- Reportes PDF accesibles para consulta y descarga.
- Métricas y análisis posteriores sobre los datos de inspección.

## 5. Ajustes y Mejoras Implementadas
- El plano de fabricación se guarda y recupera correctamente, con nombre personalizado por producto.
- Solo existe un checklist por producto; al crear uno nuevo, se elimina el anterior.
- El zoom, scroll y viewport de cada punto de inspección se guardan y recuperan correctamente.
- Validación visual de mediciones y notificación automática a equipos responsables.
- El inspector ve el plano enfocado automáticamente al seleccionar cada punto.
- Los resultados y PDF se guardan en la base de datos y son accesibles desde el panel de reportes.
- El sistema está preparado para métricas KPI y análisis gerencial.

## 6. Pendientes y Siguientes Pasos
- Mejorar la visualización de KPIs y métricas en el panel gerencial.
- Integrar y probar el chat global.
- Validar la lógica de notificación automática y edición de destinatarios.
- Documentar el flujo de usuario inspector y administrativo.

---
Este archivo se irá actualizando conforme avance el proyecto y se ajusten los requerimientos.
