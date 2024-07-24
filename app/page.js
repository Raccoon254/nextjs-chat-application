'use client'
import {useEffect, useState} from "react";
import {socket} from "@/app/socket";

const Home = () => {
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
        socket.on("fetchedMessages", (fetchedMessages) => {
            setMessages(fetchedMessages);
            console.log(fetchedMessages);
            //[
            //     {
            //         "sender": "Rac",
            //         "senderId": "mpvT53WVSpaLr5F1AAAH",
            //         "recipient": "L",
            //         "recipientId": "3MHCFYbzjbo456BEAAAD",
            //         "message": "hello",
            //         "timestamp": "2024-07-24T10:45:37.921Z"
            //     },
            //     {
            //         "sender": "Rac",
            //         "senderId": "mpvT53WVSpaLr5F1AAAH",
            //         "recipient": "L",
            //         "recipientId": "3MHCFYbzjbo456BEAAAD",
            //         "message": "hi",
            //         "timestamp": "2024-07-24T10:45:42.185Z"
            //     },
            //     {
            //         "sender": "L",
            //         "senderId": "3MHCFYbzjbo456BEAAAD",
            //         "recipient": "Rac",
            //         "recipientId": "mpvT53WVSpaLr5F1AAAH",
            //         "message": "sasa",
            //         "timestamp": "2024-07-24T10:45:54.869Z"
            //     }
            // ]
        });

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("onlineUsers");
            socket.off("privateMessage");
            socket.off("typing");
            socket.off("fetchedMessages");
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
            setMessage("");
        }
    };

    const handleTyping = (e) => {
        setMessage(e.target.value);
        if (selectedUser) {
            socket.emit("typing", { recipientId: selectedUser.id, isTyping: e.target.value.length > 0 });
        }
    };

    function setSelectedUserHelper(user) {
        setSelectedUser(user);
        setTypingStatus("");
        setMessages([]);
        socket.emit("fetchMessages", { recipientId: user.id });
    }

    return (
        <div className="bg-gray-50 w-full h-screen rounded-lg p-4">
            <div className={'hidden'}>
                <p className="text-center">Status: {isConnected ? "connected" : "disconnected"}</p>
                <p className="text-center">Transport: {transport}</p>
            </div>
            {!hasJoined ? (
                <div className="flex items-center h-full justify-center my-4">
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
                    <div className="grid grid-cols-4 gap-4">
                        <div className={'border-r pr-3'}>
                            <h3 className="font-semibold text-center mb-2">Online Users</h3>
                            {onlineUsers.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {onlineUsers.map((user) => (
                                        <div key={user.id}
                                             className={`cursor-pointer transition-all ring-2 ring-gray-100 rounded-lg p-2 px-3 ${selectedUser?.id === user.id ? 'bg-blue-200' : 'bg-blue-50'}`}
                                             onClick={() => setSelectedUserHelper(user)}>
                                            <img src={`https://api.dicebear.com/9.x/identicon/svg?seed=${user.name}`}
                                                 alt={user.name}
                                                 className="w-6 h-6 ring-2 ring-gray-200 rounded-full inline-block mr-2"
                                            />
                                            {user.name}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No other users online</p>
                            )}
                        </div>
                        <div className="col-span-3">
                            {selectedUser ? (
                                <>
                                    <h3 className="font-bold">Messages with {selectedUser.name}</h3>
                                    {messages.length > 0 ? (
                                        <ul className="list-none">
                                            {messages.map((msg, index) => (
                                                <li key={index} className={msg.sender === name ? "text-right" : "text-left"}>
                                                    <strong>{msg.sender}:</strong> {msg.message}
                                                    <small className="text-gray-500 ml-2">
                                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                                    </small>
                                                </li>
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
                                            onBlur={() => socket.emit("typing", {
                                                recipientId: selectedUser.id,
                                                isTyping: false
                                            })}
                                        />
                                        <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
                                                onClick={handleMessageSend}>Send
                                        </button>
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

export default Home;