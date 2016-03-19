
function blobs_crearBlobs( resX, resY ) {

    var blobs = {
        resX: resX,
        resY: resY,
        blobs: [],  // Blob
        numBlobs: 0,
        imagenBlobs: [], // Int32Array
        blobRaiz: -1,
        adyacentesCandidatos: [], // Blob

        MAXBLOBS: 10000,
        NOMARCADO: 0,
        MARCADO: 1,
        EXPANDIDO: 2
    };

    for ( var i = 0, il = blobs.MAXBLOBS; i < il; i++ ) {
        blobs.blobs[ i ] = blobs_crearBlob();
        blobs.blobs[ i ].indice = i;
    }

    blobs.imagenBlobs = new Int32Array( resX * resY );
    blobs_rellenarImagenBlobs( blobs, -1 );

    blobs_reinicializarBlobs( blobs );

    return blobs;
}

function blobs_crearBlob() {
    var blob = {
        indice: -1,
        rCount: 0,
        gCount: 0,
        bCount: 0,
        aCount: 0,
        colorR: 0,  // 0 a 255
        colorG: 0,
        colorB: 0,
        colorA: 0,
        hue: 0,
        x0: 0,
        y0: 0,
        x1: 0,
        y1: 0,
        xC: 0,
        yC: 0,
        numPixels: 0,
        hermanoSig: -1,
        primerHijo: -1,
        padre: -1,
        adyacentes: [],
        valido: false,
        marca: -1
    };

    return blob;
}

function blobs_numHermanosBlob( blobs, b ) {
    var n = 0;
    while ( b.hermanoSig !== -1 ) {
        b = blobs.blobs[ b.hermanoSig ];
        n++;
    }
    return n;
}

function blobs_numHijosBlob( blobs, b ) {
    if ( b.primerHijo === -1 ) {
        return 0;
    }
    return blobs_numHermanosBlob( blobs, blobs.blobs[ b.primerHijo ] ) + 1;
}

function blobs_interseccionanBlobs( b1, b2 ) {
    return ( b1.x0 <= b2.x1  ) && ( b1.x1 >= b2.x0 ) &&
           ( b1.y0 <= b2.y1  ) && ( b1.y1 >= b2.y0 );
}

function blobs_reinicializarBlobs( blobs ) {

    for ( var i = 0; i < blobs.MAXBLOBS; i++ ) {
        blobs.blobs[ i ].valido = false;
    }

    blobs.numBlobs = 0;
    blobs.blobRaiz = -1;

    blobs_rellenarImagenBlobs( blobs, -1 );

}

function blobs_rellenarImagenBlobs( blobs, valor ) {
    var p = 0;
    for ( var j = 0, jl = blobs.resY; j < jl; j++ ) {
        for ( var i = 0, il = blobs.resX; i < il; i++ ) {
            blobs.imagenBlobs[ p ] = valor;
            p++;
        }
    }
}

function blobs_getNumBlobs( blobs ) {
    return blobs.numBlobs;
}

function blobs_getBlob( blobs, indice ) {
    return blobs.blobs[ indice ];
}

function blobs_getBlobRaiz( blobs ) {
    return blobs.blobRaiz;
}

function blobs_getImagenBlobs( blobs ) {
    return blobs.imagenBlobs;
}

function blobs_pintarBlobsEnImagen( blobs, imagenDest ) {

    // imagenDest es un Float32Array con 4 componentes por pixel

    var p = 0;
    var p2 = 0;
    var img = blobs.imagenBlobs;
    for ( var j = 0, jl = blobs.resY; j < jl; j++ ) {
        for ( var i = 0, il = blobs.resX; i < il; i++ ) {
            var b = blobs.blobs[ img[ p ] ];
            imagenDest[ p2 ] = b.colorR;
            imagenDest[ p2 + 1 ] = b.colorG;
            imagenDest[ p2 + 2 ] = b.colorB;
            imagenDest[ p2 + 3 ] = 1;

            p ++;
            p2 += 4;
        }
    }
}

