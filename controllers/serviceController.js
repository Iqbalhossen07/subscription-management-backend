const Service = require("../models/Service");

// ১. নতুন সার্ভিস তৈরি
exports.createService = async (req, res) => {
  try {
    const { name, category, brandColor } = req.body;

    const exists = await Service.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      createdBy: req.user._id, // শুধুমাত্র ওই ইউজারের জন্য চেক করবে
    });

    if (exists) {
      return res.status(400).json({ message: "এই সার্ভিসটি আগে থেকেই আছে!" });
    }

    const service = await Service.create({
      name,
      category,
      brandColor,
      createdBy: req.user._id,
    });

    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ২. সব সার্ভিস গেট করা
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({ createdBy: req.user._id });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ৩. সার্ভিস আপডেট করা
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service)
      return res.status(404).json({ message: "সার্ভিস পাওয়া যায়নি" });

    // অন্য ইউজারের সার্ভিস যেন আপডেট না করতে পারে
    if (service.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "আপনি এটি আপডেট করতে পারবেন না" });
    }

    service.name = req.body.name || service.name;
    service.category = req.body.category || service.category;
    service.brandColor = req.body.brandColor || service.brandColor;

    const updatedService = await service.save();
    res.json(updatedService);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ৪. ডিলিট করা
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (service) {
      await service.deleteOne();
      res.json({ message: "ডিলিট সফল হয়েছে" });
    } else {
      res.status(404).json({ message: "পাওয়া যায়নি" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
