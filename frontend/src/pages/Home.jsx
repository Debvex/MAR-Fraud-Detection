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

  useEffect(() => {
    const getData = async () => {
      try {
        const fetchSummaryData = await fetchSummary();
        setSummary(fetchSummaryData);
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
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      {data === "dashboard" && (
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          <Header />

          <div className="flex-1 overflow-y-auto p-8 space-y-10 scroll-smooth custom-scrollbar">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-between items-end"
            >
              <div>
                <p className="text-[10px] font-black text-primary tracking-[0.3em] uppercase mb-2">
                  MAR Certificate Verification
                </p>
                <h2 className="text-4xl font-black tracking-tighter text-white">
                  MAR Fraud Analysis Dashboard
                </h2>
              </div>

              <div className="hidden sm:flex items-center gap-3 bg-surface-container px-4 py-2 rounded-xl border border-outline-variant/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-outline">
                  Neural Engine Active
                </span>
              </div>
            </motion.div>

            {/* Bento Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-12">
                <ActivityFeed refreshKey={dashboardRefreshKey} />
              </div>
            </div>
          </div>
        </main>
      )}

      {data === "queue" && (
        <main className="flex-1 flex flex-col min-w-0">
          <TopBar />

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <h2 className="text-3xl font-bold tracking-tight">
                Certificate Ingestion Queue
              </h2>
              <p className="text-white/40 text-sm">
                Automated MAR certificate verification via Langchain Workflow
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

      {data === "reports" && (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <TopBar />

          <main className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-end gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl font-black text-[#e1e2eb] tracking-tighter mb-3">
                  Reports & Analytics
                </h1>
                <p className="text-[#e1e2eb]/40 max-w-2xl text-sm leading-relaxed font-medium">
                  Aggregate intelligence from the Report Node. High-confidence
                  document processing metrics and actionable validation
                  insights.
                </p>
              </motion.div>

              <div className="flex gap-4">
                <div className="px-5 py-3 bg-surface rounded-xl flex items-center gap-3 border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                  <Calendar
                    size={16}
                    className="text-primary group-hover:scale-110 transition-transform"
                  />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e1e2eb]/60">
                    Last 30 Days
                  </span>
                </div>
                <button className="bg-surface px-6 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] text-[#e1e2eb] hover:bg-[#32353c] border border-white/5 transition-all flex items-center gap-3 group">
                  Export .CSV
                  <Download
                    size={14}
                    className="text-primary group-hover:translate-y-0.5 transition-transform"
                  />
                </button>
              </div>
            </header>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <motion.div
                className="lg:col-span-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <ConfidenceRadial />
              </motion.div>
              <motion.div
                className="lg:col-span-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ThroughputChart />
              </motion.div>
            </div>

            {/* Tables & Errors Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <motion.div
                className="xl:col-span-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <ValidationErrors />
              </motion.div>
              <motion.div
                className="xl:col-span-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <ReportsTable />
              </motion.div>
            </div>

            {/* Footer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10">
              <StatCard
                icon={Calendar}
                label="Avg Processing Time"
                value="1.4s"
              />
              <StatCard
                icon={Database}
                label="Total Data Verified"
                value="142 GB"
              />
              <StatCard icon={Brain} label="AI Logic Nodes" value="12 Active" />
              <StatCard
                icon={Sparkles}
                label="Auto-Remediation"
                value="Enabled"
                active
              />
            </div>
          </main>

          {/* Background Decoration */}
          <div className="fixed top-0 right-0 -z-10 w-200 h-200 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="fixed bottom-0 left-0 -z-10 w-150 h-150 bg-tertiary/5 blur-[120px] rounded-full pointer-events-none" />
        </div>
      )}

      {data === "settings" && <h1>Settings</h1>}

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
