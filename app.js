if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}   
const express = require('express');
const app = express()
const mongoose = require('mongoose');
const path = require("path");
const MethodOverride = require("method-override");
const ejsmate = require("ejs-mate")
const ExpressError = require("./utils/expresserror.js")
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");   
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");     
const reviewsRoutes = require("./routes/review.js");
const ListingsRoutes = require("./routes/listing.js");  
const userRoutes=require("./routes/user.js");
const { Console, error } = require('console');
//const MONGO_URL = "mongodb://127.0.0.1:27017/make"
const dburl=process.env.ATLASDB_URl;  
main().then(() => {
    console.log("db connected")
})
 .catch((err) => {
        console.log(err);
    })
async function main() {
    await mongoose.connect(dburl)
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(MethodOverride("_method"))
app.engine("ejs", ejsmate)
app.use(express.static(path.join(__dirname, "/public")))
const store = new MongoStore({
    mongoUrl: dburl,
    collectionName: "sessions",
    touchAfter: 24 * 3600, // reduces session writes
});



const sessionOptions = {
    store: store,  // Ensure the store is correctly assigned
    secret: process.env.SESSION_SECRET || "thisisasecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
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
app.use("/listings", ListingsRoutes);
app.use("/listings/:id/reviews", reviewsRoutes);
app.use("/", userRoutes);
// app.all("*", (err,req, res, next) => {
//     Console.log(err)
//     next(new ExpressError(404, "sorry not found"));
// });
app.all("*",(req,res,err)=>{
    let { StatusCode = 500, message = "sorry page not found" } = err;
    res.render("error.ejs", { message })     
})
app.use((err, req, res, next) => {
    console.log("hello")
    // console.log(req)
    console.log(err)
 let { StatusCode = 500, message = "sorry page not found" } = err;
    res.render("error.ejs", { message })   
})
app.listen(8080, () => {
    console.log("server is listening")
})