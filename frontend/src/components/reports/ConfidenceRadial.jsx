import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function ConfidenceRadial() {
  const percentage = 88;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-surface p-8 rounded-2xl border border-white/5 relative overflow-hidden group h-full flex flex-col">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
        <ShieldCheck size={120} />
      </div>

      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-10">AI Confidence Index</h3>

      <div className="flex flex-col items-center justify-center flex-1">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-[#32353c]"
              cx="50"
              cy="50"
              fill="none"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
            />
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-primary drop-shadow-[0_0_12px_rgba(173,198,255,0.4)]"
              cx="50"
              cy="50"
              fill="none"
              r={radius}
              stroke="currentColor"
              strokeDasharray={circumference}
              strokeLinecap="round"
              strokeWidth="8"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-[#e1e2eb] tracking-tighter">{percentage}%</span>
            <span className="text-[10px] text-primary uppercase font-bold tracking-widest mt-1">+2.4% trend</span>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-[#e1e2eb]/40 leading-relaxed px-4">
          Confidence score based on 12.4k document matches across high-priority flows.
        </p>
      </div>
    </div>
  );
}
