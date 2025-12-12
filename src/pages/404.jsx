import SeoHeader from "@/components/seo/SeoHeader";

const Custom404 = ({ meta }) => {
  return (
    <>
      <SeoHeader meta={meta} />
      <div style={style}>
        <p>Sorry, we couldn't find the page you're looking for.</p>
        <p>Page not found</p>
      </div>
    </>
  );
}

export default Custom404;

export async function getStaticProps() {
  const meta = {
    title: "Page Not Found – DeVeSheDreams",
    description:
      "The page you're looking for doesn’t exist. Explore DeVeSheDreams and discover wearable art, creative fashion, and expressive capsule collections.",
    keywords: ["404", "page not found", "DeVeSheDreams error page"],
    primaryKeywords: ["404 page"],
    author: "DeVeSheDreams",
    robots: "noindex, follow",
    og: {
      title: "Page Not Found – DeVeSheDreams",
      description:
        "This page does not exist. Explore DeVeSheDreams to discover artistic fashion and wearable creativity."
    },
    twitter: {
      card: "summary_large_image",
      title: "Page Not Found – DeVeSheDreams",
      description: "Page not found on DeVeSheDreams."
    }
  };


  return { props: { meta } };
}
const style = {
  height: '100vh',
  fontSize: '1.875rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  paddingLeft: '1.5rem',
  paddingRight: '1.5rem',
}

