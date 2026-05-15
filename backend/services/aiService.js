const https = require('https');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are an expert business document generator.
Generate professional invoice/quotation/form data in JSON format only.
Always respond with valid JSON. No markdown, no explanation, no code blocks, just raw JSON.`;

function groqRequest(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      temperature: 0.3,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ]
    });

    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          resolve(parsed);
        } catch (e) {
          reject(new Error('Invalid response from Groq'));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function generateDocumentFromPrompt(prompt, docType, businessInfo, currency = 'INR') {
  const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€';

  const userPrompt = `Generate a professional ${docType} based on this description:
"${prompt}"

Business/sender info:
${JSON.stringify(businessInfo, null, 2)}

Currency: ${currency} (${currencySymbol})

Return ONLY a raw JSON object (no markdown, no backticks, no explanation):
{
  "title": "document title",
  "documentNumber": "INV-2024-001",
  "clientInfo": {
    "name": "client name",
    "email": "client@email.com",
    "phone": "+91-9999999999",
    "address": "full address",
    "company": "company name if applicable"
  },
  "lineItems": [
    { "description": "item description", "quantity": 1, "rate": 5000, "amount": 5000 }
  ],
  "subtotal": 5000,
  "taxRate": 18,
  "taxAmount": 900,
  "discount": 0,
  "total": 5900,
  "notes": "payment/delivery notes",
  "terms": "terms and conditions",
  "dueDate": "2024-07-30",
  "currency": "${currency}"
}

Use realistic Indian business values if not specified. Use GST 18% as default tax.`;

  const response = await groqRequest([{ role: 'user', content: userPrompt }]);
  const text = response.choices[0].message.content.trim();
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI returned invalid format. Please try again.');
  return JSON.parse(jsonMatch[0]);
}

async function improveDocument(documentData, feedback) {
  const userPrompt = `Improve this document based on feedback:

Current document: ${JSON.stringify(documentData, null, 2)}

Feedback: "${feedback}"

Return the improved document as raw JSON with the same structure. No markdown, no backticks, just JSON.`;

  const response = await groqRequest([{ role: 'user', content: userPrompt }]);
  const text = response.choices[0].message.content.trim();
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI returned invalid format');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { generateDocumentFromPrompt, improveDocument };
