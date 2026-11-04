# 📘 PROJECT_BLUEPRINT.md — IcaStay

## 1. Identidad del Proyecto
* **Nombre del proyecto:** IcaStay
* **Misión:** Conectar a los viajeros con los mejores alojamientos de la región de Ica mediante un proceso transparente, seguro y guiado desde la búsqueda hasta el check-in.
* **Visión:** Convertirse en el estándar principal para reservas turísticas y experiencias exclusivas en el sur del Perú, integrando comunicación en tiempo real, gestión de tours y pagos automatizados.
* **Propuesta de valor:** 
  * *Para el huésped:* Sello de garantía en hoteles verificados y trazabilidad en tiempo real del estado de su solicitud.
  * *Para el hotel:* Canal de adquisición digital que educa al cliente y ordena la recepción de reservas sin fricción.

## 2. Descripción y Justificación
IcaStay es una plataforma web de intermediación y directorio de alojamientos exclusiva para la región de Ica (Paracas, Huacachina, Ica Centro, viñedos). Combina un catálogo general de hospedajes con un sistema de reservas verificado ("Partners"), destacando por ofrecer al cliente un panel de seguimiento visual sobre el estado de su solicitud de hospedaje.

## 3. Problema y Solución
* **Problema:** Buscar alojamiento en zonas turísticas mediante buscadores genéricos o mapas genera incertidumbre sobre la veracidad del hotel, su disponibilidad real y el respaldo ante problemas. Existe un vacío de información entre el clic de reserva y la llegada al hotel.
* **Solución:** Un sistema híbrido que separa hoteles de simple directorio de los **Hoteles Verificados (Partners)**, incorporando un flujo de reserva con trazabilidad de estados paso a paso para eliminar la incertidumbre del viajero.

## 4. Objetivos
* **Objetivo General:** Construir una plataforma web escalable (arquitectura PERN) que centralice la oferta hotelera de Ica y gestione solicitudes de reserva con seguimiento de estado.
* **Objetivos Específicos:**
  1. Implementar una base de datos relacional que soporte hoteles verificados (reserva interna) y no verificados (directorio externo).
  2. Desarrollar un panel de usuario interactivo para el seguimiento de reservas (`Pendiente`, `Confirmada`, `Rechazada/Cancelada`, `En Curso`, `Finalizada`).
  3. Integrar filtros dinámicos por zona geográfica, rango de precio y tipo de experiencia.
  4. Implementar un flujo de *Onboarding Profiling* opcional post-registro para personalizar recomendaciones.

## 5. Usuarios y Beneficiarios
1. **Huésped / Turista:** Usuario final que explora el catálogo, filtra opciones, solicita reservas y monitorea su estado.
2. **Hotel Partner (Verificado):** Entidad hotelera que accede a un panel propio para aceptar o rechazar solicitudes y actualizar el estado de la estadía.
3. **SuperAdmin:** Administrador general de IcaStay encargado de registrar hoteles en el directorio, otorgar el sello de verificación (Partner) y moderar la plataforma.

## 6. Alcance del Proyecto
### Incluido en el MVP (Versión 1.0)
* Autenticación de usuarios (Registro y Login con email/contraseña).
* Cuestionario breve y opcional post-registro (*Onboarding Profiling*).
* Catálogo público de hoteles con filtros dinámicos.
* Distinción visual y funcional entre Hoteles Partner y Hoteles de Directorio.
* Motor de solicitudes de reserva exclusivo para Hoteles Partner.
* Panel del Huésped con línea de tiempo de trazabilidad y cancelación en estado `Pendiente`.
* Panel del Hotel Partner para gestión de estados de reserva.

### Excluido del MVP (Limitaciones iniciales)
* Sistema de chat/mensajería directa en tiempo real con recepción.
* Pasarela de pagos automatizada con tarjetas de crédito/débito dentro de la plataforma.

## 7. Requisitos del Sistema
### Requisitos Funcionales (RF)
* **RF-01:** El sistema debe permitir el registro e inicio de sesión diferenciando el rol del usuario (`GUEST`, `HOTEL_PARTNER`, `ADMIN`).
* **RF-02:** El sistema debe permitir guardar preferencias de viaje del usuario tras su registro.
* **RF-03:** El sistema debe listar hoteles permitiendo filtrar por ubicación (zona de Ica) y precio.
* **RF-04:** El sistema debe permitir a un huésped autenticado crear una solicitud de reserva indicando fechas de entrada/salida y cantidad de huéspedes.
* **RF-05:** El sistema debe permitir al huésped cancelar su propia solicitud únicamente mientras se encuentre en estado `Pendiente`.
* **RF-06:** El sistema debe permitir al Hotel Partner cambiar el estado de las reservas recibidas (`Confirmada`, `Rechazada`, `En Curso`, `Finalizada`).

### Requisitos No Funcionales (RNF)
* **RNF-01 (Diseño Responsivo):** Interfaz *Mobile-First* adaptable a teléfonos, tablets y escritorio.
* **RNF-02 (Rendimiento):** Optimización en carga de vistas y consultas paginadas o filtradas a la base de datos.
* **RNF-03 (Seguridad):** Cifrado de contraseñas y protección de rutas privadas mediante tokens.

## 8. Funcionalidades y Módulos
* **Módulo A - Autenticación y Perfilamiento:** Login, registro, generación de sesión y formulario de preferencias iniciales.
* **Módulo B - Exploración y Directorio:** Buscador dinámico, grilla de tarjetas de hoteles y vista de detalle condicional según tipo de hotel.
* **Módulo C - Motor de Reservas y Trazabilidad:** Formulario de solicitud, bandeja de entrada para el hotel y línea de tiempo de estado para el cliente.

## 9. Reglas de Negocio
* **RN-01:**Cualquier visitante puede explorar el directorio, pero es obligatorio estar registrado y autenticado para solicitar una reserva.
* **RN-02:** Los hoteles catalogados como "Directorio" (No verificados) no pueden recibir reservas internas; su ficha solo redirige a un enlace o contacto externo.
* **RN-03:** La transición del estado `Pendiente` a `Confirmada` o `Rechazada` es facultad exclusiva del Hotel Partner correspondiente.
* **RN-04 (Ventana de Arrepentimiento por Estado):** Mientras la solicitud esté en estado `Pendiente`, el huésped puede cancelarla libremente con un clic. Una vez que el hotel cambia el estado a `Confirmada`, el botón de cancelación directa se bloquea y cualquier anulación requiere contacto directo con el alojamiento.

## 10. Arquitectura del Sistema
Arquitectura **Cliente-Servidor Desacoplada** comunicada mediante una **API RESTful** en formato JSON:
```text
[Cliente Web (Next.js)]  <--- HTTP / JSON (API REST) --->  [Servidor Backend (Node/Express)]
                                                                       |
                                                                (Prisma ORM)
                                                                       |
                                                                       v
                                                        [Base de Datos PostgreSQL (Docker)]