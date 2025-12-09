import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  reactStrictMode: true,
  transpilePackages: ["logsdx"],
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === "production" ? "/logsdx" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/logsdx" : "",
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});

export default withMDX(nextConfig);
