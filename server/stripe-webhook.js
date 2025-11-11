require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const app = express();
// Stripe requires raw body for signature verification
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  switch (event.type) {
    case 'checkout.session.completed':
      {
        const session = event.data.object;
        // Actualiza la suscripción/pedido en supabase
        // Buscar subscription por customer_id / session.subscription
        await supabase.from('subscriptions').upsert(
          {
            stripe_subscription_id: session.subscription,
            stripe_customer_id: session.customer,
            status: 'active',
            // Puedes llenar company_id si lo guardaste anteriomente
          },
          { onConflict: 'stripe_subscription_id' }
        );
      }
      break;
    case 'invoice.payment_succeeded':
      {
        const invoice = event.data.object;
        // Actualizar estado de subscription si necesitas
      }
      break;
    case 'customer.subscription.deleted':
      {
        const sub = event.data.object;
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', sub.id);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 4243;
app.listen(PORT, () => console.log(`Webhook server listening on ${PORT}`));
