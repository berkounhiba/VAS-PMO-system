import express from "express";
import cors from "cors";
import tasksRoutes from "./routes/tasks.routes.js";
import usersRoutes from "./routes/users.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import milestonesRoutes from "./routes/milestones.routes.js";
import risksRoutes from "./routes/risks.routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", tasksRoutes);
app.use("/api", usersRoutes);
app.use("/api", projectsRoutes);
app.use("/api", milestonesRoutes);
app.use("/api", risksRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));