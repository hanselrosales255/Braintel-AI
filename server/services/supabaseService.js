const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const logger = require('../logger');

const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function getUserFromToken(token) {
  if (!token) return { user: null, error: new Error('Token requerido') };

  const response = await supabase.auth.getUser(token);
  if (response.error) {
    logger.warn('Token inválido al obtener usuario', { error: response.error.message });
  }
  return response;
}

async function getProfile(userId) {
  if (!userId) return { data: null, error: new Error('userId requerido') };
  return supabase.from('profiles').select('*').eq('id', userId).single();
}

async function getActiveSubscription(userId) {
  if (!userId) return { data: null, error: new Error('userId requerido') };
  return supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
}

async function insertPendingSubscription(payload) {
  const entry = {
    user_id: payload.userId || null,
    company_id: payload.companyId || null,
    stripe_customer_id: payload.stripeCustomerId,
    stripe_session_id: payload.sessionId,
    price_id: payload.priceId,
    status: payload.status || 'pending',
    created_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('subscriptions').insert([entry]);
  if (error) {
    logger.warn('No fue posible insertar registro temporal en subscriptions', {
      error: error.message,
    });
  }
}

async function upsertSubscriptionByStripeId(payload) {
  const record = {
    stripe_subscription_id: payload.subscriptionId,
    stripe_customer_id: payload.customerId,
    status: payload.status,
    company_id: payload.companyId || null,
    user_id: payload.userId || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('subscriptions')
    .upsert(record, { onConflict: 'stripe_subscription_id' });

  if (error) {
    logger.error('Error al sincronizar suscripción con Supabase', { error: error.message });
    throw error;
  }
}

async function updateSubscriptionStatus(subscriptionId, status) {
  const { error } = await supabase
    .from('subscriptions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    logger.error('No fue posible actualizar el estado de la suscripción', {
      error: error.message,
      subscriptionId,
    });
    throw error;
  }
}

module.exports = {
  client: supabase,
  getUserFromToken,
  getProfile,
  getActiveSubscription,
  insertPendingSubscription,
  upsertSubscriptionByStripeId,
  updateSubscriptionStatus,
};
