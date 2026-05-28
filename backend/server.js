require("dotenv").config();
const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

// Dynamically resolve your database connection path safely
const dbPath = fs.existsSync(path.join(__dirname, "config", "db.js")) 
  ? "./config/db" 
  : "./db";
const db = require(dbPath);

const PORT = process.env.PORT || 5000;

// 1. Wrap your Express app inside a native HTTP Server
const server = http.createServer(app);

// 2. Instantiate Socket.io and attach it to the HTTP server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"], // Matches your React frontend port
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 3. Handle live WebSocket events with database writing persistence
io.on("connection", (socket) => {
  console.log(`⚡ User connected to chat socket: ${socket.id}`);

  // Triggered when a user opens a chat conversation channel
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`🚪 User joined conversation room: ${roomId}`);
  });

  // Triggered when a user clicks send on a message string
  socket.on("send_message", async (messagePayload) => {
    const { room_id, sender_id, message_text } = messagePayload;

    try {
      // 1. Write the live incoming message string right into your SQL database table
      const [result] = await db.promise().query(
        `INSERT INTO chat_messages (room_id, sender_id, message_text) VALUES (?, ?, ?)`,
        [room_id, sender_id, message_text]
      );

      // 2. Append the generated index record properties back into the object wrapper
      const completePayload = {
        ...messagePayload,
        message_id: result.insertId,
        created_at: new Date()
      };

      // 3. Send to the active room immediately (updates active chat views)
      io.to(room_id).emit("receive_message", completePayload);
      
      // 4. FIX: Broadcast globally so background Navbars on other views can capture it!
      // socket.broadcast sends the message to EVERY connected socket on your app EXCEPT the sender
      socket.broadcast.emit("receive_message", completePayload);
      
    } catch (err) {
      console.error("❌ Failed to commit live message to database:", err);
      socket.emit("message_error", { message: "Message could not be saved to server database." });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected from chat socket channel.");
  });
});

// 4. Start the integrated server wrapper (Crucial: use server.listen instead of app.listen)
server.listen(PORT, () => {
  console.log(`🚀 Server running smoothly at http://localhost:${PORT}`);
});