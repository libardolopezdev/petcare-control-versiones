/* PetCare - Mis reservas. */
(function () {
    'use strict';

    const CLAVE = 'petcare_reservas';
    const ESTADOS = {
        Confirmada: 'confirmada', Pendiente: 'pendiente',
        Completada: 'atendida', Cancelada: 'rechazada'
    };
    // Datos de demostración.
    const iniciales = [
        { id: 'r1', servicio: 'Paseo', mascota: 'Max', proveedor: 'Andrés Rojas', fecha: '2026-10-31', hora: '08:00', estado: 'Confirmada' },
        { id: 'r2', servicio: 'Paseo', mascota: 'Max', proveedor: 'Andrés Rojas', fecha: '2026-10-24', hora: '08:00', estado: 'Completada' },
        { id: 'r3', servicio: 'Baño', mascota: 'Max', proveedor: 'Peluquería Canina Patitas', fecha: '2026-10-18', hora: '10:00', estado: 'Completada' },
        { id: 'r4', servicio: 'Consulta', mascota: 'Luna', proveedor: 'Clínica Veterinaria Huellitas', fecha: '2026-10-10', hora: '09:00', estado: 'Completada' }
    ];

    function guardar(reservas) {
        localStorage.setItem(CLAVE, JSON.stringify(reservas));
    }

    function obtener() {
        const datos = localStorage.getItem(CLAVE);
        if (datos === null) {
            guardar(iniciales);
            return iniciales.map(reserva => ({ ...reserva }));
        }
        const reservas = JSON.parse(datos);
        if (!Array.isArray(reservas) || !reservas.every(r => r &&
            ['id', 'servicio', 'mascota', 'proveedor', 'fecha', 'hora'].every(k => typeof r[k] === 'string') &&
            Object.hasOwn(ESTADOS, r.estado))) {
            throw new Error('Datos de reservas no válidos.');
        }
        return reservas;
    }

    function activa(reserva) {
        return ['Confirmada', 'Pendiente'].includes(reserva.estado);
    }

    function elemento(etiqueta, texto, clase) {
        const nodo = document.createElement(etiqueta);
        if (clase) nodo.className = clase;
        nodo.textContent = texto;
        return nodo;
    }

    function fechaVisible(fecha) {
        return fecha.split('-').reverse().join('/');
    }

    const lista = document.getElementById('lista-reservas');
    const mensaje = document.getElementById('mensaje-reservas');

    function cancelar(id) {
        try {
            const reservas = obtener();
            const reserva = reservas.find(r => r.id === id);
            if (!reserva || !activa(reserva)) return;
            if (!window.confirm('¿Deseas cancelar esta reserva?')) return;
            reserva.estado = 'Cancelada';
            guardar(reservas);
            mostrar();
            mensaje.textContent = 'Reserva cancelada correctamente.';
        } catch (error) {
            mensaje.textContent = 'No se pudo cancelar la reserva. Revisa el almacenamiento del navegador.';
        }
    }

    function tarjeta(reserva) {
        const item = document.createElement('li');
        const article = document.createElement('article');
        article.className = 'ticket';
        const datos = document.createElement('div');
        datos.className = 'ticket__datos';
        const estado = document.createElement('p');
        estado.append(elemento('span', reserva.estado, 'chip chip--' + ESTADOS[reserva.estado]));
        datos.append(estado,
            elemento('span', reserva.servicio + ' para ' + reserva.mascota, 'ticket__etiqueta'),
            elemento('strong', fechaVisible(reserva.fecha) + ', ' + reserva.hora, 'subtitulo'),
            elemento('span', 'Proveedor: ' + reserva.proveedor));
        article.append(datos);
        if (activa(reserva)) {
            const acciones = document.createElement('div');
            acciones.className = 'ticket__acciones';
            const boton = elemento('button', 'Cancelar', 'boton boton--peligro boton--pequeno');
            boton.type = 'button';
            boton.setAttribute('aria-label', 'Cancelar reserva de ' + reserva.servicio + ' para ' + reserva.mascota + ', ' + fechaVisible(reserva.fecha) + ' a las ' + reserva.hora);
            boton.addEventListener('click', () => cancelar(reserva.id));
            acciones.append(boton);
            article.append(acciones);
        }
        item.append(article);
        return item;
    }

    function mostrar() {
        const reservas = obtener();
        const ordenadas = [...reservas].sort((a, b) =>
            Number(activa(b)) - Number(activa(a)) ||
            (b.fecha + b.hora).localeCompare(a.fecha + a.hora));
        lista.replaceChildren(...ordenadas.map(tarjeta));
        if (!reservas.length) {
            lista.append(elemento('li', 'No tienes reservas registradas.', 'mensaje-vacio'));
        }
        document.getElementById('contador-completadas').textContent = reservas.filter(r => r.estado === 'Completada').length;
        document.getElementById('contador-pendientes').textContent = reservas.filter(activa).length;
        document.getElementById('contador-canceladas').textContent = reservas.filter(r => r.estado === 'Cancelada').length;
    }

    if (lista) {
        try { mostrar(); }
        catch (error) { mensaje.textContent = 'No se pudieron cargar las reservas. Revisa el almacenamiento del navegador.'; }
    }

    const panel = document.getElementById('reserva');
    if (panel) {
        const solicitar = panel.querySelector('.boton--principal');
        const aviso = elemento('p', '', 'texto-secundario');
        aviso.setAttribute('role', 'status');
        solicitar.after(aviso);

        solicitar.addEventListener('click', function (evento) {
            const franja = panel.querySelector('.franja[aria-pressed="true"]');
            if (!franja || franja.disabled) return;
            const mascota = document.getElementById('mascota').value.trim();
            const proveedor = document.getElementById('titulo-reserva').textContent.replace(/^Reservar con\s+/, '').trim();
            const detalle = panel.querySelector('#titulo-reserva + .texto-secundario').textContent.toLowerCase();
            const servicio = detalle.includes('veterinaria') ? 'Consulta' : detalle.includes('peluquer') ? 'Baño' : 'Paseo';
            const horario = franja.textContent.replace(/\s+/g, '').toLowerCase().match(/^(\d{1,2}):(\d{2})([ap])\.m\.$/);
            try {
                if (!horario || !mascota || !proveedor) throw new Error('Selección incompleta.');
                const horas = Number(horario[1]) % 12 + (horario[3] === 'p' ? 12 : 0);
                const hora = String(horas).padStart(2, '0') + ':' + horario[2];
                // La pantalla Buscar presenta una fecha fija en esta maqueta.
                const fecha = '2026-10-31';
                const reservas = obtener();
                if (reservas.some(r => activa(r) && r.proveedor === proveedor && r.fecha === fecha && r.hora === hora)) {
                    aviso.textContent = 'Ya existe una reserva activa con ese proveedor y horario.';
                    evento.stopImmediatePropagation();
                    return;
                }
                const id = globalThis.crypto?.randomUUID?.() || Date.now() + '-' + Math.random().toString(36).slice(2);
                reservas.push({ id, servicio, mascota, proveedor, fecha, hora, estado: 'Pendiente' });
                guardar(reservas);
                aviso.textContent = 'Reserva guardada. Puedes consultarla en Mis reservas.';
            } catch (error) {
                evento.stopImmediatePropagation();
                aviso.textContent = 'No fue posible guardar la reserva. Revisa la selección y el almacenamiento.';
            }
        }, true);
    }
})();
