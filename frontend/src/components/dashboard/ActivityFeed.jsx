import React from 'react';
import { motion } from 'motion/react';
import { Fingerprint, FileText, Landmark, AlertTriangle, History } from 'lucide-react';

const activities = [
  {
    id: 1,
    icon: Fingerprint,
    title: 'ID Verified',
    subtitle: 'Document: #ID-99284 • 0.2s latency',
    status: 'Success',
    time: '2 mins ago',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10'
  },
  {
    id: 2,
    icon: FileText,
    title: 'Tax Form Processing',
    subtitle: 'Document: #TX-44211 • OCR Layer active',
    status: 'In Progress',
    time: '5 mins ago',
    color: 'text-tertiary',
    bgColor: 'bg-tertiary/10'
  },
  {
    id: 3,
    icon: Landmark,
    title: 'Bank Statement Analysis',
    subtitle: 'Document: #BK-7721 • 98% Confidence',
    status: 'Success',
    time: '12 mins ago',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10'
  },
  {
    id: 4,
    icon: AlertTriangle,
    title: 'Validation Error',
    subtitle: 'Document: #ERR-021 • Signature Missing',
    status: 'Flagged',
    time: '18 mins ago',
    color: 'text-error',
    bgColor: 'bg-error/10'
  }
];

const ActivityFeed = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <History size={20} className="text-primary" />
          Recent Activity Feed
        </h3>
        <button className="text-xs text-primary font-semibold hover:underline tracking-tight">Export Full Log</button>
      </div>

      <div className="space-y-3">
        {activities.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-high transition-all border border-outline-variant/5 hover:border-outline-variant/20"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center ${item.color}`}>
                <item.icon size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">{item.title}</h4>
                <p className="text-xs text-outline">{item.subtitle}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`px-2.5 py-1 ${item.bgColor} ${item.color} text-[10px] font-black rounded-lg uppercase tracking-widest mb-1`}>
                {item.status}
              </div>
              <p className="text-[10px] text-outline-variant font-medium">{item.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
