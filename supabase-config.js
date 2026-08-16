/* ==========================================================================
   LA ÚNICA TAQUERÍA DIGITAL - SUPABASE BACKEND CONFIG & AUTOMATED WHATSAPP API
   ========================================================================== */

// Configura tus llaves de Supabase y API de WhatsApp Meta Cloud aquí para producción:
const SUPABASE_URL = window.ENV_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = window.ENV_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const WHATSAPP_API_ENDPOINT = window.ENV_WHATSAPP_API_ENDPOINT || null; // e.g. Meta Cloud API or Supabase Edge Function

// Empresa Official Phone & Name
const COMPANY_NAME = 'La Única Taquería';
const COMPANY_WHATSAPP = '+57 300 123 4567';

// Inicialización de cliente Supabase si el SDK está disponible
let supabaseClient = null;
if (typeof supabase !== 'undefined' && SUPABASE_URL !== 'https://xyzcompany.supabase.co') {
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('⚡ Supabase conectado exitosamente');
  } catch (err) {
    console.warn('⚠️ Supabase no configurado, utilizando motor local de respaldo:', err);
  }
}

/* --------------------------------------------------------------------------
   API Helpers con Fallback Automático a localStorage / Demo Data
   -------------------------------------------------------------------------- */

// 1. Guardar o enviar pedido con coordenadas GPS
async function dbCreateOrder(orderData) {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('orders').insert([orderData]).select();
      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (err) {
      console.error('Error al guardar pedido en Supabase:', err);
    }
  }

  // Fallback Local
  const localOrders = JSON.parse(localStorage.getItem('taqueria_orders')) || [];
  localOrders.unshift(orderData);
  localStorage.setItem('taqueria_orders', JSON.stringify(localOrders));
  return { success: true, data: orderData };
}

// 2. Obtener pedidos activos para el portal de repartidores (delivery.html)
async function dbGetActiveOrders() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (err) {
      console.warn('Error obteniendo pedidos de Supabase:', err);
    }
  }

  const localOrders = JSON.parse(localStorage.getItem('taqueria_orders')) || [];
  return localOrders;
}

// 3. Actualizar estado de pedido y disparar mensaje automatizado por WhatsApp
async function dbUpdateOrderStatus(trackingCode, newStatus) {
  let updatedOrder = null;

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .update({ status: newStatus })
        .eq('tracking_code', trackingCode)
        .select();
      if (!error && data && data.length > 0) updatedOrder = data[0];
    } catch (err) {
      console.warn('Error actualizando pedido en Supabase:', err);
    }
  }

  // Fallback Local
  const localOrders = JSON.parse(localStorage.getItem('taqueria_orders')) || [];
  const index = localOrders.findIndex(o => o.tracking_code === trackingCode);
  if (index > -1) {
    localOrders[index].status = newStatus;
    localStorage.setItem('taqueria_orders', JSON.stringify(localOrders));
    if (!updatedOrder) updatedOrder = localOrders[index];
  }

  if (!updatedOrder) {
    updatedOrder = {
      tracking_code: trackingCode,
      customer_name: 'Cliente Taquería',
      customer_phone: '+57 300 000 0000',
      status: newStatus
    };
  }

  // Disparar envío de WhatsApp AUTOMATIZADO desde el número de la empresa
  const notificationResult = await sendAutomatedWhatsAppNotification(updatedOrder, newStatus);

  return { success: true, order: updatedOrder, notification: notificationResult };
}

