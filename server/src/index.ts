import express from "express";
import cors from "cors";
import accountsRouter from "./routes/accounts.js";
import transactionsRouter from "./routes/transactions.js";
import budgetsRouter from "./routes/budgets.js";
import { projectsRouter, tasksRouter, workLogsRouter } from "./routes/work.js";
import { bodyRecordsRouter, exerciseRecordsRouter } from "./routes/health.js";
import { goalsRouter, habitsRouter, habitLogsRouter, eventsRouter } from "./routes/plans.js";
import dashboardRouter from "./routes/dashboard.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/accounts", accountsRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/budgets", budgetsRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/work-logs", workLogsRouter);
app.use("/api/body-records", bodyRecordsRouter);
app.use("/api/exercise-records", exerciseRecordsRouter);
app.use("/api/goals", goalsRouter);
app.use("/api/habits", habitsRouter);
app.use("/api/habit-logs", habitLogsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/dashboard", dashboardRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
