import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  experimental: {

  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  compiler: {
    
    removeConsole: process.env.NODE_ENV === 'production',
  },

  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };

      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }

    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    };
    
    return config;
  },
  
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
