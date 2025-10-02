import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Otimizações para desenvolvimento
  experimental: {
    // Habilita cache de compilação mais agressivo
    // optimizeCss: true, // Removido para evitar conflitos com critters
  },
  
  // Configuração do Turbopack (substitui experimental.turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Otimizações de compilação
  compiler: {
    // Remove console.log em produção
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configuração de modularização de imports
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },
  
  // Configurações de webpack para melhor performance
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Otimizações para desenvolvimento
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      
      // Cache mais agressivo para desenvolvimento
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    
    // Otimizações para todos os ambientes
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
