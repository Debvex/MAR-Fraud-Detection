import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  History,
  CheckCircle,
  Clock,
} from "lucide-react";
import { fetchActivityFeed } from "./FetchSummary";

const ActivityFeed = ({ refreshKey = 0 }) => {
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
  }, [refreshKey]);

  const activities = data?.map((item) => {
    const riskScore = Number(item.risk_score ?? 0);
    const reviewStatus = item.review_status
      ? item.review_status.replaceAll("_", " ")
      : "pending review";

    return {
      id: item.id,
      title: `${item.student_name} uploaded certificate`,
      subtitle: `${item.file_name} • Risk: ${riskScore}%`,
      status: reviewStatus,
      time: new Date(item.created_at).toLocaleString(),
      bgColor: riskScore > 70 ? "bg-red-500/10" : "bg-green-500/10",
      color: riskScore > 70 ? "text-red-400" : "text-green-400",
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
        {activities?.length === 0 && (
          <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/10 text-sm text-outline">
            No submissions yet. Upload a certificate to generate the first risk snapshot.
          </div>
        )}
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
