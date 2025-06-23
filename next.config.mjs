/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: [
			"emmpo.com",
			"dieselfarm.com",
			"plus.unsplash.com",
			"ark8.net",
			"localhost",
			"manifest-dev-bucket.s3.ap-south-1.amazonaws.com",
		],
	},
};

export default nextConfig;
