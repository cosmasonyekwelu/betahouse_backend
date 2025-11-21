const { validationResult } = require('express-validator');
const Property = require('../models/Property');
const mongoose = require('mongoose');

// Build filters from query
function buildFilters(q){
  const f = {};
  if(q.q) f.$text = { $search: q.q };
  if(q.location) f['location.city'] = { $regex: q.location, $options: 'i' };
  if(q.type) f.type = q.type;
  if(q.status) f.status = q.status;
  if(q.minPrice || q.maxPrice){
    f.price = {};
    if(q.minPrice) f.price.$gte = Number(q.minPrice);
    if(q.maxPrice) f.price.$lte = Number(q.maxPrice);
  }
  if(q.bedrooms) f.bedrooms = { $gte: Number(q.bedrooms) };
  return f;
}

exports.list = async (req,res,next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const pageSize = Math.min(100, parseInt(req.query.pageSize || '9'));
    const sortQuery = req.query.sort || 'newest';
    const sort = sortQuery === 'price-asc' ? { price: 1 } : (sortQuery === 'price-desc' ? { price: -1 } : { createdAt: -1 });

    const filter = buildFilters(req.query);

    const total = await Property.countDocuments(filter);
    const pages = Math.max(1, Math.ceil(total / pageSize));

    const items = await Property.find(filter)
      .sort(sort)
      .skip((page-1)*pageSize)
      .limit(pageSize)
      .lean();

    res.json({ meta: { total, page, pageSize, pages }, items });
  } catch(err){ next(err); }
};

exports.getById = async (req,res,next) => {
  try {
    const id = req.params.id;
    if(!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });
    const prop = await Property.findById(id);
    if(!prop) return res.status(404).json({ message: 'Property not found' });
    res.json({ property: prop });
  } catch(err){ next(err); }
};

exports.create = async (req,res,next) => {
  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const data = req.body || {};
    if(req.files && req.files.length) {
      data.images = req.files.map(f => '/' + (process.env.UPLOAD_DIR || 'uploads') + '/' + f.filename);
    }
    data.createdBy = req.userId;
    const prop = await Property.create(data);
    res.status(201).json({ property: prop });
  } catch(err){ next(err); }
};

exports.update = async (req,res,next) => {
  try {
    const id = req.params.id;
    const updates = req.body || {};
    if(req.files && req.files.length) {
      updates.images = req.files.map(f => '/' + (process.env.UPLOAD_DIR || 'uploads') + '/' + f.filename);
    }
    const prop = await Property.findByIdAndUpdate(id, updates, { new: true });
    if(!prop) return res.status(404).json({ message: 'Property not found' });
    res.json({ property: prop });
  } catch(err){ next(err); }
};

exports.remove = async (req,res,next) => {
  try {
    const id = req.params.id;
    const prop = await Property.findByIdAndDelete(id);
    if(!prop) return res.status(404).json({ message: 'Property not found' });
    res.json({ success: true });
  } catch(err){ next(err); }
};
