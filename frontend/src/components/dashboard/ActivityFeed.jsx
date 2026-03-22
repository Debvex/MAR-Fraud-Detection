import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { History, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { fetchActivityFeed } from "./FetchSummary";

const ActivityFeed = ({ refreshKey = 0, searchQuery = "" }) => {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allActivities = await fetchActivityFeed();
        setData(allActivities);
        console.log("Fetched activity feed:", allActivities);
      } catch (error) {
        console.error("Error fetching activity feed:", error);
      }
    };

    fetchData();
  }, [refreshKey]);

  useEffect(() => {
    document.body.style.overflow = selectedItem ? "hidden" : "auto";
  }, [selectedItem]);

  const activities = data?.map((item) => {
    const riskScore = Number(item.risk_score ?? 0);
    const reviewStatus = item.review_status
      ? item.review_status.replaceAll("_", " ")
      : "pending review";

    return {
      id: item.id,
      raw: item,
      title: `${item.student_name} uploaded certificate`,
      subtitle: `${item.file_name} • Risk: ${riskScore}%`,
      status: reviewStatus,
      time: new Date(item.created_at).toLocaleString(),
      bgColor: riskScore > 50 ? "bg-red-500/10" : "bg-green-500/10",
      color: riskScore > 50 ? "text-red-400" : "text-green-400",
      icon: item.processing_status === "completed" ? CheckCircle : Clock,
      searchableText: [
        item.student_name,
        item.student_id,
        item.file_name,
        item.claimed_category,
        reviewStatus,
        `${riskScore}`,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    };
  });

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredActivities = (activities || []).filter((item) =>
    normalizedQuery.length === 0
      ? true
      : item.searchableText.includes(normalizedQuery),
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <History size={20} /> Recent Activity Feed
      </h3>

      <div className="space-y-3">
        {filteredActivities.length === 0 && (
          <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/10 text-sm text-outline">
            {normalizedQuery.length === 0
              ? "No submissions yet. Upload a certificate to generate the first risk snapshot."
              : "No matching submissions found for your search."}
          </div>
        )}
        {filteredActivities.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-high transition-all border border-outline-variant/5 hover:border-outline-variant/20"
            onClick={() => setSelectedItem(item.raw)}
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
              <p className="text-[10px] text-gray-300 font-medium">
                {item.time}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blur Background */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={() => setSelectedItem(null)}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 w-[95%] max-w-3xl bg-linear-to-br from-[#1e1e2f] to-[#151521] rounded-2xl p-6 shadow-2xl border border-white/10"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-white">
                Submission Details
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Info label="Name" value={selectedItem.student_name} />
              <Info label="Student ID" value={selectedItem.student_id} />
              <Info label="Category" value={selectedItem.claimed_category} />
              <Info label="Points" value={selectedItem.claimed_points} />
              <Info label="Decision" value={selectedItem.decision} />
              <Info label="Risk" value={`${selectedItem.risk_score}%`} />
              <Info
                label="Confidence"
                value={selectedItem.decision_confidence}
              />
              <Info label="Status" value={selectedItem.processing_status} />
            </div>

            {/* File Link */}
            <div className="mt-5">
              <a
                href={`http://localhost:8000/uploads/${selectedItem.id}.${selectedItem.file_name.split(".").pop()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-400 hover:underline"
              >
                <ExternalLink size={16} /> Open File
              </a>
            </div>

            {/* Explanation */}
            <div className="mt-5 p-3 bg-black/30 rounded-lg">
              <p className="text-white font-semibold mb-1">Explanation</p>
              <p className="text-xs text-gray-300 leading-relaxed">
                {selectedItem.explanation}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-white/5 p-3 rounded-lg border border-white/10">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm text-white font-medium">{value || "-"}</p>
  </div>
);

export default ActivityFeed;
