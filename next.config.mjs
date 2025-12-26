/** @type {import('next').NextConfig} */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

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
    
    // Exclude better-sqlite3 and Node.js built-ins from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
      
      // Handle ansi-to-html CommonJS module in client bundle
      // Use resolve to get the actual path to the module
      try {
        const ansiToHtmlPath = require.resolve("ansi-to-html");
        config.resolve.alias = {
          ...config.resolve.alias,
          "ansi-to-html": ansiToHtmlPath,
        };
      } catch (e) {
        // If resolve fails, just use the package name (webpack will handle it)
        config.resolve.alias = {
          ...config.resolve.alias,
          "ansi-to-html": "ansi-to-html",
        };
      }
      
      // Ignore better-sqlite3 and database-related modules in client bundle
      config.externals = config.externals || [];
      config.externals.push(
        {
          "better-sqlite3": "commonjs better-sqlite3",
        },
        // Exclude database modules from client bundle
        function ({ request }, callback) {
          // Never externalize client-side payload files
          if (
            request?.includes("constants.client") ||
            request?.includes("payload/hooks") ||
            request?.includes("lib/payload/hooks")
          ) {
            return callback();
          }
          
          if (
            request?.includes("spells.db") ||
            request?.includes("spellsRepository") ||
            request?.includes("runesRepository") ||
            request?.includes("drizzle-orm/better-sqlite3") ||
            request?.includes("@payloadcms/db-sqlite") ||
            // Only externalize payload server-side modules
            (request?.includes("payload") && !request?.includes("hooks"))
          ) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        }
      );
    }
    
    return config;
  },
};

export default nextConfig;
  