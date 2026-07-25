import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default [
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/coverage/**"],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
];
