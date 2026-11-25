
/* ==========================================
   HU4 - Mis horarios del proveedor
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const CLAVE_STORAGE = "petcare_horarios";

    const horariosIniciales = [
        { dia: "Lunes", inicio: "06:00", fin: "12:00", activo: true },
        { dia: "Martes", inicio: "06:00", fin: "12:00", activo: true },
        { dia: "Miércoles", inicio: "06:00", fin: "12:00", activo: true },
        { dia: "Jueves", inicio: "06:00", fin: "12:00", activo: true },
        { dia: "Viernes", inicio: "06:00", fin: "12:00", activo: true },
        { dia: "Sábado", inicio: "07:00", fin: "18:00", activo: true },
        { dia: "Domingo", inicio: "08:00", fin: "12:00", activo: false }
    ];

    const lista = document.getElementById("lista-horarios");
    const formulario = document.getElementById("form-horarios");
    const modal = document.getElementById("modal-horarios");
    const campos = document.getElementById("campos-horarios");
    const btnModificar = document.getElementById("btn-modificar-horarios");
    const btnCancelar = document.getElementById("btn-cancelar-horarios");
    const error = document.getElementById("error-horarios");

    if (!lista || !formulario || !campos ||
        !btnModificar || !btnCancelar || !error) return;

    // Recuperar los horarios almacenados.
    function cargarHorarios() {
        try {
            const datos = JSON.parse(localStorage.getItem(CLAVE_STORAGE));

            if (Array.isArray(datos) && datos.length === 7) {
                return datos;
            }
        } catch (e) {
            console.warn("No se pudieron recuperar los horarios.", e);
        }

        return horariosIniciales.map(horario => ({ ...horario }));
    }

    let horarios = cargarHorarios();

    // Mostrar los horarios actuales.
    function mostrarHorarios() {
        lista.replaceChildren();

        horarios.forEach(horario => {
            const elemento = document.createElement("li");
            const dia = document.createElement("strong");
            const disponibilidad = document.createElement("span");

            dia.textContent = horario.dia;

            disponibilidad.textContent = horario.activo
                ? `${horario.inicio} - ${horario.fin}`
                : "Sin atención";

            elemento.append(dia, disponibilidad);
            lista.appendChild(elemento);
        });
    }

    // Generar el formulario de edición.
    function generarFormulario() {
        campos.innerHTML = "";

        horarios.forEach((horario, indice) => {
            const fila = document.createElement("div");

            fila.className = "horario-fila";

            fila.innerHTML = `
                <strong>${horariosIniciales[indice].dia}</strong>

                <label class="horario-estado">
                    <input type="checkbox"
                        id="activo-${indice}"
                        ${horario.activo ? "checked" : ""}>
                    Disponible
                </label>

                <label>
                    Inicio
                    <input type="time"
                        id="inicio-${indice}"
                        ${horario.activo ? "" : "disabled"}>
                </label>

                <label>
                    Fin
                    <input type="time"
                        id="fin-${indice}"
                        ${horario.activo ? "" : "disabled"}>
                </label>
            `;

            campos.appendChild(fila);

            const activo = document.getElementById(`activo-${indice}`);
            const inicio = document.getElementById(`inicio-${indice}`);
            const fin = document.getElementById(`fin-${indice}`);

            inicio.value = horario.inicio;
            fin.value = horario.fin;

            activo.addEventListener("change", () => {
                inicio.disabled = !activo.checked;
                fin.disabled = !activo.checked;
            });
        });
    }

    // Abrir la ventana modal.
    function abrirModalHorarios() {
        generarFormulario();

        error.hidden = true;
        modal.showModal();
    }

    // Abrir desde el botón Modificar horarios.
    btnModificar.addEventListener("click", abrirModalHorarios);

    // Abrir desde el menú de navegación.
    const navHorarios = document.getElementById("nav-horarios");

    if (navHorarios) {
        navHorarios.addEventListener("click", evento => {
            evento.preventDefault();
            abrirModalHorarios();
        });
    }
    // Cancelar sin guardar los cambios.
    btnCancelar.addEventListener("click", () => {
        modal.close();
        error.hidden = true;
    });

    // Validar y guardar los horarios.
    formulario.addEventListener("submit", evento => {
        evento.preventDefault();

        const nuevosHorarios = [];

        error.hidden = true;

        for (let i = 0; i < horarios.length; i++) {

            const activo = document.getElementById(`activo-${i}`).checked;
            const inicio = document.getElementById(`inicio-${i}`).value;
            const fin = document.getElementById(`fin-${i}`).value;

            if (activo && (!inicio || !fin || fin <= inicio)) {
                error.textContent =
                    `El horario del ${horarios[i].dia.toLowerCase()} no es válido. ` +
                    "La hora de fin debe ser posterior a la de inicio.";

                error.hidden = false;
                return;
            }

            nuevosHorarios.push({
                dia: horarios[i].dia,
                inicio,
                fin,
                activo
            });
        }

        try {
            localStorage.setItem(
                CLAVE_STORAGE,
                JSON.stringify(nuevosHorarios)
            );
        } catch (e) {
            error.textContent = "No fue posible guardar los horarios.";
            error.hidden = false;
            return;
        }

        horarios = nuevosHorarios;

        mostrarHorarios();

        modal.close();
    });

    // Mostrar los horarios al cargar la página.
    mostrarHorarios();

});
