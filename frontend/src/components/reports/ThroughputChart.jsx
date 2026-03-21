import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'MON', successful: 80, review: 20 },
  { name: 'TUE', successful: 65, review: 35 },
  { name: 'WED', successful: 90, review: 10 },
  { name: 'THU', successful: 75, review: 25 },
  { name: 'FRI', successful: 85, review: 15 },
  { name: 'SAT', successful: 40, review: 60 },
  { name: 'SUN', successful: 55, review: 45 },
];

export function ThroughputChart() {
  return (
    <div className="bg-surface p-8 rounded-2xl border border-white/5 h-full flex flex-col">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Processing Throughput</h3>
        <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
          <span className="flex items-center gap-2 text-primary">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(173,198,255,0.6)]" /> Successful
          </span>
          <span className="flex items-center gap-2 text-tertiary">
            <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(255,181,149,0.6)]" /> Review Required
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-75">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#32353c" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#e1e2eb', opacity: 0.4, fontSize: 10, fontWeight: 700 }} 
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#e1e2eb', opacity: 0.4, fontSize: 10, fontWeight: 700 }} 
            />
            <Tooltip 
              cursor={{ fill: '#32353c', opacity: 0.2 }}
              contentStyle={{ 
                backgroundColor: '#1d2026', 
                border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '12px',
                fontSize: '12px',
                color: '#e1e2eb'
              }}
            />
            <Bar dataKey="successful" stackId="a" radius={[0, 0, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-success-${index}`} fill="#adc6ff" fillOpacity={0.8} />
              ))}
            </Bar>
            <Bar dataKey="review" stackId="a" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-review-${index}`} fill="#ffb595" fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
