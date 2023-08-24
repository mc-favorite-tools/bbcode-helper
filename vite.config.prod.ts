/*
 * The MIT License (MIT)
 * Copyright (c) 2023 hans000
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import banner from 'vite-plugin-banner'
import pkg from './package.json'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

const prefix = `
// ==UserScript==
// @name            ${pkg.name}
// @namespace       http://hans0000.github.io/
// @version         ${pkg.version}
// @author          ${pkg.author.name}
// @description     该项目用于扩展mcbbs论坛富文本编辑器，使其能编辑表格行列等，并提供获取页面bbcode的能力
// @run-at          document-end
// @match           https://www.mcbbs.net/*
// @grant           none
// @icon            data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @require         https://unpkg.com/react@18.2.0/umd/react.production.min.js
// @require         https://unpkg.com/state-local@1.0.7/lib/umd/state-local.min.js
// @require         https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js
// @require         https://unpkg.com/prop-types@15.8.1/prop-types.min.js
// ==/UserScript==
`.trimStart()


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
                dir: './dist/' + pkg.version,
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
        banner({
            content: prefix,
            verify: false,
            outDir: './dist/' + pkg.version,
        }),
        cssInjectedByJsPlugin({
          topExecutionPriority: true
        }),
    ],
})