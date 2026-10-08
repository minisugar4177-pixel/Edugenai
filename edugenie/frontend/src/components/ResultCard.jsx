export default function ResultCard({
  title,
  children,
}) {
  return (
    <section className="result-card">
      <div className="result-heading">
        <span className="status-dot" />

        <h2>
          {title}
        </h2>
      </div>

      <div className="result-body">
        {children}
      </div>
    </section>
  );
}