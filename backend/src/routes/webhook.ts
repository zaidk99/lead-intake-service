import { Router } from "express";
import { createLeadFromWebhook } from "../services/leadService";
import { parseWebhookBody } from "../validators/leadValid";

export const webhookRouter = Router();

webhookRouter.post("/meta-lead", async (req, res) => {
  const parsed = parseWebhookBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: "Invalid webhook body" });
    return;
  }

  try {
    const id = await createLeadFromWebhook({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      ad_id: parsed.data.ad_id,
      raw: parsed.raw,
    });

    res.status(201).json({ id });
  } catch (err) {
    console.error("webhook lead creation failed:", err);
    res.status(500).json({ error: "failed to create lead" });
  }
});