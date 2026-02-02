
import { RAJBARI_DATA } from './constants.tsx';
import { GoogleGenAI } from "@google/genai";

// Ensure process is defined for the browser environment if not already
const getApiKey = () => {
  try {
    return process.env.API_KEY || "";
  } catch (e) {
    return "";
  }
};

export const db = {
  callAI: async (params: { 
    contents: any; 
    systemInstruction?: string; 
    tools?: any[]; 
    responseSchema?: any;
    responseMimeType?: string;
  }) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.warn("AI Key Missing: Please ensure API_KEY is set in your environment.");
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: params.contents,
      config: {
        systemInstruction: params.systemInstruction || `আপনি রাজবাড়ী জেলার একজন প্রফেশনাল রেলওয়ে ইনফরমেশন স্পেশালিস্ট। 
        আপনার প্রধান কাজ হলো ফেসবুকের বিভিন্ন গ্রুপ (যেমন: 'রাজবাড়ী রেলওয়ে সেবা', 'বাংলাদেশ রেলওয়ে ফ্যান গ্রুপ', 'পাংশা-রাজবাড়ী ট্রেন আপডেট') থেকে ট্রেনের রিয়েল-টাইম তথ্য খুঁজে বের করা। 
        আপনি তথ্যের ভেরিফিকেশন টাইম (তথ্যটি কতক্ষণ আগের) এবং সঠিক স্টেশন লোকেশন নিশ্চিত করবেন। 
        তথ্যগুলো সর্বদা পয়েন্ট আকারে বাংলায় প্রদান করবেন।`,
        tools: params.tools || [{ googleSearch: {} }],
        responseSchema: params.responseSchema,
        responseMimeType: params.responseMimeType,
        temperature: 0.1,
        topP: 0.95
      }
    });

    return {
      text: response.text || "",
      groundingMetadata: response.candidates?.[0]?.groundingMetadata || null
    };
  },

  getCategory: async (category: string) => {
    return (RAJBARI_DATA as any)[category] || [];
  }
};
