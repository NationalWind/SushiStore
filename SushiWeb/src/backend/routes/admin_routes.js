import express from "express";
import { authenticateToken, authenticateUser } from "../middleware/auth_middleware.js";

const router = express.Router();

router.get("/", authenticateToken, (req, res) => {
    if (req.role !== "Admin") {
        return res.status(403).send("Access Denied");
    }
    res.render("admin", { title: "Admin Dashboard", name: req.username });
});

export default router;
