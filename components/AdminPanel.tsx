
import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Globe,
  Zap,
  Info,
  LogOut
} from 'lucide-react';
import DevGuide from './DevGuide';

// Fix: Defined AdminPanelProps to accept onLogout passed from App.tsx
interface AdminPanelProps {
  onLogout: () => void;
}

// Fix: Updated component signature to receive props
const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  return (
    <div className="p-6 animate-slide-up pb-32 max-w-lg mx-auto">
      <div className="mb-8 p-8 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/20">
                <ShieldCheck className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">অ্যাডমিন ড্যাশবোর্ড</h2>
                <p className="text-indigo-100 text-[10px] font-bold opacity-80 uppercase tracking-[0.3em]">Smart System Management</p>
              </div>
            </div>
            {/* Added Logout Button for better UX and prop utilization */}
            <button 
              onClick={onLogout}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all text-white"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        <Activity className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 rotate-12" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 premium-shadow">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-2xl w-fit mb-4">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Status</h4>
          <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">Active</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 premium-shadow">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 rounded-2xl w-fit mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Model</h4>
          <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">Gemini 3</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 premium-shadow mb-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xl font-black dark:text-white tracking-tighter uppercase">Cloud Configuration</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Environment Secured</p>
          </div>
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
           <div className="flex items-start gap-3">
             <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
             <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">
               এপিআই কী এখন সার্ভার সাইড সিক্রেট হিসেবে এনভায়রনমেন্ট ভেরিয়েবলে কনফিগার করা আছে। এটি এখন আগের চেয়ে অনেক বেশি নিরাপদ এবং অটোমেটেড।
             </p>
           </div>
        </div>
      </div>

      <DevGuide />
    </div>
  );
};

export default AdminPanel;
