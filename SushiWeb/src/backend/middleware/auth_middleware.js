// auth_middleware.js

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY; // Replace with a secure key

const authenticateToken = (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        // If no token, allow the request but without user info
        req.username = null;
        req.role = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.username = decoded.username; // Attach username to the request
        req.role = decoded.role;
    } catch (err) {
        console.error("JWT verification failed:", err);
        req.username = null; // Clear user info on token failure
        req.role = null;
    }
    next(); // Continue to the next middleware or route
};

const authenticateUser = (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.username = decoded.username; // Attach username to the request
        req.role = decoded.role;
        next();
    } catch (err) {
        console.error("JWT verification failed:", err);
        res.status(401).json({ message: "Invalid authentication token" });
    }
};

export { authenticateToken, authenticateUser };
