export default function QuestionCard(props: {
  question: string;
  difficulty: string;
  number: number;
  total: number;
}) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
        M
      </div>
      <div className="max-w-[85%] rounded-3xl rounded-bl-md bg-peach px-5 py-4">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-ink/60">
          Question {props.number} / {props.total}
          {props.difficulty && (
            <span className="rounded-full bg-white px-2 py-0.5 text-ink">{props.difficulty}</span>
          )}
        </p>
        <p className="mt-2">{props.question}</p>
      </div>
    </div>
  );
}