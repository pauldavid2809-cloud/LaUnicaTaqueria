const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateExecutivePDF() {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    info: {
      Title: 'Manual Operativo - La Única Taquería',
      Author: 'La Única Taquería Digital',
      Subject: 'Presentación Ejecutiva para Propietarios'
    }
  });

  const outputPath = 'Manual_Operativo_La_Unica_Taqueria.pdf';
  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  // Brand Colors
  const RED = '#DC3834';
  const CREAM = '#FCE6C1';
  const DARK = '#111010';
  const MUTED = '#555555';

  // ----------------------------------------------------
  // HEADER BANNER
  // ----------------------------------------------------
  doc.rect(40, 40, 515, 80).fill(RED);

  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(22).text('LA ÚNICA TAQUERÍA', 56, 56);
  doc.fillColor(CREAM).font('Helvetica-Bold').fontSize(11).text('MANUAL DE OPERACIÓN Y PRESENTACIÓN EJECUTIVA', 56, 84);

  // Logo Image if exists
  if (fs.existsSync('assets/logo_la_unica.png')) {
    doc.image('assets/logo_la_unica.png', 460, 46, { height: 68 });
  }

  doc.y = 140;

  // ----------------------------------------------------
  // RESUMEN EJECUTIVO
  // ----------------------------------------------------
  drawCard(doc, 40, doc.y, 515, 85, '📌 RESUMEN EJECUTIVO & PROPUESTA DE VALOR', [
    'Esta plataforma webapp es una solución tecnológica completa desarrollada a medida para La Única Taquería.',
    'Su objetivo principal es eliminar las comisiones de intermediarios (Rappi/Didi/UberEats), canalizando',
    'el 100% de los pedidos de domicilio y reservas VIP directamente por WhatsApp y la base de datos de la empresa.',
    'URL en Vivo: https://la-unica-taqueria.vercel.app  |  GitHub: pauldavid2809-cloud/LaUnicaTaqueria'
  ], RED);

  doc.y += 100;

  // ----------------------------------------------------
  // MÓDULO 1: MENÚ DIGITAL & CARRITO
  // ----------------------------------------------------
  drawSectionHeader(doc, '1. Menú Digital Interactivo & Pedidos por WhatsApp', RED);
  
  drawBulletPoint(doc, 'Catálogo Gastronómico en Vivo', 'Menú categorizado (Tacos, Quesatacos, Bebidas, Extras) con fotos de alta resolución y descripciones.');
  drawBulletPoint(doc, 'Carrito Inteligente con Propinas', 'Suma subtotal, domicilio ($4.000) y propina voluntaria para los taqueros (10%, 15%, 20%).');
  drawBulletPoint(doc, 'Comanda WhatsApp con Código #TAQ-XXXX', 'Al confirmar, genera un código de rastreo único y abre el WhatsApp de la empresa.');

  doc.y += 15;

  // ----------------------------------------------------
  // MÓDULO 2: TACO BUILDER WIZARD
  // ----------------------------------------------------
  drawSectionHeader(doc, '2. Asistente Personalizador "Taco Builder"', RED);
  
  drawBulletPoint(doc, 'Wizard Interactivo Paso a Paso', 'El cliente elige: Tortilla (Maíz/Harina) ➔ Proteína (Pastor/Birria/Asada) ➔ Salsa ➔ Extra.');
  drawBulletPoint(doc, 'Cálculo Dinámico', 'Suma el precio acumulado de los ingredientes seleccionados y lo agrega directo a la orden.');

  doc.y += 15;

  // ----------------------------------------------------
  // MÓDULO 3: CROQUIS 2D DE RESERVAS VIP
  // ----------------------------------------------------
  drawSectionHeader(doc, '3. Croquis 2D de Planta para Reservas VIP', RED);
  
  drawBulletPoint(doc, 'Mapa de Mesas por Zonas', 'Visualización en 2D de Barra Neón (B1-B4), Terraza Callejera (T1-T4) y Salón Principal (S1-S4).');
  drawBulletPoint(doc, 'Disponibilidad en Vivo', 'Cambio automático de color: Verde (Libre), Amarillo (Tu Selección) y Rojo (Ocupada).');
  drawBulletPoint(doc, 'Pase VIP con Código QR', 'Emisión inmediata de ticket de confirmación en pantalla registrado en Supabase.');

  // ----------------------------------------------------
  // PAGE 2
  // ----------------------------------------------------
  doc.addPage();

  // Page 2 Header Banner
  doc.rect(40, 40, 515, 45).fill(DARK);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(14).text('LA ÚNICA TAQUERÍA • MANUAL OPERATIVO (PÁGINA 2)', 56, 54);
  doc.fillColor(CREAM).font('Helvetica').fontSize(10).text('GUÍA TÉCNICA DE DOMICILIOS & AUTOMATIZACIÓN', 340, 56);

  doc.y = 105;

  // ----------------------------------------------------
  // MÓDULO 4: GEOLOCALIZACIÓN GPS EXACTA
  // ----------------------------------------------------
  drawSectionHeader(doc, '4. Geolocalización GPS en el Checkout', RED);
  
  drawBulletPoint(doc, 'Captura de Coordenadas Lat/Lng', 'El cliente presiona "📍 Obtener mi Ubicación GPS" usando el sensor de su smartphone.');
  drawBulletPoint(doc, 'Pin Oficial de Google Maps', 'Genera de forma transparente la URL https://www.google.com/maps?q=lat,lng guardada en la base de datos.');

  doc.y += 15;

  // ----------------------------------------------------
  // MÓDULO 5: DISPACHO AUTOMATIZADO WHATSAPP POR FASE
  // ----------------------------------------------------
  drawSectionHeader(doc, '5. Despacho Automatizado de Notificaciones WhatsApp', RED);

  drawCard(doc, 40, doc.y, 515, 110, '🤖 AUTOMATIZACIÓN DESDE EL NÚMERO OFICIAL DE LA EMPRESA', [
    'Al cambiar de estado en el portal del repartidor, el sistema dispara automáticamente el mensaje:',
    '• Recibido 📥: "¡Hola {Nombre}! 🌮 Recibimos tu pedido #{Código} en La Única Taquería."',
    '• En Cocina 👨‍🍳: "¡Hola {Nombre}! 🔥 Tu pedido #{Código} está en la plancha calientito."',
    '• En Camino 🛵: "¡Hola {Nombre}! 🛵 Tu repartidor va en camino a tu ubicación GPS PIN. ¡Llegamos en minutos!"',
    '• Entregado 🌮: "¡Hola {Nombre}! 🌮 Tu pedido #{Código} ha sido entregado exitosamente. ¡Buen provecho!"'
  ], RED);

  doc.y += 125;

  // ----------------------------------------------------
  // MÓDULO 6: PORTAL SECRETO PARA REPARTIDORES
  // ----------------------------------------------------
  drawSectionHeader(doc, '6. Portal Secreto para Repartidores (delivery.html)', RED);
  
  drawBulletPoint(doc, 'Ruta Escondida Exclusiva', 'Acceso directo en /delivery.html para el equipo interno de entregas y moto-repartidores.');
  drawBulletPoint(doc, 'Navegación GPS de 1 Clic', 'Botón "🧭 NAVEGAR CON PIN GPS" que abre directamente Google Maps guiando al domiciliario.');
  drawBulletPoint(doc, 'Control de Fases', 'Botones de 1 toque para avanzar el pedido e iniciar el mensaje de WhatsApp automático.');

  doc.y += 15;

  // ----------------------------------------------------
  // MÓDULO 7: SUPABASE & PWA
  // ----------------------------------------------------
  drawSectionHeader(doc, '7. Base de Datos Supabase & App Móvil PWA', RED);
  
  drawBulletPoint(doc, 'Persistencia Supabase Cloud', 'Almacenamiento centralizado de pedidos, clientes, coordenadas GPS, reservas y reseñas.');
  drawBulletPoint(doc, 'PWA Instalable', 'La webapp es instalable como App nativa en celulares Android e iPhone sin tiendas de aplicaciones.');

  // FOOTER NOTE
  doc.rect(40, 770, 515, 1).fill('#CCCCCC');
  doc.fillColor(MUTED).font('Helvetica-Oblique').fontSize(9).text('Documento preparado para los Propietarios de La Única Taquería. Repositorio Oficial GitHub: pauldavid2809-cloud/LaUnicaTaqueria', 40, 780, { align: 'center', width: 515 });

  doc.end();

  writeStream.on('finish', () => {
    console.log('✅ PDF Manual_Operativo_La_Unica_Taqueria.pdf generado exitosamente!');
  });
}

