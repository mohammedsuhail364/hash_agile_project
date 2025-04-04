require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const http = require("http");
const WebSocket = require("ws");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/user");
const messagesRoutes = require("./routes/messages");
const groupRoutes = require("./routes/group");

const Message = require("./models/Message");
const Group = require("./models/Group");
const GroupMessage = require("./models/GroupMessage");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const onlineUsers = {};

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/groups", groupRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// WebSocket logic
wss.on("connection", (ws) => {
  ws.on("message", async (msg) => {
    try {
      const data = JSON.parse(msg);

      // Authentication
      if (data.type === "auth") {
        const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
        ws.username = decoded.username;
        onlineUsers[ws.username] = ws;
        return;
      }

      // Private message
      if (data.type === "message") {
        const { to, text } = data;

        const newMsg = await Message.create({
          from: ws.username,
          to,
          text,
        });

        const msgPayload = {
          type: "message",
          from: ws.username,
          to,
          text,
        };

        const recipientSocket = onlineUsers[to];
        if (recipientSocket && recipientSocket.readyState === WebSocket.OPEN) {
          recipientSocket.send(JSON.stringify(msgPayload));
        }

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(msgPayload));
        }
      }

      // Group message
      if (data.type === "group-message") {
        const { group, text } = data;

        await GroupMessage.create({
          groupId: group,
          from: ws.username,
          text,
          timestamp: new Date(),
        });

        const groupData = await Group.findById(group);
        if (groupData && groupData.members) {
          for (const member of groupData.members) {
            const clientSocket = onlineUsers[member];
            if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {
              clientSocket.send(
                JSON.stringify({
                  type: "group-message",
                  group,
                  from: ws.username,
                  text,
                })
              );
            }
          }
        }
      }
    } catch (err) {
      console.error("WebSocket error:", err.message);
    }
  });

  ws.on("close", () => {
    if (ws.username) {
      delete onlineUsers[ws.username];
    }
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
