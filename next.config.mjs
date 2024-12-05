/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
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
      async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Set-Cookie',
                        value: 'cookie-name=cookie-value; Secure; SameSite=None',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
