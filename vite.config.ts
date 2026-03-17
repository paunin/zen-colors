import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      plugins: [
        react(),
        dts({ tsconfigPath: './tsconfig.lib.json', rollupTypes: true }),
      ],
      build: {
        lib: {
          entry: resolve(__dirname, 'lib/index.ts'),
          name: 'ZenColors',
          fileName: 'zen-colors',
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'react/jsx-runtime': 'jsxRuntime',
            },
          },
        },
      },
    };
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        'zen-colors': resolve(__dirname, 'lib/index.ts'),
      },
    },
  };
});
