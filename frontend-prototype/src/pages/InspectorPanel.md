# InspectorPanel.md

## Descripción General
Pantalla dedicada al inspector operativo para realizar el proceso de inspección de productos en la línea de montaje. Permite seleccionar línea, producto y checklist, inspeccionar punto por punto, registrar resultados y comentarios, y generar reportes.


## Requerimientos de UI

- El panel debe estar dividido en dos secciones principales: "Puntos de Inspección" (izquierda) y "Visor" (PlanoKonva.jsx)(derecha).
- Encabezado superior con los siguientes campos y controles:
	- Inspector: campo de texto obtenido de la sesion.
	- Línea: selector desplegable / usar api.
	- Proyecto: selector desplegable / usar api.
	- Producto: selector desplegable / usar api.
	- Fecha y hora actual, alineada a la derecha.
	- Botón destacado "Cargar Checklist" para iniciar la inspección.
- Sección "Puntos de Inspección":
	- Tabla con cada punto numerado (1, 2, ...).
	- Para puntos visuales:
		- Etiqueta "Visual" y campo "Gravedad", obtenidos de api.
		- Campo "Descripción" editable.
		- Selección de resultado: OK, NO-OK, N/A (radio buttons).
		- Campo "Comentarios" editable.
	- Para puntos dimensionales:
		- Etiqueta "Dimensional" y campo "Gravedad".
		- Campos "Valor", "UM" (unidad de medida), "TL" (tolerancia).
		- Selección de resultado: OK, NO-OK, N/A.
		- Campos "Valor Real" y "Diferencia" para registrar medición y desviación.
		- Campo "Comentarios" editable.
- Sección "Visor":
	- Muestra la imagen/plano del producto.
	- Debe permitir visualizar dimensiones y detalles relevantes.
- Paleta de colores y estilo:
	- Fondo principal blanco, secciones y controles destacados en amarillo (#EAB308).
	- Bordes y separadores en negro.
	- Textos principales en negro, textos secundarios en gris.
	- Botones y selectores con estilo consistente y accesible.
- El layout debe ser responsivo y mantener la proporción entre "Puntos de Inspección" y "Visor".
- Todos los campos deben ser fácilmente editables y accesibles para el inspector.
- El diseño debe facilitar la navegación rápida entre puntos y la visualización clara de resultados.
- Al seleccionar un punto de inspeccion, debe auto-enfocarse el plano. Al igual que se hace en ProductCreate.jsx


## Para construir el nuevo InspectorPanel.jsx desde cero, necesitas saber:

# ¿Qué funcionalidad principal debe tener el panel? 
Realizar inspecciones en proceso.

# ¿Qué campos y controles visuales debe mostrar? 
Las referentes a los requerimientos de UI

# ¿Qué estilo visual prefieres? 
Corporativo e ideal para tabletas.

# ¿Qué endpoints del backend quieres consumir en este panel? 
Los referentes a User de donde se obtendra el usuario actual (correo electronico)
Linea (Para cargar el combobox de lineas)
Proyecto (Para cargar el combobox de proyectos y obtener los productos del proyecto)
Productos (Para obtener los productos del proyecto, y sus correspondientes checklist y puntos de inspeccion)
Inspections (Para guardar los datos recopilados durante el proceso de inspeccion)
Equipos (Por si es necesario notificar en caso de un defecto grave)

# ¿Debo incluir lógica de autenticación/rol para mostrar u ocultar acciones según el usuario?

Las acciones de esta pagina son operativas, asi que no deberia haber funciones ocultas.

### Datos que deben guardarse en la base de datos

## Metadatos de la inspeccion

    -Inspector (Correo electronico)
    -Linea 
    -Proyecto
    -Producto
    -Fecha y hora

## Datos de puntos de Inspeccion

# Resultados Visuales
  Para cada punto
  -Numero de punto
  -Etiqueta
  -Gravedad
  -Resultado (status)
  -Comentarios

# Resultados dimensionales
  Para cada punto
  -Numero de Punto
  -Etiqueta
  -Resultado
  -Valor Real
  -Diferencia
  -Comentarios

    