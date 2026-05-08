import Image from "next/image";

const products = [
  { id: 1, name: "Dream State Hoodie", price: "₹9700", image: "https://images.unsplash.com/photo-1678884399113-0a2b079a31f5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 2, name: "The 11:11 Hoodie", price: "₹9700", image: "https://images.unsplash.com/photo-1678884399113-0a2b079a31f5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 3, name: "You Live There Too Hoodie", price: "₹9700", image: "https://images.unsplash.com/photo-1672753755427-bfb181778972?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 4, name: "Studded Angel Tank", price: "₹4900", image: "https://images.unsplash.com/photo-1738350027456-5c12af67bb2f?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 5, name: "Overactive Imagination Hoodie", price: "₹9700", image: "https://images.unsplash.com/photo-1673454319016-e1cfcfce85ba?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 6, name: "Dream State Vintage Wash Tee", price: "₹5400", image: "https://images.unsplash.com/photo-1707504701939-86efa15a34b7?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 7, name: "Sticker Sheet", price: "₹1600", image: "https://images.unsplash.com/photo-1676716686116-45c3f66e57d5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 8, name: "Color Your Own Sticker Sheet", price: "₹2000", image: "https://images.unsplash.com/photo-1676716686116-45c3f66e57d5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
];

export default function CuratedProducts() {
  return (
    <section className="curated-container">
      <h2 className="curated-heading">Latest / Curated</h2>

      <div className="curated-grid">
        {products.map((product) => (
          <div key={product.id} className="curated-card">
            <div className="curated-imageWrapper">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="curated-image"
              />

              {/* ✅ TOP LEFT OVERLAY */}
              <div className="curated-overlay">
                <p className="curated-name">{product.name}</p>
                <p className="curated-price">{product.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}