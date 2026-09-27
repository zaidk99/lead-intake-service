import "dotenv/config";
import express from "express";
import cors from "cors";

import { webhookRouter } from "./routes/webhook";
import { leadRouter } from "./routes/leadsRoutes";
const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.use("/leads",leadRouter);
app.use("/webhook",webhookRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`backend listening on ${port}`);
});
