/* ==========================================================================
   LA ÚNICA TAQUERÍA DIGITAL - ADVANCED INTERACTIVE LOGIC & SUPABASE INTEGRATION
   ========================================================================== */

// Menu Database
const MENU_DATA = [
  {
    id: 'taco-pastor',
    title: 'Taco Al Pastor Tradicional',
    category: 'tacos',
    price: 6500,
    spicy: '🌶️',
    badge: 'MÁS VENDIDO 🔥',
    image: 'assets/tacos_al_pastor.jpg',
    description: 'Cerdo marinado en adobo casero de achiote, piña asada al carbón, cilantro fresco y cebolla en tortilla de maíz nixtamalizado.'
  },
  {
    id: 'birria-quesataco',
    title: 'Birria Quesataco Dorado',
    category: 'quesatacos',
    price: 9800,
    spicy: '🌶️🌶️',
    badge: 'INCLUYE CONSOMÉ 🍲',
    image: 'assets/birria_quesatacos.jpg',
    description: 'Res cocinada a fuego lento por 8 horas, abundante queso Oaxaca derretido, doblado a la plancha y bañado en consomé de la casa.'
  },
  {
    id: 'taco-asada',
    title: 'Taco de Carne Asada',
    category: 'tacos',
    price: 7500,
    spicy: '🌶️',
    badge: 'ESTILO SONORA 🥩',
    image: 'assets/taco_asada.jpg',
    description: 'Jugosos trozos de corte de res asado al carbón, guacamole martajado, salsa roja taquera, cebollitas asadas y limón.'
  },
  {
    id: 'horchata-sucia',
    title: 'Horchata Sucia Artesanal',
    category: 'bebidas',
    price: 5500,
    spicy: '',
    badge: 'SECRETO DE LA CASA 🥤',
    image: 'assets/horchata_sucia.jpg',
    description: 'Agua fresca tradicional de arroz, leche condensada, canela recién molida y un toque especial de espresso de la casa.'
  },
  {
    id: 'guacamole-totopos',
    title: 'Guacamole con Totopos de Maíz',
    category: 'extras',
    price: 12000,
    spicy: '',
    badge: 'PARA COMPARTIR 🥑',
    image: 'assets/guacamole_totopos.jpg',
    description: 'Aguacate fresco en molcajete de piedra, pico de gallo tradicional, zumo de limón verde y totopos crujientes de maíz caseros.'
  },
  {
    id: 'churros-cajeta',
    title: 'Churros de Canela y Cajeta',
    category: 'extras',
    price: 8500,
    spicy: '',
    badge: 'POSTRE POPULAR 🍯',
    image: 'assets/churros_cajeta.jpg',
    description: 'Churros crujientes hechos al momento espolvoreados con azúcar y canela, acompañados de salsa de cajeta de lechera y chocolate amargo.'
  }
];

// Tables Database for 2D Floor Plan
const TABLES_DATA = {
  barra: [
    { id: 'B1', name: 'Barra B1', seats: '2 p' },
    { id: 'B2', name: 'Barra B2', seats: '2 p' },
    { id: 'B3', name: 'Barra B3', seats: '2 p' },
    { id: 'B4', name: 'Barra B4', seats: '2 p' }
  ],
  terraza: [
    { id: 'T1', name: 'Terraza T1', seats: '4 p' },
    { id: 'T2', name: 'Terraza T2', seats: '4 p' },
    { id: 'T3', name: 'Terraza T3', seats: '4 p' },
    { id: 'T4', name: 'Terraza T4', seats: '6 p' }
  ],
  salon: [
    { id: 'S1', name: 'Salón S1', seats: '4 p' },
    { id: 'S2', name: 'Salón S2', seats: '6 p' },
    { id: 'S3', name: 'Salón S3', seats: '8 p' },
    { id: 'S4', name: 'Salón S4', seats: '10 p' }
  ]
};

// App State
let cart = JSON.parse(localStorage.getItem('taqueria_cart')) || [];
let activeCategory = 'todos';
let deliveryType = 'domicilio';
let tipPercent = 10;
let soundEnabled = false;
let audioCtx = null;
let selectedTable = null;

