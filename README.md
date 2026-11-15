# 🏨 IcaStay — Plataforma de Alojamientos Verificados con Trazabilidad en Ica

**IcaStay** es una plataforma web Full-Stack (arquitectura PERN / Next.js) diseñada para el sector turístico de la región de Ica, Perú (Huacachina, Paracas, Ruta de Viñedos, Ica Centro y Nazca). Combina un **directorio híbrido** con un **sistema de reservas con trazabilidad en tiempo real** para eliminar la incertidumbre del viajero.

---
## ✨ Propuesta de Valor y Características Principales (Versión 2.0)

* **Modelo Híbrido (`RN-02`):** Distingue entre **Hoteles Partner Verificados** (con el *Sello de Garantía IcaStay* y reservas internas) y **Hoteles de Directorio Externo** (con redirección informativa).
* **Onboarding Profiling (`RF-02`):** Perfilamiento inteligente del viajero (*Aventura, Pareja, Familia, Negocios*) tras el registro para destacar alojamientos afines en el catálogo.
* **Autogestión de Catálogo Partner (`RF-06` / `RN-05`):** Panel exclusivo donde el socio hotelero registra nuevos alojamientos, edita tarifas/fotos y pausa o activa la disponibilidad de cupos en tiempo real.
* **Trazabilidad de 4 Hitos, Pagos y Voucher Oficial Compartido (`RF-07` / `RN-06`):** Flujo completo desde la solicitud (`PENDING`) hasta la confirmación (`CONFIRMED`), registro de pago (`Yape`, `Plin`, `Tarjeta`, `Transferencia`) y emisión del **Comprobante Oficial Verificado** (imprimible en PDF y compartido entre Huésped y Recepción).
* **Reputación y Reseñas con Verificación Antifraude (`RF-08` / `RN-07`):** Sistema de calificación de 1 a 5 estrellas con filtros analíticos (*Positivas, Críticas, por estrella exacta*), asignación automática en servidor del sello **`✓ Huésped con Estadía Verificada`**, fijado comercial de reseñas destacadas y respuesta oficial de la administración del hotel.
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

🌐 **Demo en Vivo (Producción):** [https://plataforma-ica-stay.vercel.app](https://plataforma-ica-stay.vercel.app)
