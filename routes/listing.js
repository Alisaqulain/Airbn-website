const express = require('express');
const router = express.Router();
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrap.js");
const ExpressError = require("../utils/expresserror.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const multer = require("multer");  
const {storage}=require("../cloudconfi.js") 
 const upload = multer({storage});   
// const upload=multer({dest:"uploads/"})    
// const { isloggedin, isowner, validatelisting } = require("../midleware.js");
const ListingController = require("../controllers/listing.js");
const { isloggedin, isOwner, validatelisting } = require("../midleware.js");

router.use(express.urlencoded({ extended: true }));
// INDEX ROUTE
router.get("/", 
    wrapAsync(ListingController.index)
);

// NEW ROUTE
router.get("/new", isloggedin, (req, res) => {
    res.render("listings/new.ejs");
});

// BOOKING ROUTE - Must be before /:id route
router.post("/:id/book", isloggedin, wrapAsync(async (req, res) => {
    const Booking = require("../models/booking.js");
    const { id } = req.params;
    const { checkIn, checkOut, guests } = req.body;
    
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    
    // Check if user is trying to book their own listing
    if (listing.owner.toString() === req.user._id.toString()) {
        req.flash("error", "You cannot book your own listing");
        return res.redirect(`/listings/${id}`);
    }
    
    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkInDate < today) {
        req.flash("error", "Check-in date cannot be in the past");
        return res.redirect(`/listings/${id}`);
    }
    
    if (checkOutDate <= checkInDate) {
        req.flash("error", "Check-out date must be after check-in date");
        return res.redirect(`/listings/${id}`);
    }
    
    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
        listing: id,
        status: { $in: ['pending', 'confirmed'] },
        $or: [
            {
                checkIn: { $lte: checkOutDate },
                checkOut: { $gte: checkInDate }
            }
        ]
    });
    
    if (overlappingBooking) {
        req.flash("error", "These dates are already booked. Please choose different dates.");
        return res.redirect(`/listings/${id}`);
    }
    
    // Calculate total price
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * listing.price;
    
    // Create booking
    const booking = new Booking({
        listing: id,
        guest: req.user._id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: parseInt(guests) || 1,
        totalPrice: totalPrice,
        status: 'confirmed' // Auto-confirm for now
    });
    
    await booking.save();
    
    req.flash("success", `Booking confirmed! Total: ₹${totalPrice.toLocaleString("en-IN")} for ${nights} night${nights !== 1 ? 's' : ''}`);
    res.redirect(`/bookings/${booking._id}`);
}));

// SHOW ROUTE
router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const Booking = require("../models/booking.js");
    
    const listingid = await Listing.findById(id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author',
            },
            options: { sort: { createdAt: -1 } } // Show newest reviews first
        })
        .populate('owner');

    if (!listingid) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    // Calculate average rating
    let averageRating = 0;
    if (listingid.reviews && listingid.reviews.length > 0) {
        const totalRating = listingid.reviews.reduce((sum, review) => {
            return sum + (review.rating || 0);
        }, 0);
        averageRating = (totalRating / listingid.reviews.length).toFixed(1);
    }

    // Get booked dates
    const bookings = await Booking.find({
        listing: id,
        status: { $in: ['pending', 'confirmed'] }
    });
    
    const bookedDates = bookings.map(booking => ({
        checkIn: booking.checkIn.toISOString().split('T')[0],
        checkOut: booking.checkOut.toISOString().split('T')[0]
    }));

    // Populate user wishlist if logged in
    let user = null;
    if (req.user) {
        const User = require("../models/user.js");
        user = await User.findById(req.user._id);
    }

    res.render("listings/show.ejs", { listingid, averageRating, currentUser: user || req.user, bookedDates });
}));


// UPDATE ROUTE
router.post("/:id", isloggedin, isOwner, upload.single("listing[image]"), validatelisting, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    
    // Update listing fields
    Object.assign(listing, req.body.listing);
    
    // If new image uploaded, delete old one and update
    if (req.file) {
        // Delete old image from Cloudinary
        if (listing.image && listing.image.filename) {
            const { cloudinary } = require("../cloudconfi.js");
            await cloudinary.uploader.destroy(listing.image.filename);
        }
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }
    
    await listing.save();
    req.flash("success", "Listing updated");
    res.redirect(`/listings/${id}`);
}));

//CREATE ROUTE
router.post("/",isloggedin,upload.single("listing[image]"),validatelisting, wrapAsync(async (req, res, next) => {
    if (!req.file) {
        req.flash("error", "Please upload an image");
        return res.redirect("/listings/new");
    }
    let url=req.file.path;  
    let filename=req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success", "New listing created");
    res.redirect("/listings");
}));

// EDIT ROUTE
router.get("/:id/edit", isloggedin, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    let originalUrl=listing.image.url;  
    let changeurl=originalUrl.replace("upload","upload/w_200,h_200,c_thumb");   
    res.render("listings/edit.ejs", { listing,changeurl });
}));

// DELETE ROUTE
router.delete("/:id", isloggedin, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (listing && listing.image && listing.image.filename) {
        const { cloudinary } = require("../cloudconfi.js");
        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(listing.image.filename);
    }
    
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted");
    res.redirect("/listings");
}));
// router.all("*", (err,req, res, next) => {
//     Console.log(err)
//     next(new ExpressError(404, "sorry not found"));
// });

module.exports = router;
