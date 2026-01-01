const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const passport = require("passport");
const { saveRedirectUrl, isloggedin } = require("../midleware.js");
const wrapAsync = require("../utils/wrap.js");
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs")
})

router.post("/signup", async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registerUser = await User.register(newUser, password);
        req.login(registerUser, (err) => {
            if (err) {
                return next(err);
            }   
            req.flash("success", "User was Registered Successfully");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
});
router.get("/login", (req, res) => {
    res.render("users/login.ejs")
})

router.post("/login",saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    async (req, res) => {
        req.flash("success", "Welcome Back")
        let redirectUrl = res.locals.redirectUrl || "/listings"    
        res.redirect(redirectUrl)
      
    })
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Goodbye!");
        res.redirect("/listings");
    });
});

// Wishlist routes
router.post("/wishlist/:listingId", isloggedin, wrapAsync(async (req, res) => {
    const { listingId } = req.params;
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    const listing = await Listing.findById(listingId);
    
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    
    const index = user.wishlist.indexOf(listingId);
    if (index > -1) {
        user.wishlist.splice(index, 1);
        req.flash("success", "Removed from wishlist");
    } else {
        user.wishlist.push(listingId);
        req.flash("success", "Added to wishlist");
    }
    
    await user.save();
    res.redirect(`/listings/${listingId}`);
}));

router.get("/wishlist", isloggedin, wrapAsync(async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.render("users/wishlist.ejs", { wishlist: user.wishlist || [] });
}));

// Profile routes
router.get("/profile", isloggedin, wrapAsync(async (req, res) => {
    const user = await User.findById(req.user._id);
    const Listing = require("../models/listing.js");
    const Booking = require("../models/booking.js");
    const userListings = await Listing.find({ owner: req.user._id });
    const userBookings = await Booking.find({ guest: req.user._id })
        .populate('listing')
        .sort({ createdAt: -1 })
        .limit(6); // Show latest 6 bookings
    res.render("users/profile.ejs", { user, userListings, userBookings });
}));

router.get("/profile/edit", isloggedin, wrapAsync(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render("users/edit-profile.ejs", { user });
}));

router.put("/profile", isloggedin, wrapAsync(async (req, res) => {
    const user = await User.findById(req.user._id);
    const { fullName, bio, phone, location } = req.body;
    
    user.profile = {
        fullName: fullName || user.profile?.fullName,
        bio: bio || user.profile?.bio,
        phone: phone || user.profile?.phone,
        location: location || user.profile?.location,
        avatar: user.profile?.avatar // Keep existing avatar
    };
    
    await user.save();
    req.flash("success", "Profile updated successfully");
    res.redirect("/profile");
}));

module.exports = router;