// Taco Builder State
let customTaco = {
  tortilla: { name: 'Maíz Amarillo', price: 1500 },
  protein: { name: 'Pastor Adobado', price: 4500 },
  salsa: { name: 'Roja de Árbol', price: 0 },
  extra: { name: 'Ninguno', price: 0 }
};

// DOM Init
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  renderMenu();
  updateCartUI();
  initEventListeners();
  checkOpenStatus();
  initTableMap();
  renderReviews();
  registerPWA();
}

/* --------------------------------------------------------------------------
   Render Functions
   -------------------------------------------------------------------------- */
function renderMenu() {
  const container = document.getElementById('menu-grid');
  if (!container) return;

  const filteredItems = activeCategory === 'todos' 
    ? MENU_DATA 
    : MENU_DATA.filter(item => item.category === activeCategory);

  container.innerHTML = filteredItems.map(item => `
    <div class="menu-card" data-id="${item.id}">
      <div class="menu-card-img-wrapper">
        <img src="${item.image}" alt="${item.title}" class="menu-card-img" loading="lazy">
        ${item.badge ? `<span class="card-badge">${item.badge}</span>` : ''}
        ${item.spicy ? `<span class="spicy-level">${item.spicy}</span>` : ''}
      </div>
      <div class="menu-card-body">
        <h3 class="menu-card-title">${item.title}</h3>
        <p class="menu-card-desc">${item.description}</p>
        <div class="menu-card-footer">
          <span class="menu-card-price">$${item.price.toLocaleString('es-CO')}</span>
          <button class="btn-add-item" onclick="addToCart('${item.id}')">
            <span>+ AGREGAR</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/* --------------------------------------------------------------------------
   2D Floor Plan Table Reservation Engine
   -------------------------------------------------------------------------- */
async function initTableMap() {
  const todayStr = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('res-date');
  if (dateInput && !dateInput.value) dateInput.value = todayStr;

  await reloadTableAvailability();
}

async function reloadTableAvailability() {
  const dateVal = document.getElementById('res-date')?.value || new Date().toISOString().split('T')[0];
  const occupiedTables = await dbGetOccupiedTables(dateVal);

  ['barra', 'terraza', 'salon'].forEach(zoneKey => {
    const container = document.getElementById(`tables-${zoneKey}`);
    if (!container) return;

    container.innerHTML = TABLES_DATA[zoneKey].map(tbl => {
      const isOccupied = occupiedTables.includes(tbl.id);
      const isSelected = selectedTable && selectedTable.id === tbl.id;

      let statusClass = 'available';
      if (isOccupied) statusClass = 'occupied';
      if (isSelected) statusClass = 'selected';

      return `
        <div class="table-item ${statusClass}" onclick="selectTable('${tbl.id}', '${tbl.name}', ${isOccupied})">
          <div class="table-code">${tbl.id}</div>
          <div class="table-seats">${tbl.seats}</div>
        </div>
      `;
    }).join('');
  });
}

function selectTable(id, name, isOccupied) {
  if (isOccupied) {
    showToast('🔴 Esta mesa ya se encuentra reservada para esa fecha.');
    return;
  }

  selectedTable = { id, name };
  document.getElementById('selected-table-display').value = `${name} (Mesa ${id})`;
  reloadTableAvailability();
  showToast(`🟢 Seleccionada ${name} en el mapa 2D`);
  playClickSound();
}

async function handleReservationSubmit(e) {
  e.preventDefault();
  if (!selectedTable) {
    showToast('⚠️ Por favor selecciona una mesa libre en el mapa 2D');
    return;
  }

  const name = document.getElementById('res-name').value;
  const email = document.getElementById('res-email').value;
  const phone = document.getElementById('res-phone').value;
  const date = document.getElementById('res-date').value;
  const time = document.getElementById('res-time').value;
  const event = document.getElementById('res-event').value;

  const ticketCode = 'TAQ-' + Math.floor(1000 + Math.random() * 9000);

  const resData = {
    ticket_code: ticketCode,
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    reservation_date: date,
    reservation_time: time,
    guests: 4,
    zone: selectedTable.name,
    table_id: selectedTable.id,
    event_type: event,
    created_at: new Date().toISOString()
  };

  await dbCreateReservation(resData);
  await reloadTableAvailability();

  const ticketHTML = `
    <div style="background: var(--bg-card); border: 2px solid var(--border-neon-solid); box-shadow: var(--glow-red-lg); padding: 32px; border-radius: var(--radius-lg); text-align: center; max-width: 460px; margin: 0 auto; color: #fff;">
      <span style="font-size: 44px;">🎟️</span>
      <h3 style="font-family: var(--font-headline); font-size: 28px; color: var(--secondary-yellow); margin-top: 8px;">PASE VIP CONFIRMADO</h3>
      <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">Código Ticket: <strong>${ticketCode}</strong></p>
      
      <div style="background: var(--bg-lowest); border: 1px dashed var(--border-neon); padding: 20px; border-radius: var(--radius-sm); text-align: left; font-family: var(--font-data); font-size: 14px; margin-bottom: 24px;">
        <p><strong>Comensal:</strong> ${name}</p>
        <p><strong>Mesa 2D:</strong> ${selectedTable.name} (${selectedTable.id})</p>
        <p><strong>Fecha & Hora:</strong> ${date} • ${time}</p>
        <p><strong>Celebración:</strong> ${event}</p>
      </div>

      <div style="background: #fff; padding: 10px; display: inline-block; border-radius: 8px; margin-bottom: 20px;">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#fff"/>
          <path d="M10,10 h30 v30 h-30 z M55,10 h35 v35 h-35 z M10,55 h35 v35 h-35 z M60,60 h10 v10 h-10 z M75,60 h15 v15 h-15 z M60,80 h25 v10 h-25 z" fill="#000"/>
        </svg>
      </div>

      <button class="btn-primary" style="width: 100%; justify-content: center;" onclick="closeModal('reservation-modal')">GUARDAR EN MI CELULAR</button>
    </div>
  `;

  document.getElementById('reservation-ticket-container').innerHTML = ticketHTML;
  openModal('reservation-modal');
  showToast('¡Mesa reservada con éxito en Supabase y Pase VIP generado! 🔥');
}

/* --------------------------------------------------------------------------
   Taco Builder Wizard
   -------------------------------------------------------------------------- */
function selectIngredient(cardElem) {
  const type = cardElem.dataset.type;
  const name = cardElem.dataset.name;
  const price = parseInt(cardElem.dataset.price, 10);

  const parent = cardElem.parentElement;
  parent.querySelectorAll('.ingredient-card').forEach(c => c.classList.remove('selected'));
  cardElem.classList.add('selected');

  customTaco[type] = { name, price };

  const total = customTaco.tortilla.price + customTaco.protein.price + customTaco.salsa.price + customTaco.extra.price;
  document.getElementById('builder-total-price').innerText = `TOTAL: $${total.toLocaleString('es-CO')}`;
  playClickSound();
}

function addCustomTacoToCart() {
  const total = customTaco.tortilla.price + customTaco.protein.price + customTaco.salsa.price + customTaco.extra.price;
  const title = `Taco Custom (${customTaco.protein.name})`;
  const desc = `Tortilla: ${customTaco.tortilla.name} | Salsa: ${customTaco.salsa.name} | Extra: ${customTaco.extra.name}`;

  const customItem = {
    id: 'custom-' + Date.now(),
    title: title,
    category: 'tacos',
    price: total,
    spicy: '🌶️',
    badge: 'PERSONALIZADO ⚙️',
    image: 'assets/tacos_al_pastor.jpg',
    description: desc,
    qty: 1
  };

  cart.push(customItem);
  saveCart();
  updateCartUI();
  closeModal('taco-builder-modal');
  showToast('¡Taco personalizado agregado a tu carrito! 🌮');
}

/* --------------------------------------------------------------------------
   Order Tracker Engine
   -------------------------------------------------------------------------- */
async function searchOrderTrack() {
  const code = document.getElementById('tracker-input')?.value;
  if (!code) {
    showToast('⚠️ Escribe el código de tu pedido (ej. #TAQ-8492)');
    return;
  }

  const res = await dbTrackOrder(code);
  const container = document.getElementById('tracker-result-container');
  if (!container) return;

  if (!res.success) {
    container.innerHTML = `<div style="text-align: center; color: var(--primary-red); padding: 20px;">${res.message}</div>`;
    return;
  }

  const order = res.order;
  const statuses = ['recibido', 'en_cocina', 'en_camino', 'entregado'];
  const currentIndex = statuses.indexOf(order.status);

  container.innerHTML = `
    <div style="background: var(--bg-card); border: 1px solid var(--border-neon); border-radius: var(--radius-sm); padding: 20px; margin-top: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
        <div style="font-family: var(--font-headline); font-size: 20px; color: var(--secondary-yellow);">PEDIDO ${order.tracking_code}</div>
        <div style="font-family: var(--font-data); font-size: 13px; color: var(--text-muted);">${order.delivery_type === 'domicilio' ? '🛵 Domicilio' : '🌮 Recoger'}</div>
      </div>

      <div class="timeline-stepper">
        <div class="step-point ${currentIndex >= 0 ? (currentIndex === 0 ? 'active' : 'completed') : ''}">
          <div class="step-icon">📥</div>
          <div class="step-label">Recibido</div>
        </div>
        <div class="step-point ${currentIndex >= 1 ? (currentIndex === 1 ? 'active' : 'completed') : ''}">
          <div class="step-icon">👨‍🍳</div>
          <div class="step-label">En Cocina</div>
        </div>
        <div class="step-point ${currentIndex >= 2 ? (currentIndex === 2 ? 'active' : 'completed') : ''}">
          <div class="step-icon">🛵</div>
          <div class="step-label">En Camino</div>
        </div>
        <div class="step-point ${currentIndex >= 3 ? (currentIndex === 3 ? 'active' : 'completed') : ''}">
          <div class="step-icon">🌮</div>
          <div class="step-label">Entregado</div>
        </div>
      </div>
    </div>
  `;
}

/* --------------------------------------------------------------------------
   Community Reviews Mural
   -------------------------------------------------------------------------- */
async function renderReviews() {
  const container = document.getElementById('reviews-grid');
  if (!container) return;

  const reviews = await dbGetReviews();

  container.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <div class="review-stars">${'⭐'.repeat(r.rating)}</div>
        <span style="font-family: var(--font-data); font-size: 11px; color: var(--secondary-yellow); font-weight: 700;">VERIFICADO</span>
      </div>
      <p class="review-comment">"${r.comment}"</p>
      <div class="review-footer">
        <span><strong>${r.customer_name}</strong></span>
        <span>${r.dish_tag || 'Cliente Taquería'}</span>
      </div>
    </div>
  `).join('');
}

