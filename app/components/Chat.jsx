import { useEffect, useState } from "react";
import { socket } from "@/app/components/socket";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [name, setName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState("");
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setHasJoined(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users.filter(user => user.name !== name));
    });
    socket.on("privateMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });
    socket.on("typing", ({ user, isTyping }) => {
      setTypingStatus(isTyping ? `${user} is typing...` : "");
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("onlineUsers");
      socket.off("privateMessage");
      socket.off("typing");
    };
  }, [name]);

  const handleJoin = () => {
    if (name) {
      socket.emit("join", name);
      setHasJoined(true);
    }
  };

  const handleMessageSend = () => {
    if (message && selectedUser) {
      socket.emit("privateMessage", { recipientId: selectedUser.id, message });
      setMessages((prev) => [...prev, { user: name, message }]);
      setMessage("");
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (selectedUser) {
      socket.emit("typing", { recipientId: selectedUser.id, isTyping: e.target.value.length > 0 });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <p className="text-center">Status: {isConnected ? "connected" : "disconnected"}</p>
      <p className="text-center">Transport: {transport}</p>
      {!hasJoined ? (
        <div className="flex justify-center my-4">
          <input
            className="border p-2 rounded"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={handleJoin}>Join</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="font-bold">Online Users</h3>
              {onlineUsers.length > 0 ? (
                <ul className="list-disc pl-5">
                  {onlineUsers.map((user) => (
                    <li key={user.id} className={`cursor-pointer ${selectedUser?.id === user.id ? 'font-bold' : ''}`} onClick={() => setSelectedUser(user)}>
                      {user.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No other users online</p>
              )}
            </div>
            <div className="col-span-2">
              {selectedUser ? (
                <>
                  <h3 className="font-bold">Messages with {selectedUser.name}</h3>
                  {messages.length > 0 ? (
                    <ul className="list-none">
                      {messages.map((msg, index) => (
                        <li key={index}><strong>{msg.user}:</strong> {msg.message}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No messages yet</p>
                  )}
                  <p>{typingStatus}</p>
                  <div className="flex">
                    <input
                      className="border p-2 flex-1 rounded"
                      type="text"
                      placeholder="Type a message"
                      value={message}
                      onChange={handleTyping}
					  onBlur={() => socket.emit("typing", { recipientId: selectedUser.id, isTyping: false })}
                    />
                    <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={handleMessageSend}>Send</button>
                  </div>
                </>
              ) : (
                <p className="text-center">Select a user to start messaging</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}