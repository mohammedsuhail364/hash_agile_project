import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserList from "./UserList"; // Assume this is your reusable list of users

export default function ChatPage() {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [input, setInput] = useState("");

  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    axios
      .get("http://localhost:5000/api/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error fetching users:", err));

    fetchGroups();

    const socket = new WebSocket("ws://localhost:5000");
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "auth", token }));
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "message") {
        setMessages((prev) => {
          if (data.from === selectedUser || data.to === selectedUser) {
            return [...prev, { from: data.from, text: data.text }];
          }
          return prev;
        });
      }

      if (data.type === "group-message") {
        setGroupMessages((prev) => {
          if (data.group === selectedGroup?._id) {
            return [...prev, { from: data.from, text: data.text }];
          }
          return prev;
        });
      }
    };

    return () => socket.close();
  }, [token]);

  const fetchGroups = () => {
    axios
      .get(`http://localhost:5000/api/groups/${username}`)
      .then((res) => setGroups(res.data))
      .catch((err) => console.error("Error fetching groups:", err));
  };

  const selectUser = async (user) => {
    setSelectedUser(user);
    setSelectedGroup(null);
    setGroupMessages([]);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/messages/${username}/${user}`
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const selectGroup = async (group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
    setMessages([]);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/groups/group-messages/${group._id}`
      );
      setGroupMessages(res.data);
    } catch (err) {
      console.error("Error fetching group messages:", err);
    }
  };

  const sendMessage = () => {
    if (
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN &&
      input.trim()
    ) {
      if (selectedUser) {
        socketRef.current.send(
          JSON.stringify({ type: "message", to: selectedUser, text: input })
        );
        setMessages((prev) => [...prev, { from: username, text: input }]);
      } else if (selectedGroup) {
        socketRef.current.send(
          JSON.stringify({
            type: "group-message",
            group: selectedGroup._id,
            text: input,
          })
        );
        setGroupMessages((prev) => [...prev, { from: username, text: input }]);
      }

      setInput("");
    }
  };

  const toggleMember = (member) => {
    setSelectedMembers((prev) =>
      prev.includes(member)
        ? prev.filter((m) => m !== member)
        : [...prev, member]
    );
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      alert("Please enter a group name and select members.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/groups/add-members", {
        name: groupName,
        members: [...selectedMembers, username],
      });

      if (res.status === 201) {
        setGroupName("");
        setSelectedMembers([]);
        setShowGroupModal(false);
        fetchGroups();
        alert("Group created!");
      }
    } catch (err) {
      console.error("Group creation failed", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div className="p-4 max-w-6xl mx-auto flex">
      {/* User and Group Sidebar */}
      <div className="w-1/4 pr-4">
        <UserList users={users} onSelect={selectUser} current={username} />
        <div className="mt-6">
          <h3 className="font-bold mb-2">Groups</h3>
          <ul className="space-y-2">
            {groups.map((grp, idx) => (
              <li
                key={idx}
                className={`cursor-pointer p-2 rounded hover:bg-gray-200 ${
                  selectedGroup?._id === grp._id ? "bg-gray-300" : ""
                }`}
                onClick={() => selectGroup(grp)}
              >
                {grp.name}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShowGroupModal(true)}
            className="bg-green-500 text-white px-3 py-1 mt-4 rounded w-full"
          >
            + Create Group
          </button>
        </div>
      </div>

      {/* Chat Box */}
      <div className="flex-1 pl-4">
        <div className="flex justify-between mb-2 items-center">
          <h1 className="text-xl font-bold">Chatting as: {username}</h1>
          <button
            className="bg-black text-white px-3 py-1 rounded"
            onClick={logout}
          >
            Logout
          </button>
        </div>

        {selectedUser || selectedGroup ? (
          <>
            <h2 className="font-semibold text-lg mb-2">
              Chat with: {selectedUser || selectedGroup.name}
            </h2>
            <div className="border h-64 overflow-y-auto p-2 mb-4 bg-gray-100 rounded">
              {(selectedUser ? messages : groupMessages).map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-1 ${
                    msg.from === username ? "text-right" : "text-left"
                  }`}
                >
                  <strong>{msg.from}: </strong> {msg.text}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="Type a message..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p>Select a user or group to start chatting.</p>
        )}
      </div>

      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-3">Create New Group</h2>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full p-2 border rounded mb-4"
            />
            <h3 className="font-semibold mb-2">Select Members</h3>
            <div className="max-h-40 overflow-y-auto border p-2 rounded mb-4">
              {users
                .filter((u) => u.username !== username)
                .map((user, idx) => (
                  <label key={idx} className="block">
                    <input
                      type="checkbox"
                      value={user.username}
                      checked={selectedMembers.includes(user.username)}
                      onChange={() => toggleMember(user.username)}
                      className="mr-2"
                    />
                    {user.username}
                  </label>
                ))}
            </div>
            <div className="flex justify-between gap-2">
              <button
                onClick={createGroup}
                className="bg-green-600 text-white px-4 py-2 rounded w-full"
              >
                Create
              </button>
              <button
                onClick={() => setShowGroupModal(false)}
                className="bg-red-500 text-white px-4 py-2 rounded w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
