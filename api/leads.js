const leads = [];

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const lead = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      phone: req.body.phone || '',
      name: req.body.name || req.body.phone || 'مشترك',
      message: req.body.message || '',
      reply: req.body.reply || '',
      leadType: req.body.leadType || 'warm',
      estimatedValue: req.body.estimatedValue || 15000,
      branch: req.body.branch || 'Riyadh HQ',
      responseTime: req.body.responseTime || '4s',
    };
    leads.unshift(lead);
    if (leads.length > 100) leads.pop();
    return res.status(201).json({ ok: true, id: lead.id });
  }

  return res.json(leads);
};
