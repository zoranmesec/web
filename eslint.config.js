// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = defineConfig([
    {
        files: ['**/*.ts'],
        extends: [eslint.configs.recommended, tseslint.configs.recommended, tseslint.configs.stylistic, angular.configs.tsRecommended],
        processor: angular.processInlineTemplates,
        ignores: ['src/generated/graphql.ts'],
        rules: {
            '@angular-eslint/directive-selector': [
                'error',
                {
                    type: 'attribute',
                    prefix: 'app',
                    style: 'camelCase'
                }
            ],
            '@angular-eslint/component-selector': [
                'error',
                {
                    type: 'all',
                    prefix: ['app', 'ng'],
                    style: 'kebab-case'
                }
            ],
            '@angular-eslint/prefer-standalone': 'off',
            '@angular-eslint/prefer-inject': 'off',

            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    args: 'all',
                    ignoreRestSiblings: true,
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^ignore',
                    argsIgnorePattern: '^_'
                }
            ],
            '@typescript-eslint/no-explicit-any': 'error'
        }
    },
    {
        files: ['*.spec.ts', '*.spec.tsx', '*.spec.js', '*.spec.jsx', '*.e2e-spec.ts', 'test-setup.ts'],
        rules: {
            '@typescript-eslint/no-magic-numbers': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            'import/no-extraneous-dependencies': ['error', { devDependencies: true }]
        }
    },
    {
        files: ['**/*.html'],
        extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
        rules: {
            '@angular-eslint/template/alt-text': 'off',
            '@angular-eslint/template/elements-content': 'off',
            '@angular-eslint/template/label-has-associated-control': 'off',
            '@angular-eslint/template/table-scope': 'error',
            '@angular-eslint/template/valid-aria': 'off',
            '@angular-eslint/template/banana-in-box': 'error',
            '@angular-eslint/template/click-events-have-key-events': 'off',
            '@angular-eslint/template/conditional-complexity': 'off',
            '@angular-eslint/template/cyclomatic-complexity': 'off',
            '@angular-eslint/template/eqeqeq': 'error',
            '@angular-eslint/template/i18n': 'off',
            '@angular-eslint/template/mouse-events-have-key-events': 'off',
            '@angular-eslint/template/no-any': 'error',
            '@angular-eslint/template/no-autofocus': 'error',
            '@angular-eslint/template/no-call-expression': 'off',
            '@angular-eslint/template/no-distracting-elements': 'error',
            '@angular-eslint/template/no-duplicate-attributes': 'off',
            '@angular-eslint/template/no-negated-async': 'error',
            '@angular-eslint/template/no-positive-tabindex': 'error',
            '@angular-eslint/template/use-track-by-function': 'off',
            '@angular-eslint/template/interactive-supports-focus': 'off'
        }
    }
]);
