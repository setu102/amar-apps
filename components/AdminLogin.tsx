
import React, { useState, useEffect } from 'react';
import { Lock, Delete, ShieldCheck } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const correctPin = '121355';

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  useEffect(() => {
    if (pin.length === 6) {
      if (pin === correctPin) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => setPin(''), 500);
      }
    }
  }, [pin, onSuccess]);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 dark:bg-slate-950 flex flex-col animate-slide-up transition-colors duration-300">
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className={`w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30 ${error ? 'animate-bounce' : ''}`}>
          <Lock className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">অ্যাডমিন এক্সেস</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-10 text-center">প্যানেলে প্রবেশ করতে আপনার ৬-ডিজিটের গোপন পিন নম্বরটি দিন</p>

        <div className="flex gap-3 mb-12">
          {[1, 2, 3, 4, 5, 6].map((_, i) => (
            <div 
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                pin.length > i 
                ? 'bg-indigo-600 border-indigo-600 scale-125' 
                : 'border-slate-300 dark:border-slate-700'
              } ${error ? 'border-rose-500 bg-rose-500' : ''}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 w-full max-w-xs">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-2xl font-bold text-slate-700 dark:text-slate-300 active:bg-slate-100 dark:active:bg-slate-800 active:scale-90 transition-all premium-shadow"
            >
              {num}
            </button>
          ))}
          <button 
            onClick={onCancel}
            className="w-16 h-16 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold active:scale-90 transition-all"
          >
            বাতিল
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-2xl font-bold text-slate-700 dark:text-slate-300 active:bg-slate-100 dark:active:bg-slate-800 active:scale-90 transition-all premium-shadow"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full flex items-center justify-center text-rose-500 active:scale-90 transition-all"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <div className="p-8 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-300 dark:text-slate-700 text-xs font-bold uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" /> Secure Admin Access
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
