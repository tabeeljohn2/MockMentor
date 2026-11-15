export default function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="h-2 w-full rounded bg-gray-700">
      <div className="h-2 rounded bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}