function blobs_pintarBlobEnImagen( blobs, b, imagenDest ) {

    // imagenDest es un Float32Array con 4 componentes por pixel

    for ( var j = b.y0; j <= b.y1; j++ ) {
        var p = b.x0 + j * blobs.resX;
        var p2 = p * 4;
        for ( var i = b.x0; i <= b.x1; i++ ) {
            var iBlob = blobs.imagenBlobs[ p ];
            if ( iBlob === b.indice ) {
                imagenDest[ p2 ] = b.colorR;
                imagenDest[ p2 + 1 ] = b.colorG;
                imagenDest[ p2 + 2 ] = b.colorB;
                imagenDest[ p2 + 3 ] = 1;
            }

            p++;
            p2 += 4;
        }
    }
}

function blobs_analizarBlobs( blobs, imagenEntrada, imagenColores, canal ) {

    // imagenEntrada es un Float32Array con 4 componentes por pixel, con la imagen de entrada
    // imagenColores es un Float32Array con 4 componentes por pixel, con la imagen de los colores
    // Las imagenes han de ser del mismo tamanyo configurado en los blobs.
    // Canal es el canal usado de imagenEntrada para la separacion de blobs
    // Se separan blobs diferentes si los pixels son diferentes en la imagen de entrada
    // La imagen 'colores' puede ser null (no se guardara el color de los blobs)

    blobs_reinicializarBlobs( blobs );

    var p = 0;
    var p0 = - blobs.resX; // Pixel Norte
    var p1 = - 1; // Pixel Oeste

    for ( var j = 0, jl = blobs.resY; j < jl; j++ ) {
        for ( var i = 0, il = blobs.resX; i < il; i++ ) {

            // Si el pixel actual es compatible con el vecino izquierdo,
            if ( i > 0 && imagenEntrada[ p * 4 + canal ] === imagenEntrada[ p1 * 4 + canal ] ) {
                // Anade el pixel al blob izquierdo
                var indiceBlob = blobs.imagenBlobs[ p1 ];
                blobs.imagenBlobs[ p ] = indiceBlob;

                var b = blobs.blobs[ indiceBlob ];

                b.numPixels ++;

                if ( imagenColores !== null ) {
                    var p_4 = p * 4;
                    b.rCount += imagenColores[ p_4 + 0 ];
                    b.gCount += imagenColores[ p_4 + 1 ];
                    b.bCount += imagenColores[ p_4 + 3 ];
                    b.aCount += imagenColores[ p_4 + 3 ];
                }

                if ( b.x0 > i ) {
                    b.x0 = i;
                }
                if ( b.y0 > j ) {
                    b.y0 = j;
                }
                if ( b.x1 < i ) {
                    b.x1 = i;
                }
                if ( b.y1 < j ) {
                    b.y1 = j;
                }

                if ( j > 0 ) {

                    // Si el blob Norte no es el mismo, los hace adyacentes
                    if ( imagenEntrada[ p * 4 + canal ] !== imagenEntrada[ p0 * 4 + canal ] ) {
                        blobs_hacerBlobsAdyacentes( blobs, blobs.imagenBlobs[ p ], blobs.imagenBlobs[ p0 ] );
                    }
                    else {
                        // Si es el mismo pero con diferente id, hay que juntarlos
                        var indiceBlob0 = blobs.imagenBlobs[ p0 ];
                        if ( indiceBlob !== indiceBlob0 ) {
                            b2 = blobs.blobs[ indiceBlob0 ];

                            // Se anade el blob de id mas alto al de id mas bajo (fuente y destino)
                            var indBlobDest = indiceBlob;
                            var indBlobFuente = indiceBlob0;
                            var blobDest = b;
                            var blobFuente = b2;
                            if ( indiceBlob > indiceBlob0 ) {
                                indBlobDest = indiceBlob0;
                                indBlobFuente = indiceBlob;
                                blobDest = b2;
                                blobFuente = b;
                            }

                            blobDest.numPixels += blobFuente.numPixels;
                            blobDest.aCount += blobFuente.aCount;
                            blobDest.rCount += blobFuente.rCount;
                            blobDest.gCount += blobFuente.gCount;
                            blobDest.bCount += blobFuente.bCount;

                            if ( blobDest.x0 > blobFuente.x0 ) {
                                blobDest.x0 = blobFuente.x0;
                            }
                            if ( blobDest.y0 > blobFuente.y0 ) {
                                blobDest.y0 = blobFuente.y0;
                            }
                            if ( blobDest.x1 < blobFuente.x1 ) {
                                blobDest.x1 = blobFuente.x1;
                            }
                            if ( blobDest.y1 < blobFuente.y1 ) {
                                blobDest.y1 = blobFuente.y1;
                            }

                            // Quita el blob fuente de los blobs adyacentes a el y
                            // une las listas de adyacencia de los dos blobs
                            blobs_unirAdyacentes( blobs, blobFuente, blobDest );

                            // Convierte todos los pixels del blob origen al de destino
                            var pViejo = blobs.resX * blobFuente.y0 + blobFuente.x0;
                            var dbfx = blobs.resX - ( blobFuente.x1 - blobFuente.x0 + 1 );
                            for ( var jbf = blobFuente.y0; jbf <= blobFuente.y1; jbf++ ) {
                                for ( var ibf = blobFuente.x0; ibf <= blobFuente.x1; ibf++ ) {

                                    if ( blobs.imagenBlobs[ pViejo ] === indBlobFuente ) {
                                        blobs.imagenBlobs[ pViejo ] = indBlobDest;
                                    }

                                    pViejo++;
                                }
                                pViejo += dbfx;
                            }

                            // Desaparece el blob fuente
                            blobFuente.valido = false;
                            blobs.numBlobs --;
                        }
                    }
                }
            }
            else {
                // Si el pixel actual es compatible con el vecino superior,
                if ( j > 0 && imagenEntrada[ p * 4 + canal ] === imagenEntrada[ p0 * 4 + canal ] ) {
                    // Anade el pixel al blob superior
                    var indiceBlob = blobs.imagenBlobs[ p0 ];
                    blobs.imagenBlobs[ p ] = indiceBlob;

                    var b = blobs.blobs[ indiceBlob ];

                    b.numPixels ++;

                    if ( imagenColores !== null ) {
                        var p_4 = p * 4;
                        b.rCount += imagenColores[ p_4 + 0 ];
                        b.gCount += imagenColores[ p_4 + 1 ];
                        b.bCount += imagenColores[ p_4 + 2 ];
                        b.aCount += imagenColores[ p_4 + 3 ];
                    }

                    if ( b.x0 > i ) {
                        b.x0 = i;
                    }
                    if ( b.y0 > j ) {
                        b.y0 = j;
                    }
                    if ( b.x1 < i ) {
                        b.x1 = i;
                    }
                    if ( b.y1 < j ) {
                        b.y1 = j;
                    }
                }
                else {
                    // Se crea un blob nuevo de un pixel
                    if ( blobs.numBlobs === blobs.MAXBLOBS ) {
                        // No basta el numero maximo de blobs
                        reinicializar();
                        return false;
                    }

                    // Busca el primer blob no usado del array de blobs
                    var indiceBlob = 0;
                    while ( indiceBlob < blobs.MAXBLOBS && blobs.blobs[ indiceBlob ].valido ) {
                        indiceBlob ++;
                    }

                    var b = blobs.blobs[ indiceBlob ];

                    b.valido = true;
                    blobs.numBlobs++;
                    blobs.imagenBlobs[ p ] = indiceBlob;
                    b.numPixels = 1;

                    b.hue = imagenEntrada[ p * 4 + canal ];

                    if ( imagenColores !== null ) {
                        var p_4 = p * 4;
                        b.rCount += imagenColores[ p_4 + 0 ];
                        b.gCount += imagenColores[ p_4 + 1 ];
                        b.bCount += imagenColores[ p_4 + 2 ];
                        b.aCount += imagenColores[ p_4 + 3 ];
                    }

                    b.x0 = i;
                    b.x1 = i;
                    b.y0 = j;
                    b.y1 = j;

                    // Borra los adyacentes
                    // TODO
                    //b.adyacentes.length = 0;
                    b.adyacentes = [];

                    // Si hay vecino superior ergo es diferente a este et lo hacemos adyacente
                    if ( j > 0 ) {
                        blobs_hacerBlobsAdyacentes( blobs, indiceBlob, blobs.imagenBlobs[ p0 ] );
                    }
                }

                // Hace el blob actual adyacente al blob de la izquierda, si lo hay
                if ( i > 0 ) {
                    blobs_hacerBlobsAdyacentes( blobs, blobs.imagenBlobs[ p ], blobs.imagenBlobs[ p1 ] );
                }
            }

            // Incrementa indices a imagenBlobs
            p ++;
            p0 ++;
            p1 ++;
        }
    }

    for ( var i = 0; i < blobs.numBlobs; i++ ) {
        var b = blobs.blobs[ i ];
        b.colorR = Math.round( b.rCount / b.numPixels );
        b.colorG = Math.round( b.gCount / b.numPixels );
        b.colorB = Math.round( b.bCount / b.numPixels );
        b.colorA = Math.round( b.aCount / b.numPixels );

        b.xC = ( b.x0 + b.x1 ) / 2;
        b.yC = ( b.y0 + b.y1 ) / 2;
        b.hermanoSig = -1;
        b.primerHijo = -1;
        b.padre = -1;
        b.marca = blobs.NOMARCADO;
    }

    return true;
}

