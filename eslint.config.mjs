import { ESLint } from "eslint";

export default new ESLint({
  baseConfig: {
    extends: "eslint:recommended",
    plugins: ["security"],
    rules: {
      "security/detect-object-injection": "error"
    },
    files: ["**/*.js"]
  }
});
