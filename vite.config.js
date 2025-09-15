import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  
  return {
    plugins: [react(), tailwindcss()],
    define: {
      // Shim minimal process.env for code that still references it
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
        REACT_APP_DEBUG_LOGGING: JSON.stringify(!isProduction),
        REACT_APP_BACKEND_URL: JSON.stringify(env.VITE_BACKEND_URL || env.REACT_APP_BACKEND_URL || ''),
      },
    },
    build: {
      // Production optimizations
      // Keep default esbuild minifier and drop console/debugger in prod
      minify: isProduction,
      esbuild: {
        drop: isProduction ? ['console', 'debugger'] : [],
        legalComments: 'none',
        keepNames: false,
      },
      sourcemap: !isProduction,
      rollupOptions: {
        output: {
          ...(isProduction && {
            manualChunks: {
              vendor: ['react', 'react-dom'],
            }
          })
        }
      },
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      modulePreload: { polyfill: false }
    },
    server: {
      port: 3000,
      open: true
    }
  }
})
