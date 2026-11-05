# 🏨 IcaStay — Plataforma de Alojamientos Verificados con Trazabilidad en Ica

**IcaStay** es una plataforma web Full-Stack (arquitectura PERN / Next.js) diseñada para el sector turístico de la región de Ica, Perú (Huacachina, Paracas, Ruta de Viñedos, Ica Centro y Nazca). Combina un **directorio híbrido** con un **sistema de reservas con trazabilidad en tiempo real** para eliminar la incertidumbre del viajero.

---

## ✨ Propuesta de Valor y Características Principales

* **Modelo Híbrido (`RN-02`):** Distingue entre **Hoteles Partner Verificados** (con el *Sello de Garantía IcaStay* y reservas internas) y **Hoteles de Directorio Externo** (con redirección informativa).
* **Onboarding Profiling (`RF-02`):** Perfilamiento inteligente del viajero (*Aventura, Pareja, Familia, Negocios*) tras el registro para destacar alojamientos afines en el catálogo.
* **Trazabilidad en Tiempo Real (`RF-04` / `RF-05`):** Barra de progreso interactiva donde el huésped visualiza el estado exacto de su solicitud (`PENDING` ➔ `CONFIRMED` / `REJECTED` / `CANCELLED`).
* **Reglas de Negocio Blindadas (`RN-03` / `RN-04`):** Cálculo automático de noches y tarifas en el servidor, y cancelación autónoma habilitada exclusivamente mientras la reserva permanece en estado `PENDING`.

---

## 🛠️ Stack Tecnológico

* **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS, Context API.
* **Backend:** Node.js, Express.js (API RESTful), Autenticación JWT y encriptación con `bcryptjs`.
* **Base de Datos e Infraestructura:** PostgreSQL 16 (contenedorizado en Docker) y Prisma ORM.

---

## 🚀 Guía de Instalación y Ejecución Local

### 1. Clonar el repositorio y levantar PostgreSQL con Docker
```bash
git clone <URL_DE_TU_REPOSITORIO>
cd icastay
docker compose up -d