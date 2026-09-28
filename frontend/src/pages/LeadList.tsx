import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LEAD_STATUSES,
  createWebhookLead,
  getLeads,
  type LeadListResponse,
  type LeadStatus,
} from "../api/leads";
import StatusBadge from "../components/StatusBadge";

export default function LeadList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [result, setResult] = useState<LeadListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [reload, setReload] = useState(0);

  async function onAddLead() {
    setAdding(true);
    setError("");
    try {
      const stamp = new Date().toLocaleTimeString();
      await createWebhookLead({
        name: `Demo Lead ${stamp}`,
        email: "demo@example.com",
        phone: "9999999999",
        ad_id: "123",
        campaign_name: "Diwali Sale",
        form_id: "form_1",
      });
      setStatus("");
      setPage(1);
      setReload((current) => current + 1);
    } catch {
      setError("Could not add lead");
    } finally {
      setAdding(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");

    getLeads(page, status || undefined)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch(() => {
        if (!cancelled) setError("could not load leads");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, status, reload]);

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.limit)) : 1;

  return (
    <section>
      <div className="toolbar">
      <button type="button" onClick={onAddLead} disabled={adding}>
        {adding ? "Adding lead" : "Try adding a lead"}
      </button>
      <label>
        Status{" "}
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as LeadStatus | "");
            setPage(1);
          }}
        >
          <option value="">All</option>
          {LEAD_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      </div>

      {loading && <p>Loading leads</p>}
      {error && <p>{error}</p>}
      {!loading && !error && result?.data.length === 0 && <p>No leads</p>}

      {!loading && !error && result && result.data.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((lead) => (
              <tr key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)}>
                <td>{lead.name || "—"}</td>
                <td>{lead.phone || "—"}</td>
                <td>
                  <StatusBadge status={lead.status} />
                </td>
                <td>{new Date(lead.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="pager">
        <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={!result || page * result.limit >= result.total}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}