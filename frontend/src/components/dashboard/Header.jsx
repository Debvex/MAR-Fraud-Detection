import React from 'react';
import { Search, Bell, Zap } from 'lucide-react';

const Header = () => {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full px-4 sm:px-8 py-4 sm:h-20 bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/5 gap-4 sm:gap-0">
      <div className="flex items-center gap-4 sm:gap-12 w-full sm:w-auto">
        {/* Search Bar - Hidden on mobile when space is limited */}
        <div className="hidden lg:flex items-center bg-surface-container px-3 sm:px-4 py-2 rounded-xl gap-3 flex-1 sm:flex-none sm:w-96 border border-outline-variant/10">
          <Search size={18} className="text-outline flex-shrink-0" />
          <input 
            className="bg-transparent border-none focus:outline-none text-sm text-white w-full placeholder:text-outline/50" 
            placeholder="Search document IDs..."
            type="text"
          />
        </div>
        
        {/* Mobile Search - Simplified for small screens */}
        <div className="lg:hidden flex items-center bg-surface-container px-2 py-2 rounded-lg gap-2 flex-1 border border-outline-variant/10">
          <Search size={16} className="text-outline flex-shrink-0" />
          <input 
            className="bg-transparent border-none focus:outline-none text-xs text-white w-full placeholder:text-outline/50" 
            placeholder="Search..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto justify-end">
        <button className="relative p-2 text-outline hover:text-primary transition-all">
          <Bell size={18} className="sm:w-5 sm:h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-background"></span>
        </button>
        <button className="p-2 text-outline hover:text-primary transition-all hidden sm:block">
          <Zap size={18} className="sm:w-5 sm:h-5" fill="currentColor" />
        </button>
        
        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-surface-high flex items-center justify-center overflow-hidden border border-outline-variant/30 cursor-pointer hover:border-primary transition-all flex-shrink-0">
          <img 
            alt="User profile" 
            src="https://picsum.photos/seed/tech-user/100/100"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
