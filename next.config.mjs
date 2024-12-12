/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    i18n: {
      locales: ['en', 'tr'],
      defaultLocale: 'tr',
    },
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true,
      },
      typescript: {
        // ⚠️ TypeScript hatalarını görmezden gel
        ignoreBuildErrors: true,
      },
      eslint: {
        // ⚠️ ESLint hatalarını görmezden gel
        ignoreDuringBuilds: true,
      },
};

export default nextConfig;
