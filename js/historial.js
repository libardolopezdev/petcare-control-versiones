/* PetCare - HU5: consulta del historial de servicios. */
(function () {
    'use strict';

    const CLAVE = 'petcare_reservas';
    const TIPOS = { Paseo: 'verde', 'Baño': 'violeta', Consulta: 'roja' };
    const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const lista = document.getElementById('lista-historial');
    const resumen = document.getElementById('resumen-historial');
    if (!lista && !resumen) return;

    // La HU3 administra el almacenamiento. La HU5 solamente lo consulta.
    function obtenerCompletadas() {
        const datos = localStorage.getItem(CLAVE);
        if (datos === null) return null;
        const reservas = JSON.parse(datos);
        if (!Array.isArray(reservas) || !reservas.every(r => r &&
            ['id', 'servicio', 'mascota', 'proveedor', 'fecha', 'hora', 'estado']
                .every(k => typeof r[k] === 'string'))) {
            throw new Error('Datos de reservas no válidos.');
        }
        return reservas.filter(r => r.estado === 'Completada')
            .sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora));
    }

    function elemento(etiqueta, texto, clase) {
        const nodo = document.createElement(etiqueta);
        if (clase) nodo.className = clase;
        nodo.textContent = texto;
        return nodo;
    }

    function tarjeta(reserva) {
        const item = document.createElement('li');
        const articulo = document.createElement('article');
        articulo.className = 'ticket';
        // Punto de integración para las calificaciones y comentarios de Miguel.
        articulo.dataset.reservaId = reserva.id;
        const datos = document.createElement('div');
        datos.className = 'ticket__datos';
        const estado = document.createElement('p');
        estado.append(elemento('span', 'Completada', 'chip chip--atendida'));
        datos.append(estado,
            elemento('strong', reserva.servicio + ' para ' + reserva.mascota, 'subtitulo'),
            elemento('span', 'Proveedor: ' + reserva.proveedor),
            elemento('span', 'Fecha: ' + reserva.fecha.split('-').reverse().join('/') + ' · Hora: ' + reserva.hora, 'texto-secundario'));
        articulo.append(datos);
        item.append(articulo);
        return item;
    }

    if (lista) {
        const filtros = [...document.querySelectorAll('#filtros-historial [data-servicio]')];
        const mensaje = document.getElementById('mensaje-historial');
        let tipo = 'todos';
        function mostrar() {
            lista.replaceChildren();
            try {
                const completadas = obtenerCompletadas();
                if (completadas === null) {
                    mensaje.textContent = 'Visita Inicio para cargar las reservas del prototipo y vuelve al historial.';
                    return;
                }
                const visibles = completadas.filter(r => tipo === 'todos' || r.servicio === tipo);
                lista.append(...visibles.map(tarjeta));
                mensaje.textContent = visibles.length === 0 ? 'No hay servicios completados para este filtro.' :
                    visibles.length === 1 ? '1 servicio encontrado.' : visibles.length + ' servicios encontrados.';
            } catch (error) {
                mensaje.textContent = 'No fue posible cargar el historial. Revisa el almacenamiento del navegador.';
            }
        }
        filtros.forEach(boton => boton.addEventListener('click', () => {
            tipo = boton.dataset.servicio;
            filtros.forEach(f => f.setAttribute('aria-pressed', String(f === boton)));
            mostrar();
        }));
        window.addEventListener('pageshow', mostrar);
        mostrar();
    }

    if (resumen) {
        const plantilla = document.getElementById('plantilla-huella-historial');
        const mensaje = document.getElementById('mensaje-resumen-historial');
        function mostrarResumen() {
            resumen.replaceChildren();
            try {
                const completadas = obtenerCompletadas() || [];
                // El panel conserva hasta cuatro huellas; el historial muestra todas.
                completadas.slice(0, 4).forEach(r => {
                    const huella = plantilla.content.firstElementChild.cloneNode(true);
                    huella.className = 'huella' + (Object.hasOwn(TIPOS, r.servicio) ? ' huella--' + TIPOS[r.servicio] : '');
                    huella.querySelector('[data-historial-servicio]').textContent = r.servicio;
                    const partes = r.fecha.split('-');
                    huella.querySelector('[data-historial-fecha]').textContent = MESES[Number(partes[1]) - 1] ? Number(partes[2]) + ' ' + MESES[Number(partes[1]) - 1] : r.fecha;
                    resumen.append(huella);
                });
                mensaje.textContent = completadas.length ? '' : 'Aún no tienes servicios completados.';
            } catch (error) {
                mensaje.textContent = 'No se pudo cargar el resumen del historial.';
            }
        }
        window.addEventListener('pageshow', mostrarResumen);
        mostrarResumen();
    }
})();
