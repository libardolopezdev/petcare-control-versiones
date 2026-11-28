/* ==========================================================================
PetCare - HU2: Mis mascotas
Registrar, editar y eliminar mascotas. Los datos se guardan en
localStorage (clave "petcare_mascotas") para que no se pierdan al recargar.

Este archivo se carga en tres pantallas y cada bloque revisa si su
elemento existe:
    - mascotas.html     -> lista y formulario (registrar, editar, eliminar)
    - propietario.html  -> lista de mascotas y contador del inicio
    - buscar.html       -> selector "Mascota" del panel de reserva
Es independiente de app.js.
   ========================================================================== */
(function () {
    'use strict';

    const CLAVE = 'petcare_mascotas';

    // Mascotas de ejemplo: solo se cargan la primera vez que se abre la página
    const EJEMPLO = [
        { id: 1, nombre: 'Max', especie: 'Perro', raza: 'golden retriever', edad: 4 },
        { id: 2, nombre: 'Luna', especie: 'Gato', raza: 'criolla', edad: 2 }
    ];

    /* ---------- localStorage ---------- */

    function cargar() {
        try {
            const guardado = localStorage.getItem(CLAVE);
            if (guardado === null) {
                localStorage.setItem(CLAVE, JSON.stringify(EJEMPLO));
                return EJEMPLO.slice();
            }
            const datos = JSON.parse(guardado);
            return Array.isArray(datos) ? datos : [];
        } catch (e) {
            return EJEMPLO.slice();   // sin localStorage: funciona solo en memoria
        }
    }

    function guardar(mascotas) {
        try {
            localStorage.setItem(CLAVE, JSON.stringify(mascotas));
        } catch (e) { /* si falla, la lista sigue funcionando en memoria */ }
    }

    /* ---------- Utilidades ---------- */

    function textoEdad(edad) {
        if (edad === 0) return 'menos de 1 año';
        return edad + (edad === 1 ? ' año' : ' años');
    }

    function descripcion(m) {
        const partes = [m.especie];
        if (m.raza) partes.push(m.raza);
        partes.push(textoEdad(m.edad));
        return partes.join(', ');
    }

    // Placa circular con las primeras letras del nombre
    function crearPlaca(nombre) {
        const placa = document.createElement('div');
        placa.className = 'placa';
        placa.setAttribute('aria-hidden', 'true');
        placa.textContent = nombre.slice(0, 4).toUpperCase();
        return placa;
    }

    // Bloque con el nombre y la descripción de la mascota
    function crearInfo(m) {
        const info = document.createElement('div');
        info.className = 'tarjeta-mascota__info';
        const nombre = document.createElement('strong');
        nombre.textContent = m.nombre;
        const detalle = document.createElement('p');
        detalle.className = 'texto-secundario';
        detalle.textContent = descripcion(m);
        info.append(nombre, detalle);
        return info;
    }

    /* ==========================================================================
       propietario.html: lista de mascotas y contador del inicio
       ========================================================================== */
    const listaInicio = document.getElementById('lista-mascotas-inicio');
    const totalInicio = document.getElementById('total-mascotas');

    if (listaInicio || totalInicio) {
        const guardadas = cargar();

        if (totalInicio) totalInicio.textContent = guardadas.length;

        if (listaInicio) {
            listaInicio.textContent = '';
            if (guardadas.length === 0) {
                const vacio = document.createElement('li');
                vacio.className = 'texto-secundario';
                vacio.textContent = 'Aún no tienes mascotas registradas.';
                listaInicio.appendChild(vacio);
            }
            guardadas.forEach(function (m) {
                const item = document.createElement('li');
                item.className = 'tarjeta-mascota';
                item.append(crearPlaca(m.nombre), crearInfo(m));
                listaInicio.appendChild(item);
            });
        }
    }

    /* ==========================================================================
       buscar.html: selector de mascota en el panel de reserva
       ========================================================================== */
    const selectorReserva = document.getElementById('mascota');

    if (selectorReserva) {
        const guardadas = cargar();
        selectorReserva.textContent = '';

        if (guardadas.length === 0) {
            const opcion = document.createElement('option');
            opcion.value = 'tu mascota';
            opcion.textContent = 'Registra una mascota primero';
            selectorReserva.appendChild(opcion);
        }
        guardadas.forEach(function (m) {
            const opcion = document.createElement('option');
            opcion.value = m.nombre;
            opcion.textContent = m.nombre;
            selectorReserva.appendChild(opcion);
        });
    }

    /* ==========================================================================
       mascotas.html: lista y formulario
       ========================================================================== */
    const lista = document.getElementById('lista-mascotas');
    const form = document.getElementById('form-mascota');

    if (!lista || !form) return;   // las otras pantallas terminan aquí

    const sinMascotas = document.getElementById('sin-mascotas');
    const tituloForm = document.getElementById('titulo-form');
    const botonGuardar = document.getElementById('boton-guardar');
    const botonCancelar = document.getElementById('boton-cancelar');

    let mascotas = cargar();
    let editandoId = null;         // id de la mascota en edición (null = agregando)

    let temporizador;
    function mostrarAviso(mensaje) {
        const aviso = document.getElementById('aviso');
        if (!aviso) return;
        aviso.textContent = mensaje;
        aviso.classList.add('visible');
        clearTimeout(temporizador);
        temporizador = setTimeout(function () {
            aviso.classList.remove('visible');
        }, 3000);
    }

    function marcarError(idCampo, mensaje) {
        const campo = document.getElementById(idCampo);
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

    /* ---------- Pintar la lista ---------- */

    function crearBoton(texto, clase, etiqueta, accion) {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'boton boton--pequeno ' + clase;
        boton.textContent = texto;
        boton.setAttribute('aria-label', etiqueta);
        boton.addEventListener('click', accion);
        return boton;
    }

    function pintar() {
        lista.textContent = '';
        sinMascotas.hidden = mascotas.length > 0;

        mascotas.forEach(function (m) {
            const item = document.createElement('li');
            item.className = 'tarjeta-mascota';
            if (m.id === editandoId) item.classList.add('tarjeta-mascota--editando');

            const acciones = document.createElement('div');
            acciones.className = 'tarjeta-mascota__acciones';
            acciones.append(
                crearBoton('Editar', 'boton--secundario', 'Editar a ' + m.nombre, function () { empezarEdicion(m.id); }),
                crearBoton('Eliminar', 'boton--peligro', 'Eliminar a ' + m.nombre, function () { eliminar(m.id); })
            );

            item.append(crearPlaca(m.nombre), crearInfo(m), acciones);
            lista.appendChild(item);
        });
    }

    /* ---------- Formulario ---------- */

    function limpiarFormulario() {
        form.reset();
        ['campo-nombre', 'campo-especie', 'campo-raza', 'campo-edad'].forEach(function (id) {
            marcarError(id);
        });
        editandoId = null;
        tituloForm.textContent = 'Agregar mascota';
        botonGuardar.textContent = 'Guardar mascota';
        botonCancelar.hidden = true;
    }

    function empezarEdicion(id) {
        const m = mascotas.find(function (x) { return x.id === id; });
        if (!m) return;
        editandoId = id;
        form.nombre.value = m.nombre;
        form.especie.value = m.especie;
        form.raza.value = m.raza;
        form.edad.value = m.edad;
        tituloForm.textContent = 'Editar mascota';
        botonGuardar.textContent = 'Guardar cambios';
        botonCancelar.hidden = false;
        pintar();
        form.nombre.focus();
    }

    function eliminar(id) {
        const m = mascotas.find(function (x) { return x.id === id; });
        if (!m) return;
        if (!window.confirm('¿Eliminar a ' + m.nombre + '? Esta acción no se puede deshacer.')) return;
        mascotas = mascotas.filter(function (x) { return x.id !== id; });
        guardar(mascotas);
        if (editandoId === id) limpiarFormulario();
        pintar();
        mostrarAviso(m.nombre + ' fue eliminada de tu lista.');
    }

    function validar(datos) {
        let valido = true;

        if (datos.nombre.length < 2) {
            marcarError('campo-nombre', 'Escribe el nombre de tu mascota (mínimo 2 letras).');
            valido = false;
        } else if (mascotas.some(function (m) {
            return m.id !== editandoId && m.nombre.toLowerCase() === datos.nombre.toLowerCase();
        })) {
            marcarError('campo-nombre', 'Ya tienes una mascota con ese nombre.');
            valido = false;
        } else {
            marcarError('campo-nombre');
        }

        if (!datos.especie) {
            marcarError('campo-especie', 'Selecciona la especie.');
            valido = false;
        } else {
            marcarError('campo-especie');
        }

        if (datos.edadTexto === '' || !Number.isInteger(datos.edad) || datos.edad < 0 || datos.edad > 30) {
            marcarError('campo-edad', 'Escribe una edad entera entre 0 y 30 años.');
            valido = false;
        } else {
            marcarError('campo-edad');
        }

        return valido;
    }

    form.addEventListener('submit', function (evento) {
        evento.preventDefault();

        const datos = {
            nombre: form.nombre.value.trim(),
            especie: form.especie.value,
            raza: form.raza.value.trim(),
            edadTexto: form.edad.value.trim(),
            edad: Number(form.edad.value)
        };

        if (!validar(datos)) {
            const primero = form.querySelector('[aria-invalid="true"]');
            if (primero) primero.focus();
            return;
        }

        if (editandoId === null) {
            const nuevoId = mascotas.reduce(function (mayor, m) { return Math.max(mayor, m.id); }, 0) + 1;
            mascotas.push({ id: nuevoId, nombre: datos.nombre, especie: datos.especie, raza: datos.raza, edad: datos.edad });
            mostrarAviso(datos.nombre + ' fue agregada a tu lista.');
        } else {
            const m = mascotas.find(function (x) { return x.id === editandoId; });
            m.nombre = datos.nombre;
            m.especie = datos.especie;
            m.raza = datos.raza;
            m.edad = datos.edad;
            mostrarAviso('Cambios de ' + datos.nombre + ' guardados.');
        }

        guardar(mascotas);
        limpiarFormulario();
        pintar();
    });

    botonCancelar.addEventListener('click', function () {
        limpiarFormulario();
        pintar();
    });

    // El error se quita apenas la persona corrige el campo
    form.addEventListener('input', function (evento) {
        const campo = evento.target.closest('.campo');
        if (campo && campo.classList.contains('campo--error')) marcarError(campo.id);
    });

    pintar();
})();
