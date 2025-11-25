const { validationResult } = require("express-validator");
const Property = require("../models/Property");
const mongoose = require("mongoose");

function buildFilters(q) {
  const f = {};

  if (q.q) f.$text = { $search: q.q };

  if (q.location) {
    const regex = new RegExp(q.location, "i");
    f.$or = [
      { "location.state": regex },
      { "location.city": regex },
      { "location.area": regex },
      { "location.address": regex },
    ];
  }

  if (q.type) {
    f.type = new RegExp(q.type, "i");
  }

  if (q.bedrooms !== undefined && q.bedrooms !== "" && !isNaN(q.bedrooms)) {
    const num = Number(q.bedrooms);
    if (num > 0) f.bedrooms = { $gte: num };
  }

  if (q.status) f.status = q.status;

  if (q.minPrice || q.maxPrice) {
    f.price = {};
    if (q.minPrice) f.price.$gte = Number(q.minPrice);
    if (q.maxPrice) f.price.$lte = Number(q.maxPrice);
  }

  if (q.featured) f.featured = q.featured === "true";

  return f;
}

exports.list = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const pageSize = Math.min(100, parseInt(req.query.pageSize || "9"));

    const sortQuery = req.query.sort;
    let sort = { createdAt: -1 };

    if (sortQuery === "price-asc") sort = { price: 1 };
    if (sortQuery === "price-desc") sort = { price: -1 };

    const filter = buildFilters(req.query);

    const total = await Property.countDocuments(filter);
    const pages = Math.ceil(total / pageSize);

    const items = await Property.find(filter)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return res.json({
      success: true,
      meta: { total, pages, page, pageSize },
      items,
    });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid ID" });

    const prop = await Property.findById(id);
    if (!prop) return res.status(404).json({ message: "Property not found" });

    return res.json({ success: true, property: prop });
  } catch (err) {
    next(err);
  }
};

function normalizePropertyData(body) {
  const data = { ...body };

  if (data.price) data.price = Number(data.price);
  if (data.bedrooms) data.bedrooms = Number(data.bedrooms);
  if (data.bathrooms) data.bathrooms = Number(data.bathrooms);

  if (data.featured !== undefined) {
    data.featured = data.featured === "true" || data.featured === true;
  }

  return data;
}

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const data = normalizePropertyData(req.body);

    if (!data.type)
      return res.status(400).json({ message: "Property type is required" });

    if (!data.bedrooms)
      return res.status(400).json({ message: "Bedrooms is required" });

    if (!data.bathrooms)
      return res.status(400).json({ message: "Bathrooms is required" });

    if (req.files && req.files.length > 0) {
      data.images = req.files.map((f) => f.path);
    }

    data.createdBy = req.user?.id || req.userId;

    const prop = await Property.create(data);

    return res.status(201).json({ success: true, property: prop });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid ID" });

    const updates = normalizePropertyData(req.body);

    if (req.files && req.files.length > 0) {
      updates.images = req.files.map((f) => f.path);
    }

    const prop = await Property.findByIdAndUpdate(id, updates, { new: true });

    if (!prop) return res.status(404).json({ message: "Property not found" });

    return res.json({ success: true, property: prop });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid ID" });

    const prop = await Property.findByIdAndDelete(id);

    if (!prop) return res.status(404).json({ message: "Property not found" });

    return res.json({ success: true, message: "Property deleted" });
  } catch (err) {
    next(err);
  }
};
