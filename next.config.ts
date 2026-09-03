import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/**/*": ["./node_modules/@prisma/client/runtime/*.wasm*"],
  },
};

export default nextConfig;
