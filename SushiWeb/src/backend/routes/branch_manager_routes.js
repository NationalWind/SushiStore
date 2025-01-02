import express from "express";
import * as auth from "../middleware/auth_middleware.js";

const router = express.Router();

router.get("/", auth.authenticateToken, (req, res) => {
    if (req.role !== "Branch Manager") {
        return res.status(403).send("Access Denied");
    }
    res.render("branchManager", { title: "Branch Manager Dashboard", name: req.username });
});

export default router;
