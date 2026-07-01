import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeads, updateLeadStatus } from "../../features/leads/leadSlice";
import KanbanBoard from "../../components/cms/leads/KanbanBoard";
import ListView from "../../components/cms/leads/ListView";
import LeadDetailDrawer from "../../components/cms/leads/LeadDetailDrawer";
import AddLeadModal from "../../components/cms/leads/AddLeadModal";
import BookingFinalizeModal from "../../components/cms/leads/BookingFinalizeModal";
import { LayoutGrid, List, Plus } from "lucide-react";
import { toast } from "react-toastify";

export default function Leads() {
  const dispatch = useDispatch();
  const { leads, loading } = useSelector((state) => state.leads);
  
  const [viewMode, setViewMode] = useState("kanban"); // 'kanban' or 'list'
  const [selectedLead, setSelectedLead] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pendingBookingLead, setPendingBookingLead] = useState(null);
  const [confirmBackMoveLead, setConfirmBackMoveLead] = useState(null);

  useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const sourceStatus = result.source.droppableId;
    const destStatus = result.destination.droppableId;
    const leadId = result.draggableId;

    if (sourceStatus === destStatus) return;

    const stageOrder = ["new", "contacted", "quotation_sent", "advance_paid", "shoot_done", "payment_pending", "closed"];
    const sourceIndex = stageOrder.indexOf(sourceStatus);
    const destIndex = stageOrder.indexOf(destStatus);

    if (destIndex < sourceIndex) {
      if (sourceStatus === "shoot_done" && destStatus === "advance_paid") {
        const draggedLead = leads.find((l) => l._id === leadId);
        setConfirmBackMoveLead(draggedLead);
        return;
      } else {
        toast.error("Leads cannot be moved backwards in the pipeline.");
        return;
      }
    }

    if (destStatus === "advance_paid") {
      const draggedLead = leads.find((l) => l._id === leadId);
      setPendingBookingLead(draggedLead);
      return; // Do not update Redux yet
    }

    try {
      await dispatch(updateLeadStatus({ id: leadId, status: destStatus })).unwrap();
      toast.success(`Lead moved to ${destStatus.replace("_", " ")}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const openLeadDetails = (lead) => {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-950 pt-4 pb-4 mb-4 flex flex-row items-center justify-between shadow-sm sm:-mx-6 sm:px-6 -mx-4 px-4 -mt-4 sm:-mt-6 gap-2">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">Lead Pipeline</h1>
          <p className="hidden sm:block text-slate-500 font-light mt-1 text-sm">Manage inquiries and bookings</p>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 shrink-0">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm tracking-wide flex items-center transition-colors shadow-lg shadow-cyan-600/20 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Add Lead</span>
          </button>
          
          <div className="flex items-center space-x-2 bg-slate-200 dark:bg-slate-900 p-1 rounded-md">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded flex items-center transition-colors ${viewMode === "kanban" ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              <LayoutGrid className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Board</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded flex items-center transition-colors ${viewMode === "list" ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              <List className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">List</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {loading && leads.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-cyan-500">Loading Leads...</div>
        ) : (
          <>
            {viewMode === "kanban" ? (
              <KanbanBoard leads={leads} onDragEnd={handleDragEnd} onLeadClick={openLeadDetails} />
            ) : (
              <ListView leads={leads} onLeadClick={openLeadDetails} />
            )}
          </>
        )}
      </div>

      {isDrawerOpen && (
        <LeadDetailDrawer
          lead={selectedLead}
          onClose={() => setIsDrawerOpen(false)}
          onRequireBooking={(leadObj) => {
            setPendingBookingLead(leadObj);
            setIsDrawerOpen(false); // optionally close drawer, or keep it open.
          }}
        />
      )}

      <AddLeadModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      {pendingBookingLead && (
         <BookingFinalizeModal
            isOpen={!!pendingBookingLead}
            onClose={() => setPendingBookingLead(null)}
            lead={pendingBookingLead}
            onBookingConfirm={(updatedLead) => {
               dispatch(fetchLeads()); // Re-sync leads completely after booking API mutate
               setPendingBookingLead(null);
            }}
         />
      )}

      {confirmBackMoveLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Confirm Move Back</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to move "{confirmBackMoveLead.name}" back to Advance Paid?
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setConfirmBackMoveLead(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors text-sm font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  try {
                    await dispatch(updateLeadStatus({ id: confirmBackMoveLead._id, status: "advance_paid" })).unwrap();
                    toast.success("Lead moved back to Advance Paid");
                  } catch (err) {
                    toast.error("Failed to update status");
                  }
                  setConfirmBackMoveLead(null);
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors text-sm font-bold"
              >
                Yes, Move Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
