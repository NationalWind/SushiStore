import express from "express";
import * as authController from "../controller/auth_controller.js";
import * as auth from "../middleware/auth_middleware.js";

const router = express.Router();

router.get("/login", (req, res) => {
    res.render("login", { title: "Login" });
});

router.get("/signup", (req, res) => {
    res.render("signup", { title: "Sign Up" });
});

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.get("/logout", (req, res) => {
    res.clearCookie("authToken", { httpOnly: true, secure: true });
    res.redirect("/");
});

router.get("/home", auth.authenticateToken, (req, res) => {
    res.render("home", {
        title: "Home",
        name: req.username || null, role: req.role // Pass null if the user is not authenticated
    });
});

router.get("/", auth.authenticateToken, (req, res) => {
    res.render("home", {
        title: "Home",
        name: req.username || null, role: req.role // Pass null if the user is not authenticated
    });
});

router.get("/about", (req, res) => {
    res.render("about", { title: "About" }); // Render the aboutus.hbs template
});

router.get("/contact", (req, res) => {
    res.render("contact", { title: "Contact" }); // Render the aboutus.hbs template
});

export default router;