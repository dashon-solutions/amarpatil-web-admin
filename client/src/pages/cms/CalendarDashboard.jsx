import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

// React Big Calendar
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import dayjs from "dayjs";

// Components
import TaskModal from "../../components/cms/calendar/TaskModal";
import EventDetailDrawer from "../../components/cms/calendar/EventDetailDrawer";

// Setup DayJS localizer
const localizer = dayjsLocalizer(dayjs);

export default function CalendarDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Big Calendar exact control
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookRes, taskRes] = await Promise.all([
        axiosInstance.get("/bookings"),
        axiosInstance.get("/tasks")
      ]);
      
      const bookingsData = bookRes.data.bookings || [];
      const tasksData = taskRes.data.tasks || [];

      // Combine and format events for react-big-calendar
      const formattedEvents = [];

      bookingsData.forEach(b => {
        if (b.eventDate) {
          // Parse time if it exists "10:00 AM", otherwise default 10:00
          let startD = dayjs(b.eventDate);
          if (b.time) {
            const timeParts = b.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
            if (timeParts) {
              let hours = parseInt(timeParts[1], 10);
              const mins = parseInt(timeParts[2], 10);
              const ampm = timeParts[3] ? timeParts[3].toUpperCase() : null;
              if (ampm === "PM" && hours < 12) hours += 12;
              if (ampm === "AM" && hours === 12) hours = 0;
              startD = startD.hour(hours).minute(mins);
            }
          } else {
             startD = startD.hour(10).minute(0);
          }

          formattedEvents.push({
            ...b,
            type: "booking",
            title: b.clientName + " - " + b.shootType,
            start: startD.toDate(),
            end: startD.add(2, 'hour').toDate(), // Default 2 hours block
            isAllDay: false,
          });
        }
      });

      tasksData.forEach(t => {
        if (t.date) {
          let startT = dayjs(t.date);
          if (t.time) {
             const timeParts = t.time.split(":");
             if (timeParts.length >= 2) {
                startT = startT.hour(parseInt(timeParts[0], 10)).minute(parseInt(timeParts[1], 10));
             }
          } else {
             startT = startT.hour(12).minute(0);
          }

          formattedEvents.push({
            ...t,
            type: "task",
            title: t.title,
            start: startT.toDate(),
            end: startT.add(1, 'hour').toDate(),
            isAllDay: false,
          });
        }
      });

      setEvents(formattedEvents);
    } catch (error) {
      toast.error("Failed to load map calendar data");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setIsTaskModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };

  // Custom Event styling
  const eventStyleGetter = (event) => {
    let style = {
      borderRadius: '6px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
      fontWeight: '600',
      fontSize: '0.8rem',
      padding: '4px 8px',
    };

    if (event.type === 'booking') {
      style.backgroundColor = '#2563eb'; // blue-600
      style.borderLeft = '4px solid #1e3a8a'; // blue-900
    } else {
      if (event.status === 'completed') {
        style.backgroundColor = '#64748b'; // slate-500
        style.borderLeft = '4px solid #334155'; // slate-700
      } else {
        style.backgroundColor = '#059669'; // emerald-600
        style.borderLeft = '4px solid #064e3b'; // emerald-900
      }
    }

    return { style };
  };

  return (
    <div className="h-full flex flex-col pt-4 overflow-hidden relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-1">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Schedule</h1>
          <p className="text-slate-500 font-light mt-1 text-sm">Bookings & Tasks Calendar</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => { setSelectedDate(new Date()); setIsTaskModalOpen(true); }}
            className="flex items-center gap-2 bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-500 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-slate-200 dark:shadow-cyan-900/20"
          >
            <Plus className="w-5 h-5" /> <span>Add Task</span>
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-2 sm:p-4 overflow-hidden"
      >
        <div className="h-[75vh] w-full rbc-custom-theme">
          <style dangerouslySetInnerHTML={{__html: `
            .rbc-calendar { font-family: inherit; }
            .rbc-toolbar button { border-radius: 8px; font-weight: 500; text-transform: capitalize; }
            .rbc-toolbar button.rbc-active { background-color: #f1f5f9; box-shadow: none; }
            .dark .rbc-toolbar button { color: #cbd5e1; border-color: #334155; }
            .dark .rbc-toolbar button:hover { background-color: #334155; }
            .dark .rbc-toolbar button.rbc-active { background-color: #0f172a; color: white; border-color: #06b6d4;}
            .dark .rbc-month-view, .dark .rbc-time-view, .dark .rbc-agenda-view { border-color: #334155; }
            .dark .rbc-day-bg, .dark .rbc-month-row, .dark .rbc-header { border-color: #334155; }
            .dark .rbc-off-range-bg { background-color: #0f172a; opacity: 0.5; }
            .dark .rbc-today { background-color: rgba(6, 182, 212, 0.05); }
            .dark .rbc-event { color: #f8fafc; }
            .rbc-event { padding: 4px; border-radius: 6px; font-size: 0.8rem; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
          `}} />
          <Calendar
             localizer={localizer}
             events={events}
             startAccessor="start"
             endAccessor="end"
             selectable
             date={currentDate}
             onNavigate={(newDate) => setCurrentDate(newDate)}
             view={currentView}
             onView={(newView) => setCurrentView(newView)}
             onSelectSlot={handleSelectSlot}
             onSelectEvent={handleSelectEvent}
             eventPropGetter={eventStyleGetter}
             views={['month', 'week', 'day', 'agenda']}
             popup
          />
        </div>
      </motion.div>

      {/* Detail Drawer */}
      <EventDetailDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        event={selectedEvent} 
        onUpdate={fetchData} 
      />

      {/* Task Creation Modal */}
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        selectedDate={selectedDate} 
        onTaskCreated={fetchData} 
      />
    </div>
  );
}
