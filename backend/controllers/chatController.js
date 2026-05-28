const db = require("../config/db"); // Adjust path to your database configuration file

// 1. Open or locate an existing chat room between two users regarding an item
exports.createOrGetRoom = async (req, res) => {
  const { item_id, item_type, receiver_id } = req.body;
  const sender_id = req.user.user_id; // Pulled from your authentication middleware

  // Prevent users from starting chats with themselves
  if (parseInt(sender_id) === parseInt(receiver_id)) {
    return res.status(400).json({ message: "You cannot initiate a chat with yourself." });
  }

  try {
    // Check if a conversation channel already exists for this item cluster
    const [existing] = await db.promise().query(
      `SELECT * FROM chat_rooms 
       WHERE item_id = ? AND item_type = ? AND sender_id = ? AND receiver_id = ?`,
      [item_id, item_type, sender_id, receiver_id]
    );

    if (existing.length > 0) {
      return res.status(200).json(existing[0]);
    }

    // Create a new room entry if none exists
    const [result] = await db.promise().query(
      `INSERT INTO chat_rooms (item_id, item_type, sender_id, receiver_id) VALUES (?, ?, ?, ?)`,
      [item_id, item_type, sender_id, receiver_id]
    );

    res.status(201).json({
      room_id: result.insertId,
      item_id,
      item_type,
      sender_id,
      receiver_id
    });
  } catch (err) {
    console.error("Error managing chat room session:", err);
    res.status(500).json({ message: "Internal server chat tracking failure.", error: err.message });
  }
};

// 2. Fetch all active inbox rooms for the logged-in user
exports.getUserRooms = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    // Dynamic query that fetches room indices, target participant profiles, and item contexts
    const [rooms] = await db.promise().query(`
      SELECT 
        r.room_id, r.item_id, r.item_type, r.created_at,
        u.user_id AS participant_id, u.full_name AS participant_name,
        COALESCE(l.item_name, f.item_name) AS item_name,
        COALESCE(l.image, f.image) AS item_image
      FROM chat_rooms r
      INNER JOIN users u ON (r.sender_id = u.user_id OR r.receiver_id = u.user_id) AND u.user_id != ?
      LEFT JOIN lost_items l ON r.item_id = l.lost_id AND r.item_type = 'lost'
      LEFT JOIN found_items f ON r.item_id = f.found_id AND r.item_type = 'found'
      WHERE r.sender_id = ? OR r.receiver_id = ?
      ORDER BY r.created_at DESC
    `, [user_id, user_id, user_id]);

    res.json(rooms);
  } catch (err) {
    console.error("Error gathering inbox channels:", err);
    res.status(500).json({ message: "Failed to fetch user inbox conversations." });
  }
};

// 3. Load historical text messages inside a room
exports.getRoomMessages = async (req, res) => {
  const { roomId } = req.params;

  try {
    const [messages] = await db.promise().query(
      `SELECT m.*, u.full_name AS sender_name 
       FROM chat_messages m
       LEFT JOIN users u ON m.sender_id = u.user_id
       WHERE m.room_id = ? 
       ORDER BY m.created_at ASC`,
      [roomId]
    );

    res.json(messages);
  } catch (err) {
    console.error("Error gathering historic logs:", err);
    res.status(500).json({ message: "Failed to retrieve conversation history." });
  }
};