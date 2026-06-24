const Album = require("../models/Album.model");
const Ledger = require("../models/Ledger.model");

exports.createAlbum = async (req, res) => {
  try {
    const { bookingId, clientName, clientPhone, eventDate, deliveryMethod, driveLink, selectionType, notes } = req.body;

    const method = deliveryMethod || "digital";

    if (method === "digital" && (!driveLink || !driveLink.includes("drive.google.com"))) {
      return res.status(400).json({ success: false, message: "For Digital Delivery, a valid Google Drive link is required." });
    }

    const payload = {
      clientName,
      deliveryMethod: method,
      selectionType,
      notes
    };

    if (bookingId) payload.bookingId = bookingId;
    if (clientPhone) payload.clientPhone = clientPhone;
    if (eventDate) payload.eventDate = eventDate;
    if (method === "digital") payload.driveLink = driveLink;
    if (method === "physical" && driveLink) payload.driveLink = driveLink; // Optional tracking

    const album = await Album.create(payload);

    res.status(201).json({ success: true, message: "Album created securely.", album });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create album", error: error.message });
  }
};

exports.getAlbums = async (req, res) => {
  try {
    const albums = await Album.find()
      .populate("bookingId", "package eventDate shootType")
      .populate("assignedDesigner", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: albums.length, albums });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch albums", error: error.message });
  }
};

exports.updateAlbum = async (req, res) => {
  try {
    let { status, assignedDesigner, notes, driveLink, deliveryMethod, assignedDesignerAmount } = req.body;
    
    // Safety check for empty strings causing ObjectId BSON cast crashes
    if (assignedDesigner === "") {
      assignedDesigner = null;
      req.body.assignedDesigner = null;
    }

    const albumToUpdate = await Album.findById(req.params.id).populate('assignedDesigner', 'name');
    if (!albumToUpdate) return res.status(404).json({ success: false, message: "Album not found" });

    const activeMethod = deliveryMethod || albumToUpdate.deliveryMethod;

    if (activeMethod === "digital" && driveLink && !driveLink.includes("drive.google.com")) {
       return res.status(400).json({ success: false, message: "Invalid Google Drive link format." });
    }

    // Capture logs conceptually
    const newLogs = [];

    if (status && status !== albumToUpdate.status) {
       newLogs.push({ message: `Workflow Status forcefully mapped to: ${status.replace(/_/g, " ")}` });
    }
    
    // Check if designer assignment changed. Consider null scenarios.
    const oldDesignerId = albumToUpdate.assignedDesigner ? albumToUpdate.assignedDesigner._id.toString() : null;
    const newDesignerId = assignedDesigner === null ? null : assignedDesigner;

    if (assignedDesigner !== undefined && newDesignerId !== oldDesignerId) {
        if (newDesignerId === null) {
           newLogs.push({ message: `Designer pool explicitly Unassigned.` });
           req.body.$unset = { assignedDesigner: 1 };
           delete req.body.assignedDesigner; // We use $unset to wipe reference explicitly if desired, but passing null also works natively in mongoose 6+.
           // Mongoose natively sets refs to null if we pass null directly, let's just pass null.
           req.body.assignedDesigner = null; 
        } else {
           newLogs.push({ message: `Designer assigned structurally.` });
        }
    }

    let updatePayload = { $set: req.body };
    if (newLogs.length > 0) {
        updatePayload.$push = { activityLogs: { $each: newLogs } };
    }

    const updatedAlbum = await Album.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { returnDocument: 'after', runValidators: true }
    ).populate("assignedDesigner", "name");

    // Auto-generate Ledger Hook for newly assigned Designer with an amount
    if (assignedDesigner && newDesignerId !== oldDesignerId && assignedDesignerAmount && Number(assignedDesignerAmount) > 0) {
       await Ledger.create({
          teamMemberId: assignedDesigner,
          referenceType: "album",
          referenceId: updatedAlbum._id,
          description: `Album Design: ${updatedAlbum.clientName}`,
          totalAmount: Number(assignedDesignerAmount)
       });
    }

    res.status(200).json({ success: true, message: "Album completely updated.", album: updatedAlbum });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update album", error: error.message });
  }
};

exports.deleteAlbum = async (req, res) => {
  try {
    await Album.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Album removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete album", error: error.message });
  }
};
