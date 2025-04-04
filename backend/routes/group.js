const express = require("express");
const mongoose = require("mongoose");
const Group = require("../models/Group");
const GroupMessage = require("../models/GroupMessage");

const router = express.Router();

router.post("/add-members", async (req, res) => {
  const { name, members } = req.body;
  if (!name || !members || !members.length) {
    return res.status(400).json({ error: "Missing group name or members" });
  }

  try {
    const group = new Group({ name, members });
    await group.save();
    res.status(201).json({ message: "Group created", group });
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/:username", async (req, res) => {
  try {
    const groups = await Group.find({ members: req.params.username });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/group-messages/:groupId", async (req, res) => {
  try {
    const messages = await GroupMessage.find({
      groupId: new mongoose.Types.ObjectId(req.params.groupId),
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
