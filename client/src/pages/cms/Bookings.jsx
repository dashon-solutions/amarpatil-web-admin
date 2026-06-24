import React, { useEffect, useState } from "react";
import { Calendar, User, IndianRupee, Video, CheckCircle, Clock, Users, Plus, Eye } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import AssignTeamModal from "../../components/cms/bookings/AssignTeamModal";
import BookingDetailDrawer from "../../components/cms/bookings/BookingDetailDrawer";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [assignmentsByBooking, setAssignmentsByBooking] = useState({});
  const [albumsByBooking, setAlbumsByBooking] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await axiosInstance.get("/bookings");
      setBookings(data.bookings);
      
      // optionally fetch assignments to map assigned staff names
      const allBooks = data.bookings;
      const mapping = {};
      for (const b of allBooks) {
         try {
           const res = await axiosInstance.get(`/assignments/booking/${b._id}`);
           mapping[b._id] = res.data.assignments;
         } catch(e) {}
      }
      setAssignmentsByBooking(mapping);

      // Fetch Albums and map by bookingId
      try {
        const alRes = await axiosInstance.get("/albums");
        const aMap = {};
        alRes.data.albums.forEach(al => {
           // If a booking somehow has multiple albums, this takes the latest because of DB sort
           if (al.bookingId) aMap[al.bookingId._id] = al;
        });
        setAlbumsByBooking(aMap);
      } catch (e) {}

    } catch (error) {
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col pt-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Bookings</h1>
          <p className="text-slate-500 font-light mt-1 text-sm">Manage secured client projects</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-cyan-500">Loading Bookings...</div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full min-w-[900px] sm:min-w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Event Date</th>
                  <th className="px-6 py-4">Shoot Type</th>
                  <th className="px-6 py-4">Remaining Bal.</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Album Flow</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {bookings.map((booking) => (
                  <tr 
                    key={booking._id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => { setSelectedBooking(booking); setDetailDrawerOpen(true); }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center">
                        <User className="w-4 h-4 mr-2 text-slate-400" />
                        {booking.clientName}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Paid: ₹{booking.advanceAmount.toLocaleString()} via {booking.paymentMethod}</div>
                      
                      <div className="mt-3 flex items-center flex-wrap gap-2">
                        {assignmentsByBooking[booking._id] && assignmentsByBooking[booking._id].length > 0 ? (
                           assignmentsByBooking[booking._id].map(ass => (
                             <span key={ass._id} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded flex items-center border border-slate-200 dark:border-slate-700">
                               <Users className="w-3 h-3 mr-1" /> {ass.teamMemberId?.name}
                             </span>
                           ))
                        ) : (
                           <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">No Team Assigned</span>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); setAssignModalOpen(true); }}
                          className="bg-cyan-50 text-cyan-600 hover:bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400 dark:hover:bg-cyan-900/50 p-1 rounded transition-colors"
                        >
                           <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {booking.eventDate ? (
                          <><Calendar className="w-4 h-4 mr-2 text-cyan-500" /> {new Date(booking.eventDate).toLocaleDateString()}</>
                        ) : "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center">
                         <Video className="w-4 h-4 mr-2 text-slate-400" /> {booking.shootType || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex font-bold items-center">
                         <IndianRupee className="w-4 h-4 text-orange-500 mr-1" />
                         <span className={booking.remainingAmount > 0 ? "text-orange-500" : "text-emerald-500"}>
                            {booking.remainingAmount > 0 ? booking.remainingAmount.toLocaleString() : "Fully Paid"}
                         </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Total: ₹{booking.totalAmount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.status === "upcoming" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          <Clock className="w-3 h-3 mr-1" /> Upcoming
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <CheckCircle className="w-3 h-3 mr-1" /> Completed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                       {albumsByBooking[booking._id] ? (
                          <span className="inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800/50">
                             {albumsByBooking[booking._id].status.replace(/_/g, ' ')}
                          </span>
                       ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                       )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                       <button 
                         onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); setDetailDrawerOpen(true); }}
                         className="p-2 bg-slate-50 text-slate-400 hover:text-cyan-500 hover:bg-cyan-50 dark:bg-slate-800 dark:hover:bg-cyan-500/10 rounded-full transition-colors"
                         title="View Details"
                       >
                         <Eye className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500 italic">
                      No bookings created yet. Move a lead to "Advance Paid" to automatically generate a booking!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ... */}
      <AssignTeamModal 
         isOpen={assignModalOpen} 
         onClose={() => setAssignModalOpen(false)} 
         booking={selectedBooking}
         onAssignFinished={fetchBookings}
      />
      {detailDrawerOpen && selectedBooking && (
         <BookingDetailDrawer
            booking={selectedBooking}
            onClose={() => setDetailDrawerOpen(false)}
         />
      )}
    </div>
  );
}
