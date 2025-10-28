import jwt from "jsonwebtoken";

export const getDataFromToken = (req) => {
    const token = req.cookies.token;    
    if (!token) throw new Error("invalid token");
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        return data
    } catch (err) {
        console.error("Token verification failed:", err.message);
        throw err
    }
}