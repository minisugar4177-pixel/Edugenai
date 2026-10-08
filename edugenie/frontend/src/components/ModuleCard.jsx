export default function ModuleCard({
  icon,
  title,
  description,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`module-card ${
        active ? "active" : ""
      }`}
      onClick={onClick}
    >
      <span className="module-icon">
        {icon}
      </span>

      <span className="module-copy">
        <strong>
          {title}
        </strong>

        <small>
          {description}
        </small>
      </span>
    </button>
  );
}