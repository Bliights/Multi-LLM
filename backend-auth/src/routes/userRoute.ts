import { Router } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import jwt, {JwtPayload} from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const userRouter = Router();

userRouter.use(cookieParser());

userRouter.get("/", async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users: ", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

userRouter.get("/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

userRouter.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            res.status(400).json({ error: "Name, email and password are required." });
            return;
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            res.status(409).json({ error: "A user with this email already exists." });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({name, email, password: hashedPassword});

        res.status(201).json(newUser);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

const generateToken = (user: User) => {
    return jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "15m" }
    );
};

const generateRefreshToken = (user: User) => {
    return jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at
        },
        process.env.REFRESH_SECRET as string,
        { expiresIn: "7d" }
    );
};

userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            res.status(401).json({ error: "No user for this email." });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: "Password incorrect." });
            return;
        }

        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ message: "Login successful" });
    } catch (error) {
        console.error("Error during connection", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

userRouter.post("/logout", (req, res) => {
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
    });
    res.status(200).json({ message: "Logout successful" });
});

userRouter.get("/info/me", (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        res.status(401).json({ error: "Not authenticated." });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        res.status(200).json(decoded);
    } catch (error) {
        res.status(401).json({ error: "Invalid token." });
    }
});

userRouter.post("/refresh-token", async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        res.status(403).json({ message: "Refresh token missing." });
        return;
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET as string) as User;

        // Generate a new JWT
        const newToken = generateToken(decoded);

        // Send new JWT in HttpOnly cookie
        res.cookie("jwt", newToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        });

        res.status(200).json({ message: "Token refreshed" });
    } catch (error) {
        res.status(403).json({ message: "Invalid refresh token." });
    }
});

userRouter.put("/:id", async (req, res) => {
    const { name, email, password } = req.body;
    const userId = req.params.id;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }

        const updates: { name?: string, email?: string; password?: string } = {};

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                res.status(409).json({ error: "A user with this email already exists." });
                return;
            }
            updates.email = email;
        }

        if (password) {
            updates.password = await bcrypt.hash(password, 10);
        }

        if(name){
            updates.name = name;
        }

        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: "No valid fields to update." });
            return;
        }

        await user.update(updates);

        res.status(200).json({ message: "User updated successfully.", user });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

userRouter.delete("/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }

        await user.destroy();
        res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

export default userRouter;