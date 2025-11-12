const express = require('express');
const config = require('./config');
const logger = require('./logger');
const { client: supabase } = require('./services/supabaseService');

const app = express();
app.use(express.json());

const AUTH_TOKEN = process.env.N8N_SECRET_TOKEN;

app.post('/n8n/call-hook', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!AUTH_TOKEN || token !== AUTH_TOKEN) {
    logger.warn('Intento de acceso no autorizado al hook de n8n');
    return res.status(401).send('Unauthorized');
  }

  const payload = {
    client_id: req.body.client_id,
    name: req.body.name,
    dni: req.body.dni,
    phone: req.body.phone,
    service: req.body.service,
    call_timestamp: req.body.call_timestamp || new Date().toISOString(),
    duration_seconds: req.body.duration_seconds,
    notes: req.body.notes,
  };

  try {
    const { error } = await supabase.from('calls').insert([payload]);
    if (error) throw error;

    logger.info('Webhook de n8n procesado correctamente', { clientId: payload.client_id });
    return res.json({ ok: true });
  } catch (error) {
    logger.error('Error procesando webhook de n8n', { error: error.message });
    return res.status(500).json({ error: 'No fue posible registrar la llamada' });
  }
});

const PORT = config.webhooks?.n8nPort || 3000;
app.listen(PORT, () => logger.info('Servicio n8n hook escuchando', { port: PORT }));
