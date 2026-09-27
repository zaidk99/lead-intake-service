import { PrismaClient, Prisma, ActivityAction , LeadStatus } from "../generated/prisma/client";

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

export async function listLead(input: {
  page:number;
  limit:number;
  status?: LeadStatus;
}){
  const where = input.status ? {status: input.status} : {};

  const [total,data] = await prisma.$transaction([
    prisma.lead.count({where}),
    prisma.lead.findMany({
      where,
      orderBy: {createdAt: "desc"},
      skip:(input.page - 1) * input.limit,
      take: input.limit,
      select:{
        id: true,
        name: true,
        email: true,
        phone: true,
        adId: true,
        status: true,
        createdAt: true,
      }
    }),

  ]);
  return {data, page: input.page, limit: input.limit, total}
}

export async function getLead(id:string){
  return prisma.lead.findUnique({
    where: {id},
    include:{
      activities:{orderBy: {createdAt: "desc"}},
    },
  });
}



export async function updateLeadContact(
  id: string,
  input: { name?: string; email?: string; phone?: string },
) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const current = await tx.lead.findUnique({ where: { id } });
    if (!current) return { ok: false as const, reason: "missing" as const };
    const data: { name?: string; email?: string; phone?: string } = {};
    const changes: string[] = [];
    if (input.name !== undefined && input.name !== current.name) {
      data.name = input.name;
      changes.push(`name changed from ${current.name ?? "empty"} to ${input.name}`);
    }
    if (input.email !== undefined && input.email !== current.email) {
      data.email = input.email;
      changes.push(`email changed from ${current.email ?? "empty"} to ${input.email}`);
    }
    if (input.phone !== undefined && input.phone !== current.phone) {
      data.phone = input.phone;
      changes.push(`phone changed from ${current.phone ?? "empty"} to ${input.phone}`);
    }
    if (changes.length === 0) return { ok: false as const, reason: "same" as const };
    const lead = await tx.lead.update({
      where: { id },
      data: {
        ...data,
        activities: {
          create: {
            action: ActivityAction.LEAD_UPDATED,
            description: changes.join(". "),
          },
        },
      },
    });
    return { ok: true as const, lead };
  });
}
