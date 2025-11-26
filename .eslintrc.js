//allow unsafe assignment and
module.exports = {
  root: true, // Set the root to avoid ESLint looking for config files in parent directories
  env: {
    node: true,
    jest: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json', // Ensure ESLint uses the tsconfig paths
      },
    },
  },
  parser: '@typescript-eslint/parser', // Use TypeScript parser
  parserOptions: {
    project: './tsconfig.json', // Point to the TypeScript project configuration
    tsconfigRootDir: __dirname, // Ensure correct path resolution
    sourceType: 'module', // Allow ECMAScript modules
  },
  plugins: [
    '@typescript-eslint', // TypeScript linting plugin
    'prettier', // Prettier integration
    'import', // Import/export rules
    'unicorn', // Enforces better coding practices
    'security', // Security best practices
  ],
  extends: [
    'eslint:recommended', // ESLint recommended rules
    'plugin:@typescript-eslint/recommended', // TypeScript recommended rules
    'plugin:@typescript-eslint/recommended-requiring-type-checking', // Type-aware rules
    'plugin:import/errors', // Import/export errors
    'plugin:import/warnings', // Import/export warnings
    'plugin:import/typescript', // TypeScript import support
    'plugin:unicorn/recommended', // Enforce good practices
    'prettier', // Ensure Prettier formatting
  ],
  rules: {
    'security/detect-object-injection': 'warn', // Warn about dangerous object injection

    // Debugging Rules
    'no-console': ['error', { allow: ['warn', 'error'] }], // Allow console.warn and console.error
    'no-debugger': 'error', // Disallow debugger statements
    'no-var': 'error', // Use let/const instead of var
    'prefer-const': 'error', // Prefer const for immutable bindings
    eqeqeq: ['error', 'always'], // Enforce strict equality (===, !==)
    curly: 'error', // Require consistent use of curly braces

    // TypeScript Specific Rules
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_' }, // Ignore unused variables starting with "_"
    ],
    '@typescript-eslint/no-floating-promises': 'error', // Ensure promises are handled properly
    '@typescript-eslint/no-explicit-any': 'warn', // Discourage use of 'any' type

    '@typescript-eslint/no-unsafe-assignment': 'off', // Allow unsafe assignment
    '@typescript-eslint/no-unsafe-member-access': 'off', // Allow unsafe member access
    '@typescript-eslint/no-unsafe-return': 'off', // Allow unsafe return
    '@typescript-eslint/no-unsafe-call': 'off', // Allow unsafe call
    // Import Rules
    'import/no-unresolved': ['warn', { commonjs: true, amd: true }], // Ensure imports are resolvable
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        alphabetize: { order: 'asc', caseInsensitive: true }, // Alphabetize import statements
      },
    ],
    // no unsafe-arguments
    '@typescript-eslint/no-unsafe-argument': 'off', // Allow unsafe argument
    '@typescript-eslint/no-unsafe-arguments': 'off', // Allow unsafe arguments
    '@typescript-eslint/no-unsafe-assignment': 'off', // Allow unsafe assignment
    '@typescript-eslint/no-unsafe-member-access': 'off', // Allow unsafe member access
    '@typescript-eslint/no-unsafe-return': 'off', // Allow unsafe return
    '@typescript-eslint/no-unsafe-call': 'off', // Allow unsafe call
    '@typescript-eslint/require-await': 'off', // Allow require await
    '@typescript-eslint/no-empty-interface': 'off', // Allow empty interfaces
    '@typescript-eslint/no-unused-vars': 'off', // Allow unused arguments
    'import/no-unresolved': 'off', // Allow unresolved imports
    'import/no-extraneous-dependencies': 'off', // Allow extraneous dependencies
    'import/no-duplicates': 'off', // Allow duplicates
    'import/no-anonymous-default-export': 'off', // Allow anonymous default export
    'import/no-named-as-default': 'off', // Allow named as default
    'import/no-named-as-default-member': 'off', // Allow named as default member
    'import/no-named-as-default-member': 'off', // Allow named as default member
    'import/newline-after-import': 'error', // Ensure a newline after imports
    'import/no-default-export': 'error', // Prefer named exports
    '@typescript-eslint/no-unsafe-assignment': 'off', // Allow unsafe assignment
    '@typescript-eslint/no-unsafe-member-access': 'off', // Allow unsafe member access
    '@typescript-eslint/no-unsafe-return': 'off', // Allow unsafe return
    '@typescript-eslint/no-unsafe-call': 'off', // Allow unsafe call
    '@typescript-eslint/require-await': 'off', // Allow require await
    '@typescript-eslint/no-empty-interface': 'off', // Allow empty interfaces
    '@typescript-eslint/no-unused-vars': 'off', // Allow unused arguments
    '@typescript-eslint/no-explicit-any': 'off', // Allow explicit any
    '@typescript-eslint/no-floating-promises': 'off', // Allow floating promises
    '@typescript-eslint/restrict-template-expressions': 'off', // Allow any in template expressions
    '@typescript-eslint/no-var-requires': 'off', // Allow require statements
    'unicorn/null': 'off', // Allow null
    'unicorn/no-null': 'off', // Allow null
    'unicorn/no-array-for-each': 'off', // Allow array for each
    'unicorn/no-array-push-push': 'off', // Allow array push push
    'unicorn/no-array-index-key': 'off', // Allow array index key
    'unicorn/no-array-reduce': 'off', // Allow array reduce
    'unicorn/no-array-some': 'off', // Allow array some
    'unicorn/no-array-every': 'off', // Allow array every
    'unicorn/no-array-find': 'off', // Allow array find
    'unicorn/prefer-number-properties': 'off', // Allow isNaN instead of Number.isNaN
    'unicorn/import-style': 'off', // Allow named imports for node modules
    'unicorn/prefer-module': 'off', // Allow require statements

    // Unicorn Plugin Rules
    'unicorn/filename-case': ['error', { case: 'kebabCase' }], // Enforce kebab-case filenames
    'unicorn/prefer-optional-catch-binding': 'error', // Prefer optional catch bindings
    'unicorn/no-abusive-eslint-disable': 'error', // Prevent overly broad eslint-disable comments
    'unicorn/prefer-top-level-await': 'off',
    'unicorn/no-empty-file': 'off',
    'unicorn/prevent-abbreviations': 'off',

    // Prettier Integration
    'prettier/prettier': 'error', // Ensure Prettier formatting

    // Custom Rules
    'no-restricted-imports': [
      'error',
      { paths: ['lodash'], patterns: ['@/../*'] },
    ],
  },
  ignorePatterns: [
    'node_modules/', // Ignore node_modules directory
    'dist/', // Ignore dist directory
    'build/', // Ignore build directory
    '*.config.js', // Ignore config files for build tools
    '.eslintrc.js', // Ignore ESLint config file itself
  ],
  overrides: [
    {
      files: ['src/domain/**/*.repository.ts'], // Match files in the repository layer
      rules: {
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
      },
    },
    {
      files: ['prisma/seed.ts', 'scripts/**/*.ts'], // Seed and script files
      rules: {
        'no-console': 'off', // Allow console in CLI scripts
        'unicorn/no-process-exit': 'off', // Allow process.exit in CLI scripts
        '@typescript-eslint/no-misused-promises': 'off', // Allow promises in callbacks
      },
    },
  ],
};
