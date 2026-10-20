import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRoute from "./routes/auth/auth.route";
import worksRoute from "./routes/works/works.route";
import usersRouter from "./routes/users/user.route";

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins: semua localhost + URL production dari env
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    ...(process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
        : []),
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
            origin.startsWith("http://localhost") ||
            origin.startsWith("http://127.0.0.1") ||
            origin.startsWith("http://192.168.") ||
            origin.startsWith("http://10.") ||
            origin.startsWith("http://172.") ||
            allowedOrigins.includes(origin)
        ) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options(/(.*)/, cors());
app.use(express.json());

app.use("/api/v1/works", worksRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", usersRouter);

app.get("/", (_req, res) => {
    res.send("Hello World");
});

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
