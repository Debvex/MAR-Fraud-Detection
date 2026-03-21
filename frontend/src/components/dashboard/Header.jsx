import React from 'react';
import { Search, Bell, Zap } from 'lucide-react';

const Header = () => {
  return (
    <header className="flex justify-between items-center w-full px-8 h-20 bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/5">
      <div className="flex items-center gap-12">
        <div className="hidden md:flex items-center bg-surface-container px-4 py-2 rounded-xl gap-3 w-96 border border-outline-variant/10">
          <Search size={18} className="text-outline" />
          <input 
            className="bg-transparent border-none focus:outline-none text-sm text-white w-full placeholder:text-outline/50" 
            placeholder="Search document IDs..."
            type="text"
          />
        </div>

      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-outline hover:text-primary transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-background"></span>
        </button>
        <button className="p-2 text-outline hover:text-primary transition-all">
          <Zap size={20} fill="currentColor" />
        </button>
        
        <div className="h-10 w-10 rounded-full bg-surface-high flex items-center justify-center overflow-hidden border border-outline-variant/30 cursor-pointer hover:border-primary transition-all">
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
