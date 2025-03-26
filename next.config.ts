import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    reactStrictMode: true,
    output: "standalone",
    experimental: {
        optimizeServerReact: true,
    }
};

export default nextConfig;
