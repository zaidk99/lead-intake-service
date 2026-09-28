const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "DISQUALIFIED",
  "CONVERTED",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type LeadListItem = {
  id: string;
  name: string | null;
  phone: string | null;
  status: LeadStatus;
  createdAt: string;
};
export type LeadListResponse = {
  data: LeadListItem[];
  page: number;
  limit: number;
  total: number;
};

export type ActivityItem = {
  id: string;
  leadId: string;
  action: "LEAD_CREATED" | "LEAD_UPDATED" | "STATUS_CHANGED";
  description: string;
  createdAt: string;
};

export type LeadDetail = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  adId: string | null;
  rawPayload: Record<string, unknown>;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  activities: ActivityItem[];
};


async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T | null> {
  const response = await fetch(`${API_URL}${path}`, options);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Request failed: ${path}`);
  return response.json() as Promise<T>;
}


export async function createWebhookLead(input: {
  name: string;
  email: string;
  phone: string;
  ad_id: string;
  campaign_name: string;
  form_id: string;
}) {
  return apiRequest<{ id: string }>("/webhook/meta-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function getLeads(page: number, status?: LeadStatus) {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (status) params.set("status", status);
  return apiRequest<LeadListResponse>(`/leads?${params}`) as Promise<LeadListResponse>;
}

export async function getLead(id: string) {
  return apiRequest<LeadDetail>(`/leads/${id}`);
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  return apiRequest<LeadDetail>(`/leads/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  }) as Promise<LeadDetail>;
}

export async function updateLeadContact(
  id: string,
  input: { name?: string; email?: string; phone?: string },
) {
  return apiRequest<LeadDetail>(`/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }) as Promise<LeadDetail>;
}