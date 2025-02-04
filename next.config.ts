import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    reactStrictMode: false,
    output: "standalone",
    typescript: {
        ignoreBuildErrors: true,
    }
};

export default nextConfig;
