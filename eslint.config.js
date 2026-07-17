import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config([
  { ignores: ['dist', 'build', '.react-router'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Route modules export meta/loader/etc. alongside their component.
      'react-refresh/only-export-components': [
        'error',
        {
          allowConstantExport: true,
          allowExportNames: [
            'meta',
            'links',
            'headers',
            'handle',
            'loader',
            'clientLoader',
            'action',
            'clientAction',
            'ErrorBoundary',
            'HydrateFallback',
            'shouldRevalidate',
          ],
        },
      ],
    },
  },
  prettier,
])
