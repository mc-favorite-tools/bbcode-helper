/*
 * The MIT License (MIT)
 * Copyright (c) 2023 hans000
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    target: 'es2015',
    assetsDir: './',
    polyfillModulePreload: false,
    terserOptions: {
      ecma: 2015
    },
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        compact: true,
        name: 'index.js',
        format: 'iife',
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          'state': 'state',
          'prop-types': 'PropTypes',
        },
        entryFileNames: 'index.js',
      },
      external: [
        'react',
        'react-dom',
        'state-local',
        'prop-types',
      ],
    },
  },
  plugins: [
    react(),
    cssInjectedByJsPlugin({
      topExecutionPriority: true
    }),
  ]
})
