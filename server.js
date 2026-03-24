const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// ১. এক্সপ্রেস অ্যাপ তৈরি
const app = express();

// ২. মিডলওয়্যার
app.use(cors());
app.use(express.json()); // JSON ডাটা পার্স করার জন্য

// ৩. MongoDB ডাটাবেস কানেকশন (Mongoose দিয়ে)
// আপনার .env ফাইলে MONGO_URI টা ঠিকমতো বসানো থাকতে হবে
const dbURI = process.env.MONGO_URI;

mongoose
  .connect(dbURI)
  .then(() => console.log("✅ MongoDB Connected Successfully via Mongoose!"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// ৪. রাউটগুলো ইমপোর্ট করা
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
// (ভবিষ্যতে সাবস্ক্রিপশন রাউট এখানে আসবে)

// ৫. রাউট ব্যবহার করা
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// বেসিক রাউট (টেস্টিংয়ের জন্য)
app.get("/", (req, res) => {
  res.send("🚀 SubTrack Backend is Running Perfectly!");
});

// ৬. সার্ভার চালু করা
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port: ${PORT}`);
});
