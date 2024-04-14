import { LibSqlStudoTailwindPreset } from "@libsqlstudio/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.tsx"],
  presets: [LibSqlStudoTailwindPreset],
  corePlugins: {
    preflight: false,
  },
};
