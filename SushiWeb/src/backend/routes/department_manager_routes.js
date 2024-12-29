import express from "express";
import authenticateToken from "../middleware/auth_middleware.js";

const router = express.Router();

router.get("/", authenticateToken, (req, res) => {
    if (req.role !== "Department Manager") {
        return res.status(403).send("Access Denied");
    }
    res.render("departmentManager", { title: "Department Manager Dashboard", name: req.username });
});

export default router;
