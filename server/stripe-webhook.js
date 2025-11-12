const express = require('express');
const config = require('./config');
const logger = require('./logger');
const { stripe } = require('./services/stripeService');
const {
  upsertSubscriptionByStripeId,
  updateSubscriptionStatus,
} = require('./services/supabaseService');

const app = express();

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!config.stripe.webhookSecret) {
    logger.error('El STRIPE_WEBHOOK_SECRET no está configurado');
    return res.status(500).json({ error: 'Configuración incompleta' });
  }

  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, config.stripe.webhookSecret);
  } catch (error) {
    logger.warn('Firma de webhook inválida', { error: error.message });
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await upsertSubscriptionByStripeId({
          subscriptionId: session.subscription,
          customerId: session.customer,
          status: 'active',
          companyId: session.metadata?.company_id,
          userId: session.metadata?.profile_id,
        });
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          await updateSubscriptionStatus(invoice.subscription, 'active');
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          await updateSubscriptionStatus(invoice.subscription, 'past_due');
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await updateSubscriptionStatus(subscription.id, 'canceled');
        break;
      }
      default: {
        logger.debug(`Evento de Stripe no manejado: ${event.type}`);
      }
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Error procesando webhook de Stripe', {
      eventType: event?.type,
      error: error.message,
    });
    res.status(500).json({ error: 'Error interno procesando el webhook' });
  }
});

const PORT = config.webhooks?.stripePort || 4243;
app.listen(PORT, () =>
  logger.info(`Servidor de webhooks de Stripe escuchando`, {
    port: PORT,
  })
);
