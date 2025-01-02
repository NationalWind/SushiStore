import express from 'express';
import {
    getBranchMenu,
    getCategoryItems,
    getItemDetails,
    getFirstBranchId,
    getBranches,
    addToCart,
    searchBranchMenu,
    sendSearchQuery
} from '../controller/menu_controller.js';

import { authenticateToken, authenticateUser } from "../middleware/auth_middleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const firstBranchId = await getFirstBranchId(); // Fetch the first branch ID dynamically
        if (!firstBranchId) {
            return res.status(404).send("No branch found.");
        }
        res.redirect(`/menu/branch/${firstBranchId}`);
    } catch (error) {
        console.error("Error redirecting to first branch:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Route to get the menu of a specific branch
router.get('/branch/:branchId', getBranchMenu);

//Router to get search menu
router.get('/branch/:branchId/search', searchBranchMenu);

router.post('/branch/:branchId/search', sendSearchQuery);

// Route to get items of a specific category in a branch
router.get('/branch/:branchId/category/:category', getCategoryItems);


// Route to get details of a specific item or combo
router.get('/branch/:branchId/category/:category/item/:itemId', getItemDetails);

// Add to cart route
router.post('/add-to-cart', authenticateUser, addToCart);

// POST method to switch between branches
router.post('/switch-branch', async (req, res) => {
    const { branchId } = req.body;
    console.log(branchId);

    if (!branchId) {
        return res.status(400).send("Branch ID is required.");
    }

    try {
        // After processing the branch switch, redirect to the GET route for the branch menu
        res.redirect(`/menu/branch/${branchId}`);
        console.log("Branch switched, redirecting to branch menu.");
    } catch (error) {
        console.error("Error switching branch:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/branches", async (req, res) => {
    try {
        const branches = await getBranches(); // Fetch branches from your database or API
        if (!branches || branches.length === 0) {
            return res.status(404).send("No branches found.");
        }
        res.json(branches);
    } catch (error) {
        console.error("Error fetching branches:", error);
        res.status(500).send("Internal Server Error");
    }
});

export default router;
