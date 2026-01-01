const express = require('express');
const router = express.Router();
const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const { isloggedin } = require("../midleware.js");
const wrapAsync = require("../utils/wrap.js");
const ExpressError = require("../utils/expresserror.js");

// Booking routes (booking creation moved to listing routes to avoid conflict)

// View booking details
router.get("/bookings/:id", isloggedin, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findById(id)
        .populate('listing')
        .populate('guest');
    
    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/bookings");
    }
    
    // Check if user is the guest or listing owner
    if (booking.guest._id.toString() !== req.user._id.toString() && 
        booking.listing.owner.toString() !== req.user._id.toString()) {
        req.flash("error", "You don't have permission to view this booking");
        return res.redirect("/bookings");
    }
    
    res.render("bookings/show.ejs", { booking });
}));

// View user's bookings
router.get("/bookings", isloggedin, wrapAsync(async (req, res) => {
    const bookings = await Booking.find({ guest: req.user._id })
        .populate('listing')
        .sort({ createdAt: -1 });
    
    res.render("bookings/index.ejs", { bookings });
}));

// Cancel booking
router.post("/bookings/:id/cancel", isloggedin, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('listing');
    
    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/bookings");
    }
    
    // Check if user is the guest
    if (booking.guest.toString() !== req.user._id.toString()) {
        req.flash("error", "You can only cancel your own bookings");
        return res.redirect("/bookings");
    }
    
    // Check if booking can be cancelled (not in the past)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (booking.checkIn < today) {
        req.flash("error", "Cannot cancel past bookings");
        return res.redirect(`/bookings/${id}`);
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    req.flash("success", "Booking cancelled successfully");
    res.redirect("/bookings");
}));

module.exports = router;

