import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core - changes rarely
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Heavy charting library
          "vendor-recharts": ["recharts"],
          // Excel library - only needed for export features
          "vendor-xlsx": ["xlsx"],
          // Rich text editor
          "vendor-quill": ["react-quill-new"],
          // Date utilities
          "vendor-date": ["date-fns", "react-day-picker"],
          // Form handling
          "vendor-form": ["react-hook-form", "@hookform/resolvers", "zod"],
          // Drag and drop
          "vendor-dnd": ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
          // UI utilities
          "vendor-ui": [
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-slot",
            "lucide-react",
          ],
        },
      },
    },
  },
});
