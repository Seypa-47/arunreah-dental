import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const publicEnv = loadEnv(mode, process.cwd(), 'VITE_');
  const apiProxyTarget = publicEnv.VITE_DEV_API_PROXY_TARGET;
  const allowedDevHosts = publicEnv.VITE_DEV_ALLOWED_HOSTS
    ?.split(',')
    .map((host) => host.trim())
    .filter(Boolean);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      allowedHosts: allowedDevHosts?.length ? allowedDevHosts : undefined,
      port: 5173,
      strictPort: true,
      proxy: apiProxyTarget
        ? {
            '/api': {
              changeOrigin: true,
              target: apiProxyTarget,
              configure: (proxy) => {
                proxy.on('proxyReq', (proxyRequest) => {
                  // The browser talks to Vite on the same origin. Do not forward a
                  // temporary tunnel origin to the local Worker, where it would be
                  // evaluated as an external CORS request.
                  proxyRequest.removeHeader('origin');
                });
              },
            },
          }
        : undefined,
    },
  };
});
