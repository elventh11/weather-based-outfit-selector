import { fixupPluginRules } from '@eslint/compat'
import globals from 'globals'

const ERROR = 'error'
const WARN = 'warn'

const has = (pkg) => {
  try {
    import.meta.resolve(pkg, import.meta.url)
    return true
  } catch {
    return false
  }
}

const hasTypeScript = has('typescript')
const hasReact = has('react')

export const config = [
  {
    ignores: [
      '**/.cache/**',
      '**/node_modules/**',
      '**/build/**',
      '**/dist/**',
    ],
  },

  {
    plugins: {
      import: (await import('eslint-plugin-import-x')).default,
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'no-unexpected-multiline': ERROR,
      'no-warning-comments': [
        ERROR,
        { terms: ['FIXME'], location: 'anywhere' },
      ],
      'import/no-duplicates': [WARN, { 'prefer-inline': true }],
      'import/order': [
        WARN,
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
        },
      ],
    },
  },

  hasReact
    ? {
        files: ['**/*.tsx', '**/*.jsx'],
        plugins: { react: (await import('eslint-plugin-react')).default },
        languageOptions: {
          parser: (await import('typescript-eslint')).parser,
          parserOptions: { jsx: true },
        },
        rules: { 'react/jsx-key': WARN },
      }
    : null,

  hasReact
    ? {
        files: ['**/*.ts?(x)', '**/*.js?(x)'],
        plugins: {
          'react-hooks': fixupPluginRules(
            await import('eslint-plugin-react-hooks'),
          ),
        },
        rules: {
          'react-hooks/rules-of-hooks': ERROR,
          'react-hooks/exhaustive-deps': WARN,
        },
      }
    : null,

  {
    files: ['**/*.js?(x)'],
    rules: {
      'no-unused-vars': [
        WARN,
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^ignored',
        },
      ],
    },
  },

  hasTypeScript
    ? {
        files: ['**/*.ts?(x)'],
        languageOptions: {
          parser: (await import('typescript-eslint')).parser,
          parserOptions: { projectService: true },
        },
        plugins: {
          '@typescript-eslint': (await import('typescript-eslint')).plugin,
        },
        rules: {
          '@typescript-eslint/no-unused-vars': [
            WARN,
            {
              args: 'after-used',
              argsIgnorePattern: '^_',
              ignoreRestSiblings: true,
              varsIgnorePattern: '^ignored',
            },
          ],
          'import/consistent-type-specifier-style': [WARN, 'prefer-inline'],
          '@typescript-eslint/consistent-type-imports': [
            WARN,
            {
              prefer: 'type-imports',
              disallowTypeAnnotations: true,
              fixStyle: 'inline-type-imports',
            },
          ],

          '@typescript-eslint/no-misused-promises': [
            'error',
            { checksVoidReturn: false },
          ],

          '@typescript-eslint/no-floating-promises': 'error',
        },
      }
    : null,
].filter(Boolean)

/** @type {import('eslint').Linter.Config} */
export default [...config]
