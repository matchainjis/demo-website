const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const messageRoute = require("./routes/messagesRoute");
const socket = require("socket.io");
const axios = require("axios");
const multiavatar = require('@multiavatar/multiavatar');

const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    console.log("welcome to chat app");
});

app.get('/avatar/:id', (req, res) => {
    try {
        const svgCode = multiavatar(req.params.id); // generates SVG string
        res.setHeader("Content-Type", "image/svg+xml");
        res.send(svgCode);
    } catch (err) {
        console.error("❌ Error generating avatar:", err.message);
        res.status(500).send("Failed to generate avatar");
    }
});

app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoute);

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("DB Connected Successfully");
    })
    .catch((err) => {
        console.log(err.message);
    });

const server = app.listen(process.env.PORT, () => {
    console.log(`Server Started on Port ${process.env.PORT}`);
});

const io = socket(server, {
    cors: {
        // origin: process.env.FRONT_END,
        origin: "*",
        credentials: true,
    },
});
global.onlineUsers = new Map();

io.on("connection", (socket) => {
    global.chatSocket = socket;
    // socket.on("add-user", (userId) => {
    //     onlineUsers.set(userId, socket.id);
    // });
    socket.on("add-user", (userAddress) => {
        onlineUsers.set(userAddress, socket.id);
    });
    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-receive", data.message);
        }
    });
});