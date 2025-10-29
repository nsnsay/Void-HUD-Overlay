import './assets/main.scss'
import './assets/vars.scss'

import '@fontsource/outfit/100.css'
import '@fontsource/outfit/200.css'
import '@fontsource/outfit/300.css'
import '@fontsource/outfit/400.css'
import '@fontsource/outfit/500.css'
import '@fontsource/outfit/600.css'
import '@fontsource/outfit/700.css'
import '@fontsource/outfit/800.css'
import '@fontsource/outfit/900.css'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')

const key = new URLSearchParams(location.search).get('development') === ''
if (key) {
  document.body.style.backgroundColor = 'green'
}

const root = document.getElementById('app')!
const scale = Math.min(innerWidth / 1920, innerHeight / 1080)
root.style.transform = `scale(${scale})`

addEventListener('resize', () => {
  const s = Math.min(innerWidth / 1920, innerHeight / 1080)
  root.style.transform = `scale(${s})`
})
