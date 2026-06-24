const TeamMember = require("../models/TeamMember.model");

exports.addTeamMember = async (req, res) => {
  try {
    const { name, phone, whatsapp, email, skills, gear, tools, notes } = req.body;
    const photo = req.file ? (req.file.cloudinaryUrl || req.file.path) : null;
    const showOnAbout = req.body.showOnAbout !== undefined ? (req.body.showOnAbout === 'true' || req.body.showOnAbout === true) : true;

    const newMember = new TeamMember({
      name, phone, whatsapp, email, photo,
      skills: skills ? JSON.parse(skills) : [],
      gear: gear ? JSON.parse(gear) : [],
      tools: tools ? JSON.parse(tools) : [],
      notes,
      showOnAbout
    });

    const saved = await newMember.save();
    res.status(201).json({ success: true, message: "Team member added", member: saved });
  } catch (error) {
    console.error("Add Team Member Error: ", error);
    res.status(500).json({ success: false, message: "Failed to add team member" });
  }
};

exports.getTeam = async (req, res) => {
  try {
    const filter = req.query.public === 'true' ? { showOnAbout: true } : {};
    const team = await TeamMember.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: team.length, team });
  } catch (error) {
    console.error("Get Team Error: ", error);
    res.status(500).json({ success: false, message: "Failed to fetch team" });
  }
};

exports.updateTeamMember = async (req, res) => {
  try {
    const { name, phone, whatsapp, email, skills, gear, tools, notes } = req.body;
    const updateData = {
      name,
      phone,
      whatsapp,
      email,
      notes,
    };

    if (req.body.showOnAbout !== undefined) {
      updateData.showOnAbout = req.body.showOnAbout === 'true' || req.body.showOnAbout === true;
    }

    if (skills) updateData.skills = JSON.parse(skills);
    if (gear) updateData.gear = JSON.parse(gear);
    if (tools) updateData.tools = JSON.parse(tools);

    if (req.file) {
      updateData.photo = req.file.cloudinaryUrl || req.file.path;
    }

    const updated = await TeamMember.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Team member not found" });
    }

    res.status(200).json({ success: true, message: "Team member updated", member: updated });
  } catch (error) {
    console.error("Update Team Member Error: ", error);
    res.status(500).json({ success: false, message: "Failed to update team member" });
  }
};

exports.deleteTeamMember = async (req, res) => {
  try {
    await TeamMember.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Team member removed" });
  } catch (error) {
    console.error("Delete Team Member Error: ", error);
    res.status(500).json({ success: false, message: "Failed to delete team member" });
  }
};