function drawSectionHeader(doc, title, color) {
  doc.fillColor(color).font('Helvetica-Bold').fontSize(13).text(title, 40, doc.y);
  doc.rect(40, doc.y + 2, 515, 1.5).fill(color);
  doc.y += 10;
}

function drawBulletPoint(doc, boldLabel, text) {
  doc.fillColor('#DC3834').font('Helvetica-Bold').fontSize(11).text('• ', 48, doc.y, { continued: true });
  doc.fillColor('#111111').font('Helvetica-Bold').fontSize(10).text(boldLabel + ': ', { continued: true });
  doc.fillColor('#444444').font('Helvetica').fontSize(10).text(text);
  doc.y += 4;
}

function drawCard(doc, x, y, w, h, title, lines, borderColor) {
  doc.rect(x, y, w, h).fill('#FDFBF7');
  doc.rect(x, y, 4, h).fill(borderColor);
  doc.rect(x, y, w, h).stroke('#EADBC8');

  doc.fillColor('#111111').font('Helvetica-Bold').fontSize(11).text(title, x + 14, y + 10);
  
  let lineY = y + 28;
  lines.forEach(line => {
    doc.fillColor('#444444').font('Helvetica').fontSize(9.5).text(line, x + 14, lineY);
    lineY += 13;
  });
}

generateExecutivePDF();
