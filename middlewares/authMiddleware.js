const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // হেডার চেক করছি টোকেন আছে কি না
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // টোকেন আলাদা করা
      token = req.headers.authorization.split(" ")[1];

      // টোকেন ভেরিফাই করা
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ইউজার ডাটা রিকোয়েস্ট অবজেক্টে পাঠিয়ে দেওয়া (পাসওয়ার্ড ছাড়া)
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res
        .status(401)
        .json({ message: "টোকেন কাজ করছে না ভাই, আবার লগইন করুন!" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "কোনো টোকেন নেই, আপনি অনুমোদিত নন!" });
  }
};

module.exports = { protect };
