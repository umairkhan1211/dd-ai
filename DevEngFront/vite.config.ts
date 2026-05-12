import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // YEH PROXY BLOCK ADD KIYA HAI
    proxy: {
      "/api": {
        // Agar aap local backend chalate hain (localhost:3000) toh yeh use karein:
        // target: "http://localhost:3000", 

        // Agar aap local frontend par live Railway backend use karna chahte hain toh line 15 ko comment karein aur line 18 ko uncomment karein:
        target: "https://dvengbackend-production.up.railway.app",

        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));