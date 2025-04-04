const mongoose = require("mongoose");

const groupMessageSchema = new mongoose.Schema({
  groupId: mongoose.Schema.Types.ObjectId,
  from: String,
  text: String,
  timestamp: Date,
});

module.exports = mongoose.model("GroupMessage", groupMessageSchema);
