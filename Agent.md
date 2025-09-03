# Configuración del agente

## 1. Prioridad de funcionalidad
- La funcionalidad completa del proyecto siempre tiene prioridad sobre cualquier otro aspecto.
- La calidad, escalabilidad y mantenibilidad no deben sacrificarse por velocidad, salvo que se indique expresamente.

## 2. Perfil del usuario
- Entiende que no soy un programador experto. Mi rol es más cercano a un project manager.
- Explica las soluciones de forma clara, sencilla y con ejemplos cuando sea necesario.
- Documenta los pasos importantes para que pueda entender y dar seguimiento al proyecto sin ayuda externa.

## 3. Tecnologías a utilizar
- **Siempre usar:** HTML, CSS, JavaScript, React y Node.js.
- Bases de datos: seleccionar la más adecuada según el contexto (MySQL, PostgreSQL, MongoDB, o SQLite para prototipos).
- Para aplicaciones de escritorio: usar Electron.
- Para API externas: usar las librerías más estables y seguras.
- Para pruebas: usar Jest u otra herramienta apropiada.

## 4. Idioma
- Toda comunicación, comentarios, documentación y nombres de variables deben estar **en español**.

## 5. Comentarios, documentación y legibilidad
- Comenta el código de forma abundante y clara.
- Usa nombres de variables y funciones descriptivos y en español.
- Genera documentación completa en archivos `.md` para cada módulo, componente o parte importante del proyecto.
- Si son necesarios varios archivos `.md` (ejemplo: `backend.md`, `frontend.md`, `api.md`), no hay problema mientras ayuden a mantener claridad y contexto.

## 6. Autonomía y calidad
- Implementa siempre la solución más eficiente, segura, escalable y fácil de mantener.
- No pidas autorización para cada decisión técnica, pero explica los cambios clave con lenguaje sencillo.
- Anticipa riesgos y propón soluciones antes de que afecten el proyecto.

## 7. Buenas prácticas de desarrollo
- Utiliza control de versiones (Git) con ramas claras: `main`, `dev`, `feature/...`.
- Garantiza que el código sea modular y reutilizable.
- Evita dependencias innecesarias y usa paquetes actualizados y seguros.
- Aplica validaciones en FrontEnd y BackEnd para prevenir errores y vulnerabilidades.
- Maneja errores y excepciones de forma controlada.

## 8. Integración FrontEnd y BackEnd
- Mantén comunicación clara entre ambos lados para evitar rupturas.
- Sincroniza los endpoints y estructuras de datos en cada actualización.
- Realiza pruebas básicas de integración antes de marcar el sistema como estable.

## 9. Seguridad
- Protege datos sensibles (contraseñas, tokens, claves).
- No expongas credenciales en repositorios.
- Implementa protecciones contra ataques comunes: XSS, SQL Injection, CSRF, etc.

## 10. Entregables
- Cada entrega debe ser funcional, probada y estable.
- Adjunta un breve resumen en texto o `.md` de cambios, cómo probarlos y cualquier instrucción relevante.

## 11. Escalabilidad y mantenimiento
- Todo el sistema debe diseñarse para que sea **escalable** y pueda crecer sin rehacer componentes críticos.
- La estructura del proyecto debe permitir ajustes y mejoras por cualquier desarrollador humano en el futuro.
- Documenta **cada proceso, archivo y decisión clave** para que pueda continuar el desarrollo o mantenimiento sin IA.
- Genera una guía general (`README.md`) que explique el flujo completo del sistema.

## 12. Optimización
- Prioriza el rendimiento y la eficiencia sin sacrificar claridad.
- Detecta y corrige cuellos de botella de manera proactiva.
- Propón mejoras técnicas cuando detectes oportunidades.

## 13. Resiliencia sin IA
- El proyecto debe estar diseñado para que cualquier desarrollador humano pueda:
  - Entender la lógica y estructura.
  - Modificar, mantener y escalar el código.
  - Recuperar el flujo de trabajo usando solo la documentación generada.

## 14. Estructura de archivos
### 14.1 Proyectos nuevos
Para proyectos nuevos, organiza los archivos de esta manera:

/proyecto
├── backend/
│ ├── src/
│ │ ├── controllers/
│ │ ├── models/
│ │ ├── routes/
│ │ ├── services/
│ │ └── utils/
│ ├── tests/
│ └── backend.md
├── frontend/
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── hooks/
│ │ └── utils/
│ ├── tests/
│ └── frontend.md
├── docs/
│ ├── arquitectura.md
│ ├── api.md
│ └── decisiones.md
├── .gitignore
├── package.json
└── README.md

markdown
Copiar código

### 14.2 Proyectos existentes
- Si el proyecto ya tiene una estructura definida, **respétala completamente**.
- Solo agrega documentación o mejoras cuando sea seguro y no rompa el flujo actual.