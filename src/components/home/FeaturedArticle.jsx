import BracketSlideCta from "@/components/common/BracketSlideCta";
import Image from "next/image";

export default function FeaturedArticle() {
    return (
        <section className="article-container">
            <p className="article-heading">
            Latest Blogs
            </p>
            {/* 🔥 HERO IMAGE */}
            <div className="article-imageWrapper">
                <Image
                    width={1000}
                    height={1000}
                    src="https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F2796x1573%2Fdefb514004%2Fj-sam-ban.jpg&w=1920&q=90" // replace with your image
                    alt="article"
                    className="article-image"
                />
            </div>

            {/* 🔥 CONTENT */}
            <div className="article-content">
                <h2 className="article-title">
                    Culture Canvas: Sam Lake <span>[NEW]</span>
                </h2>

                <p className="article-desc">
                    Creative director, writer, world-builder, and cult figure - Sam Lake is
                    always chasing the next evolution in storytelling...
                </p>

                <p className="article-date">[9.26.2025]</p>

                <BracketSlideCta
                    label="View all articles"
                    href="/lookbook"
                    ariaLabel="View all articles"
                />
            </div>
        </section>
    );
}