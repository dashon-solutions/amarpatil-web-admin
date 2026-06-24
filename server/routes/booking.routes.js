const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.post("/", bookingController.createBooking);
router.get("/", bookingController.getBookings);

module.exports = router;
