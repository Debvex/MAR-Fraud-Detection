import React from 'react';
import { Search, Bell, Zap } from 'lucide-react';

function TopBar() {
  return (
    <header className="h-auto sm:h-16 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 py-3 sm:py-0 bg-background/80 backdrop-blur-xl sticky top-0 z-50 gap-3 sm:gap-0">
      <div className="flex items-center gap-2 sm:gap-8 flex-1 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 flex-shrink-0" size={16} className="sm:w-[18px] sm:h-[18px]" />
          <input 
            type="text" 
            placeholder="Search intel..."
            className="w-full bg-[#0b0e14] border-none rounded-lg py-2 pl-8 pr-3 text-xs sm:text-sm text-white placeholder:text-white/20 focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
        <button className="p-2 text-white/40 hover:text-white transition-colors relative flex-shrink-0">
          <Bell size={16} className="sm:w-[20px] sm:h-[20px]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-tertiary rounded-full border-2 border-background"></span>
        </button>
        <button className="p-2 text-white/40 hover:text-white transition-colors hidden sm:block flex-shrink-0">
          <Zap size={16} className="sm:w-[20px] sm:h-[20px]" />
        </button>
        <div className="w-8 h-8 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
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
