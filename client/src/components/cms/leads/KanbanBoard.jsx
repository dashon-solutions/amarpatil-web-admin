import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { Calendar, Phone, Camera, MoreVertical } from "lucide-react";

const STAGES = [
  { id: "new", title: "New Lead", color: "bg-slate-400" },
  { id: "contacted", title: "Contacted", color: "bg-blue-500" },
  { id: "quotation_sent", title: "Quotation Sent", color: "bg-indigo-500" },
  { id: "advance_paid", title: "Advance Paid", color: "bg-emerald-500" },
  { id: "shoot_done", title: "Shoot Done", color: "bg-teal-500" },
  { id: "payment_pending", title: "Payment Pending", color: "bg-orange-500" },
  { id: "closed", title: "Closed", color: "bg-slate-800" },
];

export default function KanbanBoard({ leads, onDragEnd, onLeadClick }) {
  const getLeadsByStage = (stageId) => leads.filter((lead) => lead.status === stageId);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full overflow-x-auto pb-4 space-x-6 snap-x">
        {STAGES.map((stage) => (
          <div key={stage.id} className="min-w-[320px] w-[320px] flex flex-col bg-slate-100 dark:bg-slate-900/50 rounded-xl snap-start">
            <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-xs tracking-wider flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${stage.color}`}></span>
                {stage.title}
              </h3>
              <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium px-2 py-1 rounded-full">
                {getLeadsByStage(stage.id).length}
              </span>
            </div>

            <Droppable droppableId={stage.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 p-3 overflow-y-auto transition-colors ${
                    snapshot.isDraggingOver ? "bg-slate-200 dark:bg-slate-800/50" : ""
                  }`}
                >
                  {getLeadsByStage(stage.id).map((lead, index) => (
                    <Draggable key={lead._id} draggableId={lead._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{ ...provided.draggableProps.style }}
                          className={`mb-3 outline-none ${snapshot.isDragging ? "z-50" : ""}`}
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`bg-white dark:bg-slate-950 p-4 rounded-lg shadow-sm border ${
                              snapshot.isDragging
                                ? "border-cyan-500 shadow-xl shadow-cyan-500/10"
                                : "border-slate-200 dark:border-slate-800"
                            } cursor-pointer group`}
                            onClick={() => onLeadClick(lead)}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-bold text-slate-900 dark:text-white truncate pr-2">{lead.name}</h4>
                              <button 
                                className="text-slate-400 hover:text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => { e.stopPropagation(); onLeadClick(lead); }}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                              <div className="flex items-center">
                                <Phone className="w-3 h-3 mr-2" />
                                {lead.phone}
                              </div>
                              <div className="flex items-center">
                                <Camera className="w-3 h-3 mr-2 text-cyan-500" />
                                {lead.shootType || "Not Specified"}
                              </div>
                              {lead.eventDate && (
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-2 text-emerald-500" />
                                  {new Date(lead.eventDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            
                            {lead.package && lead.package.variantName && (
                              <div className="mt-3 text-[10px] uppercase tracking-wider bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 inline-block px-2 py-1 rounded">
                                Pkg: {lead.package.variantName}
                              </div>
                            )}

                            {lead.totalAmount > 0 && (
                              <div className="mt-3 flex justify-between items-center text-xs font-bold bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                <span className="text-emerald-600 dark:text-emerald-400">₹{lead.advanceAmount.toLocaleString()}</span>
                                <span className="text-slate-400 mx-1">/</span>
                                <span className="text-slate-700 dark:text-slate-300">₹{lead.totalAmount.toLocaleString()}</span>
                              </div>
                            )}
                          </motion.div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
