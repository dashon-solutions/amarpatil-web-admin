import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, IndianRupee, Clock, Wallet, Search, TrendingUp, CheckCircle, Bell, ArrowRight, LayoutDashboard, Briefcase, Camera 
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";
import axiosInstance from "../utils/axiosInstance";

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const [filter, setFilter] = useState("year"); // week, month, year, custom
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  
  const [activeTab, setActiveTab] = useState("overview"); // overview, client, team
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let query = `?filter=${filter}`;
      if (filter === 'month') query += `&month=${selectedMonth}&year=${selectedYear}`;
      if (filter === 'year') query += `&year=${selectedYear}`;
      if (filter === 'custom') query += `&startDate=${dateRange.start}&endDate=${dateRange.end}`;
      
      const res = await axiosInstance.get(`/analytics/dashboard${query}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Fetch analytics error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filter === 'custom' && (!dateRange.start || !dateRange.end)) return;
    fetchAnalytics();
  }, [filter, selectedMonth, selectedYear, dateRange]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
         <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
         <p className="text-slate-500 font-bold uppercase tracking-widest text-sm animate-pulse">Aggregating Global Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 lg:p-6 max-w-[1600px] mx-auto min-h-screen">
      
      {/* GLOBAL FILTER BAR */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white dark:bg-slate-900 px-6 py-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-30">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
             <TrendingUp className="w-6 h-6 text-cyan-500" /> Executive Dashboard
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
           {/* Base Pills */}
           <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 select-none">
             {["week", "month", "year", "custom"].map(f => (
               <button
                 key={f} onClick={() => setFilter(f)}
                 className={`uppercase text-[10px] sm:text-xs font-black tracking-widest px-4 py-2 rounded-lg transition-all ${filter === f ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
               >
                 {f}
               </button>
             ))}
           </div>

           {/* Conditional Filter Inputs */}
           <AnimatePresence mode="popLayout">
              {filter === 'month' && (
                 <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="flex gap-2">
                    <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-bold dark:text-white outline-none cursor-pointer text-slate-700 hover:border-cyan-500 transition">
                       {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                          <option key={i} value={i+1}>{m}</option>
                       ))}
                    </select>
                    <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-bold dark:text-white outline-none cursor-pointer text-slate-700 hover:border-cyan-500 transition">
                       {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                 </motion.div>
              )}
              {filter === 'year' && (
                 <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}>
                    <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-bold dark:text-white outline-none cursor-pointer text-slate-700 hover:border-cyan-500 transition">
                       {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                 </motion.div>
              )}
              {filter === 'custom' && (
                 <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="flex gap-2 items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 transition-colors hover:border-cyan-500">
                    <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="bg-transparent border-none outline-none text-xs font-bold dark:text-white dark:color-scheme-dark" />
                    <span className="text-slate-400 font-bold px-1">to</span>
                    <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="bg-transparent border-none outline-none text-xs font-bold dark:text-white dark:color-scheme-dark" />
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>

      {/* TABS HEADER */}
      <div className="flex gap-2 sm:gap-4 overflow-x-auto custom-scrollbar pb-2">
         {[{ id: 'overview', label: 'Business Overview', icon: LayoutDashboard }, 
           { id: 'client', label: 'Client Pipeline', icon: Users },
           { id: 'team', label: 'Team Performance', icon: Briefcase }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
               className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all whitespace-nowrap shrink-0 border
                  ${activeTab === tab.id 
                     ? 'bg-slate-900 border-slate-900 text-white dark:bg-cyan-500/10 dark:border-cyan-500/30 dark:text-cyan-400 shadow-md' 
                     : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 hover:dark:bg-slate-800'}`}
            >
               <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
         ))}
      </div>

      {/* RENDER ACTIVE SECTION */}
      {data && (
         <AnimatePresence mode="wait">
            <motion.div 
               key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
            >
               {activeTab === 'overview' && <OverviewSection data={data} />}
               {activeTab === 'client' && <ClientSection data={data.client} />}
               {activeTab === 'team' && <TeamSection data={data.team} />}
            </motion.div>
         </AnimatePresence>
      )}

    </div>
  );
};

