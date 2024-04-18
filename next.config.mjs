/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  headers: async () => {
    return [
      {
        source:
          "/(favicon.ico|android-chrome-192x192.png|android-chrome-512x512.png|apple-touch-icon.png|favicon-16x16.png|favicon-32x32.png|site.webmanifest)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3000000, stale-while-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