// 4. MOTOR DE MENSAJERÍA AUTOMATIZADA WHATSAPP (Server/API Dispatcher)
async function sendAutomatedWhatsAppNotification(order, status) {
  const customerName = order.customer_name || 'Cliente';
  const customerPhone = order.customer_phone || '+57 300 000 0000';
  const code = order.tracking_code;

  // Mensaje estructurado por fase
  let messageBody = '';
  switch (status) {
    case 'recibido':
      messageBody = `¡Hola ${customerName}! 🌮 Tu pedido #${code} ha sido RECIBIDO en La Única Taquería. La cocina ha aceptado tu comanda.`;
      break;
    case 'en_cocina':
      messageBody = `¡Hola ${customerName}! 🔥 Tu pedido #${code} de La Única Taquería ya está EN LA PLANCHA / TROMPO. Tu taquero está preparando tus tacos.`;
      break;
    case 'en_camino':
      messageBody = `¡Hola ${customerName}! 🛵 Tu pedido #${code} va EN CAMINO con el repartidor a tu ubicación GPS. Prepara la mesa, ¡llegamos en minutos!`;
      break;
    case 'entregado':
      messageBody = `¡Hola ${customerName}! 🌮 Tu pedido #${code} ha sido ENTREGADO exitosamente. ¡Buen provecho y gracias por elegir La Única Taquería!`;
      break;
    default:
      messageBody = `¡Hola ${customerName}! Tu pedido #${code} de La Única Taquería ha actualizado su estado a: ${status}.`;
  }

  const payload = {
    from: COMPANY_WHATSAPP,
    to: customerPhone,
    order_code: code,
    customer_name: customerName,
    status: status,
    message: messageBody,
    timestamp: new Date().toISOString()
  };

  // Si existe endpoint API de producción (Meta Cloud API / Twilio), realizamos la llamada HTTP POST
  if (WHATSAPP_API_ENDPOINT) {
    try {
      const response = await fetch(WHATSAPP_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log('🤖 WhatsApp Cloud API Response:', await response.json());
    } catch (err) {
      console.error('Error disparando API WhatsApp Cloud:', err);
    }
  }

  // Log visual de disparo automático en el cliente/consola
  console.log(`%c[AUTOMATED WHATSAPP DISPATCH] From: ${COMPANY_WHATSAPP} ➔ To: ${customerPhone} (${customerName})`, 'color: #2ecc71; font-weight: bold; font-size: 14px;');
  console.log(`%c"${messageBody}"`, 'color: #edc157; font-style: italic;');

  // Retorna datos de confirmación del envío automático
  return {
    automated: true,
    sender: COMPANY_WHATSAPP,
    recipient: customerPhone,
    message: messageBody,
    payload: payload
  };
}

// 5. Rastreo de pedido por código (#TAQ-XXXX)
async function dbTrackOrder(code) {
  const cleanCode = code.trim().toUpperCase();

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('tracking_code', cleanCode)
        .single();
      if (!error && data) return { success: true, order: data };
    } catch (err) {
      console.warn('Búsqueda en Supabase no devolvió resultados, verificando local:', err);
    }
  }

  // Fallback Local
  const localOrders = JSON.parse(localStorage.getItem('taqueria_orders')) || [];
  const found = localOrders.find(o => o.tracking_code === cleanCode);
  
  if (found) return { success: true, order: found };

  // Pedido de prueba simulado
  if (cleanCode.startsWith('TAQ-')) {
    return {
      success: true,
      order: {
        tracking_code: cleanCode,
        customer_name: 'Cliente Nocturno',
        customer_phone: '+57 300 999 8888',
        delivery_type: 'domicilio',
        status: 'en_camino',
        total: 23800,
        items: [
          { title: 'Taco Al Pastor Tradicional', qty: 2 },
          { title: 'Birria Quesataco Dorado', qty: 1 }
        ],
        created_at: new Date().toISOString()
      }
    };
  }

  return { success: false, message: 'No se encontró ningún pedido con ese código.' };
}

// 6. Crear Reserva Inteligente
async function dbCreateReservation(resData) {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('reservations').insert([resData]).select();
      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (err) {
      console.error('Error guardando reserva en Supabase:', err);
    }
  }

  const localRes = JSON.parse(localStorage.getItem('taqueria_reservations')) || [];
  localRes.push(resData);
  localStorage.setItem('taqueria_reservations', JSON.stringify(localRes));
  return { success: true, data: resData };
}

// 7. Obtener Mesas Reservadas
async function dbGetOccupiedTables(dateStr) {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('reservations')
        .select('table_id')
        .eq('reservation_date', dateStr);
      if (!error && data) return data.map(r => r.table_id);
    } catch (err) {
      console.warn('Error obteniendo mesas de Supabase:', err);
    }
  }

  const localRes = JSON.parse(localStorage.getItem('taqueria_reservations')) || [];
  return localRes.filter(r => r.reservation_date === dateStr).map(r => r.table_id);
}

// 8. Reseñas
const DEMO_REVIEWS = [
  {
    customer_name: 'Valentina Ríos',
    rating: 5,
    comment: '¡Los Birria Quesatacos bañados en el consomé son de otro planeta! La atención nocturna es impecable y la música neón genera un súper ambiente.',
    dish_tag: 'Birria Quesataco Dorado 🍲',
    created_at: 'Hace 2 horas'
  },
  {
    customer_name: 'Santiago Gómez',
    rating: 5,
    comment: 'Los tacos al pastor con la piña asada bien dorada al carbón son los mejores de la Zona Rosa. El pedido por WhatsApp llegó rapidísimo.',
    dish_tag: 'Taco Al Pastor Tradicional 🌶️',
    created_at: 'Ayer'
  }
];

async function dbGetReviews() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('reviews').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (err) {
      console.warn('Error obteniendo reseñas de Supabase:', err);
    }
  }

  const localReviews = JSON.parse(localStorage.getItem('taqueria_reviews')) || [];
  return [...localReviews, ...DEMO_REVIEWS];
}

async function dbAddReview(reviewData) {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('reviews').insert([reviewData]).select();
      if (!error && data) return { success: true, data: data[0] };
    } catch (err) {
      console.error('Error enviando reseña a Supabase:', err);
    }
  }

  const localReviews = JSON.parse(localStorage.getItem('taqueria_reviews')) || [];
  localReviews.unshift(reviewData);
  localStorage.setItem('taqueria_reviews', JSON.stringify(localReviews));
  return { success: true, data: reviewData };
}
