/* ==========================================================================
   LA ÚNICA TAQUERÍA DIGITAL - APPLICATION INTERACTIVE LOGIC
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

// App State
let cart = JSON.parse(localStorage.getItem('taqueria_cart')) || [];
let activeCategory = 'todos';
let deliveryType = 'domicilio'; // 'domicilio' or 'recoger'
let tipPercent = 10;
let soundEnabled = false;
let audioCtx = null;

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  renderMenu();
  updateCartUI();
  initEventListeners();
  checkOpenStatus();
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

  if (filteredItems.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
        <p style="color: var(--text-muted); font-size: 18px;">No se encontraron especialidades en esta categoría.</p>
      </div>
    `;
    return;
  }

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
   Cart Logic & Persistence
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
        <p style="color: var(--text-muted); font-size: 14px; margin-top: 8px;">Explora el menú y agrega tus tacos preferidos.</p>
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

  // Calculations
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
   WhatsApp Order Generator
   -------------------------------------------------------------------------- */
function sendWhatsAppOrder() {
  if (cart.length === 0) {
    showToast('⚠️ Agrega platillos antes de realizar el pedido');
    return;
  }

  const name = document.getElementById('checkout-name')?.value || 'Cliente';
  const address = document.getElementById('checkout-address')?.value || 'Dirección no especificada';
  const phone = document.getElementById('checkout-phone')?.value || 'Sin teléfono';
  const notes = document.getElementById('checkout-notes')?.value || 'Sin notas especiales';

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryFee = (deliveryType === 'domicilio') ? 4000 : 0;
  const tipAmount = Math.round(subtotal * (tipPercent / 100));
  const total = subtotal + deliveryFee + tipAmount;

  let text = `*🌶️ PEDIDO NUEVO - LA ÚNICA TAQUERÍA 🌶️*\n\n`;
  text += `*Cliente:* ${name}\n`;
  text += `*Teléfono:* ${phone}\n`;
  text += `*Modalidad:* ${deliveryType === 'domicilio' ? '🛵 Domicilio a Casa' : '🌮 Recoger en Taquería'}\n`;
  if (deliveryType === 'domicilio') {
    text += `*Dirección:* ${address}\n`;
  }
  text += `\n*--- DETALLE DEL PEDIDO ---*\n`;

  cart.forEach(item => {
    text += `• ${item.qty}x ${item.title} = $${(item.price * item.qty).toLocaleString('es-CO')}\n`;
  });

  text += `\n*Subtotal:* $${subtotal.toLocaleString('es-CO')}\n`;
  if (deliveryType === 'domicilio') text += `*Envío:* $${deliveryFee.toLocaleString('es-CO')}\n`;
  if (tipPercent > 0) text += `*Propina (${tipPercent}%):* $${tipAmount.toLocaleString('es-CO')}\n`;
  text += `*TOTAL A PAGAR:* $${total.toLocaleString('es-CO')}\n\n`;
  text += `*Notas:* ${notes}\n\n`;
  text += `_Mensaje generado desde La Única Taquería Digital_`;

  const phoneNumber = '573001234567'; // Taqueria official WhatsApp number
  const encodedText = encodeURIComponent(text);
  window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, '_blank');
  
  showToast('¡Redirigiendo a WhatsApp para confirmar tu pedido! 📲');
}

/* --------------------------------------------------------------------------
   Table Reservation Engine
   -------------------------------------------------------------------------- */
function handleReservationSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('res-name').value;
  const date = document.getElementById('res-date').value;
  const time = document.getElementById('res-time').value;
  const guests = document.getElementById('res-guests').value;
  const zone = document.querySelector('.zone-option.selected')?.dataset?.zone || 'Salón Principal';

  const ticketCode = 'TAQ-' + Math.floor(1000 + Math.random() * 9000);

  const ticketHTML = `
    <div style="background: var(--bg-card); border: 2px solid var(--border-neon-solid); box-shadow: var(--glow-red-lg); padding: 32px; border-radius: var(--radius-lg); text-align: center; max-width: 440px; margin: 0 auto; color: #fff;">
      <span style="font-size: 44px;">🎟️</span>
      <h3 style="font-family: var(--font-headline); font-size: 28px; color: var(--secondary-yellow); margin-top: 8px;">RESERVA CONFIRMADA</h3>
      <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 24px;">Código de Reserva: <strong>${ticketCode}</strong></p>
      <div style="background: var(--bg-lowest); border: 1px dashed var(--border-neon); padding: 18px; border-radius: var(--radius-sm); text-align: left; font-family: var(--font-data); font-size: 14px; margin-bottom: 24px;">
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Fecha:</strong> ${date}</p>
        <p><strong>Hora:</strong> ${time}</p>
        <p><strong>Personas:</strong> ${guests} personas</p>
        <p><strong>Zona:</strong> ${zone}</p>
      </div>
      <button class="btn-primary" style="width: 100%; justify-content: center;" onclick="closeModal('reservation-modal')">CERRAR TICKET</button>
    </div>
  `;

  document.getElementById('reservation-ticket-container').innerHTML = ticketHTML;
  openModal('reservation-modal');
  showToast('¡Mesa reservada con éxito! Te esperamos 🔥');
}

/* --------------------------------------------------------------------------
   Contact Form Handler
   -------------------------------------------------------------------------- */
function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('contact-name').value;
  const email = document.getElementById('contact-email').value;
  const subject = document.getElementById('contact-subject').value;
  const message = document.getElementById('contact-message').value;

  showToast(`¡Gracias ${name}! Hemos recibido tu mensaje sobre "${subject}". Te responderemos a ${email} muy pronto 📨`);
  document.getElementById('contact-form').reset();
}

/* --------------------------------------------------------------------------
   UI Helpers & Event Listeners
   -------------------------------------------------------------------------- */
function initEventListeners() {
  // Category Filter clicks
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeCategory = e.target.dataset.category;
      renderMenu();
    });
  });

  // Zone Option selector
  document.querySelectorAll('.zone-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
      document.querySelectorAll('.zone-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  // Cart Drawer toggles
  document.getElementById('btn-cart-trigger')?.addEventListener('click', toggleCartDrawer);
  document.getElementById('btn-cart-close')?.addEventListener('click', toggleCartDrawer);

  // Reservation form
  document.getElementById('reservation-form')?.addEventListener('submit', handleReservationSubmit);

  // Contact form
  document.getElementById('contact-form')?.addEventListener('submit', handleContactSubmit);
}

function toggleCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
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
  if (addressGroup) {
    addressGroup.style.display = (type === 'domicilio') ? 'block' : 'none';
  }
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
  // Open 18:00 to 03:00
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
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

/* --------------------------------------------------------------------------
   Ambient Audio Synthesizer (Web Audio API)
   -------------------------------------------------------------------------- */
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
