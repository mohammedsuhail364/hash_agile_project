# Real-Time Chat Application (MERN Stack + WebSockets)

## 🔹 Project Summary

This is a real-time chat application built using the MERN stack with WebSocket integration. It supports both **one-to-one private chats** and **group chat** functionality. The application includes user authentication, group creation, and persistent message storage.

---

## 🧠 Key Features

- ✅ User Registration and Login (JWT-based)
- 💬 Real-time Private Messaging via WebSockets
- 👥 Group Messaging with Group Creation Modal
- 🧾 Chat History Saved in MongoDB
- 🌐 RESTful APIs for User, Message, and Group Management
- ⚡ Socket Connection Handling with Online Status Tracking

---

## 🛠️ Technologies Used

### Frontend:
- React.js
- WebSocket API
- Tailwind CSS (or basic CSS/SCSS)
- Axios

### Backend:
- Node.js
- Express.js
- MongoDB with Mongoose
- WebSocket (WS library)
- JWT for Authentication

---

## 📁 Project Structure

chat-app/
├── backend/                     # Express backend
│   ├── config/                  # DB connection and environment config
│   │   └── db.js
│   ├── controllers/            # Request handling logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── messageController.js
│   │   └── groupController.js
│   |
│   │  
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Message.js
│   │   ├── Group.js
│   │   └── GroupMessage.js
│   ├── routes/                 # API routes
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── messages.js
│   │   └── group.js
│   ├── server.js               # Entry point + WebSocket logic
│   ├── .env
│   └── package.json

├── frontend/                   # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatPage.jsx
│   │   │   ├── UserList.jsx
│   │   │   ├── MessageBox.jsx
│   │   │   |
│   │   │   ├── GroupList.jsx
│   │   │   └── Login.jsx
│   │   ├── api/                # Axios API calls
│   │   │   ├── auth.js
│   │   │   ├── message.js
│   │   │   └── group.js
│   │   |
│   │   │      
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   └── package.json

├── README.md
└── .gitignore


---

## ⚙️ API & Socket Overview

### REST API Endpoints:
- **Auth**:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- **Messages**:
  - `GET /api/messages/:from/:to`
- **Groups**:
  - `POST /api/groups/add-members`
  - `GET /api/groups/:username`
  - `GET /api/groups/group-messages/:groupId`

### WebSocket Events:
- **Authenticate**:
  ```json
  { "type": "auth", "token": "<jwt>" }
