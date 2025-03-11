import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }
  return defineConfig({
    plugins: [
      react()
    ],
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
      alias: {
        "@": path.resolve(__dirname, "./src"),
        components: path.resolve(__dirname, './src/components'),
        lib: path.resolve(__dirname, './src/lib'),
        assets: path.resolve(__dirname, './src/assets'),
        useQueryClient: path.resolve(__dirname, './src/useQueryClient.ts'),
        App: path.resolve(__dirname, './src/App.tsx'),
        views: path.resolve(__dirname, './src/views'),
        // Simple MUI aliases - now properly resolved by node
        '@mui/material': path.resolve(__dirname, 'node_modules/@mui/material'),
        '@mui/icons-material': path.resolve(__dirname, 'node_modules/@mui/icons-material'),
      }
    },
    optimizeDeps: {
      include: [
        '@mui/material', 
        '@mui/icons-material', 
        '@emotion/react', 
        '@emotion/styled',
      ],
      esbuildOptions: {
        jsx: 'automatic',
        define: {
          global: 'globalThis'
        },
      }
    },
    server: {
      port: parseInt(process.env.VITE_CLIENT_PORT),
      fs: {
        allow: [
          '../../',
          '/app'
        ]
      }
    },
    build: {
      outDir: path.resolve(__dirname, '../../dist/client'),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[ext]',
          chunkFileNames: 'chunks/[name].js',
          entryFileNames: 'entry/[name].js',
          manualChunks: {
            'mui': ['@mui/material', '@mui/icons-material']
          }
        },
      },
      sourcemap: false
    }
  })
}
