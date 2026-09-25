import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.lead.deleteMany();

  await prisma.lead.create({
    data: {
      name: "Asha Verma",
      email: "asha@example.com",
      phone: "9999999999",
      adId: "ad_101",
      status: "NEW",
      rawPayload: {
        name: "Asha Verma",
        email: "asha@example.com",
        phone: "9999999999",
        ad_id: "ad_101",
        campaign_name: "Diwali Sale",
        form_id: "form_1",
      },
      activities: {
        create: {
          action: "LEAD_CREATED",
          description: "Lead created from Meta Ads webhook",
        },
      },
    },
  });

  await prisma.lead.create({
    data: {
      name: "Rahul Shah",
      email: "rahul@example.com",
      phone: "9888888888",
      adId: "ad_202",
      status: "CONTACTED",
      rawPayload: {
        name: "Rahul Shah",
        email: "rahul@example.com",
        phone: "9888888888",
        ad_id: "ad_202",
        campaign_name: "Winter Launch",
        form_id: "form_2",
      },
      activities: {
        create: [
          {
            action: "LEAD_CREATED",
            description: "Lead created from Meta Ads webhook",
          },
          {
            action: "STATUS_CHANGED",
            description: "Status changed from NEW to CONTACTED",
          },
        ],
      },
    },
  });

  await prisma.lead.create({
    data: {
      name: "Neha Iyer",
      email: "neha@example.com",
      phone: "9777777777",
      adId: "ad_101",
      status: "QUALIFIED",
      rawPayload: {
        name: "Neha Iyer",
        email: "neha@example.com",
        phone: "9777777777",
        ad_id: "ad_101",
        campaign_name: "Diwali Sale",
        form_id: "form_1",
      },
      activities: {
        create: [
          {
            action: "LEAD_CREATED",
            description: "Lead created from Meta Ads webhook",
          },
          {
            action: "STATUS_CHANGED",
            description: "Status changed from NEW to QUALIFIED",
          },
        ],
      },
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });