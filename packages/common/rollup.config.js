import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import dts from 'rollup-plugin-dts';
import packageJson from './package.json' assert { type: 'json' };
import json from '@rollup/plugin-json';

const modules = ['hooks', 'request', 'theme', 'utils'];

const jsConfigs = modules.map((name) => ({
  input: `${name}/index.ts`,
  output: [
    {
      file: `dist/${name}/index.js`,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: `dist/${name}/index.esm.js`,
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    json(),           // 👈 加在 resolve() 前面
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      emitDeclarationOnly: false,
      // 不要写 declarationDir
      exclude: ['**/__tests__', '**/*.test.tsx', '**/*.test.ts'],
    }),
  ],
  external: [
    ...Object.keys(packageJson.peerDependencies || {}),
    ...Object.keys(packageJson.dependencies || {}),
  ],
}));

const dtsConfigs = modules.map((name) => ({
  input: `dist/types/${name}/index.d.ts`,
  output: [{ file: `dist/${name}/index.d.ts`, format: 'es' }],
  plugins: [dts()],
}));

export default [
  ...jsConfigs,
  ...dtsConfigs
];