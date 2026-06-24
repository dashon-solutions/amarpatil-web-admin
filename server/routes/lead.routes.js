const express = require("express");
const router = express.Router();
const leadController = require("../controllers/lead.controller");
const { protect } = require("../middleware/auth.middleware");

// Public route to submit a lead from website
router.post("/", leadController.createLead);

// Protected routes (Admin CMS only)
router.use(protect); // Ensure all routes below require authentication

router.get("/", leadController.getLeads);
router.get("/:id", leadController.getLeadById);
router.put("/:id", leadController.updateLead);
router.delete("/:id", leadController.deleteLead);
router.put("/status/:id", leadController.updateLeadStatus);
router.post("/:id/notes", leadController.addLeadNote);

module.exports = router;
