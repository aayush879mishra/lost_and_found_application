const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

// ==========================================
// ALL ROUTES BELOW REQUIRE ADMIN AUTHS
// ==========================================

// 1. DASHBOARD STATS & OVERVIEW
router.get("/stats", protect, admin, adminController.getStats);

// 2. USER MANAGEMENT
router.get("/users", protect, admin, adminController.getAllUsers);
router.put("/users/block/:id", protect, admin, adminController.toggleBlockUser);
router.delete("/users/:id", protect, admin, adminController.deleteUser);

// 3. ITEM MODERATION & WORKFLOWS
router.get('/pending', protect, admin, adminController.getPendingApprovals);
router.post('/approve-deny', protect, admin, adminController.handleApproval);
router.post("/items/resolve", protect, admin, adminController.resolveItem);
router.delete("/items/:type/:id", protect, admin, adminController.deleteItem);

// 4. ARCHIVED / RESOLVED FEED
// Matches the: http://localhost:5000/api/admin/resolved frontend call
router.get("/resolved", protect, admin, adminController.getResolvedReports);

// 5. USER SPAM & FRAUD FLAGS SYSTEM
// Matches the: http://localhost:5000/api/admin/reports frontend call
router.get("/reports", protect, admin, adminController.getReportedItems);

// Handles clicking "Dismiss" on a user flag (Deletes only the row in item_reports)
router.delete("/reports/:id", protect, admin, adminController.dismissReportFlag);

module.exports = router;