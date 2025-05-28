import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable "assigned but never used" errors
      "@typescript-eslint/no-unused-vars": "off",

      // Disable "expected assignment or function call and instead saw an expression"
      "@typescript-eslint/no-unused-expressions": "off",

      // Disable React Hook exhaustive deps warning (missing dependency)
      "react-hooks/exhaustive-deps": "off",

      // Disable unused eslint-disable directive warnings
      "eslint-comments/no-unused-disable": "off",

      // If you want, disable no-explicit-any (since you had that directive)
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
];

export default eslintConfig;
