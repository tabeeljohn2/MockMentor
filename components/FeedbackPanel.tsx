export default function FeedbackPanel(props: {
  score: number;
  strengths: string[];
  improvements: string[];
}) {
  return (
    <section className="rounded border border-gray-700 p-4">
      <p className="text-xl font-bold">Score: {props.score}/10</p>

      <h3 className="mt-4 font-semibold text-green-400">Strengths</h3>
      <ul className="mt-1 list-disc pl-5">
        {props.strengths.map((s, i) => <li key={i}>{s}</li>)}
      </ul>

      <h3 className="mt-4 font-semibold text-yellow-400">To improve</h3>
      <ul className="mt-1 list-disc pl-5">
        {props.improvements.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </section>
  );
}