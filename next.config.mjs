/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Fix for Konva - exclude canvas from server-side bundle
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        canvas: "canvas",
      });
    }
    
    // Ignore canvas module during build
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    return config;
  },
};

export default nextConfig;
  