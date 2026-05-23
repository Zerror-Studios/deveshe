import Image from "next/image";

function formatMaterialCode(code) {
  if (!code) return null;
  const slug = code.trim().replace(/\s+/g, "-");
  return `[${slug}]`;
}

export default function MaterialGridCard({ material, onSelect }) {
  if (!material) return null;

  const displayName = material.title || material.name || "";
  const codeLabel = formatMaterialCode(material.code);

  return (
    <button
      type="button"
      className="material-card"
      onClick={() => onSelect?.(material)}
      aria-label={`View details for ${displayName}`}
    >
      <div className="material-card__imageWrapper">
        {material.image ? (
          <Image
            src={material.image}
            alt={material.imageAlt || displayName}
            fill
            className="material-card__image"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="material-card__imagePlaceholder" aria-hidden />
        )}
      </div>

      <div className="material-card__meta">
        {codeLabel ? (
          <p className="material-card__code">{codeLabel}</p>
        ) : null}
        <p className="material-card__title">
          {displayName}
          <span className="material-card__expand" aria-hidden>
            {" "}
            [+]
          </span>
        </p>
      </div>
    </button>
  );
}
