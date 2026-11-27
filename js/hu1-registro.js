/* ==========================================================================
   PetCare - HU1: Registro de usuario
   Permite crear una cuenta como propietario o proveedor.
   Los usuarios se guardan en localStorage con la clave "petcare_usuarios".
   Nota: es un prototipo; en un sistema real la contraseña nunca se guarda
   en el navegador.
   ========================================================================== */
(function () {
    'use strict';

    const form = document.getElementById('form-registro');
    if (!form) return;

    const CLAVE_USUARIOS = 'petcare_usuarios';
    const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const botonesRol = form.querySelectorAll('[data-rol]');
    let rolElegido = '';

    /* ---------- Utilidades ---------- */

    function leerUsuarios() {
        try {
            return JSON.parse(localStorage.getItem(CLAVE_USUARIOS)) || [];
        } catch (e) {
            return [];
        }
    }

    function guardarUsuarios(usuarios) {
        localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
    }

    function mostrarAviso(mensaje) {
        const aviso = document.getElementById('aviso');
        if (!aviso) return;
        aviso.textContent = mensaje;
        aviso.classList.add('visible');
        setTimeout(function () { aviso.classList.remove('visible'); }, 3000);
    }

    // Marca o limpia el error de un campo (mismo estilo del UI Kit)
    function marcarError(idCampo, mensaje) {
        const campo = document.getElementById(idCampo);
        if (!campo) return;
        const entrada = campo.querySelector('.campo__entrada');
        const error = campo.querySelector('.campo__error');

        if (mensaje) {
            campo.classList.add('campo--error');
            if (entrada) entrada.setAttribute('aria-invalid', 'true');
            error.textContent = mensaje;
            error.hidden = false;
        } else {
            campo.classList.remove('campo--error');
            if (entrada) entrada.removeAttribute('aria-invalid');
            error.hidden = true;
        }
    }

    /* ---------- Selección del rol ---------- */

    botonesRol.forEach(function (boton) {
        boton.addEventListener('click', function () {
            rolElegido = boton.dataset.rol;
            botonesRol.forEach(function (otro) {
                otro.setAttribute('aria-pressed', String(otro === boton));
            });
            marcarError('campo-rol');
        });
    });

    /* ---------- Envío del formulario ---------- */

    form.addEventListener('submit', function (evento) {
        evento.preventDefault();

        const nombre = form.nombre.value.trim();
        const correo = form.correo.value.trim().toLowerCase();
        const clave = form.clave.value;
        const confirmar = form.confirmar.value;
        let primerError = null;

        function validar(idCampo, condicion, mensaje, foco) {
            if (condicion) {
                marcarError(idCampo);
            } else {
                marcarError(idCampo, mensaje);
                if (!primerError) primerError = foco;
            }
        }

        validar('campo-nombre', nombre.length >= 3,
            'Escribe tu nombre (mínimo 3 letras).', form.nombre);
        validar('campo-correo', patronCorreo.test(correo),
            'Escribe un correo válido, por ejemplo nombre@correo.com.', form.correo);
        validar('campo-clave', clave.length >= 8,
            'La contraseña debe tener al menos 8 caracteres.', form.clave);
        validar('campo-confirmar', confirmar.length > 0 && confirmar === clave,
            'Las contraseñas no coinciden.', form.confirmar);
        validar('campo-rol', rolElegido !== '',
            'Elige si eres propietario o proveedor.', botonesRol[0]);

        if (primerError) {
            primerError.focus();
            return;
        }

        const usuarios = leerUsuarios();
        if (usuarios.some(function (u) { return u.correo === correo; })) {
            marcarError('campo-correo', 'Ya existe una cuenta con este correo. Inicia sesión.');
            form.correo.focus();
            return;
        }

        usuarios.push({ nombre: nombre, correo: correo, clave: clave, rol: rolElegido });
        guardarUsuarios(usuarios);

        mostrarAviso('Cuenta creada. Ya puedes iniciar sesión.');
        setTimeout(function () {
            window.location.href = 'index.html';
        }, 1200);
    });

    // El error se quita apenas la persona corrige el campo
    form.addEventListener('input', function (evento) {
        const campo = evento.target.closest('.campo');
        if (campo && campo.classList.contains('campo--error')) {
            marcarError(campo.id);
        }
    });
})();
