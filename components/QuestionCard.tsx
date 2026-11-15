export default function QuestionCard(props: {
  question: string;
  difficulty: string;
  number: number;
  total: number;
}) {
  return (
    <section className="rounded border border-gray-700 p-4">
      <p className="text-sm text-gray-400">
        Question {props.number} of {props.total}
        {props.difficulty && <span className="ml-2 uppercase">· {props.difficulty}</span>}
      </p>
      <p className="mt-2 text-lg font-semibold">{props.question}</p>
    </section>
  );
}