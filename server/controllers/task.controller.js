const Task = require("../models/Task.model");

exports.createTask = async (req, res) => {
  try {
    const { title, date, time, assignedTo, notes, bookingId, color } = req.body;
    
    // Past date validation
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Optionally just check date string vs today's date
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < currentDate) {
      return res.status(400).json({ success: false, message: "Cannot create task in past" });
    }

    const newTask = new Task({ title, date, time, assignedTo, notes, bookingId, color });
    const saved = await newTask.save();
    res.status(201).json({ success: true, task: saved });
  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({ success: false, message: "Failed to create task", error: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const query = {};
    if (req.query.bookingId) {
      query.bookingId = req.query.bookingId;
    }
    const tasks = await Task.find(query).sort({ date: 1 });
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Get Tasks Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tasks", error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Task not found" });
    res.status(200).json({ success: true, task: updated });
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({ success: false, message: "Failed to update task", error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Task not found" });
    res.status(200).json({ success: true, message: "Task deleted" });
  } catch (error) {
    console.error("Delete Task Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete task", error: error.message });
  }
};
