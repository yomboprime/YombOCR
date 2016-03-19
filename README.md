# YombOCR
Reconocedor de tipografía del ZX Spectrum

GPL v3 --- Juan José Luna Espinosa juanjoluna at gmail.com


## Qué es y qué hace

YombOCR es un programa HTML5/javascript que como entrada admite una imagen (con listado C/M sólo, de momento) y como salida emite el texto leído.


## Prerequisitos

- Imagen con texto en letra de tipografia spectrum, con un listado C/M (código máquina) al estilo de MicroHobby.
- Cada línea debe tener el formato
    <número de línea en decimal> <20 caracteres hexadecimales> <checksum en decimal>
- Imagen nítida idealmente escaneada a 600 dpi (los caracteres han de tener 32 pixels al menos), limpio  otros textos, líneas o manchas grandes (pequeños puntos son factibles)
- Letras negras sobre fondo de color plano (no importan los puntos diminutos de colores de la imprenta)
- Texto alineado con la horizontal y vertical (aunque se admite un poco de inclinación)
- Los píxels pertenecientes a los bordes de la imagen han de ser del color del fondo (se pueden limpiar a mano)

## Instalación

Como programa web, no es necesario instalarlo, lo puedes usar directamente desde http://yombo.org/datos/YombOCR

El programa es HTML estático, no necesita nada del servidor. Por tanto, puedes correr tu propio servidor y usarlo en tu máquina, asi:

- Descarga YombOCR desde la página del proyecto, http://github.com/yomboprime/YombOCR
- Instala Python si no lo tienes ya.
- abre una consola y haz cd al directorio de YombOCR
- Ejecuta python -m SimpleHTTPServer 80
- El servidor está corriendo en tu máquina. Para acceder, ves en tu navegador a http://localhost
- Para terminar el servidor, pulsa ctrl-c en la consola.


## Funcionamiento

El botón del medio del ratón sirve para desplazar la vista de la imagen en pantalla. La rueda cambia el zoom.

Pasos a seguir para obtener el texto de una imagen:

1 - Pulsar botón Cargar Imagen y seleccionar una imagen (.png, .jpg, .gif) del disco duro.

2 - Pulsar en el botón Filtrar. Hay que ir ajustando los tres valores de umbral de cada canal (Rojo, Verde y Azul) y pulsando en Filtrar hasta que las letras filtradas se vean lo mejor posible.

3 - Pulsar el botón Analizar Imagen. Esta operación tarda un poco. Al terminar, se muestra información de caracteres y líneas.

4 - Si en el paso anterior ha habido caracteres no reconocidos (se indica en el panel de info, y se muestran recuadrados en rojo), es mejor volver a probar con otros umbrales (es decir, volver al paso 3) Si no se consiguen eliminar todos los caracteres erróneos, clicar sobre los que queden y modificarlos cambiando el valor al lado del botón Modificar y pulsar este botón, para cada uno.

5 - Pulsar en Obtener texto. Se mostrará el texto y los números de las líneas que tienen errores de checksum.

6 - Verificar el texto de salida en las líneas indicadas con errores y modificar el texto erróneo. Pulsar en Comprobar texto para ver que los números de líneas con errores van desapareciendo.

7 - Finalmente, copiar el texto de salida o bien pulsar en Obtener fichero binario para guardar el fichero binario con los datos.


Los umbrales son los valores máximos de cada canal para que un píxel se considere negro. Si algun canal supera el umbral, el pixel es blanco.

Tras pulsar en Analizar imagen, si se pulsa en un caracter se mostrará info gráfica del muestreo en la imagen e info textual del carácter en el panel lateral.


