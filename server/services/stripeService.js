const Stripe = require('stripe');
const config = require('../config');
const logger = require('../logger');

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: config.stripe.apiVersion,
  maxNetworkRetries: config.stripe.maxNetworkRetries,
  timeout: config.stripe.timeout,
});

async function retrievePrice(priceId) {
  try {
    const price = await stripe.prices.retrieve(priceId);
    return { ok: true, price };
  } catch (error) {
    logger.error('No fue posible recuperar el precio en Stripe', {
      error: error.message,
      priceId,
    });
    return { ok: false, error };
  }
}

async function ensureCustomer(email) {
  try {
    if (!email) throw new Error('Email requerido para crear/buscar customer');

    const existing = await stripe.customers.list({ email, limit: 1 });
    if (existing.data.length > 0) {
      return existing.data[0].id;
    }

    const customer = await stripe.customers.create({
      email,
      metadata: {
        source: 'braincore_web_app',
        created_at: new Date().toISOString(),
      },
    });

    return customer.id;
  } catch (error) {
    logger.error('Error administrando customer en Stripe', {
      error: error.message,
      email,
    });
    throw error;
  }
}

async function createCheckoutSession({ priceId, customerId, companyId, profileId, requestId }) {
  try {
    return await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer: customerId,
      client_reference_id: companyId,
      metadata: {
        company_id: companyId,
        profile_id: profileId || '',
        request_id: requestId || '',
        environment: config.env,
      },
      success_url: `${config.appUrl}/dashboard.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.appUrl}/#precios`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      subscription_data: {
        metadata: {
          company_id: companyId,
          profile_id: profileId || '',
        },
      },
    });
  } catch (error) {
    logger.error('Error creando la sesión de checkout', {
      error: error.message,
      priceId,
      customerId,
    });
    throw error;
  }
}

module.exports = {
  stripe,
  retrievePrice,
  ensureCustomer,
  createCheckoutSession,
};
