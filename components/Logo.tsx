export default function Logo({
  size = "md",
  tone = "dark",
  hideTextOnMobile = false,
}: {
  size?: "sm" | "md" | "lg";
  tone?: "dark" | "light";
  hideTextOnMobile?: boolean;
}) {
  const icon =
    size === "sm" ? "h-8 w-8 text-base" : size === "lg" ? "h-14 w-14 text-3xl" : "h-11 w-11 text-xl";
  const text = size === "sm" ? "text-xs" : size === "lg" ? "text-xl" : "text-sm";

  return (
    <div className="flex items-center gap-3">
      <span
        className={`relative flex ${icon} items-center justify-center rounded-xl bg-ink font-bold text-white`}
      >
        M
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-brand ring-2 ring-white" />
      </span>
      <span
        className={`${text} ${hideTextOnMobile ? "max-sm:hidden" : ""} font-semibold uppercase tracking-[0.25em] ${
          tone === "light" ? "text-white" : "text-ink"
        }`}
      >
        MockMentor
      </span>
    </div>
  );
}