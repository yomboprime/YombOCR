
// Coger elementos HTML
var botonFiltrarImagen = document.getElementById( "botonFiltrarImagen" );
var botonAnalizarBlobs = document.getElementById( "botonAnalizarBlobs" );
var editUmbralR = document.getElementById( "editUmbralR" );
var editUmbralG = document.getElementById( "editUmbralG" );
var editUmbralB = document.getElementById( "editUmbralB" );
var ficherosDeEntrada = document.getElementById( "ficherosDeEntrada" );
var editZoom = document.getElementById( "editZoom" );
var selectMostrar = document.getElementById( "selectMostrar" );
var canvasPresentacion = document.getElementById( "canvasPresentacion" );
var labelNumCaracteres = document.getElementById( "labelNumCaracteres" );
var editSimboloCaracter = document.getElementById( "editSimboloCaracter" );
var labelNumAciertosCaracter = document.getElementById( "labelNumAciertosCaracter" );
var labelNumCaracter = document.getElementById( "labelNumCaracter" );
var labelNumLineaCaracter = document.getElementById( "labelNumLineaCaracter" );
var labelCaracterReconocido = document.getElementById( "labelCaracterReconocido" );
var labelNumLineas = document.getElementById( "labelNumLineas" );
var labelNumCaracteresNoReconocidos = document.getElementById( "labelNumCaracteresNoReconocidos" );
var labelNumLineasConCaracteresNoReconocidos = document.getElementById( "labelNumLineasConCaracteresNoReconocidos" );
var labelNumLineasConChecksumNoValido = document.getElementById( "labelNumLineasConChecksumNoValido" );
var botonModificarCaracter = document.getElementById( "botonModificarCaracter" );
var divPanelHerramientas = document.getElementById( "divPanelHerramientas" );
var botonReconocerCaracteres = document.getElementById( "botonReconocerCaracteres" );
var labelProcesando = document.getElementById( "labelProcesando" );
var divprocesando = document.getElementById( "divprocesando" );
var divmascaraprocesando = document.getElementById( "divmascaraprocesando" );
var labelNombreImagen = document.getElementById( "labelNombreImagen" );
var botonCargarImagen = document.getElementById( "botonCargarImagen" );
var ficherosDeEntrada = document.getElementById( "ficherosDeEntrada" );
var botonObtenerBinario = document.getElementById( "botonObtenerBinario" );
var botonComprobarTexto = document.getElementById( "botonComprobarTexto" );

// Otras variables
var ctx2dPresentacion = canvasPresentacion.getContext( "2d" );
var imagenOriginal = null;
var canvasProcesado = document.createElement( 'canvas' );
var pixels = null;
var canvasOverlay = document.createElement( 'canvas' );

var MOSTRAR_IMAGEN_ORIGINAL = 0;
var MOSTRAR_IMAGEN_FILTRADA = 1;
var mostrar = 0;
var zoom = 1;
var offsetX = 0;
var offsetY = 0;

var blobs = null;
var caracteres = null;
var caracteresNoReconocidos = [];

var seleccion = null;

var flagImagenCargada = false;
var flagImagenFiltrada = false;
var flagImagenAnalizada = false;

reiniciarImagen();

// Redimensionado del canvas de presentacion
var onWindowResize = function() {

    canvasPresentacion.width = window.innerWidth - 20;
    canvasPresentacion.height = window.innerHeight - 20;

    redibujar();

};
window.addEventListener( "resize", onWindowResize );

editZoom.addEventListener( "change", function() {
    var newZoom = Number( editZoom.value );
    if ( isNaN( newZoom ) ) {
        editZoom.value = zoom;
        return;
    }
    zoom = newZoom;
    
    redibujar();
} );

botonCargarImagen.addEventListener( "click", function() {
    ficherosDeEntrada.click();
} );

ficherosDeEntrada.addEventListener( 'change', ficheroImagenSeleccionado, false );

