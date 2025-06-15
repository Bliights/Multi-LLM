import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { JwtPayload } from "jsonwebtoken";

dotenv.config();

interface UserPayload extends JwtPayload {
    id: string;
    name: string;
    email: string;
    role: string;
    password: string;
    created_at: Date;
}


interface AuthRequest extends Request {
    user?: UserPayload;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.cookies.jwt;

    if (!token) {
        res.status(401).json({ error: "Access denied, no token provided." });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token." });
        return;
    }
};

export const roleMiddleware = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.status(403).json({ error: "Forbidden. No user authenticated." });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: "Forbidden. Insufficient permissions." });
            return;
        }

        next();
    };
};