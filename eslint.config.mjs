import { defineConfig, globalIgnores } from 'eslint/config'
import js from '@eslint/js'
import next from '@next/eslint-plugin-next'
import hooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import ts from 'typescript-eslint'

export default defineConfig([
  js.configs.recommended,
  ...ts.configs.recommended,
  { languageOptions: { globals: { ...globals.node, ...globals.browser } } },
  {
    files: ['app/**/*.{ts,tsx}', 'mdx-components.js'],
    plugins: { '@next/next': next, 'react-hooks': hooks },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,
      ...hooks.configs.flat.recommended.rules
    }
  },
  globalIgnores(['.next/**', 'public/_pagefind/**', 'next-env.d.ts'])
])
