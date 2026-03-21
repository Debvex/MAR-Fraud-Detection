import React from 'react';
import { Bell, Zap, Search } from 'lucide-react';

export function TopBar() {
  return (
    <header className="h-16 bg-primary border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-12">
        <h2 className="text-xl font-bold tracking-tighter text-[#e1e2eb]">Obsidian Lens</h2>
        <nav className="hidden md:flex items-center gap-8">
          {['Docs', 'Intelligence', 'Flows'].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm font-medium text-[#e1e2eb]/40 hover:text-primary transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#e1e2eb]/20 group-hover:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search intelligence..."
            className="bg-surface border border-white/5 rounded-full pl-10 pr-4 py-1.5 text-xs text-[#e1e2eb] focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all w-64"
          />
        </div>

        <div className="flex items-center gap-4 border-l border-white/10 pl-6">
          <button className="relative text-[#e1e2eb]/40 hover:text-primary transition-colors">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(173,198,255,0.6)]" />
          </button>
          <button className="text-[#e1e2eb]/40 hover:text-primary transition-colors">
            <Zap size={18} />
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 p-px bg-linear-to-br from-primary/40 to-transparent">
            <img
              src="https://picsum.photos/seed/user/100/100"
              alt="User profile"
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
