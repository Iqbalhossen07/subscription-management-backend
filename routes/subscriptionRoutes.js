const express = require("express");
const router = express.Router();
const {
  addSubscription,
  getSubscriptions,
  deleteSubscription,
  getSubscriptionById,
  updateSubscription,
  getDashboardStats, // নতুন যোগ করা হলো
} = require("../controllers/subscriptionController");
const { protect } = require("../middlewares/authMiddleware");

// ১. স্ট্যাটাস রাউট (অবশ্যই আইডির উপরে থাকবে)
router.get("/stats", protect, getDashboardStats);

// ২. মেইন রাউট
router.route("/").post(protect, addSubscription).get(protect, getSubscriptions);

// ৩. আইডি ভিত্তিক রাউট
router
  .route("/:id")
  .get(protect, getSubscriptionById)
  .put(protect, updateSubscription)
  .delete(protect, deleteSubscription);

module.exports = router;
