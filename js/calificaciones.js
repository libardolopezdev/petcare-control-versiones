
/* PetCare - HU5: Calificaciones y comentarios. */
(function () {
    'use strict';

    const CLAVE = 'petcare_calificaciones';

    const modal = document.getElementById('modal-calificacion');
    if (!modal) return;

    const formulario = document.getElementById('form-calificacion');
    const titulo = document.getElementById('titulo-calificacion');
    const detalle = document.getElementById('detalle-calificacion');
    const comentario = document.getElementById('comentario-calificacion');
    const contador = document.getElementById('contador-comentario');
    const error = document.getElementById('error-calificacion');
    const texto = document.getElementById('texto-calificacion');
    const cancelar = document.getElementById('cancelar-calificacion');

    const estrellas = [
        ...document.querySelectorAll('#estrellas-calificacion [data-valor]')
    ];

    const descripciones = [
        'Selecciona una calificación.',
        'Muy mala experiencia',
        'Mala experiencia',
        'Experiencia regular',
        'Buena experiencia',
        'Excelente experiencia'
    ];

    let reservaActual = null;
    let valorActual = 0;
    let actualizarTarjeta = null;

    // Consultar las calificaciones almacenadas.
    function obtenerCalificaciones() {
        const datos = localStorage.getItem(CLAVE);

        if (datos === null) return [];

        const calificaciones = JSON.parse(datos);

        if (!Array.isArray(calificaciones) ||
            !calificaciones.every(c =>
                c &&
                typeof c.reservaId === 'string' &&
                Number.isInteger(c.estrellas) &&
                c.estrellas >= 1 &&
                c.estrellas <= 5 &&
                typeof c.comentario === 'string'
            )) {
            throw new Error('Datos de calificaciones no válidos.');
        }

        return calificaciones;
    }

    // Buscar la calificación de una reserva específica.
    function obtenerCalificacion(id) {
        return obtenerCalificaciones()
            .find(c => c.reservaId === id) || null;
    }

    // Actualizar las estrellas seleccionadas.
    function seleccionarEstrellas(valor) {
        valorActual = valor;

        estrellas.forEach(boton => {
            const numero = Number(boton.dataset.valor);

            boton.classList.toggle('activa', numero <= valor);

            boton.setAttribute(
                'aria-pressed',
                String(numero === valor)
            );
        });

        texto.textContent = descripciones[valor];
    }

    function actualizarContador() {
        contador.textContent =
            comentario.value.length + '/500 caracteres';
    }

    estrellas.forEach(boton => {
        boton.addEventListener('click', () => {
            seleccionarEstrellas(Number(boton.dataset.valor));
            error.textContent = '';
        });
    });

    comentario.addEventListener('input', actualizarContador);

    // Abrir la ventana para registrar o editar.
    function abrirModal(reserva, actualizar) {
        if (reserva.estado !== 'Completada') return;

        reservaActual = reserva;
        actualizarTarjeta = actualizar;

        formulario.reset();
        error.textContent = '';

        detalle.textContent =
            reserva.servicio + ' para ' + reserva.mascota +
            ' · ' + reserva.proveedor;

        try {
            const existente = obtenerCalificacion(reserva.id);

            titulo.textContent = existente
                ? 'Editar calificación'
                : 'Calificar servicio';

            seleccionarEstrellas(existente ? existente.estrellas : 0);

            comentario.value = existente
                ? existente.comentario
                : '';

            actualizarContador();
            modal.showModal();

        } catch (e) {
            window.alert('No fue posible consultar la calificación.');
        }
    }

    // Cancelar sin guardar los cambios.
    cancelar.addEventListener('click', () => {
        modal.close();
    });

    modal.addEventListener('close', () => {
        reservaActual = null;
        actualizarTarjeta = null;
        valorActual = 0;
    });

    // Validar y guardar la calificación.
    formulario.addEventListener('submit', evento => {
        evento.preventDefault();

        error.textContent = '';

        if (!reservaActual) return;

        if (!Number.isInteger(valorActual) ||
            valorActual < 1 || valorActual > 5) {
            error.textContent =
                'Debes seleccionar entre una y cinco estrellas.';
            estrellas[0].focus();
            return;
        }

        const mensaje = comentario.value.trim();

        if (mensaje.length > 500) {
            error.textContent =
                'El comentario no puede superar los 500 caracteres.';
            return;
        }

        try {
            const calificaciones = obtenerCalificaciones();

            const nueva = {
                reservaId: reservaActual.id,
                estrellas: valorActual,
                comentario: mensaje,
                fecha: new Date().toISOString()
            };

            const indice = calificaciones.findIndex(
                c => c.reservaId === reservaActual.id
            );

            if (indice >= 0) {
                calificaciones[indice] = nueva;
            } else {
                calificaciones.push(nueva);
            }

            localStorage.setItem(
                CLAVE,
                JSON.stringify(calificaciones)
            );

        } catch (e) {
            error.textContent =
                'No fue posible guardar la calificación.';
            return;
        }

        if (typeof actualizarTarjeta === 'function') {
            actualizarTarjeta();
        }

        modal.close();
    });

    // Crear las acciones de calificación de cada tarjeta.
    function agregarCalificacion(articulo, reserva) {
        if (reserva.estado !== 'Completada') return;

        const datos = articulo.querySelector('.ticket__datos');
        if (!datos) return;

        const acciones = document.createElement('div');

        acciones.className =
            'ticket__acciones calificacion-ticket-acciones';

        const boton = document.createElement('button');

        boton.type = 'button';
        boton.className =
            'boton boton--secundario boton--pequeno';

        acciones.append(boton);
        articulo.append(acciones);

        const resumen = document.createElement('div');
        resumen.className = 'calificacion-resumen';

        datos.append(resumen);

        function actualizar() {
            resumen.replaceChildren();
            resumen.hidden = true;

            try {
                const existente = obtenerCalificacion(reserva.id);

                boton.textContent = existente
                    ? 'Editar calificación'
                    : 'Calificar servicio';

                boton.setAttribute(
                    'aria-label',
                    boton.textContent + ': ' +
                    reserva.servicio + ' para ' + reserva.mascota
                );

                if (!existente) return;

                resumen.hidden = false;

                const puntuacion = document.createElement('span');

                puntuacion.className =
                    'calificacion-resumen__estrellas';

                puntuacion.textContent =
                    '★'.repeat(existente.estrellas) +
                    '☆'.repeat(5 - existente.estrellas) +
                    ' (' + existente.estrellas + '/5)';

                resumen.append(puntuacion);

                if (existente.comentario) {
                    const mensaje = document.createElement('p');

                    mensaje.className =
                        'calificacion-resumen__comentario';

                    mensaje.textContent = existente.comentario;

                    resumen.append(mensaje);
                }

            } catch (e) {
                boton.textContent = 'Calificación no disponible';
                boton.disabled = true;
            }
        }

        boton.addEventListener('click', () => {
            abrirModal(reserva, actualizar);
        });

        actualizar();
    }

    // Punto de conexión con historial.js.
    window.PetCareCalificaciones = {
        agregar: agregarCalificacion
    };

})();
