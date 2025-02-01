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
router.use(express.urlencoded({ extended: true }));
const isowner=async(req,res,next)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currentUser._id))
    {
        req.flash("error","Sorry You Don't Have Permission")
        return  res.redirect(`/listings/${id}`)
    }
    next()
}
const validatelisting = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);

    if (error) {

        // let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404, error);

    }
    else {

        next();
    }

};
const isloggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl
        req.flash("error", "you must be signed in")
        return res.redirect("/login")
    }
    next();
}
// INDEX ROUTE
router.get("/", 
    wrapAsync(ListingController.index)
);

// NEW ROUTE
router.get("/new", isloggedin, (req, res) => {
    res.render("listings/new.ejs");
});

// SHOW ROUTE
router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listingid = await Listing.findById(id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author',
            }
        })
        .populate('owner'); // Populate the owner field

    if (!listingid) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listingid });
}));


// UPDATE ROUTE
router.post("/:id", isloggedin, isowner,upload.single("listing[image]"), validatelisting, wrapAsync(async (req, res) => {
    let{ id } = req.params;
 let listing=   await Listing.findByIdAndUpdate(id, { ...req.body.listing });
 if(typeof req.file!="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;

    listing.image={url,filename};
    await listing.save();
}
    req.flash("success", "Listing updated");
    res.redirect(`/listings/${id}`);
}));

//CREATE ROUTE
router.post("/",isloggedin,upload.single("listing[image]"),validatelisting, wrapAsync(async (req, res, next) => {
    let url=req.file.path;  
    let filename=req.file.filename;
    console.log(url,"....",filename)
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    console.log(newListing);
    req.flash("success", "New listing created");
    res.redirect("/listings");
}));

// EDIT ROUTE
router.get("/:id/edit", isloggedin, isowner,  wrapAsync(async (req, res) => {
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
router.delete("/:id", isloggedin, isowner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletelisting = await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing deleted");
    res.redirect("/listings");
}));
// router.all("*", (err,req, res, next) => {
//     Console.log(err)
//     next(new ExpressError(404, "sorry not found"));
// });

module.exports = router;
