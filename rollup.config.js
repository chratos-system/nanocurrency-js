import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'
import license from 'rollup-plugin-license'
import pkg from './package.json'

const licenseBanner = `
/*!
* nanocurrency-js: A toolkit for the Nano cryptocurrency.
* Copyright (c) <%= moment().format('YYYY') %> Marvin ROGER <dev at marvinroger dot fr>
* Licensed under GPL-3.0 (https://git.io/vAZsK)
*/
`.trim()

const globals = { fs: 'fs', path: 'path' }

export default [
  {
    input: 'src/index.js',
    external: ['fs', 'path'],
    output: [
      { name: 'NanoCurrency', file: pkg.browser, format: 'umd', globals },
      { file: pkg.main, format: 'cjs', globals },
      { file: pkg.module, format: 'es', globals }
    ],
    plugins: [
      resolve(),
      commonjs(),
      uglify(),
      license({
        banner: licenseBanner
      })
    ]
  }
]
