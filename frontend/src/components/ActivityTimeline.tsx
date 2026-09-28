import type { ActivityItem } from "../api/leads";
export default function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return <p>No activity</p>;
  return (
    <ol className="timeline">
      {items.map((item) => (
        <li key={item.id}>
          <span className={`badge badge-${item.action.toLowerCase()}`}>{item.action}</span>
          <p>{item.description}</p>
          <time>{new Date(item.createdAt).toLocaleString()}</time>
        </li>
      ))}
    </ol>
  );
}