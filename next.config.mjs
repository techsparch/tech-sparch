/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
    allowedDevOrigins: ["10.164.35.137"],


  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
