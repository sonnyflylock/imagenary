import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "bot.messagesimproved.com" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/i/:path*",
        destination: "https://ozkzfovphykllpxhqixy.supabase.co/storage/v1/object/public/image-uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
