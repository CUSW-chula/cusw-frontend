import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    reactStrictMode: true,
    compress: true,
    poweredByHeader: false,
    output: "standalone",
    experimental: {
        optimizeServerReact: true,
        ppr: true
    }
};

export default nextConfig;
