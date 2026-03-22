import React from "react";
import {
  FileText,
  FileCode,
  Image as ImageIcon,
  AlertTriangle,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";

const queueData = [
  {
    id: 1,
    name: "INV-2024-001.pdf",
    meta: "2.4 MB • Uploaded 2m ago",
    type: "Vendor Invoice",
    status: "Validating",
    statusColor: "text-[#adc6ff]",
    dotColor: "bg-[#adc6ff]",
    confidence: 99,
    action: "Review",
    icon: FileText,
  },
  {
    id: 2,
    name: "Contract_Alpha_v2.docx",
    meta: "12.1 MB • Uploaded 5m ago",
    type: "Legal Contract",
    status: "Extracting Entities",
    statusColor: "text-white/60",
    dotColor: "bg-white/20",
    confidence: 82,
    action: "Cancel",
    icon: FileCode,
    isProcessing: true,
  },
  {
    id: 3,
    name: "Receipt_Unknown.jpg",
    meta: "890 KB • Uploaded 12m ago",
    type: "Unclassified",
    status: "Needs Attention",
    statusColor: "text-[#ffb595]",
    dotColor: "bg-[#ffb595]",
    confidence: 45,
    action: "Fix",
    icon: AlertTriangle,
    iconColor: "text-[#ffb595]",
  },
  {
    id: 4,
    name: "Passport_Scan_X.png",
    meta: "4.2 MB • Uploaded 15m ago",
    type: "Identity Document",
    status: "OCR Processing",
    statusColor: "text-white/40",
    dotColor: "bg-white/10",
    confidence: 92,
    action: "Details",
    icon: ImageIcon,
  },
];

function ProcessingTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-surface border border-white/5 rounded-2xl overflow-hidden"
    >
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/5 bg-surface-container">
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <h3 className="font-bold text-sm sm:text-base text-white">Active Processing Queue</h3>
          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] sm:text-[10px] font-bold rounded uppercase tracking-wider">
            1,204 Remaining
          </span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all flex-shrink-0">
            <Filter size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all flex-shrink-0">
            <RefreshCw size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-2 p-4">
        {queueData.map((row) => (
          <motion.div
            key={row.id}
            className="bg-surface-high border border-white/5 rounded-lg p-4 space-y-3"
          >
            {/* Document Name and Icon */}
            <div className="flex items-start gap-3">
              <row.icon
                className={`shrink-0 mt-1 ${row.iconColor || "text-white/20"}`}
                size={20}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">
                  {row.name}
                </p>
                <p className="text-[10px] text-white/40">{row.meta}</p>
              </div>
            </div>

            {/* Type Badge */}
            <span
              className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                row.type === "Unclassified"
                  ? "bg-tertiary/10 text-tertiary"
                  : "bg-white/5 text-white/60"
              }`}
            >
              {row.type}
            </span>

            {/* Status and Progress */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${row.dotColor} ${
                    row.status === "Validating" ? "animate-pulse" : ""
                  }`}
                />
                <span className={`text-xs font-medium ${row.statusColor}`}>
                  {row.status}
                </span>
              </div>
              {row.isProcessing && (
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative">
                  <motion.div
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 w-1/2 bg-linear-to-r from-transparent via-primary/20 to-transparent"
                  />
                </div>
              )}
            </div>

            {/* Confidence and Action */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full ${
                      row.confidence < 50 ? "bg-tertiary" : "bg-primary"
                    }`}
                    style={{ width: `${row.confidence}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-white">
                  {row.confidence}% Confidence
                </span>
              </div>
              <button
                className={`text-xs font-bold transition-all whitespace-nowrap ${
                  row.action === "Fix"
                    ? "px-3 py-1 bg-tertiary/20 text-tertiary rounded hover:bg-tertiary/30"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {row.action}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0b0e14]/50">
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-white/40 tracking-[0.15em]">
                Document Name
              </th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-white/40 tracking-[0.15em]">
                Type
              </th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-white/40 tracking-[0.15em]">
                Current Status
              </th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-white/40 tracking-[0.15em]">
                Confidence
              </th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-white/40 tracking-[0.15em] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {queueData.map((row) => (
              <tr
                key={row.id}
                className="group hover:bg-white/2 transition-colors"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <row.icon
                      className={[
                        "shrink-0",
                        row.iconColor || "text-white/20",
                      ].join(" ")}
                      size={20}
                    />
                    <div>
                      <p className="text-sm font-bold text-white mb-0.5">
                        {row.name}
                      </p>
                      <p className="text-[11px] text-white/40">{row.meta}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      row.type === "Unclassified"
                        ? "bg-tertiary/10 text-tertiary"
                        : "bg-white/5 text-white/60"
                    }`}
                  >
                    {row.type}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${row.dotColor} ${
                          row.status === "Validating" ? "animate-pulse" : ""
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${row.statusColor}`}
                      >
                        {row.status}
                      </span>
                    </div>
                    {row.isProcessing && (
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative">
                        <motion.div
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="absolute inset-0 w-1/2 bg-linear-to-r from-transparent via-primary/20 to-transparent"
                        />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          row.confidence < 50 ? "bg-tertiary" : "bg-primary"
                        }`}
                        style={{ width: `${row.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white">
                      {row.confidence}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <button
                    className={`text-xs font-bold transition-all ${
                      row.action === "Fix"
                        ? "px-4 py-1.5 bg-tertiary/20 text-tertiary rounded-lg hover:bg-tertiary/30"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    {row.action}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-[#0b0e14]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 border-t border-white/5">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em]">
          Showing 1-12 of 1,204
        </p>
        <div className="flex items-center gap-1">
          <button
            disabled
            className="p-1.5 text-white/20 bg-white/5 rounded-lg"
          >
            <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button className="p-1.5 text-white/40 hover:text-white bg-white/5 rounded-lg transition-all">
            <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default ProcessingTable;
