import React, { useEffect, useState, useRef } from "react";
import { Bell, Search, Sun, Moon, Menu, User, Check, Trash2, Mail } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { useNotifications } from "../../hooks/useNotifications";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = ({ toggleSidebar, openMobileMenu, sidebarOpen }) => {
  const [isDark, setIsDark] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifPermission, setNotifPermission] = useState(Notification.permission);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const notifRef = useRef(null);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }

    // Click outside to close notifications
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch all initial notifications
  const fetchNotifications = async () => {
    try {
      const { data } = await axiosInstance.get("/notifications");
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (e) {
      console.error("Failed to load notifications");
    }
  };

  useEffect(() => {
    if (user?._id) fetchNotifications();
  }, [user]);

  // Hook to connect Socket.io bindings globally across the admin boundary
  useNotifications(user?._id, (newNotif) => {
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
    setUnreadCount(prev => prev + 1);
  });

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await axiosInstance.put(`/notifications/${notif._id}/read`);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      }
      setShowNotifications(false);
      if (notif.redirectUrl) {
        navigate(notif.redirectUrl);
      }
    } catch (e) {
      console.error("Error updating notification map", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put("/notifications/read-all");
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const enableNotifications = () => {
     Notification.requestPermission().then(async (perm) => {
        setNotifPermission(perm);
        if (perm === "granted" && "serviceWorker" in navigator) {
          try {
             const { urlBase64ToUint8Array } = await import("../../utils/webpushHelpers");
             const registration = await navigator.serviceWorker.register("/sw.js");
             const subscription = await registration.pushManager.subscribe({
               userVisibleOnly: true,
               applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
             });
             await axiosInstance.post("/notifications/save-subscription", subscription);
          } catch(e) {
             console.log("Failed to subscribe natively on click:", e);
          }
        }
     });
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Desktop Toggle */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Header Title */}
        <div className="lg:hidden flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white tracking-wide">
          LensCRM
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button className="hidden sm:block p-2 text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors">
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications Dropdown Wrapper */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-pulse text-cyan-500' : ''}`} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1.5 w-2 h-2 sm:w-auto sm:h-auto sm:px-1.5 sm:py-0.5 sm:text-[10px] sm:font-bold flex items-center justify-center bg-red-500 text-white rounded-full border border-white dark:border-slate-900 shadow-sm z-10">
                <span className="hidden sm:inline">{unreadCount > 9 ? '9+' : unreadCount}</span>
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-[-10px] sm:right-0 mt-3 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] z-50 origin-top-right"
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
                   <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
                     Notifications <span className="ml-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-bold">{notifications.length}</span>
                   </h3>
                   {unreadCount > 0 && (
                     <button onClick={markAllAsRead} className="text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:underline flex items-center">
                       <Check className="w-3 h-3 mr-1" /> Mark all read
                     </button>
                   )}
                </div>

                {notifPermission !== "granted" && (
                   <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800/30">
                      <button onClick={enableNotifications} className="w-full text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 py-2 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-slate-800 transition">
                         🔔 Enable Browser Notifications
                      </button>
                   </div>
                )}

                <div className="flex-1 overflow-y-auto min-h-[300px] custom-scrollbar">
                   {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 p-8">
                         <Mail className="w-12 h-12 mb-3 opacity-20" />
                         <p className="text-sm font-medium">All caught up!</p>
                         <p className="text-xs mt-1">No new notifications here.</p>
                      </div>
                   ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                         {notifications.map((notif) => (
                            <div 
                              key={notif._id} 
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 relative ${!notif.isRead ? 'bg-cyan-50/50 dark:bg-cyan-900/10' : ''}`}
                            >
                               {!notif.isRead && <div className="absolute top-1/2 -translate-y-1/2 left-2 w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>}
                               <div className={`pl-3 ${!notif.isRead ? '' : 'opacity-70'}`}>
                                  <h4 className={`text-sm font-bold ${!notif.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{notif.title}</h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-2">
                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown Placeholder */}
        <div className="relative flex items-center gap-2 pl-2 sm:pl-4 sm:border-l border-gray-200 dark:border-gray-700">
          <button
            onClick={() => dispatch(logout())}
            title="Logout"
            className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 overflow-hidden ring-2 ring-transparent transition hover:ring-red-500">
              <User className="w-5 h-5" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
