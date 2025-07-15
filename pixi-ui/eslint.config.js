import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ["dist", "node_modules", "eslint.config.js"] },
    eslint.configs.recommended,
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
            indent: ['error', 4],

            // Rules that are already checked by TypeScript
            '@typescript-eslint/no-undef': 'off', // TS catches undefined variables
            '@typescript-eslint/no-unused-vars': 'off', // Use @typescript-eslint/no-unused-vars instead (or turn off both)
            '@typescript-eslint/no-dupe-class-members': 'off', // TS checks duplicate class members
            '@typescript-eslint/no-redeclare': 'off', // TS checks variable redeclaration
            '@typescript-eslint/no-unused-expressions': 'off', // Use @typescript-eslint/no-unused-expressions if needed
            '@typescript-eslint/no-array-constructor': 'off', // Use @typescript-eslint/no-array-constructor if needed
            '@typescript-eslint/no-implied-eval': 'off', // Use @typescript-eslint/no-implied-eval if needed
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
