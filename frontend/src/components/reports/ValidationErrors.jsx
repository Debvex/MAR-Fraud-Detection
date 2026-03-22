import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const errors = [
  { label: 'Name Mismatch', value: 42, color: '#ffb4ab' },
  { label: 'Missing Fields', value: 28, color: '#ffb595' },
  { label: 'OCR Unreadable', value: 15, color: '#8b90a0' },
  { label: 'Signature Absent', value: 10, color: '#8b90a0' },
];

export function ValidationErrors() {
  return (
    <div className="bg-surface p-8 rounded-2xl border border-white/5 h-full flex flex-col">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-10">Common Validation Errors</h3>
      
      <div className="space-y-8 flex-1">
        {errors.map((error, idx) => (
          <div key={error.label} className="group">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-[#e1e2eb] tracking-tight">{error.label}</span>
              <span className="text-xs font-bold text-[#e1e2eb]/40">{error.value}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#32353c] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${error.value}%` }}
                transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: error.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-white/5">
        <button className="w-full text-primary text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-80 transition-opacity group">
          View Full Error Log
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
