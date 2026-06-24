const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: false
  },
  clientName: {
    type: String,
    required: true,
  },
  clientPhone: {
    type: String,
    required: false
  },
  eventDate: {
    type: Date,
    required: false
  },
  deliveryMethod: {
    type: String,
    enum: ["digital", "physical"],
    default: "digital"
  },
  driveLink: {
    type: String,
    required: function() { return this.deliveryMethod === 'digital'; },
    validate: {
      validator: function(v) {
        if (this.deliveryMethod !== 'digital') return true;
        if (!v) return false;
        return /drive\.google\.com/i.test(v);
      },
      message: props => `${props.value} is not a valid Google Drive link!`
    }
  },
  selectionType: {
    type: String,
    enum: ["client", "admin"],
    default: "client",
    required: true
  },
  status: {
    type: String,
    enum: ["created", "sent_for_selection", "selection_done", "design_assigned", "design_completed", "printing", "delivered"],
    default: "created"
  },
  assignedDesigner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember',
    default: null
  },
  assignedDesignerAmount: {
    type: Number,
    default: 0
  },
  activityLogs: [{
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  notes: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("Album", albumSchema);
