import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sql from "mssql";
import { connectToDatabase } from "../config/db.js"; // Your database connection file
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY; // Replace with a secure key

// User signup controller
export const signup = async (req, res) => {
    const { username, password, hoten, sdt, email, cccd } = req.body;
    try {
        // Check if the username already exists
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input("username", sql.NVarChar, username)
            .query("SELECT * FROM ACCOUNT WHERE username = @username");

        if (result.recordset.length > 0) {
            return res.status(400).json({ message: "Username already exists" });
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the ACCOUNT table
        const resultAccount = await pool.request()
            .input("username", sql.NVarChar, username)
            .input("password", sql.NVarChar, hashedPassword)
            .input("role", sql.NVarChar, "Customer") // Default role
            .query("INSERT INTO ACCOUNT (username, password, role) OUTPUT INSERTED.ID VALUES (@username, @password, @role)");

        const accountId = resultAccount.recordset[0].ID;
        console.log("Account inserted with ID:", resultAccount.recordset[0].ID);
        // Get the highest MAKHACHHANG and increment it
        const resultKhachHang = await pool.request()
            .query("SELECT TOP 1 MAKHACHHANG FROM KHACHHANG ORDER BY MAKHACHHANG DESC");

        let newMAKHACHHANG = 'KH00000001'; // Default if no records exist
        if (resultKhachHang.recordset.length > 0) {
            const lastMAKHACHHANG = resultKhachHang.recordset[0].MAKHACHHANG;
            const lastNumber = parseInt(lastMAKHACHHANG.substring(2)); // Get the numeric part
            const newNumber = lastNumber + 1; // Increment it
            newMAKHACHHANG = `KH${String(newNumber).padStart(8, '0')}`; // Format to "KH00000001"
        }

        // Insert into KHACHHANG table with the new MAKHACHHANG and the account ID
        await pool.request()
            .input("MAKHACHHANG", sql.Char, newMAKHACHHANG)
            .input("HOTEN", sql.NVarChar, hoten)
            .input("SDT", sql.Char, sdt)
            .input("EMAIL", sql.VarChar, email)
            .input("CCCD", sql.VarChar, cccd)
            .input("ACCOUNT_ID", sql.Int, accountId)
            .query("INSERT INTO KHACHHANG (MAKHACHHANG, HOTEN, SDT, EMAIL, CCCD, ACCOUNT_ID) VALUES (@MAKHACHHANG, @HOTEN, @SDT, @EMAIL, @CCCD, @ACCOUNT_ID)");

        res.redirect("/login"); // Redirect to the login page
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



// User login controller
export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input("username", sql.NVarChar, username)
            .query("SELECT * FROM ACCOUNT WHERE USERNAME = @username");

        if (result.recordset.length === 0) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const user = result.recordset[0];
        const isPasswordValid = await bcrypt.compare(password, user.PASSWORD);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Identify the user's role
        const role = user.ROLE; // Assuming the ROLE column contains values: 'Admin', 'Branch Manager', 'Department Manager', 'Staff', 'Customer'

        if (role == 'Customer') {
            const result2 = await pool.request()
                .input('username', sql.NVarChar, username)
                .query(`
                    SELECT MAKHACHHANG 
                    FROM KHACHHANG
                    JOIN ACCOUNT ON ACCOUNT_ID = ID
                    WHERE USERNAME = @username
                `);
            const MAKH = result2.recordset[0].MAKHACHHANG;
            // Generate a JWT token
            const token = jwt.sign(
                { id: user.ID, username: user.USERNAME, role, MAKH: MAKH },
                SECRET_KEY,
                { expiresIn: "1h" }
            );
            res.cookie("authToken", token, { httpOnly: true, secure: true });
        }
        else {
            const token = jwt.sign(
                { id: user.ID, username: user.USERNAME, role },
                SECRET_KEY,
                { expiresIn: "1h" }
            );
            res.cookie("authToken", token, { httpOnly: true, secure: true });
        }

        console.log(role);
        // Redirect based on role
        switch (role) {
            // case "Branch Manager":
            //     res.redirect("/branch-manager");
            //     break;
            // case "Department Manager":
            //     res.redirect("/department-manager");
            //     break;
            case "Staff":
                res.redirect("/staff");
                break;
            // case "Admin":
            //     res.redirect("/admin");
            //     break;
            // case "Customer":
            default:
                res.redirect("/home");
                break;
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};