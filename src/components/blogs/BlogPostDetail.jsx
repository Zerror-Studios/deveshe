import Image from "next/image";
import BlogGridCard from "@/components/common/card/BlogGridCard";
import BlogPostShare from "@/components/blogs/BlogPostShare";

function getReadMinutes(readTime) {
  const match = readTime?.match(/(\d+)/);
  return match ? match[1] : null;
}

function BlogContentBlock({ block }) {
  if (!block) return null;

  switch (block.type) {
    case "heading":
      if (block.level === 2) {
        return <h2>{block.text}</h2>;
      }
      return <h3>{block.text}</h3>;
    case "paragraph":
      return <p>{block.text}</p>;
    case "image":
      return (
        <figure className="blog-post__figure">
          <div className="blog-post__figureMedia">
            <Image
              src={block.src}
              alt={block.alt || ""}
              fill
              className="blog-post__figureImage"
              sizes="(max-width: 768px) 100vw, 900px"
            />
          </div>
          {block.caption ? (
            <figcaption className="blog-post__caption">{block.caption}</figcaption>
          ) : null}
        </figure>
      );
    default:
      return null;
  }
}

function getIntroParagraphs(post) {
  if (post.intro?.length) return post.intro;
  if (post.excerpt) return [post.excerpt];
  return [];
}

export default function BlogPostDetail({ post, relatedPosts = [] }) {
  const tags = post.tags?.length ? post.tags : post.category ? [post.category] : [];
  const readMinutes = getReadMinutes(post.readTime);
  const author = post.author || "DeVeSheDreams";
  const introParagraphs = getIntroParagraphs(post);

  return (
    <article className="blog-post">
      {post.image ? (
        <div className="blog-post__hero">
          <Image
            src={post.image}
            alt={post.imageAlt || post.title}
            fill
            className="blog-post__heroImage"
            sizes="100vw"
            priority
          />
        </div>
      ) : null}

      <header className="blog-post__intro">
        {post.imageCaption ? (
          <p className="blog-post__introCredit">{post.imageCaption}</p>
        ) : null}
        <div className="blog-post__introInner">


          <div className="blog-post__introGrid">

            <div className="blog-post__introMain">
              <h1 className="blog-post__title">{post.title}</h1>
              {post.date ? (
                <p className="blog-post__introDate">({post.date})</p>
              ) : null}
              {introParagraphs.length > 0 ? (
                <div className="blog-post__introCopy">
                  {introParagraphs.map((paragraph, index) => (
                    <p key={index} className="blog-post__lead">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>



        </div>
        <hr className="blog-post__introDivider" aria-hidden />
        <div className="blog-post__introMeta">
          {tags.length > 0 ? (
            <div className="blog-post__introTags">
              {tags.map((tag) => (
                <span key={tag} className="blog-post__introTag">
                  ({tag})
                </span>
              ))}
            </div>
          ) : (
            <span />
          )}
          {post.readTime ? (
            <p className="blog-post__introRead">
              {readMinutes ? <strong>{readMinutes}</strong> : null}{" "}
              <span>(minutes reading)</span>
            </p>
          ) : null}
        </div>
      </header>

      <div className="blog-post__inner">
        {post.content?.length ? (
          <div className="blog-post__body">
            {post.content.map((block, index) => (
              <BlogContentBlock key={`${block.type}-${index}`} block={block} />
            ))}
          </div>
        ) : null}

        <BlogPostShare slug={post.slug} title={post.title} />
      </div>

      {relatedPosts.length > 0 ? (
        <section className="blog-post__related">
          <h2 className="blog-post__relatedHeading">
            Read <span className="heading-accent">also</span>
          </h2>
          <div className="blog-post__relatedGrid">
            {relatedPosts.map((related) => (
              <BlogGridCard key={related._id || related.slug} post={related} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
