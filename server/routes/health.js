const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const config = require('../config');
const { client: supabase } = require('../services/supabaseService');
const { stripe } = require('../services/stripeService');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const startedAt = req.context?.start;

    const [supabaseStatus, stripeStatus] = await Promise.allSettled([
      supabase.from('subscriptions').select('id').limit(1),
      stripe.balance.retrieve(),
    ]);

    res.json({
      status: 'ok',
      environment: config.env,
      uptime: process.uptime(),
      requestId: req.context?.id,
      responseTimeMs: startedAt ? Date.now() - startedAt : undefined,
      services: {
        supabase: supabaseStatus.status === 'fulfilled' ? 'ok' : 'error',
        stripe: stripeStatus.status === 'fulfilled' ? 'ok' : 'error',
      },
    });
  })
);

module.exports = router;
