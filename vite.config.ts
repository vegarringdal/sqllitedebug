/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

export default defineConfig({
    plugins: [
       
        react(),
        
    ],
    base:"./",
    define: {
        APP_VERSION: `"${require("./package.json").version}"`
    },
     optimizeDeps: {
                exclude: ["@sqlite.org/sqlite-wasm"]
            },
    server: {
        cors: true,
        port: 3080
    }
});
