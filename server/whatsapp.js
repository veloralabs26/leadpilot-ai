const axios = require('axios');
const config = require('./config');

/**
 * Send a WhatsApp text message to a recipient.
 * @param {string} to - E.164 phone number (e.g. "966512345678")
 * @param {string} text - Message body
 */
async function sendMessage(to, text) {
  await axios.post(
    `${config.whatsapp.apiUrl}/${config.whatsapp.phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    },
    {
      headers: {
        Authorization: `Bearer ${config.whatsapp.token}`,
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Mark a WhatsApp message as read.
 * @param {string} messageId
 */
async function markRead(messageId) {
  await axios.post(
    `${config.whatsapp.apiUrl}/${config.whatsapp.phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    },
    {
      headers: {
        Authorization: `Bearer ${config.whatsapp.token}`,
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Extract the first text message from a WhatsApp webhook payload.
 * Returns null if the payload contains no text message.
 */
function extractMessage(body) {
  try {
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];
    if (!message || message.type !== 'text') return null;

    return {
      messageId: message.id,
      from: message.from,
      text: message.text.body,
      timestamp: message.timestamp,
    };
  } catch {
    return null;
  }
}

module.exports = { sendMessage, markRead, extractMessage };
