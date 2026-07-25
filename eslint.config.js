import js from "@eslint/js";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
    {
        // Build output and deps aren't source; flat config has no implicit
        // ignores beyond node_modules, so a stray `dist/` from a local build
        // was being linted as if it were hand-written code.
        ignores: ["dist/**", "dist-ssr/**", "node_modules/**", "playwright-report/**", "test-results/**", "coverage/**"],
    },
    js.configs.recommended,
    {
        files: ["**/*.{ts,tsx}", "**/*.js", "**/*.cjs"],
        plugins: {
            "@typescript-eslint": typescriptPlugin,
            "react": reactPlugin,
            "react-hooks": reactHooksPlugin,
        },
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021,
                "process": "readonly",
                "console": "readonly",
                "document": "readonly",
                "window": "readonly",
                "localStorage": "readonly",
                "it": "readonly",
                "describe": "readonly",
                "expect": "readonly",
                "vi": "readonly",
                "beforeEach": "readonly",
                "afterEach": "readonly",
                "beforeAll": "readonly",
                "afterAll": "readonly",
                "__dirname": "readonly"
            },
        },
        rules: {
            "no-unused-vars": "off",
            // TypeScript's own checker resolves ambient/global types (e.g. the
            // `Express` namespace from @types/multer); the core no-undef rule
            // doesn't know about those and flags them as undefined.
            "no-undef": "off",
            "react/react-in-jsx-scope": "off",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": ["error", {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_"
            }],
            "react/prop-types": "off"
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
];
