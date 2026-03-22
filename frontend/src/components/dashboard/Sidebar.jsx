import React, { useContext } from "react";
import {
  LayoutDashboard,
  Layers,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Cpu,
  HdIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { SideBarData } from "../../context/SideBarContext";
import { useNavigate } from "react-router-dom";

const NavItem = ({ icon, label, active = false, onClick }) => (
  <motion.a
    whileHover={{ x: 4 }}
    className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all cursor-pointer ${
      active
        ? "bg-primary/10 text-primary border-l-4 border-primary"
        : "text-outline hover:bg-surface-high hover:text-white"
    }`}
    onClick={onClick}
  >
    <HdIcon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </motion.a>
);

const Sidebar = () => {
  const { data, setSidebarData } = useContext(SideBarData);
  const navigate = useNavigate();

  const handleLogOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex flex-col h-screen py-6 px-4 bg-surface w-64 border-r border-outline-variant/10 shadow-2xl">
      <div className="mb-10 px-2">
        <h1 className="text-xl font-black text-white tracking-tight">
          MAR Fraud Detection
        </h1>

        <div className="mt-6 flex items-center gap-3 p-3 bg-surface-container rounded-xl border border-outline-variant/10">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <Cpu size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-primary">
              MAR Fraud Detection
            </p>
            <p className="text-xs text-outline">Agentic Mode: Active</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <NavItem
          icon={LayoutDashboard}
          label="Dashboard"
          onClick={() => setSidebarData("dashboard")}
          active={data === "dashboard"}
        />
        <NavItem
          icon={Layers}
          label="Queue"
          onClick={() => setSidebarData("queue")}
          active={data === "queue"}
        />
        <NavItem
          icon={BarChart3}
          label="Reports"
          onClick={() => setSidebarData("reports")}
          active={data === "reports"}
        />
        <NavItem
          icon={Settings}
          label="Settings"
          onClick={() => setSidebarData("settings")}
          active={data === "settings"}
        />
      </nav>

      <div className="mt-auto pt-6 space-y-2 border-t border-outline-variant/10">
        {data !== "queue" && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-full mb-6 bg-linear-to-br from-primary to-primary-container text-background font-bold py-3 rounded-lg text-sm tracking-tight shadow-lg shadow-primary/20"
            onClick={() => {
              setSidebarData("queue");
            }}
          >
            New Process
          </motion.button>
        )}

        <NavItem icon={HelpCircle} label="Support" />
        {/* Sign Out  */}
        <motion.a
          whileHover={{ x: 4 }}
          className="flex items-center gap-3 py-2 px-3 rounded-lg transition-all cursor-pointer"
          onClick={handleLogOut}
        >
          <HdIcon size={20} />
          <span className="font-medium text-sm">Sign Out</span>
        </motion.a>
      </div>
    </aside>
  );
};

export default Sidebar;
