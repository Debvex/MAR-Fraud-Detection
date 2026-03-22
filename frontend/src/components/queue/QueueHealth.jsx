import React from 'react';
import { BarChart2, Info } from 'lucide-react';
import { motion } from 'motion/react';

function QueueHealth() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-surface border border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h3 className="text-[8px] sm:text-xs font-bold text-primary uppercase tracking-[0.2em]">Processing Status</h3>
        <BarChart2 size={14} className="text-primary sm:w-[16px] sm:h-[16px]" />
      </div>

      <div className="space-y-6 sm:space-y-8 flex-1">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[10px] sm:text-xs text-white/40">Verification Accuracy</span>
            <span className="text-xs sm:text-sm font-bold text-primary">98.4%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '98.4%' }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-primary"
            />
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[10px] sm:text-xs text-white/40">LLM Logic Load</span>
            <span className="text-xs sm:text-sm font-bold text-tertiary">42%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '42%' }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="h-full bg-tertiary"
            />
          </div>
        </div>

        <div className="mt-auto p-3 sm:p-4 bg-[#0b0e14] rounded-xl flex gap-2 sm:gap-3 border border-white/5">
          <Info size={16} className="text-tertiary shrink-0 sm:w-[18px] sm:h-[18px]" />
          <p className="text-[9px] sm:text-[11px] leading-relaxed text-white/60">
            AI detected a spike in <span className="text-white font-bold">Invoices</span>. Allocating additional GPU nodes for OCR.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default QueueHealth;
