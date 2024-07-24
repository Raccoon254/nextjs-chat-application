import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const Chat = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ name: string; message: string }[]>([]);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('message', (msg: { name: string; message: string }) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });
  }, [socket]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message && name) {
      socket.emit('message', { name, message });
      setMessage('');
    }
  };

  return (
    <div className="p-4">
      {!name ? (
        <div>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 mr-2"
          />
          <button onClick={() => setName(name)} className="bg-blue-500 text-white p-2 rounded">
            Join Chat
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 h-64 overflow-y-auto border p-2">
            {messages.map((msg, index) => (
              <p key={index}>
                <strong>{msg.name}:</strong> {msg.message}
              </p>
            ))}
          </div>
          <form onSubmit={sendMessage}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border p-2 mr-2"
            />
            <button type="submit" className="bg-green-500 text-white p-2 rounded">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chat;