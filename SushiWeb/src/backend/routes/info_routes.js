import express from "express";
import { getStore, getMembership, searchMembership } from "../controller/info_controller.js";
import * as auth from "../middleware/auth_middleware.js";

const router = express.Router();

router.get("/membership", auth.authenticateToken, getMembership);

router.get("/membership/search", auth.authenticateToken, searchMembership);

router.get("/booking", (req, res) => {
    res.render("booking", { title: "Booking" });
});

router.get("/promotion", (req, res) => {
    res.render("promotion", { title: "Promotion" });
});

router.get("/stores", getStore);
export default router;