const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "সবগুলো ফিল্ড পূরণ করুন ভাই!" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "এই ইমেইল দিয়ে একাউন্ট আছে!" });
    }

    const user = await User.create({ name, email, password });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ১. ইমেইল দিয়ে ইউজারকে খোঁজা
    const user = await User.findOne({ email });

    // ২. ইউজার যদি থাকে এবং পাসওয়ার্ড যদি মিলে যায়
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id), // লগইন সফল হলে নতুন টোকেন দিচ্ছি
      });
    } else {
      // পাসওয়ার্ড বা ইমেইল ভুল হলে
      res.status(401).json({ message: "ইমেইল বা পাসওয়ার্ড ভুল ভাই!" });
    }
  } catch (error) {
    res.status(500).json({ message: "সার্ভারে সমস্যা হচ্ছে!" });
  }
};


// প্রোফাইল আপডেট (নাম ও পাসওয়ার্ড)
const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    
    // যদি নতুন পাসওয়ার্ড দেয়
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: "ইউজার পাওয়া যায়নি!" });
  }
};

// একাউন্ট ডিলিট (ডাটাবেস থেকে)
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      await user.deleteOne();
      res.json({ message: "একাউন্ট স্থায়ীভাবে ডিলিট করা হয়েছে।" });
    } else {
      res.status(404).json({ message: "ইউজার নেই!" });
    }
  } catch (error) {
    res.status(500).json({ message: "ডিলিট করতে সমস্যা হয়েছে!" });
  }
};

// সব একসাথে এক্সপোর্ট
module.exports = { 
  registerUser, 
  loginUser, 
  updateProfile, 
  deleteAccount 
};
