const express = require('express');
const router = express.Router({ mergeParams: true });
const ExpressError = require("../utils/expresserror.js")
const { listingSchema, reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrap.js")
const Listing = require("../models/listing.js")

//const {validateReview,isloggedin} = require("../midleware.js")

const { isloggedin, validatelisting, isauthor } = require("../midleware.js");
const validateReview = (req, res, next) => {    
    let { error } = reviewSchema.validate(req.body);    
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(404,errMsg)
    }
    next();
}
//post review route
const isowner=async(req,res,next)=>{
    let {id}=req.params;

    let listing=await Listing.findById(id);
    console.log(listing)  
    console.log(res.locals.currentUser._id)
    if(!listing.owner._id.equals(res.locals.currentUser._id))
    {

        req.flash("error","Sorry You Don't Have Permission")
        return  res.redirect(`/listings/${id}`)
    }
    next();
}
router.post("/",isloggedin,validateReview,
  wrapAsync(async (req, res) => {


        let listing = await Listing.findById(req.params.id)
        let newReview = new Review(req.body.review);
        newReview.author = req.user._id
        console.log(newReview)
        listing.reviews.push(newReview);
        await newReview.save();
        await listing.save();
        req.flash("success", "review added");
        res.redirect(`/listings/${listing._id}`)
    }))
//delete review route
router.delete(

    "/:reviewId",isloggedin,
    isauthor,
    wrapAsync(async (req, res) => {

        const { id, reviewId } = req.params;

        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "review deleted");
        res.redirect(`/listings/${id}`)

    })
);
module.exports = router;