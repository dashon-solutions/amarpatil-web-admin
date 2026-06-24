const Lead = require("../models/Lead.model");
const Notification = require("../models/Notification.model");
const Subscription = require("../models/Subscription.model");
const socketModule = require("../socket");
const webpushUtil = require("../utils/webpush");

// Create a new lead
exports.createLead = async (req, res) => {
  try {
    const {
      name,
      phone,
      whatsapp,
      email,
      shootType,
      eventDate,
      message,
      package,
      source,
    } = req.body;

    const newLead = new Lead({
      name,
      phone,
      whatsapp: whatsapp || phone, // fallback to phone if not provided
      email,
      shootType,
      eventDate,
      message,
      package,
      source: source || "manual",
    });

    const savedLead = await newLead.save();

    // Broadcast real-time notification
    try {
      const notificationData = {
        title: "New Lead Received 📩",
        message: `${savedLead.name} sent an inquiry for ${savedLead.shootType || 'Photography'}`,
        type: "lead",
        redirectUrl: `/admin/leads`,
      };

      const savedNotif = await Notification.create(notificationData);
      const admins = socketModule.getAdmins();
      const io = socketModule.getIO();

      admins.forEach(admin => {
        io.to(admin.socketId).emit("newNotification", savedNotif);
      });

      // Background Native Web Push Broadcast
      const subscriptions = await Subscription.find();
      Promise.all(subscriptions.map(sub => webpushUtil.sendWebPush(sub, notificationData)))
        .catch(err => console.error("Web Push broadcasting issue:", err));

    } catch (notifErr) {
      console.error("Failed to broadcast lead notification:", notifErr);
    }

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      lead: savedLead,
    });
  } catch (error) {
    console.error("Create Lead Error: ", error);
    res.status(500).json({ success: false, message: "Failed to create lead", error: error.message });
  }
};

// Get all leads
exports.getLeads = async (req, res) => {
  try {
    let leads = await Lead.find().sort({ createdAt: -1 });

    let updated = false;
    const now = new Date();

    // Auto Status Flow
    for (const lead of leads) {
      if (lead.status === "advance_paid" && lead.eventDate && new Date(lead.eventDate) < now) {
        // Event has passed
        lead.status = "shoot_done";
        
        // Let's immediately check if they still owe money
        const remaining = lead.totalAmount - lead.advanceAmount;
        if (remaining > 0) {
          lead.status = "payment_pending";
        } else {
          lead.status = "closed";
        }

        lead.notes.push({ text: `Auto-Status Update: Event date passed. New status: ${lead.status}`, date: new Date() });
        await lead.save();
        updated = true;
      }
    }

    if (updated) {
      leads = await Lead.find().sort({ createdAt: -1 }); // Re-fetch
    }

    res.status(200).json({ success: true, count: leads.length, leads });
  } catch (error) {
    console.error("Get Leads Error: ", error);
    res.status(500).json({ success: false, message: "Failed to fetch leads", error: error.message });
  }
};

// Get a single lead by ID
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    
    res.status(200).json({ success: true, lead });
  } catch (error) {
    console.error("Get Lead Error: ", error);
    res.status(500).json({ success: false, message: "Failed to fetch lead", error: error.message });
  }
};

// Update lead status (for Kanban drag & drop)
exports.updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = [
      "new",
      "contacted",
      "quotation_sent",
      "advance_paid",
      "shoot_done",
      "payment_pending",
      "closed",
      "done",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

    // Note timeline update
    lead.notes.push({
      text: `Status changed from ${lead.status} to ${status}`,
      date: new Date()
    });

    lead.status = status;
    const updatedLead = await lead.save();

    res.status(200).json({
      success: true,
      message: "Lead status updated",
      lead: updatedLead,
    });
  } catch (error) {
    console.error("Update Lead Status Error: ", error);
    res.status(500).json({ success: false, message: "Failed to update lead status", error: error.message });
  }
};

// General update lead
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      lead,
    });
  } catch (error) {
    console.error("Update Lead Error: ", error);
    res.status(500).json({ success: false, message: "Failed to update lead", error: error.message });
  }
};

// Delete lead
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Delete Lead Error: ", error);
    res.status(500).json({ success: false, message: "Failed to delete lead", error: error.message });
  }
};

// Add note to lead
exports.addLeadNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "Note text is required" });

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

    lead.notes.push({ text, date: new Date() });
    await lead.save();

    res.status(200).json({
      success: true,
      message: "Note added successfully",
      lead
    });
  } catch (error) {
    console.error("Add Lead Note Error: ", error);
    res.status(500).json({ success: false, message: "Failed to add note", error: error.message });
  }
};
