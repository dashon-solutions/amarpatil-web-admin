const Expense = require("../models/Expense.model");

exports.getAllExpenses = async (req, res) => {
   try {
      const expenses = await Expense.find().sort({ createdAt: -1 });
      const stats = await Expense.aggregate([
         { 
            $group: { 
               _id: null, 
               total: { $sum: "$amount" } 
            } 
         }
      ]);
      
      const currentMonthTotal = await Expense.aggregate([
         {
            $match: {
               createdAt: {
                  $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
               }
            }
         },
         {
            $group: {
               _id: null,
               total: { $sum: "$amount" }
            }
         }
      ]);

      res.status(200).json({ 
         success: true, 
         expenses,
         totalAllTime: stats.length ? stats[0].total : 0,
         totalThisMonth: currentMonthTotal.length ? currentMonthTotal[0].total : 0
      });
   } catch (error) {
      console.error("Fetch Expenses Error:", error);
      res.status(500).json({ success: false, message: "Server error" });
   }
};

exports.createExpense = async (req, res) => {
   try {
      const { title, description, amount, category } = req.body;
      const newExpense = new Expense({
         title,
         description,
         amount: Number(amount),
         category,
         receiptImage: req.file ? req.file.cloudinaryUrl : null
      });
      await newExpense.save();
      res.status(201).json({ success: true, expense: newExpense });
   } catch (error) {
      console.error("Create Expense Error:", error);
      res.status(500).json({ success: false, message: "Error creating expense" });
   }
};

exports.deleteExpense = async (req, res) => {
   try {
      await Expense.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, message: "Expense deleted" });
   } catch (error) {
      res.status(500).json({ success: false, message: "Error deleting expense" });
   }
};