function blobs_hacerBlobsAdyacentes( blobs, indiceBlob0, indiceBlob1 ) {

    if ( indiceBlob0 === indiceBlob1 ) {
        return;
    }

    var b0 = blobs.blobs[ indiceBlob0 ];
    var b1 = blobs.blobs[ indiceBlob1 ];

    var i = 0;
    while ( i < b0.adyacentes.length && b0.adyacentes[ i ] !== b1 ) {
        i ++;
    }

    // Si no eran adyacentes, los hace adyacentes
    if ( i === b0.adyacentes.length ) {
        b0.adyacentes.push( b1 );
        b1.adyacentes.push( b0 );
    }

}

// Quita a blobFuente de las listas de adyacencia de sus blobs adyacentes y luego anyade
// los elementos adyacentes de blobFuente a blobDestino si no eran adyacentes a blobDestino
function blobs_unirAdyacentes( blobs, blobFuente, blobDestino ) {
    for ( var i = 0, il = blobFuente.adyacentes.length; i < il; i++ ) {

        var bw = blobFuente.adyacentes[ i ];

        var ibFuente = 0;
        while ( ibFuente < bw.adyacentes.length && bw.adyacentes[ ibFuente ] !== blobFuente ) {
            ibFuente++;
        }
        // Elimina blobFuente de la lista de adyacentes de bw
        bw.adyacentes.splice( ibFuente, 1 );

        blobs_hacerBlobsAdyacentes( blobs, bw.indice, blobDestino.indice );
    }
}

