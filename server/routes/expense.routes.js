const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expense.controller");
const { upload, processAndUploadImage } = require("../middleware/upload.middleware");

// GET all expenses and stats
router.get("/", expenseController.getAllExpenses);

// POST create new expense (with optional receipt)
router.post("/", upload.single("receipt"), processAndUploadImage, expenseController.createExpense);

// DELETE expense
router.delete("/:id", expenseController.deleteExpense);

module.exports = router;
