import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [react(), tailwindcss()],
    define: {
      // Ensure NODE_ENV is available in the browser
      'process.env.NODE_ENV': JSON.stringify(mode),
      // Add other environment variables as needed
      'process.env.REACT_APP_DEBUG_LOGGING': JSON.stringify(!isProduction),
    },
    build: {
      // Production optimizations
      minify: isProduction,
      sourcemap: !isProduction,
      rollupOptions: {
        output: {
          // Remove console.log statements in production
          ...(isProduction && {
            manualChunks: {
              vendor: ['react', 'react-dom'],
            }
          })
        }
      }
    },
    server: {
      port: 3000,
      open: true
    }
  }
})
