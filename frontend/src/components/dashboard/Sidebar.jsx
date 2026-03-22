import React, { useContext, useState } from "react";
import {
  LayoutDashboard,
  Layers,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Cpu,
  HdIcon,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SideBarData } from "../../context/SideBarContext";
import { useNavigate } from "react-router-dom";

const NavItem = ({
  icon: Icon,
  label,
  active = false,
  onClick,
  isMobile = false,
}) => (
  <motion.a
    whileHover={!isMobile ? { x: 4 } : {}}
    className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all cursor-pointer w-full ${
      active
        ? "bg-primary/10 text-primary border-l-4 border-primary"
        : "text-outline hover:bg-surface-high hover:text-white"
    }`}
    onClick={onClick}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </motion.a>
);

const Sidebar = ({
  isMobileSidebarOpen = false,
  setIsMobileSidebarOpen = () => {},
}) => {
  const { data, setSidebarData } = useContext(SideBarData);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(isMobileSidebarOpen);

  const handleLogOut = () => {
    localStorage.removeItem("token");
    setIsOpen(false);
    navigate("/login");
  };

  const handleNavClick = (sectionName) => {
    setSidebarData(sectionName);
    setIsOpen(false);
    setIsMobileSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 text-white/60 hover:text-white bg-surface-container rounded-lg transition-all"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col h-screen py-6 px-4 bg-surface w-64 border-r border-outline-variant/10 shadow-2xl">
        <SidebarContent
          data={data}
          handleNavClick={handleNavClick}
          handleLogOut={handleLogOut}
        />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="md:hidden fixed left-0 top-0 h-screen w-64 py-6 px-4 bg-surface border-r border-outline-variant/10 shadow-2xl z-40"
          >
            <SidebarContent
              data={data}
              handleNavClick={handleNavClick}
              handleLogOut={handleLogOut}
              isMobile
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

const SidebarContent = ({
  data,
  handleNavClick,
  handleLogOut,
  isMobile = false,
}) => {
  return (
    <div className="flex flex-col h-full">
      {isMobile && <div className="h-8" />} {/* Spacer for mobile */}
      <div className="mb-10 px-2">
        <h1 className="text-lg md:text-xl font-black text-white tracking-tight">
          MAR Fraud Detection
        </h1>

        <div className="mt-6 flex items-center gap-3 p-3 bg-surface-container rounded-xl border border-outline-variant/10">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <Cpu size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold tracking-widest text-primary truncate">
              MAR Fraud Detection
            </p>
            <p className="text-xs text-outline">Agentic Mode: Active</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-2">
        <NavItem
          icon={LayoutDashboard}
          label="Dashboard"
          onClick={() => handleNavClick("dashboard")}
          active={data === "dashboard"}
          isMobile={isMobile}
        />
        <NavItem
          icon={Layers}
          label="Queue"
          onClick={() => handleNavClick("queue")}
          active={data === "queue"}
          isMobile={isMobile}
        />
      </nav>

      <div className="mt-auto pt-6 space-y-2 border-t border-outline-variant/10 px-2">
        {data !== "queue" && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-full mb-6 bg-linear-to-br from-primary to-primary-container text-background font-bold py-3 rounded-lg text-sm tracking-tight shadow-lg shadow-primary/20"
            onClick={() => handleNavClick("queue")}
          >
            New Process
          </motion.button>
        )}

        <NavItem icon={HelpCircle} label="Support" isMobile={isMobile} />
        {/* Sign Out  */}
        <motion.a
          whileHover={!isMobile ? { x: 4 } : {}}
          className="flex items-center gap-3 py-2 px-3 rounded-lg transition-all cursor-pointer w-full text-outline hover:bg-surface-high hover:text-white"
          onClick={handleLogOut}
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Sign Out</span>
        </motion.a>
      </div>
    </div>
  );
};

export default Sidebar;
