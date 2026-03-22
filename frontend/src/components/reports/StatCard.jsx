import React from 'react';
import { Icon, LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';


export default function StatCard({ icon, label, value, active }) {
  return (
    <div className={cn(
      "bg-surface p-6 rounded-2xl border border-white/5 flex items-center gap-6 transition-all group hover:border-primary/20",
      active && "border-primary/40 shadow-lg shadow-primary/5"
    )}>
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
        active ? "bg-primary text-[#001a41]" : "bg-[#32353c] text-[#e1e2eb]/40 group-hover:text-primary"
      )}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e1e2eb]/40 mb-1">{label}</div>
        <div className="text-xl font-black text-[#e1e2eb] tracking-tighter">{value}</div>
      </div>
    </div>
  );
}
