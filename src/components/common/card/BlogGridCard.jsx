import Image from "next/image";
import Link from "next/link";

export function getBlogGridCardProps(post) {
  return {
    href: `/blogs/${post?.slug || ""}`,
    src: post?.image || post?.asset?.path || "",
    alt: post?.imageAlt || post?.asset?.altText || post?.title || "Blog post",
    title: post?.title || "",
  };
}

export default function BlogGridCard({ post, href, src, alt, title }) {
  const card = post ? getBlogGridCardProps(post) : { href, src, alt, title };

  if (!card?.href || card.href === "/blogs/") return null;

  return (
    <Link href={card.href} className="blog-card">
      <div className="blog-card__imageWrapper">
        {card.src ? (
          <Image
            src={card.src}
            alt={card.alt}
            fill
            className="blog-card__image"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="blog-card__imagePlaceholder" aria-hidden />
        )}
      </div>
      <div className="blog-card__meta">
        <p className="blog-card__title">{card.title}</p>
      </div>
    </Link>
  );
}
