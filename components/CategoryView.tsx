
import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MapPin, 
  Clock as ClockIcon, 
  Loader2, 
  TrainFront,
  X,
  Radar,
  Sparkles,
  History,
  Info,
  Globe,
  ExternalLink,
  Facebook,
  AlertCircle,
  Timer,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Briefcase,
  Megaphone,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Category, Train, AIInference, MarketItem, Notice, Job } from '../types.ts';
import { db } from '../db.ts';

interface CategoryViewProps {
  category: Category;
  onBack: () => void;
}

const CategoryView: React.FC<CategoryViewProps> = ({ category }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isInferring, setIsInferring] = useState(false);
  const [aiInference, setAiInference] = useState<AIInference & { sources?: any[] }>({ 
    delayMinutes: 0, 
    confidence: 0, 
    reason: '', 
    isAI: false,
    sources: []
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      if (category === 'market_price') {
        await runMarketAI();
      } else if (category === 'notices' || category === 'jobs') {
        await runDynamicContentAI(category);
      } else {
        const items = await db.getCategory(category);
        setData(items);
        
        if (category === 'prayer') {
          try {
            const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Rajbari&country=Bangladesh&method=1');
            const json = await res.json();
            if (json.code === 200) {
              const t = json.data.timings;
              setData([
                { name: 'ফজর', time: t.Fajr, icon: '🌅' },
                { name: 'যোহর', time: t.Dhuhr, icon: '☀️' },
                { name: 'আসর', time: t.Asr, icon: '🌤️' },
                { name: 'মাগরিব', time: t.Maghrib, icon: '🌇' },
                { name: 'এশা', time: t.Isha, icon: '🌙' },
              ]);
            }
          } catch (e) { console.warn("Prayer fetch error", e); }
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [category]);

  const runMarketAI = async () => {
    try {
      const prompt = `আজকের তারিখ ${new Date().toLocaleDateString('bn-BD')}। রাজবাড়ী জেলার স্থানীয় বাজারের নিত্যপণ্যের (চাল, ডাল, পেঁয়াজ, সয়াবিন তেল, ডিম, ব্রয়লার মুরগি) সঠিক দাম গুগল সার্চ করে খুঁজে বের করুন। তথ্যটি JSON ফরম্যাটে দিন। JSON schema: Array of { name: string, unit: string, priceRange: string, trend: "up" | "down" | "stable" }`;
      
      const response = await db.callAI({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: "আপনি রাজবাড়ী জেলার বাজারদর বিশ্লেষক। সঠিক এবং সাম্প্রতিক ডাটা দিন। শুধুমাত্র JSON আউটপুট দিন।",
        responseMimeType: "application/json"
      });

      const parsedData = JSON.parse(response.text);
      setData(parsedData);
    } catch (e) {
      console.error("Market AI Error", e);
      const items = await db.getCategory('market_price');
      setData(items);
    }
  };

  const runDynamicContentAI = async (cat: string) => {
    try {
      const prompt = cat === 'jobs' 
        ? "রাজবাড়ী জেলা এবং এর আশেপাশে সাম্প্রতিক চাকরির বিজ্ঞপ্তিগুলো (সরকারি ও বেসরকারি) গুগল সার্চ করে খুঁজে বের করুন। JSON ফরম্যাটে দিন। Schema: Array of { title: string, org: string, deadline: string, link: string, type: string }"
        : "রাজবাড়ী জেলা প্রশাসনের ওয়েবসাইট এবং ফেসবুক গ্রুপ থেকে আজকের জরুরি নোটিশগুলো খুঁজে বের করুন। JSON ফরম্যাটে দিন। Schema: Array of { title: string, date: string, summary: string, priority: 'high' | 'normal' }";
      
      const response = await db.callAI({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: `আপনি রাজবাড়ী জেলার তথ্য অফিসার। সাম্প্রতিক ${cat === 'jobs' ? 'চাকরি' : 'নোটিশ'} খুঁজে বের করুন। শুধুমাত্র JSON দিন।`,
        responseMimeType: "application/json"
      });

      const parsedData = JSON.parse(response.text);
      setData(parsedData);
    } catch (e) {
      const items = await db.getCategory(cat);
      setData(items);
    }
  };

  const runTrainAIInference = async (train: Train) => {
    setIsInferring(true);
    setAiInference({ delayMinutes: 0, confidence: 0, reason: 'ফেসবুক গ্রুপগুলোতে সর্বশেষ আপডেট চেক করা হচ্ছে...', isAI: true, sources: [] });
    
    try {
      const prompt = `এখন সময় ${currentTime.toLocaleTimeString('bn-BD')}। রাজবাড়ী জেলার "${train.name}" ট্রেনটির বর্তমান অবস্থান ফেসবুকের ট্রেন ট্র্যাকিং গ্রুপগুলো থেকে খুঁজে বের করুন। তথ্যটি কতক্ষণ আগের এবং বর্তমানে কোন স্টেশনে আছে তা স্পষ্টভাবে জানান। বাংলায় উত্তর দিন।`;
      const response = await db.callAI({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: "আপনি একজন দক্ষ রেলওয়ে অফিসার। ফেসবুক গ্রুপ ও সোশ্যাল মিডিয়া থেকে ট্রেনের রিয়েল-টাইম ডাটা এবং তথ্যের সময় খুঁজে বের করাই আপনার প্রধান কাজ।"
      });
      setAiInference({ delayMinutes: 0, confidence: 0.95, reason: response.text || 'তথ্য মেলেনি।', isAI: true, sources: response.groundingMetadata?.groundingChunks || [] });
    } catch (e) {
      setAiInference({ delayMinutes: 0, confidence: 0, reason: 'দুঃখিত, লাইভ তথ্য পাওয়া যায়নি।', isAI: false, sources: [] });
    } finally { setIsInferring(false); }
  };

  const renderMarketItem = (item: MarketItem) => (
    <div key={item.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] mb-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center rounded-2xl text-emerald-600">
          <DollarSign className="w-7 h-7" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white text-lg">{item.name}</h4>
          <p className="text-xs text-slate-400 font-bold">{item.unit} ভিত্তিক মূল্য</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-black text-slate-800 dark:text-white mb-1">{item.priceRange}</div>
        <div className={`flex items-center justify-end gap-1 text-[10px] font-black uppercase tracking-widest ${
          item.trend === 'up' ? 'text-rose-500' : item.trend === 'down' ? 'text-emerald-500' : 'text-slate-400'
        }`}>
          {item.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : item.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <ClockIcon className="w-3 h-3" />}
          {item.trend === 'up' ? 'বাড়তি' : item.trend === 'down' ? 'কমছে' : 'স্থির'}
        </div>
      </div>
    </div>
  );

  const renderNoticeItem = (notice: Notice) => (
    <div key={notice.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] mb-4 border-l-8 border-l-indigo-600 dark:border-l-indigo-500 border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-indigo-600" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{notice.date}</span>
        </div>
        {notice.priority === 'high' && (
          <span className="bg-rose-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter animate-pulse">Urgent</span>
        )}
      </div>
      <h4 className="font-black text-slate-800 dark:text-white text-lg leading-tight mb-2">{notice.title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{notice.summary}</p>
      <button className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform">
        বিস্তারিত দেখুন <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );

  const renderJobItem = (job: Job) => (
    <div key={job.id} className="bg-white dark:bg-slate-900 p-6 rounded-[3rem] mb-5 border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-indigo-400 transition-all">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <Briefcase className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-black text-slate-800 dark:text-white text-lg leading-tight mb-1">{job.title}</h4>
          <p className="text-sm text-slate-500 font-bold">{job.org}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-black text-slate-500 uppercase">শেষ: {job.deadline}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800/50">
          <span className="text-[10px] font-black text-indigo-600 uppercase">{job.type}</span>
        </div>
      </div>
      <a href={job.link} target="_blank" className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all">
        আবেদন করুন <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );

  const renderItem = (item: any) => {
    if (category === 'market_price') return renderMarketItem(item);
    if (category === 'notices') return renderNoticeItem(item);
    if (category === 'jobs') return renderJobItem(item);
    if (category === 'trains') {
      return (
        <div key={item.id} onClick={() => { setSelectedTrain(item); runTrainAIInference(item); }} className="group bg-white dark:bg-slate-900 p-6 rounded-[2.8rem] shadow-sm mb-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-4 cursor-pointer active:scale-95 transition-all hover:border-indigo-400 hover:shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><TrainFront className="w-6 h-6" /></div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-1">{item.name}</h4>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.route}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-indigo-600 uppercase mb-1">প্রস্থান</p>
              <p className="text-sm font-black text-slate-800 dark:text-white">{item.departure}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
             <div className="flex items-center gap-2 text-slate-400"><History className="w-3.5 h-3.5" /><span className="text-[10px] font-bold">ছুটি: {item.offDay}</span></div>
             <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-5 py-2 rounded-full"><Radar className="w-3 h-3 text-indigo-500 animate-pulse" /><span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">লাইভ ট্র্যাকিং</span></div>
          </div>
        </div>
      );
    }

    return (
      <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2.2rem] mb-3 flex items-center justify-between border border-slate-50 dark:border-slate-800 shadow-sm hover:border-indigo-200 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl text-xl">{item.icon || <Info className="w-6 h-6 text-indigo-500" />}</div>
          <div><h4 className="font-bold text-slate-800 dark:text-white text-sm leading-tight">{item.name || item.title}</h4><p className="text-[10px] text-slate-400 font-bold mt-0.5">{item.mobile || item.address || item.time || item.details}</p></div>
        </div>
        {(item.mobile || item.number) && (
          <a href={`tel:${item.mobile || item.number}`} className="p-4 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-2xl"><Phone className="w-5 h-5" /></a>
        )}
      </div>
    );
  };

  return (
    <div className="px-6 py-6 pb-40 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none mb-1">
            {category === 'emergency' ? 'জরুরি সেবা' : category === 'trains' ? 'রেলওয়ে আপডেট' : category === 'market_price' ? 'লাইভ বাজারদর' : category === 'jobs' ? 'চাকরি বিজ্ঞপ্তি' : 'বিস্তারিত তালিকা'}
          </h3>
          <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.5em] flex items-center gap-2">
            {(category === 'market_price' || category === 'jobs') && <Sparkles className="w-3 h-3 text-amber-500" />}
            Rajbari Smart Portal
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
           <ClockIcon className="w-5 h-5 text-indigo-600 animate-pulse" />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <Loader2 className="w-14 h-14 animate-spin text-indigo-600" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">স্মার্ট সার্চ চলছে...</p>
        </div>
      ) : (
        <div className="animate-slide-up">
          {data.length > 0 ? (
            data.map(renderItem)
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
               <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400 font-bold">এই মুহূর্তে কোনো তথ্য নেই।</p>
            </div>
          )}
        </div>
      )}

      {selectedTrain && (
        <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[3.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col">
            <button onClick={() => setSelectedTrain(null)} className="absolute top-8 right-8 p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 z-50 hover:bg-rose-50 transition-all"><X className="w-6 h-6" /></button>
            <div className="p-8 pb-4 overflow-y-auto no-scrollbar">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-indigo-600 text-white rounded-[1.8rem] shadow-xl animate-swing"><TrainFront className="w-8 h-8" /></div>
                <div><h3 className="text-2xl font-black dark:text-white leading-tight">{selectedTrain.name}</h3><p className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.3em]">{selectedTrain.route}</p></div>
              </div>
              <div className="p-6 bg-indigo-50 dark:bg-indigo-950/30 rounded-[2.2rem] border border-indigo-100 dark:border-indigo-900/50 shadow-sm relative overflow-hidden mb-10">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Facebook className="w-4 h-4 text-blue-600 fill-blue-600" />
                      <h4 className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">লাইভ রিপোর্ট</h4>
                    </div>
                    {!isInferring && <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-indigo-100"><Timer className="w-3 h-3 text-emerald-500" /><span className="text-[9px] font-black text-emerald-600 uppercase">Verified</span></div>}
                 </div>
                 <p className="text-sm font-bold dark:text-slate-200 leading-relaxed">{isInferring ? 'ফেসবুকের লোকাল গ্রুপগুলো থেকে তথ্যের সঠিকতা যাচাই করা হচ্ছে...' : aiInference.reason}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryView;