botonFiltrarImagen.addEventListener( "click", function() {

    flagImagenCargada = true;

    if ( ! flagImagenCargada ) {
        alert( "Antes de filtrar la imagen, debe cargarla." );
    }

    var umbralR = Number( editUmbralR.value );
    var umbralG = Number( editUmbralG.value );
    var umbralB = Number( editUmbralB.value );
    function validarCanal( c ) {
        if ( isNaN( c ) || c < 1 || c > 254 ) {
            return false;
        }
        return true;
    }
    if ( ! validarCanal( umbralR ) ) { alert( "Umbral de rojo no válido." ); return; }
    if ( ! validarCanal( umbralG ) ) { alert( "Umbral de verde no válido." ); return; }
    if ( ! validarCanal( umbralB ) ) { alert( "Umbral de azul no válido." ); return; }

    mostrarBarraProgreso();

    setTimeout( function() {

        filtrarImagen( imagenOriginal, canvasProcesado, umbralR, umbralG, umbralB );

        flagImagenFiltrada = true;

        ocultarBarraProgreso();

        selectMostrar.value = mostrar = MOSTRAR_IMAGEN_FILTRADA;

        reiniciarAnalisisImagen();

        actualizarNumElementos();
        actualizarLabelsCaracteresNoReconocidos();

        // Borra overlay
        var ctxOverlay = canvasOverlay.getContext( "2d" );
        ctxOverlay.clearRect( 0, 0, canvasOverlay.width, canvasOverlay.height );

        redibujar();

    }, 100 );

} );

botonAnalizarBlobs.addEventListener( "click", function() {

    if ( ! flagImagenFiltrada ) {
        alert( "Antes de analizar la imagen, debe filtrarla." );
        return;
    }

    mostrarBarraProgreso();

    setTimeout( function() {
        
        analizarImagen( canvasProcesado, canvasOverlay );

        ocultarBarraProgreso();

        redibujar();

    }, 100 );

} );

botonModificarCaracter.addEventListener( "click", function() {

    if ( ! caracteres ) {
        return;
    }

    if ( ! seleccion ) {
        return;
    }

    if ( caracteres_modificar_caracter( seleccion, editSimboloCaracter.value ) ) {

        var c = seleccion;
        var ctxOverlay = canvasOverlay.getContext( "2d" );
        ctxOverlay.strokeStyle = "rgba(255, 255, 0, 1)";
        ctxOverlay.strokeRect( c.x0, c.y0, c.x1 - c.x0 + 1, c.y1 - c.y0 + 1 );
        redibujar();

        rellenarInfoCaracter( seleccion );

        var ic = caracteresNoReconocidos.indexOf( c );
        if ( ic >= 0 ) {
            caracteresNoReconocidos.splice( ic, 1 );
            actualizarLabelsCaracteresNoReconocidos();
        }
    }

} );

botonReconocerCaracteres.addEventListener( "click", function() {

    if ( ! caracteres ) {
        alert( "Primero debe Filtrar y Analizar la imagen.");
        return;
    }

    var ncnr = caracteresNoReconocidos.length;
    if ( ncnr > 0 ) {
        alert( "Nota: es posible que la salida sea errónea debido a que aún hay caracteres no reconocidos por editar (hay " + ncnr + " de ellos)" );
    }

    var texto = caracteres_obtener_texto_caracteres( caracteres );

    areaTextSalida.value = texto;

    parsearTexto();

} );

botonObtenerBinario.addEventListener( "click", function() {

    var texto = areaTextSalida.value;

    if ( ! texto ) {
        alert( 'La salida de texto está vacía. Por favor, cierre este diálogo y pulse el botón "Obtener salida de texto".');
        return;
    }

    var resultParse = parsearTexto();

    if ( resultParse.lineas.length === 0 || resultParse.binario.length === 0 ) {
        alert( 'No se puede generar fichero binario, no hay líneas de texto que procesar.' );
        return;
    }

    if ( resultParse.lineasInvalidas.lenth !== 0 ) {
        alert( "La salida de texto contiene líneas no válidas. Estas líneas se omitirán en el fichero. Si lo desea puede corregir la salida de texto y volver a intentarlo.");
    }

    guardarFicheroBinario( resultParse.binario );

} );

