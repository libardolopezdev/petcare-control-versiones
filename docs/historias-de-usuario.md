# Historias de usuario - PetCare

Proyecto: PetCare (plataforma para agendar servicios de cuidado de mascotas).

## Organización del equipo

| Historia | Responsable | Rama |
| HU1 - Registro de usuario | Libardo | `feature/hu1-registro` |
| HU2 - Mis mascotas | Felipe | `feature/hu2-mascotas` |
| HU3 - Mis reservas | Luis | `feature/hu3-reservas` |
| HU4 - Mis horarios del proveedor | Miguel | `feature/hu4-horarios` |
| HU5 - Historial y calificación de servicios | Luis (inicia) y Miguel (termina) | `feature/hu5-historial` |

## Flujo de ramas

- `main`: versión estable. Solo recibe el merge final de `develop`, hecho por Miguel.
- `develop`: rama de integración. Todos los Pull Request de las historias van hacia esta rama.
- `feature/...`: una rama por historia, creada desde `develop`.
---

## HU1 - Registro de usuario

Como visitante, quiero crear una cuenta eligiendo si soy propietario o proveedor, para poder usar PetCare.

Criterios de aceptación:
- Existe la página `registro.html`, enlazada desde "Regístrate" en el inicio de sesión.
- El formulario pide nombre, correo, contraseña, confirmar contraseña y rol.
- Valida correo válido, contraseña de mínimo 8 caracteres y que ambas contraseñas coincidan.
- Muestra mensajes de error claros junto a cada campo.

## HU2 - Mis mascotas

Como propietario, quiero registrar a mis mascotas con nombre, especie, raza y edad, para elegirlas al reservar un servicio.

Criterios de aceptación:
- Existe la página `mascotas.html`, enlazada desde "Mis mascotas" y "Agregar mascota".
- El formulario valida nombre (mínimo 2 letras y sin repetir), especie y edad (entero entre 0 y 30).
- Las mascotas se muestran como tarjetas y se pueden editar y eliminar.
- Los datos se conservan al recargar la página (`localStorage`).

## HU3 - Mis reservas

Como propietario, quiero ver todas mis reservas con su estado y poder cancelarlas, para tener control de mis citas.

Criterios de aceptación:
- Lista completa de reservas con proveedor, fecha, hora y estado.
- Al cancelar una reserva, su estado cambia a "Cancelada" y los contadores se actualizan.
- Los cambios se conservan al recargar la página.

## HU4 - Mis horarios del proveedor

Como proveedor, quiero definir mis días y horas de atención, para que los propietarios solo reserven cuando estoy disponible.

Criterios de aceptación:
- Se puede editar la hora de inicio y fin de cada día, o marcar "Sin atención".
- Valida que la hora de fin sea posterior a la de inicio.
- Los horarios se conservan al recargar la página.

## HU5 - Historial y calificación de servicios

Como propietario, quiero ver mi historial de servicios, filtrarlo por tipo y calificar al proveedor, para recordar lo que contraté y ayudar a otros usuarios.

Criterios de aceptación:
- Lista del historial con filtro por tipo de servicio (paseo, baño, consulta).
- Calificación del proveedor con estrellas y comentario.
- Las calificaciones se conservan al recargar la página.
- Esta historia la trabajan dos integrantes sobre la misma rama: Luis la inicia y Miguel la termina.
