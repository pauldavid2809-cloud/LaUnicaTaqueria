/* ==========================================================================
   LA ÚNICA TAQUERÍA DIGITAL - DELIVERY DRIVER PORTAL LOGIC
   ========================================================================== */

let activeDeliveryOrders = [];
let currentFilter = 'todos';

document.addEventListener('DOMContentLoaded', () => {
  loadDeliveryOrders();
  // Auto refresh every 15 seconds
  setInterval(loadDeliveryOrders, 15000);
});

async function loadDeliveryOrders() {
  activeDeliveryOrders = await dbGetActiveOrders();
  renderDeliveryOrders();
}

function filterDeliveryOrders(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.filter-btn[data-filter="${filter}"]`)?.classList.add('active');
  renderDeliveryOrders();
}

function renderDeliveryOrders() {
  const container = document.getElementById('delivery-orders-grid');
  if (!container) return;

  const filtered = currentFilter === 'todos' 
    ? activeDeliveryOrders 
    : activeDeliveryOrders.filter(o => o.status === currentFilter);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 60px 20px;">
        <span style="font-size: 40px; display: block; margin-bottom: 10px;">🛵</span>
        No hay pedidos activos en la categoría seleccionada.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(order => {
    const statusClass = `status-${order.status || 'recibido'}`;
    const statusLabel = getStatusLabel(order.status);
    
    // GPS Map Link
    let mapsBtnHTML = '';
    if (order.maps_url) {
      mapsBtnHTML = `
        <a href="${order.maps_url}" target="_blank" class="btn-primary" style="height: 34px; padding: 0 12px; font-size: 11px; margin-top: 6px; width: 100%; justify-content: center; background: #27ae60; border-color: #2ecc71;">
          <span>🧭 NAVEGAR CON PIN GPS (GOOGLE MAPS)</span>
        </a>
      `;
    } else if (order.address) {
      const encodedAddr = encodeURIComponent(order.address);
      mapsBtnHTML = `
        <a href="https://www.google.com/maps/search/?api=1&query=${encodedAddr}" target="_blank" class="btn-secondary" style="height: 34px; padding: 0 12px; font-size: 11px; margin-top: 6px; width: 100%; justify-content: center;">
          <span>🗺️ BUSCAR DIRECCIÓN EN GOOGLE MAPS</span>
        </a>
      `;
    }

    const itemsSummary = Array.isArray(order.items) 
      ? order.items.map(i => `${i.qty}x ${i.title}`).join(', ') 
      : 'Platillos varios';

    return `
      <div class="order-card-delivery">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px;">
          <div>
            <span style="font-family: var(--font-headline); font-size: 22px; color: var(--secondary-yellow);">${order.tracking_code}</span>
            <div style="font-family: var(--font-data); font-size: 11px; color: var(--text-muted);">${new Date(order.created_at || Date.now()).toLocaleTimeString()}</div>
          </div>
          <span class="delivery-status-badge ${statusClass}">${statusLabel}</span>
        </div>

        <div style="font-size: 14px;">
          <p style="color: #fff;"><strong>Cliente:</strong> ${order.customer_name || 'Cliente'}</p>
          <p style="color: var(--text-muted);"><strong>Teléfono WhatsApp:</strong> ${order.customer_phone || 'Sin registro'}</p>
          <p style="color: var(--text-muted);"><strong>Modalidad:</strong> ${order.delivery_type === 'domicilio' ? '🛵 Domicilio' : '🌮 Recoger'}</p>
          <p style="color: var(--tertiary-orange); margin-top: 4px;"><strong>Dirección:</strong> ${order.address || 'Recoge en local'}</p>
          ${mapsBtnHTML}
        </div>

        <div style="background: var(--bg-lowest); padding: 10px; border-radius: var(--radius-sm); font-size: 13px; color: var(--text-primary);">
          <strong>Orden:</strong> ${itemsSummary}<br>
          <strong style="color: var(--secondary-yellow);">Total: $${(order.total || 0).toLocaleString('es-CO')}</strong>
        </div>

        <!-- Action Phase Buttons -->
        <div style="margin-top: 4px;">
          <div style="font-family: var(--font-data); font-size: 10px; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase;">
            AVANZAR FASE (DISPARA WHATSAPP AUTOMÁTICO AL CLIENTE):
          </div>
          <div class="action-btn-group">
            <button class="btn-phase" onclick="updatePhase('${order.tracking_code}', 'en_cocina')">👨‍🍳 Cocina</button>
            <button class="btn-phase" onclick="updatePhase('${order.tracking_code}', 'en_camino')">🛵 En Camino</button>
            <button class="btn-phase" onclick="updatePhase('${order.tracking_code}', 'entregado')">🌮 Entregado</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function updatePhase(trackingCode, newStatus) {
  const result = await dbUpdateOrderStatus(trackingCode, newStatus);
  
  if (result.success) {
    const notif = result.notification;
    logDispatchEvent(notif);
    await loadDeliveryOrders();
  }
}

function logDispatchEvent(notif) {
  const feed = document.getElementById('dispatch-log-feed');
  if (!feed) return;

  const timeStr = new Date().toLocaleTimeString();
  const entryHTML = `
    <div style="margin-bottom: 8px; border-left: 2px solid #2ecc71; padding-left: 10px;">
      <span style="color: #edc157;">[${timeStr}] 🤖 MENSAJE AUTOMÁTICO ENVIADO</span><br>
      <strong>Desde:</strong> ${notif.sender} (Número Oficial Taquería)<br>
      <strong>Para:</strong> ${notif.recipient} (${notif.payload.customer_name})<br>
      <strong>Fase:</strong> ${notif.payload.status.toUpperCase()} | <strong>Pedido:</strong> #${notif.payload.order_code}<br>
      <span style="color: #fff; font-style: italic;">"${notif.message}"</span>
    </div>
  `;

  feed.innerHTML = entryHTML + feed.innerHTML;
}

function getStatusLabel(status) {
  switch (status) {
    case 'recibido': return '📥 Recibido';
    case 'en_cocina': return '👨‍🍳 En Cocina';
    case 'en_camino': return '🛵 En Camino';
    case 'entregado': return '🌮 Entregado';
    default: return status || 'Pendiente';
  }
}
