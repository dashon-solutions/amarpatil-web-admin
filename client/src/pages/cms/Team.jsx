import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Phone, Mail, Camera, Wrench } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import AddTeamModal from "../../components/cms/team/AddTeamModal";

export default function Team() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const { data } = await axiosInstance.get("/team");
      setTeam(data.team);
    } catch (error) {
      toast.error("Failed to fetch team members");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedMember(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (member) => {
    setSelectedMember(member);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this team member?")) return;
    try {
      await axiosInstance.delete(`/team/${id}`);
      toast.success("Team member removed");
      fetchTeam();
    } catch (error) {
      toast.error("Failed to delete team member");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-950 pt-4 pb-4 mb-4 flex flex-col sm:flex-row justify-between shadow-sm sm:items-center sm:-mx-6 sm:px-6 -mx-4 px-4 -mt-4 sm:-mt-6">
        <div className="mb-3 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Team Management</h1>
          <p className="text-slate-500 font-light mt-1 text-sm">Organize staff and equipment</p>
        </div>

        <button 
          onClick={handleAddClick}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm tracking-wide flex items-center transition-colors shadow-lg shadow-cyan-600/20 whitespace-nowrap shrink-0 w-max"
        >
          <Plus className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Add Member</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center text-cyan-500 py-10">Loading Team...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
             {team.map((member) => (
                <div key={member._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col group hover:border-cyan-500 transition-colors">
                   <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                         {member.photo ? (
                            <img src={member.photo} className="w-full h-full object-cover" alt={member.name} />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold uppercase text-xl">
                               {member.name.charAt(0)}
                            </div>
                         )}
                      </div>
                      <div className="flex-1">
                         <h3 className="font-bold text-slate-900 dark:text-white text-lg">{member.name}</h3>
                         <div className="flex flex-wrap gap-1 mt-1">
                            {member.skills.length > 0 ? (
                               member.skills.map(s => (
                                 <span key={s} className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">{s}</span>
                               ))
                            ) : (
                               <span className="text-xs text-slate-400 italic">No skills listed</span>
                            )}
                         </div>
                         <div className="flex flex-wrap gap-1 mt-2">
                            {member.showOnAbout !== false ? (
                              <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450 text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Visible on About</span>
                            ) : (
                              <span className="bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-450 text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Hidden on About</span>
                            )}
                         </div>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleEdit(member)} className="text-slate-450 hover:text-cyan-550 dark:text-slate-400 dark:hover:text-cyan-450 transition-colors p-1" title="Edit Member">
                            <Edit2 className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleDelete(member._id)} className="text-slate-450 hover:text-red-550 dark:text-slate-400 dark:hover:text-red-450 transition-colors p-1" title="Delete Member">
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                   </div>

                   <div className="p-5 flex-1 space-y-4">
                      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                         <div className="flex items-center"><Phone className="w-3.5 h-3.5 mr-2" /> {member.phone}</div>
                         {member.email && <div className="flex items-center"><Mail className="w-3.5 h-3.5 mr-2" /> {member.email}</div>}
                      </div>

                      {(member.gear.length > 0 || member.tools.length > 0) && (
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 space-y-3">
                           {member.gear.length > 0 && (
                             <div>
                                <span className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5"><Camera className="w-3 h-3 mr-1"/> Gear</span>
                                <div className="flex flex-wrap gap-1">
                                  {member.gear.map(g => <span key={g} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">{g}</span>)}
                                </div>
                             </div>
                           )}
                           {member.tools.length > 0 && (
                             <div>
                                <span className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5"><Wrench className="w-3 h-3 mr-1"/> Tools</span>
                                <div className="flex flex-wrap gap-1">
                                  {member.tools.map(t => <span key={t} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">{t}</span>)}
                                </div>
                             </div>
                           )}
                        </div>
                      )}
                   </div>
                </div>
             ))}
             {team.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 italic border-dashed border-2 border-slate-300 dark:border-slate-700 rounded-xl">
                   No team members added yet. Click "Add Member" to build your roster!
                </div>
             )}
          </div>
        )}
      </div>

      <AddTeamModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedMember(null);
        }} 
        onMemberAdded={fetchTeam} 
        member={selectedMember}
      />
    </div>
  );
}
