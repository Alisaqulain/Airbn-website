const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    const { search, location, minPrice, maxPrice, sort } = req.query;
    let query = {};

    // Search by title or description
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    // Filter by location
    if (location) {
        if (query.$or) {
            query.$and = [
                { $or: query.$or },
                {
                    $or: [
                        { location: { $regex: location, $options: 'i' } },
                        { country: { $regex: location, $options: 'i' } }
                    ]
                }
            ];
            delete query.$or;
        } else {
            query.$or = [
                { location: { $regex: location, $options: 'i' } },
                { country: { $regex: location, $options: 'i' } }
            ];
        }
    }

    // Filter by price range
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Build sort object
    let sortOption = {};
    switch (sort) {
        case 'price-low':
            sortOption = { price: 1 };
            break;
        case 'price-high':
            sortOption = { price: -1 };
            break;
        case 'newest':
            sortOption = { createdAt: -1 };
            break;
        case 'oldest':
            sortOption = { createdAt: 1 };
            break;
        default:
            sortOption = { createdAt: -1 }; // Default: newest first
    }

    const allListings = await Listing.find(query)
        .populate('reviews')
        .sort(sortOption);
    
    res.render("listings/index.ejs", { 
        allListings,
        search: search || '',
        location: location || '',
        minPrice: minPrice || '',
        maxPrice: maxPrice || '',
        sort: sort || 'newest'
    });
};