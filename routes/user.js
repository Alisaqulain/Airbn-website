const express = require("express");
const router = express.Router();
const user = require("../models/user.js");

const passport = require("passport");
const {saveRedirectUrl } = require("../midleware.js");
router.get("/singup", (req, res) => {
    console.log("hello1")
    res.render("users/signup.ejs")
})

router.post("/singup", async (req, res) => {
    console.log("hello")
    try {
        console.log("hello")
        let { username, email, password } = req.body;
        const newUser = new user({ email, username });
        const registerUser = await user.register(newUser, password)
        console.log(registerUser)
        req.login(registerUser, (err) => {
            if (err) {
                return next(err)
            }   
            req.flash("success", "User was Registered Successfully")
            res.redirect("/listings")
        })
       
    } catch (e) {
        req.flash("error", e.message)
        res.redirect("/singup")
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
            return next(err)
        }
        console.log("hel")
        req.flash("success", "Goodbye !")
        res.redirect("/listings")
    });
  

})
module.exports = router;