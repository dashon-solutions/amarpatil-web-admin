const express = require("express");
const router = express.Router();
const ledgerController = require("../controllers/ledger.controller");
const { protect } = require("../middleware/auth.middleware");
const { upload, processAndUploadImage } = require("../middleware/upload.middleware");

router.use(protect);

router.get("/summary", ledgerController.getSummary);
router.get("/user/:memberId", ledgerController.getMemberLedger);
router.post("/manual", upload.single("proof"), processAndUploadImage, ledgerController.addManualEntry);
router.put("/:id/amount", ledgerController.editLedgerAmount);

// Add payment (optionally processes a receipt image field named "proof")
router.post("/:id/payment", upload.single("proof"), processAndUploadImage, ledgerController.addPayment);

module.exports = router;
