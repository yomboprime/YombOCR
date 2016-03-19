
function parser_cm( texto ) {

    if ( ! texto ) {
        return null;
    }

    var lineas = texto.split( "\n" );

    if ( lineas.length === 0 ) {
        return null;
    }

    var lineasInvalidas = [];
    var binarioLineas = [];

    for ( var iLinea = 0, nLineas = lineas.length; iLinea < nLineas; iLinea++ ) {

        var linea = lineas[ iLinea ];

        var tokens = linea.split( " " );

        if ( tokens.length !== 3 ) {
            lineasInvalidas.push( iLinea + 1 );
            continue;
        }

        // Numero de linea
        var numLinea = parseInt( tokens[ 0 ] );
        if ( isNaN( numLinea ) ) {
            lineasInvalidas.push( iLinea + 1 );
            continue;
        }

        // Datos
        var datos = tokens[ 1 ];
        if ( datos.length !== 20 ) {
            lineasInvalidas.push( iLinea + 1 );
            continue;
        }

        var datosBytes = [];
        var checksumDatos = 0;
        for ( var iByte = 0; iByte < 10; iByte++ ) {
            var iNibble = iByte * 2;
            var strByte = "0x" + datos.substring( iNibble, iNibble + 2 );
            var b = parseInt( strByte );
            datosBytes.push( b );
            checksumDatos += b;
        }

        // Checksum
        var checksum = parseInt( tokens[ 2 ] );
        if ( isNaN( checksum ) ) {
            lineasInvalidas.push( iLinea + 1 );
            continue;
        }

        if ( checksum !== checksumDatos ) {
            lineasInvalidas.push( iLinea + 1 );
            continue;
        }

        binarioLineas.push( datosBytes );

    }

    var numBytes = binarioLineas.length * 10;
    var binario = new Int8Array( numBytes );

    var p = 0;
    for ( var i = 0, il = binarioLineas.length; i < il; i++ ) {

        var bl = binarioLineas[ i ];

        for ( var j = 0; j < 10; j++ ) {
            binario[ p ] = bl[ j ];
            p++;
        }
    }

    return {
        lineas: lineas,
        lineasInvalidas: lineasInvalidas,
        binario: binario
    };

}