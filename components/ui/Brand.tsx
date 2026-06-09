/** The "bitaksi / your closest taxi" wordmark, used on splash + map header. */
export function Wordmark({
  tone = "brand",
  withTagline = true,
  className = "",
}: {
  tone?: "brand" | "cream";
  withTagline?: boolean;
  className?: string;
}) {
  const color = tone === "cream" ? "var(--cream)" : "var(--brand)";
  return (
    <div className={`text-center leading-none ${className}`}>
      <div
        className="font-black tracking-tight"
        style={{ color, fontSize: "1.9rem", letterSpacing: "-0.03em" }}
      >
        bitaksi
      </div>
      {withTagline && (
        <div
          className="mt-0.5 font-bold"
          style={{ color, opacity: 0.92, fontSize: "0.78rem" }}
        >
          your closest taxi
        </div>
      )}
    </div>
  );
}
