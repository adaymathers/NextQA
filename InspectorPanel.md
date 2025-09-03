# InspectorPanel.md

## Descripción General
Pantalla dedicada al inspector operativo para realizar el proceso de inspección de productos en la línea de montaje. Permite seleccionar línea, producto y checklist, inspeccionar punto por punto, registrar resultados y comentarios, y generar reportes.

## Funcionalidades Clave
- Selección de línea de producción y producto.
- Selección de checklist de inspección.
- Visualización de puntos de inspección en formato tabla.
- Enfoque automático en el plano al seleccionar cada punto (mock en versión actual).
- Registro de resultados (OK, NO, N/A) y comentarios por punto.
- Botón para finalizar inspección y guardar resultados.
- Exportación de reporte (mock, TXT; futuro: PDF real).
- Notificación automática a equipos responsables en caso de defectos graves.

## Estado Actual
- Mock funcional: permite seleccionar checklist, registrar resultados y exportar reporte simulado.
- El visor de plano es un placeholder; el zoom y posición son simulados.
- La integración con backend y PDF real está pendiente.

## Siguientes Pasos
- Integrar visor de plano real con zoom y scroll automático.
- Validar mediciones y mostrar si están dentro del rango aceptable.
- Integrar notificación automática y guardado real en base de datos.
- Mejorar la experiencia visual y usabilidad para el inspector.
- Documentar el flujo completo y casos de uso.

---
Este archivo se actualizará conforme avance el desarrollo de la pantalla de inspección.
