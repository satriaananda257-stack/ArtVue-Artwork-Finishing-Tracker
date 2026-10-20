import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRoute from "./routes/auth/auth.route";
import worksRoute from "./routes/works/works.route";
import usersRouter from "./routes/users/user.route";

const app = express();
const PORT = 5000;

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
            origin.startsWith("http://localhost") ||
            origin.startsWith("http://127.0.0.1") ||
            origin.startsWith("http://192.168.") ||
            origin.startsWith("http://10.") ||
            origin.startsWith("http://172.")
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
    console.log(`⚡️[server]: Also accessible at http://192.168.18.6:${PORT}`);
});
