const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.post("/", taskController.createTask);
router.get("/", taskController.getTasks);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

module.exports = router;
