const express = require('express');
const router = express.Router({ mergeParams: true });
const ExpressError = require("../utils/expresserror.js")
const { listingSchema, reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrap.js")
const Listing = require("../models/listing.js")

//const {validateReview,isloggedin} = require("../midleware.js")

const { isloggedin, isauthor } = require("../midleware.js");

const validateReview = (req, res, next) => {    
    let { error } = reviewSchema.validate(req.body);    
    if(error){
        let errMsg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    }
    next();
}
router.post("/", isloggedin, validateReview,
    wrapAsync(async (req, res) => {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        
        const newReview = new Review(req.body.review);
        newReview.author = req.user._id;
        listing.reviews.push(newReview);
        await newReview.save();
        await listing.save();
        req.flash("success", "Review added successfully");
        res.redirect(`/listings/${listing._id}`);
    })
)
//delete review route
router.delete("/:reviewId", isloggedin, isauthor,
    wrapAsync(async (req, res) => {
        const { id, reviewId } = req.params;
        
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Review deleted successfully");
        res.redirect(`/listings/${id}`);
    })
);
module.exports = router;