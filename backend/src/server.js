import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import tasksRoutes from "./routes/tasks.routes.js";
import usersRoutes from "./routes/users.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import milestonesRoutes from "./routes/milestones.routes.js";
import risksRoutes from "./routes/risks.routes.js";
import dependenciesRoutes from "./routes/dependencies.routes.js";
import uatsitRoutes from "./routes/uatsit.routes.js";
import goliveRoutes from "./routes/golive.routes.js";
import vendorsRoutes from "./routes/vendors.routes.js";
import meetingsRoutes from "./routes/meetings.routes.js";
import kpisRoutes from "./routes/kpis.routes.js";
import weeklySummariesRoutes from "./routes/weeklySummaries.routes.js";
import authRoutes from "./routes/auth.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import { requireAuth } from "./middleware/auth.middleware.js";

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`[CORS BLOCKED] ${origin}`);
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(helmet());

app.use(express.json());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
});
app.use("/api/login", loginLimiter);

app.use("/api", authRoutes);

app.use("/api", requireAuth);

app.use("/api", tasksRoutes);
app.use("/api", usersRoutes);
app.use("/api", projectsRoutes);
app.use("/api", milestonesRoutes);
app.use("/api", risksRoutes);
app.use("/api", dependenciesRoutes);
app.use("/api", uatsitRoutes);
app.use("/api", goliveRoutes);
app.use("/api", weeklySummariesRoutes);
app.use("/api", vendorsRoutes);
app.use("/api", meetingsRoutes);
app.use("/api", kpisRoutes);
app.use("/api", aiRoutes);
app.use("/api", settingsRoutes);

const PORT = process.env.PORT || 4000;
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "Origin not allowed" });
  }
  next(err);
});
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));