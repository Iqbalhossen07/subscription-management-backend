const Subscription = require("../models/Subscription");

exports.addSubscription = async (req, res) => {
  try {
    const {
      service,
      billingCycle,
      cost,
      startDate,
      accountHolderName,
      bankName,
      sortCode,
      accountNumber,
    } = req.body;

    // ১. এক্সপায়ার ডেট ক্যালকুলেশন (StartDate + BillingCycle Months)
    const start = new Date(startDate);
    const expiry = new Date(start);
    expiry.setMonth(start.getMonth() + parseInt(billingCycle));

    const subscription = await Subscription.create({
      service,
      billingCycle,
      cost,
      startDate: start,
      expiryDate: expiry,
      accountHolderName,
      bankName,
      sortCode,
      accountNumber,
      createdBy: req.user._id, // authMiddleware থেকে আসবে
    });

    res.status(201).json(subscription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// সব সাবস্ক্রিপশন লিস্ট দেখা
exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      createdBy: req.user._id,
    }).populate("service", "name brandColor"); // সার্ভিসের নাম ও কালার নিয়ে আসবে
    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.deleteSubscription = async (req, res) => {
  try {
    // ১. আইডি দিয়ে সাবস্ক্রিপশনটি খুঁজে বের করা
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res
        .status(404)
        .json({ message: "সাবস্ক্রিপশনটি খুঁজে পাওয়া যায়নি" });
    }

    // ২. চেক করা: এই সাবস্ক্রিপশনটি কি এই ইউজারের?
    // (req.user._id আসে আপনার authMiddleware থেকে)
    if (subscription.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "আপনি অন্য কারো ডাটা ডিলিট করতে পারবেন না" });
    }

    // ৩. ডিলিট করা
    await subscription.deleteOne();

    res.json({ message: "সাবস্ক্রিপশনটি সফলভাবে মুছে ফেলা হয়েছে" });
  } catch (error) {
    console.error("Delete Error:", error.message);
    res.status(500).json({ message: "সার্ভার এরর, আবার চেষ্টা করুন" });
  }
};


// একটি নির্দিষ্ট সাবস্ক্রিপশন খুঁজে বের করা (এডিট পেজের জন্য)
exports.getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id).populate("service");

    if (!subscription) {
      return res.status(404).json({ message: "সাবস্ক্রিপশনটি খুঁজে পাওয়া যায়নি" });
    }

    // নিরাপত্তা চেক: ইউজার কি নিজের ডাটাই দেখছে?
    if (subscription.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    res.json(subscription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const { startDate, billingCycle } = req.body;
    let updateData = { ...req.body };

    // যদি তারিখ বা সাইকেল আপডেট করা হয়, তবে এক্সপায়ারি নতুন করে হিসাব হবে
    if (startDate && billingCycle) {
      const start = new Date(startDate);
      const expiry = new Date(start);
      expiry.setMonth(start.getMonth() + parseInt(billingCycle));
      updateData.expiryDate = expiry;
    }

    const updatedSub = await Subscription.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }, // runValidators দিলে মডেলের নিয়মগুলো চেক করবে
    );

    if (!updatedSub) {
      return res.status(404).json({ message: "আপডেট করা সম্ভব হয়নি" });
    }

    res.json(updatedSub);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// ২. ড্যাশবোর্ড স্ট্যাটাস পাওয়ার জন্য ফাংশন (FIXED)
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id; // আপনার authMiddleware অনুযায়ী _id হবে
    const subscriptions = await Subscription.find({ createdBy: userId });

    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    let totalSubscriptions = subscriptions.length;
    let monthlySpend = 0;
    let expiringSoon = 0;
    let expired = 0;

    subscriptions.forEach((sub) => {
      const expiryDate = new Date(sub.expiryDate);

      // মাসিক খরচ (Active subscriptions এর জন্য)
      if (expiryDate >= today) {
        monthlySpend += Number(sub.cost || 0);
      }

      // এক্সপায়ারড বা ৩ দিনের মধ্যে শেষ হবে এমন চেক
      if (expiryDate < today) {
        expired++;
      } else if (expiryDate <= threeDaysFromNow) {
        expiringSoon++;
      }
    });

    res.status(200).json({
      totalSubscriptions,
      monthlySpend,
      expiringSoon,
      expired
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ৩. সব সাবস্ক্রিপশন লিস্ট দেখা
exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ createdBy: req.user._id }).populate("service", "name brandColor");
    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};