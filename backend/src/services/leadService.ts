import { PrismaClient, Prisma, ActivityAction } from "../generated/prisma/client";

const prisma = new PrismaClient();

type WebhookLeadInput = {
  name?: string;
  email?: string;
  phone?: string;
  ad_id?: string;
  raw: Record<string, unknown>;
};

export async function createLeadFromWebhook(input: WebhookLeadInput) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const created = await tx.lead.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        adId: input.ad_id,
        rawPayload: input.raw as Prisma.InputJsonValue,
        activities: {
          create: {
            action: ActivityAction.LEAD_CREATED,
            description: "Lead created from Meta Ads webhook",
          },
        },
      },
    });
    return created.id;
  });
}