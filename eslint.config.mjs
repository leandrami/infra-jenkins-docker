import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node, // adiciona variáveis globais do Node.js
      },
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
  {
    files: ["**/tests/**/*.js", "**/*.test.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest, // adiciona describe, it, expect, jest, etc.
      },
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
];
