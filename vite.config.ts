import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// Mantenemos los imports específicos de Replit por si los necesitas de alguna forma,
// aunque es posible que no sean necesarios o den problemas fuera de Replit.
// El de cartographer es condicional, así que no debería ejecutarse en producción.
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(), // Este podría ser solo para desarrollo
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@db": path.resolve(import.meta.dirname, "db"),
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  // La raíz del proyecto frontend es la carpeta 'client'
  root: path.resolve(import.meta.dirname, "client"),

  // Configuración del Build (¡CON LA CORRECCIÓN!)
  build: {
    // Carpeta donde Vite dejará los archivos construidos (relativa a la raíz del proyecto, no a la 'root' del cliente)
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    // Vaciar la carpeta de salida antes de construir
    emptyOutDir: true,
    // --- AÑADIDO IMPORTANTE ---
    rollupOptions: {
      // El archivo HTML de entrada (relativo a la carpeta definida en 'root')
      input: 'index.html'
    }
    // --------------------------
  },
});