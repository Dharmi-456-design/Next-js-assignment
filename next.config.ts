import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Ensure Next.js traces files relative to this project root
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: true,
};

export default nextConfig;
