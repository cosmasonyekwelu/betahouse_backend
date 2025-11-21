const { validationResult } = require("express-validator");
const Property = require("../models/Property");
const mongoose = require("mongoose");

/* -----------------------------------------------------
   BUILD FILTERS FOR SEARCH / FILTER / LIST
----------------------------------------------------- */
function buildFilters(q) {
  const f = {};

  if (q.q) f.$text = { $search: q.q };

  if (q.location) f["location.area"] = { $regex: q.location, $options: "i" };
  if (q.city) f["location.city"] = { $regex: q.city, $options: "i" };
  if (q.type) f.type = q.type;
  if (q.status) f.status = q.status;

  if (q.minPrice || q.maxPrice) {
    f.price = {};
    if (q.minPrice) f.price.$gte = Number(q.minPrice);
    if (q.maxPrice) f.price.$lte = Number(q.maxPrice);
  }

  if (q.bedrooms) f.bedrooms = { $gte: Number(q.bedrooms) };
  if (q.featured) f.featured = q.featured === "true";

  return f;
}

/* -----------------------------------------------------
   GET LIST OF PROPERTIES
----------------------------------------------------- */
exports.list = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const pageSize = Math.min(100, parseInt(req.query.pageSize || "9"));
    const sortQuery = req.query.sort || "newest";

    const sort =
      sortQuery === "price-asc"
        ? { price: 1 }
        : sortQuery === "price-desc"
        ? { price: -1 }
        : { createdAt: -1 };

    const filter = buildFilters(req.query);

    const total = await Property.countDocuments(filter);
    const pages = Math.max(1, Math.ceil(total / pageSize));

    const items = await Property.find(filter)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    res.json({
      meta: { total, page, pageSize, pages },
      items,
    });
  } catch (err) {
    next(err);
  }
};

/* -----------------------------------------------------
   GET PROPERTY BY ID
----------------------------------------------------- */
exports.getById = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const prop = await Property.findById(id);
    if (!prop) return res.status(404).json({ message: "Property not found" });

    res.json({ property: prop });
  } catch (err) {
    next(err);
  }
};

/* -----------------------------------------------------
   PARSE PROPERTY BODY FIELDS
----------------------------------------------------- */
function normalizePropertyData(body) {
  const data = { ...body };

  // Convert price, bedrooms, bathrooms
  if (data.price) data.price = Number(data.price);
  if (data.bedrooms) data.bedrooms = Number(data.bedrooms);
  if (data.bathrooms) data.bathrooms = Number(data.bathrooms);

  // Convert booleans
  if (data.featured !== undefined) {
    data.featured = data.featured === "true" || data.featured === true;
  }

  return data;
}

/* -----------------------------------------------------
   CREATE PROPERTY (Cloudinary Images)
----------------------------------------------------- */
exports.create = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const data = normalizePropertyData(req.body);

    // Required fields check
    if (!data.type)
      return res.status(400).json({ message: "Property type is required" });
    if (!data.bedrooms)
      return res.status(400).json({ message: "Bedrooms is required" });
    if (!data.bathrooms)
      return res.status(400).json({ message: "Bathrooms is required" });

    // Cloudinary image URLs
    if (req.files && req.files.length > 0) {
      data.images = req.files.map((f) => f.path);
    }

    data.createdBy = req.user?.id || req.userId;

    const prop = await Property.create(data);

    res.status(201).json({ success: true, property: prop });
  } catch (err) {
    next(err);
  }
};

/* -----------------------------------------------------
   UPDATE PROPERTY
----------------------------------------------------- */
exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid ID" });

    const updates = normalizePropertyData(req.body);

    // Cloudinary images
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map((f) => f.path);
    }

    const prop = await Property.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!prop) return res.status(404).json({ message: "Property not found" });

    res.json({ success: true, property: prop });
  } catch (err) {
    next(err);
  }
};

/* -----------------------------------------------------
   DELETE PROPERTY
----------------------------------------------------- */
exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid ID" });

    const prop = await Property.findByIdAndDelete(id);

    if (!prop) return res.status(404).json({ message: "Property not found" });

    res.json({ success: true, message: "Property deleted" });
  } catch (err) {
    next(err);
  }
};
