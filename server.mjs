import {createServer} from "node:http";
import next from "next";
import {Server} from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({dev, hostname, port});
const handler = app.getRequestHandler();
let messages = [];

const users = new Map();

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);

    io.on("connection", (socket) => {
        let currentUser = null;

        socket.on("join", (name) => {
            currentUser = {name, id: socket.id};
            users.set(socket.id, currentUser);
            io.emit("onlineUsers", Array.from(users.values()));
        });

        socket.on("typing", ({recipientId, isTyping}) => {
            if (currentUser && recipientId) {
                io.to(recipientId).emit("typing", {user: currentUser.name, isTyping});
            }
        });

        socket.on("privateMessage", ({recipientId, message}) => {
            if (currentUser && recipientId) {
                io.to(recipientId).emit("privateMessage", {user: currentUser.name, message});

                // Save the message to a list of messages
                // This is a placeholder for a real implementation
                // In a real app, you would save the message to a database
                messages.push({sender: currentUser.name, recipient: recipientId, message});
            }
        });

        //function to fetch messages between two users
        socket.on("fetchMessages", ({recipientId, senderId}) => {
            if (currentUser && recipientId) {
                // Fetch messages between the two users
                // This is a placeholder for a real implementation
                // In a real app, you would query a database
                const conversation = messages.filter((message) => {
                    return (message.sender === currentUser.name && message.recipient === recipientId) ||
                        (message.sender === recipientId && message.recipient === currentUser.name);
                });

                // Send the messages to the client
                socket.emit("fetchedMessages", conversation || []);
            }
        });

        socket.on("disconnect", () => {
            users.delete(socket.id);
            io.emit("onlineUsers", Array.from(users.values()));
        });
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});