import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import dts from 'rollup-plugin-dts';
import packageJson from './package.json' assert { type: 'json' };

export default [
  // 打包 js/ts
  {
    input: 'index.ts', // 你的入口文件
    output: [
      {
        file: packageJson.main.replace('.tsx', '.js'),
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module.replace('.tsx', '.esm.js'),
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist/types',
        rootDir: '.',
        exclude: ['**/__tests__', '**/*.test.tsx', '**/*.test.ts'],
      }),
    ],
    external: [
      ...Object.keys(packageJson.peerDependencies || {}),
      ...Object.keys(packageJson.dependencies || {}),
    ],
  },
  // 打包 dts
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];