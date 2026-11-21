// Bundle the API with esbuild: workspace packages (@lamim/*, shipped as TS source) and the
// generated Prisma client are inlined; every npm dependency stays external.
import { rm } from 'node:fs/promises';
import { build } from 'esbuild';

const externalNpm = {
  name: 'external-npm',
  setup(b) {
    b.onResolve({ filter: /^[^./]/ }, (args) => {
      if (
        args.kind === 'entry-point' ||
        args.path.startsWith('@lamim/') ||
        /^[A-Za-z]:[\/]/.test(args.path)
      )
        return undefined;
      return { path: args.path, external: true };
    });
  },
};

await rm('dist', { recursive: true, force: true });
await build({
  entryPoints: ['src/main.ts'],
  outfile: 'dist/main.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  sourcemap: true,
  tsconfig: 'tsconfig.json',
  plugins: [externalNpm],
  logLevel: 'warning',
});
