import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sql from "mssql";
import { connectToDatabase } from "../config/db.js"; // Your database connection file
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY; // Replace with a secure key

// User signup controller
export const signup = async (req, res) => {
    const { username, password } = req.body;

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

        // Insert user into the database
        await pool.request()
            .input("username", sql.NVarChar, username)
            .input("password", sql.NVarChar, hashedPassword)
            .input("role", sql.NVarChar, "Customer") // Insert the role as "customer"
            .query("INSERT INTO ACCOUNT (username, password, role) VALUES (@username, @password, @role)");

        res.redirect("/login"); // Redirect to the login page
        //res.status(201).json({ message: "User registered successfully" });
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
        const role = user.ROLE; // Assuming the ROLE column contains values: 'BranchManager', 'DepartmentManager', 'Staff', 'Customer'

        // Generate a JWT token
        const token = jwt.sign(
            { id: user.ID, username: user.USERNAME, role },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        // Set token in cookies
        res.cookie("authToken", token, { httpOnly: true, secure: true });

        // Redirect based on role
        switch (role) {
            // case "Branch Manager":
            //     res.redirect("/branch-manager");
            //     break;
            // case "Department Manager":
            //     res.redirect("/department-manager");
            //     break;
            // case "Staff":
            //     res.redirect("/staff");
            //     break;
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
