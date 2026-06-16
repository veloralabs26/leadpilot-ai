const Anthropic = require('@anthropic-ai/sdk');
const config = require('./config');

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

const SYSTEM_PROMPT = `أنت وكيل مبيعات احترافي لشركة البراك، المتخصصة في أبواب الشاتر الصناعية والأبواب القطاعية وخدمات التركيب والصيانة في المملكة العربية السعودية.

مهمتك:
- الرد على استفسارات العملاء عبر واتساب بعربية احترافية وودية
- تقديم معلومات دقيقة عن المنتجات والأسعار والتركيب
- طلب تفاصيل المشروع عند الحاجة (الموقع، الكميات، المواصفات)
- تحويل العميل لفريق المبيعات عند الاستعداد للشراء

منتجاتنا الرئيسية:
- أبواب الشاتر الصناعية (Roll-up doors) — تبدأ من 3,500 ريال
- الأبواب القطاعية (Sectional doors) — تبدأ من 6,500 ريال
- خدمات الصيانة الطارئة — متاحة 24/7
- عقود الصيانة السنوية — تبدأ من 2,000 ريال/سنة
- نوافذ الشاتر التجارية — تبدأ من 1,800 ريال

قواعد الرد:
1. رد دائماً بالعربية ما لم يكتب العميل بالإنجليزية
2. كن مختصراً ومباشراً — لا تجعل الرد أطول من 3-4 جمل
3. إذا طلب العميل عرض سعر لكميات كبيرة، اطلب: الموقع، الكميات، المواصفات، وموعد التسليم المطلوب
4. لحالات الصيانة الطارئة: أكد الاستجابة خلال ساعتين وأخبره أن الفريق سيتواصل فوراً
5. لا تذكر أرقام دقيقة للأسعار دون تفاصيل المشروع — قدّم نطاقاً

ختم كل رد بـ: "فريق البراك للخدمة 24/7"`;

/**
 * Generate an AI reply to a WhatsApp message.
 * @param {string} customerMessage
 * @param {{ type: string, urgency: string }} classification
 * @returns {Promise<string>}
 */
async function generateReply(customerMessage, classification) {
  const contextNote = classification.type === 'urgent'
    ? '\n[ملاحظة داخلية: هذا طلب طارئ — ركز على التأكيد الفوري والاستجابة السريعة]'
    : classification.type === 'rfq'
    ? '\n[ملاحظة داخلية: هذا طلب عرض سعر — اطلب التفاصيل الكاملة للمشروع]'
    : '';

  const message = await client.messages.create({
    model: config.anthropic.model,
    max_tokens: 300,
    system: SYSTEM_PROMPT + contextNote,
    messages: [{ role: 'user', content: customerMessage }],
  });

  return message.content[0].text;
}

module.exports = { generateReply };
