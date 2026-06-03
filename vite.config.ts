import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    
    // Hapus bagian nitro, cukup sisakan server entry saja
    tanstackStart({
      server: { 
        entry: "src/server.ts" 
      }
    }),
    
    viteReact(),
    tailwindcss(),
  ],
});