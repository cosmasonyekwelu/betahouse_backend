const Property = require("../models/Property");

exports.search = async (req, res, next) => {
  try {
    const {
      q,
      location,
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

    if (q) filter.$text = { $search: q };

    if (location) {
      const regex = new RegExp(location, "i");
      filter.$or = [
        { "location.state": regex },
        { "location.city": regex },
        { "location.area": regex },
        { "location.address": regex },
      ];
    }

    if (city) filter["location.city"] = new RegExp(city, "i");
    if (area) filter["location.area"] = new RegExp(area, "i");
    if (type) filter.type = new RegExp(type, "i");

    if (bedrooms !== undefined && bedrooms !== "" && !isNaN(bedrooms)) {
      filter.bedrooms = Number(bedrooms);
    }

    if (status) filter.status = status;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortRule =
      sort === "price-asc"
        ? { price: 1 }
        : sort === "price-desc"
        ? { price: -1 }
        : { createdAt: -1 };

    const limit = Number(pageSize);
    const skip = (Number(page) - 1) * limit;

    const total = await Property.countDocuments(filter);

    const items = await Property.find(filter)
      .sort(sortRule)
      .skip(skip)
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      meta: {
        total,
        page: Number(page),
        pageSize: limit,
        pages: Math.ceil(total / limit),
      },
      items,
    });
  } catch (error) {
    next(error);
  }
};
