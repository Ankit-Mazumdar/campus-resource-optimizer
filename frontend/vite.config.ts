// import { defineConfig, Plugin } from "vite";
// import react from "@vitejs/plugin-react-swc";
// import path from "path";
// import { createServer } from "./server";

// // https://vitejs.dev/config/
// export default defineConfig(({ mode }) => ({
//   server: {
//     host: "::",
//     port: 8080,
//     fs: {
//       allow: ["./client", "./shared"],
//       deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
//     },
//   },
//   build: {
//     outDir: "dist/spa",
//   },
//   plugins: [react(), expressPlugin()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./client"),
//       "@shared": path.resolve(__dirname, "./shared"),
//     },
//   },
// }));

// function expressPlugin(): Plugin {
//   return {
//     name: "express-plugin",
//     apply: "serve", // Only apply during development (serve mode)
//     configureServer(server) {
//       const app = createServer();

//       // Add Express app as middleware to Vite dev server
//       server.middlewares.use(app);
//     },
//   };
// }

// import { defineConfig, Plugin } from "vite";
// import react from "@vitejs/plugin-react-swc";
// import path from "path";
// import { createServer } from "./server";

// // https://vitejs.dev/config/
// export default defineConfig(({ mode }) => ({
//   server: {
//     host: "::",
//     port: 8080,
//     fs: {
//       allow: [
//         path.resolve(__dirname),              // ✅ allow frontend root (index.html)
//         path.resolve(__dirname, "client"),    // existing
//         path.resolve(__dirname, "shared"),    // existing
//       ],
//       deny: [
//         ".env",
//         ".env.*",
//         "*.{crt,pem}",
//         "**/.git/**",
//         "server/**",
//       ],
//     },
//   },

//   build: {
//     outDir: "dist/spa",
//   },

//   plugins: [react(), expressPlugin()],

//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./client"),
//       "@shared": path.resolve(__dirname, "./shared"),
//     },
//   },
// }));

// function expressPlugin(): Plugin {
//   return {
//     name: "express-plugin",
//     apply: "serve",
//     configureServer(server) {
//       const app = createServer();
//       server.middlewares.use(app);
//     },
//   };
// }


import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 8080,

    /**
     * 🔗 Proxy backend API
     * Frontend calls → /api/auth/login
     * Vite forwards → http://localhost:5000/api/auth/login
     */
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },

    /**
     * 📁 File system access
     */
    fs: {
      allow: [
        path.resolve(__dirname),            // frontend root (index.html)
        path.resolve(__dirname, "client"),
        path.resolve(__dirname, "shared"),
      ],
    },
  },

  build: {
    outDir: "dist/spa",
  },

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
});

