
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Trash2, AlertCircle, RefreshCcw, ShieldCheck, Globe } from 'lucide-react';
import { db } from '../db';

const SYSTEM_INSTRUCTION = `
আপনি হলেন "রাজবাড়ী জেলা তথ্য সহায়িকা – AI Chat Assistant"।
আপনার দায়িত্ব ও বৈশিষ্ট্য:
১. রাজবাড়ী জেলা সম্পর্কে সকল তথ্য প্রদান করা।
২. ভাষা: সর্বদা বাংলা ব্যবহার করবেন।
৩. টোন: বিনয়ী ও সম্মানজনক।
৪. ডেভেলপার: Sovrab Roy।
৫. গুগল সার্চ ব্যবহার করে তথ্য দিন এবং তথ্যের সূত্র উল্লেখ করুন।
`;

interface Message {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  errorType?: string;
  sources?: any[];
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'স্বাগতম! আমি রাজবাড়ী জেলা তথ্য সহায়িকা। আপনাকে কিভাবে সাহায্য করতে পারি?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (retryText?: string) => {
    const userMessage = retryText || input.trim();
    if (!userMessage || isTyping) return;

    if (!retryText) {
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    }
    
    setIsTyping(true);

    try {
      const chatHistory = messages
        .filter(m => !m.isError)
        .map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

      const data = await db.callAI({
        contents: [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }],
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }]
      });
      
      const responseText = data.text || "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না।";
      const sources = data.groundingMetadata?.groundingChunks || [];

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: responseText,
        sources: sources
      }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      const errorMsg = error.message || "সার্ভারের সাথে সংযোগ করা যাচ্ছে না।";
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: `${errorMsg}\nদয়া করে ইন্টারনেট কানেকশন চেক করুন।`, 
        isError: true, 
        errorType: 'network' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] animate-slide-up relative">
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 dark:text-white leading-none">রাজবাড়ী স্মার্ট সাপোর্ট</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter bg-emerald-100 text-emerald-600">
                <ShieldCheck className="w-2.5 h-2.5" />
                Gemini 3 Active
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => setMessages([{ role: 'model', text: 'স্বাগতম! আমি রাজবাড়ী জেলা তথ্য সহায়িকা। আপনাকে কিভাবে সাহায্য করতে পারি?' }])} className="p-3 text-slate-400 hover:text-rose-500 rounded-xl">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 bg-slate-50 dark:bg-slate-950">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm border border-slate-100 dark:border-slate-800'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className="flex flex-col gap-2">
                <div className={`p-4 rounded-3xl text-sm leading-relaxed whitespace-pre-line shadow-sm border ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none border-indigo-600 shadow-indigo-100' 
                  : msg.isError 
                    ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 rounded-tl-none'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-tl-none border-slate-100 dark:border-slate-800'
                }`}>
                  {msg.isError && <AlertCircle className="w-4 h-4 mb-2 inline-block mr-1" />}
                  {msg.text}
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">তথ্যসূত্র (Google Search):</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((chunk: any, sidx: number) => (
                          chunk.web && (
                            <a 
                              key={sidx} 
                              href={chunk.web.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800/50 hover:scale-105 transition-transform"
                            >
                              <Globe className="w-2.5 h-2.5" /> Source {sidx+1}
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {msg.isError && (
                  <button onClick={() => handleSend([...messages].reverse().find(m => m.role === 'user')?.text)} className="flex items-center gap-2 text-[10px] font-black text-indigo-600 bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border border-indigo-50 dark:border-indigo-900/50 self-start">
                    <RefreshCcw className="w-3 h-3" /> পুনরায় চেষ্টা
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 dark:border-slate-800"><Bot className="w-4 h-4" /></div>
            <div className="bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-1">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
        <div className="flex gap-3 bg-slate-50 dark:bg-slate-900 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 focus-within:border-indigo-400 transition-all shadow-inner">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="রাজবাড়ী সম্পর্কে জিজ্ঞাসা করুন..." 
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 text-slate-800 dark:text-white"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              !input.trim() || isTyping ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white shadow-lg'
            }`}
          >
            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
