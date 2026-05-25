const DEFAULT_COUNT = 8;

export default function ProductLoader({ count = DEFAULT_COUNT }) {
  return (
    <div
      className="curated-grid product-loader"
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="product-loader__card">
          <div className="curated-imageWrapper skeleton-loading" aria-hidden />
          <div className="curated-meta product-loader__meta">
            <span className="product-loader__line skeleton-loading" aria-hidden />
            <span
              className="product-loader__line product-loader__line--price skeleton-loading"
              aria-hidden
            />
          </div>
        </div>
      ))}
    </div>
  );
}
