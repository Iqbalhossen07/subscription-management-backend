const express = require("express");
const router = express.Router();
const {
  createService,
  getServices,
  updateService,
  deleteService,
} = require("../controllers/serviceController");
const { protect } = require("../middlewares/authMiddleware");

// সব রুট প্রোটেক্টেড (লগইন করা ইউজার ছাড়া কেউ পারবে না)
router.route("/").post(protect, createService).get(protect, getServices);

router.route("/:id").put(protect, updateService).delete(protect, deleteService);

module.exports = router;
