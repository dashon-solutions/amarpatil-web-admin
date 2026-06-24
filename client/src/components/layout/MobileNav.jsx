import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Calendar, Users, BookText, Menu } from "lucide-react";

const MobileNav = ({ openMenu }) => {
  const location = useLocation();

  const tabs = [
    { name: "Dash", icon: LayoutDashboard, path: "/admin" },
    { name: "Leads", icon: Users, path: "/admin/leads" },
    { name: "Bookings", icon: Calendar, path: "/admin/bookings" },
    { name: "Khata", icon: BookText, path: "/admin/khata" }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center z-40 pb-safe p-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {tabs.map((tab, idx) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path || (tab.path !== "/" && location.pathname.startsWith(tab.path));
        
        return (
          <Link
            key={idx}
            to={tab.path}
            className={`flex flex-col items-center justify-center w-full py-2 ${
               isActive ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400 dark:text-slate-500"
            }`}
          >
            <Icon className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] font-semibold">{tab.name}</span>
          </Link>
        );
      })}
      
      <button
        onClick={openMenu}
        className="flex flex-col items-center justify-center w-full py-2 text-slate-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
      >
        <Menu className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-semibold">More</span>
      </button>
    </div>
  );
};

export default MobileNav;