botonComprobarTexto.addEventListener( "click", function() {

    parsearTexto();

} );

selectMostrar.addEventListener( "change", function( e ) {

    mostrar = Number( e.target.value );

    redibujar();

} );

var ultimaXRaton = 0;
var ultimaYRaton = 0;

window.addEventListener( 'mousedown', function( e ) {

    if ( event.target !== canvasPresentacion &&
         event.target !== divPanelHerramientas ) {
        return;
    }

    var x = e.clientX;
    var y = e.clientY;

    ultimaXRaton = x;
    ultimaYRaton = y;

    if ( e.button === 0 ) {
        clickSeleccion( x, y );
    }

}, false );

window.addEventListener( 'mousemove', function( e ) {

    if ( event.target !== canvasPresentacion &&
         event.target !== divPanelHerramientas ) {
        return;
    }

    var x = e.clientX;
    var y = e.clientY;

    // Botón medio del ratón
    if ( e.button === 1 ) {

        var dx = Math.floor( ( x - ultimaXRaton ) / zoom );
        var dy = Math.floor( ( y - ultimaYRaton ) / zoom );
        
        offsetX += dx;
        offsetY += dy;

        redibujar();

    }

    ultimaXRaton = x;
    ultimaYRaton = y;

}, false );

window.addEventListener( 'wheel', function( e ) {

    if ( event.target !== canvasPresentacion &&
         event.target !== divPanelHerramientas ) {
        return;
    }

    var newZoom = zoom + 0.05 * ( e.deltaY < 0 ? 1 : -1 );

    if ( newZoom < 0.05 ) {
        newZoom = 0.05;
    }

    zoom = newZoom;
    editZoom.value = zoom;

    redibujar();

}, false );




//var imagenOriginal = new Image();
//imagenOriginal.width = 10;
//imagenOriginal.height = 10;
// Carga imagen a procesar
//imagenOriginal.src = "images/test1.png";
//imagenOriginal.src = "images/test1-2.png";
//imagenOriginal.src = "images/test2-1.png";
//imagenOriginal.src = "images/test2-2.png";

onWindowResize();

ocultarBarraProgreso();


/*
 * **********************************************************************************************
 */

function reiniciarImagen() {

    offsetX = 0;
    offsetY = 0;
    zoom = 1;

    flagImagenCargada = false;
    flagImagenFiltrada = false;

    imagenOriginal = new Image();
    //imagenOriginal.width = 10;
    //imagenOriginal.height = 10;

    blobs = null;

    var ctxp = canvasProcesado.getContext( "2d" );
    ctxp.clearRect( 0, 0, canvasProcesado.width, canvasProcesado.height );

    var ctxo = canvasOverlay.getContext( "2d" );
    ctxo.clearRect( 0, 0, canvasOverlay.width, canvasOverlay.height );

    reiniciarAnalisisImagen();

    selectMostrar.value = mostrar = MOSTRAR_IMAGEN_ORIGINAL;
    
}


function reiniciarAnalisisImagen() {

    flagImagenAnalizada = false;

    caracteres = null;

    caracteresNoReconocidos = [];

    seleccion = null;
}

