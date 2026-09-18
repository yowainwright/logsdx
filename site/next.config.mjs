import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === "production";
const staticPath = isProduction ? "/logsdx" : "";

const nextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  reactStrictMode: true,
  transpilePackages: ["logsdx"],
  output: isProduction ? "export" : undefined,
  images: {
    unoptimized: true,
  },
  basePath: staticPath,
  assetPrefix: staticPath,
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});

export default withMDX(nextConfig);
