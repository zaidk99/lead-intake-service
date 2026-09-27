import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/error";
import { leadRouter } from "./routes/leadsRoutes";
import { webhookRouter } from "./routes/webhook";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/leads", leadRouter);
app.use("/webhook", webhookRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);