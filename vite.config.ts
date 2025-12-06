import { defineConfig } from 'vite'

export default defineConfig({
  // CORRECT: Just the repository name with slashes
  base: '/kefirlang/', 
  
  // INCORRECT (Do NOT use these):
  // base: 'https://github.com/devgithub-sl/kefirlang.git',
  // base: './', 
})