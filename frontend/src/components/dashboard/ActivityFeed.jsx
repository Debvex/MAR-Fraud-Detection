import React, { use, useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Fingerprint,
  FileText,
  Landmark,
  AlertTriangle,
  History,
  CheckCircle,
  Clock,
} from "lucide-react";
import { fetchActivityFeed } from "./FetchSummary";

const ActivityFeed = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Simulate fetching activity data
    const fetchData = async () => {
      try {
        const allActivities = await fetchActivityFeed();
        console.log("Fetched Activity Data:", allActivities);
        setData(allActivities);
      } catch (error) {
        console.error("Error fetching activity feed:", error);
      }
    };

    fetchData();
  }, []);

  const activities = data?.map((item) => {
    return {
      id: item.id,
      title: `${item.student_name} uploaded certificate`,
      subtitle: `${item.file_name} • Risk: ${item.risk_score}%`,
      status: item.review_status.replaceAll("_", " "),
      time: new Date(item.created_at).toLocaleString(),
      bgColor: item.risk_score > 70 ? "bg-red-500/10" : "bg-green-500/10",
      color: item.risk_score > 70 ? "text-red-400" : "text-green-400",
      icon: item.processing_status === "completed" ? CheckCircle : Clock,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <History size={20} className="text-primary" />
          Recent Activity Feed
        </h3>
        <button className="text-xs text-primary font-semibold hover:underline tracking-tight">
          Export Full Log
        </button>
      </div>

      <div className="space-y-3">
        {activities?.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-high transition-all border border-outline-variant/5 hover:border-outline-variant/20"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center ${item.color}`}
              >
                <item.icon size={24} />
              </div>

              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  {item.title}
                </h4>
                <p className="text-xs text-outline">{item.subtitle}</p>
              </div>
            </div>

            <div className="text-right">
              <div
                className={`px-2.5 py-1 ${item.bgColor} ${item.color} text-[10px] font-black rounded-lg uppercase tracking-widest mb-1`}
              >
                {item.status}
              </div>
              <p className="text-[10px] text-outline-variant font-medium">
                {item.time}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
