import React, { useContext, useEffect, useState } from "react";
import {
  FileText,
  CheckCircle,
  Clock,
  Calendar,
  Download,
  Database,
  Sparkles,
  Brain,
} from "lucide-react";
import { motion } from "motion/react";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import StatCard from "../components/dashboard/StatCard";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import { SideBarData } from "../context/SideBarContext";
import TopBar from "../components/queue/TopBar";
import UploadZone from "../components/queue/UploadZone";
import QueueHealth from "../components/queue/QueueHealth";
import ProcessingTable from "../components/queue/ProcessingTable";
import ConfidenceRadial from "../components/reports/ConfidenceRadial";
import { ThroughputChart } from "../components/reports/ThroughputChart";
import { ValidationErrors } from "../components/reports/ValidationErrors";
import { ReportsTable } from "../components/reports/ReportsTable";
import { fetchSummary } from "../components/dashboard/FetchSummary";

export default function Home() {
  const { data } = useContext(SideBarData);
  const [summary, setSummary] = useState(null);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        const fetchSummaryData = await fetchSummary();
        setSummary(fetchSummaryData);
        console.log("Fetched summary data:", fetchSummaryData);
      } catch (err) {
        console.error("Error fetching summary:", err);
      }
    };

    getData();
  }, [dashboardRefreshKey]);

  const handleUploadSuccess = (submission) => {
    setSummary((previous) => {
      if (!previous || previous.total_submissions === 0) {
        return {
          total_submissions: 1,
          average_risk_score: Number(submission?.risk_score ?? 0),
          rule_validation_rate: submission?.state?.rule_valid ? 100 : 0,
          duplicate_rejections: submission?.duplicate_found ? 1 : 0,
          admin_review_required: submission?.review_status === "admin_review_required" ? 1 : 0,
          likely_valid_pending_human_confirmation:
            submission?.review_status === "likely_valid_pending_human_confirmation" ? 1 : 0,
        };
      }

      return {
        ...previous,
        total_submissions: previous.total_submissions + 1,
      };
    });
    setDashboardRefreshKey((value) => value + 1);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />

      {data === "dashboard" && (
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          <Header
            searchQuery={dashboardSearchQuery}
            onSearchChange={setDashboardSearchQuery}
          />

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 md:space-y-10 scroll-smooth custom-scrollbar">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-10 sm:pt-0"
            >
              <div className="w-full sm:w-auto">
                <p className="text-[8px] sm:text-[10px] font-black text-primary tracking-[0.3em] uppercase mb-2">
                  MAR Certificate Verification
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-white">
                  MAR Fraud Analysis Dashboard
                </h2>
              </div>

              <div className="hidden sm:flex items-center gap-3 bg-surface-container px-4 py-2 rounded-xl border border-outline-variant/10 flex-shrink-0 mt-4 sm:mt-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
                </span>
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-outline whitespace-nowrap">
                  Neural Engine Active
                </span>
              </div>
            </motion.div>

            {/* Bento Grid Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              <StatCard
                icon={FileText}
                label="Average Risk Score"
                value={summary?.average_risk_score || 0}
                trend="+14% vs LY"
                progress={70}
              />
              <StatCard
                icon={CheckCircle}
                label="Rule Validation Rate"
                value={summary?.rule_validation_rate || 0}
                subtext="Hyper-Precision"
                segments
              />
              <StatCard
                icon={Clock}
                label="Duplicate Rejection"
                value={summary?.duplicate_rejections || 0}
                subtext="In Pipeline"
                avatars
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
              <div className="lg:col-span-12">
                <ActivityFeed
                  refreshKey={dashboardRefreshKey}
                  searchQuery={dashboardSearchQuery}
                />
              </div>
            </div>
          </div>
        </main>
      )}

      {data === "queue" && (
        <main className="flex-1 flex flex-col min-w-0">
          <TopBar />

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                Certificate Ingestion Queue
              </h2>
              <p className="text-xs sm:text-sm text-white/40">
                Automated MAR certificate verification via Langchain Workflow
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              <div className="lg:col-span-2">
                <UploadZone onUploadSuccess={handleUploadSuccess} />
              </div>
              <div className="lg:col-span-1">
                <QueueHealth />
              </div>
            </div>

            <ProcessingTable />
          </div>
        </main>
      )}
      
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #272a31;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #414755;
        }
      `,
        }}
      />
    </div>
  );
}
