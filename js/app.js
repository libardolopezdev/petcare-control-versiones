/* ==========================================================================
   PetCare - Comportamiento de la interfaz
   Sin librerías. Cada bloque revisa si su elemento existe en la página,
   así el mismo archivo sirve para todas las pantallas.
   ========================================================================== */
(function () {
    'use strict';

    /* ---------- Cuentas de prueba (solo para el prototipo) ---------- */
    const CUENTAS = {
        'laura@petcare.co': { clave: 'mascota123', destino: 'propietario.html' },
        'andres@petcare.co': { clave: 'mascota123', destino: 'agenda.html' }
    };

    /* ---------- Utilidades ---------- */

    // Quita tildes y pasa a minúsculas para comparar textos
    function normalizar(texto) {
        return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    }

    // Aviso flotante de confirmación (feedback inmediato)
    let temporizadorAviso;
    function mostrarAviso(mensaje) {
        let aviso = document.getElementById('aviso');
        if (!aviso) {
            aviso = document.createElement('div');
            aviso.id = 'aviso';
            aviso.className = 'aviso';
            aviso.setAttribute('role', 'status');
            aviso.setAttribute('aria-live', 'polite');
            document.body.appendChild(aviso);
        }
        aviso.textContent = mensaje;
        aviso.classList.add('visible');
        clearTimeout(temporizadorAviso);
        temporizadorAviso = setTimeout(function () {
            aviso.classList.remove('visible');
        }, 3000);
    }

    // Marca o limpia el error de un campo (estado "Error" del UI Kit)
    function marcarError(idCampo, mensaje) {
        const campo = document.getElementById(idCampo);
        if (!campo) return;
        const entrada = campo.querySelector('.campo__entrada');
        const error = campo.querySelector('.campo__error');

        if (mensaje) {
            campo.classList.add('campo--error');
            entrada.setAttribute('aria-invalid', 'true');
            error.textContent = mensaje;
            error.hidden = false;
        } else {
            campo.classList.remove('campo--error');
            entrada.removeAttribute('aria-invalid');
            error.hidden = true;
        }
    }

    /* ==========================================================================
       Inicio de sesión
       ========================================================================== */
    const formAcceso = document.getElementById('form-acceso');

    if (formAcceso) {
        const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        formAcceso.addEventListener('submit', function (evento) {
            evento.preventDefault();   // Evita que los datos viajen en la URL

            const correo = normalizar(formAcceso.correo.value);
            const clave = formAcceso.clave.value;
            let valido = true;

            if (!patronCorreo.test(correo)) {
                marcarError('campo-correo', 'Escribe un correo válido, por ejemplo nombre@correo.com.');
                valido = false;
            } else {
                marcarError('campo-correo');
            }

            if (clave.length < 8) {
                marcarError('campo-clave', 'La contraseña debe tener al menos 8 caracteres.');
                valido = false;
            } else {
                marcarError('campo-clave');
            }

            if (!valido) {
                formAcceso.querySelector('[aria-invalid="true"]').focus();
                return;
            }

            // HU1: también acepta las cuentas creadas en registro.html
            let registrados = [];
            try { registrados = JSON.parse(localStorage.getItem('petcare_usuarios')) || []; } catch (e) { registrados = []; }
            const registrado = registrados.find(function (u) { return u.correo === correo; });
            const cuenta = CUENTAS[correo] || (registrado && {
                clave: registrado.clave,
                destino: registrado.rol === 'proveedor' ? 'agenda.html' : 'propietario.html'
            });
            if (!cuenta || cuenta.clave !== clave) {
                marcarError('campo-clave', 'El correo o la contraseña no coinciden. Revisa los datos e intenta de nuevo.');
                formAcceso.clave.focus();
                return;
            }

            mostrarAviso('Ingresando a tu cuenta...');
            setTimeout(function () {
                window.location.href = cuenta.destino;
            }, 700);
        });

        // El error se quita apenas la persona corrige el campo
        formAcceso.addEventListener('input', function (evento) {
            const campo = evento.target.closest('.campo');
            if (campo && campo.classList.contains('campo--error')) {
                marcarError(campo.id);
            }
        });
    }

    /* ---------- Mostrar u ocultar contraseña ---------- */
    const botonVer = document.getElementById('ver-clave');

    if (botonVer) {
        botonVer.addEventListener('click', function () {
            const entrada = document.getElementById('clave');
            const mostrar = entrada.type === 'password';
            entrada.type = mostrar ? 'text' : 'password';
            botonVer.setAttribute('aria-pressed', String(mostrar));
            botonVer.setAttribute('aria-label', mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña');
        });
    }

    /* ==========================================================================
       Barra de navegación: menú en celular
       ========================================================================== */
    document.querySelectorAll('.barra__boton-menu').forEach(function (boton) {
        const barra = boton.closest('.barra');
        boton.addEventListener('click', function () {
            const abierta = barra.classList.toggle('abierta');
            boton.setAttribute('aria-expanded', String(abierta));
        });
    });

    /* ==========================================================================
       Búsqueda y filtros por categoría (pantalla Buscar)
       ========================================================================== */
    const listaFiltrable = document.querySelector('[data-filtrable]');

    if (listaFiltrable) {
        const elementos = listaFiltrable.querySelectorAll('[data-categoria]');
        const sinResultados = document.getElementById('sin-resultados');
        let categoria = 'todos';
        let texto = '';

        function aplicarFiltros() {
            let visibles = 0;
            elementos.forEach(function (elemento) {
                const coincideCategoria = categoria === 'todos' || elemento.dataset.categoria === categoria;
                const coincideTexto = !texto || normalizar(elemento.textContent).includes(texto);
                const mostrar = coincideCategoria && coincideTexto;
                elemento.style.display = mostrar ? '' : 'none';
                if (mostrar) visibles++;
            });
            if (sinResultados) sinResultados.hidden = visibles > 0;
        }

        document.querySelectorAll('.filtro').forEach(function (filtro) {
            filtro.addEventListener('click', function () {
                document.querySelectorAll('.filtro').forEach(function (otro) {
                    otro.setAttribute('aria-pressed', 'false');
                });
                filtro.setAttribute('aria-pressed', 'true');
                categoria = filtro.dataset.categoria || 'todos';
                aplicarFiltros();
            });
        });

        const formBusqueda = document.getElementById('form-busqueda');
        if (formBusqueda) {
            const entradaBusqueda = formBusqueda.querySelector('input');
            formBusqueda.addEventListener('submit', function (evento) {
                evento.preventDefault();
                texto = normalizar(entradaBusqueda.value);
                aplicarFiltros();
            });
            entradaBusqueda.addEventListener('input', function () {
                texto = normalizar(entradaBusqueda.value);
                aplicarFiltros();
            });
        }
    }

    /* ==========================================================================
       Franjas horarias: solo una seleccionada por grupo
       ========================================================================== */
    document.querySelectorAll('.franjas').forEach(function (grupo) {
        grupo.addEventListener('click', function (evento) {
            const franja = evento.target.closest('.franja');
            if (!franja || franja.disabled) return;
            grupo.querySelectorAll('.franja').forEach(function (otra) {
                otra.setAttribute('aria-pressed', 'false');
            });
            franja.setAttribute('aria-pressed', 'true');
        });
    });
    /* ==========================================================================
       Panel de reserva (pantalla Buscar)
       - Muestra el proveedor elegido con "Ver horarios".
       - "Solicitar reserva" se activa solo cuando hay una franja elegida
         (heurística de Nielsen: prevención de errores).
       ========================================================================== */
    const panelReserva = document.getElementById('reserva');

    if (panelReserva) {
        const tituloReserva = document.getElementById('titulo-reserva');
        const detalleReserva = panelReserva.querySelector('#titulo-reserva + .texto-secundario');
        const grupoFranjas = panelReserva.querySelector('.franjas');
        const botonSolicitar = panelReserva.querySelector('.boton--principal');
        let proveedorActual = 'Andrés Rojas';

        // El aviso de este botón lo maneja este bloque, no el genérico
        botonSolicitar.removeAttribute('data-aviso');

        // Mensaje de ayuda encima del botón
        const ayuda = document.createElement('p');
        ayuda.className = 'texto-secundario';
        ayuda.setAttribute('aria-live', 'polite');
        botonSolicitar.before(ayuda);

        function limpiarTexto(texto) {
            return texto.replace(/\s+/g, ' ').trim();
        }

        function reiniciarSeleccion() {
            grupoFranjas.querySelectorAll('.franja:not(:disabled)').forEach(function (franja) {
                franja.setAttribute('aria-pressed', 'false');
            });
            botonSolicitar.disabled = true;
            ayuda.textContent = 'Elige un horario para continuar.';
        }

        reiniciarSeleccion();

        // Al elegir una franja se activa el botón
        grupoFranjas.addEventListener('click', function (evento) {
            const franja = evento.target.closest('.franja');
            if (!franja || franja.disabled) return;
            botonSolicitar.disabled = false;
            ayuda.textContent = 'Horario elegido: ' + limpiarTexto(franja.textContent);
        });

        // "Ver horarios" carga el proveedor de esa tarjeta en el panel
        document.querySelectorAll('.tarjeta-proveedor .boton').forEach(function (enlace) {
            enlace.addEventListener('click', function () {
                const tarjeta = enlace.closest('.tarjeta-proveedor');
                const nombre = limpiarTexto(tarjeta.querySelector('.tarjeta-proveedor__nombre').textContent);
                const categoria = limpiarTexto(tarjeta.querySelector('.tarjeta-proveedor__categoria').textContent);
                const precio = (tarjeta.querySelector('.tarjeta-proveedor__detalle').textContent.match(/\$[\d.]+/) || [''])[0];

                proveedorActual = nombre;
                tituloReserva.textContent = 'Reservar con ' + nombre;
                detalleReserva.textContent = precio ? categoria + ' · Desde ' + precio : categoria;
                reiniciarSeleccion();
            });
        });

        // Enviar la solicitud
        botonSolicitar.addEventListener('click', function () {
            const franja = grupoFranjas.querySelector('.franja[aria-pressed="true"]');
            if (!franja) return;
            const mascota = document.getElementById('mascota').value;
            const hora = limpiarTexto(franja.textContent);
            mostrarAviso('Solicitud enviada para ' + mascota + ' a las ' + hora + ' Queda pendiente hasta que ' + proveedorActual + ' la acepte.');
            reiniciarSeleccion();
        });
    }
    /* ==========================================================================
       Agenda del proveedor: aceptar, rechazar y marcar como atendida
       ========================================================================== */
    const TEXTO_ESTADO = {
        confirmada: 'Confirmada',
        rechazada: 'Rechazada',
        atendida: 'Atendida'
    };

    const AVISO_ESTADO = {
        confirmada: 'Cita aceptada. Se le avisó al propietario.',
        rechazada: 'Cita rechazada. Se le avisó al propietario.',
        atendida: 'Servicio marcado como atendido. Ya aparece en el historial.'
    };

    document.addEventListener('click', function (evento) {
        const boton = evento.target.closest('[data-estado]');
        if (!boton) return;

        const fila = boton.closest('.fila-agenda');
        if (!fila) return;

        const estado = boton.dataset.estado;
        const chip = fila.querySelector('.chip');
        const acciones = fila.querySelector('.fila-agenda__acciones');

        chip.className = 'chip chip--' + estado;
        chip.textContent = TEXTO_ESTADO[estado];

        acciones.querySelectorAll('[data-estado]').forEach(function (b) {
            b.remove();
        });

        // Una cita confirmada queda lista para marcarse como atendida
        if (estado === 'confirmada') {
            const siguiente = document.createElement('button');
            siguiente.type = 'button';
            siguiente.className = 'boton boton--secundario boton--pequeno';
            siguiente.dataset.estado = 'atendida';
            siguiente.textContent = 'Marcar como atendida';
            acciones.appendChild(siguiente);
        }

        mostrarAviso(AVISO_ESTADO[estado]);
    });

    /* ==========================================================================
       Avisos genéricos: cualquier botón con data-aviso="mensaje"
       ========================================================================== */
    document.addEventListener('click', function (evento) {
        const boton = evento.target.closest('[data-aviso]');
        if (!boton || boton.disabled) return;
        mostrarAviso(boton.dataset.aviso);
    });
})();