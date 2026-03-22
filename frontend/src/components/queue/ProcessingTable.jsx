import React, { useEffect, useState } from "react";
import {
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { fetchActivityFeed } from "../dashboard/FetchSummary";

function ProcessingTable({ refreshKey = 0 }) {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [queryFilter, setQueryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  const fetchData = async () => {
    try {
      const allActivities = await fetchActivityFeed();
      setData(allActivities);
      console.log("Fetched activity feed:", allActivities);
    } catch (error) {
      console.error("Error fetching activity feed:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

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
      riskScore,
      time: new Date(item.created_at).toLocaleString(),
      bgColor: riskScore > 50 ? "bg-red-500/10" : "bg-green-500/10",
      color: riskScore > 50 ? "text-red-400" : "text-green-400",
      icon: item.processing_status === "completed" ? CheckCircle : Clock,
    };
  });

  const statusOptions = Array.from(
    new Set((activities || []).map((item) => item.status).filter(Boolean)),
  );

  const filteredActivities = (activities || []).filter((item) => {
    const normalizedQuery = queryFilter.trim().toLowerCase();
    const matchesQuery =
      normalizedQuery.length === 0 ||
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.subtitle.toLowerCase().includes(normalizedQuery);

    const matchesStatus =
      statusFilter === "all" ||
      item.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesRisk =
      riskFilter === "all" ||
      (riskFilter === "low" && item.riskScore <= 30) ||
      (riskFilter === "medium" && item.riskScore > 30 && item.riskScore <= 70) ||
      (riskFilter === "high" && item.riskScore > 70);

    return matchesQuery && matchesStatus && matchesRisk;
  });

  const hasActiveFilters =
    queryFilter.trim().length > 0 ||
    statusFilter !== "all" ||
    riskFilter !== "all";

  const clearFilters = () => {
    setQueryFilter("");
    setStatusFilter("all");
    setRiskFilter("all");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-surface border border-white/5 rounded-2xl overflow-hidden"
    >
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/5 bg-surface-container">
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <h3 className="font-bold text-sm sm:text-base text-white">
            Active Processing Queue
          </h3>
          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] sm:text-[10px] font-bold rounded uppercase tracking-wider">
            {filteredActivities.length} Of {activities?.length || 0}
          </span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setShowFilters((previous) => !previous)}
            className={`p-2 rounded-lg transition-all shrink-0 ${
              showFilters || hasActiveFilters
                ? "text-primary bg-primary/10 border border-primary/30"
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            <Filter size={16} className="sm:w-4.5 sm:h-4.5" />
          </button>
          <button
            onClick={fetchData}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all shrink-0"
          >
            <RefreshCw size={16} className="sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="px-4 sm:px-6 py-4 border-b border-white/5 bg-[#0b0e14]/60 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={queryFilter}
              onChange={(event) => setQueryFilter(event.target.value)}
              placeholder="Search by name, file, or risk..."
              className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-white placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={riskFilter}
              onChange={(event) => setRiskFilter(event.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Risk Bands</option>
              <option value="low">Low (0-30)</option>
              <option value="medium">Medium (31-70)</option>
              <option value="high">High (71-100)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-outline">
              Showing {filteredActivities.length} Result(s)
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-outline-variant/30 text-outline hover:text-white hover:border-outline-variant/60 transition-all"
              >
                <X size={14} />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 p-4 bg-linear-to-b from-[#0f141d]/20 to-transparent">
        {filteredActivities.length === 0 && (
          <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/10 text-sm text-outline">
            No submissions match the current filters.
          </div>
        )}
        {filteredActivities.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden p-4 rounded-2xl bg-linear-to-br from-surface-container to-surface border border-outline-variant/20 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)] hover:border-primary/35 hover:shadow-[0_14px_36px_-18px_rgba(73,142,255,0.35)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedItem(item.raw)}
          >
            <div className="absolute -right-12 -top-12 w-28 h-28 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-11 h-11 rounded-xl ${item.bgColor} flex items-center justify-center ${item.color} ring-1 ring-white/10 shadow-inner`}
                >
                  <item.icon size={20} />
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white tracking-tight truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-outline truncate mt-0.5">{item.subtitle}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div
                  className={`px-2.5 py-1 ${item.bgColor} ${item.color} text-[10px] font-bold rounded-full uppercase tracking-[0.12em] border border-current/25 mb-1`}
                >
                  {item.status}
                </div>
                <p className="text-[10px] text-outline-variant font-medium">
                  {item.time}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop List View */}
      <div className="hidden md:block p-5 lg:p-6 space-y-3 bg-linear-to-b from-[#0f141d]/20 to-transparent">
        {filteredActivities.length === 0 && (
          <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/10 text-sm text-outline">
            No submissions match the current filters.
          </div>
        )}

        {filteredActivities.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="group relative overflow-hidden p-4 lg:p-5 rounded-2xl bg-linear-to-r from-surface-container/95 to-surface/95 border border-outline-variant/20 shadow-[0_12px_34px_-20px_rgba(0,0,0,0.95)] hover:border-primary/35 hover:shadow-[0_18px_40px_-22px_rgba(73,142,255,0.35)] transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedItem(item.raw)}
          >
            <div className="absolute -right-14 -top-14 w-36 h-36 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center ${item.color} ring-1 ring-white/10`}
                >
                  <item.icon size={22} />
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm lg:text-base font-semibold text-white tracking-tight truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-outline mt-0.5 truncate">{item.subtitle}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div
                  className={`inline-flex px-3 py-1.5 ${item.bgColor} ${item.color} text-[10px] font-bold rounded-full uppercase tracking-[0.14em] border border-current/25 mb-1.5`}
                >
                  {item.status}
                </div>
                <p className="text-[10px] text-outline-variant font-medium">
                  {item.time}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-[#0b0e14]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 border-t border-white/5">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em]">
          Showing {filteredActivities.length} Of {activities?.length || 0}
        </p>
        <div className="flex items-center gap-1">
          <button
            disabled
            className="p-1.5 text-white/20 bg-white/5 rounded-lg"
          >
            <ChevronLeft size={16} className="sm:w-4.5 sm:h-4.5" />
          </button>
          <button className="p-1.5 text-white/40 hover:text-white bg-white/5 rounded-lg transition-all">
            <ChevronRight size={16} className="sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default ProcessingTable;
