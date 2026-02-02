
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  CloudSun,
  Home as HomeIcon,
  Compass,
  MessageSquare,
  ShieldAlert,
  Settings,
  Code2,
  Moon,
  Sun,
  Clock as ClockIcon,
  Calendar,
  Heart,
  Facebook,
  Linkedin,
  Mail,
  ExternalLink
} from 'lucide-react';
import { Category } from './types.ts';
import { CATEGORIES } from './constants.tsx';
import CategoryView from './components/CategoryView.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import AdminLogin from './components/AdminLogin.tsx';
import MapView from './components/MapView.tsx';
import AIChat from './components/AIChat.tsx';
import { db } from './db.ts';

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category | 'map_explore' | 'ai_chat' | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [titleClicks, setTitleClicks] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [imgError, setImgError] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'শুভ সকাল';
    if (hour >= 12 && hour < 16) return 'শুভ দুপুর';
    if (hour >= 16 && hour < 18) return 'শুভ অপরাহ্ন';
    if (hour >= 18 && hour < 23) return 'শুভ সন্ধ্যা';
    return 'শুভ রাত্রি';
  };

  const toggleDarkMode = () => setIsDark(!isDark);

  const handleAdminClick = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setShowLogin(true);
    }
  };

  const handleTitleClick = () => {
    const newClicks = titleClicks + 1;
    if (newClicks >= 5) {
      setShowLogin(true);
      setTitleClicks(0);
    } else {
      setTitleClicks(newClicks);
      setTimeout(() => setTitleClicks(0), 2000);
    }
  };

  const onLoginSuccess = () => {
    setIsAdmin(true);
    setShowLogin(false);
  };

  const formattedTime = currentTime.toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedWeekday = currentTime.toLocaleDateString('bn-BD', {
    weekday: 'long'
  });

  const getBengaliDateWithSuffix = () => {
    try {
      const formatter = new Intl.DateTimeFormat('bn-BD', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      const parts = formatter.formatToParts(currentTime);
      const day = parts.find(p => p.type === 'day')?.value || '';
      const month = parts.find(p => p.type === 'month')?.value || '';
      const year = parts.find(p => p.type === 'year')?.value || '';

      const numericDay = currentTime.getDate();
      let suffix = '';
      if (numericDay === 1) suffix = 'লা';
      else if (numericDay === 2 || numericDay === 3) suffix = 'রা';
      else if (numericDay === 4) suffix = 'ঠা';
      else if (numericDay >= 5 && numericDay <= 18) suffix = 'ই';
      else if (numericDay >= 19) suffix = 'শে';

      return `${day}${suffix} ${month}, ${year} খ্রিস্টাব্দ`;
    } catch (e) {
      return currentTime.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) + ' খ্রিস্টাব্দ';
    }
  };

  const renderHome = () => (
    <div className="animate-slide-up w-full">
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 to-violet-800 dark:from-indigo-900 dark:to-slate-900 p-6 md:p-8 rounded-b-[3.5rem] md:rounded-b-[4rem] shadow-2xl mb-8">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div onClick={handleTitleClick} className="cursor-pointer active:scale-95 transition-transform">
              <p className="text-indigo-100 font-bold mb-1 flex items-center gap-2 text-xs">
                <CloudSun className="w-4 h-4 text-amber-400" /> {getGreeting()}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight">রাজবাড়ী জেলা তথ্য সেবা</h2>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={toggleDarkMode}
                className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg"
              >
                {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-7 mb-7 border border-white/20 shadow-2xl relative overflow-hidden group transition-all duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-indigo-100 font-bold text-[10px] uppercase tracking-[0.25em] mb-4 bg-indigo-500/30 w-fit px-4 py-1.5 rounded-full border border-white/10">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {formattedWeekday}
                </div>
                
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
                    {formattedTime.split(' ')[0]}
                  </span>
                  <span className="text-lg md:text-xl font-black text-indigo-200 uppercase tracking-widest bg-white/10 px-2 py-1 rounded-xl">
                    {formattedTime.split(' ')[1]}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-white font-bold text-sm md:text-lg bg-white/10 w-fit px-5 py-2.5 rounded-2xl border border-white/10 shadow-lg">
                    <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.9)]"></span>
                    {getBengaliDateWithSuffix()}
                  </div>
                </div>
              </div>
              <div className="relative shrink-0 hidden md:block">
                <div className="absolute inset-0 bg-indigo-400 blur-[50px] opacity-40 animate-pulse"></div>
                <div className="bg-gradient-to-br from-white/30 to-white/5 p-6 rounded-[2.5rem] border border-white/30 relative shadow-2xl backdrop-blur-2xl">
                   <ClockIcon className="w-14 h-14 text-white animate-spin-slow" style={{ animationDuration: '20s' }} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-indigo-100 text-[11px] mb-7 opacity-90 px-4 font-bold tracking-wider uppercase">
            <MapPin className="w-4 h-4 text-rose-400" />
            রাজবাড়ী জেলা, ঢাকা বিভাগ
          </div>

          <div className="relative group px-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-300 transition-colors" />
            <input 
              type="text" 
              placeholder="সার্চ করুন (ডাক্তার, জরুরি সেবা...)" 
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] py-5 pl-16 pr-8 text-white placeholder:text-indigo-200/50 focus:outline-none focus:bg-white/20 transition-all shadow-inner font-medium text-sm"
            />
          </div>
        </div>
      </div>

      <div className="px-6 pb-48">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <HomeIcon className="w-6 h-6 text-indigo-600" /> প্রধান সেবাগুলো
          </h3>
          <button className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">সব দেখুন</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="category-card group bg-white dark:bg-slate-900 p-5 md:p-6 rounded-[2.5rem] md:rounded-[3rem] flex flex-col items-center justify-center gap-3 md:gap-4 transition-all duration-500 border border-slate-100 dark:border-slate-800 premium-shadow hover:border-indigo-400 dark:hover:border-indigo-500 hover:-translate-y-2 hover:shadow-2xl active:scale-95"
            >
              <div className={`${cat.bgColor} dark:bg-opacity-10 ${cat.textColor} p-5 md:p-6 rounded-[1.8rem] md:rounded-[2.2rem] group-hover:scale-110 transition-all duration-500 shadow-md`}>
                {cat.icon}
              </div>
              <span className="font-black text-slate-800 dark:text-slate-100 text-center text-[12px] md:text-[13px] leading-tight tracking-tight uppercase">{cat.title}</span>
            </button>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-br from-rose-500 to-rose-700 dark:from-rose-900 dark:to-rose-950 border-none rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-3xl shadow-rose-300 dark:shadow-none relative overflow-hidden group">
          <div className="flex items-center gap-6 relative z-10">
            <div className="bg-white/20 backdrop-blur-xl text-white p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl">
              <ShieldAlert className="w-6 h-6 md:w-8 md:w-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-rose-100 uppercase tracking-[0.3em] mb-1">Emergency</p>
              <h4 className="text-2xl md:text-3xl font-black text-white leading-none tracking-tighter">৯৯৯ হেল্পলাইন</h4>
            </div>
          </div>
          <a href="tel:999" className="w-full md:w-auto text-center bg-white text-rose-700 px-10 py-4 md:py-5 rounded-[1.5rem] md:rounded-[1.8rem] font-black shadow-2xl active:scale-90 transition-all hover:bg-rose-50 relative z-10 text-[12px] uppercase tracking-wider">
            কল দিন
          </a>
        </div>

        {/* --- PREMIUM DEVELOPER PROFILE SECTION --- */}
        <div className="mt-20 p-10 bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-50 dark:border-slate-800 premium-shadow flex flex-col items-center text-center group transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl"></div>
          
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-indigo-600 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-[2.8rem] md:rounded-[3.2rem] overflow-hidden bg-indigo-600 border-[6px] border-white dark:border-slate-800 shadow-[0_20px_50px_rgba(79,70,229,0.3)] relative z-10 transition-all duration-700 flex items-center justify-center group-hover:rotate-1">
               {!imgError ? (
                 <img 
                   src="./sovrab.jpg" 
                   alt="SOVRAB ROY" 
                   className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                   onError={() => setImgError(true)}
                 />
               ) : (
                 <span className="text-5xl md:text-6xl font-black text-white tracking-tighter">SR</span>
               )}
            </div>
          </div>
          
          <div className="flex flex-col items-center relative z-10">
            <div className="flex items-center gap-2 mb-4 bg-indigo-50 dark:bg-indigo-950/40 px-6 py-2.5 rounded-full border border-indigo-100/50 dark:border-indigo-900/50 shadow-sm">
               <Code2 className="w-4 h-4 text-indigo-500" />
               <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.25em]">LEAD DEVELOPER</span>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tighter mb-2 uppercase">SOVRAB ROY</h3>
            <p className="text-xs md:text-sm font-bold text-slate-400 dark:text-slate-500 mb-10 max-w-[280px] leading-relaxed italic opacity-80">
              "রাজবাড়ী জেলার প্রতিটি নাগরিকের জন্য সেরা ডিজিটাল সেবা নিশ্চিত করাই আমার লক্ষ্য।"
            </p>
            
            <div className="flex gap-4">
              <a href="https://www.facebook.com/sovrab.roy.2025/" target="_blank" className="p-4 md:p-5 bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-[1.5rem] md:rounded-[1.8rem] shadow-sm hover:scale-110 transition-all border border-slate-100 dark:border-slate-800">
                <Facebook className="w-5 h-5 md:w-6 md:h-6" />
              </a>
              <a href="https://www.linkedin.com/in/sourav-roy-88a353272/" target="_blank" className="p-4 md:p-5 bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-[1.5rem] md:rounded-[1.8rem] shadow-sm hover:scale-110 transition-all border border-slate-100 dark:border-slate-800">
                <Linkedin className="w-5 h-5 md:w-6 md:h-6" />
              </a>
              <a href="mailto:sovrabroy@gmail.com" className="p-4 md:p-5 bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-[1.5rem] md:rounded-[1.8rem] shadow-sm hover:scale-110 transition-all border border-slate-100 dark:border-slate-800">
                <Mail className="w-5 h-5 md:w-6 md:h-6" />
              </a>
              <a href="https://v0-sovrab-roy-portfolio.vercel.app/" target="_blank" className="p-4 md:p-5 bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 rounded-[1.5rem] md:rounded-[1.8rem] shadow-sm hover:scale-110 transition-all border border-slate-100 dark:border-slate-800">
                <ExternalLink className="w-5 h-5 md:w-6 md:h-6" />
              </a>
            </div>

            <div className="mt-14 flex items-center gap-2 text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.6em]">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" /> Made For Rajbari
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (showLogin) return <AdminLogin onSuccess={onLoginSuccess} onCancel={() => setShowLogin(false)} />;
    if (isAdmin) return <AdminPanel onLogout={() => setIsAdmin(false)} />;
    if (activeCategory === 'map_explore') return <MapView />;
    if (activeCategory === 'ai_chat') return <AIChat />;
    if (activeCategory) return <CategoryView category={activeCategory as Category} onBack={() => setActiveCategory(null)} />;
    return renderHome();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col w-full max-w-lg mx-auto shadow-2xl relative transition-colors duration-300 overflow-x-hidden">
      {(activeCategory || isAdmin) && !showLogin && (
        <header className="glass sticky top-0 z-50 px-6 md:px-8 py-6 md:py-8 flex items-center gap-4 md:gap-6 border-b border-white/20 dark:border-slate-800 transition-colors shadow-sm">
          <button 
            onClick={() => { setActiveCategory(null); setIsAdmin(false); }}
            className="p-3 md:p-4 bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[1.8rem] shadow-xl text-slate-600 dark:text-slate-300 active:scale-90 transition-all"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-white tracking-tighter truncate uppercase">
              {isAdmin ? 'অ্যাডমিন প্যানেল' : activeCategory === 'ai_chat' ? 'AI চ্যাট অ্যাসিস্ট্যান্ট' : activeCategory === 'map_explore' ? 'ম্যাপ এক্সপ্লোরার' : CATEGORIES.find(c => c.id === activeCategory)?.title}
            </h1>
            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.5em]">District Portal</p>
          </div>
          <button 
            onClick={toggleDarkMode}
            className="p-3 md:p-4 bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[1.8rem] shadow-xl text-indigo-600 dark:text-indigo-400"
          >
            {isDark ? <Sun className="w-5 h-5 md:w-6 md:h-6" /> : <Moon className="w-5 h-5 md:w-6 md:h-6" />}
          </button>
        </header>
      )}

      <main className="flex-1 overflow-y-auto no-scrollbar w-full">
        {renderContent()}
      </main>

      {!showLogin && (
        <div className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[100]">
          <nav className="glass p-4 md:p-5 rounded-[3rem] md:rounded-[4rem] premium-shadow border border-white/50 dark:border-slate-800/50 flex justify-between items-center px-8 md:px-10 shadow-3xl backdrop-blur-3xl">
            <button 
              onClick={() => { setActiveCategory(null); setIsAdmin(false); }}
              className={`p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] transition-all duration-500 ${!activeCategory && !isAdmin ? 'bg-indigo-600 text-white shadow-3xl scale-110' : 'text-slate-400 hover:text-indigo-600'}`}
            >
              <HomeIcon className="w-6 h-6 md:w-7 md:h-7" />
            </button>
            <button 
              onClick={() => setActiveCategory('map_explore')}
              className={`p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] transition-all duration-500 ${activeCategory === 'map_explore' ? 'bg-indigo-600 text-white shadow-3xl scale-110' : 'text-slate-400 hover:text-indigo-600'}`}
            >
              <Compass className="w-6 h-6 md:w-7 md:h-7" />
            </button>
            <button 
              onClick={() => setActiveCategory('ai_chat')}
              className={`p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] transition-all duration-500 ${activeCategory === 'ai_chat' ? 'bg-indigo-600 text-white shadow-3xl scale-110' : 'text-slate-400 hover:text-indigo-600'}`}
            >
              <MessageSquare className="w-6 h-6 md:w-7 md:h-7" />
            </button>
            <button 
              onClick={handleAdminClick}
              className={`p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] transition-all duration-500 ${isAdmin ? 'bg-indigo-600 text-white shadow-3xl scale-110' : 'text-slate-400 hover:text-indigo-600'}`}
            >
              <Settings className="w-6 h-6 md:w-7 md:h-7" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default App;
