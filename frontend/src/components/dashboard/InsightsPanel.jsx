import React from 'react';
import { motion } from 'motion/react';

const InsightsPanel = () => {
  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-6 rounded-2xl relative overflow-hidden"
      >
        <div className="relative z-10">
          <h3 className="text-[10px] font-black text-primary mb-4 uppercase tracking-[0.2em]">Intelligence Insight</h3>
          <p className="text-white/80 text-sm leading-relaxed mb-8">
            The MAR Fraud Detection has detected a <span className="text-secondary font-bold">12% increase</span> in processing efficiency since the last neural weights update.
          </p>
          
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] uppercase font-black text-outline tracking-widest">
              <span>Confidence Level</span>
              <span className="text-secondary">98.4%</span>
            </div>
            <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '98.4%' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-secondary shadow-[0_0_10px_rgba(152,181,243,0.5)]"
              />
            </div>
          </div>
        </div>
        
        {/* Decorative glow */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 blur-[60px] rounded-full"></div>
      </motion.div>

      <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/10">
        <h3 className="text-[10px] font-black text-outline uppercase tracking-[0.2em] mb-6">Queue Priority</h3>
        <div className="space-y-5">
          {[
            { label: 'Urgent Audits', count: '12', color: 'bg-error' },
            { label: 'Standard KYC', count: '28', color: 'bg-tertiary' },
            { label: 'Batch Archive', count: '03', color: 'bg-secondary' }
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${item.color} shadow-lg shadow-current/20`}></div>
              <span className="text-xs font-bold text-white/70 flex-1 tracking-tight">{item.label}</span>
              <span className="text-xs font-mono text-outline font-bold">{item.count}</span>
            </div>
          ))}
        </div>
        
        <motion.button 
          whileHover={{ backgroundColor: 'var(--color-surface-high)' }}
          className="w-full mt-8 py-3 bg-surface-high/50 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-outline-variant/10"
        >
          Manage All Queues
        </motion.button>
      </div>
    </div>
  );
};

export default InsightsPanel;