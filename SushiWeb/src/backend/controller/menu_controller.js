import { connectToDatabase } from '../config/db.js';
import sql from 'mssql';

// Get the full menu for a specific branch and render it categorized
export const getBranchMenu = async (req, res) => {
    const { branchId } = req.params;

    try {
        const pool = await connectToDatabase();
        const query = `
            SELECT MENU.MAMENU, 
                   ISNULL(MONAN.TENMON, COMBOMONAN.TENCOMBO) AS TENMON, 
                   ISNULL(MONAN.DANHMUC, N'Combo') AS DANHMUC, 
                   ISNULL(MONAN.IMAGE_LINK, COMBOMONAN.IMAGE_LINK) AS IMAGE_LINK, 
                   MENU.GIAHIENTAI, 
                   MENU.TRANGTHAIPHUCVU
            FROM MENU
            LEFT JOIN MONAN ON MENU.MAMON = MONAN.MAMON
            LEFT JOIN COMBOMONAN ON MENU.MACOMBO = COMBOMONAN.MACOMBO
            WHERE MENU.MACHINHANH = @branchId`;

        const result = await pool.request()
            .input('branchId', sql.Char, branchId)
            .query(query);

        if (result.recordset.length === 0) {
            return res.status(404).send("No menu items found for this branch.");
        }

        // Group data by DANHMUC
        const categorizedMenu = {};
        result.recordset.forEach(item => {
            const category = item.DANHMUC;
            if (!categorizedMenu[category]) {
                categorizedMenu[category] = [];
            }
            categorizedMenu[category].push(item);
        });

        // Pass the data to the Handlebars template for rendering
        res.render('menu', {
            branchId,
            categories: Object.entries(categorizedMenu).map(([categoryName, items]) => ({
                categoryName,
                items
            }))
        });
    } catch (error) {
        console.error('Error fetching branch menu:', error);
        res.status(500).send("Internal server error");
    }
};

// Get items in a specific category for a branch
export const getCategoryItems = async (req, res) => {
    const { branchId, category } = req.params;

    try {
        const pool = await connectToDatabase();

        // Query to handle "Combo" category separately
        let query = `
            SELECT MENU.MAMENU, 
                   ISNULL(MONAN.TENMON, COMBOMONAN.TENCOMBO) AS TENMON,
                   ISNULL(MONAN.IMAGE_LINK, COMBOMONAN.IMAGE_LINK) AS IMAGE_LINK, 
                   MENU.GIAHIENTAI, 
                   MENU.TRANGTHAIPHUCVU
            FROM MENU
            LEFT JOIN MONAN ON MENU.MAMON = MONAN.MAMON
            LEFT JOIN COMBOMONAN ON MENU.MACOMBO = COMBOMONAN.MACOMBO
            WHERE MENU.MACHINHANH = @branchId`;

        // Adjust the query to filter by category
        if (category !== 'Combo') {
            query += ` AND MONAN.DANHMUC = @category`;  // Filter by category in MONAN table
        } else {
            // If the category is "Combo", ensure we're fetching only combo items
            query += ` AND COMBOMONAN.TENCOMBO IS NOT NULL`;  // Only fetch combo items
        }

        const result = await pool.request()
            .input('branchId', sql.Char, branchId)
            .input('category', sql.NVarChar, category)
            .query(query);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error fetching category items:', error);
        res.status(500).send("Internal server error");
    }
};


// Get details of a specific item or combo
export const getItemDetails = async (req, res) => {
    const { itemId } = req.params;

    try {
        const pool = await connectToDatabase();

        // Query for either a dish or a combo
        const query = `
            SELECT MENU.MAMENU, 
                   ISNULL(MONAN.TENMON, COMBOMONAN.TENCOMBO) AS TENMON, 
                   ISNULL(MONAN.DANHMUC, N'Combo') AS DANHMUC, 
                   ISNULL(MONAN.IMAGE_LINK, COMBOMONAN.IMAGE_LINK) AS IMAGE_LINK, 
                   MENU.GIAHIENTAI, 
                   MENU.TRANGTHAIPHUCVU
            FROM MENU
            LEFT JOIN MONAN ON MENU.MAMON = MONAN.MAMON
            LEFT JOIN COMBOMONAN ON MENU.MACOMBO = COMBOMONAN.MACOMBO
            WHERE MENU.MAMENU = @itemId`;

        const result = await pool.request()
            .input('itemId', sql.Char, itemId)
            .query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error('Error fetching item details:', error);
        res.status(500).send("Internal server error");
    }
};

// Fetch the first branch ID
export const getFirstBranchId = async () => {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request().query("SELECT TOP 1 MACHINHANH FROM CHINHANH");

        if (result.recordset.length === 0) {
            return null; // No branches found
        }

        return result.recordset[0].MACHINHANH;
    } catch (error) {
        console.error("Error fetching first branch ID:", error);
        throw error;
    }
};

export const getBranches = async () => {
    try {
        const pool = await connectToDatabase();
        // SQL query to get all branch details (adjust the fields as needed)
        const result = await pool.request().query("SELECT MACHINHANH, TENCHINHANH FROM CHINHANH");

        if (result.recordset.length === 0) {
            return []; // No branches found, return an empty array
        }

        // Map the results to a more user-friendly format
        const branches = result.recordset.map(branch => ({
            branchId: branch.MACHINHANH,
            branchName: branch.TENCHINHANH
        }));

        return branches;
    } catch (error) {
        console.error("Error fetching branches:", error);
        throw error; // Propagate the error to be handled by the caller
    }
};

// Add an item to the cart
export const addToCart = async (req, res) => {
    const { MAMENU, SOLUONG } = req.body;

    // Validate required fields
    if (!MAMENU || !SOLUONG) {
        return res.status(400).json({ message: "Missing required fields." });
    }

    try {
        // Connect to the database
        const pool = await connectToDatabase();

        // Query to get the current highest MACTMON
        const itemResult = await pool.request()
            .query("SELECT TOP 1 MACTMON FROM CHITIETMONAN ORDER BY MACTMON DESC");

        let newMACTMON = 'CTMON00001';  // Default to the first ID if no records exist

        if (itemResult.recordset.length > 0) {
            const highestMACTMON = itemResult.recordset[0].MACTMON;
            // Extract the numeric part of the highest MACTMON and increment it
            const numberPart = parseInt(highestMACTMON.slice(5)) + 1;
            // Generate new MACTMON (pad the number with leading zeros to ensure the format is consistent)
            newMACTMON = `CTMON${numberPart.toString().padStart(5, '0')}`;
        }

        // Insert into CHITIETMONAN table with the new MACTMON
        await pool.request()
            .input('MACTMON', sql.Char, newMACTMON)
            .input('MAMENU', sql.Char, MAMENU)
            .input('SOLUONG', sql.Int, SOLUONG)
            .query(`
                INSERT INTO CHITIETMONAN (MACTMON, MAMENU, SOLUONG)
                VALUES (@MACTMON, @MAMENU, @SOLUONG)
            `);

        // Insert the new MACTMON into TEMP_CART
        await pool.request()
            .input('MACTMON', sql.Char, newMACTMON)
            .query(`
                INSERT INTO TEMP_CART (MACTMON)
                VALUES (@MACTMON)
            `);

        res.status(201).json({ message: "Item added to cart successfully." });
    } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
