export default function FeedbackPanel(props: {
  score: number;
  strengths: string[];
  improvements: string[];
}) {
  return (
    <div className="ml-12 max-w-[85%] rounded-3xl bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between rounded-2xl bg-brand px-5 py-4 text-white">
        <span className="text-sm">Score</span>
        <span className="text-3xl font-light">{props.score}/10</span>
      </div>

      <div className="mt-2 rounded-2xl bg-cloud p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink/50">Strengths</p>
        <ul className="mt-2 list-disc pl-5 text-sm">
          {props.strengths.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>

      <div className="mt-2 rounded-2xl bg-cloud p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink/50">To improve</p>
        <ul className="mt-2 list-disc pl-5 text-sm">
          {props.improvements.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>
    </div>
  );
}