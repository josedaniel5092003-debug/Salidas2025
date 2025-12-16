import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    host: true,       // <-- ESTO PERMITE QUE LA RED LOCAL ENTRE
    port: 5173,       // (opcional)
  }
});
//npm run dev -- --host