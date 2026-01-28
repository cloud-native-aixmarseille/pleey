import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const proxyTarget = process.env.VITE_DEV_PROXY_TARGET || 'http://localhost:3001';

  return {
    plugins: [
      react({
        babel: {
          parserOpts: {
            plugins: ['decorators-legacy'],
          },
        },
      }),
    ],
    server: {
      port: 5173,
      host: true,
      allowedHosts: ['frontend', 'pleey.localhost'],
      proxy: {
        '/graphql': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/socket.io': {
          target: proxyTarget,
          ws: true,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 80,
      host: true,
    },
  };
});
