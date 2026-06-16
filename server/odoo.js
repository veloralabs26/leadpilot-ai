const axios = require('axios');
const config = require('./config');

let sessionId = null;

/**
 * Authenticate with Odoo and return a session cookie.
 */
async function authenticate() {
  const response = await axios.post(
    `${config.odoo.url}/web/session/authenticate`,
    {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        db: config.odoo.db,
        login: config.odoo.username,
        password: config.odoo.password,
      },
    },
    { withCredentials: true }
  );

  const cookies = response.headers['set-cookie'];
  if (cookies) {
    sessionId = cookies.find(c => c.startsWith('session_id'))?.split(';')[0];
  }
  return sessionId;
}

/**
 * Push a classified WhatsApp lead into Odoo CRM.
 * @param {{
 *   customerPhone: string,
 *   customerMessage: string,
 *   aiReply: string,
 *   leadType: string,
 *   estimatedValue: number,
 *   branch: string
 * }} lead
 * @returns {Promise<number>} Odoo lead ID
 */
async function pushLead(lead) {
  if (!sessionId) await authenticate();

  const tagMap = {
    hot: 'Hot',
    warm: 'Warm',
    rfq: 'RFQ',
    urgent: 'Urgent - Maintenance',
    technical: 'Technical Inquiry',
  };

  const response = await axios.post(
    `${config.odoo.url}/web/dataset/call_kw`,
    {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        model: 'crm.lead',
        method: 'create',
        args: [
          {
            name: `WhatsApp Lead — ${lead.customerPhone}`,
            description: `Customer message:\n${lead.customerMessage}\n\nAI Reply:\n${lead.aiReply}`,
            phone: lead.customerPhone,
            expected_revenue: lead.estimatedValue,
            priority: lead.leadType === 'hot' || lead.leadType === 'urgent' ? '2' : '1',
            source_id: false,
            // Custom fields — add to Odoo schema as needed
            x_source_channel: 'WhatsApp',
            x_lead_type: tagMap[lead.leadType] || 'Warm',
            x_branch: lead.branch,
            x_ai_replied: true,
          },
        ],
        kwargs: {},
      },
    },
    {
      headers: { Cookie: sessionId },
    }
  );

  return response.data.result;
}

module.exports = { pushLead };
