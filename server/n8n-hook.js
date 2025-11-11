// server/n8n-hook.js
require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.post('/n8n/call-hook', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token || token !== process.env.N8N_SECRET_TOKEN) return res.status(401).send('Unauthorized');

  const { client_id, name, dni, phone, service, call_timestamp, duration_seconds, notes } =
    req.body;

  try {
    const { error } = await supabase.from('calls').insert([
      {
        client_id,
        name,
        dni,
        phone,
        service,
        call_timestamp: call_timestamp || new Date().toISOString(),
        duration_seconds,
        notes,
      },
    ]);
    if (error) throw error;
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('n8n hook listening on 3000'));
