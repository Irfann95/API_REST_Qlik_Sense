import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const usersPath = path.join(__dirname, "..", "users.json");

const users = JSON.parse(fs.readFileSync(usersPath));

export const login = async (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
        { username },
        process.env.JWT_SECRET || "SUPER_SECRET",
        { expiresIn: "4h" }
    );

    res.json({ token });
};

export const changepassword = async (req, res) => {
    try {
        const { username, oldpassword, newpassword } = req.body;

        if (!username || !oldpassword || !newpassword) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));

        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({ error: "Username is wrong" });
        }

        const ok = await bcrypt.compare(oldpassword, user.password);
        if (!ok) {
            return res.status(401).json({ error: "Password is wrong" });
        }

        if (oldpassword === newpassword) {
            return res.status(400).json({ error: "New password must be different" });
        }

        if (newpassword.length < 6) {
            return res.status(400).json({ error: "New password is too short" });
        }

        const newHash = await bcrypt.hash(newpassword, 10);

        user.password = newHash;

        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

        return res.status(200).json({ message: "Password updated successfully" });

    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};
