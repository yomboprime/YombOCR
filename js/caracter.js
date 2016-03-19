
function caracteres_crear_caracter() {
    return {
        x0: -1,
        y0: -1,
        x1: -1,
        y1: -1,
        numCaracter: -1,
        numLinea: -1,
        texto: null,  // texto tiene preferencia sobre simbolo
        simbolo: null,
        reconocido: false
    };
}

function caracteres_crear_caracter_de_blob( b ) {

    var c = caracteres_crear_caracter();
    caracteres_anyadir_blob( c, b );
    return c;

}

function caracteres_crear_caracter_de_dos_blobs( b1, b2 ) {

    var c = caracteres_crear_caracter();
    caracteres_anyadir_blob( c, b1 );
    caracteres_anyadir_blob( c, b2 );
    return c;

}

function caracteres_anyadir_blob( c, b ) {

    if ( b.x0 < c.x0 || c.x0 === -1 ) {
        c.x0 = b.x0;
    }
    if ( b.x1 > c.x1 || c.x1 === -1 ) {
        c.x1 = b.x1;
    }
    if ( b.y0 < c.y0 || c.y0 === -1 ) {
        c.y0 = b.y0;
    }
    if ( b.y1 > c.y1 || c.y1 === -1 ) {
        c.y1 = b.y1;
    }

}

function caracteres_juntar( c1, c2 ) {
    
    // Une c2 a c1

    if ( c2.x0 < c1.x0 || c1.x0 === -1 ) {
        c1.x0 = c2.x0;
    }
    if ( c2.x1 > c1.x1 || c1.x1 === -1 ) {
        c1.x1 = c2.x1;
    }
    if ( c2.y0 < c1.y0 || c1.y0 === -1 ) {
        c1.y0 = c2.y0;
    }
    if ( c2.y1 > c1.y1 || c1.y1 === -1 ) {
        c1.y1 = c2.y1;
    }

}

// Margen caracteres
var mc = 2;

function caracteres_intersecciona( cb1, cb2 ) {

    // Los parametros cb pueden ser caracter o blob

    return ( cb1.x0 <= cb2.x1 + mc  ) && ( mc + cb1.x1 >= cb2.x0 ) &&
           ( cb1.y0 <= cb2.y1 + mc  ) && ( mc + cb1.y1 >= cb2.y0 );
}

function caracteres_intersecciona_x( cb1, cb2 ) {

    // Los parametros cb pueden ser caracter o blob

    return ( cb1.x0 <= cb2.x1 + mc  ) && ( mc + cb1.x1 >= cb2.x0 );
}

function caracteres_intersecciona_y( cb1, cb2 ) {

    // Los parametros cb pueden ser caracter o blob

    return ( cb1.y0 <= cb2.y1 + mc  ) && ( mc + cb1.y1 >= cb2.y0 );
}

function caracteres_compara( c1, c2 ) {

    // Solo para comparar caracteres, en el orden que han de ocupar en la pagina

    if ( c2.x0 === c1.x0 && c2.y0 === c1.y0 && c2.x1 === c1.x1 && c2.y1 === c1.y1 ) {
        return 0;
    }

    if ( c2.y0 > c1.y1 ) {
        return -1;
    }
    else if ( c2.y1 < c1.y0 ) {
        return 1;
    }

    // Interseccionan

    if ( c1.x0 === c2.x0 ) {
        return 0;
    }

    return c1.x0 < c2.x0 ? -1 : 1;

}

