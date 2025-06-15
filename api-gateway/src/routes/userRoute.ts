import { Router } from "express";
import axios from "axios";
import {AUTH_PORT, AUTH_SERVER} from "../main";
import {User} from "../models"
import cookieParser from "cookie-parser";
import {authMiddleware, roleMiddleware} from "../auth";

const userRouter = Router();

userRouter.use(cookieParser());

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Get all Users
 *     tags: [Users]
 *     description: Retrieve all Users  currently available.
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Users'
 *       500:
 *         description: Server Error
 */
userRouter.get("/", async (req, res) => {
    try {
        const response = await axios.get<User>(`http://${AUTH_SERVER}:${AUTH_PORT}/users`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error while fetching data", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get a User by user ID
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
userRouter.get("/:id", async (req, res) => {
    const userId = req.params.id;
    try {
        const response = await axios.get<User>(`http://${AUTH_SERVER}:${AUTH_PORT}/users/${userId}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching data: ", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * @openapi
 * /users/register:
 *   post:
 *     summary: Create a new User
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "new"
 *               email:
 *                 type: string
 *                 example: "new@example.com"
 *               password:
 *                 type: string
 *                 example: new_password
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Missing mandatory fields
 *       409:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
userRouter.post("/register", async (req, res) => {
    try {
        const response = await axios.post<User>(`http://${AUTH_SERVER}:${AUTH_PORT}/users/register`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * @openapi
 * /users/login:
 *   post:
 *     summary: Authenticate a User
 *     tags: [Users]
 *     description: Logs in a user with an email and password. Returns an access token in an HTTP-only cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "alice@example.com"
 *               password:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Login successful. JWT token is set in cookies.
 *       401:
 *         description: Unauthorized - Invalid credentials.
 *       500:
 *         description: Internal server error.
 */
userRouter.post("/login", async (req, res) => {
    try {
        const response = await axios.post(
            `http://${AUTH_SERVER}:${AUTH_PORT}/users/login`,
            req.body,
            {
                headers: { Cookie: req.headers.cookie || "" },
                withCredentials: true
            } // Necessary to handle cookies
        );

        // Forward the cookies from the backend to the client
        res.setHeader("Set-Cookie", response.headers["set-cookie"]);
        res.status(200).json(response.data);
    } catch (error: any) {
        console.error("Login error:", error);
        res.status(error.response?.status || 500).json({ error: "Login failed." });
    }
});

/**
 * @openapi
 * /users/info/me:
 *   get:
 *     summary: Get Authenticated User Info
 *     tags: [Users]
 *     description: Retrieves the details of the currently authenticated user.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user information.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Users'
 *       401:
 *         description: Unauthorized - User is not authenticated.
 */
userRouter.get("/info/me", authMiddleware, async (req, res) => {
    try {
        const response = await axios.get(`http://${AUTH_SERVER}:${AUTH_PORT}/users/info/me`, {
            headers: { Cookie: req.headers.cookie || "" },
            withCredentials: true,
        });

        res.status(200).json(response.data);
    } catch (error) {
        res.status(401).json({ error: "Not authenticated." });
    }
});

/**
 * @openapi
 * /users/logout:
 *   post:
 *     summary: Logout a User
 *     tags: [Users]
 *     description: Logs out the currently authenticated user by clearing authentication cookies.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful.
 *       500:
 *         description: Internal server error.
 */
userRouter.post("/logout", async (req, res) => {
    try {
        const response = await axios.post(`http://${AUTH_SERVER}:${AUTH_PORT}/users/logout`, {}, {
            headers: { Cookie: req.headers.cookie || "" },
            withCredentials: true
        });

        res.setHeader("Set-Cookie", response.headers["set-cookie"]);
        res.status(200).json({ message: "Logout successful." });
    } catch (error) {
        res.status(500).json({ error: "Logout failed." });
    }
});

/**
 * @openapi
 * /users/refresh-token:
 *   post:
 *     summary: Refresh Authentication Token
 *     tags: [Users]
 *     description: Refreshes the authentication token if the refresh token is valid.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully.
 *       403:
 *         description: Forbidden - Refresh token is invalid or expired.
 */
userRouter.post("/refresh-token", async (req, res) => {
    try {
        const response = await axios.post(
            `http://${AUTH_SERVER}:${AUTH_PORT}/users/refresh-token`,
            {},
            {
                headers: { Cookie: req.headers.cookie || "" },
                withCredentials: true
            }
        );

        res.setHeader("Set-Cookie", response.headers["set-cookie"]);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(403).json({ error: "Refresh failed." });
    }
});

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Update a user's email and/or password
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "newName"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newemail@example.com"
 *               password:
 *                 type: string
 *                 example: "NewSecureP@ssw0rd"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: No valid fields to update
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already in use
 *       500:
 *         description: Server error
 */
userRouter.put("/:id", async (req, res) => {
    const userId = req.params.id;
    try {
        const response = await axios.put<User>(`http://${AUTH_SERVER}:${AUTH_PORT}/users/${userId}`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete a User  by ID
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
userRouter.delete("/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    const userId = req.params.id;
    try {
        const response = await axios.delete(`http://${AUTH_SERVER}:${AUTH_PORT}/users/${userId}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

export default userRouter;