// ==========================================
// 1. OVERVIEW SECTION
// ==========================================
const OverviewSection = ({ data }) => {
   const { kpis, timeline, reminders } = data.overview;
   
   return (
      <div className="space-y-6">
         {/* Top level VIP KPIs */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard title="Total Revenue Collected" value={kpis.totalRevenue} icon={IndianRupee} color="text-cyan-500" />
            <KPICard title="Total Expenses" value={kpis.totalExpenses} icon={Wallet} color="text-red-500" />
            <KPICard title="Team Payouts" value={kpis.totalTeamPayments} icon={Users} color="text-purple-500" />
            <KPICard title="Net Realized Profit" value={kpis.netProfit} icon={TrendingUp} color="text-emerald-500" highlight={true} />
            <KPICard title="Pending Collections" value={kpis.pendingClientPayments} icon={Clock} color="text-orange-500" sub="Overall Historical Debt" />
         </div>

         {/* Recharts Timeline & Reminders */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-6">
               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden relative min-w-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl"></div>
                  <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-6 relative z-10">Financial Cash Flow</h3>
                  <div className="h-[350px] w-full relative z-10">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                           <defs>
                              <linearGradient id="colorRevBar" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="0%" stopColor="#06b6d4" stopOpacity={1}/>
                                 <stop offset="100%" stopColor="#0891b2" stopOpacity={0.8}/>
                              </linearGradient>
                              <linearGradient id="colorExpBar" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                                 <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8}/>
                              </linearGradient>
                              <linearGradient id="colorProfBar" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                                 <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} tickFormatter={(val) => `₹${val/1000}k`} />
                           <RechartsTooltip cursor={{fill: '#f1f5f9', opacity: 0.1}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} />
                           <Legend wrapperStyle={{paddingTop: '20px', fontSize: '12px', fontWeight: 'bold'}} iconType="circle" />
                           <Bar dataKey="Revenue" fill="url(#colorRevBar)" radius={[6, 6, 0, 0]} maxBarSize={30} />
                           <Bar dataKey="Expenses" fill="url(#colorExpBar)" radius={[6, 6, 0, 0]} maxBarSize={30} />
                           <Bar dataKey="Profit" fill="url(#colorProfBar)" radius={[6, 6, 0, 0]} maxBarSize={30} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>
               
               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden relative min-w-0">
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl"></div>
                  <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-6 relative z-10">Income vs Expense Trend</h3>
                  <div className="h-[350px] w-full relative z-10">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                           <defs>
                              <linearGradient id="colorRevCurve" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorExpCurve" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} tickFormatter={(val) => `₹${val/1000}k`} />
                           <RechartsTooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} />
                           <Legend wrapperStyle={{paddingTop: '20px', fontSize: '12px', fontWeight: 'bold'}} iconType="circle" />
                           <Area type="monotone" dataKey="Revenue" stroke="#06b6d4" strokeWidth={4} fillOpacity={1} fill="url(#colorRevCurve)" />
                           <Area type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorExpCurve)" />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>

            {/* General Upcoming Overview */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl shadow-cyan-900/5 flex flex-col relative overflow-hidden h-[420px] lg:h-auto">
               <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
               <h3 className="text-sm font-black uppercase text-cyan-400 tracking-widest mb-6 flex items-center gap-2 relative z-10"><Bell className="w-4 h-4"/> Upcoming Shoots</h3>
               
               <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 space-y-4 relative z-10">
                  {reminders?.upcomingEvents?.map(e => (
                     <div key={`oe-${e._id}`} className="p-4 bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50 transition-colors rounded-2xl flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                           <div>
                              <p className="text-sm font-bold text-white">{e.clientName}</p>
                              <p className="text-[10px] text-cyan-400 uppercase font-black tracking-widest">{e.shootType}</p>
                           </div>
                           <span className="text-[10px] font-bold text-slate-300 bg-slate-700 px-2.5 py-1 rounded-lg">
                              {new Date(e.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                           </span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold mt-2">
                           <span className="text-slate-400">Bal: <span className="text-orange-400">₹{e.remainingAmount?.toLocaleString()}</span></span>
                           <span className="text-cyan-500 group cursor-pointer flex items-center">View <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform"/></span>
                        </div>
                     </div>
                  ))}
                  
                  {(!reminders?.upcomingEvents || reminders.upcomingEvents.length === 0) && (
                     <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
                        <CheckCircle className="w-8 h-8 mb-2" />
                        <span className="text-xs font-bold uppercase tracking-widest text-center">No immediate<br/>upcoming events</span>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

// ==========================================
// 2. CLIENT SECTION
// ==========================================
const ClientSection = ({ data }) => {
   const [search, setSearch] = useState("");
   const [sortConfig, setSortConfig] = useState({ key: 'eventDate', direction: 'desc' });

   const handleSort = (key) => {
      let direction = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
      setSortConfig({ key, direction });
   };

   let sortedData = [...data.table].filter(item => 
      item.clientName.toLowerCase().includes(search.toLowerCase()) || 
      item.status.toLowerCase().includes(search.toLowerCase())
   );

   sortedData.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'clientName') { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase(); }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
   });

   return (
      <div className="space-y-6">
         {/* Top Analytics */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Collected vs Pending Clarified */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col">
               <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-4"><IndianRupee className="w-4 h-4 inline mr-1"/> Collected vs Pending</h3>
               <div className="flex-1 flex flex-col justify-center">
                  
                  <div className="flex justify-between items-end mb-2">
                     <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-500">Collected</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">₹{data.paidVsPending[0].value.toLocaleString()}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-amber-500">Pending</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">₹{data.paidVsPending[1].value.toLocaleString()}</p>
                     </div>
                  </div>

                  <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full flex overflow-hidden my-4 shadow-inner">
                     <div style={{width: `${data.paidVsPending[0].value + data.paidVsPending[1].value > 0 ? (data.paidVsPending[0].value / (data.paidVsPending[0].value + data.paidVsPending[1].value) * 100) : 0}%`}} className="h-full bg-emerald-500 transition-all duration-1000 relative"></div>
                     <div style={{width: `${data.paidVsPending[0].value + data.paidVsPending[1].value > 0 ? (data.paidVsPending[1].value / (data.paidVsPending[0].value + data.paidVsPending[1].value) * 100) : 0}%`}} className="h-full bg-amber-400 transition-all duration-1000"></div>
                  </div>
                  
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                     <span>{Math.round((data.paidVsPending[0].value / (data.paidVsPending[0].value + data.paidVsPending[1].value || 1)) * 100)}% Settled</span>
                     <span>Total Booking Revenue: ₹{(data.paidVsPending[0].value + data.paidVsPending[1].value).toLocaleString()}</span>
                  </div>
               </div>
            </div>

            {/* Album Tracking Summary */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
               <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-6 flex items-center gap-2"><Camera className="w-4 h-4"/> Album Pipeline</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Selection</span>
                     <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{data.albumTracking.pendingSelection}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
                     <span className="text-[10px] font-bold text-blue-500 uppercase">In Progress</span>
                     <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">{data.albumTracking.inProgress}</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 text-center">
                     <span className="text-[10px] font-bold text-emerald-500 uppercase">Completed</span>
                     <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{data.albumTracking.completed}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800 text-center">
                     <span className="text-[10px] font-bold text-purple-500 uppercase">Delivered</span>
                     <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">{data.albumTracking.delivered}</p>
                  </div>
               </div>
            </div>

            {/* Upcoming Reminders List */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl shadow-red-900/10 flex flex-col max-h-[350px] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
               <h3 className="text-sm font-black uppercase text-red-400 tracking-widest mb-4 flex items-center gap-2 relative z-10"><Bell className="w-4 h-4"/> Critical Attention</h3>
               <div className="overflow-y-auto pr-2 space-y-3 custom-scrollbar flex-1 relative z-10">
                  
                  {data.reminders.paymentDue.map(b => (
                     <div key={`p-${b._id}`} className="p-3 bg-red-950/40 border border-red-900/50 hover:border-red-500/50 transition-colors rounded-xl flex items-center justify-between group">
                        <div>
                           <p className="text-xs font-bold text-red-100">{b.clientName}</p>
                           <p className="text-[10px] text-red-400 uppercase font-bold tracking-widest">Payment Due</p>
                        </div>
                        <span className="font-black text-red-500 text-sm bg-red-950/80 px-2 py-1 rounded border border-red-900/50">₹{b.remainingAmount.toLocaleString()}</span>
                     </div>
                  ))}

                  {data.reminders.upcomingEvents.map(e => (
                     <div key={`e-${e._id}`} className="p-3 bg-cyan-950/40 border border-cyan-900/50 hover:border-cyan-500/50 transition-colors rounded-xl flex items-center justify-between">
                        <div className="max-w-[140px]">
                           <p className="text-xs font-bold text-cyan-100 truncate">{e.clientName}</p>
                           <p className="text-[10px] text-cyan-400 uppercase font-bold tracking-widest truncate">{e.shootType}</p>
                        </div>
                        <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 px-2 py-1 rounded shadow-sm border border-cyan-900/50 whitespace-nowrap">
                           {new Date(e.eventDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                        </span>
                     </div>
                  ))}
                  
                  {(data.reminders.paymentDue.length === 0 && data.reminders.upcomingEvents.length === 0) && (
                     <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60 mt-10">
                        <CheckCircle className="w-6 h-6 mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-center">Pipeline Clear</span>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Sortable Client Bookings Table */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col shadow-sm max-h-[600px] overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
               <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest leading-none">Client Ledger Records</h3>
               <div className="relative w-full sm:w-auto">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search Filter..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-cyan-500" />
               </div>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 -mx-2 px-2">
               <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10 shadow-sm border-b border-slate-100 dark:border-slate-800">
                     <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-bold select-none">
                        <th className="pb-3 pt-2 px-2 cursor-pointer hover:text-cyan-500 group" onClick={() => handleSort('clientName')}>Client Name {sortConfig.key==='clientName' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
                        <th className="pb-3 pt-2 px-2 cursor-pointer hover:text-cyan-500" onClick={() => handleSort('eventDate')}>Event Date {sortConfig.key==='eventDate' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
                        <th className="pb-3 pt-2 px-2 text-right cursor-pointer hover:text-cyan-500" onClick={() => handleSort('totalAmount')}>Total Amount {sortConfig.key==='totalAmount' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
                        <th className="pb-3 pt-2 px-2 text-right text-emerald-500/80">Paid</th>
                        <th className="pb-3 pt-2 px-2 text-right cursor-pointer hover:text-orange-500 text-orange-500/80" onClick={() => handleSort('remainingAmount')}>Balance {sortConfig.key==='remainingAmount' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
                        <th className="pb-3 pt-2 px-2 text-center cursor-pointer hover:text-cyan-500" onClick={() => handleSort('status')}>Status {sortConfig.key==='status' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                     {sortedData.map(c => (
                        <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                           <td className="py-4 px-2 font-bold text-sm text-slate-900 dark:text-white capitalize">{c.clientName}</td>
                           <td className="py-4 px-2 text-xs font-bold text-slate-500">{c.eventDate ? new Date(c.eventDate).toLocaleDateString() : "-"}</td>
                           <td className="py-4 px-2 text-right font-black text-slate-700 dark:text-slate-300">₹{c.totalAmount.toLocaleString()}</td>
                           <td className="py-4 px-2 text-right font-black text-emerald-500">₹{(c.totalAmount - c.remainingAmount).toLocaleString()}</td>
                           <td className="py-4 px-2 text-right">
                              {c.remainingAmount > 0 
                                 ? <span className="font-black text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded">₹{c.remainingAmount.toLocaleString()}</span>
                                 : <span className="font-bold text-emerald-500 text-[10px] uppercase tracking-widest"><CheckCircle className="w-3 h-3 inline mr-1"/>Cleared</span>
                              }
                           </td>
                           <td className="py-4 px-2 text-center">
                              <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest 
                                 ${c.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 
                                   c.status === 'upcoming' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400' : 
                                   'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                 {c.status}
                              </span>
                           </td>
                        </tr>
                     ))}
                     {sortedData.length === 0 && <tr><td colSpan="6" className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-xs">No records found.</td></tr>}
                  </tbody>
               </table>
            </div>
         </div>

      </div>
   );
};

// ==========================================
// 3. TEAM SECTION
// ==========================================
const TeamSection = ({ data }) => {
   const [search, setSearch] = useState("");
   const [sortConfig, setSortConfig] = useState({ key: 'totalEarned', direction: 'desc' });

   // Helpers for Highlights Cards
   const topEarner = [...data.table].sort((a,b) => b.totalEarned - a.totalEarned)[0] || null;
   const highestPaid = [...data.table].sort((a,b) => b.totalPaid - a.totalPaid)[0] || null;
   const highestPending = [...data.table].sort((a,b) => b.remainingPayable - a.remainingPayable)[0] || null;

   const handleSort = (key) => {
      let direction = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
      setSortConfig({ key, direction });
   };

   let sortedData = [...data.table].filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      item.role.toLowerCase().includes(search.toLowerCase())
   );

   sortedData.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase(); }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
   });

   return (
      <div className="space-y-6">
         
         {/* Team Highlights Ribbon */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-5 shadow text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition"></div>
               <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-2">Top Performer By Earning</p>
               <h3 className="text-2xl font-black truncate">{topEarner?.name || 'N/A'}</h3>
               <p className="text-lg font-bold mt-1">₹{topEarner?.totalEarned.toLocaleString() || '0'}</p>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl p-5 shadow text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition"></div>
               <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-2">Highest Paid Out</p>
               <h3 className="text-2xl font-black truncate">{highestPaid?.name || 'N/A'}</h3>
               <p className="text-lg font-bold mt-1">₹{highestPaid?.totalPaid.toLocaleString() || '0'}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-5 shadow text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition"></div>
               <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-2">Highest Attention Required (Debt)</p>
               <h3 className="text-2xl font-black truncate">{highestPending?.name || 'N/A'}</h3>
               <p className="text-lg font-bold mt-1">₹{highestPending?.remainingPayable.toLocaleString() || '0'}</p>
            </div>
         </div>

         {/* Graph Grid & Upcoming Assignments */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden relative min-w-0">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
                  <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-6 relative z-10">Aggregate Earnings</h3>
                  <div className="h-[250px] relative z-10">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.earningsChart} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                           <defs>
                              <linearGradient id="colorEarnBar" x1="0" y1="0" x2="1" y2="0">
                                 <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                                 <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8}/>
                              </linearGradient>
                           </defs>
                           <XAxis type="number" hide />
                           <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} />
                           <RechartsTooltip cursor={{fill: '#f1f5f9', opacity: 0.1}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} formatter={(val) => `₹${val.toLocaleString()}`}/>
                           <Bar dataKey="Earned" fill="url(#colorEarnBar)" radius={[0, 6, 6, 0]} barSize={20} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col overflow-hidden relative min-w-0">
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl"></div>
                  <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-4 relative z-10"><Wallet className="w-4 h-4 inline mr-1"/> Overall Paid vs Due</h3>
                  
                  <div className="flex-1 flex flex-col justify-center relative z-10">
                     <div className="flex justify-between items-end mb-2">
                        <div>
                           <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-500">Paid Out</p>
                           <p className="text-3xl font-black text-slate-900 dark:text-white">₹{data.paidVsPending[0].value.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] uppercase tracking-widest font-bold text-rose-500">Due Payable</p>
                           <p className="text-3xl font-black text-slate-900 dark:text-white">₹{data.paidVsPending[1].value.toLocaleString()}</p>
                        </div>
                     </div>

                     <div className="w-full h-5 bg-slate-100 dark:bg-slate-800 rounded-full flex overflow-hidden my-5 shadow-inner p-0.5">
                        <div className="h-full rounded-full flex overflow-hidden w-full">
                           <div style={{width: `${data.paidVsPending[0].value + data.paidVsPending[1].value > 0 ? (data.paidVsPending[0].value / (data.paidVsPending[0].value + data.paidVsPending[1].value) * 100) : 0}%`}} className="h-full bg-emerald-500 transition-all duration-1000 relative"></div>
                           <div style={{width: `${data.paidVsPending[0].value + data.paidVsPending[1].value > 0 ? (data.paidVsPending[1].value / (data.paidVsPending[0].value + data.paidVsPending[1].value) * 100) : 0}%`}} className="h-full bg-rose-500 transition-all duration-1000"></div>
                        </div>
                     </div>
                     
                     <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                        <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded">
                           {Math.round((data.paidVsPending[0].value / (data.paidVsPending[0].value + data.paidVsPending[1].value || 1)) * 100)}% Cleared
                        </span>
                        <span>Total Obligation: ₹{(data.paidVsPending[0].value + data.paidVsPending[1].value).toLocaleString()}</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Upcoming Team Tasks */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl shadow-cyan-900/5 flex flex-col relative overflow-hidden max-h-[400px]">
               <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
               <h3 className="text-sm font-black uppercase text-cyan-400 tracking-widest mb-4 flex items-center gap-2 relative z-10"><Clock className="w-4 h-4"/> Upcoming Missions</h3>
               <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 space-y-3 relative z-10">
                  {data.upcomingAssignments && data.upcomingAssignments.map(assign => (
                     <div key={`ta-${assign._id}`} className="p-3 bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50 transition-colors rounded-2xl flex flex-col gap-1.5">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center font-black text-xs border border-indigo-500/30">
                                 {assign.teamMemberId?.name?.charAt(0).toUpperCase()}
                              </div>
                              <p className="text-sm font-bold text-white leading-tight">{assign.teamMemberId?.name}</p>
                           </div>
                           <span className="text-[10px] font-bold text-slate-300 bg-slate-700 px-2 py-0.5 rounded-md">
                              {new Date(assign.shootDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                           </span>
                        </div>
                        <div className="pl-9">
                           <p className="text-[10px] font-black tracking-widest uppercase text-cyan-400 truncate">{assign.bookingId?.shootType || 'Assignment'}</p>
                           <p className="text-xs font-bold text-slate-400 truncate">Client: {assign.bookingId?.clientName || 'N/A'}</p>
                        </div>
                     </div>
                  ))}
                  
                  {(!data.upcomingAssignments || data.upcomingAssignments.length === 0) && (
                     <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60 mt-8">
                        <CheckCircle className="w-8 h-8 mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-center">No upcoming<br/>assignments</span>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Advanced Team Ledger Table */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col shadow-sm max-h-[500px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
               <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest">Team Performance Registry</h3>
               <div className="relative w-full sm:w-auto">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search Filter..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-blue-500" />
               </div>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1 -mx-2 px-2">
               <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10 shadow-sm border-b border-slate-100 dark:border-slate-800">
                     <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-bold select-none cursor-pointer">
                        <th className="pb-3 pt-2 px-2 hover:text-cyan-500" onClick={() => handleSort('name')}>Team Member {sortConfig.key==='name'&&'↓'}</th>
                        <th className="pb-3 pt-2 px-2 hover:text-cyan-500" onClick={() => handleSort('role')}>Role {sortConfig.key==='role'&&'↓'}</th>
                        <th className="pb-3 pt-2 px-2 text-right text-cyan-500/80 hover:text-cyan-500" onClick={() => handleSort('totalEarned')}>Total Earned {sortConfig.key==='totalEarned'&&'↓'}</th>
                        <th className="pb-3 pt-2 px-2 text-right text-emerald-500/80 hover:text-emerald-500" onClick={() => handleSort('totalPaid')}>Total Paid {sortConfig.key==='totalPaid'&&'↓'}</th>
                        <th className="pb-3 pt-2 px-2 text-right text-red-500/80 hover:text-red-500" onClick={() => handleSort('remainingPayable')}>Due Payable {sortConfig.key==='remainingPayable'&&'↓'}</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                     {sortedData.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                           <td className="py-4 px-2 font-bold text-sm text-slate-900 dark:text-white capitalize">{t.name}</td>
                           <td className="py-4 px-2 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block mt-2 mb-2 ml-2">{t.role}</td>
                           <td className="py-4 px-2 text-right font-black text-cyan-500 text-sm">₹{t.totalEarned.toLocaleString()}</td>
                           <td className="py-4 px-2 text-right font-black text-emerald-500 text-sm">₹{t.totalPaid.toLocaleString()}</td>
                           <td className="py-4 px-2 text-right font-black text-slate-900 dark:text-slate-100 text-sm">
                              {t.remainingPayable > 0 
                                 ? <span className="text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded">₹{t.remainingPayable.toLocaleString()}</span>
                                 : <span className="text-emerald-500 text-[10px] uppercase tracking-widest"><CheckCircle className="w-3 h-3 inline mr-1"/>Settled</span>
                              }
                           </td>
                        </tr>
                     ))}
                     {sortedData.length === 0 && <tr><td colSpan="5" className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-xs">No records found.</td></tr>}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};

// Utilities
const KPICard = ({ title, value, icon: Icon, color, highlight, sub }) => (
   <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className={`p-5 rounded-3xl border shadow-sm relative overflow-hidden transition-all hover:shadow-md
         ${highlight 
            ? 'bg-slate-900 border-slate-800 dark:bg-black dark:border-slate-800 shadow-xl shadow-cyan-900/10 hover:shadow-cyan-900/30' 
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`
      }
   >
      {highlight && <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl" />} 
      
      <div className="flex justify-between items-start relative z-10">
         <div className="min-w-0 pr-2">
            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${highlight ? 'text-slate-400' : 'text-slate-500'}`}>{title}</h3>
            <h2 className={`text-2xl lg:text-3xl font-black tracking-tight truncate ${highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
               ₹{typeof value === 'number' ? value.toLocaleString() : value}
            </h2>
            {sub && <p className="text-[9px] font-bold tracking-widest uppercase text-slate-400 mt-2">{sub}</p>}
         </div>
         <div className={`p-2.5 rounded-2xl shrink-0 ${highlight ? 'bg-slate-800' : 'bg-slate-50 dark:bg-slate-800'} ${color}`}>
            <Icon className="w-5 h-5" />
         </div>
      </div>
   </motion.div>
);

export default Dashboard;
