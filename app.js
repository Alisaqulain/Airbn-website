if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}   
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const MethodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const ExpressError = require("./utils/expresserror.js");
const wrapAsync = require("./utils/wrap.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");   
const LocalStrategy = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");
const User = require("./models/user.js");     
const reviewsRoutes = require("./routes/review.js");
const ListingsRoutes = require("./routes/listing.js");  
const userRoutes = require("./routes/user.js");
const bookingRoutes = require("./routes/booking.js");
// MongoDB connection - supports both local and Atlas
const dburl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/airbn";

if (!dburl) {
    console.error("ERROR: Database URL is not defined. Please set ATLASDB_URL in your .env file");
    process.exit(1);
}

main()
    .then(() => {
        console.log("✓ Database connected successfully");
    })
    .catch((err) => {
        console.error("✗ Database connection error:", err.message);
        process.exit(1);
    });

async function main() {
    await mongoose.connect(dburl);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(MethodOverride("_method"));
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname, "/public")));

// Security: Prevent NoSQL injection attacks
app.use(mongoSanitize());
const store = new MongoStore({
    mongoUrl: dburl,
    collectionName: "sessions",
    touchAfter: 24 * 3600, // reduces session writes
});



const sessionOptions = {
    store: store,
    secret: process.env.SESSION_SECRET || "thisisasecret",
    resave: false,
    saveUninitialized: false, // Changed to false for security
    name: 'session.sid', // Change default session name for security
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: 'lax', // CSRF protection
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
};

app.use(session(sessionOptions));


app.use(flash()); 
app.use(passport.initialize());
app.use(passport.session());         
passport.use(new LocalStrategy(User.authenticate()));   
passport.serializeUser(User.serializeUser());   
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
})  
// Root route - Landing page
app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.get("/", wrapAsync(async (req, res) => {
    const Listing = require("./models/listing.js");
    // Get 4 featured listings (most recent)
    const featuredListings = await Listing.find({})
        .sort({ createdAt: -1 })
        .limit(4)
        .populate('reviews');
    res.render("landing.ejs", { featuredListings });
}));

app.use("/listings", ListingsRoutes);
app.use("/listings/:id/reviews", reviewsRoutes);
app.use("/", bookingRoutes);
app.use("/", userRoutes);

// 404 handler - must come after all routes
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// Error handler - must come after 404 handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || err.statuscode || 500;
    const message = err.message || "Something went wrong!";
    console.error(`Error ${statusCode}:`, message);
    res.status(statusCode).render("error.ejs", { message, statusCode });
});
// Export app for Vercel serverless functions
module.exports = app;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== "1") {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`✓ Server is listening on port ${PORT}`);
    });
}