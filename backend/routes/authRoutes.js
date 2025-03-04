const express = require("express");
const passport = require("../services/auth");

const authController = require('../controllers/authController');

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
    req.logout((err) => {
        if (err) return faDiagramNext(err);
        res.redirect("/");
    });
});

//register route
router.post('/register', authController.register);

//profile route
const ensureAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    res.status(401).json({message: "Unauthorized"});
};

router.post('/login', authController.login);

// profile route
router.get("/profile", ensureAuthenticated, (req, res) => {
    res.json({user: req.user});
});


module.exports = router;