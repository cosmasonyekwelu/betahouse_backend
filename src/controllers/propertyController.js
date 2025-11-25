const { validationResult } = require("express-validator");
const Property = require("../models/Property");
const mongoose = require("mongoose");

/* -----------------------------------------------------
   BUILD QUERY FILTERS
----------------------------------------------------- */
function buildFilters(q) {
  const f = {};

  // Full text search
  if (q.q) f.$text = { $search: q.q };

  // Flexible LOCATION (matches ANY of the 4 location fields)
  if (q.location) {
    const regex = new RegExp(q.location, "i");

    f.$or = [
      { "location.state": regex },
      { "location.city": regex },
      { "location.area": regex },
      { "location.address": regex },
    ];
  }

  // TYPE filter
  if (q.type) {
    f.type = new RegExp(q.type, "i");
  }

  // BEDROOMS filter
  if (q.bedrooms) {
    f.bedrooms = { $gte: Number(q.bedrooms) };
  }

  // STATUS filter
  if (q.status) {
    f.status = q.status;
  }

  // PRICE RANGE
  if (q.minPrice || q.maxPrice) {
    f.price = {};
    if (q.minPrice) f.price.$gte = Number(q.minPrice);
    if (q.maxPrice) f.price.$lte = Number(q.maxPrice);
  }

  // FEATURED filter
  if (q.featured) {
    f.featured = q.featured === "true";
  }

  return f;
}

/* -----------------------------------------------------
   LIST PROPERTIES WITH FILTERS
----------------------------------------------------- */
exports.list = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const pageSize = Math.min(100, parseInt(req.query.pageSize || "9"));

    // Sorting rules
    const sortQuery = req.query.sort;
    let sort = { createdAt: -1 }; // default newest

    if (sortQuery === "price-asc") sort = { price: 1 };
    if (sortQuery === "price-desc") sort = { price: -1 };

    // Build filters from query
    const filter = buildFilters(req.query);

    const total = await Property.countDocuments(filter);
    const pages = Math.max(1, Math.ceil(total / pageSize));

    const items = await Property.find(filter)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    res.json({
      success: true,
      meta: { total, page, pages, pageSize },
      items,
    });
  } catch (err) {
    next(err);
  }
};

/* -----------------------------------------------------
   GET ONE PROPERTY
----------------------------------------------------- */
exports.getById = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const prop = await Property.findById(id);
    if (!prop) return res.status(404).json({ message: "Property not found" });

    res.json({ success: true, property: prop });
  } catch (err) {
    next(err);
  }
};

/* -----------------------------------------------------
   NORMALIZE PROPERTY INPUT DATA
----------------------------------------------------- */
function normalizePropertyData(body) {
  const data = { ...body };

  // Convert numeric strings to numbers
  if (data.price) data.price = Number(data.price);
  if (data.bedrooms) data.bedrooms = Number(data.bedrooms);
  if (data.bathrooms) data.bathrooms = Number(data.bathrooms);

  // Featured boolean
  if (data.featured !== undefined) {
    data.featured = data.featured === "true" || data.featured === true;
  }

  return data;
}

/* -----------------------------------------------------
   CREATE PROPERTY
----------------------------------------------------- */
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const data = normalizePropertyData(req.body);

    // Required fields validation
    if (!data.type)
      return res.status(400).json({ message: "Property type is required" });
    if (!data.bedrooms)
      return res.status(400).json({ message: "Bedrooms is required" });
    if (!data.bathrooms)
      return res.status(400).json({ message: "Bathrooms is required" });

    // Cloudinary images
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
