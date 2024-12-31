import express from "express";
import { authenticateToken, authenticateUser } from "../middleware/auth_middleware.js";

const router = express.Router();

router.get("/", authenticateToken, (req, res) => {
    if (req.role !== "Staff") {
        return res.status(403).send("Access Denied");
    }
    res.render("staff", { title: "Staff Dashboard", name: req.username });
});

export default router;
