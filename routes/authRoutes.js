const express = require("express");
const router = express.Router();
const { registerUser } = require("../controllers/authController");

router.post("/register", registerUser);

// এই নিচের লাইনটা না থাকলে আপনার দেয়া এররটা আসবে
module.exports = router;