// Devuelve true ssi el rectangulo de a contiene al de b con margen de 1 pixel
function blobs_contieneBlob( a, b ) {
    return ( a.x0 < b.x0 ) && ( a.y0 < b.y0 ) && ( a.x1 > b.x1 ) && ( a.y1 > b.y1 );
}

// Hace de x el padre de y
function blobs_hacerPadre( blobs, x, y ) {

    y.padre = x.indice;

    if ( x.primerHijo === -1 ) {
        x.primerHijo = y.indice;
    }
    else {
        var indC = x.primerHijo;
        var c = blobs.blobs[ indC ];
        while ( c.hermanoSig !== -1 ) {
            indC = c.hermanoSig;
            c = blobs.blobs[ indC ];
        }
        c.hermanoSig = y.indice;
    }
    y.hermanoSig = -1;
}

function blobs_analizarJerarquia( blobs ) {

    // Bucle para todos los blobs
    for ( var i = 0; i < blobs.numBlobs; i++ ) {

        var blobY = blobs.blobs[ i ];

        if ( ! blobY.valido ) {
            continue;
        }

        // Si ya se le ha asignado padre por extension, lo pasamos
        if ( blobY.padre !== -1 ) {
            continue;
        }

        // Si es un blob que toca el borde de la pantalla, lo pasamos
        if ( blobY.x0 === 0 || blobY.y0 === 0 ||
             ( blobY.x1 === blobs.resX - 1 ) || ( blobY.y1 === blobs.resY - 1 ) ) {
            continue;
        }

        // Bucle por todos los adyacentes de y
        var nAdyY = blobY.adyacentes.length;
        for ( var j = 0; j < nAdyY; j++ ) {

            var blobX = blobY.adyacentes[ j ];

            // Si X no contiene a Y con borde 1, no es su padre
            if ( ! blobs_contieneBlob( blobX, blobY ) ) {
                continue;
            }

            var seSale = false;
            // Borra adyacentes candidatos
            // TODO
            //blobs.adyacentesCandidatos.length = 0;
            blobs.adyacentesCandidatos = [];

            // Bucle por todos los C, adyacentes comunes de X e Y
            var nAdyX = blobX.adyacentes.length;
            for ( var k = 0; k < nAdyY; k++ ) {
                var blobC = blobY.adyacentes[ k ];
                for ( var l = 0; l < nAdyX; l++ ) {
                    if ( blobC === blobX.adyacentes[ l ] ) {
                        if ( ! blobs_contieneBlob( blobX, blobC ) ) {
                            seSale = true;
                            break;
                        }
                        blobC.marca = Blob.MARCADO;
                        blobs.adyacentesCandidatos.push( blobC );
                    }
                }
                if ( seSale ) {
                    break;
                }
            }

            var numExpandidos = 0;
            while ( ( ! seSale ) && ( numExpandidos < blobs.adyacentesCandidatos.length ) ) {

                for ( var k = 0; k < blobs.adyacentesCandidatos.length; k++ ) {

                    var blobC = blobs.adyacentesCandidatos[ k ];

                    if ( blobC.marca === blobs.MARCADO ) {

                        var nAdyC = blobC.adyacentes.length;
                        for ( var l = 0; l < nAdyC; l++ ) {
                            var blobV = blobC.adyacentes[ l ];
                            if ( blobV.marca === blobs.NOMARCADO ) {
                                if ( ! blobs_contieneBlob( blobX, blobV ) ) {
                                    seSale = true;
                                    break;
                                }
                                else {
                                    blobs.adyacentesCandidatos.push( blobV );
                                    blobV.marca = Blob.MARCADO;
                                }
                            }
                        }

                        if ( seSale ) {
                            break;
                        }

                        blobC.marca = Blob.EXPANDIDO;
                        numExpandidos++;

                    }
                }
            }

            // Desmarca todos los blobs
            var nAdyCan = blobs.adyacentesCandidatos.length;
            for ( var k = 0; k < nAdyCan; k++ ) {
                var blobC = blobs.adyacentesCandidatos[ k ];
                blobC.marca = Blob.NOMARCADO;
            }

            if ( ! seSale ) {
                // X es el padre de Y
                blobs_hacerPadre( blobs, blobX, blobY );

                // La lista de adyacentescandidatos son todos hijos de x
                for ( var k = 0; k < nAdyCan; k++ ) {
                    blobs_hacerPadre( blobs, blobX, blobs.adyacentesCandidatos[ k ] );
                }

                break;
            }
        }
    }

    // Busca los nodos raiz y los coloca como hermanos
    var i = 0;
    while ( i < blobs.numBlobs ) {
        blobs.blobRaiz = i;
        var blobRaiz = blobs.blobs[ i ];
        if ( blobRaiz.valido && blobRaiz.padre === -1 ) {
            break;
        }
        i++;
    }

    if ( i < blobs.numBlobs ) {
        var blobX = blobs.blobs[ blobs.blobRaiz ];
        for ( var indY = blobs.blobRaiz; indY < blobs.numBlobs; indY++ ) {
            var blobY = blobs.blobs[ indY ];
            if ( blobY.valido && blobY.padre === -1 ) {
                blobX.hermanoSig = indY;
                blobX = blobY;
            }
        }
        blobX.hermanoSig = -1;
    }
    else {
        // Esto no debe ocurrir nunca
        blobs.blobRaiz = -1;
    }
}
