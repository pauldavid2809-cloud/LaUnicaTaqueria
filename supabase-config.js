/* ==========================================================================
   LA ÚNICA TAQUERÍA DIGITAL - SUPABASE BACKEND CONFIG & FALLBACK API
   ========================================================================== */

// Configura tus llaves de Supabase aquí cuando desplegues a producción:
const SUPABASE_URL = window.ENV_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = window.ENV_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

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

// 1. Guardar o enviar pedido
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
  localOrders.push(orderData);
  localStorage.setItem('taqueria_orders', JSON.stringify(localOrders));
  return { success: true, data: orderData };
}

// 2. Rastreo de pedido por código (#TAQ-XXXX)
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

  // Pedido simulado de demostración para códigos de prueba
  if (cleanCode.startsWith('TAQ-')) {
    return {
      success: true,
      order: {
        tracking_code: cleanCode,
        customer_name: 'Cliente Nocturno',
        delivery_type: 'domicilio',
        status: 'en_camino', // 'recibido', 'en_cocina', 'en_camino', 'entregado'
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

// 3. Crear Reserva Inteligente
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

  // Fallback Local
  const localRes = JSON.parse(localStorage.getItem('taqueria_reservations')) || [];
  localRes.push(resData);
  localStorage.setItem('taqueria_reservations', JSON.stringify(localRes));
  return { success: true, data: resData };
}

// 4. Obtener Mesas Reservadas para una fecha dada
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

  // Fallback Local
  const localRes = JSON.parse(localStorage.getItem('taqueria_reservations')) || [];
  return localRes.filter(r => r.reservation_date === dateStr).map(r => r.table_id);
}

// 5. Mural de Reseñas
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
  },
  {
    customer_name: 'Camila Morales',
    rating: 5,
    comment: 'La horchata sucia con el toque de espresso es una adicción total. Reservamos la barra neón para un cumple y fue la mejor elección.',
    dish_tag: 'Horchata Sucia Artesanal 🥤',
    created_at: 'Hace 3 días'
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
