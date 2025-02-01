const Listing = require("./models/listing")
const Review     = require("./models/review")
const ExpressError = require("./utils/expresserror.js")
const { listingSchema, reviewSchema } = require("./schema.js");
module.exports.isloggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl
        req.flash("error", "you must be signed in")
        return res.redirect("/login")
    }
    next();
}
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;

    }
    next();
}
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currentUser._id)) {
        req.flash("error", "Sorry You Don't Have Permission")
        return res.redirect(`/listings/${id}`)
    }
    next()
}
module.exports.validatelisting = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);

    if (error) {


        throw new ExpressError(404, error);

    }
    else {

        next();
    }

};
module.exports.isauthor = async (req, res, next) => {
    let { id,reviewId } = req.params;  
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currentUser._id)) {
        req.flash("error", "You re not creator of this review") 
        return res.redirect(`/listings/${id}`)
    }
    next()
}
