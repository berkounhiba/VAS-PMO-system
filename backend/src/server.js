import express from "express";
import cors from "cors";
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


const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", tasksRoutes);
app.use("/api", usersRoutes);
app.use("/api", projectsRoutes);
app.use("/api", milestonesRoutes);
app.use("/api", risksRoutes);
app.use("/api", dependenciesRoutes);
app.use("/api", uatsitRoutes);
app.use("/api", goliveRoutes);
app.use("/api", vendorsRoutes);
app.use("/api", meetingsRoutes);
app.use("/api", kpisRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));