import { GoogleGenAI } from '@google/genai';

export const config = {
  runtime: 'nodejs'
};

const defaultSystemInstruction = `আপনি রাজবাড়ী জেলার একজন ভার্চুয়াল অ্যাসিস্ট্যান্ট। 
রাজবাড়ী জেলার ট্রেন ট্র্যাকিং এবং স্থানীয় তথ্যের জন্য গুগল সার্চ ব্যবহার করুন। 
সর্বদা বাংলায় উত্তর দিন। ডাটা প্রদানের সময় সঠিকতা বজায় রাখুন।`;

const parseRequestBody = (req) => {
  if (req?.body) {
    if (typeof req.body === 'string') {
      return JSON.parse(req.body);
    }
    if (Buffer.isBuffer(req.body)) {
      return JSON.parse(req.body.toString('utf-8'));
    }
    return req.body;
  }

  if (typeof req?.on === 'function') {
    return new Promise((resolve, reject) => {
      let raw = '';
      req.on('data', (chunk) => {
        raw += chunk;
      });
      req.on('end', () => {
        if (!raw) {
          resolve({});
          return;
        }
        try {
          resolve(JSON.parse(raw));
        } catch (error) {
          reject(error);
        }
      });
      req.on('error', reject);
    });
  }

  return {};
};

const normalizeText = (value) => {
  if (value === undefined || value === null) {
    return '';
  }
  return typeof value === 'string' ? value : String(value);
};

const normalizeParts = (parts) => {
  if (!parts) {
    return [];
  }
  if (Array.isArray(parts)) {
    return parts
      .map((part) => {
        if (typeof part === 'string') {
          return { text: part };
        }
        if (part && typeof part === 'object' && 'text' in part) {
          return { text: normalizeText(part.text) };
        }
        return null;
      })
      .filter(Boolean);
  }

  if (typeof parts === 'string') {
    return [{ text: parts }];
  }

  if (typeof parts === 'object' && 'text' in parts) {
    return [{ text: normalizeText(parts.text) }];
  }

  return [];
};

const normalizeContentItem = (item) => {
  if (typeof item === 'string') {
    return { role: 'user', parts: [{ text: item }] };
  }

  if (!item || typeof item !== 'object') {
    return null;
  }

  if (Array.isArray(item.parts) || item.parts) {
    const parts = normalizeParts(item.parts);
    return parts.length > 0 ? { role: item.role || 'user', parts } : null;
  }

  if ('text' in item) {
    return { role: item.role || 'user', parts: [{ text: normalizeText(item.text) }] };
  }

  return null;
};

const normalizeContents = (contents) => {
  if (!contents) {
    return null;
  }

  if (typeof contents === 'string') {
    return [{ role: 'user', parts: [{ text: contents }] }];
  }

  if (Array.isArray(contents)) {
    const normalized = contents
      .map((item) => normalizeContentItem(item))
      .filter(Boolean);
    return normalized.length > 0 ? normalized : null;
  }

  if (typeof contents === 'object') {
    const normalized = normalizeContentItem(contents);
    return normalized ? [normalized] : null;
  }

  return null;
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.info('[api/ai] request', {
    method: req.method
  });

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.VITE_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  if (!apiKey) {
    res.status(500).json({ error: 'Server Configuration Error: GEMINI_API_KEY is missing.' });
    return;
  }

  let body = {};
  try {
    body = await parseRequestBody(req);
  } catch (error) {
    console.error('[api/ai] body_parse_error', { message: error?.message || 'unknown' });
    res.status(400).json({ error: 'Invalid JSON payload.' });
    return;
  }

  console.info('[api/ai] body', body);

  const { contents, systemInstruction, tools, responseSchema, responseMimeType } = body || {};
  const normalizedContents = normalizeContents(contents);

  console.info('[api/ai] contents_status', {
    hasContents: Boolean(contents),
    isArray: Array.isArray(contents)
  });

  if (!normalizedContents) {
    res.status(400).json({ error: 'Invalid request: contents array is required.' });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    console.info('[api/ai] gemini_request_start', { model });
    const response = await ai.models.generateContent({
      model,
      contents: normalizedContents,
      config: {
        systemInstruction: systemInstruction || defaultSystemInstruction,
        tools: tools || [{ googleSearch: {} }],
        responseSchema,
        responseMimeType,
        temperature: 0.1
      }
    });

    res.json({
      text: response.text || '',
      groundingMetadata: response.candidates?.[0]?.groundingMetadata || null
    });
    console.info('[api/ai] gemini_request_success');
  } catch (error) {
    const errorMessage = error?.message || 'Gemini API call failed.';
    const errorStatus = Number.isFinite(Number(error?.status))
      ? Number(error?.status)
      : Number.isFinite(Number(error?.code))
        ? Number(error?.code)
        : null;
    const status = errorStatus && errorStatus >= 400 && errorStatus < 600 ? errorStatus : 500;

    console.error('[api/ai] gemini_request_error', {
      message: errorMessage,
      status
    });

    res.status(status).json({
      error: errorMessage,
      details: error?.response?.data || null
    });
  }
}
