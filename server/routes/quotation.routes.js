const express = require("express");
const router = express.Router();
const quotationController = require("../controllers/quotation.controller");
const { protect } = require("../middleware/auth.middleware");

// Public PDF generation endpoint (or we can secure it if needed, but often useful to send directly to clients unless auth token passed via query param)
router.get("/pdf/:id", quotationController.generatePDF);

// Protected routes (Admin CMS only)
router.use(protect);

router.post("/", quotationController.createQuotation);
router.post("/send/:id", quotationController.sendQuotationEmail);
router.get("/lead/:leadId", quotationController.getQuotationsByLead);

module.exports = router;
