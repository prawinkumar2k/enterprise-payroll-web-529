import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
    // Global ignores — must be a standalone object with ONLY ignores for flat config
    {
        ignores: [
            "dist/**",
            "node_modules/**",
            "coverage/**",
            "public/**",
        ],
    },

    // Base JS recommended rules
    js.configs.recommended,

    // React + hooks rules for all JSX/JS source files
    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.es2024,
            },
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        plugins: {
            react: reactPlugin,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        settings: {
            react: { version: "18" },
        },
        rules: {
            // React recommended rules
            ...reactPlugin.configs.recommended.rules,
            // Hooks rules (error on violations - these cause real bugs)
            ...reactHooks.configs.recommended.rules,
            // Vite HMR compliance
            "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

            // Project-specific overrides
            "react/react-in-jsx-scope": "off",         // React 17+ auto-import JSX transform
            "react/prop-types": "off",                 // Not using PropTypes (useReducer pattern)
            "react/display-name": "off",               // Named functions cover this
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
            "no-console": ["warn", { allow: ["warn", "error"] }],
        },
    },

    // Relaxed rules for Vite/config files and Node.js utility scripts
    {
        files: ["*.config.js", "*.config.mjs", "deployment/**", "netlify/**", "lib/**", "utils/server*"],
        languageOptions: { globals: { ...globals.node, ...globals.browser } },
        rules: { "no-console": "off" },
    },
];
