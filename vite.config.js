import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr"; // ✅ vite-native plugin

export default defineConfig({
  plugins: [
    react(),
    svgr(), // ✅ no need to call it like a function with `()`, just `svgr()` works
  ],
});
