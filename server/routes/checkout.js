const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const logger = require('../logger');
const {
  retrievePrice,
  ensureCustomer,
  createCheckoutSession,
} = require('../services/stripeService');
const { insertPendingSubscription } = require('../services/supabaseService');

const router = express.Router();

function validatePayload(body) {
  const errors = [];

  if (!body?.priceId || typeof body.priceId !== 'string') {
    errors.push('priceId es requerido y debe ser un string');
  }

  if (!body?.customer_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customer_email)) {
    errors.push('customer_email es requerido y debe ser válido');
  }

  if (!body?.company_id || typeof body.company_id !== 'string') {
    errors.push('company_id es requerido');
  }

  return errors;
}

router.post(
  '/create-checkout-session',
  asyncHandler(async (req, res) => {
    const requestId = req.context?.id;
    const {
      priceId,
      customer_email: email,
      profile_id: profileId,
      company_id: companyId,
    } = req.body;

    const validationErrors = validatePayload(req.body);
    if (validationErrors.length) {
      const error = new Error('Datos inválidos');
      error.status = 400;
      error.details = validationErrors;
      error.skipLogging = true;
      throw error;
    }

    logger.info('Nueva solicitud de checkout', {
      requestId,
      priceId,
      companyId,
    });

    const priceResult = await retrievePrice(priceId);
    if (!priceResult.ok) {
      const error = new Error('El plan seleccionado no está disponible');
      error.status = 400;
      error.code = 'INVALID_PRICE';
      throw error;
    }

    const customerId = await ensureCustomer(email);

    const session = await createCheckoutSession({
      priceId,
      customerId,
      companyId,
      profileId,
      requestId,
    });

    await insertPendingSubscription({
      userId: profileId,
      companyId,
      stripeCustomerId: customerId,
      sessionId: session.id,
      priceId,
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  })
);

module.exports = router;
