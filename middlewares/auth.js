import jwt from "jsonwebtoken";

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.render("login");
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded; // Ensure `decoded` contains all necessary fields
        next();
    } catch (error) {
        console.error("Token verification failed:", error);
        res.status(401).render("login");
    }
};

export default authMiddleware;
