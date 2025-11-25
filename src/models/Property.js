const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String },
    description: { type: String },

    price: { type: Number, required: true, index: true },
    currency: { type: String, default: "NGN" },

    status: {
      type: String,
      enum: ["sale", "rent"],
      default: "sale",
      index: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    location: {
      state: { type: String, index: true },
      city: { type: String, index: true },
      area: { type: String, index: true },
      address: { type: String },
    },

    bedrooms: { type: Number, required: true, index: true },
    bathrooms: { type: Number, required: true },
    sqft: { type: Number },

    features: [{ type: String }],

    images: {
      type: [String],
      default: ["https://placehold.co/600x400?text=No+Image"],
    },

    featured: { type: Boolean, default: false, index: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

PropertySchema.pre("save", function (next) {
  if (this.isModified("title") && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  }
  next();
});

PropertySchema.index({
  title: "text",
  description: "text",
  type: "text",
  "location.city": "text",
  "location.area": "text",
  "location.state": "text",
});

PropertySchema.index({ price: 1 });
PropertySchema.index({ bedrooms: 1 });
PropertySchema.index({ featured: 1 });
PropertySchema.index({ createdAt: -1 });
PropertySchema.index({ "location.city": 1 });
PropertySchema.index({ "location.area": 1 });
PropertySchema.index({ "location.state": 1 });

module.exports = mongoose.model("Property", PropertySchema);
