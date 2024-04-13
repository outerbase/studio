import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// lol this get defined cuz it seems to be with @libsqlstudio/config
// and the @libsqlstudio/config is installed in the root of the project
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
});
