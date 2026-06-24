const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignment.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.post("/", assignmentController.createAssignment);
router.get("/booking/:bookingId", assignmentController.getAssignmentsForBooking);

module.exports = router;
