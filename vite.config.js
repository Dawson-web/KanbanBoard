import generouted from "@generouted/react-router/plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), generouted()],
  server: {
    open: true,
    port: 5173,
  },
  resolve: {
    alias: {
      "@": "/src",
      "@/types": "/src/types",
      "@/components": "/src/components",
    },
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"], // 添加.jsx和.tsx扩展名支持
  },
});
