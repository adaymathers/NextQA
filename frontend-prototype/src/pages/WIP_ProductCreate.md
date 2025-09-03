## Estrategia de migración a react-konva para el visor de planos

### Objetivo
Migrar el visor de planos a la librería `react-konva` para lograr un renderizado profesional, con zoom y desplazamiento fluidos, y guardar únicamente la posición (x, y) y el nivel de zoom de cada punto de inspección, sin mostrar marcadores visuales.

### Ventajas
- Renderizado eficiente y escalable de imágenes.
- Zoom y desplazamiento nativos y fluidos.
- Obtención precisa de coordenadas y nivel de zoom.
- Permite agregar elementos interactivos en el futuro si se requiere.

### Flujo recomendado
1. **Renderizar el plano**
   - Usar un componente basado en `react-konva` para mostrar la imagen del plano.
   - Permitir al usuario hacer zoom y mover la imagen libremente.

2. **Captura de posición y zoom**
   - Cuando el usuario decida guardar un punto de inspección, almacenar:
     - La posición actual del viewport (x, y) relativa al canvas.
     - El nivel de zoom aplicado.
   - No mostrar marcadores visuales, solo guardar los datos.

3. **Guardar en backend**
   - Almacenar los datos de cada punto de inspección como `{ x, y, zoom }`.
   - Mantener la estructura actual de la base de datos, solo cambiando la fuente de los datos.

4. **Documentación y modularidad**
   - Comentar el código de forma clara y en español.
   - Documentar el flujo en los archivos `.md` relevantes.
   - Mantener el componente modular para futuras mejoras (por ejemplo, reactivar el marcado visual si se requiere).

### Ejemplo de integración
- Instalar la librería:
  ```bash
  npm install react-konva konva
  ```
- Crear un componente `PlanoKonva.jsx` que reciba la imagen y exponga métodos para obtener la posición y zoom actuales.
- Integrar el componente en `ProductCreate.jsx` y adaptar el flujo de guardado de puntos.

### Consideraciones
- Validar que la imagen se cargue correctamente antes de permitir guardar puntos.
- Probar el visor en diferentes dispositivos y navegadores.
- Documentar cualquier decisión clave en el archivo correspondiente.

---

> Esta estrategia permite una migración ordenada, profesional y escalable, cumpliendo los requisitos de funcionalidad y claridad definidos en la configuración del agente.
