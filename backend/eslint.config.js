import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ["dist", "node_modules", "eslint.config.js", "jest.config.js", "**/_OLD/**"] },
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    stylistic.configs.recommended,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        plugins: {
            '@stylistic': stylistic
        },
        rules: {
            // Stylistic rules
            '@stylistic/quotes': ['error', 'single'],
            '@stylistic/semi': ['error', 'always'],
            '@stylistic/indent': ['error', 4],
            '@typescript-eslint/naming-convention': 'error',

            // Developer Experience
            '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true, allowNever: true, allowNullish: true, allowAny: true }],

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
    },
    {
        files: ['**/*.test.ts', '**/*.spec.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-confusing-void-expression': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
        },
    },
);
