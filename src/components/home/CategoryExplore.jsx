import Image from "next/image";

const categories = [
  { id: 1, name: "Clothing", image: "https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F240x320%2F8c865d22dd%2Fall-clothing.png&w=3840&q=90" },
  { id: 2, name: "Coats & Jackets", image: "https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F2142x3000%2F4acc9c1444%2F016_ark8_bj040er_front_fixed.png&w=3840&q=90" },
  { id: 3, name: "Dresses & Skirts", image: "https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F240x320%2F01f877b2ca%2Fdresses.png&w=3840&q=90" },
  { id: 4, name: "Tops & T-shirts", image: "https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F240x320%2Fbb58a01871%2Ftops-t-shirts.png&w=3840&q=90" },
  { id: 5, name: "Sweatshirts & Hoodies", image: "https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F240x320%2F594975e2e1%2Fsweatshirts.png&w=3840&q=90" },
];

export default function CategoryExplore() {
  return (
    <section className="category-container">
      <p className="category-heading">
        EXPLORE <span>ARK / 8</span>
      </p>

      <div className="category-row">
        {categories.map((cat) => (
          <div key={cat.id} className="category-card">
            <div className="category-image">
              <Image src={cat.image} alt={cat.name} width={30} height={30} />
            </div>
            <p className="category-name">{cat.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}