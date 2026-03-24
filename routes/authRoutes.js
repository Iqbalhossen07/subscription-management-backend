const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  updateProfile,
  deleteAccount,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware"); // আপনার বানানো মিডলওয়্যার

router.post("/register", registerUser);
router.post("/login", loginUser);

// 🛡️ এই দুইটা রাউট অবশ্যই প্রোটেক্টেড হতে হবে
router
  .route("/profile")
  .put(protect, updateProfile)
  .delete(protect, deleteAccount);

module.exports = router;
