import { z } from "zod";

const webhookBodySchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  ad_id: z.string().optional(),
  campaign_name: z.string().optional(),
  form_id: z.string().optional(),
});

export function parseWebhookBody(body: unknown) {
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false as const };
  }

  const parsed = webhookBodySchema.safeParse(body);

  if (!parsed.success) {
    return { ok: false as const };
  }

  return {
    ok: true as const,
    data: parsed.data,
    raw: body as Record<string, unknown>,
  };
}
