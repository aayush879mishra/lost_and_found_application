// backend/routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware"); // Import your current auth interceptor

// All messaging endpoints require valid session logging tokens
router.post("/room", protect, chatController.createOrGetRoom);
router.get("/rooms", protect, chatController.getUserRooms);
router.get("/messages/:roomId", protect, chatController.getRoomMessages);

module.exports = router;