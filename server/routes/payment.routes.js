const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.post("/:bookingId", paymentController.addPayment);
router.get("/:bookingId", paymentController.getPayments);
router.get("/invoices/:bookingId", paymentController.getInvoices);
router.post("/invoices/:id/send", paymentController.sendInvoiceEmail);

module.exports = router;
