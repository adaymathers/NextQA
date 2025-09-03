# Documentación de `server.js`

## Descripción General
Este archivo implementa el servidor principal del backend utilizando Node.js y Express. Gestiona los endpoints para la administración de productos, proyectos, equipos, clientes, líneas de producción y checklists. Además, integra la generación y descarga de PDFs de checklists utilizando el módulo `generarChecklistPDF.js` con jsPDF y jsPDF-autotable.

## Funcionalidades Principales
- **CRUD de entidades:** Productos, Proyectos, Equipos, Clientes, Líneas de Producción, Checklists.
- **Generación de PDF:** Endpoint para generar y descargar el PDF de un checklist, con formato profesional y tabla de puntos de inspección.
- **Integración con Prisma:** Acceso y manipulación de datos en PostgreSQL mediante Prisma ORM.
- **Manejo de archivos:** Descarga de PDFs y gestión de rutas de archivos temporales.
- **Validaciones y logs:** Validación de datos recibidos y registro de logs para depuración.

## Endpoints Destacados
- `GET /api/checklist/:id/pdf` — Genera y descarga el PDF de un checklist usando jsPDF.
- `POST /api/product` — Crea un nuevo producto.
- `GET /api/products` — Lista todos los productos.
- `POST /api/project` — Crea un nuevo proyecto.
- `GET /api/projects` — Lista todos los proyectos.
- `POST /api/team` — Crea un nuevo equipo.
- `GET /api/teams` — Lista todos los equipos.
- `POST /api/client` — Crea un nuevo cliente.
- `GET /api/clients` — Lista todos los clientes.
- `POST /api/checklist` — Crea un nuevo checklist.
- `GET /api/checklists` — Lista todos los checklists.

## Integración de PDF
- Utiliza el módulo `generarChecklistPDF.js` para crear el PDF de checklist.
- El PDF incluye los datos del producto, proyecto, cliente y todos los puntos de inspección.
- El formato de la tabla se ajusta para visualización profesional.

## Consideraciones Técnicas
- El archivo sigue las reglas de modularidad y claridad definidas en `Agent.md`.
- Los endpoints están documentados y validados para asegurar integridad de datos.
- Se recomienda revisar los logs en caso de errores o datos faltantes.

## Mantenimiento y Extensión
- Para agregar nuevas entidades o endpoints, seguir la estructura modular existente.
- Para modificar el formato del PDF, editar el módulo `generarChecklistPDF.js`.
- Documentar cualquier cambio relevante en este archivo y en `WIP.md`.

## Autoría y Créditos
Desarrollado por el equipo de QA Panel siguiendo las reglas de `Agent.md` y la estrategia de depuración de `WIP.md`.
