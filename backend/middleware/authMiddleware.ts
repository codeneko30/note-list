import jwt from "jsonwebtoken";
import { secreetKey } from "../key";

export default function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: 'No token' });
    }

    try {
        const decoded = jwt.verify(token, secreetKey);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}