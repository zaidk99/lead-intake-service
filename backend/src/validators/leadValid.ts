import { z } from "zod";
import { LeadStatus } from "../generated/prisma/enums";

const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "DISQUALIFIED",
  "CONVERTED",
] as const;

function isLeadStatus(value:string):value is LeadStatus {
    return LEAD_STATUSES.includes(value as LeadStatus);
}

function parsePositiveInt(value: unknown, fallback: number): number | null {
  if(value === undefined) return fallback;
  const num = Number(value);
  if(!Number.isInteger(num) || num < 1) return null;
  return num;
}

export function parseListQuery(query: {
  page?: unknown;
  limit?: unknown;
  status?: unknown;
}) {
  const page = parsePositiveInt(query.page, 1);
  if (page === null) return { ok: false as const };

  const limit = parsePositiveInt(query.limit, 20);
  if (limit === null || limit > 100) return { ok: false as const };

  if (query.status === undefined) {
    return { ok: true as const, page, limit, status: undefined };
  }

  if (typeof query.status !== "string" || !isLeadStatus(query.status)) {
    return { ok: false as const };
  }

  return { ok: true as const, page, limit, status: query.status };
}

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
