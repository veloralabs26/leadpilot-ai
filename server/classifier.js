/**
 * Lead classifier — determines type, urgency, and estimated deal value
 * from the AI's analysis of the incoming WhatsApp message.
 */

const LEAD_TYPES = {
  HOT: 'hot',
  WARM: 'warm',
  RFQ: 'rfq',
  URGENT: 'urgent',
  TECHNICAL: 'technical',
};

const URGENCY_KEYWORDS = [
  'عاجل', 'طارئ', 'الآن', 'فوري', 'اليوم', 'صيانة طارئة',
  'urgent', 'emergency', 'asap', 'immediately', 'breakdown',
];

const HOT_KEYWORDS = [
  'موافق', 'نشتري', 'نريد نطلب', 'كم السعر', 'متى التسليم',
  'ready', 'confirm', 'order', 'purchase', 'buy now',
];

const RFQ_KEYWORDS = [
  'عرض سعر', 'تسعيرة', 'كميات كبيرة', 'مشروع', 'مناقصة',
  'rfq', 'quotation', 'bulk', 'tender', 'project', 'annual contract',
];

const TECHNICAL_KEYWORDS = [
  'مواصفات', 'كتالوج', 'datasheet', 'spec', 'technical', 'dimensions',
  'مقاسات', 'نوع', 'موديل', 'model', 'part number', 'catalog',
];

/**
 * Classify a WhatsApp message into a lead type.
 * @param {string} messageText - The incoming message
 * @returns {{ type: string, urgency: string, estimatedValue: number }}
 */
function classifyLead(messageText) {
  const lower = messageText.toLowerCase();

  let type = LEAD_TYPES.WARM;
  let urgency = 'normal';
  let estimatedValue = 15000;

  if (URGENCY_KEYWORDS.some(kw => lower.includes(kw))) {
    type = LEAD_TYPES.URGENT;
    urgency = 'high';
    estimatedValue = 8000;
  } else if (RFQ_KEYWORDS.some(kw => lower.includes(kw))) {
    type = LEAD_TYPES.RFQ;
    urgency = 'high';
    estimatedValue = 85000;
  } else if (HOT_KEYWORDS.some(kw => lower.includes(kw))) {
    type = LEAD_TYPES.HOT;
    urgency = 'high';
    estimatedValue = 42000;
  } else if (TECHNICAL_KEYWORDS.some(kw => lower.includes(kw))) {
    type = LEAD_TYPES.TECHNICAL;
    urgency = 'normal';
    estimatedValue = 20000;
  }

  return { type, urgency, estimatedValue };
}

/**
 * Detect the closest branch based on message content.
 * Falls back to 'Riyadh HQ' if no city is mentioned.
 */
function detectBranch(messageText) {
  const branches = {
    'الرياض': 'Riyadh HQ',
    'jeddah': 'Jeddah Branch',
    'جدة': 'Jeddah Branch',
    'الدمام': 'Dammam Branch',
    'dammam': 'Dammam Branch',
    'الجبيل': 'Jubail Branch',
    'jubail': 'Jubail Branch',
    'مكة': 'Makkah Branch',
    'makkah': 'Makkah Branch',
    'aramco': 'Dhahran Branch',
    'أرامكو': 'Dhahran Branch',
  };

  const lower = messageText.toLowerCase();
  for (const [keyword, branch] of Object.entries(branches)) {
    if (lower.includes(keyword)) return branch;
  }
  return 'Riyadh HQ';
}

module.exports = { classifyLead, detectBranch, LEAD_TYPES };
