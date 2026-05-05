// vite.config.js
import { defineConfig, loadEnv } from "file:///D:/quiz/quiz-app/node_modules/vite/dist/node/index.js";
import react from "file:///D:/quiz/quiz-app/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///D:/quiz/quiz-app/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isProduction = mode === "production";
  return {
    plugins: [react(), tailwindcss()],
    define: {
      // Shim minimal process.env for code that still references it
      "process.env": {
        NODE_ENV: JSON.stringify(mode),
        REACT_APP_DEBUG_LOGGING: JSON.stringify(!isProduction),
        REACT_APP_BACKEND_URL: JSON.stringify(env.VITE_BACKEND_URL || env.REACT_APP_BACKEND_URL || "")
      }
    },
    build: {
      // Production optimizations
      // Keep default esbuild minifier and drop console/debugger in prod
      minify: isProduction,
      esbuild: {
        drop: isProduction ? ["console", "debugger"] : [],
        legalComments: "none",
        keepNames: false
      },
      sourcemap: !isProduction,
      rollupOptions: {
        output: {
          ...isProduction && {
            manualChunks: {
              vendor: ["react", "react-dom"]
            }
          }
        }
      },
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      modulePreload: { polyfill: false }
    },
    server: {
      port: 3e3,
      open: true
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxxdWl6XFxcXHF1aXotYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxxdWl6XFxcXHF1aXotYXBwXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9xdWl6L3F1aXotYXBwL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSdcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBjb21tYW5kLCBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XG4gIGNvbnN0IGlzUHJvZHVjdGlvbiA9IG1vZGUgPT09ICdwcm9kdWN0aW9uJztcbiAgXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW3JlYWN0KCksIHRhaWx3aW5kY3NzKCldLFxuICAgIGRlZmluZToge1xuICAgICAgLy8gU2hpbSBtaW5pbWFsIHByb2Nlc3MuZW52IGZvciBjb2RlIHRoYXQgc3RpbGwgcmVmZXJlbmNlcyBpdFxuICAgICAgJ3Byb2Nlc3MuZW52Jzoge1xuICAgICAgICBOT0RFX0VOVjogSlNPTi5zdHJpbmdpZnkobW9kZSksXG4gICAgICAgIFJFQUNUX0FQUF9ERUJVR19MT0dHSU5HOiBKU09OLnN0cmluZ2lmeSghaXNQcm9kdWN0aW9uKSxcbiAgICAgICAgUkVBQ1RfQVBQX0JBQ0tFTkRfVVJMOiBKU09OLnN0cmluZ2lmeShlbnYuVklURV9CQUNLRU5EX1VSTCB8fCBlbnYuUkVBQ1RfQVBQX0JBQ0tFTkRfVVJMIHx8ICcnKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgLy8gUHJvZHVjdGlvbiBvcHRpbWl6YXRpb25zXG4gICAgICAvLyBLZWVwIGRlZmF1bHQgZXNidWlsZCBtaW5pZmllciBhbmQgZHJvcCBjb25zb2xlL2RlYnVnZ2VyIGluIHByb2RcbiAgICAgIG1pbmlmeTogaXNQcm9kdWN0aW9uLFxuICAgICAgZXNidWlsZDoge1xuICAgICAgICBkcm9wOiBpc1Byb2R1Y3Rpb24gPyBbJ2NvbnNvbGUnLCAnZGVidWdnZXInXSA6IFtdLFxuICAgICAgICBsZWdhbENvbW1lbnRzOiAnbm9uZScsXG4gICAgICAgIGtlZXBOYW1lczogZmFsc2UsXG4gICAgICB9LFxuICAgICAgc291cmNlbWFwOiAhaXNQcm9kdWN0aW9uLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICAuLi4oaXNQcm9kdWN0aW9uICYmIHtcbiAgICAgICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICAgICB2ZW5kb3I6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcbiAgICAgIGFzc2V0c0lubGluZUxpbWl0OiA0MDk2LFxuICAgICAgbW9kdWxlUHJlbG9hZDogeyBwb2x5ZmlsbDogZmFsc2UgfVxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiAzMDAwLFxuICAgICAgb3BlbjogdHJ1ZVxuICAgIH1cbiAgfVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd08sU0FBUyxjQUFjLGVBQWU7QUFDOVEsT0FBTyxXQUFXO0FBQ2xCLE9BQU8saUJBQWlCO0FBR3hCLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsU0FBUyxLQUFLLE1BQU07QUFDakQsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBQzNDLFFBQU0sZUFBZSxTQUFTO0FBRTlCLFNBQU87QUFBQSxJQUNMLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDO0FBQUEsSUFDaEMsUUFBUTtBQUFBO0FBQUEsTUFFTixlQUFlO0FBQUEsUUFDYixVQUFVLEtBQUssVUFBVSxJQUFJO0FBQUEsUUFDN0IseUJBQXlCLEtBQUssVUFBVSxDQUFDLFlBQVk7QUFBQSxRQUNyRCx1QkFBdUIsS0FBSyxVQUFVLElBQUksb0JBQW9CLElBQUkseUJBQXlCLEVBQUU7QUFBQSxNQUMvRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQTtBQUFBO0FBQUEsTUFHTCxRQUFRO0FBQUEsTUFDUixTQUFTO0FBQUEsUUFDUCxNQUFNLGVBQWUsQ0FBQyxXQUFXLFVBQVUsSUFBSSxDQUFDO0FBQUEsUUFDaEQsZUFBZTtBQUFBLFFBQ2YsV0FBVztBQUFBLE1BQ2I7QUFBQSxNQUNBLFdBQVcsQ0FBQztBQUFBLE1BQ1osZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sR0FBSSxnQkFBZ0I7QUFBQSxZQUNsQixjQUFjO0FBQUEsY0FDWixRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsWUFDL0I7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLGNBQWM7QUFBQSxNQUNkLG1CQUFtQjtBQUFBLE1BQ25CLGVBQWUsRUFBRSxVQUFVLE1BQU07QUFBQSxJQUNuQztBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLElBQ1I7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
