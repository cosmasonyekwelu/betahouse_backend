const Property = require("../models/Property");

exports.search = async (req, res, next) => {
  try {
    const {
      q,
      city,
      area,
      type,
      bedrooms,
      status,
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      pageSize = 9,
    } = req.query;

    const filter = {};

    // 🔍 Text Search
    if (q) {
      filter.$text = { $search: q };
    }

    // 🔍 City
    if (city) {
      filter["location.city"] = { $regex: city, $options: "i" };
    }

    // 🔍 Area
    if (area) {
      filter["location.area"] = { $regex: area, $options: "i" };
    }

    // 🔍 Type
    if (type) filter.type = type;

    // 🔍 Status
    if (status) filter.status = status;

    // 🔍 Bedrooms
    if (bedrooms) filter.bedrooms = { $gte: Number(bedrooms) };

    // 🔍 Price Range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sorting
    const sortRule =
      sort === "price-asc"
        ? { price: 1 }
        : sort === "price-desc"
        ? { price: -1 }
        : { createdAt: -1 };

    const total = await Property.countDocuments(filter);

    const items = await Property.find(filter)
      .sort(sortRule)
      .skip((page - 1) * pageSize)
      .limit(Number(pageSize))
      .lean();

    res.json({
      success: true,
      meta: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        pages: Math.ceil(total / pageSize),
      },
      items,
    });
  } catch (error) {
    next(error);
  }
};
