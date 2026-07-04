import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  // relative base: funktioniert auf GitHub Pages unabhängig vom Repo-Namen
  base: './',
  plugins: [svelte()],
});
