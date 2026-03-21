import React from 'react';
import { Search, Bell, Zap } from 'lucide-react';

function TopBar() {
  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-8 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Search intel..."
            className="w-full bg-[#0b0e14] border-none rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-white/40 hover:text-white transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-tertiary rounded-full border-2 border-background"></span>
        </button>
        <button className="p-2 text-white/40 hover:text-white transition-colors">
          <Zap size={20} />
        </button>
        <div className="ml-2 w-8 h-8 rounded-full overflow-hidden border border-white/10">
          <img 
            src="https://picsum.photos/seed/user/100/100" 
            alt="User" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
}

export default TopBar;
