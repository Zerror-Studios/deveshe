import Image from "next/image";

export default function MaterialGridCard({ material, onSelect }) {
  if (!material) return null;

  const title = material.title || material.name || "";

  return (
    <button
      type="button"
      className="material-card"
      onClick={() => onSelect?.(material)}
      aria-label={`View details for ${title}`}
    >
      <div className="material-card__imageWrapper">
        {material.image ? (
          <Image
            src={material.image}
            alt={material.imageAlt || title}
            fill
            className="material-card__image"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="material-card__imagePlaceholder" aria-hidden />
        )}
      </div>
      <div className="material-card__meta">
        <p className="material-card__title">{title}</p>
      </div>
    </button>
  );
}
