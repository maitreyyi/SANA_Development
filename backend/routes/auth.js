const express = require("express");
const passport = require("passport");

const router = express.Router();

// Route to start Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback route
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "http://localhost:3000/login" }),
    (req, res) => {
        // Successful login - Redirect to frontend
        res.redirect("http://localhost:3000/dashboard");
    }
);

// Logout Route
router.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/");
    });
});

module.exports = router;