function redibujar() {

    var imagen = null;

    switch ( mostrar ) {
        case MOSTRAR_IMAGEN_ORIGINAL:
            imagen = imagenOriginal;
            break;
        case MOSTRAR_IMAGEN_FILTRADA:
            imagen = canvasProcesado;
            break;
    }

    var tx = canvasPresentacion.width;
    var ty = canvasPresentacion.height;

    ctx2dPresentacion.clearRect( 0, 0, tx, ty );

    if ( ! imagen ) {
        return;
    }

    ctx2dPresentacion.drawImage( imagen, offsetX * zoom, offsetY * zoom, imagen.width * zoom, imagen.height * zoom );

    ctx2dPresentacion.drawImage( canvasOverlay, offsetX * zoom, offsetY * zoom, canvasOverlay.width * zoom, canvasOverlay.height * zoom );


    if ( seleccion ) {
        var c = seleccion;
        ctx2dPresentacion.strokeStyle = "blue";
        ctx2dPresentacion.strokeRect( ( offsetX + c.x0 ) * zoom, ( offsetY + c.y0 ) * zoom, ( c.x1 - c.x0 + 1 ) * zoom, ( c.y1 - c.y0 + 1 ) * zoom );
    }

}

function filtrarImagen( imagenOriginal, canvasProcesado, umbralR, umbralG, umbralB ) {

    var tx = imagenOriginal.width;
    var ty = imagenOriginal.height;

    canvasProcesado.width = tx;
    canvasProcesado.height = ty;

    var ctx = canvasProcesado.getContext( "2d" );

    ctx.drawImage( imagenOriginal, 0, 0, tx, ty );

    var datosImagen = ctx.getImageData( 0, 0, tx, ty );
    var datosPixels = datosImagen.data;

    for ( var i = 0, il = datosPixels.length; i < il; i += 4 ) {
        var v = 0;
        if ( datosPixels[ i ] > umbralR ||
             datosPixels[ i + 1 ] > umbralG ||
             datosPixels[ i + 2 ] > umbralB ) {
            v = 255;
        }
        datosPixels[ i ] = v;
        datosPixels[ i + 1 ] = v;
        datosPixels[ i + 2 ] = v;
    }

    ctx.putImageData( datosImagen, 0, 0 );

}

function analizarImagen( canvasProcesado, canvasOverlay ) {

    var tx = canvasProcesado.width;
    var ty = canvasProcesado.height;

    blobs = blobs_crearBlobs( tx, ty );

    var ctx = canvasProcesado.getContext( "2d" );
    var datosImagen = ctx.getImageData( 0, 0, tx, ty );
    var datosPixels = datosImagen.data;

    if ( ! blobs_analizarBlobs( blobs, datosPixels, null, 0 ) ) {
        alert( "Se ha sobrepasado el número máximo de manchas a analizar en la imagen, que es de " + blobs.MAXBLOBS + ". Por favor, intente subdividir la imagen a procesar en trozos más pequeños." );
        return;
    }

    blobs_analizarJerarquia( blobs );

    caracteres = caracteres_procesar( blobs );
    if ( caracteres === null ) {
        alert( "Error no esperado al procesar caracteres." );
        return;
    }

    actualizarNumElementos();

    pixels = datosPixels;

    // Reconoce los caracteres y pinta los recuadros de los caracteres en el overlay
    canvasOverlay.width = tx;
    canvasOverlay.height = ty;
    var ctxOverlay = canvasOverlay.getContext( "2d" );
    ctxOverlay.clearRect( 0, 0, tx, ty );
    caracteresNoReconocidos = [];
    for ( var i = 0, il = caracteres.length; i < il; i++ ) {
        var c = caracteres[ i ];

        reconocerSimbolo( pixels, blobs.resX, c );

        var color = "green";
        if ( ! c.reconocido ) {
            color = "red";
            caracteresNoReconocidos.push( c );
        }
        ctxOverlay.strokeStyle = color;
        ctxOverlay.strokeRect( c.x0, c.y0, c.x1 - c.x0 + 1, c.y1 - c.y0 + 1 );
    }

    actualizarLabelsCaracteresNoReconocidos();

    ocultarBarraProgreso();
}

