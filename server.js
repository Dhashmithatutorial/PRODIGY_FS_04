const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

/* ================= FILE PATHS ================= */

const messagesFilePath = path.join(__dirname, "messages.json");
const usersFilePath = path.join(__dirname, "users.json");

/* ================= IN-MEMORY DATA ================= */

const users = {}; // { room: [{ id, username }] }
let messages = {};
let registeredUsers = [];

/* ================= LOAD FILE DATA SAFELY ================= */

function loadJSON(filePath, defaultValue) {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
            return defaultValue;
        }

        const data = fs.readFileSync(filePath, "utf-8");
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error("Error reading file:", filePath);
        return defaultValue;
    }
}

messages = loadJSON(messagesFilePath, {});
registeredUsers = loadJSON(usersFilePath, []);

/* ================= SOCKET CONNECTION ================= */

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    /* ===== REGISTER ===== */
    socket.on("register", ({ username, password }, callback) => {
        username = username.trim();

        const userExists = registeredUsers.find(
            (u) => u.username === username
        );

        if (userExists) {
            callback({ success: false, message: "Username already exists" });
            return;
        }

        registeredUsers.push({ username, password });

        fs.writeFileSync(usersFilePath, JSON.stringify(registeredUsers, null, 2));

        callback({ success: true, message: "Registration successful" });
    });

    /* ===== LOGIN ===== */
    socket.on("login", ({ username, password }, callback) => {
        const user = registeredUsers.find(
            (u) => u.username === username && u.password === password
        );

        if (!user) {
            callback({ success: false, message: "Invalid username or password" });
            return;
        }

        callback({ success: true, message: "Login successful" });
    });

    /* ===== JOIN ROOM ===== */
    socket.on("joinRoom", ({ username, room }) => {
        socket.join(room);

        if (!users[room]) {
            users[room] = [];
        }

        const existingUser = users[room].find(
            (user) => user.id === socket.id
        );

        if (!existingUser) {
            users[room].push({ id: socket.id, username });
        }

        if (!messages[room]) {
            messages[room] = [];
        }

        socket.emit("previousMessages", messages[room]);

        socket.to(room).emit("userJoined", `${username} joined the room`);

        io.to(room).emit("roomUsers", users[room]);

        console.log(`${username} joined room ${room}`);
    });

    /* ===== PRIVATE ROOM ===== */
socket.on("joinPrivate", ({ username, targetUser }) => {

    const privateRoom = [username, targetUser].sort().join("-");

    socket.join(privateRoom);

    if (!messages[privateRoom]) {
        messages[privateRoom] = [];
    }

    socket.emit("previousMessages", messages[privateRoom]);

    console.log(`Private room created: ${privateRoom}`);
});

    /* ===== SEND MESSAGE ===== */
    socket.on("chatMessage", ({ username, room, message }) => {
        if (!messages[room]) {
            messages[room] = [];
        }

        const time = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

        const msgData = {
            id: Date.now().toString(),
            username,
            message,
            time,
        };

        messages[room].push(msgData);

        fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2));

        io.to(room).emit("message", msgData);
    });

    /* ===== TYPING ===== */
    socket.on("typing", ({ username, room }) => {
        socket.to(room).emit("userTyping", username);
    });

    /* ===== DISCONNECT ===== */
    socket.on("disconnect", () => {
        for (let room in users) {
            const user = users[room].find(
                (user) => user.id === socket.id
            );

            if (user) {
                users[room] = users[room].filter(
                    (u) => u.id !== socket.id
                );

                io.to(room).emit("userLeft", `${user.username} left the room`);
                io.to(room).emit("roomUsers", users[room]);
            }
        }

        console.log("User disconnected:", socket.id);
    });
});

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});