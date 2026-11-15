export default function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="h-2 w-full rounded-full bg-ink/10">
      <div className="h-2 rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}