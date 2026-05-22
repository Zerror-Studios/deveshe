import HeroSection from "@/components/shop/HeroSection";
import BlogListing from "@/components/blogs/BlogListing";
import { BLOG_HERO_IMAGE } from "@/data/blogs";

export default function BlogsClient({ posts }) {
  return (
    <>
      <HeroSection
        heroImageSrc={BLOG_HERO_IMAGE}
        isDefault
        showFilter={false}
        animateNav={false}
        categoryDescription="Stories on style, fabric, and wearing what you mean."
      />
      <BlogListing posts={posts} />
    </>
  );
}
