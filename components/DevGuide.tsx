
import React from 'react';
import { Database, Globe, Code2, Heart, Zap, Server, Terminal, ShieldCheck } from 'lucide-react';

const DevGuide: React.FC = () => {
  return (
    <div className="p-4 md:p-8 animate-in slide-in-from-bottom duration-500 text-slate-800 pb-32">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold mb-4 text-indigo-700">হোস্টিং ও ডেপ্লয়মেন্ট গাইড (VPS)</h2>
        <p className="text-slate-600">রাজবাড়ী জেলা তথ্য সেবা অ্যাপটি প্রফেশনালভাবে হোস্ট করার নিয়ম</p>
      </div>

      <div className="space-y-12">
        <section className="bg-gradient-to-br from-slate-900 to-indigo-900 p-10 rounded-[3rem] text-white text-center premium-shadow relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
             <div className="bg-white/10 p-5 rounded-[2rem] backdrop-blur-md mb-6 border border-white/20">
               <Server className="w-12 h-12 text-indigo-300" />
             </div>
             <p className="text-indigo-300 font-bold text-xs uppercase tracking-[0.3em] mb-2">Target Hosting</p>
             <h3 className="text-3xl font-black tracking-tight mb-4">VPS (Ubuntu 22.04+)</h3>
             <div className="flex items-center gap-2 text-indigo-200/60 text-sm font-medium">
               <span>Optimized for Performance</span>
               <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
             </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 premium-shadow">
          <div className="flex items-center gap-3 mb-6 text-indigo-600">
            <Terminal className="w-7 h-7" />
            <h3 className="text-2xl font-bold dark:text-white">১. প্রয়োজনীয় পরিবেশ সেটআপ</h3>
          </div>
          <div className="bg-slate-950 p-6 rounded-2xl font-mono text-xs text-indigo-300 space-y-2 overflow-x-auto shadow-inner">
            <p># Node.js ও NPM ইন্সটল করুন</p>
            <p>curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -</p>
            <p>sudo apt-get install -y nodejs</p>
            <p># PM2 গ্লোবালি ইন্সটল করুন (অটো-স্টার্টের জন্য)</p>
            <p>sudo npm install -y pm2 -g</p>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 premium-shadow">
          <div className="flex items-center gap-3 mb-6 text-emerald-600">
            <Globe className="w-7 h-7" />
            <h3 className="text-2xl font-bold dark:text-white">২. কোড ডেপ্লয় ও রান</h3>
          </div>
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
            <p className="font-bold text-slate-800 dark:text-white">ধাপগুলো:</p>
            <ol className="list-decimal list-inside space-y-3">
              <li>কোডটি GitHub থেকে <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">git clone</code> করুন।</li>
              <li>ফোল্ডারে ঢুকে <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">npm install</code> দিন।</li>
              <li>অ্যাপটি বিল্ড করুন: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">npm run build</code>।</li>
              <li>PM2 দিয়ে সার্ভার স্টার্ট করুন: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">pm2 start server.js --name "rajbari-app"</code>।</li>
            </ol>
          </div>
        </section>

        <section className="bg-indigo-50 dark:bg-indigo-950/20 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30">
          <div className="flex items-center gap-3 mb-6 text-indigo-700 dark:text-indigo-400">
            <ShieldCheck className="w-7 h-7" />
            <h3 className="text-2xl font-bold">৩. Nginx রিভার্স প্রক্সি কনফিগ</h3>
          </div>
          <p className="text-sm mb-4 leading-relaxed">আপনার ডোমেইনকে (যেমন: api.rajbari.com) ৩০০০ নম্বর পোর্টে কানেক্ট করতে Nginx কনফিগার করুন:</p>
          <div className="bg-slate-950 p-6 rounded-2xl font-mono text-[10px] text-emerald-400 overflow-x-auto">
            <p>location / {"{"}</p>
            <p className="pl-4">proxy_pass http://localhost:3001;</p>
            <p className="pl-4">proxy_http_version 1.1;</p>
            <p className="pl-4">proxy_set_header Upgrade $http_upgrade;</p>
            <p className="pl-4">proxy_set_header Connection 'upgrade';</p>
            <p className="pl-4">proxy_set_header Host $host;</p>
            <p className="pl-4">proxy_cache_bypass $http_upgrade;</p>
            <p>{"}"}</p>
          </div>
        </section>

        <section className="bg-amber-50 dark:bg-amber-950/20 p-8 rounded-[2.5rem] border border-amber-100 dark:border-amber-900/30">
          <div className="flex items-center gap-3 mb-4 text-amber-700">
            <Zap className="w-6 h-6" />
            <h3 className="text-xl font-bold">কেন VPS ব্যবহার করবেন?</h3>
          </div>
          <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-400">
             <li>• <b>Persistent Connection:</b> আপনার ট্রেন ট্র্যাকিং AI প্রক্সি সর্বদা চালু থাকবে।</li>
             <li>• <b>Custom API Key:</b> অ্যাডমিন প্যানেল থেকে এপিআই কী পরিবর্তন করলে তা সাথে সাথে কার্যকর হবে।</li>
             <li>• <b>Secure SQLite:</b> ইউজারের সব কাস্টম ডাটা আপনার নিজের সার্ভারে নিরাপদ থাকবে।</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default DevGuide;
