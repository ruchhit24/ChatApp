import express from "express";
import { router as userRouter } from "./routes/user.route.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { router as chatRouter } from "./routes/chat.route.js";
// import { createMessageInChat } from './seeders/chat.js';
// import { createGroupChats, createSingleChats } from './seeders/chat.js';
// import { createUser } from './seeders/user.js';
import { Server } from "socket.io";
import { createServer } from "http";
import path from 'path';
import {
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  ONLINE_USERS,
  START_TYPING,
  STOP_TYPING,
} from "./constants/events.js";
import { v4 as uuid } from "uuid";
import { getSockets } from "./utils/features.js";
import { Message } from "./models/message.model.js";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import { socketAuthenticator } from "./middlewares/auth.js";

dotenv.config();

const server = express();

const PORT = 8000;

const __dirname = path.resolve();

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "PUT", "DELETE", "POST"],
  credentials: true, // Enable CORS credentials (cookies, authorization headers, etc.)
};

server.use(express.json());
server.use(cookieParser());
server.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "PUT", "DELETE", "POST"],
    credentials: true, // Enable CORS credentials (cookies, authorization headers, etc.)
  })
);

// createUser(10)

// createSingleChats(10)
// createGroupChats(10)

// createMessageInChat('65f9873eca6aa167e365afeb',50)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("mongodb is connected!!");
  })
  .catch((err) => {
    console.log(err);
  });

const userSocketIds = new Map(); // Initialize a Map to store user socket IDs
const onlineUsers = new Set();
// console.log("online users = ", onlineUsers);

const server2 = createServer(server);
const io = new Server(server2, { cors: corsOptions });
server.set("io", io);

io.use((socket, next) => {
  cookieParser()(
    socket.request,
    socket.request.res,
    async (err) => await socketAuthenticator(err, socket, next)
  );
});

io.on("connection", (socket) => {
  // console.log("A user is connected with socketId = ", socket.id);

  const user = socket.user;
  console.log("user = ", user);

  const { _id } = user;

  // Store user's socket ID
  userSocketIds.set(_id.toString(), socket.id);

  // NEW EVENT FOR CHAT-MESSAGE
  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    const messageForRealTime = {
      content: message,
      _id: uuid(),
      sender: { _id: user._id, name: user.name },
      chat: chatId,
      createdAt: new Date().toISOString(),
    };
    console.log(NEW_MESSAGE, messageForRealTime);

    // Broadcast message to other members
    const messageForDb = {
      content: message,
      sender: _id,
      chat: chatId,
    };

    // Get sockets of all members
    const membersSocket = getSockets(members);

    // Emit message to all members
    io.to(membersSocket).emit(NEW_MESSAGE, {
      chatId,
      message: messageForRealTime,
    });

    // Emit alert about new message
    io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

    // Store message in database
    await Message.create(messageForDb);
    console.log("saved to db");
  });

  //NEW EVENT FOR TYPING
  socket.on(START_TYPING, ({ members, chatId }) => {
    console.log("start-typing", chatId);
    const membersSockets = getSockets(members);
    io.to(membersSockets).emit(START_TYPING, { chatId });
  });

  socket.on(STOP_TYPING, ({ members, chatId }) => {
    // console.log("stop-typing", chatId);
    const membersSockets = getSockets(members);
    io.to(membersSockets).emit(STOP_TYPING, { chatId });
  });

  socket.on(CHAT_JOINED, ({ userId, members }) => {
    console.log('chat joined = ',userId)
    onlineUsers.add(userId.toString());

    const membersSocket = getSockets(members);
    console.log("online users joined = ", onlineUsers);
    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  socket.on(CHAT_LEAVED, ({ userId, members }) => {
    console.log('chat leaved = ',userId)

    onlineUsers.delete(userId.toString());

    const membersSocket = getSockets(members);
    console.log("online users leaved = ", onlineUsers);
    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    // Remove user's socket ID on disconnect
    userSocketIds.delete(_id.toString());
    onlineUsers.delete(user._id.toString());
    socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
    
  });
});

// server.get("/", (req, res) => {
//   res.send("root page !!");
// });

server.use("/api/v1/user", userRouter);

server.use("/api/v1/chat", chatRouter);

server.use(express.static(path.join(__dirname, '/client/build')));
server.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

server2.listen(PORT, () => {
  console.log(`server is listening at port =${PORT} `);
});

export { userSocketIds, io , onlineUsers };
