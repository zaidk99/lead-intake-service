import "dotenv/config";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";
import { app } from "../src/app";

describe("leads api", () => {
  it("creates a lead and a LEAD_CREATED activity", async () => {
    const createResponse = await request(app)
      .post("/webhook/meta-lead")
      .send({
        name: "Audit User",
        email: "audit@test.com",
        phone: "1111111111",
        ad_id: "ad_test",
        campaign_name: "Test Campaign",
        form_id: "form_test",
      })
      .expect(201);

    assert.equal(typeof createResponse.body.id, "string");

    const leadDetailResponse = await request(app)
      .get(`/leads/${createResponse.body.id}`)
      .expect(200);

    assert.equal(leadDetailResponse.body.activities[0].action, "LEAD_CREATED");
    assert.equal(leadDetailResponse.body.status, "NEW");
  });

  it("rejects a webhook body that is not an object", async () => {
    const listBeforeResponse = await request(app)
      .get("/leads?limit=1")
      .expect(200);

    await request(app)
      .post("/webhook/meta-lead")
      .send(["not-an-object"])
      .expect(400);

    const listAfterResponse = await request(app)
      .get("/leads?limit=1")
      .expect(200);
    assert.equal(listAfterResponse.body.total, listBeforeResponse.body.total);
  });

  it("filters and paginates the lead list", async () => {
    const created = await request(app)
      .post("/webhook/meta-lead")
      .send({ name: "Filter User", email: "filter@test.com" })
      .expect(201);

    const leadId = created.body.id as string;

    await request(app)
      .patch(`/leads/${leadId}/status`)
      .send({ status: "CONTACTED" })
      .expect(200);

    const filteredResponse = await request(app)
      .get("/leads?status=CONTACTED&limit=100")
      .expect(200);

    const found = filteredResponse.body.data.find(
      (lead: any) => lead.id === leadId,
    );
    assert.ok(
      found,
      "expected the CONTACTED lead to appear in the filtered list",
    );
    assert.equal(found.status, "CONTACTED");

    const wrongFilterResponse = await request(app)
      .get("/leads?status=DISQUALIFIED&limit=100")
      .expect(200);

    const shouldNotBeThere = wrongFilterResponse.body.data.find(
      (lead: any) => lead.id === leadId,
    );
    assert.equal(shouldNotBeThere, undefined);
  });

  it("writes STATUS_CHANGED and rejects the same status", async () => {
    const createResponse = await request(app)
      .post("/webhook/meta-lead")
      .send({ name: "Status User", email: "status@test.com" })
      .expect(201);

    const leadId = createResponse.body.id as string;

    await request(app)
      .patch(`/leads/${leadId}/status`)
      .send({ status: "CONTACTED" })
      .expect(200);

    await request(app)
      .patch(`/leads/${leadId}/status`)
      .send({ status: "CONTACTED" })
      .expect(400);

    await request(app)
      .patch(`/leads/${leadId}/status`)
      .send({ status: "NOT_A_STATUS" })
      .expect(400);

    const leadDetailResponse = await request(app)
      .get(`/leads/${leadId}`)
      .expect(200);
    assert.equal(
      leadDetailResponse.body.activities[0].action,
      "STATUS_CHANGED",
    );
    assert.match(
      leadDetailResponse.body.activities[0].description,
      /NEW to CONTACTED/,
    );
  });

  it("writes LEAD_UPDATED when the email changes", async () => {
    const createResponse = await request(app)
      .post("/webhook/meta-lead")
      .send({ name: "Contact User", email: "old@test.com" })
      .expect(201);

    const leadId = createResponse.body.id as string;

    await request(app)
      .patch(`/leads/${leadId}`)
      .send({ email: "new@test.com" })
      .expect(200);

    const leadDetailResponse = await request(app)
      .get(`/leads/${leadId}`)
      .expect(200);
    assert.equal(leadDetailResponse.body.email, "new@test.com");
    assert.equal(leadDetailResponse.body.rawPayload.email, "old@test.com");
    assert.equal(leadDetailResponse.body.activities[0].action, "LEAD_UPDATED");
  });

  it("returns 404 for an unknown lead", async () => {
    await request(app).get("/leads/missing-lead").expect(404);
  });
});