function clickSeleccion( x, y ) {

    var xi = Math.floor( ( x - 10 ) / zoom - offsetX );
    var yi = Math.floor( ( y - 10 ) / zoom - offsetY );

    if ( ! caracteres ) {
        return;
    }

    var modificada = false;
    for ( var i = 0, il = caracteres.length; i < il; i++ ) {
        var c = caracteres[ i ];
        if ( c.x0 <= xi && c.x1 >= xi &&
             c.y0 <= yi && c.y1 >= yi ) {

            seleccion = c;

            reconocerSimbolo( pixels, blobs.resX, c, canvasOverlay.getContext( "2d" ) );

            rellenarInfoCaracter( c );

            redibujar();

            break;
        }
    }

    if ( modificada ) {
        redibujar();
    }
}

function rellenarInfoCaracter( c ) {
    var strReconocido = c.reconocido ? "Sí." : "*** NO ***";
    var strValor = c.simbolo ? c.simbolo.cadena : null;
    if ( c.texto !== null ) {
        strReconocido = "Modificado";
        strValor = c.texto;
    }
    editSimboloCaracter.value = strValor;
    labelNumAciertosCaracter.innerHTML = c.aciertos.toString();
    labelNumCaracter.innerHTML = c.numCaracter.toString();
    labelNumLineaCaracter.innerHTML = c.numLinea.toString();
    labelCaracterReconocido.innerHTML = strReconocido.toString();

}

function actualizarLabelsCaracteresNoReconocidos() {

    labelNumCaracteresNoReconocidos.innerHTML = caracteresNoReconocidos.length.toString();

    var il = caracteresNoReconocidos.length;
    if ( il === 0 ) {
        labelNumLineasConCaracteresNoReconocidos.innerHTML = "Ninguno";
    }
    else {
        var lnr = "";
        var lineaActual = 0;
        for ( var i = 0; i < il; i++ ) {
            var linea = caracteresNoReconocidos[ i ].numLinea;
            if ( linea !== lineaActual ) {
                lnr += linea.toString();
                if ( i < il - 1 ) {
                    lnr += ", ";
                }
                lineaActual = linea;
            }
        }
        labelNumLineasConCaracteresNoReconocidos.innerHTML = lnr;
    }
}

function actualizarNumElementos() {

    if ( caracteres ) {
        labelNumCaracteres.innerHTML = caracteres.length.toString();
        if ( caracteres.length > 0 ) {
            labelNumLineas.innerHTML = caracteres[ caracteres.length - 1 ].numLinea.toString();
        }
        else {
            labelNumLineas.innerHTML = "0";
        }
    }
    else {
        labelNumCaracteres.innerHTML = "0";
        labelNumLineas.innerHTML = "0";
    }

}

function mostrarBarraProgreso() {

    divmascaraprocesando.style.visibility = 'visible';

}

function ocultarBarraProgreso() {

    divmascaraprocesando.style.visibility = 'hidden';

}

function ficheroImagenSeleccionado( event ) {

    var file = event.target.files[ 0 ];

    if ( file ) {

        var reader = new FileReader();

        reader.onload = function( event ) {

            labelNombreImagen.innerHTML = file.name;

            reiniciarImagen();

            imagenOriginal.addEventListener( 'load', function ( event ) {

                flagImagenCargada = true;

                ocultarBarraProgreso();

                redibujar();

            }, false );

            imagenOriginal.src = event.target.result;

        };
    }

    mostrarBarraProgreso();

    reader.readAsDataURL( file );

}

function parsearTexto() {

    var texto = areaTextSalida.value;

    var resultParse = parser_cm( texto );

    if ( resultParse.lineasInvalidas === null || resultParse.lineasInvalidas.length === 0 ) {
        labelNumLineasConChecksumNoValido.innerHTML = "Ninguno";
    }
    else {
        labelNumLineasConChecksumNoValido.innerHTML = resultParse.lineasInvalidas.join( ", " );
    }

    return resultParse;
}

function guardarFicheroBinario( binario ) {

    var link = window.document.createElement( "a" );
    link.href = window.URL.createObjectURL( new Blob( [ binario ], { type: "application/octet-binary" } ) );
    link.download = "" + labelNombreImagen.innerHTML + ".bin";
    document.body.appendChild( link );

    link.click();

    document.body.removeChild( link );

}