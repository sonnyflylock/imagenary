import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "bot.messagesimproved.com" },
    ],
  },
};

export default nextConfig;
