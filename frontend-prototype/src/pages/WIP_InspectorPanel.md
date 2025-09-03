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

### 1. Integración del visor de plano real (Canvas)

- Se reemplazó el visor placeholder por el componente `CanvasEditor`, que permite mostrar una imagen de plano, añadir y editar puntos, y realizar zoom.
- El canvas ahora recibe los puntos y el punto seleccionado desde la tabla, y sincroniza el enfoque y el zoom automáticamente.
- El scroll y el zoom se ajustan al seleccionar un punto, cumpliendo el requerimiento de enfoque automático.
- El estado de imagen y puntos se gestiona en el panel, permitiendo futuras integraciones con backend.
- Listo para pruebas funcionales y siguientes pasos de integración.

## 2. Limpieza y consolidación de estilos CSS

- Se eliminó la anidación incorrecta tipo SCSS y se reescribió todo el archivo usando solo sintaxis CSS estándar.
- Se consolidaron los estilos para `.inspector-main`, `.inspector-left`, `.inspector-right`, `.canvas-placeholder`, `.inspector-btn`, y `.inspector-point`.
- El layout ahora es coherente con el JSX y la referencia visual: el visor de plano es más grande, los botones y la tabla están alineados y la experiencia es óptima para tabletas.
- El archivo está listo para ajustes visuales menores o pruebas en dispositivos reales.

---
Este archivo se irá actualizando con cada avance y decisión tomada en el desarrollo de la pantalla de inspección.
