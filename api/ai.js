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

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

  if (!apiKey) {
    res.status(500).json({ error: 'Server Configuration Error: GEMINI_API_KEY is missing.' });
    return;
  }

  let body = {};
  try {
    body = await parseRequestBody(req);
  } catch (error) {
    res.status(400).json({ error: 'Invalid JSON payload.' });
    return;
  }

  const { contents, systemInstruction, tools, responseSchema, responseMimeType } = body || {};

  if (!contents || !Array.isArray(contents)) {
    res.status(400).json({ error: 'Invalid request: contents array is required.' });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents,
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
  } catch (error) {
    res.status(500).json({ error: error?.message || 'Gemini API call failed.' });
  }
}