function caracteres_procesar( blobs ) {

    // Devuelve array de caracteres ordenados

    // Dimensiones minimas de un caracter en pixeles
    var minTamCaracter = 3;

    // Obtiene lista de blobs sueltos que forman caracteres
    var listaBlobsSueltos = [];
    var iRaiz = blobs_getBlobRaiz( blobs );
    if ( iRaiz === -1 ) {
        // Nunca debería suceder
        return null;
    }
    var blobRaiz = blobs_getBlob( blobs, iRaiz );
    var iHijo = blobRaiz.primerHijo;
    while ( iHijo !== -1 ) {
        var blobHijo = blobs_getBlob( blobs, iHijo );
        listaBlobsSueltos.push( blobHijo );
        iHijo = blobHijo.hermanoSig;
    }

    var caracteres = [];

    var fin = false;
    while ( ! fin ) {

        fin = true;

        // Anyade blobs sueltos que interseccionan entre si como caracter con dos blobs
        var fin1 = false;
        while ( ! fin1 ) {
            fin1 = true;
            var n1 = listaBlobsSueltos.length - 1;
            var i1 = 0;
            while ( i1 < n1 && fin1 ) {
                var b1 = listaBlobsSueltos[ i1 ];
                var n2 = listaBlobsSueltos.length;
                var i2 = i1 + 1;
                while ( i2 < n2 && fin1 ) {
                    var b2 = listaBlobsSueltos[ i2 ];
                    if ( caracteres_intersecciona( b1, b2 ) ) {

                        var c = caracteres_crear_caracter_de_dos_blobs( b1, b2 );

                        caracteres.push( c );
                        listaBlobsSueltos.splice( i2, 1 );
                        listaBlobsSueltos.splice( i1, 1 );

                        fin = false;
                        fin1 = false;

                    }
                    i2++;
                }
                i1++;
            }
        }

        // Anyade blobs sueltos a caracteres
        var n1 = listaBlobsSueltos.length;
        var i1 = 0;
        while ( i1 < n1 ) {
            var b = listaBlobsSueltos[ i1 ];
            var nc = caracteres.length;
            var ic = 0;
            while ( ic < nc ) {
                var c = caracteres[ ic ];
                if ( caracteres_intersecciona( c, b ) ) {
                    caracteres_anyadir_blob( c, b );
                    listaBlobsSueltos.splice( i1, 1 );
                    n1--;
                    fin = false;

                    break;
                }
                ic++;
            }
            i1++;
        }

        // Anyade caracteres entre si
        var nc1 = caracteres.length - 1;
        var ic1 = 0;
        while ( ic1 < nc1 ) {
            var c1 = caracteres[ ic1 ];
            var nc2 = caracteres.length;
            var ic2 = ic1 + 1;
            while ( ic2 < nc2 ) {
                var c2 = caracteres[ ic2 ];
                if ( caracteres_intersecciona( c1, c2 ) ) {
                    caracteres_juntar( c1, c2 );
                    caracteres.splice( ic2, 1 );
                    nc1--;
                    nc2--;
                    fin = false;

                }
                else {
                    ic2++;
                }
            }
            ic1++;
        }
    }

    // Mete los blobs aislados restantes como caracteres
    var n1 = listaBlobsSueltos.length;
    var i1 = 0;
    while ( i1 < n1 ) {
        var blob = listaBlobsSueltos[ i1 ];

        if ( ( Math.abs( blob.x1 - blob.x0 ) + 1 > minTamCaracter ) ||
             ( Math.abs( blob.y1 - blob.y0 ) + 1 > minTamCaracter ) ) {
            var c = caracteres_crear_caracter_de_blob( blob );
            caracteres.push( c );
        }
        i1++;
    }

    // Elimina caracteres demasiado pequenyos
    var nc = caracteres.length;
    var ic = 0;
    while ( ic < nc ) {
        
        var c = caracteres[ ic ];

        if ( ( Math.abs( c.x1 - c.x0 ) + 1 <= minTamCaracter ) &&
             ( Math.abs( c.y1 - c.y0 ) + 1 <= minTamCaracter ) ) {
            caracteres.splice( ic, 1 );
            nc--;
        }
        else {
            ic++;
        }
    }

    // Ordena los caracteres
    caracteres.sort( caracteres_compara );

    // Vuelve a eliminar caracteres demasiado pequenyos, esta vez un poco mas grandes
    var nc = caracteres.length;
    var ic = 0;
    while ( ic < nc ) {

        var c = caracteres[ ic ];

        if ( ( Math.abs( c.x1 - c.x0 ) + 1 <= 5 ) &&
             ( Math.abs( c.y1 - c.y0 ) + 1 <= 6 ) ) {
            caracteres.splice( ic, 1 );
            nc--;
        }
        else {
            ic++;
        }
    }

    // Le pone a cada caracter su numero de fila y caracter, y une caracteres
    // que han quedado aislados en Y pero interseccionan en X
    // y ademas inserta espacios
    nc = caracteres.length;
    ic = 0;
    var numLinea = 1;
    while ( ic < nc ) {

        var c = caracteres[ ic ];

        c.numCaracter = ic;
        c.numLinea = numLinea;

        var anchoc = c.x1 - c.x0 + 1;

        var incrementar = true;
        if ( ic + 1 < nc ) {
            var c2 = caracteres[ ic + 1 ];
            if ( ! caracteres_intersecciona_y( c, c2 ) ) {
                if ( caracteres_intersecciona_x( c, c2 ) ) {
                    // Junta estos dos caracteres
                    caracteres_juntar( c, c2 );
                    caracteres.splice( ic + 1, 1 );
                    nc--;
                    incrementar = false;
                }
                else {
                    numLinea++;
                }
            }
            else {
                if ( c2.x0 - c.x1 > anchoc ) {
                    // Inserta un espacio
                    var cEspacio = caracteres_crear_caracter();
                    cEspacio.texto = " ";
                    cEspacio.numLinea = c.numLinea;
                    // Inserta el espacio despues del caracter actual
                    caracteres.splice( ic + 1, 0, cEspacio );
                    nc++;
                    // Y se lo salta
                    ic++;
                }
            }
        }
        if ( incrementar ) {
            ic++;
        }
    }

    return caracteres;
}


function caracteres_fusionar( caracteres ) {

    var fin = false;
    while ( ! fin ) {
        fin = true;

        // Anyade caracteres entre si
        var nc1 = caracteres.length - 1;
        var ic1 = 0;
        while ( ic1 < nc1 ) {
            var c1 = caracteres[ ic1 ];
            var nc2 = caracteres.length;
            var ic2 = ic1 + 1;
            while ( ic2 < nc2 ) {
                var c2 = caracteres[ ic2 ];
                if ( caracteres_intersecciona( c1, c2 ) ) {
                    caracteres_juntar( c1, c2 );
                    caracteres.splice( ic2, 1 );
                    nc1--;
                    nc2--;
                    fin = false;

                }
                else {
                    ic2++;
                }
            }
            ic1++;
        }
    }
}

function caracteres_modificar_caracter( c, texto ) {

    // Devuelve true ssi se ha modificado

    if ( ! c.simbolo ) {
        return false;
    }

    if ( c.texto === texto ) {
        return false;
    }

    c.texto = texto;

    return true;

}

function caracteres_obtener_texto_caracteres( caracteres ) {

    var texto = "";

    for ( var i = 0, il = caracteres.length; i < il; i++ ) {

        var c = caracteres[ i ];

        if ( c.texto !== null ) {
            texto += c.texto;
        }
        else {
            if ( c.simbolo ) {
                texto += c.simbolo.cadena;
            }
        }

        // Deteccion de cambio de linea
        if ( i < il - 1 && caracteres[ i + 1 ].numLinea > c.numLinea ) {
            texto += "\n";
        }

    }

    return texto;
}