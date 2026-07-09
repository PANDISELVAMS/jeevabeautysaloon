const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Package name required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price required"],
      min: 0,
    },
    duration_minutes: {
      type: Number,
      required: [true, "Duration required"],
      min: 1,
      default: 60,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Package", packageSchema);
