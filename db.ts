
import { RAJBARI_DATA } from './constants.tsx';

export const db = {
  callAI: async (params: { 
    contents: any; 
    systemInstruction?: string; 
    tools?: any[]; 
    responseSchema?: any;
    responseMimeType?: string;
  }) => {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: params.contents,
        systemInstruction: params.systemInstruction || `আপনি রাজবাড়ী জেলার একজন প্রফেশনাল রেলওয়ে ইনফরমেশন স্পেশালিস্ট। 
        আপনার প্রধান কাজ হলো ফেসবুকের বিভিন্ন গ্রুপ (যেমন: 'রাজবাড়ী রেলওয়ে সেবা', 'বাংলাদেশ রেলওয়ে ফ্যান গ্রুপ', 'পাংশা-রাজবাড়ী ট্রেন আপডেট') থেকে ট্রেনের রিয়েল-টাইম তথ্য খুঁজে বের করা। 
        আপনি তথ্যের ভেরিফিকেশন টাইম (তথ্যটি কতক্ষণ আগের) এবং সঠিক স্টেশন লোকেশন নিশ্চিত করবেন। 
        তথ্যগুলো সর্বদা পয়েন্ট আকারে বাংলায় প্রদান করবেন।`,
        tools: params.tools || [{ googleSearch: {} }],
        responseSchema: params.responseSchema,
        responseMimeType: params.responseMimeType
      })
    });

    if (!response.ok) {
      let errorMessage = 'AI request failed.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (error) {
        // ignore json parse errors
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  getCategory: async (category: string) => {
    return (RAJBARI_DATA as any)[category] || [];
  }
};
