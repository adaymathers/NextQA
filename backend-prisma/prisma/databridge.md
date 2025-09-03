
## Modelo de datos sugerido

- **Cliente**
	- id
	- nombre
	- proyectos: [Proyecto]

- **Proyecto**
	- id
	- nombre
	- clienteId
	- productos: [Producto]
	- lineas: [Linea]

- **Producto**
	- id
	- nombre
	- proyectoId
	- equipos: [Equipo] (notificación de defectos)

- **Equipo**
	- id
	- nombre
	- productos: [Producto] (opcional)

- **Linea**
	- id
	- nombre
	- proyectoId
	- inspecciones: [Inspeccion]

- **Inspeccion**
	- id
	- productoId
	- lineaId
	- fecha
	- resultado

## Sidebar sugerido

- Inspector (único acceso para inspecciones)
- Gerencial (panel para ver estado de líneas, equipos y resultados)
- Equipos
- Clientes
- Proyectos
- Líneas
- Alta Producto

## Notas
- Elimina "Checklist" e "Inspecciones" del sidebar si solo necesitas "Inspector".
- Las relaciones están simplificadas para reflejar el flujo real del programa.