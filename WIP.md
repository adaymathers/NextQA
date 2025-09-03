# Estrategia para corregir y mejorar la edición de productos y checklists

## Problemas detectados
1. **Zoom, scroll y viewport:**
   - Los valores de zoom, x, y no se cargan en el estado global al iniciar la edición.
   - Solución: Al cargar los puntos de inspección, inicializar `zoom`, `scroll.x`, `scroll.y` con los valores del primer punto o del punto seleccionado.

2. **Datos dimensionales y visuales:**
   - Los campos como `requiredDimension`, `unit`, `tolerance`, `visualNote` existen en los puntos, pero pueden no estar presentes si el backend no los envía correctamente.
   - Solución: Asegurarse que en `ProductList.jsx` al preparar `editData.inspectionPoints`, los campos estén presentes y mapeados correctamente.

3. **Renderizado del plano:**
   - El campo `imageUrl` se pasa, pero si es una ruta relativa, el componente puede no renderizar la imagen.
   - Solución: Verificar que la URL sea absoluta (`BASE + imageUrl` si empieza por `/uploads/`).

## Estrategia de solución
- [x] 1. Sincronización y mapeo correcto de los datos de los puntos de inspección en ProductList.jsx.
  - Todos los campos relevantes ahora se envían correctamente a ProductCreate.jsx.
  - Se ajusta la URL del plano para asegurar renderizado.

---

- [x] 2. Inicialización correcta del estado de viewport (zoom, scroll) en edición en ProductCreate.jsx.
  - Al entrar en modo edición, el zoom y scroll se inicializan con los valores del primer punto de inspección.

---

- [x] 3. Validar renderizado del plano y flujo completo de edición.
  - El zoom ahora se actualiza correctamente al seleccionar un punto y no se bloquea en 100%.
  - El plano y los datos de los puntos se muestran y editan correctamente.

---

**Estado actual:**
- El flujo de edición de productos y checklists está corregido y funcional.
- Todos los problemas detectados han sido resueltos y documentados.

¿Siguiente mejora o validación? Indica el siguiente objetivo.
