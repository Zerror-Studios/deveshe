/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: {
    autoPrerender: false,
  },
  images: {
    domains: [
      "emmpo.com",
      "dieselfarm.com",
      "plus.unsplash.com",
      "ark8.net",
      "localhost",
      "cdn.deveshedreams.com",
      "avatar.iran.liara.run"
    ],
  },
};

export default nextConfig;
