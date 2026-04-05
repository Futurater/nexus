import httpStatus from "http-status";
import bcrypt from "bcrypt";
import crypto from "crypto";

// In-memory store — works without MongoDB
const users = [];

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please provide username and password" });
    }

    try {
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (isPasswordCorrect) {
            const token = crypto.randomBytes(20).toString("hex");
            user.token = token;
            return res.status(httpStatus.OK).json({ token });
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid username or password" });
        }
    } catch (e) {
        return res.status(500).json({ message: `Something went wrong: ${e}` });
    }
};

const register = async (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(400).json({ message: "Please provide name, username and password" });
    }

    try {
        const existingUser = users.find(u => u.username === username);
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ name, username, password: hashedPassword, token: null, meetings: [] });

        return res.status(httpStatus.CREATED).json({ message: "User Registered Successfully" });
    } catch (e) {
        return res.status(500).json({ message: `Something went wrong: ${e}` });
    }
};

const getUserHistory = async (req, res) => {
    const { token } = req.query;
    try {
        const user = users.find(u => u.token === token);
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.json(user.meetings || []);
    } catch (e) {
        return res.json({ message: `Something went wrong: ${e}` });
    }
};

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;
    try {
        const user = users.find(u => u.token === token);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.meetings) user.meetings = [];
        user.meetings.push({
            user_id: user.username,
            meetingCode: meeting_code,
            date: new Date()
        });

        return res.status(httpStatus.CREATED).json({ message: "Added to history" });
    } catch (e) {
        return res.json({ message: `Something went wrong: ${e}` });
    }
};

export { login, register, getUserHistory, addToHistory };