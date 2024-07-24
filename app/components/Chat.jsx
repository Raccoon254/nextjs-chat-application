"use client";

import { useEffect, useState } from "react";
import { socket } from "@/app/components/socket";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [name, setName] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState("");
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("onlineUsers", (users) => setOnlineUsers(users));
    socket.on("message", (message) => setMessages((prev) => [...prev, message]));
    socket.on("typing", ({ user, isTyping }) => {
      setTypingStatus(isTyping ? `${user} is typing...` : "");
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const handleJoin = () => {
    if (name) {
      socket.emit("join", name);
    }
  };

  const handleMessageSend = () => {
    if (message) {
      socket.emit("message", message);
      setMessage("");
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", e.target.value.length > 0);
  };

  return (
    <div>
      <p>Status: {isConnected ? "connected" : "disconnected"}</p>
      <p>Transport: {transport}</p>
      {isConnected && (
        <>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleJoin}>Join</button>
          <div>
            <h3>Online Users</h3>
            <ul>
              {onlineUsers.map((user, index) => (
                <li key={index}>{user}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Messages</h3>
            <ul>
              {messages.map((msg, index) => (
                <li key={index}><strong>{msg.user}:</strong> {msg.message}</li>
              ))}
            </ul>
          </div>
          <div>
            <p>{typingStatus}</p>
            <input
              type="text"
              placeholder="Type a message"
              value={message}
              onChange={handleTyping}
            />
            <button onClick={handleMessageSend}>Send</button>
          </div>
        </>
      )}
    </div>
  );
}