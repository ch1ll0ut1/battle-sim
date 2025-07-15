import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ["dist", "node_modules", "eslint.config.js"] },
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            // Stylistic rules
            quotes: ['error', 'single'],
            semi: ['error', 'always'],
            indent: ['off'], // handled by vsc formatter on save

            // Developer Experience
            '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],

            // Rules that are already checked by TypeScript
            '@typescript-eslint/no-undef': 'off', // TS catches undefined variables
            '@typescript-eslint/no-unused-vars': 'off', // TS checks unused variables
            '@typescript-eslint/no-dupe-class-members': 'off', // TS checks duplicate class members
            '@typescript-eslint/no-redeclare': 'off', // TS checks variable redeclaration
            '@typescript-eslint/no-loss-of-precision': 'off', // TS checks numeric precision loss
            '@typescript-eslint/no-const-assign': 'off', // TS checks assignment to const
            '@typescript-eslint/no-dupe-args': 'off', // TS checks duplicate function arguments
            '@typescript-eslint/no-func-assign': 'off', // TS checks function assignment
            '@typescript-eslint/no-setter-return': 'off', // TS checks setter return
            '@typescript-eslint/no-import-assign': 'off', // TS checks import assignment
            '@typescript-eslint/getter-return': 'off', // TS checks getter return
            '@typescript-eslint/valid-typeof': 'off', // TS checks typeof comparisons
        }
    }
);
