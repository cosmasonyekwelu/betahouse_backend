const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  slug: String,
  description: String,
  price: { type: Number, default: 0, index: true },
  currency: { type: String, default: 'NGN' },
  rent: { type: Boolean, default: false },
  location: {
    city: String,
    area: String,
    address: String
  },
  bedrooms: { type: Number, default: 0, index: true },
  bathrooms: { type: Number, default: 0 },
  sqft: Number,
  type: String,
  features: [String],
  images: [String],
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['sale','rent'], default: 'sale' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// text index for search
PropertySchema.index({ title: 'text', description: 'text' });
PropertySchema.index({ 'location.city': 1 });
PropertySchema.index({ price: 1 });
PropertySchema.index({ bedrooms: 1 });

module.exports = mongoose.model('Property', PropertySchema);
