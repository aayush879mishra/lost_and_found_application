const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// DASHBOARD STATS
exports.getStats = async (req, res) => {
  try {
    const [userCount] = await db.promise().query("SELECT COUNT(*) AS total FROM users");
    
    const [activeCount] = await db.promise().query(`
      SELECT (SELECT COUNT(*) FROM lost_items WHERE status='active') + 
             (SELECT COUNT(*) FROM found_items WHERE status='active') AS total`);

    const [resolvedCount] = await db.promise().query(`
      SELECT (SELECT COUNT(*) FROM lost_items WHERE status='resolved') + 
             (SELECT COUNT(*) FROM found_items WHERE status='resolved') AS total`);

    res.json({
      users: userCount[0].total,
      activeItems: activeCount[0].total,
      resolvedItems: resolvedCount[0].total
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

// USER MANAGEMENT
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.promise().query("SELECT user_id, full_name, email, role, is_blocked, created_at FROM users");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

exports.toggleBlockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_blocked } = req.body; // Pass true or false from frontend
    await db.promise().query("UPDATE users SET is_blocked = ? WHERE user_id = ?", [is_blocked, id]);
    res.json({ message: `User ${is_blocked ? 'blocked' : 'unblocked'} successfully` });
  } catch (err) {
    res.status(500).json({ message: "Action failed" });
  }
};

// ITEM MODERATION

exports.deleteItem = async (req, res) => {
  try {
    const { type, id } = req.params;
    const table = type === 'lost' ? 'lost_items' : 'found_items';
    const idCol = type === 'lost' ? 'lost_id' : 'found_id';

    // 1. Get the image path from the database first
    const [rows] = await db.promise().query(
      `SELECT image FROM ${table} WHERE ${idCol} = ?`, 
      [id]
    );

    if (rows.length > 0 && rows[0].image) {
      // 2. Construct the absolute path to the file
      // Assuming your images are stored in a folder named 'uploads' at the root
      const imagePath = path.join(__dirname, '..', rows[0].image);

      // 3. Delete the file from the file system
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Failed to delete local file:", err.message);
          // We don't stop the process here; we still want to delete the DB record
        } else {
          console.log("File deleted successfully:", imagePath);
        }
      });
    }

    // 4. Delete the record from the database
    await db.promise().query(`DELETE FROM ${table} WHERE ${idCol} = ?`, [id]);

    res.json({ message: "Item and associated image deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};


exports.deleteUser = async (req, res) => {
  const connection = await db.promise().getConnection();
  try {
    const { id } = req.params;

    // Start a transaction so if one part fails, everything rolls back
    await connection.beginTransaction();

    // 1. Get all image paths for this user's items before deleting them
    const [lostItems] = await connection.query("SELECT image FROM lost_items WHERE user_id = ?", [id]);
    const [foundItems] = await connection.query("SELECT image FROM found_items WHERE user_id = ?", [id]);
    
    const allImages = [...lostItems, ...foundItems].map(item => item.image).filter(Boolean);

    // 2. Delete the user (If your DB has ON DELETE CASCADE, items will vanish automatically)
    // If not, we manually delete them:
    await connection.query("DELETE FROM lost_items WHERE user_id = ?", [id]);
    await connection.query("DELETE FROM found_items WHERE user_id = ?", [id]);
    await connection.query("DELETE FROM users WHERE user_id = ?", [id]);

    // 3. Commit the Database changes
    await connection.commit();

    // 4. Cleanup the File System (Images)
    allImages.forEach(imagePath => {
      const fullPath = path.join(__dirname, '..', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, (err) => {
          if (err) console.error("File deletion failed:", err);
        });
      }
    });

    res.json({ message: "User and all associated data purged successfully." });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  } finally {
    connection.release();
  }
};


// ADMIN RESOLVE FEATURE
exports.resolveItem = async (req, res) => {
  try {
    const { type, id } = req.body; // type and id sent from AdminDashboard
    const table = type === 'lost' ? 'lost_items' : 'found_items';
    const idCol = type === 'lost' ? 'lost_id' : 'found_id';

    // In the Admin controller, we DON'T check for user_id 
    // because the Admin has the authority to resolve any post.
    const [result] = await db.promise().query(
      `UPDATE ${table} SET status = 'resolved' WHERE ${idCol} = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item marked as resolved by Admin" });
  } catch (err) {
    console.error("Admin Resolve Error:", err);
    res.status(500).json({ message: "Failed to resolve item", error: err.message });
  }
};

exports.getResolvedReports = async (req, res) => {
  try {
    // Selecting only the shared columns required for the dashboard lists
    const [rows] = await db.promise().query(
      `SELECT lost_id AS id, item_name, location, image, status, 'lost' AS type, created_at FROM lost_items WHERE status = 'resolved' 
       UNION ALL 
       SELECT found_id AS id, item_name, location, image, status, 'found' AS type, created_at FROM found_items WHERE status = 'resolved' 
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching resolved items:", error);
    res.status(500).json({ message: "Error fetching archive", error: error.message });
  }
};

// --- NEW: ITEM APPROVAL MODERATION ---

// Fetch all items waiting for approval
exports.getPendingApprovals = async (req, res) => {
  try {
    // We select l.* (which contains the item's original phone number) 
    // and u.full_name for the creator context row text.
    const [lostRows] = await db.promise().query(`
      SELECT l.*, 'lost' AS item_type, u.full_name
      FROM lost_items l
      LEFT JOIN users u ON l.user_id = u.user_id
      WHERE l.is_approved = 'pending'
    `);

    const [foundRows] = await db.promise().query(`
      SELECT f.*, 'found' AS item_type, u.full_name
      FROM found_items f
      LEFT JOIN users u ON f.user_id = u.user_id
      WHERE f.is_approved = 'pending'
    `);

    const combinedPending = [...lostRows, ...foundRows].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    res.json(combinedPending);
  } catch (err) {
    console.error("Error retrieving pending items:", err);
    res.status(500).json({ message: "Failed to gather pending submissions." });
  }
};

// Approve or Reject an item
exports.handleApproval = async (req, res) => {
  try {
    const { id, type, decision, feedback } = req.body; 
    // decision: 'approved' or 'rejected'
    // type: 'lost' or 'found'

    const table = type === 'lost' ? 'lost_items' : 'found_items';
    const idCol = type === 'lost' ? 'lost_id' : 'found_id';

    await db.promise().query(
      `UPDATE ${table} SET is_approved = ?, admin_feedback = ? WHERE ${idCol} = ?`,
      [decision, feedback || null, id]
    );

    res.json({ message: `Item successfully ${decision}` });
  } catch (err) {
    res.status(500).json({ message: "Approval action failed", error: err.message });
  }
};

// GET: All reports for admin review
exports.getReportedItems = async (req, res) => {
  try {
    // Dynamic join to grab target context names depending on item_type source
    const [rows] = await db.promise().query(`
      SELECT 
        r.report_id,
        r.item_id AS original_id,
        r.item_type,
        r.reason,
        r.reported_at,
        u.full_name AS reporter_name,
        COALESCE(l.item_name, f.item_name) AS item_name
      FROM item_reports r
      LEFT JOIN users u ON r.reporter_id = u.user_id
      LEFT JOIN lost_items l ON r.item_id = l.lost_id AND r.item_type = 'lost'
      LEFT JOIN found_items f ON r.item_id = f.found_id AND r.item_type = 'found'
      ORDER BY r.reported_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error collecting admin flags:", err);
    res.status(500).json({ message: "Failed to gather reported items.", error: err.message });
  }
};

// Ensure this is at the absolute end of your backend/controllers/adminController.js file
exports.dismissReportFlag = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.promise().query("DELETE FROM item_reports WHERE report_id = ?", [id]);
    
    res.json({ message: "Report flag dismissed successfully. Post remains live." });
  } catch (err) {
    console.error("Error dismissing flag:", err);
    res.status(500).json({ message: "Failed to dismiss flag", error: err.message });
  }
};