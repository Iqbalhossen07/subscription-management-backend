const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    billingCycle: { type: Number, required: true },
    cost: { type: Number, required: true },
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    accountHolderName: { type: String, required: true },
    bankName: { type: String, required: true },
    sortCode: { type: String, required: true },
    accountNumber: { type: String, required: true },
    // শুধু এইটা রাখুন, 'user' ফিল্ডটা ডিলিট করে দিন যদি মডেলে থাকে
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
