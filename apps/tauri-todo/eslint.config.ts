import { react } from "@monorepo-template/eslint-config"
import { defineConfig } from "eslint/config"

export default defineConfig([
  { ignores: ["src-tauri/"] },
  ...react,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
