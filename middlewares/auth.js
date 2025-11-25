import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer "))
        return res.status(401).json({ error: "Missing token" });

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "SUPER_SECRET");
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};
