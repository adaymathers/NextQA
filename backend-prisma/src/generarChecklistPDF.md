### Requerimientos para estructura del PDF de Producto
#### No modificar en modo agente

## Datos obtenibles desde la pagina ProductCreate.jsx

# Variables unificadas para checklist (coinciden frontend, backend y Prisma)

## Datos dimensionales
- num: Número de punto (se asigna automáticamente)
- dimensionType: Tipo de dimensión (ej. longitudinal, angular)
- valor: Valor de la dimensión requerida
- unidad: Unidad de medida (ej. mm, cm, etc)
- tolerancia: Tolerancia permitida
- severity: Gravedad
- team: Equipo responsable
- zoom: Zoom del plano
- xPct: Posición X en el plano
- yPct: Posición Y en el plano
- label: Resumen del punto (valor + unidad + tolerancia)

## Datos visuales
- num: Número de punto
- label: Descripción visual
- severity: Gravedad del hallazgo visual (ej. Alta, Media, Baja)
- team: Equipo responsable
- zoom: Zoom del plano
- xPct: Posición X en el plano
- yPct: Posición Y en el plano

Todos estos campos se usan y se guardan igual en frontend, backend y base de datos para asegurar consistencia y facilidad de mantenimiento.

# Datos Visuales
severity: Gravedad del hallazgo visual (ej. "Alta", "Media", "Baja").
team: Equipo responsable del punto visual.
visualNote: Nota o descripción del hallazgo visual.
number: Número de punto (se asigna automáticamente)

## Estructura

1.- Encabezado

    ID del Producto de la base de datos - No es necesario
    Producto (Nombre que se introduce en el formulario)
    Proyecto (Proyecto al que pertece el producto)
    Cliente (Cliente al que pertenece el proyecto)
    Creado por: Correo del usuario que crea el producto, puede ser extraido de la base de datos, pero no debe ser el ID, debe ser el correo.
    Fecha de creacion: Fecha en que se genera el PDF, con fecha y hora.

2.- Seccion de llenado de metadatos, cada uno en un renglon.
    Nombre del inspector:
    Fecha de Inspeccion:
    Linea:

3.- Seccion de puntos de Inspeccion dimensionales (Tabla) (Lista de Columnas)
    Numero de Punto de Inspeccion
    Tipo de Dimension (Longitudinal o Angular)
    Valor establecido de la dimension, se puede resumir como Valor
    Unidad (Unidad de medida: cm, mm, etc)
    Tolerancia 
    Gravedad
    Medida (Campo vacio donde el usuario escribira el valor dimensional que midio en el proceso al momento de imprimir)

4.- Seccion de puntos de Inspeccion Visual (Tabla) (Lista de Columnas)

    Numero de Punto de Inspeccion
    Descripcion
    Gravedad
    Check de Verificacion
    Seccion de Comentarios Inferior, debajo de cada punto de inspeccion.

5.- Seccion del Plano

    Orientacion Horizontal
    Cargar Plano sin Margenes
    Pie de Pagina con Nombre del Producto

