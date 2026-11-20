export function CurriculumSummaryCard({
  label,
  title,
  details = [],
}: {
  label?: string;
  title: string;
  details?: readonly string[];
}) {
  return (
    <div className="curriculum-summary-card">
      {label && <p className="curriculum-summary-label">{label}</p>}
      <p className="curriculum-summary-title">{title}</p>
      {details.map((detail) => (
        <p key={detail} className="curriculum-summary-detail">{detail}</p>
      ))}
    </div>
  );
}
