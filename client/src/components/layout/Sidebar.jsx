import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, KanbanSquare, Calendar, Wallet,
  Settings, Image, Camera, Box, User, BookText, UserCircle, X, Receipt, MessageSquare
} from "lucide-react";

export const sidebarItems = [
  {
    title: "CRM",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
      { name: "Leads", icon: Users, path: "/admin/leads" },
      { name: "Pipeline", icon: KanbanSquare, path: "/admin/pipeline" },
      { name: "Bookings", icon: BookText, path: "/admin/bookings" },
      { name: "Albums", icon: Image, path: "/admin/albums" },
      { name: "Calendar", icon: Calendar, path: "/admin/calendar" },
      { name: "Payments", icon: Wallet, path: "/admin/payments" },
    ],
  },
  {
    title: "Website",
    items: [
      { name: "Site Settings", icon: Settings, path: "/admin/settings/site" },
      { name: "Banners", icon: Camera, path: "/admin/banners" },
      { name: "Categories", icon: Box, path: "/admin/categories" },
      { name: "Gallery", icon: Image, path: "/admin/gallery" },
      { name: "Stories", icon: BookText, path: "/admin/stories" },
      { name: "Packages", icon: Box, path: "/admin/packages" },
      { name: "Testimonials", icon: MessageSquare, path: "/admin/testimonials" },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Team", icon: User, path: "/admin/team" },
      { name: "Khata", icon: BookText, path: "/admin/khata" },
      { name: "Expenses", icon: Receipt, path: "/admin/expenses" },
      { name: "Profile", icon: UserCircle, path: "/admin/profile" },
    ],
  },
];

const Sidebar = ({ isOpen, isMobileOpen, closeMobile }) => {
  const location = useLocation();

  const SidebarContent = ({ forceOpen = false }) => {
    const showContent = isOpen || forceOpen;
    return (
    <div className="h-full flex flex-col pt-4 overflow-y-auto custom-scrollbar">
      {/* Brand */}
      <div className={`flex items-center gap-3 px-6 pb-6 border-b border-slate-200 dark:border-slate-800 ${!showContent ? 'justify-center px-0' : ''}`}>
        {/* <div className="w-8 h-8 rounded shrink-0 bg-cyan-600 text-white flex items-center justify-center font-bold text-sm">
          📷
        </div> */}
        {showContent && (
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            LensCRM
          </motion.span>
        )}
      </div>

      <div className="flex-1 py-6 space-y-8">
        {sidebarItems.map((section, idx) => (
          <div key={idx} className="px-3">
            {showContent && (
              <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

                return (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={closeMobile}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                      ${isActive
                        ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                      }
                      ${!showContent ? 'justify-center' : ''}
                    `}
                    title={!showContent ? item.name : undefined}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
                    {showContent && (
                      <span className="font-medium whitespace-nowrap">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 256 : 80 }}
        className="hidden lg:block fixed left-0 top-0 bottom-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors duration-200 shadow-sm"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-2xl"
            >
              <button
                onClick={closeMobile}
                className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent forceOpen={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
