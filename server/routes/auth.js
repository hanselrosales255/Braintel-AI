const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const {
  getUserFromToken,
  getProfile,
  getActiveSubscription,
} = require('../services/supabaseService');

const router = express.Router();

function extractBearerToken(header) {
  if (!header || typeof header !== 'string') return null;
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

router.get(
  '/auth/session',
  asyncHandler(async (req, res) => {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.json({ user: null, session: null });
    }

    const { data, error } = await getUserFromToken(token);
    if (error || !data?.user) {
      return res.json({ user: null, session: null });
    }

    const [profileResult, subscriptionResult] = await Promise.all([
      getProfile(data.user.id),
      getActiveSubscription(data.user.id),
    ]);

    res.json({
      user: data.user,
      profile: profileResult.data || null,
      subscription: subscriptionResult.data || null,
      hasActiveSubscription: Boolean(subscriptionResult.data),
    });
  })
);

router.get(
  '/subscription/active',
  asyncHandler(async (req, res) => {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación requerido',
      });
    }

    const { data, error } = await getUserFromToken(token);
    if (error || !data?.user) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token inválido',
      });
    }

    const subscriptionResult = await getActiveSubscription(data.user.id);

    if (subscriptionResult.error && subscriptionResult.error.code !== 'PGRST116') {
      throw subscriptionResult.error;
    }

    res.json({
      subscription: subscriptionResult.data || null,
      hasActiveSubscription: Boolean(subscriptionResult.data),
    });
  })
);

module.exports = router;
