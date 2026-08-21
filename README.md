# 🌮 Taquería Digital - WebApp & Sistema de Domicilios Nocturnos

> **Demo Live**: [https://la-unica-taqueria.vercel.app/](https://la-unica-taqueria.vercel.app/)  
> **Repositorio GitHub**: [https://github.com/pauldavid2809-cloud/LaUnicaTaqueria](https://github.com/pauldavid2809-cloud/LaUnicaTaqueria)

Una aplicación web completa y responsiva (PWA) desarrollada a medida para taquerías y restaurantes con servicio nocturno. Diseñada para **eliminar las comisiones de intermediarios (Rappi, Didi, UberEats)**, canalizando el 100% de los pedidos de domicilio y reservas VIP directamente por WhatsApp y la base de datos de la empresa.

---

## 🔗 Enlaces Oficiales del Proyecto (Demo Links)

| Módulo / Recurso | Enlace Directo (URL) | Descripción |
| :--- | :--- | :--- |
| **🌐 Webapp Principal (Cliente)** | [`https://la-unica-taqueria.vercel.app/`](https://la-unica-taqueria.vercel.app/) | Menú interactivo, Taco Builder, Reservas 2D y Pedidos. |
| **🛵 Portal Secreto de Repartidores** | [`https://la-unica-taqueria.vercel.app/delivery.html`](https://la-unica-taqueria.vercel.app/delivery.html) | Dashboard para domiciliarios con navegación GPS y cambio de fases. |
| **📄 Manual Operativo PDF (Ejecutivo)** | [`https://la-unica-taqueria.vercel.app/manual.html`](https://la-unica-taqueria.vercel.app/manual.html) | Guía técnica y comercial para dueños de restaurantes. |
| **💻 Código Fuente en GitHub** | [`https://github.com/pauldavid2809-cloud/LaUnicaTaqueria`](https://github.com/pauldavid2809-cloud/LaUnicaTaqueria) | Repositorio público con el código fuente del proyecto. |

---

## 🔥 Funcionalidades Clave

### 1. 🌮 Menú Digital & Checkout con WhatsApp Directo
- Menú en vivo categorizado con fotografías gastronómicas en alta definición.
- Carrito de compras con cálculo automático de subtotal, costo de envío ($4.000) y **propina opcional para los taqueros (0%, 10%, 15%, 20%)**.
- Generación instantánea de comanda estructurada por WhatsApp con código único de pedido **`#TAQ-XXXX`**.

### 2. ⚙️ Asistente "Taco Builder" (Custom Taco Wizard)
- Wizard paso a paso para que el cliente diseñe su taco ideal: *Tipo de Tortilla* ➔ *Proteína* ➔ *Nivel de Picante de la Salsa* ➔ *Extras (Queso fundido, Guacamole, Piña)*.
- Cálculo de precio en tiempo real incorporado a la orden.

### 3. 🎟️ Plano 2D de Reservas VIP con Código QR
- Mapa interactivo del restaurante dividido en 3 ambientes (*Barra Neón B1-B4*, *Terraza Callejera T1-T4*, *Salón Principal S1-S4*).
- Disponibilidad en tiempo real (🟢 Libre, 🟡 Selección, 🔴 Reservada).
- Emisión inmediata de **Pase VIP en pantalla con código QR** almacenado en la nube.

### 4. 📍 Geolocalización GPS Exacta para Domiciliarios
- Botón *"📍 Obtener mi Ubicación GPS"* en el formulario de entrega.
- Captura la posición exacta mediante `navigator.geolocation` y genera automáticamente una URL oficial de Google Maps (`https://www.google.com/maps?q=lat,lng`) para el repartidor.

### 5. 🤖 Despacho Automatizado por WhatsApp por Fase
- Motor de mensajería automatizado que envía notificaciones desde el número oficial de la empresa al cliente en cada cambio de fase:
  - **Recibido 📥**: Confirmación de ingreso a comanda.
  - **En Cocina 👨‍🍳**: *"¡Tu pedido está en la plancha calientito!"*
  - **En Camino 🛵**: *"¡Tu repartidor va en camino a tu ubicación GPS!"*
  - **Entregado 🌮**: *"¡Buen provecho!"*

### 6. 🛵 Portal Escondido para Repartidores (`/delivery.html`)
- Dashboard exclusivo en vivo para el equipo de entregas.
- Permite ver los pedidos entrantes, navegar con 1 solo clic hasta la casa del cliente usando el **PIN GPS en Google Maps/Waze** y actualizar las fases con notificaciones automatizadas.

### 7. ⭐️ Mural Neón de Reseñas & PWA Instalable
- Registro de calificaciones y opiniones en vivo sincronizadas con **Supabase**.
- Aplicación Instalable (PWA) en celulares Android e iPhone sin necesidad de tiendas de aplicaciones.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3 (Nocturnal Brutalism Design System), JavaScript ES6+
- **Backend / Database**: Supabase Cloud (PostgreSQL, Realtime DB API, LocalStorage Fallback)
- **APIs Nativas**: Geolocation API, Service Worker (PWA), Web Audio API (Ambiente Neón)
- **PDF Generation**: Node.js + PDFKit
- **Deployment**: Vercel Serverless Static Hosting

---

## 💻 Instalación y Ejecución Local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/pauldavid2809-cloud/LaUnicaTaqueria.git
   cd LaUnicaTaqueria
   ```

2. Abrir en un servidor local (ej. Live Server o http-server):
   ```bash
   npx http-server -p 3000
   ```

3. Abrir en el navegador:
   - Webapp Cliente: `http://localhost:3000`
   - Portal Repartidores: `http://localhost:3000/delivery.html`

---

© 2026 Taquería Digital. Proyecto desarrollado para portafolio profesional.
