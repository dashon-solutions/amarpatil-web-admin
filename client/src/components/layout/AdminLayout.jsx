import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileNav from "./MobileNav";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close sidebar automatically on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200 flex">
      {/* Sidebar for Desktop & Mobile drawer */}
      <Sidebar 
        isOpen={sidebarOpen} 
        isMobileOpen={mobileMenuOpen}
        closeMobile={() => setMobileMenuOpen(false)}
      />

      <div className={`flex flex-col flex-1 min-w-0 w-full transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
        {/* Top Navbar */}
        <Navbar 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          openMobileMenu={() => setMobileMenuOpen(true)}
          sidebarOpen={sidebarOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 overflow-x-hidden">
          <Outlet />
        </main>
        
        {/* Bottom Navigation for Mobile */}
        <MobileNav openMenu={() => setMobileMenuOpen(true)} />
      </div>
    </div>
  );
};

export default AdminLayout;
