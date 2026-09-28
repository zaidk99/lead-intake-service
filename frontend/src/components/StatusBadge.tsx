import type { LeadStatus } from "../api/leads";
export default function StatusBadge({ status }: { status: LeadStatus }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
}

