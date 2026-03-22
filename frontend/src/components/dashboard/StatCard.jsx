import React from "react";
import { motion } from "motion/react";
import { HdIcon } from "lucide-react";

const StatCard = ({
  icon: Icon,
  label,
  value,
  trend,
  subtext,
  progress,
  segments,
  avatars,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface p-4 sm:p-5 md:p-6 rounded-2xl relative overflow-hidden group border border-outline-variant/10 hover:border-primary/30 transition-all"
    >
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <HdIcon size={80} className="sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px]" />
      </div>

      <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-outline uppercase tracking-widest mb-3 md:mb-4">
        {label}
      </p>

      <div className="flex items-end gap-2 sm:gap-3">
        <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white">{value}</span>
        {trend && (
          <span className="text-[10px] sm:text-xs text-secondary font-medium mb-1">
            {trend}
          </span>
        )}
        {subtext && (
          <span className="text-[9px] sm:text-xs text-outline font-medium mb-1">
            {subtext}
          </span>
        )}
      </div>

      {progress !== undefined && (
        <div className="mt-4 md:mt-6 h-1.5 w-full bg-surface-high rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary to-primary-container"
          />
        </div>
      )}

      {segments && (
        <div className="mt-4 md:mt-6 flex gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= 4 ? "bg-primary" : "bg-surface-high"}`}
            />
          ))}
        </div>
      )}

      {avatars && (
        <div className="mt-4 md:mt-6 flex items-center gap-2 md:gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-6 sm:w-7 h-6 sm:h-7 rounded-full border-2 border-surface ${
                  i === 1
                    ? "bg-surface-high"
                    : i === 2
                      ? "bg-primary"
                      : "bg-secondary"
                }`}
              />
            ))}
          </div>
          <span className="text-[8px] sm:text-[10px] text-outline font-medium uppercase tracking-wider">
            Processing by AI Cluster-7
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
