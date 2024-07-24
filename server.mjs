import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
let messages = [];

const users = new Map();

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);

    io.on("connection", (socket) => {
        let currentUser = null;

        socket.on("join", (name) => {
            currentUser = { name, id: socket.id };
            users.set(socket.id, currentUser);
            io.emit("onlineUsers", Array.from(users.values()));
        });

        socket.on("typing", ({ recipientId, isTyping }) => {
            if (currentUser && recipientId) {
                io.to(recipientId).emit("typing", { user: currentUser.name, isTyping });
            }
        });

        socket.on("privateMessage", ({ recipientId, message }) => {
            if (currentUser && recipientId) {
                const messageObject = {
                    sender: currentUser.name,
                    senderId: currentUser.id,
                    recipient: users.get(recipientId).name,
                    recipientId: recipientId,
                    message: message,
                    timestamp: new Date().toISOString()
                };

                io.to(recipientId).emit("privateMessage", messageObject);
                socket.emit("privateMessage", messageObject);

                // Save the message
                messages.push(messageObject);
            }
        });

        socket.on("fetchMessages", ({ recipientId }) => {
            if (currentUser && recipientId) {
                const conversation = messages.filter((message) => {
                    return (message.senderId === currentUser.id && message.recipientId === recipientId) ||
                        (message.senderId === recipientId && message.recipientId === currentUser.id);
                });

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