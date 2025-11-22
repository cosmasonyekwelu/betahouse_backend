const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true, trim: true },
    slug: String,
    description: String,

    price: { type: Number, required: true, index: true },
    currency: { type: String, default: "NGN" },

    status: { type: String, enum: ["sale", "rent"], default: "sale" },

    type: {
      type: String,
      enum: ["Apartment", "Duplex", "Bungalow", "Studio", "Villa", "Land"],
      required: true,
    },

    location: {
      state: String,
      city: String,
      area: String,
      address: String,
    },

    bedrooms: { type: Number, required: true, index: true },
    bathrooms: { type: Number, required: true },

    sqft: Number,
    features: [String],

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
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  }
  next();
});


PropertySchema.index({ title: "text", description: "text" });
PropertySchema.index({ "location.city": 1 });
PropertySchema.index({ price: 1 });
PropertySchema.index({ bedrooms: 1 });
PropertySchema.index({ featured: 1 });

module.exports = mongoose.model("Property", PropertySchema);
