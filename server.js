
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

/**
 * সিকিউর এআই এন্ডপয়েন্ট
 * এই এন্ডপয়েন্টটি ফ্রন্টএন্ড থেকে আসা রিকোয়েস্ট গ্রহণ করে এবং জেমিনি এপিআই কল করে।
 */
app.post('/api/ai', async (req, res) => {
    const { contents, systemInstruction, tools, responseSchema, responseMimeType } = req.body;

    if (!process.env.API_KEY) {
        return res.status(500).json({ error: "Server Configuration Error: API_KEY is missing." });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // প্রডাকশন কোয়ালিটির জন্য gemini-3-pro-preview ব্যবহার করা হচ্ছে
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: contents,
            config: {
                systemInstruction: systemInstruction || `আপনি রাজবাড়ী জেলার একজন ভার্চুয়াল অ্যাসিস্ট্যান্ট। 
                রাজবাড়ী জেলার ট্রেন ট্র্যাকিং এবং স্থানীয় তথ্যের জন্য গুগল সার্চ ব্যবহার করুন। 
                সর্বদা বাংলায় উত্তর দিন। ডাটা প্রদানের সময় সঠিকতা বজায় রাখুন।`,
                tools: tools || [{ googleSearch: {} }],
                responseSchema: responseSchema,
                responseMimeType: responseMimeType,
                temperature: 0.1, // ডাটা সঠিক রাখার জন্য কম টেম্পারেচার
            }
        });

        res.json({
            text: response.text || "",
            groundingMetadata: response.candidates?.[0]?.groundingMetadata || null
        });
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        res.status(500).json({ error: error.message || "Gemini API call failed." });
    }
});

// মক ডাটাবেজ রাউট
app.get('/api/db', (req, res) => res.json([]));

// ক্লায়েন্ট সাইড রাউটিং সাপোর্ট
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => console.log(`Rajbari Smart Server active on port ${port}`));
