# WIP_InspectorPanel.md

## Work In Progress: Pantalla de Proceso de Inspección

### Objetivo
Desarrollar la pantalla operativa para el inspector, permitiendo realizar inspecciones punto por punto, registrar resultados, comentarios y generar reportes, con integración total al backend y métricas.

### Pasos a Realizar
1. Integrar visor de plano real (canvas) con zoom y scroll automático por punto.
2. Sincronizar selección de punto en tabla con enfoque en el plano.
3. Validar mediciones dimensionales y mostrar si están dentro del rango aceptable.
4. Registrar resultados y comentarios por punto.
5. Guardar inspección en la base de datos y generar PDF real.
6. Implementar notificación automática a equipos responsables en caso de defectos graves.
7. Mejorar la experiencia visual y usabilidad (diseño, accesibilidad, feedback visual).
8. Documentar el flujo de usuario y casos de uso.

### Estatus Actual
- Mock funcional: selección de checklist, registro de resultados y exportación de reporte simulado.
- El visor de plano es un placeholder; zoom y posición simulados.
- Falta integración con backend y PDF real.
- No hay validación visual de mediciones ni notificación automática.

### Siguientes Acciones
- [ ] Integrar canvas real y sincronización con puntos.
- [ ] Validar mediciones y mostrar feedback visual.
- [ ] Guardar inspección y PDF en backend.
- [ ] Implementar notificación automática.
- [ ] Mejorar UI y experiencia de usuario.
- [ ] Actualizar documentación y requerimientos.

## Paso 1: Integrar InspectorPanel.css y adaptar JSX

- [x] Crear archivo InspectorPanel.css con estilos responsivos y optimizados para tabletas Android.
- [ ] Integrar InspectorPanel.css en InspectorPanel.jsx (`import './InspectorPanel.css'`).
- [ ] Adaptar las clases en el JSX para aprovechar los estilos dedicados.
- [ ] Probar en tabletas y ajustar tamaños, espaciado y usabilidad.

---
Este archivo se irá actualizando con cada avance y decisión tomada en el desarrollo de la pantalla de inspección.