async function submitNewReview(e) {
  e.preventDefault();
  const name = document.getElementById('review-name').value;
  const rating = parseInt(document.getElementById('review-rating').value, 10);
  const dish = document.getElementById('review-dish').value;
  const comment = document.getElementById('review-comment').value;

  const reviewData = {
    customer_name: name,
    rating: rating,
    comment: comment,
    dish_tag: dish,
    created_at: new Date().toISOString()
  };

  await dbAddReview(reviewData);
  await renderReviews();
  closeModal('review-modal');
  showToast('¡Tu reseña neón ha sido publicada en el mural! ⭐️');
}

/* --------------------------------------------------------------------------
   Cart Logic & WhatsApp Generator
   -------------------------------------------------------------------------- */
function addToCart(itemId) {
  const item = MENU_DATA.find(i => i.id === itemId);
  if (!item) return;

  const existingIndex = cart.findIndex(ci => ci.id === itemId);
  if (existingIndex > -1) {
    cart[existingIndex].qty += 1;
  } else {
    cart.push({ ...item, qty: 1, note: '' });
  }

  saveCart();
  updateCartUI();
  showToast(`¡${item.title} agregado al carrito! 🌮`);
  playClickSound();
}

function updateQty(itemId, delta) {
  const index = cart.findIndex(ci => ci.id === itemId);
  if (index === -1) return;

  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }

  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('taqueria_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const totalCount = cart.reduce((acc, i) => acc + i.qty, 0);
  const cartBadge = document.getElementById('cart-count-badge');
  if (cartBadge) cartBadge.innerText = totalCount;

  const drawerBody = document.getElementById('cart-drawer-items');
  if (!drawerBody) return;

  if (cart.length === 0) {
    drawerBody.innerHTML = `
      <div style="text-align: center; margin: auto 0; padding: 40px 20px;">
        <span style="font-size: 48px; display: block; margin-bottom: 12px;">🌮</span>
        <h4 style="font-family: var(--font-headline); font-size: 22px; color: #fff;">Tu orden está vacía</h4>
        <p style="color: var(--text-muted); font-size: 14px; margin-top: 8px;">Explora el menú o arma tu taco en el Taco Builder.</p>
      </div>
    `;
  } else {
    drawerBody.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.title}</div>
          <div class="cart-item-price">$${(item.price * item.qty).toLocaleString('es-CO')}</div>
        </div>
        <div class="cart-item-controls">
          <button class="btn-qty" onclick="updateQty('${item.id}', -1)">-</button>
          <span class="qty-val">${item.qty}</span>
          <button class="btn-qty" onclick="updateQty('${item.id}', 1)">+</button>
        </div>
      </div>
    `).join('');
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryFee = (deliveryType === 'domicilio' && cart.length > 0) ? 4000 : 0;
  const tipAmount = Math.round(subtotal * (tipPercent / 100));
  const total = subtotal + deliveryFee + tipAmount;

  document.getElementById('cart-subtotal').innerText = `$${subtotal.toLocaleString('es-CO')}`;
  document.getElementById('cart-delivery-fee').innerText = `$${deliveryFee.toLocaleString('es-CO')}`;
  document.getElementById('cart-tip-amount').innerText = `$${tipAmount.toLocaleString('es-CO')}`;
  document.getElementById('cart-total').innerText = `$${total.toLocaleString('es-CO')}`;
}

/* --------------------------------------------------------------------------
   GPS Geolocation Capture
   -------------------------------------------------------------------------- */
let capturedGPS = null;

function captureGPSLocation() {
  if (!navigator.geolocation) {
    showToast('⚠️ Tu navegador no soporta geolocalización GPS.');
    return;
  }

  showToast('📍 Obteniendo coordenadas GPS de tu ubicación...');

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      
      capturedGPS = { latitude: lat, longitude: lng, maps_url: mapsUrl };
      
      const addrInput = document.getElementById('checkout-address');
      if (addrInput) {
        if (!addrInput.value) addrInput.value = `Ubicación GPS Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      }
      
      showToast('📍 ¡Ubicación GPS capturada con éxito para el repartidor!');
      playClickSound();
    },
    (err) => {
      console.warn('Error capturando GPS:', err);
      showToast('⚠️ No se pudo obtener la ubicación GPS automáticamente. Por favor escribe tu dirección.');
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

async function sendWhatsAppOrder() {
  if (cart.length === 0) {
    showToast('⚠️ Agrega platillos antes de realizar el pedido');
    return;
  }

  const name = document.getElementById('checkout-name')?.value || 'Cliente Taquería';
  let rawPhone = document.getElementById('checkout-phone')?.value || '3000000000';
  
  // Format phone number automatically
  let cleanPhone = rawPhone.replace(/[^0-9+]/g, '');
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+57' + cleanPhone;
  }
  
  const address = document.getElementById('checkout-address')?.value || 'Dirección no especificada';
  const trackingCode = 'TAQ-' + Math.floor(1000 + Math.random() * 9000);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryFee = (deliveryType === 'domicilio') ? 4000 : 0;
  const tipAmount = Math.round(subtotal * (tipPercent / 100));
  const total = subtotal + deliveryFee + tipAmount;

  const orderData = {
    tracking_code: trackingCode,
    customer_name: name,
    customer_phone: cleanPhone,
    delivery_type: deliveryType,
    address: address,
    latitude: capturedGPS ? capturedGPS.latitude : null,
    longitude: capturedGPS ? capturedGPS.longitude : null,
    maps_url: capturedGPS ? capturedGPS.maps_url : null,
    items: cart,
    subtotal: subtotal,
    delivery_fee: deliveryFee,
    tip: tipAmount,
    total: total,
    status: 'recibido',
    created_at: new Date().toISOString()
  };

  await dbCreateOrder(orderData);

  let text = `*🌶️ PEDIDO NUEVO (${trackingCode}) - LA ÚNICA TAQUERÍA 🌶️*\n\n`;
  text += `*Cliente:* ${name}\n`;
  text += `*Teléfono:* ${phone}\n`;
  text += `*Modalidad:* ${deliveryType === 'domicilio' ? '🛵 Domicilio a Casa' : '🌮 Recoger en Taquería'}\n`;
  if (deliveryType === 'domicilio') {
    text += `*Dirección:* ${address}\n`;
    if (capturedGPS && capturedGPS.maps_url) {
      text += `*GPS Pin Google Maps:* ${capturedGPS.maps_url}\n`;
    }
  }
  text += `\n*--- DETALLE DEL PEDIDO ---*\n`;

  cart.forEach(item => {
    text += `• ${item.qty}x ${item.title} = $${(item.price * item.qty).toLocaleString('es-CO')}\n`;
  });

  text += `\n*Subtotal:* $${subtotal.toLocaleString('es-CO')}\n`;
  if (deliveryType === 'domicilio') text += `*Envío:* $${deliveryFee.toLocaleString('es-CO')}\n`;
  if (tipPercent > 0) text += `*Propina (${tipPercent}%):* $${tipAmount.toLocaleString('es-CO')}\n`;
  text += `*TOTAL A PAGAR:* $${total.toLocaleString('es-CO')}\n\n`;
  text += `_Puedes rastrear tu pedido en la webapp con el código: ${trackingCode}_`;

  const phoneNumber = '573001234567';
  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`, '_blank');
  
  showToast(`¡Pedido ${trackingCode} registrado en Supabase! Redirigiendo a WhatsApp 📲`);
}

/* --------------------------------------------------------------------------
   UI Helpers & Event Listeners
   -------------------------------------------------------------------------- */
function initEventListeners() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeCategory = e.target.dataset.category;
      renderMenu();
    });
  });

  document.getElementById('btn-cart-trigger')?.addEventListener('click', toggleCartDrawer);
  document.getElementById('btn-cart-close')?.addEventListener('click', toggleCartDrawer);
  document.getElementById('reservation-form')?.addEventListener('submit', handleReservationSubmit);
  document.getElementById('contact-form')?.addEventListener('submit', handleContactSubmit);
}

function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('contact-name').value;
  const email = document.getElementById('contact-email').value;
  const subject = document.getElementById('contact-subject').value;

  showToast(`¡Gracias ${name}! Hemos recibido tu mensaje sobre "${subject}". Te responderemos a ${email} muy pronto 📨`);
  document.getElementById('contact-form').reset();
}

function toggleCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  if (drawer) drawer.classList.toggle('active');
}

function toggleMobileNav() {
  const drawer = document.getElementById('mobile-nav-drawer');
  if (drawer) drawer.classList.toggle('active');
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

function setDeliveryType(type) {
  deliveryType = type;
  document.querySelectorAll('.delivery-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`tab-${type}`)?.classList.add('active');
  
  const addressGroup = document.getElementById('address-group');
  if (addressGroup) addressGroup.style.display = (type === 'domicilio') ? 'block' : 'none';
  updateCartUI();
}

function setTip(percent) {
  tipPercent = percent;
  document.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tip-${percent}`)?.classList.add('active');
  updateCartUI();
}

function checkOpenStatus() {
  const now = new Date();
  const hours = now.getHours();
  const isOpen = (hours >= 18 || hours < 3);
  const statusElem = document.getElementById('live-status-text');
  if (statusElem) {
    statusElem.innerHTML = isOpen 
      ? '<span class="pulse-dot"></span> ABIERTO AHORA • 18:00 - 03:00' 
      : '<span style="color:#e63946;">● CERRADO</span> • ABRE A LAS 18:00';
  }
}

function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = msg;

  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3500);
}

function registerPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(() => {
      console.log('📱 Service Worker PWA registrado exitosamente');
    }).catch(err => console.log('SW registration failed:', err));
  }
}

/* Audio Ambient */
function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('btn-sound-toggle');
  if (btn) btn.innerText = soundEnabled ? '🔊 AMBIENTE ON' : '🔇 AMBIENTE OFF';

  if (soundEnabled) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    playAmbientHum();
    showToast('🔊 Sonido ambiente neón activado');
  } else {
    showToast('🔇 Sonido desactivado');
  }
}

function playClickSound() {
  if (!soundEnabled || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
}

function playAmbientHum() {
  if (!soundEnabled || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(60, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
}
