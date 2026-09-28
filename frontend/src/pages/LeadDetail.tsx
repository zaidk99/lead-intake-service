import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  LEAD_STATUSES,
  getLead,
  updateLeadContact,
  updateLeadStatus,
  type LeadDetail as Lead,
  type LeadStatus,
} from "../api/leads";
import ActivityTimeline from "../components/ActivityTimeline";
import StatusBadge from "../components/StatusBadge";

export default function LeadDetail() {
  const { id = "" } = useParams();
  const [lead, setLead] = useState<Lead | null>(null);
  const [missing, setMissing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  function applyLead(next: Lead) {
    setLead(next);
    setName(next.name ?? "");
    setEmail(next.email ?? "");
    setPhone(next.phone ?? "");
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setMissing(false);

    getLead(id)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setMissing(true);
          return;
        }
        applyLead(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load lead");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

async function onStatusChange(status: LeadStatus) {
  if (!lead || status === lead.status) return;
  setError("");
  try {
    await updateLeadStatus(id, status);
    const fresh = await getLead(id);
    if (fresh) applyLead(fresh);
  } catch {
    setError("could not update status");
  }
}

  async function onSaveContact(event: React.FormEvent) {
    event.preventDefault();
    if (!lead) return;
    setError("");

    const input: { name?: string; email?: string; phone?: string } = {};
    if (name !== (lead.name ?? "")) input.name = name;
    if (email !== (lead.email ?? "")) input.email = email;
    if (phone !== (lead.phone ?? "")) input.phone = phone;
    if (Object.keys(input).length === 0) return;

    try {
      await updateLeadContact(id, input);
      const fresh = await getLead(id);
      if (fresh) applyLead(fresh);
    } catch {
      setError("Could not update contact");
    }
  }


  if (loading) return <p>Loading lead</p>;
  if (missing) return <p>Lead not found</p>;
  if (!lead) return <p>{error || "Could not load lead"}</p>;

  return (
    <section>
      <p><Link to="/">Back to leads</Link></p>
      <h2>{lead.name || "—"}</h2>
      <StatusBadge status={lead.status} />

      <dl className="fields">
        <div><dt>Email</dt><dd>{lead.email || "—"}</dd></div>
        <div><dt>Phone</dt><dd>{lead.phone || "—"}</dd></div>
        <div><dt>Ad id</dt><dd>{lead.adId || "—"}</dd></div>
        <div><dt>Created</dt><dd>{new Date(lead.createdAt).toLocaleString()}</dd></div>
        <div><dt>Updated</dt><dd>{new Date(lead.updatedAt).toLocaleString()}</dd></div>
      </dl>

      {error && <p>{error}</p>}

      <label>
        Status{" "}
        <select
          value={lead.status}
          onChange={(event) => onStatusChange(event.target.value as LeadStatus)}
        >
          {LEAD_STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </label>

      <form onSubmit={onSaveContact} className="contact-form">
        <label>Name <input value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label>Email <input value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Phone <input value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
        <button type="submit">Save contact</button>
      </form>

      <details>
        <summary>Raw payload</summary>
        <pre>{JSON.stringify(lead.rawPayload, null, 2)}</pre>
      </details>

      <h3>Activity</h3>
      <ActivityTimeline items={lead.activities} />
    </section>
  );
}