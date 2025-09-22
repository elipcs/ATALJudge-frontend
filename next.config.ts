import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/login', destination: '/entrar' },
      { source: '/register', destination: '/cadastro' },
      { source: '/register/:path*', destination: '/cadastro/:path*' },
      { source: '/forgot-password', destination: '/esqueci-senha' },
      { source: '/reset-password', destination: '/resetar-senha' },
    ];
  },
};

export default nextConfig;
