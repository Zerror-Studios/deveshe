import Tab from "@/components/profile/Tab";
import SeoHeader from "@/components/seo/SeoHeader";

const General = ({meta}) => {
  return (
    <>
    <SeoHeader meta={meta} />
      <div className="parent-div">
        <div className="outerdiv-pro">
          <Tab />
        </div>
      </div>
    </>
  );
};

export default General;

export async function getStaticProps() {
  const meta = {
    title: "Your Profile – DeVeSheDreams Account",
    description:
      "Manage your DeVeSheDreams profile. View your orders, wishlist, saved looks, and customize your fashion journey with us.",
    keywords:
      "DeVeSheDreams profile, user account, fashion wishlist, order history, saved items",
    author: "DeVeSheDreams",
    robots: "noindex,follow", // Optional: hide profile page from search engines
  };
  return { props: { meta } };
}
