export default function StarRating({
  percent,
  className = "",
}: {
  percent: number;
  className?: string;
}) {
  const filled = Math.round((percent / 100) * 5);
  return (
    <span
      className={`inline-flex ${className}`}
      aria-label={`${(percent / 20).toFixed(1)} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < filled ? "text-amber-400" : "text-gray-300"}>
          ★
        </span>
      ))}
    </span>
  );
}
